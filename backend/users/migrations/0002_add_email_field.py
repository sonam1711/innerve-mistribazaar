# Generated migration for adding email field to User model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),  # Adjust this based on your last migration
    ]

    operations = [
        # Add email field
        migrations.AddField(
            model_name='user',
            name='email',
            field=models.EmailField(
                unique=True,
                help_text='Email address for authentication',
                default='placeholder@example.com'  # Temporary default
            ),
            preserve_default=False,
        ),
        # Make phone nullable
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=models.CharField(
                max_length=15,
                unique=True,
                null=True,
                blank=True,
                help_text='Optional phone number'
            ),
        ),
        # Add email index
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['email'], name='users_email_idx'),
        ),
    ]
