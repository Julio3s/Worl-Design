from cloudinary import config as cloudinary_config
from rest_framework import serializers

from .models import Category, Product, ProductImage


def _cloudinary_url(resource):
    if not resource:
        return None

    try:
        if not getattr(cloudinary_config(), 'cloud_name', None):
            return None
        
        # Get the base URL
        url = resource.url
        
        # Add Cloudinary transformations for optimization
        # Auto format: serves WebP/AVIF if supported, falls back to original
        # Auto quality: automatic compression
        # Limit size to 1200px width for product images
        if url and 'cloudinary.com' in url:
            # Insert transformations before the file extension
            url = url.replace('/upload/', '/upload/c_fit,w_1200,q_auto,f_auto/')
        
        return url
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


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'order']
        extra_kwargs = {
            'image': {'write_only': True, 'required': True},
        }

    def get_image_url(self, obj):
        return _cloudinary_url(obj.image)


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'stock', 'image', 'image_url', 'images', 'is_active', 'is_customizable', 'category']
        extra_kwargs = {
            'image': {'write_only': True, 'required': False, 'allow_null': True},
        }

    def get_image_url(self, obj):
        return _cloudinary_url(obj.image)


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'stock', 'image', 'image_url',
            'images',
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
    images = ProductImageSerializer(many=True, read_only=True)
    images_data = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    category_name = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'stock',
            'image', 'image_url', 'images', 'images_data',
            'category', 'category_name', 'category_slug',
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

    def create(self, validated_data):
        images_data_raw = validated_data.pop('images_data', None)
        product = super().create(validated_data)
        self._rebuild_images(product, images_data_raw)
        return product

    def update(self, instance, validated_data):
        images_data_raw = validated_data.pop('images_data', None)
        # Don't regenerate slug on update to avoid unique constraint conflicts
        # The slug is already set on creation and should not change
        validated_data.pop('name', None)
        validated_data.pop('slug', None)
        product = super().update(instance, validated_data)
        self._rebuild_images(product, images_data_raw)
        return product

    def _parse_images_data(self, raw_value):
        """Parse images_data (JSON string) en liste de dicts."""
        if not raw_value:
            return []
        import json
        try:
            data = json.loads(raw_value)
        except (json.JSONDecodeError, TypeError):
            return []
        if not isinstance(data, list):
            return []
        return data

    def _rebuild_images(self, product, images_data_raw):
        """Supprime toutes les ProductImage existantes et les recrée
        à partir des métadonnées conservées (images_data) + nouveaux fichiers uploadés."""
        request = self.context.get('request')
        images_meta = self._parse_images_data(images_data_raw)

        # Supprimer toutes les images existantes
        product.images.all().delete()

        # 1. Recréer les images existantes conservées (public_id dans images_data)
        for idx, meta in enumerate(images_meta):
            public_id = meta.get('public_id', '')
            if public_id:
                # public_id est une URL Cloudinary complète, CloudinaryField accepte ça comme référence
                ProductImage.objects.create(
                    product=product,
                    image=public_id,
                    order=meta.get('order', idx),
                )

        # 2. Ajouter les nouveaux fichiers uploadés (images_new_*)
        if request:
            base_order = product.images.count()
            i = 0
            while True:
                key = f'images_new_{i}'
                uploaded = request.FILES.get(key)
                if uploaded is None:
                    break
                ProductImage.objects.create(
                    product=product,
                    image=uploaded,
                    order=base_order + i,
                )
                i += 1
