from django.db import models
from apps.orders.models import Order


class Payment(models.Model):
    """Payment model for FedaPay integration."""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    fedapay_transaction_id = models.CharField(max_length=255, unique=True)
    fedapay_payment_token = models.CharField(max_length=500, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='XOF')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment for Order #{self.order.id}"

    @property
    def cinetpay_transaction_id(self):
        return self.fedapay_transaction_id

    @cinetpay_transaction_id.setter
    def cinetpay_transaction_id(self, value):
        self.fedapay_transaction_id = value

    @property
    def cinetpay_payment_token(self):
        return self.fedapay_payment_token

    @cinetpay_payment_token.setter
    def cinetpay_payment_token(self, value):
        self.fedapay_payment_token = value
