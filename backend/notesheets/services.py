from django.db import transaction
from django.utils import timezone

from .models import NotesheetReferenceSequence


@transaction.atomic
def generate_reference_number(department):
    year = timezone.now().year

    sequence, created = (
        NotesheetReferenceSequence.objects
        .select_for_update()
        .get_or_create(
            department=department,
            year=year,
            defaults={
                "last_serial": 0,
            },
        )
    )

    sequence.last_serial += 1
    sequence.save(
        update_fields=["last_serial"]
    )

    return (
        f"{department.code}/{year}/"
        f"{sequence.last_serial:04d}"
    )