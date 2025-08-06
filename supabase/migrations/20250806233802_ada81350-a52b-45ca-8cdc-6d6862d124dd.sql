-- Add is_heading column to purchase_order_line_items table
ALTER TABLE public.purchase_order_line_items 
ADD COLUMN is_heading boolean NOT NULL DEFAULT false;