from django.db import migrations, models
import cloudinary.models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_add_product_images'),
    ]

    operations = [
        migrations.AddField(
            model_name='productimage',
            name='media_type',
            field=models.CharField(choices=[('image', 'Image'), ('video', 'Vidéo')], default='image', max_length=10),
        ),
        migrations.AddField(
            model_name='productimage',
            name='video_url',
            field=models.URLField(blank=True, help_text='URL de la vidéo (YouTube, Vimeo)', max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='productimage',
            name='image',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='image'),
        ),
    ]