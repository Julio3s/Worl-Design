from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Create product_models table for product variants'

    def handle(self, *args, **options):
        self.stdout.write('Creating product_models table...')
        
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
            
            # Create index for better performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_product_models_product_id 
                ON product_models(product_id);
            """)
            self.stdout.write(self.style.SUCCESS('✓ Index created'))
            
        self.stdout.write(self.style.SUCCESS('✓ Migration completed successfully!'))
        self.stdout.write('You can now add models to products via the admin interface.')