#!/usr/bin/env python
"""Django seed script to populate the database with demo data."""
import os
import sys
import django
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Category, Product
from apps.users.models import User

def seed_database():
    print("Starting database seeding...")
    
    # Create superuser
    User = get_user_model()
    if not User.objects.filter(email='admin@wdesign.com').exists():
        User.objects.create_superuser(
            email='admin@wdesign.com',
            username='admin',
            password='admin123',
            phone='+228XXXXXXXX',
        )
        print("✓ Superuser created: admin@wdesign.com")
    
    # Create categories
    categories_data = [
        {'name': 'Calendriers', 'slug': 'calendriers'},
        {'name': 'Boîtes à Stylos', 'slug': 'boites-stylos'},
        {'name': 'Supports', 'slug': 'supports'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        cat, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'slug': cat_data['slug']}
        )
        categories[cat_data['name']] = cat
        if created:
            print(f"✓ Category created: {cat_data['name']}")
    
    # Create products
    products_data = [
        {
            'name': 'Calendrier Personnalisé 2024',
            'slug': 'calendrier-2024',
            'description': 'Calendrier mural de haute qualité personnalisable avec votre logo',
            'price': 15000.00,
            'stock': 50,
            'category': 'Calendriers',
            'is_featured': True,
            'is_customizable': True,
            'customization_hint': 'Entrez votre texte personnalisé ici',
        },
        {
            'name': 'Boîte à Stylos Executive',
            'slug': 'boite-stylos-executive',
            'description': 'Élégante boîte à stylos en cuir noir avec intérieur doublé',
            'price': 8500.00,
            'stock': 100,
            'category': 'Boîtes à Stylos',
            'is_featured': True,
            'is_customizable': True,
            'customization_hint': 'Inscription du nom ou du logo',
        },
        {
            'name': 'Support de Téléphone',
            'slug': 'support-telephone',
            'description': 'Support de téléphone ergonomique en bois ou plastique',
            'price': 5000.00,
            'stock': 200,
            'category': 'Supports',
            'is_featured': False,
            'is_customizable': False,
        },
        {
            'name': 'Calendrier de Bureau 2025',
            'slug': 'calendrier-bureau-2025',
            'description': 'Petit calendrier pour le bureau avec support auto-adhésif',
            'price': 7500.00,
            'stock': 150,
            'category': 'Calendriers',
            'is_featured': True,
            'is_customizable': True,
            'customization_hint': 'Date de démarrage personnalisée',
        },
        {
            'name': 'Boîte à Stylos En Bambou',
            'slug': 'boite-stylos-bambou',
            'description': 'Boîte à stylos écologique en bambou durable',
            'price': 9500.00,
            'stock': 75,
            'category': 'Boîtes à Stylos',
            'is_featured': False,
            'is_customizable': True,
            'customization_hint': 'Gravure du nom disponible',
        },
        {
            'name': 'Support Tablette',
            'slug': 'support-tablette',
            'description': 'Support hauteur réglable pour tablette et iPad',
            'price': 12000.00,
            'stock': 60,
            'category': 'Supports',
            'is_featured': False,
            'is_customizable': False,
        },
    ]
    
    for prod_data in products_data:
        category = categories[prod_data.pop('category')]
        prod, created = Product.objects.get_or_create(
            slug=prod_data['slug'],
            defaults={**prod_data, 'category': category}
        )
        if created:
            print(f"✓ Product created: {prod_data['name']}")
    
    print("\n✅ Database seeding completed!")

if __name__ == '__main__':
    seed_database()
