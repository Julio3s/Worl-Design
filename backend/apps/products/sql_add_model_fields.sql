-- Add model fields to products table
-- Run this SQL directly on your database if migrations can't be applied

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS model_type VARCHAR(10) DEFAULT 'none' CHECK (model_type IN ('none', 'numeric', 'alpha')),
ADD COLUMN IF NOT EXISTS model_start VARCHAR(3) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS model_end VARCHAR(3) DEFAULT NULL;

-- Update existing products to have 'none' as default model_type
UPDATE products SET model_type = 'none' WHERE model_type IS NULL;