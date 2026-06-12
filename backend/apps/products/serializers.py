from cloudinary import config as cloudinary_config
from rest_framework import serializers

from .models import Category, Product


def _cloudinary_url(resource):
    if not resource:
        return None

    try:
        if not getattr(cloudinary_config(), 'cloud_name', None):
            return None
        return resource.url
    except Exception:
        return None


class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'image_url', 'updated_at']
        extra_kwargs = {
            'image': {'write_only': True, 'required': False, 'allow_null': True},
        }

    def get_image_url(self, obj):
        return _cloudinary_url(obj.image)


class CategoryAdminSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)
    image_public_id = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'image', 'image_url', 'image_public_id',
            'product_count', 'created_at', 'updated_at',
        ]
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'image': {'write_only': True, 'required': False, 'allow_null': True},
        }

    def get_image_url(self, obj):
        return _cloudinary_url(obj.image)

    def create(self, validated_data):
        image_public_id = validated_data.pop('image_public_id', None)
        if image_public_id:
            validated_data.pop('image', None)

        category = super().create(validated_data)
        if image_public_id:
            category.image = image_public_id
            category.save(update_fields=['image'])
        return category

    def update(self, instance, validated_data):
        image_public_id = validated_data.pop('image_public_id', None)
        if image_public_id:
            validated_data.pop('image', None)

        category = super().update(instance, validated_data)
        if image_public_id:
            category.image = image_public_id
            category.save(update_fields=['image'])
        return category


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'stock', 'image', 'image_url', 'is_active', 'is_customizable', 'category']
        extra_kwargs = {
            'image': {'write_only': True, 'required': False, 'allow_null': True},
        }

    def get_image_url(self, obj):
        return _cloudinary_url(obj.image)


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'stock', 'image', 'image_url',
            'category', 'is_active', 'is_featured', 'is_customizable',
            'customization_hint', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'image': {'write_only': True, 'required': False, 'allow_null': True},
        }

    def get_image_url(self, obj):
        return _cloudinary_url(obj.image)


class ProductAdminSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )
    image_url = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'stock',
            'image', 'image_url', 'category', 'category_name', 'category_slug',
            'is_active', 'is_featured', 'is_customizable', 'customization_hint',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'image': {'write_only': True, 'required': False, 'allow_null': True},
            'customization_hint': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def get_image_url(self, obj):
        return _cloudinary_url(obj.image)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_category_slug(self, obj):
        return obj.category.slug if obj.category else None
