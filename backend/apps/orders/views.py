import json
import re
from collections import defaultdict

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer


TOP_LEVEL_FIELDS = {'name', 'email', 'phone', 'delivery_address', 'note'}
LEGACY_TOP_LEVEL_FIELDS = {
    'guest_name': 'name',
    'guest_email': 'email',
    'guest_phone': 'phone',
    'guest_address': 'delivery_address',
    'address': 'delivery_address',
}
ITEM_FIELDS = {'product_id', 'quantity', 'custom_text', 'custom_file'}
ITEM_KEY_PATTERN = re.compile(r'^items\[(\d+)\]\[(\w+)\]$')


def _normalize_order_payload(data):
    payload = {}
    nested_items = defaultdict(dict)
    explicit_items = None

    for key, value in data.items():
        if key == 'items':
            if isinstance(value, str):
                stripped = value.strip()
                if not stripped:
                    explicit_items = []
                else:
                    explicit_items = json.loads(stripped)
            else:
                explicit_items = value
            continue

        match = ITEM_KEY_PATTERN.match(key)
        if match:
            index = int(match.group(1))
            field_name = match.group(2)
            if field_name in ITEM_FIELDS:
                nested_items[index][field_name] = value
            continue

        normalized_key = LEGACY_TOP_LEVEL_FIELDS.get(key, key)
        if normalized_key in TOP_LEVEL_FIELDS:
            payload[normalized_key] = value

    if explicit_items is not None:
        if isinstance(explicit_items, list) and nested_items:
            merged_items = []
            for index, item in enumerate(explicit_items):
                if isinstance(item, dict):
                    merged_item = dict(item)
                    merged_item.update(nested_items.get(index, {}))
                    merged_items.append(merged_item)
                else:
                    merged_items.append(item)
            payload['items'] = merged_items
        else:
            payload['items'] = explicit_items
    elif nested_items:
        payload['items'] = [nested_items[index] for index in sorted(nested_items.keys())]

    return payload


def _can_access_order(user, order):
    if not user or not user.is_authenticated:
        return False

    if getattr(user, 'is_admin_user', False):
        return True

    return order.user_id == user.id


@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """Create a new order (with guest support)."""
    try:
        payload = _normalize_order_payload(request.data)
    except json.JSONDecodeError:
        return Response(
            {'detail': 'Invalid JSON format for items'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = OrderCreateSerializer(
        data=payload,
        context={'user': request.user},
    )
    if serializer.is_valid():
        order = serializer.save()
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """Get orders for authenticated user."""
    orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
    serializer = OrderDetailSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def order_detail(request, order_id):
    """Get order detail (accessible by owner or admin)."""
    try:
        order = Order.objects.select_related('user').prefetch_related('items__product').get(id=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if not _can_access_order(request.user, order):
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = OrderDetailSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_guest_order(request):
    """Search for guest order by email and phone."""
    email = request.query_params.get('email') or request.query_params.get('guest_email')
    phone = request.query_params.get('phone') or request.query_params.get('guest_phone')

    if not email or not phone:
        return Response({'detail': 'Email and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

    order = (
        Order.objects.select_related('user')
        .prefetch_related('items__product')
        .filter(user__isnull=True, email__iexact=email, phone=phone)
        .first()
    )
    if not order:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderDetailSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)
