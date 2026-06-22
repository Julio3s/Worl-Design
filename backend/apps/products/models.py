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
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    """Product model with all required fields."""
    MODEL_TYPES = [
        ('none', 'Aucun modèle'),
        ('numeric', 'Numérique (1-100)'),
        ('alpha', 'Alphabétique (A-Z)'),
    ]

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
    model_type = models.CharField(max_length=10, choices=MODEL_TYPES, default='none', help_text="Type de modèle pour les produits personnalisables")
    model_start = models.CharField(max_length=3, blank=True, null=True, help_text="Début de la plage (ex: 1 ou A)")
    model_end = models.CharField(max_length=3, blank=True, null=True, help_text="Fin de la plage (ex: 100 ou Z)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_model_list(self):
        """Generate list of available models based on configuration."""
        if self.model_type == 'none' or not self.model_start or not self.model_end:
            return []
        
        try:
            if self.model_type == 'numeric':
                start, end = int(self.model_start), int(self.model_end)
                return [str(i) for i in range(start, end + 1)]
            elif self.model_type == 'alpha':
                start, end = self.model_start.upper(), self.model_end.upper()
                return [chr(i) for i in range(ord(start), ord(end) + 1)]
        except (ValueError, TypeError):
            return []
        return []

    def __str__(self):
        return self.name


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