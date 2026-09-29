from django.db import migrations


def backfill_reference_numbers(apps, schema_editor):
    Notesheet = apps.get_model("notesheets", "Notesheet")
    NotesheetReferenceSequence = apps.get_model(
        "notesheets",
        "NotesheetReferenceSequence",
    )

    notesheets = (
        Notesheet.objects
        .filter(reference_number__isnull=True)
        .select_related("department")
        .order_by(
            "department_id",
            "created_at",
            "id",
        )
    )

    for notesheet in notesheets:
        department = notesheet.department
        year = notesheet.created_at.year

        sequence, _ = (
            NotesheetReferenceSequence.objects
            .get_or_create(
                department_id=department.id,
                year=year,
                defaults={
                    "last_serial": 0,
                },
            )
        )

        sequence.last_serial += 1

        notesheet.reference_number = (
            f"{department.code}/{year}/"
            f"{sequence.last_serial:04d}"
        )

        notesheet.save(
            update_fields=["reference_number"]
        )

        sequence.save(
            update_fields=["last_serial"]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("notesheets", "0005_notesheetreferencesequence"),
    ]

    operations = [
        migrations.RunPython(
            backfill_reference_numbers,
            migrations.RunPython.noop,
        ),
    ]