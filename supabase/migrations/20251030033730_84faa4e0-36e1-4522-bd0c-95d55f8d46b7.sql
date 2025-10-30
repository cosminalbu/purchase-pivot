-- Create a function to search purchase orders across local and foreign table fields
CREATE OR REPLACE FUNCTION search_purchase_orders(
  search_text TEXT,
  status_filter TEXT DEFAULT NULL,
  supplier_filter UUID DEFAULT NULL,
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  po_number TEXT,
  supplier_id UUID,
  subtotal NUMERIC,
  tax_amount NUMERIC,
  total_amount NUMERIC,
  status purchase_order_status,
  order_date DATE,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  supplier_company_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    po.id,
    po.po_number,
    po.supplier_id,
    po.subtotal,
    po.tax_amount,
    po.total_amount,
    po.status,
    po.order_date,
    po.delivery_date,
    po.notes,
    po.created_at,
    po.updated_at,
    s.company_name as supplier_company_name
  FROM purchase_orders po
  INNER JOIN suppliers s ON po.supplier_id = s.id
  WHERE 
    -- Search filter: match PO number, notes, OR supplier name
    (
      search_text IS NULL 
      OR search_text = '' 
      OR po.po_number ILIKE '%' || search_text || '%'
      OR po.notes ILIKE '%' || search_text || '%'
      OR s.company_name ILIKE '%' || search_text || '%'
    )
    -- Status filter
    AND (status_filter IS NULL OR status_filter = '' OR po.status::TEXT = status_filter)
    -- Supplier filter
    AND (supplier_filter IS NULL OR po.supplier_id = supplier_filter)
  ORDER BY po.created_at DESC
  OFFSET page_offset
  LIMIT page_limit;
END;
$$;