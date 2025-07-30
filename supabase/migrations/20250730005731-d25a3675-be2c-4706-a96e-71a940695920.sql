-- Add 'pending' to user_roles enum
ALTER TYPE user_roles ADD VALUE 'pending';

-- Update the handle_new_user function with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    'pending'::user_roles
  );
  RETURN NEW;
END;
$$;

-- Update RLS policies to restrict pending users
DROP POLICY IF EXISTS "Authenticated users can view all suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete suppliers" ON public.suppliers;

DROP POLICY IF EXISTS "Authenticated users can view all purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can insert purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can update purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can delete purchase orders" ON public.purchase_orders;

DROP POLICY IF EXISTS "Authenticated users can view all line items" ON public.purchase_order_line_items;
DROP POLICY IF EXISTS "Authenticated users can insert line items" ON public.purchase_order_line_items;
DROP POLICY IF EXISTS "Authenticated users can update line items" ON public.purchase_order_line_items;
DROP POLICY IF EXISTS "Authenticated users can delete line items" ON public.purchase_order_line_items;

DROP POLICY IF EXISTS "Authenticated users can view all supplier contacts" ON public.supplier_contacts;
DROP POLICY IF EXISTS "Authenticated users can insert supplier contacts" ON public.supplier_contacts;
DROP POLICY IF EXISTS "Authenticated users can update supplier contacts" ON public.supplier_contacts;
DROP POLICY IF EXISTS "Authenticated users can delete supplier contacts" ON public.supplier_contacts;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$$;

-- Create new RLS policies that exclude pending users
-- Suppliers policies
CREATE POLICY "Active users can view suppliers" ON public.suppliers
FOR SELECT USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can insert suppliers" ON public.suppliers
FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can update suppliers" ON public.suppliers
FOR UPDATE USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can delete suppliers" ON public.suppliers
FOR DELETE USING (public.get_user_role(auth.uid()) != 'pending');

-- Purchase orders policies
CREATE POLICY "Active users can view purchase orders" ON public.purchase_orders
FOR SELECT USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can insert purchase orders" ON public.purchase_orders
FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can update purchase orders" ON public.purchase_orders
FOR UPDATE USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can delete purchase orders" ON public.purchase_orders
FOR DELETE USING (public.get_user_role(auth.uid()) != 'pending');

-- Purchase order line items policies
CREATE POLICY "Active users can view line items" ON public.purchase_order_line_items
FOR SELECT USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can insert line items" ON public.purchase_order_line_items
FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can update line items" ON public.purchase_order_line_items
FOR UPDATE USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can delete line items" ON public.purchase_order_line_items
FOR DELETE USING (public.get_user_role(auth.uid()) != 'pending');

-- Supplier contacts policies
CREATE POLICY "Active users can view supplier contacts" ON public.supplier_contacts
FOR SELECT USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can insert supplier contacts" ON public.supplier_contacts
FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can update supplier contacts" ON public.supplier_contacts
FOR UPDATE USING (public.get_user_role(auth.uid()) != 'pending');

CREATE POLICY "Active users can delete supplier contacts" ON public.supplier_contacts
FOR DELETE USING (public.get_user_role(auth.uid()) != 'pending');