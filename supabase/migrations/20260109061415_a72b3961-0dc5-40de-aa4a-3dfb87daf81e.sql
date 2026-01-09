-- Fix: Add search_path to create_notification and log_activity functions
-- This prevents search path manipulation attacks in SECURITY DEFINER functions

-- Fix create_notification function - add search_path
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
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, category, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_category, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix log_activity function - add search_path
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
SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, entity_type, entity_id, action, description, old_values, new_values)
  VALUES (p_user_id, p_entity_type, p_entity_id, p_action, p_description, p_old_values, p_new_values)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;