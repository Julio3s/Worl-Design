from decimal import Decimal, InvalidOperation

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.users.permissions import IsAdminUser

from .models import Order
from .serializers import (
    OrderAdminDetailSerializer,
    OrderAdminListSerializer,
    OrderStatusUpdateSerializer,
)


User = get_user_model()
REVENUE_STATUSES = ('CONFIRMED', 'SHIPPED', 'DELIVERED')
VALID_ORDER_STATUSES = {choice[0] for choice in Order.STATUS_CHOICES}


class AdminOrderPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


def _parse_decimal_param(value, field_name):
    if value in (None, ''):
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(f'Invalid {field_name}')


def _parse_status_filters(request):
    statuses = request.query_params.getlist('status')
    if not statuses:
        raw_status = request.query_params.get('status', '')
        if raw_status:
            statuses = [item.strip() for item in raw_status.split(',') if item.strip()]

    invalid = [item for item in statuses if item not in VALID_ORDER_STATUSES]
    if invalid:
        raise ValueError(f'Invalid status value(s): {", ".join(invalid)}')

    return statuses


def _filter_admin_orders(request):
    orders = Order.objects.select_related('user').order_by('-created_at')

    try:
        statuses = _parse_status_filters(request)
    except ValueError as exc:
        return None, Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    if statuses:
        orders = orders.filter(status__in=statuses)

    date_from = parse_date(request.query_params.get('date_from') or '')
    date_to = parse_date(request.query_params.get('date_to') or '')
    if request.query_params.get('date_from') and not date_from:
        return None, Response({'detail': 'Invalid date_from'}, status=status.HTTP_400_BAD_REQUEST)
    if request.query_params.get('date_to') and not date_to:
        return None, Response({'detail': 'Invalid date_to'}, status=status.HTTP_400_BAD_REQUEST)

    if date_from:
        orders = orders.filter(created_at__date__gte=date_from)
    if date_to:
        orders = orders.filter(created_at__date__lte=date_to)

    try:
        min_amount = _parse_decimal_param(request.query_params.get('min_amount'), 'min_amount')
    except ValueError as exc:
        return None, Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    if min_amount is not None:
        orders = orders.filter(total_amount__gte=min_amount)

    return orders, None


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders(request):
    orders, error_response = _filter_admin_orders(request)
    if error_response is not None:
        return error_response

    paginator = AdminOrderPagination()
    paginated_orders = paginator.paginate_queryset(orders, request)
    serializer = OrderAdminListSerializer(paginated_orders, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_order_detail(request, order_id):
    order = get_object_or_404(
        Order.objects.select_related('user', 'payment').prefetch_related('items__product'),
        pk=order_id,
    )

    if request.method == 'GET':
        serializer = OrderAdminDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(OrderAdminDetailSerializer(order).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_customers(request):
    registered_customers = (
        User.objects.filter(orders__isnull=False)
        .annotate(
            orders_count=Count('orders', distinct=True),
            total_spent=Sum(
                'orders__total_amount',
                filter=Q(orders__status__in=REVENUE_STATUSES),
            ),
        )
        .distinct()
        .order_by('-orders_count', 'email')
    )

    customers = []
    for user in registered_customers:
        full_name = user.get_full_name().strip() if user.get_full_name() else ''
        customers.append({
            'id': f'user-{user.id}',
            'type': 'registered',
            'name': full_name or user.username or user.email,
            'email': user.email,
            'phone': user.phone,
            'orders_count': user.orders_count,
            'total_spent': str(user.total_spent or Decimal('0.00')),
        })

    guest_orders = (
        Order.objects.filter(user__isnull=True)
        .values('name', 'email', 'phone')
        .annotate(
            orders_count=Count('id'),
            total_spent=Sum(
                'total_amount',
                filter=Q(status__in=REVENUE_STATUSES),
            ),
        )
        .order_by('-orders_count', 'email')
    )

    for guest in guest_orders:
        email = guest.get('email') or ''
        phone = guest.get('phone') or ''
        customers.append({
            'id': f'guest-{email}-{phone}',
            'type': 'guest',
            'name': guest.get('name') or 'Invité',
            'email': email,
            'phone': phone,
            'orders_count': guest['orders_count'],
            'total_spent': str(guest['total_spent'] or Decimal('0.00')),
        })

    customers.sort(key=lambda item: (-item['orders_count'], item['name'].lower()))
    return Response(customers, status=status.HTTP_200_OK)
