-- Security Hardening Migration
-- 1) Helper function to check if a user is active
CREATE OR REPLACE FUNCTION public.get_user_is_active(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT is_active FROM public.profiles WHERE id = user_id;
$function$;

-- 2) Harden get_user_role with explicit search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$function$;

-- 3) Harden create_notification: only admins can create for others; others create for themselves
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_category text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  notification_id uuid;
  target_user_id uuid;
BEGIN
  IF public.get_user_role(auth.uid()) = 'admin' THEN
    target_user_id := COALESCE(p_user_id, auth.uid());
  ELSE
    target_user_id := auth.uid();
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, category, metadata)
  VALUES (target_user_id, p_title, p_message, p_type, p_category, COALESCE(p_metadata, '{}'::jsonb))
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$function$;

-- 4) Harden log_activity: enforce caller identity unless admin
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_description text,
  p_old_values jsonb DEFAULT NULL::jsonb,
  p_new_values jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  log_id uuid;
  effective_user_id uuid;
BEGIN
  IF public.get_user_role(auth.uid()) = 'admin' THEN
    effective_user_id := COALESCE(p_user_id, auth.uid());
  ELSE
    effective_user_id := auth.uid();
  END IF;

  INSERT INTO public.activity_logs (user_id, entity_type, entity_id, action, description, old_values, new_values)
  VALUES (effective_user_id, p_entity_type, p_entity_id, p_action, p_description, p_old_values, p_new_values)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$function$;

-- 5) Tighten RLS for notifications: block direct inserts; require active users for select/update
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id AND public.get_user_is_active(auth.uid()));

-- 6) Tighten RLS for activity_logs: block direct inserts; require active users for select
DROP POLICY IF EXISTS "System can create activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Active users can view activity logs" ON public.activity_logs;
CREATE POLICY "Active users can view activity logs"
ON public.activity_logs
FOR SELECT
USING (
  public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid())
);

-- 7) Prevent privilege escalation on profiles updates
-- Replace user self-update policy with safe variant
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile (safe fields only)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_user_role(auth.uid())
  AND is_active = public.get_user_is_active(auth.uid())
);

-- Require admins to be active to update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'admin' AND public.get_user_is_active(auth.uid()));

-- Ensure admin SELECT also requires active status
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'admin' AND public.get_user_is_active(auth.uid()));

-- Keep: Users can view their own profile (no is_active check so disabled users can see their status)
-- (No change to INSERT policy "Profiles are created during signup")

-- 8) Enforce active status across domain tables
-- purchase_orders policies
DROP POLICY IF EXISTS "Active users can view purchase orders" ON public.purchase_orders;
CREATE POLICY "Active users can view purchase orders"
ON public.purchase_orders
FOR SELECT
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can insert purchase orders" ON public.purchase_orders;
CREATE POLICY "Active users can insert purchase orders"
ON public.purchase_orders
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can update purchase orders" ON public.purchase_orders;
CREATE POLICY "Active users can update purchase orders"
ON public.purchase_orders
FOR UPDATE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can delete purchase orders" ON public.purchase_orders;
CREATE POLICY "Active users can delete purchase orders"
ON public.purchase_orders
FOR DELETE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

-- purchase_order_line_items policies
DROP POLICY IF EXISTS "Active users can view line items" ON public.purchase_order_line_items;
CREATE POLICY "Active users can view line items"
ON public.purchase_order_line_items
FOR SELECT
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can insert line items" ON public.purchase_order_line_items;
CREATE POLICY "Active users can insert line items"
ON public.purchase_order_line_items
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can update line items" ON public.purchase_order_line_items;
CREATE POLICY "Active users can update line items"
ON public.purchase_order_line_items
FOR UPDATE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can delete line items" ON public.purchase_order_line_items;
CREATE POLICY "Active users can delete line items"
ON public.purchase_order_line_items
FOR DELETE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

-- suppliers policies
DROP POLICY IF EXISTS "Active users can view suppliers" ON public.suppliers;
CREATE POLICY "Active users can view suppliers"
ON public.suppliers
FOR SELECT
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can insert suppliers" ON public.suppliers;
CREATE POLICY "Active users can insert suppliers"
ON public.suppliers
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can update suppliers" ON public.suppliers;
CREATE POLICY "Active users can update suppliers"
ON public.suppliers
FOR UPDATE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can delete suppliers" ON public.suppliers;
CREATE POLICY "Active users can delete suppliers"
ON public.suppliers
FOR DELETE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

-- supplier_contacts policies
DROP POLICY IF EXISTS "Active users can view supplier contacts" ON public.supplier_contacts;
CREATE POLICY "Active users can view supplier contacts"
ON public.supplier_contacts
FOR SELECT
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can insert supplier contacts" ON public.supplier_contacts;
CREATE POLICY "Active users can insert supplier contacts"
ON public.supplier_contacts
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can update supplier contacts" ON public.supplier_contacts;
CREATE POLICY "Active users can update supplier contacts"
ON public.supplier_contacts
FOR UPDATE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));

DROP POLICY IF EXISTS "Active users can delete supplier contacts" ON public.supplier_contacts;
CREATE POLICY "Active users can delete supplier contacts"
ON public.supplier_contacts
FOR DELETE
USING (public.get_user_role(auth.uid()) <> 'pending' AND public.get_user_is_active(auth.uid()));