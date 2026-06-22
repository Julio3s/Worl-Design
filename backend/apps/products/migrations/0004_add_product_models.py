from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_add_video_support'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='model_type',
            field=models.CharField(choices=[('none', 'Aucun modèle'), ('numeric', 'Numérique (1-100)'), ('alpha', 'Alphabétique (A-Z)')], default='none', help_text='Type de modèle pour les produits personnalisables', max_length=10),
        ),
        migrations.AddField(
            model_name='product',
            name='model_start',
            field=models.CharField(blank=True, help_text='Début de la plage (ex: 1 ou A)', max_length=3, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='model_end',
            field=models.CharField(blank=True, help_text='Fin de la plage (ex: 100 ou Z)', max_length=3, null=True),
        ),
    ]