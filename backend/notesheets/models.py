from django.conf import settings
from django.db import models


class Notesheet(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        WAITING_FOR_RESPONSE = "WAITING_FOR_RESPONSE", "Waiting for Response"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        FINALIZED = "FINALIZED", "Finalized"

    class Category(models.TextChoices):
        GENERAL = "GENERAL", "General"
        FINANCE = "FINANCE", "Finance"
        HR = "HR", "Human Resources"
        PROCUREMENT = "PROCUREMENT", "Procurement"
        ADMINISTRATION = "ADMINISTRATION", "Administration"
        TECHNICAL = "TECHNICAL", "Technical"

    class Priority(models.TextChoices):
        NORMAL = "NORMAL", "Normal"
        URGENT = "URGENT", "Urgent"
        IMMEDIATE = "IMMEDIATE", "Immediate"

    reference_number = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        null=True,
        blank=True,
    )

    title = models.CharField(
        max_length=200,
    )

    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.GENERAL,
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.NORMAL,
    )

    body = models.TextField()

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_notesheets",
    )

    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        related_name="notesheets",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    dispatched_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.title


class NotesheetReferenceSequence(models.Model):

    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        related_name="notesheet_reference_sequences",
    )

    year = models.PositiveIntegerField()

    last_serial = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["department", "year"],
                name="unique_notesheet_reference_sequence",
            ),
        ]

    def __str__(self):
        return (
            f"{self.department.code}/{self.year}"
            f" -> {self.last_serial}"
        )