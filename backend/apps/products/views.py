from decimal import Decimal, InvalidOperation

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.users.permissions import IsAdminUser as IsWorldDesignAdminUser

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    CategoryAdminSerializer,
    ProductAdminSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


def _parse_decimal_param(value, field_name):
    if value in (None, ''):
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(f'Invalid {field_name}')


def _normalize_admin_payload(data):
    payload = data.copy()
    if payload.get('category') == '':
        payload['category'] = None
    return payload


@api_view(['GET'])
@permission_classes([AllowAny])
def list_categories(request):
    """List all categories."""
    categories = Category.objects.all().order_by('name')
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsWorldDesignAdminUser])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_categories(request):
    """Admin collection endpoint for listing and creating categories."""
    if request.method == 'GET':
        categories = Category.objects.annotate(product_count=Count('products')).all().order_by('name')
        search = request.query_params.get('search', '').strip()
        if search:
            categories = categories.filter(name__icontains=search)

        serializer = CategoryAdminSerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = CategoryAdminSerializer(data=request.data)
    if serializer.is_valid():
        try:
            category = serializer.save()
        except IntegrityError:
            return Response(
                {'detail': 'A category with the same name or slug already exists'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(CategoryAdminSerializer(category).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsWorldDesignAdminUser])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_category_detail(request, pk):
    """Admin endpoint for retrieving, updating and deleting a category."""
    category = get_object_or_404(Category.objects.annotate(product_count=Count('products')), pk=pk)

    if request.method == 'GET':
        serializer = CategoryAdminSerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method in ['PUT', 'PATCH']:
        serializer = CategoryAdminSerializer(category, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            try:
                category = serializer.save()
            except IntegrityError:
                return Response(
                    {'detail': 'A category with the same name or slug already exists'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(CategoryAdminSerializer(category).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    category.delete()
    return Response({'detail': 'Category deleted successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_products(request):
    """List active products with filtering and pagination."""
    products = Product.objects.select_related('category').filter(is_active=True)

    category_slug = request.query_params.get('category')
    if category_slug:
        products = products.filter(category__slug=category_slug)

    try:
        min_price = _parse_decimal_param(request.query_params.get('min_price'), 'min_price')
        max_price = _parse_decimal_param(request.query_params.get('max_price'), 'max_price')
    except ValueError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    if min_price is not None:
        products = products.filter(price__gte=min_price)
    if max_price is not None:
        products = products.filter(price__lte=max_price)

    paginator = ProductPagination()
    paginated_products = paginator.paginate_queryset(products, request)
    serializer = ProductListSerializer(paginated_products, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, slug):
    """Get product detail by slug."""
    product = get_object_or_404(Product.objects.select_related('category'), slug=slug, is_active=True)
    serializer = ProductDetailSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """Get up to six featured products."""
    products = Product.objects.select_related('category').filter(is_active=True, is_featured=True)[:6]
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsWorldDesignAdminUser])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_products(request):
    """Admin collection endpoint for listing and creating products."""
    if request.method == 'GET':
        products = Product.objects.select_related('category').all().order_by('-created_at')

        category_slug = request.query_params.get('category')
        if category_slug:
            products = products.filter(category__slug=category_slug)

        search = request.query_params.get('search', '').strip()
        if search:
            products = products.filter(name__icontains=search)

        is_active = request.query_params.get('is_active')
        if is_active is not None:
            normalized = str(is_active).strip().lower()
            if normalized in {'true', '1', 'yes'}:
                products = products.filter(is_active=True)
            elif normalized in {'false', '0', 'no'}:
                products = products.filter(is_active=False)
            else:
                return Response(
                    {'detail': 'Invalid is_active value'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        paginator = ProductPagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serializer = ProductAdminSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)

    payload = _normalize_admin_payload(request.data)
    serializer = ProductAdminSerializer(data=payload, context={'request': request})
    if serializer.is_valid():
        try:
            product = serializer.save()
        except IntegrityError:
            return Response(
                {'detail': 'A product with the same name or slug already exists'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(ProductAdminSerializer(product, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsWorldDesignAdminUser])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_product_detail(request, pk):
    """Admin endpoint for retrieving, updating and deactivating a product."""
    product = get_object_or_404(Product.objects.select_related('category'), pk=pk)

    if request.method == 'GET':
        serializer = ProductAdminSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method in ['PUT', 'PATCH']:
        payload = _normalize_admin_payload(request.data)
        serializer = ProductAdminSerializer(product, data=payload, partial=request.method == 'PATCH', context={'request': request})
        if serializer.is_valid():
            try:
                product = serializer.save()
            except IntegrityError:
                return Response(
                    {'detail': 'A product with the same name or slug already exists'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(ProductAdminSerializer(product, context={'request': request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product.is_active = False
    product.save()
    return Response(
        {'detail': 'Product deactivated successfully'},
        status=status.HTTP_200_OK,
    )
