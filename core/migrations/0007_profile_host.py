# Generated by Django 2.2 on 2019-04-24 19:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_auto_20190423_1348'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='host',
            field=models.BooleanField(null=True),
        ),
    ]