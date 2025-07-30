-- Enable real-time functionality for supplier_contacts table
ALTER TABLE public.supplier_contacts REPLICA IDENTITY FULL;

-- Add supplier_contacts table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_contacts;

-- Enable real-time functionality for suppliers table  
ALTER TABLE public.suppliers REPLICA IDENTITY FULL;

-- Add suppliers table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;