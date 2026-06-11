from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncHour, TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.analytics.ga4 import GA4ConfigurationError, GA4ReportError, get_ga4_dashboard_stats
from apps.users.permissions import IsAdminUser

from .models import Order
from .serializers import _order_custom_text_summary


User = get_user_model()

REVENUE_STATUSES = ('CONFIRMED', 'SHIPPED', 'DELIVERED')
PERIOD_CHOICES = {'day', 'week', 'month', 'year'}


def _period_bounds(period):
    now = timezone.now()
    if period == 'day':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, now
    if period == 'week':
        return now - timedelta(days=7), now
    if period == 'month':
        return now - timedelta(days=30), now
    return now - timedelta(days=365), now


def _decimal(value):
    return Decimal(value or 0).quantize(Decimal('0.01'))


def _customer_key(order):
    if order.user_id:
        return f'user:{order.user_id}'
    return f'guest:{(order.email or "").lower()}|{order.phone or ""}'


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    period = (request.query_params.get('period') or 'week').lower()
    if period not in PERIOD_CHOICES:
        return Response(
            {'detail': 'Invalid period. Use day, week, month, or year.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    start, end = _period_bounds(period)
    period_orders = Order.objects.filter(created_at__gte=start, created_at__lte=end)
    revenue_orders = period_orders.filter(status__in=REVENUE_STATUSES)

    total_revenue = revenue_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    orders_count = period_orders.count()
    average_basket = _decimal(total_revenue / orders_count) if orders_count else Decimal('0.00')
    pending_orders = Order.objects.filter(status='PENDING').count()

    customer_keys = {_customer_key(order) for order in period_orders.only('user_id', 'email', 'phone')}

    revenue_chart = []
    if period == 'day':
        buckets = (
            revenue_orders.annotate(bucket=TruncHour('created_at'))
            .values('bucket')
            .annotate(revenue=Sum('total_amount'))
            .order_by('bucket')
        )
        for entry in buckets:
            bucket = entry['bucket']
            revenue_chart.append({
                'label': bucket.strftime('%H:%M'),
                'date': bucket.date().isoformat(),
                'revenue': str(_decimal(entry['revenue'])),
            })
    elif period == 'year':
        buckets = (
            revenue_orders.annotate(bucket=TruncMonth('created_at'))
            .values('bucket')
            .annotate(revenue=Sum('total_amount'))
            .order_by('bucket')
        )
        for entry in buckets:
            bucket = entry['bucket']
            revenue_chart.append({
                'label': bucket.strftime('%b %Y'),
                'date': bucket.date().isoformat(),
                'revenue': str(_decimal(entry['revenue'])),
            })
    else:
        buckets = (
            revenue_orders.annotate(bucket=TruncDate('created_at'))
            .values('bucket')
            .annotate(revenue=Sum('total_amount'))
            .order_by('bucket')
        )
        for entry in buckets:
            bucket = entry['bucket']
            revenue_chart.append({
                'label': bucket.strftime('%d/%m'),
                'date': bucket.isoformat(),
                'revenue': str(_decimal(entry['revenue'])),
            })

    orders_by_status = list(
        period_orders.values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )

    recent_orders_qs = (
        Order.objects.select_related('user').prefetch_related('items')
        .order_by('-created_at')[:10]
    )
    recent_orders = []
    for order in recent_orders_qs:
        customer_name = order.name or (
            order.user.get_full_name().strip() if order.user and order.user.get_full_name() else None
        ) or (order.user.email if order.user else 'Invité')
        recent_orders.append({
            'id': order.id,
            'customer_name': customer_name,
            'is_guest': order.user_id is None,
            'email': order.email,
            'phone': order.phone,
            'delivery_address': order.delivery_address,
            'custom_text_summary': _order_custom_text_summary(order),
            'total_amount': str(_decimal(order.total_amount)),
            'status': order.status,
            'created_at': order.created_at.isoformat(),
        })

    ga4 = {
        'configured': False,
        'error': None,
        'metrics': {
            'total_users': 0,
            'sessions': 0,
            'page_views': 0,
            'engaged_sessions': 0,
            'active_users': 0,
        },
        'top_channels': [],
        'top_pages': [],
    }

    try:
        ga4 = get_ga4_dashboard_stats(period)
    except GA4ConfigurationError as error:
        ga4['error'] = str(error)
    except GA4ReportError as error:
        ga4['error'] = str(error)
    except Exception as error:  # pragma: no cover - defensive fallback for API/runtime issues
        ga4['error'] = f'GA4 integration error: {error}'

    return Response(
        {
            'period': period,
            'kpis': {
                'total_revenue': str(_decimal(total_revenue)),
                'orders_count': orders_count,
                'customers_count': len(customer_keys),
                'average_basket': str(average_basket),
                'pending_orders': pending_orders,
            },
            'revenue_chart': revenue_chart,
            'orders_by_status': orders_by_status,
            'recent_orders': recent_orders,
            'ga4': ga4,
        },
        status=status.HTTP_200_OK,
    )
