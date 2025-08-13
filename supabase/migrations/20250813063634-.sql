-- Tighten activity_logs RLS to prevent exposure of profile PII while preserving existing functionality for non-admin users.
-- 1) Remove broad policy that allowed all active users to view all logs
DROP POLICY IF EXISTS "Active users can view activity logs" ON public.activity_logs;

-- 2) Allow admins to view all activity logs (unchanged capability)
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'admin');

-- 3) Allow active non-pending users to view only non-sensitive logs
--    i.e., exclude logs related to user/profile data
CREATE POLICY "Active users can view non-sensitive activity logs"
ON public.activity_logs
FOR SELECT
USING (
  public.get_user_role(auth.uid()) <> 'pending'
  AND (entity_type IS NULL OR entity_type NOT IN ('user','profiles'))
);

-- 4) Allow users to view their own profile-related logs (self visibility)
CREATE POLICY "Users can view their own profile logs"
ON public.activity_logs
FOR SELECT
USING (
  (entity_type IN ('user','profiles'))
  AND (entity_id = auth.uid() OR user_id = auth.uid())
);
