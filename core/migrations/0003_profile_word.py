# Generated by Django 2.2 on 2019-04-20 21:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_profile'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='word',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
