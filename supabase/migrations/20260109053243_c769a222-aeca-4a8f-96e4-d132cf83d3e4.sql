-- Fix: Add authentication and authorization checks to search_purchase_orders function
-- This prevents unauthorized access by ensuring only authenticated, active, non-pending users can search

CREATE OR REPLACE FUNCTION public.search_purchase_orders(
  search_text text, 
  status_filter text DEFAULT NULL::text, 
  supplier_filter uuid DEFAULT NULL::uuid, 
  page_offset integer DEFAULT 0, 
  page_limit integer DEFAULT 20
)
RETURNS TABLE(
  id uuid, 
  po_number text, 
  supplier_id uuid, 
  subtotal numeric, 
  tax_amount numeric, 
  total_amount numeric, 
  status purchase_order_status, 
  order_date date, 
  delivery_date date, 
  notes text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  supplier_company_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Verify user has appropriate role and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND role <> 'pending' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: insufficient permissions';
  END IF;

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
$function$;