-- Add GST registration field to suppliers
ALTER TABLE suppliers 
ADD COLUMN is_gst_registered BOOLEAN NOT NULL DEFAULT true;