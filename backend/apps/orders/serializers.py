import os
from decimal import Decimal

from cloudinary import config as cloudinary_config
from django.db import transaction
from rest_framework import serializers

from apps.products.models import Product

from .models import Order, OrderItem


MAX_CUSTOM_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_CUSTOM_FILE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf', '.ai', '.svg'}


def _cloudinary_url(resource):
    if not resource:
        return None

    try:
        if not getattr(cloudinary_config(), 'cloud_name', None):
            return None
        return resource.url
    except Exception:
        return None


def _normalize_text(value):
    if value in ('', None):
        return None
    return value


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    custom_text = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    custom_file = serializers.FileField(required=False, allow_null=True)

    def validate_custom_file(self, value):
        if not value:
            return value

        if value.size > MAX_CUSTOM_FILE_SIZE:
            raise serializers.ValidationError('Custom file must not exceed 10 MB')

        extension = os.path.splitext(value.name or '')[1].lower()
        if extension not in ALLOWED_CUSTOM_FILE_EXTENSIONS:
            raise serializers.ValidationError(
                'Custom file must be one of: jpg, jpeg, png, pdf, ai, svg'
            )

        return value


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_slug = serializers.SerializerMethodField()
    product_image_url = serializers.SerializerMethodField()
    custom_file_url = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_slug',
            'product_image_url',
            'quantity',
            'unit_price',
            'subtotal',
            'custom_text',
            'custom_file',
            'custom_file_url',
        ]

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_product_slug(self, obj):
        return obj.product.slug if obj.product else None

    def get_product_image_url(self, obj):
        if not obj.product:
            return None
        return _cloudinary_url(obj.product.image)

    def get_custom_file_url(self, obj):
        return _cloudinary_url(obj.custom_file)

    def get_subtotal(self, obj):
        return obj.unit_price * obj.quantity


def _order_custom_text_summary(order):
    texts = [
        (item.custom_text or '').strip()
        for item in order.items.all()
        if (item.custom_text or '').strip()
    ]
    if not texts:
        return None

    summary = ' / '.join(texts[:2])
    if len(texts) > 2:
        summary += ' ...'
    return summary


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders (with guest support)."""
    name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    items = OrderItemInputSerializer(many=True)

    def _get_user(self):
        user = self.context.get('user')
        if user and getattr(user, 'is_authenticated', False):
            return user
        return None

    def _resolve_customer_fields(self, attrs):
        user = self._get_user()
        if user:
            attrs['user'] = user
            attrs['name'] = _normalize_text(attrs.get('name')) or (
                user.get_full_name().strip() if user.get_full_name() else None
            ) or user.username
            attrs['email'] = _normalize_text(attrs.get('email')) or user.email
            attrs['phone'] = _normalize_text(attrs.get('phone')) or user.phone
            attrs['delivery_address'] = _normalize_text(attrs.get('delivery_address')) or user.address

            if not all([attrs.get('name'), attrs.get('email'), attrs.get('phone'), attrs.get('delivery_address')]):
                raise serializers.ValidationError(
                    'Authenticated checkout requires name, email, phone, and delivery address'
                )
        else:
            attrs['user'] = None
            required_fields = ['name', 'email', 'phone', 'delivery_address']
            missing_fields = [field for field in required_fields if not _normalize_text(attrs.get(field))]
            if missing_fields:
                raise serializers.ValidationError(
                    {field: 'This field is required.' for field in missing_fields}
                )
        return attrs

    def validate(self, data):
        data = self._resolve_customer_fields(data)

        if not data.get('items'):
            raise serializers.ValidationError({'items': 'Items list cannot be empty'})

        product_ids = [item['product_id'] for item in data['items']]
        products = Product.objects.filter(id__in=product_ids, is_active=True).in_bulk(field_name='id')
        missing_ids = [product_id for product_id in product_ids if product_id not in products]
        if missing_ids:
            raise serializers.ValidationError(
                {'items': f'Unknown or inactive product id(s): {", ".join(str(i) for i in missing_ids)}'}
            )

        for item in data['items']:
            product = products[item['product_id']]
            custom_text = (item.get('custom_text') or '').strip()

            if product.is_customizable and not custom_text:
                raise serializers.ValidationError(
                    {'items': f'Customization text is required for {product.name}'}
                )

            if (custom_text or item.get('custom_file')) and not product.is_customizable:
                raise serializers.ValidationError(
                    {'items': f'{product.name} is not customizable'}
                )

            if product.stock < item['quantity']:
                raise serializers.ValidationError(
                    {'items': f'Insufficient stock for {product.name}'}
                )

        self._validated_products = products
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = validated_data.pop('user', None)

        total = Decimal('0.00')
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                name=validated_data.get('name'),
                email=validated_data.get('email'),
                phone=validated_data.get('phone'),
                delivery_address=validated_data.get('delivery_address'),
                note=_normalize_text(validated_data.get('note')),
                status='PENDING',
                total_amount=Decimal('0.00'),
            )

            for item_data in items_data:
                try:
                    product = Product.objects.select_for_update().get(
                        id=item_data['product_id'],
                        is_active=True,
                    )
                except Product.DoesNotExist as exc:
                    raise serializers.ValidationError(
                        {'items': f'Unknown or inactive product id {item_data["product_id"]}'}
                    ) from exc
                quantity = item_data['quantity']

                if product.stock < quantity:
                    raise serializers.ValidationError(
                        {'items': f'Insufficient stock for {product.name}'}
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=product.price,
                    custom_text=_normalize_text(item_data.get('custom_text')),
                    custom_file=item_data.get('custom_file'),
                )
                total += product.price * quantity

            order.total_amount = total
            order.save(update_fields=['total_amount'])

        return order


def _order_customer_name(order):
    if order.name:
        return order.name
    if order.user:
        full_name = order.user.get_full_name().strip() if order.user.get_full_name() else ''
        return full_name or order.user.email
    return 'Invité'


class OrderAdminListSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    is_guest = serializers.SerializerMethodField()
    custom_text_summary = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'customer_name',
            'is_guest',
            'email',
            'phone',
            'delivery_address',
            'custom_text_summary',
            'status',
            'total_amount',
            'created_at',
        ]

    def get_customer_name(self, obj):
        return _order_customer_name(obj)

    def get_is_guest(self, obj):
        return obj.user_id is None

    def get_custom_text_summary(self, obj):
        return _order_custom_text_summary(obj)


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value):
        valid_statuses = {choice[0] for choice in Order.STATUS_CHOICES}
        if value not in valid_statuses:
            raise serializers.ValidationError('Invalid order status')
        return value


class OrderAdminDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    is_guest = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'customer_name',
            'is_guest',
            'name',
            'email',
            'phone',
            'delivery_address',
            'status',
            'total_amount',
            'note',
            'items',
            'payment',
            'created_at',
            'updated_at',
        ]

    def get_customer_name(self, obj):
        return _order_customer_name(obj)

    def get_is_guest(self, obj):
        return obj.user_id is None

    def get_payment(self, obj):
        payment = getattr(obj, 'payment', None)
        if not payment:
            return None

        return {
            'status': payment.status,
            'fedapay_transaction_id': payment.fedapay_transaction_id,
            'amount': payment.amount,
            'currency': payment.currency,
            'method': 'FedaPay',
            'created_at': payment.created_at,
            'updated_at': payment.updated_at,
        }


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    guest_name = serializers.CharField(source='name', read_only=True)
    guest_email = serializers.CharField(source='email', read_only=True)
    guest_phone = serializers.CharField(source='phone', read_only=True)
    guest_address = serializers.CharField(source='delivery_address', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'name',
            'email',
            'phone',
            'delivery_address',
            'guest_name',
            'guest_email',
            'guest_phone',
            'guest_address',
            'status',
            'total_amount',
            'note',
            'items',
            'created_at',
            'updated_at',
        ]
