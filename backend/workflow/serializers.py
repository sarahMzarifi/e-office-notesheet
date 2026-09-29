from rest_framework import serializers

from .models import (
    AuditEvent,
    Disposition,
    NotesheetComment,
    WorkflowAssignment,
    WorkflowReviewer,
)


class WorkflowReviewerSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkflowReviewer
        fields = [
            "id",
            "department",
            "user",
            "is_active",
            "added_at",
            "removed_at",
        ]
        read_only_fields = [
            "id",
            "is_active",
            "added_at",
            "removed_at",
        ]

    def validate_department(self, department):
        if not department.is_active:
            raise serializers.ValidationError(
                "Reviewer cannot be assigned to an inactive department."
            )

        return department

    def validate_user(self, user):
        if not user.is_active:
            raise serializers.ValidationError(
                "An inactive user cannot be assigned as a reviewer."
            )

        if user.hierarchy_level != 2:
            raise serializers.ValidationError(
                "Only hierarchy level 2 employees can be assigned as reviewers."
            )

        return user

    def validate(self, attrs):
        department = attrs.get("department")
        user = attrs.get("user")

        if department != user.department:
            raise serializers.ValidationError(
                {
                    "department": (
                        "The selected department must match "
                        "the user's department."
                    )
                }
            )

        if WorkflowReviewer.objects.filter(
            department=department,
            user=user,
            is_active=True,
        ).exists():
            raise serializers.ValidationError(
                {
                    "user": (
                        "This user is already an active reviewer "
                        "for this department."
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        return WorkflowReviewer.objects.create(
            department=validated_data["department"],
            user=validated_data["user"],
            is_active=True,
        )


class WorkflowAssignmentSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True,
    )

    assigned_to_full_name = serializers.SerializerMethodField()

    assigned_to_designation = serializers.CharField(
        source="assigned_to.designation",
        read_only=True,
    )

    class Meta:
        model = WorkflowAssignment
        fields = [
            "id",
            "notesheet",
            "assigned_to",
            "assigned_to_username",
            "assigned_to_full_name",
            "assigned_to_designation",
            "stage",
            "status",
            "assigned_at",
            "completed_at",
        ]
        read_only_fields = fields

    def get_assigned_to_full_name(self, obj):
        full_name = obj.assigned_to.get_full_name().strip()

        if full_name:
            return full_name

        return obj.assigned_to.username


class WorkflowAssignmentForwardSerializer(serializers.Serializer):
    """
    Serializer for forwarding an active REVIEW assignment.

    No next-user field is accepted because the backend
    determines the next authorized workflow participant.
    """

    detail = serializers.CharField(read_only=True)


class DispositionSerializer(serializers.ModelSerializer):
    approver_full_name = serializers.CharField(
        read_only=True,
    )

    approver_designation = serializers.CharField(
        read_only=True,
    )

    approver_department_name = serializers.CharField(
        read_only=True,
    )

    approver_department_code = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = Disposition
        fields = [
            "id",
            "notesheet",
            "assignment",
            "decided_by",
            "decision",
            "justification",
            "approver_full_name",
            "approver_designation",
            "approver_department_name",
            "approver_department_code",
            "decided_at",
        ]
        read_only_fields = [
            "id",
            "notesheet",
            "assignment",
            "decided_by",
            "approver_full_name",
            "approver_designation",
            "approver_department_name",
            "approver_department_code",
            "decided_at",
        ]

    def validate(self, attrs):
        decision = attrs.get("decision")
        justification = attrs.get(
            "justification",
            "",
        ).strip()

        if (
            decision == Disposition.Decision.REJECTED
            and not justification
        ):
            raise serializers.ValidationError(
                {
                    "justification": (
                        "Rejection justification is required."
                    )
                }
            )

        attrs["justification"] = justification

        return attrs


class NotesheetCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(
        source="author.username",
        read_only=True,
    )

    class Meta:
        model = NotesheetComment
        fields = [
            "id",
            "notesheet",
            "author",
            "author_username",
            "author_full_name",
            "author_designation",
            "parent_comment",
            "content",
            "sequence_number",
            "action_type",
            "response_required",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "notesheet",
            "author",
            "author_username",
            "author_full_name",
            "author_designation",
            "sequence_number",
            "created_at",
        ]

    content = serializers.CharField(allow_blank=True)

    def validate_content(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Comment content cannot be empty."
            )

        return value

    def validate_parent_comment(self, parent_comment):
        notesheet = self.context.get("notesheet")

        if (
            notesheet is not None
            and parent_comment.notesheet_id != notesheet.id
        ):
            raise serializers.ValidationError(
                "Parent comment must belong to the same notesheet."
            )

        return parent_comment


class AuditEventSerializer(serializers.ModelSerializer):

    class Meta:
        model = AuditEvent
        fields = [
            "id",
            "notesheet",
            "actor",
            "actor_username",
            "actor_full_name",
            "actor_designation",
            "action_type",
            "from_status",
            "to_status",
            "details",
            "created_at",
        ]
        read_only_fields = fields