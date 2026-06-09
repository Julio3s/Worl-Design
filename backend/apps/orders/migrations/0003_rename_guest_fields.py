from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='order',
            old_name='guest_name',
            new_name='name',
        ),
        migrations.RenameField(
            model_name='order',
            old_name='guest_email',
            new_name='email',
        ),
        migrations.RenameField(
            model_name='order',
            old_name='guest_phone',
            new_name='phone',
        ),
        migrations.RenameField(
            model_name='order',
            old_name='guest_address',
            new_name='delivery_address',
        ),
    ]
