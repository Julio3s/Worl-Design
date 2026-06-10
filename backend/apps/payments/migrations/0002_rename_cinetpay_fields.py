from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payment',
            old_name='cinetpay_transaction_id',
            new_name='fedapay_transaction_id',
        ),
        migrations.RenameField(
            model_name='payment',
            old_name='cinetpay_payment_token',
            new_name='fedapay_payment_token',
        ),
    ]
