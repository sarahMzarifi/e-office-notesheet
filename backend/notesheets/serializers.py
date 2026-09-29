from django.db import transaction

from rest_framework import serializers

from .models import Notesheet
from .services import generate_reference_number

from workflow.models import AuditEvent

from workflow.serializers import (
    AuditEventSerializer,
    DispositionSerializer,
    NotesheetCommentSerializer,
    WorkflowAssignmentSerializer,
)

from workflow.services import record_audit_event


class NotesheetCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notesheet
        fields = [
            "id",
            "reference_number",
            "title",
            "category",
            "priority",
            "body",
            "creator",
            "department",
            "status",
            "created_at",
            "updated_at",
            "dispatched_at",
        ]
        read_only_fields = [
            "id",
            "reference_number",
            "creator",
            "department",
            "status",
            "created_at",
            "updated_at",
            "dispatched_at",
        ]

    def validate_title(self, title):
        if not title.strip():
            raise serializers.ValidationError(
                "Title cannot be empty."
            )

        return title

    def validate_body(self, body):
        if not body.strip():
            raise serializers.ValidationError(
                "Body cannot be empty."
            )

        return body

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user

        if user.department is None:
            raise serializers.ValidationError(
                {
                    "department": (
                        "User must belong to a department."
                    )
                }
            )

        reference_number = generate_reference_number(
            user.department
        )

        notesheet = Notesheet.objects.create(
            reference_number=reference_number,
            creator=user,
            department=user.department,
            status=Notesheet.Status.DRAFT,
            **validated_data,
        )

        record_audit_event(
            notesheet=notesheet,
            action_type=AuditEvent.ActionType.NOTESHEET_CREATED,
            actor=user,
            from_status=None,
            to_status=Notesheet.Status.DRAFT,
            details={
                "reference_number": notesheet.reference_number,
            },
        )

        return notesheet


class NotesheetSerializer(serializers.ModelSerializer):
    department = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    workflow_assignments = WorkflowAssignmentSerializer(
        many=True,
        read_only=True,
    )

    comments = NotesheetCommentSerializer(
        many=True,
        read_only=True,
    )

    disposition = DispositionSerializer(
        read_only=True,
    )

    audit_events = AuditEventSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Notesheet
        fields = [
            "id",
            "reference_number",
            "title",
            "category",
            "priority",
            "body",
            "creator",
            "department",
            "status",
            "created_at",
            "updated_at",
            "dispatched_at",
            "workflow_assignments",
            "comments",
            "disposition",
            "audit_events",
        ]
        read_only_fields = fields


class NotesheetUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notesheet
        fields = [
            "id",
            "reference_number",
            "title",
            "category",
            "priority",
            "body",
            "creator",
            "department",
            "status",
            "created_at",
            "updated_at",
            "dispatched_at",
        ]
        read_only_fields = [
            "id",
            "reference_number",
            "creator",
            "department",
            "status",
            "created_at",
            "updated_at",
            "dispatched_at",
        ]

    def validate_title(self, title):
        if not title.strip():
            raise serializers.ValidationError(
                "Title cannot be empty."
            )

        return title

    def validate_body(self, body):
        if not body.strip():
            raise serializers.ValidationError(
                "Body cannot be empty."
            )

        return body


class NotesheetDispatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notesheet
        fields = [
            "id",
            "reference_number",
            "title",
            "category",
            "priority",
            "body",
            "creator",
            "department",
            "status",
            "created_at",
            "updated_at",
            "dispatched_at",
        ]
        read_only_fields = fields