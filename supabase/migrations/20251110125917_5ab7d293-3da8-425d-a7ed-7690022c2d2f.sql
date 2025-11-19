-- Add is_vegetarian field to banners table
ALTER TABLE banners ADD COLUMN is_vegetarian boolean DEFAULT true;