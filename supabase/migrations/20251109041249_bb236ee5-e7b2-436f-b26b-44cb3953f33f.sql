-- Add detailed address fields and location coordinates to orders table
ALTER TABLE public.orders 
ADD COLUMN flat_no text,
ADD COLUMN apartment_street text,
ADD COLUMN sector text,
ADD COLUMN area text,
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;