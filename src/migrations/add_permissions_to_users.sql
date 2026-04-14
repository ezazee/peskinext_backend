-- Migration to add permissions column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "permissions" JSONB DEFAULT NULL;
