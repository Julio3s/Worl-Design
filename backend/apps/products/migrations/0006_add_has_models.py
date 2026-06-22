from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_create_product_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='has_models',
            field=models.BooleanField(default=False, help_text='Afficher les modèles pour ce produit'),
        ),
    ]