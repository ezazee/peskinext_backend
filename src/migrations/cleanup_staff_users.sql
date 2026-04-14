-- SQL to cleanup staff/admin accounts
-- This will delete all staff accounts EXCEPT the target superadmin
-- Customers (role = 'user') will NOT be touched.

DELETE FROM "users" 
WHERE "role" != 'user' 
AND "email" != 'superadmin@peskinpro.id';

-- Ensure the superadmin account exists or is correct
-- If it doesn't exist, you might need to create it manually or via seeder.
