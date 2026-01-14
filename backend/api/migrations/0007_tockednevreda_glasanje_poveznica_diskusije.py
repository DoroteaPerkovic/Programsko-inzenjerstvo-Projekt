from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_tockednevreda_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='tockednevreda',
            name='poveznica_diskusije',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
