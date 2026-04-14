-- Migration to create role_permissions table
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "role" VARCHAR(255) PRIMARY KEY,
    "permissions" JSONB DEFAULT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial permissions for common roles
INSERT INTO "role_permissions" ("role", "permissions")
VALUES 
    ('super_admin', '[]'), -- Super admin bypasses all checks anyway
    ('admin', '["/dashboard", "/products", "/category", "/orders", "/pos", "/invoices", "/coupons", "/promotions", "/reports", "/affiliate", "/articles", "/faq", "/users", "/notifications"]'),
    ('staff', '["/dashboard", "/products", "/products/inventory", "/orders", "/pos", "/products/reviews", "/notifications"]'),
    ('warehouse', '["/dashboard", "/products", "/products/inventory", "/orders", "/notifications"]'),
    ('customer_service', '["/dashboard", "/orders", "/products/reviews", "/faq", "/notifications"]'),
    ('finance', '["/dashboard", "/orders", "/invoices", "/coupons", "/reports", "/notifications"]'),
    ('management', '["/dashboard", "/orders", "/products", "/reports", "/notifications"]'),
    ('affiliate', '["/dashboard", "/affiliate", "/notifications"]'),
    ('writter', '["/dashboard", "/articles", "/faq", "/notifications"]')
ON CONFLICT ("role") DO NOTHING;
