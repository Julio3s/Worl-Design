import json
import logging
import uuid
from collections import defaultdict
from decimal import Decimal

import requests
from django.conf import settings
from django.db import transaction
from django.db.models import F
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.orders.models import Order
from apps.products.models import Product

from .models import Payment


logger = logging.getLogger(__name__)

CINETPAY_INIT_SUCCESS_CODE = '201'
CINETPAY_CHECK_SUCCESS_CODE = '00'
CINETPAY_ACCEPTED_STATUSES = {'ACCEPTED'}


def _cinetpay_headers():
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': settings.CINETPAY_USER_AGENT,
    }


def _post_cinetpay(url, payload):
    try:
        response = requests.post(
            url,
            json=payload,
            headers=_cinetpay_headers(),
            timeout=settings.CINETPAY_TIMEOUT_SECONDS,
        )
    except requests.Timeout:
        logger.exception('CinetPay timeout for url=%s', url)
        return None, None, Response(
            {'detail': 'CinetPay request timed out'},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )
    except requests.RequestException:
        logger.exception('CinetPay network error for url=%s', url)
        return None, None, Response(
            {'detail': 'Payment service unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        data = response.json()
    except ValueError:
        logger.error(
            'CinetPay returned invalid JSON for url=%s http_status=%s',
            url,
            response.status_code,
        )
        return response, None, Response(
            {'detail': 'Invalid response from payment provider'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return response, data, None


def _extract_transaction_id(payload):
    if payload is None or not hasattr(payload, 'get'):
        return None

    for key in ('transaction_id', 'cpm_trans_id', 'trans_id', 'transactionId'):
        value = payload.get(key)
        if value:
            return str(value)

    nested_data = payload.get('data')
    if hasattr(nested_data, 'get'):
        for key in ('transaction_id', 'cpm_trans_id', 'trans_id', 'transactionId'):
            value = nested_data.get(key)
            if value:
                return str(value)

    return None


def _split_customer_name(order):
    if order.name:
        full_name = order.name.strip()
    elif order.user:
        full_name = (order.user.get_full_name() or order.user.username or order.user.email or '').strip()
    else:
        full_name = ''

    if not full_name:
        return 'Customer', ''

    parts = full_name.split(None, 1)
    if len(parts) == 1:
        return parts[0], ''
    return parts[0], parts[1]


def _customer_payload(order):
    customer_name, customer_surname = _split_customer_name(order)
    customer_email = order.email or (order.user.email if order.user else '')
    customer_phone = order.phone or (order.user.phone if order.user else '')
    customer_address = order.delivery_address or (order.user.address if order.user else '')

    return {
        'customer_id': str(order.user_id or order.id),
        'customer_name': customer_name,
        'customer_surname': customer_surname,
        'customer_email': customer_email,
        'customer_phone_number': customer_phone,
        'customer_address': customer_address,
    }


def _build_payment_payload(order, transaction_id):
    payload = {
        'apikey': settings.CINETPAY_API_KEY,
        'site_id': settings.CINETPAY_SITE_ID,
        'transaction_id': transaction_id,
        'amount': str(Decimal(order.total_amount)),
        'currency': 'XOF',
        'description': f'WORLD DESIGN order #{order.id}',
        'return_url': settings.CINETPAY_RETURN_URL,
        'notify_url': settings.CINETPAY_NOTIFY_URL,
        'metadata': json.dumps(
            {
                'order_id': order.id,
                'user_id': order.user_id,
                'source': 'world-design',
            }
        ),
    }
    payload.update(_customer_payload(order))
    return payload


def _store_initiated_payment(order, transaction_id, payment_token):
    payment, _ = Payment.objects.update_or_create(
        order=order,
        defaults={
            'status': 'PENDING',
            'cinetpay_transaction_id': transaction_id,
            'cinetpay_payment_token': payment_token,
            'amount': order.total_amount,
            'currency': 'XOF',
        },
    )
    return payment


def _group_order_items(order):
    quantities = defaultdict(int)
    for item in order.items.select_related('product').all():
        if item.product_id:
            quantities[item.product_id] += item.quantity
    return quantities


def _finalize_successful_payment(payment, verification_payload):
    with transaction.atomic():
        locked_payment = Payment.objects.select_for_update().select_related('order').get(pk=payment.pk)
        order = Order.objects.select_for_update().prefetch_related('items__product').get(pk=locked_payment.order_id)

        if locked_payment.status == 'SUCCESS':
            if order.status != 'CONFIRMED':
                order.status = 'CONFIRMED'
                order.save(update_fields=['status', 'updated_at'])
            logger.info(
                'CinetPay webhook already processed transaction_id=%s order_id=%s',
                locked_payment.cinetpay_transaction_id,
                order.id,
            )
            return Response({'detail': 'Payment already confirmed'}, status=status.HTTP_200_OK)

        item_quantities = _group_order_items(order)
        if not item_quantities:
            logger.error(
                'Order has no items during payment confirmation transaction_id=%s order_id=%s',
                locked_payment.cinetpay_transaction_id,
                order.id,
            )
            locked_payment.status = 'FAILED'
            locked_payment.save(update_fields=['status', 'updated_at'])
            order.status = 'CANCELLED'
            order.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'Order items are missing'},
                status=status.HTTP_409_CONFLICT,
            )

        products = Product.objects.select_for_update().filter(id__in=item_quantities.keys())
        products_by_id = {product.id: product for product in products}
        missing_product_ids = [
            product_id for product_id in item_quantities.keys() if product_id not in products_by_id
        ]
        if missing_product_ids:
            logger.error(
                'Missing products during payment confirmation transaction_id=%s order_id=%s missing=%s',
                locked_payment.cinetpay_transaction_id,
                order.id,
                missing_product_ids,
            )
            locked_payment.status = 'FAILED'
            locked_payment.save(update_fields=['status', 'updated_at'])
            order.status = 'CANCELLED'
            order.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'One or more products are unavailable'},
                status=status.HTTP_409_CONFLICT,
            )

        insufficient_stock = [
            product_id
            for product_id, quantity in item_quantities.items()
            if products_by_id[product_id].stock < quantity
        ]
        if insufficient_stock:
            logger.warning(
                'Insufficient stock during payment confirmation transaction_id=%s order_id=%s product_ids=%s',
                locked_payment.cinetpay_transaction_id,
                order.id,
                insufficient_stock,
            )
            locked_payment.status = 'FAILED'
            locked_payment.save(update_fields=['status', 'updated_at'])
            order.status = 'CANCELLED'
            order.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'Stock is insufficient to confirm this order'},
                status=status.HTTP_409_CONFLICT,
            )

        for product_id, quantity in item_quantities.items():
            Product.objects.filter(pk=product_id).update(stock=F('stock') - quantity)

        locked_payment.status = 'SUCCESS'
        locked_payment.save(update_fields=['status', 'updated_at'])
        order.status = 'CONFIRMED'
        order.save(update_fields=['status', 'updated_at'])

        logger.info(
            'Payment confirmed transaction_id=%s order_id=%s verification_code=%s verification_status=%s',
            locked_payment.cinetpay_transaction_id,
            order.id,
            verification_payload.get('code'),
            (verification_payload.get('data') or {}).get('status'),
        )

        return Response({'detail': 'Payment confirmed'}, status=status.HTTP_200_OK)


def _finalize_failed_payment(payment, verification_payload):
    with transaction.atomic():
        locked_payment = Payment.objects.select_for_update().select_related('order').get(pk=payment.pk)
        order = Order.objects.select_for_update().get(pk=locked_payment.order_id)

        if locked_payment.status == 'SUCCESS' and order.status == 'CONFIRMED':
            logger.info(
                'Ignoring failed webhook for already confirmed transaction_id=%s order_id=%s',
                locked_payment.cinetpay_transaction_id,
                order.id,
            )
            return Response({'detail': 'Payment already confirmed'}, status=status.HTTP_200_OK)

        locked_payment.status = 'FAILED'
        locked_payment.save(update_fields=['status', 'updated_at'])
        order.status = 'CANCELLED'
        order.save(update_fields=['status', 'updated_at'])

        logger.warning(
            'Payment failed transaction_id=%s order_id=%s verification_code=%s verification_status=%s',
            locked_payment.cinetpay_transaction_id,
            order.id,
            verification_payload.get('code'),
            (verification_payload.get('data') or {}).get('status'),
        )

        return Response({'detail': 'Payment failed'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_payment(request):
    order_id = request.data.get('order_id')
    if not order_id:
        return Response({'detail': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = Order.objects.select_related('user').prefetch_related('items__product').get(id=order_id)
    except (Order.DoesNotExist, ValueError, TypeError):
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    existing_payment = Payment.objects.filter(order=order).first()
    if existing_payment and existing_payment.status == 'SUCCESS':
        return Response(
            {'detail': 'This order has already been paid'},
            status=status.HTTP_409_CONFLICT,
        )

    transaction_id = f'WD-{order.id}-{uuid.uuid4().hex[:18]}'
    payment_payload = _build_payment_payload(order, transaction_id)

    logger.info(
        'CinetPay initiation requested order_id=%s transaction_id=%s amount=%s',
        order.id,
        transaction_id,
        payment_payload['amount'],
    )

    response, data, error_response = _post_cinetpay(settings.CINETPAY_PAYMENT_URL, payment_payload)
    if error_response is not None:
        return error_response

    if str(data.get('code')) != CINETPAY_INIT_SUCCESS_CODE:
        logger.error(
            'CinetPay initiation rejected order_id=%s transaction_id=%s response=%s',
            order.id,
            transaction_id,
            data,
        )
        return Response(
            {
                'detail': data.get('message') or 'Payment initiation failed',
                'provider_response': data,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    payment_data = data.get('data') or {}
    payment_token = payment_data.get('payment_token') or payment_data.get('token')
    payment_url = payment_data.get('payment_url') or payment_data.get('paymentUrl')

    if not payment_token or not payment_url:
        logger.error(
            'CinetPay initiation missing payment data order_id=%s transaction_id=%s response=%s',
            order.id,
            transaction_id,
            data,
        )
        return Response(
            {'detail': 'Payment provider response is incomplete'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    with transaction.atomic():
        order_for_update = Order.objects.select_for_update().get(pk=order.pk)
        payment = _store_initiated_payment(order_for_update, transaction_id, payment_token)
        if order_for_update.status != 'PENDING':
            order_for_update.status = 'PENDING'
            order_for_update.save(update_fields=['status', 'updated_at'])

    logger.info(
        'CinetPay initiation stored payment_id=%s order_id=%s transaction_id=%s',
        payment.id,
        order.id,
        transaction_id,
    )

    return Response(
        {
            'payment_url': payment_url,
            'transaction_id': transaction_id,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request):
    payload = request.data or {}
    transaction_id = _extract_transaction_id(payload)

    logger.info(
        'CinetPay webhook received transaction_id=%s payload_keys=%s',
        transaction_id,
        sorted(payload.keys()) if hasattr(payload, 'keys') else [],
    )

    if not transaction_id:
        return Response(
            {'detail': 'transaction_id is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payment = (
        Payment.objects.select_related('order')
        .filter(cinetpay_transaction_id=transaction_id)
        .first()
    )
    if not payment:
        logger.warning('Webhook received for unknown transaction_id=%s', transaction_id)
        return Response({'detail': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

    response, data, error_response = _post_cinetpay(settings.CINETPAY_PAYMENT_CHECK_URL, {
        'apikey': settings.CINETPAY_API_KEY,
        'site_id': settings.CINETPAY_SITE_ID,
        'transaction_id': transaction_id,
    })
    if error_response is not None:
        return error_response

    verification_code = str(data.get('code'))
    verification_status = str((data.get('data') or {}).get('status') or '').upper()

    logger.info(
        'CinetPay webhook verified transaction_id=%s code=%s status=%s http_status=%s',
        transaction_id,
        verification_code,
        verification_status,
        response.status_code if response else None,
    )

    if verification_code == CINETPAY_CHECK_SUCCESS_CODE and verification_status in CINETPAY_ACCEPTED_STATUSES:
        return _finalize_successful_payment(payment, data)

    return _finalize_failed_payment(payment, data)
