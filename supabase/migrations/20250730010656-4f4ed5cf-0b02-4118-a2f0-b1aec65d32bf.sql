-- Update the first user to be email verified and confirmed
UPDATE auth.users 
SET email_confirmed_at = now(), 
    email_confirmed_at_default = now(),
    confirmed_at = now()
WHERE email = 'cosmin@helpdeskcomputers.com.au';