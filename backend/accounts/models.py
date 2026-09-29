from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        INITIATOR = "INITIATOR", "Initiator"
        ADMIN = "ADMIN", "Administrator"

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.INITIATOR,
    )

    designation = models.CharField(
        max_length=100,
        blank=True,
    )

    hierarchy_level = models.PositiveIntegerField(
        default=1,
    )

    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="users",
    )
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["department"],
                condition=models.Q(
                    designation="Head of Department",
                    is_active=True,
                ),
                name="unique_active_hod_per_department",
            ),
        ]

    def __str__(self):
        return self.get_full_name() or self.username

class ApprovalAuthority(models.Model):
    class AuthorityType(models.TextChoices):
        APPROVAL = "APPROVAL", "Approval"

    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="approval_authorities",
    )

    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        related_name="approval_authorities"
    )

    authority_type = models.CharField(
        max_length=20,
        choices=AuthorityType.choices,
    )

    is_active = models.BooleanField(
        default=True,
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True,
    )

    deactivated_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(is_active=True),
                name="unique_active_approval_authority_per_user",
            ),
        ]

    def __str__(self):
        return f"{self.user} - {self.authority_type}"