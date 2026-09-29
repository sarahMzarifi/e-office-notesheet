from django.db import migrations


def backfill_authority_department(apps, schema_editor):
    ApprovalAuthority = apps.get_model("accounts", "ApprovalAuthority")

    for authority in ApprovalAuthority.objects.select_related("user").all():
        authority.department_id = authority.user.department_id
        authority.save(update_fields=["department"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_approvalauthority_department"),
    ]

    operations = [
        migrations.RunPython(
            backfill_authority_department,
            migrations.RunPython.noop,
        ),
    ]