-- SQL to clean up obsolete roles
-- We keep only the core system roles
DELETE FROM "role_permissions" 
WHERE "role" NOT IN ('super_admin', 'admin', 'user');

-- Optional: Update users who had those roles back to a temporary role or admin
-- This prevents them from having undefined roles
UPDATE "users" 
SET "role" = 'admin' 
WHERE "role" NOT IN ('super_admin', 'admin', 'user') 
AND "role" != 'user';
