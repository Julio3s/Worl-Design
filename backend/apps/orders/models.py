from django.db import models
from django.contrib.auth import get_user_model
from cloudinary.models import CloudinaryField
from apps.products.models import Product

User = get_user_model()


class Order(models.Model):
    """Order model with support for guest checkout."""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    # User reference (nullable for guest checkout)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    # Customer checkout fields (required for guest checkout, populated for authenticated users too)
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    delivery_address = models.TextField(blank=True, null=True)
    
    # Order metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_token = models.CharField(max_length=64, unique=True, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        customer = self.name or self.email or 'Customer'
        return f"Order #{self.id} - {customer}"

    @property
    def guest_name(self):
        return self.name

    @guest_name.setter
    def guest_name(self, value):
        self.name = value

    @property
    def guest_email(self):
        return self.email

    @guest_email.setter
    def guest_email(self, value):
        self.email = value

    @property
    def guest_phone(self):
        return self.phone

    @guest_phone.setter
    def guest_phone(self, value):
        self.phone = value

    @property
    def guest_address(self):
        return self.delivery_address

    @guest_address.setter
    def guest_address(self, value):
        self.delivery_address = value


class OrderItem(models.Model):
    """Individual product in an order."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    custom_text = models.TextField(blank=True, null=True, help_text="Customization text")
    custom_file = CloudinaryField('file', blank=True, null=True, help_text="Customization file (logo)")

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        product_name = self.product.name if self.product else 'Deleted product'
        return f"{product_name} x{self.quantity}"
