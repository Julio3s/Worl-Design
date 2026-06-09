from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'status',
            'cinetpay_transaction_id',
            'cinetpay_payment_token',
            'amount',
            'currency',
            'created_at',
            'updated_at',
        ]
