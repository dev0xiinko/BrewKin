-- Grant admin access to a user by email
-- Replace 'your-email@example.com' with the actual email address

UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, full_name, is_admin 
FROM profiles 
WHERE is_admin = true;
