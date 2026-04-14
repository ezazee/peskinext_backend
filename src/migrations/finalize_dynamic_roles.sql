-- Migration for Dynamic Roles with Colors

-- 1. Alter users table: change role from ENUM to VARCHAR
-- Note: PostgreSQL requires some casting if it's already an ENUM
ALTER TABLE "users" ALTER COLUMN "role" TYPE VARCHAR(255);
DROP TYPE IF EXISTS "enum_users_role" CASCADE; -- Clean up the old enum type if it exists

-- 2. Update role_permissions table
ALTER TABLE "role_permissions" ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);
ALTER TABLE "role_permissions" ADD COLUMN IF NOT EXISTS "color" VARCHAR(50);

-- 3. Seed/Update standard roles with labels and colors
UPDATE "role_permissions" SET "name" = 'Super Admin', "color" = '#A855F7' WHERE "role" = 'super_admin';
UPDATE "role_permissions" SET "name" = 'Admin Utama', "color" = '#3B82F6' WHERE "role" = 'admin';
UPDATE "role_permissions" SET "name" = 'Staff Umum', "color" = '#22C55E' WHERE "role" = 'staff';
UPDATE "role_permissions" SET "name" = 'Staff Gudang', "color" = '#06B6D4' WHERE "role" = 'warehouse';
UPDATE "role_permissions" SET "name" = 'Customer Service', "color" = '#F97316' WHERE "role" = 'customer_service';
UPDATE "role_permissions" SET "name" = 'Keuangan', "color" = '#10B981' WHERE "role" = 'finance';
UPDATE "role_permissions" SET "name" = 'Manajemen', "color" = '#6366F1' WHERE "role" = 'management';
UPDATE "role_permissions" SET "name" = 'Afiliasi', "color" = '#EAB308' WHERE "role" = 'affiliate';
UPDATE "role_permissions" SET "name" = 'Penulis Konten', "color" = '#EC4899' WHERE "role" = 'writter';

-- Add 'user' role permissions entry if not exists
INSERT INTO "role_permissions" ("role", "name", "color", "permissions")
VALUES ('user', 'Pelanggan', '#6B7280', '[]')
ON CONFLICT ("role") DO UPDATE SET "name" = 'Pelanggan', "color" = '#6B7280';
