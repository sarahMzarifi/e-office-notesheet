from django.db import migrations


def backfill_comment_author_snapshots(apps, schema_editor):
    NotesheetComment = apps.get_model(
        "workflow",
        "NotesheetComment",
    )

    comments = (
        NotesheetComment.objects
        .select_related("author")
        .all()
    )

    for comment in comments:
        user = comment.author

        full_name = (
            f"{user.first_name} {user.last_name}"
        ).strip()

        if not full_name:
            full_name = user.username

        comment.author_full_name = full_name
        comment.author_designation = user.designation or ""

        comment.save(
            update_fields=[
                "author_full_name",
                "author_designation",
            ]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("workflow", "0006_notesheetcomment_author_designation_and_more"),
    ]

    operations = [
        migrations.RunPython(
            backfill_comment_author_snapshots,
            migrations.RunPython.noop,
        ),
    ]