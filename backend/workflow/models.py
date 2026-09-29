from django.conf import settings
from django.db import models


class WorkflowReviewer(models.Model):

    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        related_name="workflow_reviewers",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="workflow_reviewer_assignments",
    )

    is_active = models.BooleanField(
        default=True,
    )

    added_at = models.DateTimeField(
        auto_now_add=True,
    )

    removed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["department", "user"],
                condition=models.Q(is_active=True),
                name="unique_active_workflow_reviewer",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user.username} → "
            f"{self.department.code}"
        )


class WorkflowAssignment(models.Model):

    class Stage(models.TextChoices):
        REVIEW = "REVIEW", "Review"
        APPROVAL = "APPROVAL", "Approval"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"

    notesheet = models.ForeignKey(
        "notesheets.Notesheet",
        on_delete=models.PROTECT,
        related_name="workflow_assignments",
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="workflow_assignments_received",
    )

    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["notesheet"],
                condition=models.Q(status="ACTIVE"),
                name="unique_active_assignment_per_notesheet",
            ),
        ]

    def __str__(self):
        return (
            f"Notesheet {self.notesheet_id} → "
            f"{self.assigned_to.username} ({self.stage})"
        )


class NotesheetComment(models.Model):

    class ActionType(models.TextChoices):
        COMMENT = "COMMENT", "Comment"
        RESPONSE = "RESPONSE", "Response"
        CLARIFICATION_REQUEST = (
            "CLARIFICATION_REQUEST",
            "Clarification Request",
        )

    notesheet = models.ForeignKey(
        "notesheets.Notesheet",
        on_delete=models.PROTECT,
        related_name="comments",
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="notesheet_comments",
    )

    # Snapshot of the author's identity at the time
    # the official comment was created.
    author_full_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    author_designation = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    parent_comment = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="replies",
    )

    content = models.TextField()

    sequence_number = models.PositiveIntegerField()

    action_type = models.CharField(
        max_length=30,
        choices=ActionType.choices,
        default=ActionType.COMMENT,
    )

    response_required = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["sequence_number"]

        constraints = [
            models.UniqueConstraint(
                fields=["notesheet", "sequence_number"],
                name="unique_comment_sequence_per_notesheet",
            ),
        ]

    def __str__(self):
        return (
            f"Notesheet {self.notesheet_id} - "
            f"Comment {self.sequence_number}"
        )


class Disposition(models.Model):

    class Decision(models.TextChoices):
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    notesheet = models.OneToOneField(
        "notesheets.Notesheet",
        on_delete=models.PROTECT,
        related_name="disposition",
    )

    assignment = models.OneToOneField(
        WorkflowAssignment,
        on_delete=models.PROTECT,
        related_name="disposition",
    )

    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="dispositions",
    )
    approver_full_name = models.CharField(
        max_length=255,
        blank=True,
    )
    approver_designation = models.CharField(
        max_length=100,
        blank=True,
    )
    approver_department_name = models.CharField(
        max_length=100,
        blank=True,
    )
    approver_department_code = models.CharField(
        max_length=20,
        blank=True,
    )
    decision = models.CharField(
        max_length=20,
        choices=Decision.choices,
    )

    justification = models.TextField(
        blank=True,
    )

    decided_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"Notesheet {self.notesheet_id} - "
            f"{self.decision}"
        )

class AuditEvent(models.Model):
    class ActionType(models.TextChoices):
        NOTESHEET_CREATED = (
            "NOTESHEET_CREATED",
            "Notesheet Created",
        )
        NOTESHEET_DISPATCHED = (
            "NOTESHEET_DISPATCHED",
            "Notesheet Dispatched",
        )
        REVIEWER_ASSIGNED = (
            "REVIEWER_ASSIGNED",
            "Reviewer Assigned",
        )
        COMMENT_ADDED = (
            "COMMENT_ADDED",
            "Comment Added",
        )
        CLARIFICATION_REQUESTED = (
            "CLARIFICATION_REQUESTED",
            "Clarification Requested",
        )
        RESPONSE_SUBMITTED = (
            "RESPONSE_SUBMITTED",
            "Response Submitted",
        )
        REVIEW_FORWARDED = (
            "REVIEW_FORWARDED",
            "Review Forwarded",
        )
        APPROVAL_GRANTED = (
            "APPROVAL_GRANTED",
            "Approval Granted",
        )
        APPROVAL_REJECTED = (
            "APPROVAL_REJECTED",
            "Approval Rejected",
        )
        NOTESHEET_FINALIZED = (
            "NOTESHEET_FINALIZED",
            "Notesheet Finalized",
        )

    notesheet = models.ForeignKey(
        "notesheets.Notesheet",
        on_delete=models.PROTECT,
        related_name="audit_events",
    )

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="audit_events",
        null=True,
        blank=True,
    )

    actor_username = models.CharField(
        max_length=150,
        null=True,
        blank=True,
    )

    actor_full_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    actor_designation = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    action_type = models.CharField(
        max_length=40,
        choices=ActionType.choices,
    )

    from_status = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )

    to_status = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )

    details = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return (
            f"Notesheet {self.notesheet_id} - "
            f"{self.action_type}"
        )