from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Add model_type, model_start, model_end fields to products table'

    def handle(self, *args, **options):
        self.stdout.write('Adding model fields to products table...')
        
        with connection.cursor() as cursor:
            # Add model_type column
            cursor.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'model_type'
                    ) THEN
                        ALTER TABLE products 
                        ADD COLUMN model_type VARCHAR(10) DEFAULT 'none' 
                        CHECK (model_type IN ('none', 'numeric', 'alpha'));
                        self.stdout.write(self.style.SUCCESS('✓ Added model_type column'))
                    ELSE
                        self.stdout.write(self.style.WARNING('⊘ model_type column already exists'))
                    END IF;
                END $$;
            """)
            
            # Add model_start column
            cursor.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'model_start'
                    ) THEN
                        ALTER TABLE products ADD COLUMN model_start VARCHAR(3) DEFAULT NULL;
                        self.stdout.write(self.style.SUCCESS('✓ Added model_start column'))
                    ELSE
                        self.stdout.write(self.style.WARNING('⊘ model_start column already exists'))
                    END IF;
                END $$;
            """)
            
            # Add model_end column
            cursor.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'model_end'
                    ) THEN
                        ALTER TABLE products ADD COLUMN model_end VARCHAR(3) DEFAULT NULL;
                        self.stdout.write(self.style.SUCCESS('✓ Added model_end column'))
                    ELSE
                        self.stdout.write(self.style.WARNING('⊘ model_end column already exists'))
                    END IF;
                END $$;
            """)
            
            # Update existing products
            cursor.execute("""
                UPDATE products SET model_type = 'none' WHERE model_type IS NULL;
            """)
            
        self.stdout.write(self.style.SUCCESS('✓ Migration completed successfully!'))