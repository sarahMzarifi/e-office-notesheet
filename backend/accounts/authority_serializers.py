from django.utils import timezone

from rest_framework import serializers

from .models import ApprovalAuthority, User

class ApprovalAuthoritySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalAuthority
        fields = [
            "id",
            "user",
            "department",
            "authority_type",
            "is_active",
            "assigned_at",
            "deactivated_at",
        ]
        read_only_fields = fields
        
class ApprovalAuthorityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalAuthority
        fields = [
            "id",
            "user",
            "department",
            "authority_type",
            "is_active",
            "assigned_at",
            "deactivated_at",
        ]
        read_only_fields = [
            "id",
            "authority_type",
            "is_active",
            "assigned_at",
            "deactivated_at",
        ]

    def validate_department(self, department):
        if not department.is_active:
            raise serializers.ValidationError(
                "Approval authority cannot be granted for an inactive department."
            )
        return department

    def validate(self, attrs):
        user = attrs.get("user")
        department = attrs.get("department")

        if not user.is_active:
            raise serializers.ValidationError(
                {"user": "Approval authority cannot be granted to an inactive user."}
            )

        if user.designation != "Head of Department":
            raise serializers.ValidationError(
                {"user": "Approval authority can only be granted to a Head of Department."}
            )

        if department != user.department:
            raise serializers.ValidationError(
                {
                    "department": (
                        "The selected department must match the user's current department."
                    )
                }
            )

        if ApprovalAuthority.objects.filter(
            user=user,
            is_active=True,
        ).exists():
            raise serializers.ValidationError(
                {"user": "This user already has active approval authority."}
            )

        return attrs

    def create(self, validated_data):
        return ApprovalAuthority.objects.create(
            user=validated_data["user"],
            department=validated_data["department"],
            authority_type=ApprovalAuthority.AuthorityType.APPROVAL,
            is_active=True,
        )

class ApprovalAuthorityRevokeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalAuthority
        fields = [
            "id",
            "user",
            "authority_type",
            "is_active",
            "assigned_at",
            "deactivated_at",
        ]
        read_only_fields = fields

    def validate(self, attrs):
        if not self.instance.is_active:
            raise serializers.ValidationError(
                "This approval authority is already inactive."
            )

        return attrs

    def update(self, instance, validated_data):
        instance.is_active = False
        instance.deactivated_at = timezone.now()
        instance.save(
            update_fields=[
                "is_active",
                "deactivated_at",
            ]
        )

        return instance