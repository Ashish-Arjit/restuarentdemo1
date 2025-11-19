-- Add display_order to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;