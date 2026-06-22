from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_add_product_models'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model_type', models.CharField(choices=[('numeric', 'Numérique'), ('alpha', 'Alphabétique')], max_length=10)),
                ('model_value', models.CharField(max_length=50)),
                ('display_order', models.PositiveIntegerField(default=0)),
                ('product', models.ForeignKey(on_delete=models.CASCADE, related_name='models', to='products.product')),
            ],
            options={
                'db_table': 'product_models',
                'ordering': ['display_order', 'model_value'],
                'unique_together': {('product', 'model_value')},
            },
        ),
    ]