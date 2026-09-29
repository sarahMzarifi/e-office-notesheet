from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import User


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    hierarchy_level = serializers.ChoiceField(
        choices=[
            (1, "Initiator / Junior"),
            (2, "Senior Reviewer"),
        ],
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "designation",
            "department",
            "hierarchy_level",
        ]
        read_only_fields = ["id"]

    def validate_department(self, department):
        if not department.is_active:
            raise serializers.ValidationError(
                "User cannot be assigned to an inactive department."
            )
        return department

    def validate(self, attrs):
        if "role" in self.initial_data:
            raise serializers.ValidationError(
                {
                    "role": "This field cannot be set when creating an employee."
                }
            )

        if attrs.get("department") is None:
            raise serializers.ValidationError(
                {"department": "A user must belong to a department."}
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            role=User.Role.INITIATOR,
            **validated_data,
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "designation",
            "hierarchy_level",
            "department",
            "is_active",
        ]
        read_only_fields = fields