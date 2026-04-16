-- Migration: Add Performance Indexes for Production
-- Target Tables: orders, products, order_items, reviews, product_variants, flash_sale_items

-- 1. Orders Table: Essential for fast dashboard and user order history
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 2. Products Table: Essential for fast storefront browsing and search
-- Note: Slug is already unique/indexed but indexing SKU and Category helps filters
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);

-- 3. Order Items Table: Speeds up joins for order detail and reports
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- 4. Reviews Table: Speeds up product page loading
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- 5. Product Variants Table: Speeds up pricing and stock checks
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- 6. Flash Sale Items: Critical for high-traffic sale events
CREATE INDEX IF NOT EXISTS idx_flash_sale_items_variant_id ON flash_sale_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_flash_sale_items_flash_sale_id ON flash_sale_items(flash_sale_id);
