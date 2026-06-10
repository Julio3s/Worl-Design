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

FEDAPAY_APPROVED_STATUSES = {'approved', 'success', 'succeeded', 'paid'}
FEDAPAY_PENDING_STATUSES = {'pending', 'created', 'processing'}
FEDAPAY_FAILED_STATUSES = {'declined', 'canceled', 'cancelled', 'expired', 'failed'}


def _fedapay_headers():
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {settings.FEDAPAY_SECRET_KEY}',
        'User-Agent': settings.FEDAPAY_USER_AGENT,
    }


def _request_fedapay(method, url, payload=None):
    try:
        response = requests.request(
            method=method,
            url=url,
            json=payload,
            headers=_fedapay_headers(),
            timeout=settings.FEDAPAY_TIMEOUT_SECONDS,
        )
    except requests.Timeout:
        logger.exception('FedaPay timeout for url=%s method=%s', url, method)
        return None, None, Response(
            {'detail': 'Payment provider request timed out'},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )
    except requests.RequestException:
        logger.exception('FedaPay network error for url=%s method=%s', url, method)
        return None, None, Response(
            {'detail': 'Payment service unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        data = response.json()
    except ValueError:
        logger.error(
            'FedaPay returned invalid JSON for url=%s method=%s http_status=%s',
            url,
            method,
            response.status_code,
        )
        return response, None, Response(
            {'detail': 'Invalid response from payment provider'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return response, data, None


def _walk_values(payload):
    if isinstance(payload, dict):
        for value in payload.values():
            yield value
            yield from _walk_values(value)
    elif isinstance(payload, list):
        for item in payload:
            yield item
            yield from _walk_values(item)


def _extract_first_value(payload, keys):
    if not isinstance(payload, (dict, list)):
        return None

    if isinstance(payload, dict):
        for key in keys:
            value = payload.get(key)
            if value not in (None, ''):
                return value

    for item in _walk_values(payload):
        if isinstance(item, dict):
            for key in keys:
                value = item.get(key)
                if value not in (None, ''):
                    return value

    return None


def _extract_reference(payload):
    value = _extract_first_value(
        payload,
        (
            'merchant_reference',
            'merchantReference',
            'reference',
            'transaction_reference',
            'transactionReference',
            'transaction_id',
            'transactionId',
            'id',
        ),
    )
    return str(value) if value not in (None, '') else None


def _extract_transaction_id(payload):
    value = _extract_first_value(
        payload,
        (
            'transaction_id',
            'transactionId',
            'id',
        ),
    )
    return str(value) if value not in (None, '') else None


def _extract_status(payload):
    value = _extract_first_value(
        payload,
        (
            'status',
            'state',
            'transaction_status',
            'transactionStatus',
        ),
    )
    return str(value).lower() if value not in (None, '') else None


def _extract_event_name(payload):
    value = _extract_first_value(
        payload,
        (
            'name',
            'event',
            'event_name',
            'type',
        ),
    )
    return str(value).lower() if value not in (None, '') else None


def _extract_payment_url(payload):
    value = _extract_first_value(
        payload,
        (
            'payment_url',
            'paymentUrl',
            'payment_link',
            'paymentLink',
            'checkout_url',
            'checkoutUrl',
            'url',
            'link',
        ),
    )
    return str(value) if value not in (None, '') else None


def _extract_payment_token(payload):
    value = _extract_first_value(
        payload,
        (
            'token',
            'payment_token',
            'paymentToken',
        ),
    )
    return str(value) if value not in (None, '') else None


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


def _infer_phone_country(phone_number):
    normalized = (phone_number or '').strip().replace(' ', '')
    prefix_map = {
        '+228': 'tg',
        '228': 'tg',
        '+229': 'bj',
        '229': 'bj',
        '+223': 'ml',
        '223': 'ml',
        '+225': 'ci',
        '225': 'ci',
        '+226': 'bf',
        '226': 'bf',
        '+221': 'sn',
        '221': 'sn',
        '+237': 'cm',
        '237': 'cm',
    }

    for prefix, country in prefix_map.items():
        if normalized.startswith(prefix):
            return country
    return 'tg'


def _customer_payload(order):
    firstname, lastname = _split_customer_name(order)
    customer_email = order.email or (order.user.email if order.user else '')
    customer_phone = order.phone or (order.user.phone if order.user else '')

    payload = {
        'customer': {
            'firstname': firstname,
            'lastname': lastname,
            'email': customer_email,
        }
    }

    if customer_phone:
        payload['customer']['phone_number'] = {
            'number': customer_phone,
            'country': _infer_phone_country(customer_phone),
        }

    return payload


def _fedapay_amount(order):
    amount = Decimal(order.total_amount)
    if amount != amount.to_integral_value():
        raise ValueError('FedaPay requires a whole-number amount')
    return int(amount)


def _build_payment_payload(order, merchant_reference):
    payload = {
        'description': f'WORLD DESIGN order #{order.id}',
        'amount': _fedapay_amount(order),
        'currency': {'iso': 'XOF'},
        'callback_url': settings.FEDAPAY_RETURN_URL,
        'merchant_reference': merchant_reference,
        'custom_metadata': {
            'order_id': order.id,
            'user_id': order.user_id,
            'source': 'world-design',
        },
    }
    payload.update(_customer_payload(order))
    return payload


def _store_initiated_payment(order, transaction_reference, payment_token):
    payment, _ = Payment.objects.update_or_create(
        order=order,
        defaults={
            'status': 'PENDING',
            'fedapay_transaction_id': transaction_reference,
            'fedapay_payment_token': payment_token,
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


def _extract_provider_response_details(data):
    transaction_id = _extract_transaction_id(data)
    payment_url = _extract_payment_url(data)
    payment_token = _extract_payment_token(data)
    status_value = _extract_status(data)
    event_name = _extract_event_name(data)
    reference = _extract_reference(data)

    return {
        'transaction_id': transaction_id,
        'payment_url': payment_url,
        'payment_token': payment_token,
        'status': status_value,
        'event_name': event_name,
        'reference': reference,
    }


def _request_transaction_details(reference):
    candidates = [
        f'{settings.FEDAPAY_API_BASE_URL}/transactions/{reference}',
        f'{settings.FEDAPAY_API_BASE_URL}/transactions/merchant/{reference}',
    ]

    last_error_response = None
    for candidate in candidates:
        response, data, error_response = _request_fedapay('GET', candidate)
        if error_response is not None:
            last_error_response = error_response
            continue

        if response is not None and 200 <= response.status_code < 300:
            return response, data, None

        logger.warning(
            'FedaPay transaction lookup failed reference=%s http_status=%s response=%s',
            reference,
            response.status_code if response else None,
            data,
        )

    return None, None, last_error_response or Response(
        {'detail': 'Payment provider transaction not found'},
        status=status.HTTP_404_NOT_FOUND,
    )


def _request_payment_link(reference):
    candidates = [
        f'{settings.FEDAPAY_API_BASE_URL}/transactions/{reference}/token',
        f'{settings.FEDAPAY_API_BASE_URL}/transactions/{reference}/payment-link',
    ]

    for candidate in candidates:
        for method in ('GET', 'POST'):
            response, data, error_response = _request_fedapay(method, candidate)
            if error_response is not None:
                continue

            if response is not None and 200 <= response.status_code < 300:
                payment_url = _extract_payment_url(data)
                if payment_url:
                    payment_token = _extract_first_value(
                        data,
                        (
                            'token',
                            'payment_token',
                            'paymentToken',
                        ),
                    )
                    return payment_url, (str(payment_token) if payment_token not in (None, '') else None), None

    return None, None, Response(
        {'detail': 'Payment provider did not return a checkout link'},
        status=status.HTTP_502_BAD_GATEWAY,
    )


def _finalize_successful_payment(payment, verification_payload):
    with transaction.atomic():
        locked_payment = Payment.objects.select_for_update().select_related('order').get(pk=payment.pk)
        order = Order.objects.select_for_update().prefetch_related('items__product').get(pk=locked_payment.order_id)

        if locked_payment.status == 'SUCCESS':
            if order.status != 'CONFIRMED':
                order.status = 'CONFIRMED'
                order.save(update_fields=['status', 'updated_at'])
            logger.info(
                'FedaPay webhook already processed transaction_reference=%s order_id=%s',
                locked_payment.fedapay_transaction_id,
                order.id,
            )
            return Response({'detail': 'Payment already confirmed'}, status=status.HTTP_200_OK)

        item_quantities = _group_order_items(order)
        if not item_quantities:
            logger.error(
                'Order has no items during payment confirmation transaction_reference=%s order_id=%s',
                locked_payment.fedapay_transaction_id,
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
                'Missing products during payment confirmation transaction_reference=%s order_id=%s missing=%s',
                locked_payment.fedapay_transaction_id,
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
                'Insufficient stock during payment confirmation transaction_reference=%s order_id=%s product_ids=%s',
                locked_payment.fedapay_transaction_id,
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
            'Payment confirmed transaction_reference=%s order_id=%s status=%s event=%s',
            locked_payment.fedapay_transaction_id,
            order.id,
            verification_payload.get('status'),
            verification_payload.get('event_name'),
        )

        return Response({'detail': 'Payment confirmed'}, status=status.HTTP_200_OK)


def _finalize_failed_payment(payment, verification_payload):
    with transaction.atomic():
        locked_payment = Payment.objects.select_for_update().select_related('order').get(pk=payment.pk)
        order = Order.objects.select_for_update().get(pk=locked_payment.order_id)

        if locked_payment.status == 'SUCCESS' and order.status == 'CONFIRMED':
            logger.info(
                'Ignoring failed webhook for already confirmed transaction_reference=%s order_id=%s',
                locked_payment.fedapay_transaction_id,
                order.id,
            )
            return Response({'detail': 'Payment already confirmed'}, status=status.HTTP_200_OK)

        locked_payment.status = 'FAILED'
        locked_payment.save(update_fields=['status', 'updated_at'])
        order.status = 'CANCELLED'
        order.save(update_fields=['status', 'updated_at'])

        logger.warning(
            'Payment failed transaction_reference=%s order_id=%s status=%s event=%s',
            locked_payment.fedapay_transaction_id,
            order.id,
            verification_payload.get('status'),
            verification_payload.get('event_name'),
        )

        return Response({'detail': 'Payment failed'}, status=status.HTTP_200_OK)


def _resolve_payment_state(payload):
    details = _extract_provider_response_details(payload)
    status_value = details['status']
    event_name = details['event_name']

    if status_value in FEDAPAY_APPROVED_STATUSES or event_name == 'transaction.approved':
        return 'success', details

    if status_value in FEDAPAY_FAILED_STATUSES or event_name in {'transaction.canceled', 'transaction.declined'}:
        return 'failed', details

    if status_value in FEDAPAY_PENDING_STATUSES or event_name in {'transaction.created', 'transaction.pending'}:
        return 'pending', details

    return 'unknown', details


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

    merchant_reference = f'WD-{order.id}-{uuid.uuid4().hex[:18]}'
    try:
        payment_payload = _build_payment_payload(order, merchant_reference)
    except ValueError as exc:
        logger.warning('FedaPay amount validation failed order_id=%s error=%s', order.id, exc)
        return Response(
            {'detail': str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    logger.info(
        'FedaPay initiation requested order_id=%s merchant_reference=%s amount=%s',
        order.id,
        merchant_reference,
        payment_payload['amount'],
    )

    response, data, error_response = _request_fedapay(
        'POST',
        f'{settings.FEDAPAY_API_BASE_URL}/transactions',
        payment_payload,
    )
    if error_response is not None:
        return error_response

    if response is None or not (200 <= response.status_code < 300):
        logger.error(
            'FedaPay initiation rejected order_id=%s merchant_reference=%s response=%s',
            order.id,
            merchant_reference,
            data,
        )
        return Response(
            {
                'detail': (data or {}).get('message') or 'Payment initiation failed',
                'provider_response': data,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    provider_details = _extract_provider_response_details(data)
    provider_transaction_id = provider_details['transaction_id']
    payment_url = provider_details['payment_url']
    payment_token = provider_details['payment_token'] or provider_details['reference']

    if not payment_url:
        lookup_reference = provider_transaction_id or merchant_reference
        payment_url, payment_token_from_lookup, lookup_error = _request_payment_link(lookup_reference)
        if lookup_error is not None:
            return lookup_error
        payment_token = payment_token_from_lookup or payment_token

    if not payment_url:
        logger.error(
            'FedaPay initiation missing payment URL order_id=%s merchant_reference=%s response=%s',
            order.id,
            merchant_reference,
            data,
        )
        return Response(
            {'detail': 'Payment provider response is incomplete'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    with transaction.atomic():
        order_for_update = Order.objects.select_for_update().get(pk=order.pk)
        payment = _store_initiated_payment(order_for_update, merchant_reference, payment_token)
        if order_for_update.status != 'PENDING':
            order_for_update.status = 'PENDING'
            order_for_update.save(update_fields=['status', 'updated_at'])

    logger.info(
        'FedaPay initiation stored payment_id=%s order_id=%s merchant_reference=%s provider_transaction_id=%s',
        payment.id,
        order.id,
        merchant_reference,
        provider_transaction_id,
    )

    return Response(
        {
            'payment_url': payment_url,
            'transaction_id': merchant_reference,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request):
    payload = request.data or {}
    reference = _extract_reference(payload)

    logger.info(
        'FedaPay webhook received reference=%s payload_keys=%s',
        reference,
        sorted(payload.keys()) if hasattr(payload, 'keys') else [],
    )

    if not reference:
        return Response(
            {'detail': 'transaction reference is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    response, data, error_response = _request_transaction_details(reference)
    if error_response is not None:
        return error_response

    state, verification_details = _resolve_payment_state(data or payload)
    resolved_reference = verification_details.get('reference') or reference

    payment = (
        Payment.objects.select_related('order')
        .filter(fedapay_transaction_id=resolved_reference)
        .first()
    )
    if not payment and resolved_reference != reference:
        payment = (
            Payment.objects.select_related('order')
            .filter(fedapay_transaction_id=reference)
            .first()
        )
    if not payment:
        logger.warning('Webhook received for unknown reference=%s', reference)
        return Response({'detail': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

    logger.info(
        'FedaPay webhook verified reference=%s status=%s event=%s http_status=%s',
        resolved_reference,
        verification_details.get('status'),
        verification_details.get('event_name'),
        response.status_code if response else None,
    )

    if state == 'success':
        return _finalize_successful_payment(payment, verification_details)

    if state == 'failed':
        return _finalize_failed_payment(payment, verification_details)

    return Response({'detail': 'Payment pending'}, status=status.HTTP_200_OK)
