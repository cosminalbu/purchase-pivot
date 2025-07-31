-- Manual fix: Set Robyn as admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'robyng@mtmaluminium.com.au';

-- Fix RLS policies: Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON profiles 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin');