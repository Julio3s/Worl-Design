from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Create product_models table and add has_models field to products'

    def handle(self, *args, **options):
        self.stdout.write('Setting up product models system...')
        
        with connection.cursor() as cursor:
            # Create product_models table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS product_models (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    model_type VARCHAR(10) NOT NULL CHECK (model_type IN ('numeric', 'alpha')),
                    model_value VARCHAR(50) NOT NULL,
                    display_order INTEGER NOT NULL DEFAULT 0,
                    UNIQUE(product_id, model_value)
                );
            """)
            self.stdout.write(self.style.SUCCESS('✓ product_models table created'))
            
            # Create index
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_product_models_product_id 
                ON product_models(product_id);
            """)
            self.stdout.write(self.style.SUCCESS('✓ Index created'))
            
            # Add has_models column to products table
            cursor.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'has_models'
                    ) THEN
                        ALTER TABLE products ADD COLUMN has_models BOOLEAN DEFAULT FALSE;
                    END IF;
                END $$;
            """)
            self.stdout.write(self.style.SUCCESS('✓ has_models column added to products'))
            
        self.stdout.write(self.style.SUCCESS('✓ Migration completed successfully!'))
        self.stdout.write('')
        self.stdout.write('Usage:')
        self.stdout.write('  1. In admin, edit a product')
        self.stdout.write('  2. Check "Afficher les modèles" to enable models')
        self.stdout.write('  3. Add models (numeric or alphabetic)')
        self.stdout.write('  4. Save - models will appear on product page')