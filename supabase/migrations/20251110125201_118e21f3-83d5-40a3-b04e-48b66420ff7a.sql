-- Make image_url optional in banners table since we're making it text-only
ALTER TABLE banners ALTER COLUMN image_url DROP NOT NULL;