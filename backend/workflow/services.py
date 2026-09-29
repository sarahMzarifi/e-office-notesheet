from notesheets.models import Notesheet
from accounts.models import ApprovalAuthority

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from .models import (
    AuditEvent,
    Disposition,
    NotesheetComment,
    WorkflowAssignment,
    WorkflowReviewer,
)


def record_audit_event(
    notesheet,
    action_type,
    actor=None,
    from_status=None,
    to_status=None,
    details=None,
):
    actor_username = None
    actor_full_name = None
    actor_designation = None

    if actor is not None:
        actor_username = actor.username

        actor_full_name = actor.get_full_name().strip()

        if not actor_full_name:
            actor_full_name = actor.username

        actor_designation = (
            actor.designation or ""
        ).strip()

    return AuditEvent.objects.create(
        notesheet=notesheet,
        actor=actor,
        actor_username=actor_username,
        actor_full_name=actor_full_name,
        actor_designation=actor_designation,
        action_type=action_type,
        from_status=from_status,
        to_status=to_status,
        details=details or {},
    )


def select_reviewer(notesheet):
    reviewers = (
        WorkflowReviewer.objects
        .filter(
            department=notesheet.department,
            is_active=True,
            user__is_active=True,
        )
        .annotate(
            active_review_count=Count(
                "user__workflow_assignments_received",
                filter=Q(
                    user__workflow_assignments_received__status="ACTIVE",
                    user__workflow_assignments_received__stage="REVIEW",
                ),
            )
        )
        .order_by(
            "active_review_count",
            "user_id",
        )
    )

    reviewer = reviewers.first()

    if reviewer is None:
        raise ValueError(
            "No active reviewer is available for this department."
        )

    return reviewer.user


@transaction.atomic
def dispatch_notesheet(notesheet):
    reviewer = select_reviewer(notesheet)

    previous_status = notesheet.status

    assignment = WorkflowAssignment.objects.create(
        notesheet=notesheet,
        assigned_to=reviewer,
        stage=WorkflowAssignment.Stage.REVIEW,
        status=WorkflowAssignment.Status.ACTIVE,
    )

    notesheet.status = notesheet.Status.UNDER_REVIEW
    notesheet.dispatched_at = timezone.now()

    notesheet.save(
        update_fields=[
            "status",
            "dispatched_at",
            "updated_at",
        ],
    )

    record_audit_event(
        notesheet=notesheet,
        action_type=AuditEvent.ActionType.NOTESHEET_DISPATCHED,
        actor=notesheet.creator,
        from_status=previous_status,
        to_status=notesheet.Status.UNDER_REVIEW,
        details={
            "reference_number": notesheet.reference_number,
        },
    )

    record_audit_event(
        notesheet=notesheet,
        action_type=AuditEvent.ActionType.REVIEWER_ASSIGNED,
        actor=notesheet.creator,
        details={
            "assignment_id": assignment.id,
            "assigned_user_id": reviewer.id,
            "assigned_username": reviewer.username,
            "stage": WorkflowAssignment.Stage.REVIEW,
        },
    )

    return assignment


@transaction.atomic
def forward_review_assignment(assignment, user):
    # ---------------------------------------------------------
    # 1. Verify assigned reviewer
    # ---------------------------------------------------------

    if assignment.assigned_to_id != user.id:
        raise ValueError(
            "You are not the assigned reviewer for this assignment."
        )

    # ---------------------------------------------------------
    # 2. Verify assignment is still active
    # ---------------------------------------------------------

    if assignment.status != WorkflowAssignment.Status.ACTIVE:
        raise ValueError(
            "This workflow assignment is no longer active."
        )

    # ---------------------------------------------------------
    # 3. Verify this is a review-stage assignment
    # ---------------------------------------------------------

    if assignment.stage != WorkflowAssignment.Stage.REVIEW:
        raise ValueError(
            "Only review-stage assignments can be forwarded."
        )

    # ---------------------------------------------------------
    # 4. Verify notesheet is currently under review
    # ---------------------------------------------------------

    if assignment.notesheet.status != (
        assignment.notesheet.Status.UNDER_REVIEW
    ):
        raise ValueError(
            "A review assignment can only be forwarded "
            "while the notesheet is under review."
        )

    # ---------------------------------------------------------
    # 5. Require an official reviewer remark
    #
    # Only comments created by this reviewer during the
    # current assignment count.
    # ---------------------------------------------------------

    reviewer_remark_exists = (
        NotesheetComment.objects
        .filter(
            notesheet=assignment.notesheet,
            author=user,
            created_at__gte=assignment.assigned_at,
            action_type__in=(
                NotesheetComment.ActionType.COMMENT,
                NotesheetComment.ActionType.CLARIFICATION_REQUEST,
            ),
        )
        .exists()
    )

    if not reviewer_remark_exists:
        raise ValueError(
            "You must add an official remark before "
            "forwarding this notesheet."
        )

    # ---------------------------------------------------------
    # 6. Find active approval authority
    # ---------------------------------------------------------

    approval_authority = (
        ApprovalAuthority.objects
        .filter(
            user__is_active=True,
            department=assignment.notesheet.department,
            is_active=True,
            authority_type=ApprovalAuthority.AuthorityType.APPROVAL,
        )
        .select_related("user")
        .first()
    )

    if approval_authority is None:
        raise ValueError(
            "No active approval authority is available "
            "for this department."
        )

    # ---------------------------------------------------------
    # 7. Complete current review assignment
    # ---------------------------------------------------------

    assignment.status = WorkflowAssignment.Status.COMPLETED
    assignment.completed_at = timezone.now()

    assignment.save(
        update_fields=[
            "status",
            "completed_at",
        ]
    )

    # ---------------------------------------------------------
    # 8. Create approval assignment
    # ---------------------------------------------------------

    next_assignment = WorkflowAssignment.objects.create(
        notesheet=assignment.notesheet,
        assigned_to=approval_authority.user,
        stage=WorkflowAssignment.Stage.APPROVAL,
        status=WorkflowAssignment.Status.ACTIVE,
    )

    record_audit_event(
        notesheet=assignment.notesheet,
        action_type=AuditEvent.ActionType.REVIEW_FORWARDED,
        actor=user,
        details={
            "completed_assignment_id": assignment.id,
            "next_assignment_id": next_assignment.id,
            "next_assigned_user_id": approval_authority.user.id,
            "next_assigned_username": approval_authority.user.username,
            "next_stage": WorkflowAssignment.Stage.APPROVAL,
        },
    )

    return next_assignment


@transaction.atomic
def decide_approval(
    assignment,
    user,
    decision,
    justification="",
):
    # ---------------------------------------------------------
    # 1. Verify assigned approval user
    # ---------------------------------------------------------

    if assignment.assigned_to_id != user.id:
        raise ValueError(
            "You are not the assigned user for this workflow assignment."
        )

    # ---------------------------------------------------------
    # 2. Verify assignment is still active
    # ---------------------------------------------------------

    if assignment.status != WorkflowAssignment.Status.ACTIVE:
        raise ValueError(
            "This workflow assignment is no longer active."
        )

    # ---------------------------------------------------------
    # 3. Verify this is an approval-stage assignment
    # ---------------------------------------------------------

    if assignment.stage != WorkflowAssignment.Stage.APPROVAL:
        raise ValueError(
            "Only approval-stage assignments can receive a decision."
        )

    # ---------------------------------------------------------
    # 4. Verify user account is active
    # ---------------------------------------------------------

    if not user.is_active:
        raise ValueError(
            "Your user account is inactive."
        )

    # ---------------------------------------------------------
    # 5. Verify active approval authority
    # ---------------------------------------------------------

    approval_authority = (
        ApprovalAuthority.objects
        .filter(
            user=user,
            department=assignment.notesheet.department,
            authority_type=ApprovalAuthority.AuthorityType.APPROVAL,
            is_active=True,
        )
        .first()
    )

    if approval_authority is None:
        raise ValueError(
            "You do not have active approval authority "
            "for this department."
        )

    # ---------------------------------------------------------
    # 6. Prevent duplicate disposition
    # ---------------------------------------------------------

    if Disposition.objects.filter(
        notesheet=assignment.notesheet
    ).exists():
        raise ValueError(
            "A disposition already exists for this notesheet."
        )

    # ---------------------------------------------------------
    # 7. Normalize and validate justification
    # ---------------------------------------------------------

    justification = (justification or "").strip()

    if (
        decision == Disposition.Decision.REJECTED
        and not justification
    ):
        raise ValueError(
            "Rejection justification is required."
        )

    # ---------------------------------------------------------
    # 8. Validate decision
    # ---------------------------------------------------------

    if decision not in (
        Disposition.Decision.APPROVED,
        Disposition.Decision.REJECTED,
    ):
        raise ValueError(
            "Invalid approval decision."
        )

    # ---------------------------------------------------------
    # 9. Capture approver identity snapshot
    # ---------------------------------------------------------

    approver_full_name = user.get_full_name().strip()

    if not approver_full_name:
        approver_full_name = user.username

    approver_designation = (
        user.designation or ""
    ).strip()

    approver_department_name = (
        assignment.notesheet.department.name
    )

    approver_department_code = (
        assignment.notesheet.department.code
    )

    # ---------------------------------------------------------
    # 10. Create disposition
    # ---------------------------------------------------------

    disposition = Disposition.objects.create(
        notesheet=assignment.notesheet,
        assignment=assignment,
        decided_by=user,
        approver_full_name=approver_full_name,
        approver_designation=approver_designation,
        approver_department_name=approver_department_name,
        approver_department_code=approver_department_code,
        decision=decision,
        justification=justification,
    )

    # ---------------------------------------------------------
    # 11. Complete approval assignment
    # ---------------------------------------------------------

    assignment.status = WorkflowAssignment.Status.COMPLETED
    assignment.completed_at = timezone.now()

    assignment.save(
        update_fields=[
            "status",
            "completed_at",
        ]
    )

    # ---------------------------------------------------------
    # 12. Update notesheet decision status
    # ---------------------------------------------------------

    previous_status = assignment.notesheet.status

    decision_status = (
        assignment.notesheet.Status.APPROVED
        if decision == Disposition.Decision.APPROVED
        else assignment.notesheet.Status.REJECTED
    )

    assignment.notesheet.status = decision_status

    assignment.notesheet.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    # ---------------------------------------------------------
    # 13. Record final approval/rejection audit event
    # ---------------------------------------------------------

    if decision == Disposition.Decision.APPROVED:
        record_audit_event(
            notesheet=assignment.notesheet,
            action_type=AuditEvent.ActionType.APPROVAL_GRANTED,
            actor=user,
            from_status=previous_status,
            to_status=assignment.notesheet.Status.APPROVED,
            details={
                "assignment_id": assignment.id,
                "disposition_id": disposition.id,
                "decision": disposition.decision,
            },
        )
    else:
        record_audit_event(
            notesheet=assignment.notesheet,
            action_type=AuditEvent.ActionType.APPROVAL_REJECTED,
            actor=user,
            from_status=previous_status,
            to_status=assignment.notesheet.Status.REJECTED,
            details={
                "assignment_id": assignment.id,
                "disposition_id": disposition.id,
                "decision": disposition.decision,
                "justification_provided": bool(justification),
            },
        )

    # ---------------------------------------------------------
    # 14. Automatically finalize the decision
    # ---------------------------------------------------------

    finalization_previous_status = assignment.notesheet.status

    assignment.notesheet.status = assignment.notesheet.Status.FINALIZED

    assignment.notesheet.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    record_audit_event(
        notesheet=assignment.notesheet,
        action_type=AuditEvent.ActionType.NOTESHEET_FINALIZED,
        actor=user,
        from_status=finalization_previous_status,
        to_status=assignment.notesheet.Status.FINALIZED,
        details={
            "disposition_id": disposition.id,
            "decision": disposition.decision,
        },
    )

    return disposition


@transaction.atomic
def create_notesheet_comment(
    notesheet,
    user,
    content,
    action_type,
    parent_comment=None,
):
    # ---------------------------------------------------------
    # 1. Authentication and account validation
    # ---------------------------------------------------------

    if not user.is_authenticated:
        raise ValueError(
            "Authentication is required to add a comment."
        )

    if not user.is_active:
        raise ValueError(
            "Your user account is inactive."
        )

    # ---------------------------------------------------------
    # 2. Validate action type
    # ---------------------------------------------------------

    if action_type not in (
        NotesheetComment.ActionType.COMMENT,
        NotesheetComment.ActionType.RESPONSE,
        NotesheetComment.ActionType.CLARIFICATION_REQUEST,
    ):
        raise ValueError(
            "Invalid comment action type."
        )

    # ---------------------------------------------------------
    # 3. Validate content
    # ---------------------------------------------------------

    content = (content or "").strip()

    if not content:
        raise ValueError(
            "Comment content cannot be empty."
        )

    # ---------------------------------------------------------
    # 4. Validate workflow state
    #
    # COMMENT / CLARIFICATION_REQUEST
    #     -> UNDER_REVIEW
    #
    # RESPONSE
    #     -> WAITING_FOR_RESPONSE
    # ---------------------------------------------------------

    if action_type == NotesheetComment.ActionType.RESPONSE:
        if notesheet.status != notesheet.Status.WAITING_FOR_RESPONSE:
            raise ValueError(
                "A response can only be added while the notesheet "
                "is waiting for a response."
            )
    else:
        if notesheet.status != notesheet.Status.UNDER_REVIEW:
            raise ValueError(
                "Comments can only be added while the notesheet "
                "is under review."
            )

    # ---------------------------------------------------------
    # 5. Validate parent comment relationship
    # ---------------------------------------------------------

    if parent_comment is not None:
        if parent_comment.notesheet_id != notesheet.id:
            raise ValueError(
                "Parent comment must belong to the same notesheet."
            )

    # ---------------------------------------------------------
    # 6. Find the active workflow assignment
    # ---------------------------------------------------------

    active_assignment = (
        WorkflowAssignment.objects
        .filter(
            notesheet=notesheet,
            status=WorkflowAssignment.Status.ACTIVE,
        )
        .first()
    )

    if active_assignment is None:
        raise ValueError(
            "No active workflow assignment exists for this notesheet."
        )

    # ---------------------------------------------------------
    # 7. Authorization for COMMENT / CLARIFICATION_REQUEST
    # ---------------------------------------------------------

    if action_type in (
        NotesheetComment.ActionType.COMMENT,
        NotesheetComment.ActionType.CLARIFICATION_REQUEST,
    ):
        if active_assignment.assigned_to_id != user.id:
            raise ValueError(
                "Only the currently assigned workflow user "
                "can add this type of comment."
            )

    # ---------------------------------------------------------
    # 8. Authorization and validation for RESPONSE
    # ---------------------------------------------------------

    if action_type == NotesheetComment.ActionType.RESPONSE:
        if notesheet.creator_id != user.id:
            raise ValueError(
                "Only the notesheet creator can add a response."
            )

        if parent_comment is None:
            raise ValueError(
                "A response must reference a parent comment."
            )

        if not parent_comment.response_required:
            raise ValueError(
                "A response can only be added to a comment "
                "that requires a response."
            )

    # ---------------------------------------------------------
    # 9. Generate sequential comment number
    # ---------------------------------------------------------

    last_comment = (
        NotesheetComment.objects
        .filter(notesheet=notesheet)
        .order_by("-sequence_number")
        .first()
    )

    next_sequence = (
        last_comment.sequence_number + 1
        if last_comment
        else 1
    )

    # ---------------------------------------------------------
    # 10. Capture author identity snapshot
    # ---------------------------------------------------------

    author_full_name = user.get_full_name().strip()

    if not author_full_name:
        author_full_name = user.username

    author_designation = (
        user.designation or ""
    ).strip()

    # ---------------------------------------------------------
    # 11. Create immutable official comment
    # ---------------------------------------------------------

    comment = NotesheetComment.objects.create(
        notesheet=notesheet,
        author=user,
        author_full_name=author_full_name,
        author_designation=author_designation,
        parent_comment=parent_comment,
        content=content,
        sequence_number=next_sequence,
        action_type=action_type,
        response_required=(
            action_type
            == NotesheetComment.ActionType.CLARIFICATION_REQUEST
        ),
    )

    if action_type == NotesheetComment.ActionType.COMMENT:
        record_audit_event(
            notesheet=notesheet,
            action_type=AuditEvent.ActionType.COMMENT_ADDED,
            actor=user,
            details={
                "comment_id": comment.id,
                "sequence_number": comment.sequence_number,
            },
        )

    if action_type == NotesheetComment.ActionType.CLARIFICATION_REQUEST:
        record_audit_event(
            notesheet=notesheet,
            action_type=AuditEvent.ActionType.CLARIFICATION_REQUESTED,
            actor=user,
            from_status=notesheet.Status.UNDER_REVIEW,
            to_status=notesheet.Status.WAITING_FOR_RESPONSE,
            details={
                "comment_id": comment.id,
                "sequence_number": comment.sequence_number,
            },
        )

    # ---------------------------------------------------------
    # 12. Update workflow state
    # ---------------------------------------------------------

    if action_type == NotesheetComment.ActionType.CLARIFICATION_REQUEST:
        notesheet.status = notesheet.Status.WAITING_FOR_RESPONSE

        notesheet.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

    elif action_type == NotesheetComment.ActionType.RESPONSE:
        # The clarification has now been answered.
        parent_comment.response_required = False

        parent_comment.save(
            update_fields=[
                "response_required",
            ]
        )

        previous_status = notesheet.status
        notesheet.status = notesheet.Status.UNDER_REVIEW

        notesheet.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        record_audit_event(
            notesheet=notesheet,
            action_type=AuditEvent.ActionType.RESPONSE_SUBMITTED,
            actor=user,
            from_status=previous_status,
            to_status=notesheet.Status.UNDER_REVIEW,
            details={
                "comment_id": comment.id,
                "sequence_number": comment.sequence_number,
                "parent_comment_id": parent_comment.id,
            },
        )

    return comment