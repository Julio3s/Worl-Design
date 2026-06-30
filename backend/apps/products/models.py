from django.db import models
from django.utils.text import slugify
from cloudinary.models import CloudinaryField


class Category(models.Model):
    """Product Category model."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    image = CloudinaryField('image', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            self.slug = base_slug
            counter = 1
            while Category.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f'{base_slug}-{counter}'
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    """Product model with all required fields."""
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    image = CloudinaryField('image', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text="Show in featured section")
    is_customizable = models.BooleanField(default=False, help_text="Allow text customization")
    customization_hint = models.CharField(max_length=255, blank=True, null=True, help_text="Placeholder for customization field")
    has_models = models.BooleanField(default=False, help_text="Afficher les modèles pour ce produit")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Le slug est généré par le serializer avant création
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductModel(models.Model):
    """Model variant for a product (e.g., size, color, reference number)."""
    MODEL_TYPES = [
        ('numeric', 'Numérique'),
        ('alpha', 'Alphabétique'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='models')
    model_type = models.CharField(max_length=10, choices=MODEL_TYPES)
    model_value = models.CharField(max_length=50, help_text="Valeur du modèle (ex: 1, 2, A, B, etc.)")
    display_order = models.PositiveIntegerField(default=0, help_text="Ordre d'affichage")

    class Meta:
        db_table = 'product_models'
        ordering = ['display_order', 'model_value']
        unique_together = ['product', 'model_value']

    def __str__(self):
        return f"{self.product.name} - Modèle {self.model_value}"


class ProductImage(models.Model):
    """Additional images/videos for a product."""
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Vidéo'),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField('image', null=True, blank=True)
    video_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL de la vidéo (YouTube, Vimeo)")
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'product_images'
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.media_type.capitalize()} {self.order} - {self.product.name}'