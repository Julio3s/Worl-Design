from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'status', 'amount', 'created_at']
    search_fields = ['cinetpay_transaction_id']
    list_filter = ['status', 'created_at']
    readonly_fields = ['cinetpay_transaction_id', 'created_at', 'updated_at']
