from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'name', 'email', 'status', 'total_amount', 'created_at']
    search_fields = ['name', 'email', 'phone', 'user__email']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]
