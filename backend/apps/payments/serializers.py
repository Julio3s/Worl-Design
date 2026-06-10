from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'status',
            'fedapay_transaction_id',
            'fedapay_payment_token',
            'amount',
            'currency',
            'created_at',
            'updated_at',
        ]
