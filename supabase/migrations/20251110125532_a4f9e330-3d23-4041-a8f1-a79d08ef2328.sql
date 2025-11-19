-- Add section field to banners table to group lunch/dinner menus
ALTER TABLE banners ADD COLUMN section text DEFAULT 'Lunch Menu';

-- Add comment for clarity
COMMENT ON COLUMN banners.section IS 'Section title like Lunch Menu, Dinner Menu, etc.';