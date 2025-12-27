-- ============================================================================
-- Pocket Keeper Database Schema
-- PostgreSQL 15+
-- ============================================================================

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS receipt_items CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ============================================================================
-- CATEGORIES
-- Main spending categories (e.g., "Groceries", "Dining", "Transport")
-- ============================================================================
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '📦',
    color VARCHAR(30) NOT NULL DEFAULT 'hsl(0, 0%, 50%)',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS 'Main spending categories for organizing products';
COMMENT ON COLUMN categories.icon IS 'Emoji icon for visual identification';
COMMENT ON COLUMN categories.color IS 'HSL color string for charts and UI';
COMMENT ON COLUMN categories.is_default IS 'System categories cannot be deleted';

-- ============================================================================
-- SUBCATEGORIES
-- Subcategories belong to a parent category (e.g., "Dairy" under "Groceries")
-- ============================================================================
CREATE TABLE subcategories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE subcategories IS 'Optional subcategories for finer product grouping';

CREATE INDEX idx_subcategories_parent ON subcategories(parent_category_id);

-- ============================================================================
-- MERCHANTS (Stores)
-- Stores or businesses where purchases are made
-- ============================================================================
CREATE TABLE merchants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    nif VARCHAR(20),                    -- Portuguese tax number (NIF)
    address TEXT,
    is_solidified BOOLEAN DEFAULT FALSE, -- Confirmed by user vs auto-created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE merchants IS 'Stores and businesses where purchases are made';
COMMENT ON COLUMN merchants.nif IS 'Portuguese tax identification number';
COMMENT ON COLUMN merchants.is_solidified IS 'True if user confirmed this merchant';

CREATE INDEX idx_merchants_name ON merchants(name);
CREATE INDEX idx_merchants_nif ON merchants(nif);

-- ============================================================================
-- PRODUCTS
-- Items that can be purchased
-- ============================================================================
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id VARCHAR(50) REFERENCES subcategories(id) ON DELETE SET NULL,
    default_price DECIMAL(10, 2),
    is_weighted BOOLEAN DEFAULT FALSE,           -- Sold by weight (kg) vs unit
    exclude_from_price_history BOOLEAN DEFAULT FALSE,
    is_solidified BOOLEAN DEFAULT FALSE,         -- Confirmed by user
    barcode VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE products IS 'Products that can be purchased';
COMMENT ON COLUMN products.is_weighted IS 'True for products sold by weight';
COMMENT ON COLUMN products.exclude_from_price_history IS 'Skip price tracking for this product';

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name));

-- ============================================================================
-- PRICE HISTORY
-- Tracks product prices over time at different merchants
-- ============================================================================
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    merchant_id VARCHAR(50) REFERENCES merchants(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE price_history IS 'Historical price records for products';

CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_merchant ON price_history(merchant_id);
CREATE INDEX idx_price_history_date ON price_history(date DESC);

-- ============================================================================
-- RECEIPTS
-- Complete receipts from store visits
-- ============================================================================
CREATE TABLE receipts (
    id VARCHAR(50) PRIMARY KEY,
    merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    time TIME,
    receipt_number VARCHAR(100),         -- Store's receipt number
    customer_nif VARCHAR(20),            -- Customer's tax number (if requested)
    has_customer_nif BOOLEAN DEFAULT FALSE,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE receipts IS 'Complete receipts from store visits';
COMMENT ON COLUMN receipts.customer_nif IS 'Customer tax number if requested on receipt';

CREATE INDEX idx_receipts_date ON receipts(date DESC);
CREATE INDEX idx_receipts_merchant ON receipts(merchant_id);
CREATE INDEX idx_receipts_month ON receipts(date_trunc('month', date));

-- ============================================================================
-- RECEIPT ITEMS
-- Individual line items on a receipt
-- ============================================================================
CREATE TABLE receipt_items (
    id VARCHAR(50) PRIMARY KEY,
    receipt_id VARCHAR(50) NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(300) NOT NULL,  -- Stored at time of purchase
    quantity DECIMAL(10, 3) NOT NULL,    -- Supports fractional quantities (kg)
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    exclude_from_price_history BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE receipt_items IS 'Individual line items on receipts';
COMMENT ON COLUMN receipt_items.product_name IS 'Product name at time of purchase';

CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product ON receipt_items(product_id);

-- ============================================================================
-- TRIGGERS
-- Auto-update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_categories_updated
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_merchants_updated
    BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_products_updated
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_receipts_updated
    BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA - Default Categories
-- ============================================================================

INSERT INTO categories (id, name, icon, color, is_default) VALUES
    ('cat-groceries', 'Groceries', '🛒', 'hsl(152, 55%, 45%)', TRUE),
    ('cat-dining', 'Dining', '🍽️', 'hsl(15, 75%, 55%)', TRUE),
    ('cat-transport', 'Transport', '🚗', 'hsl(38, 85%, 50%)', TRUE),
    ('cat-shopping', 'Shopping', '🛍️', 'hsl(280, 55%, 55%)', TRUE),
    ('cat-health', 'Health', '💊', 'hsl(200, 70%, 50%)', TRUE),
    ('cat-utilities', 'Utilities', '💡', 'hsl(220, 60%, 55%)', TRUE),
    ('cat-entertainment', 'Entertainment', '🎬', 'hsl(340, 65%, 55%)', TRUE),
    ('cat-other', 'Other', '📦', 'hsl(0, 0%, 50%)', TRUE);

-- ============================================================================
-- SEED DATA - Default Subcategories
-- ============================================================================

INSERT INTO subcategories (id, name, parent_category_id) VALUES
    -- Groceries
    ('subcat-dairy', 'Dairy', 'cat-groceries'),
    ('subcat-bakery', 'Bakery', 'cat-groceries'),
    ('subcat-meat', 'Meat & Fish', 'cat-groceries'),
    ('subcat-produce', 'Fruits & Vegetables', 'cat-groceries'),
    ('subcat-frozen', 'Frozen', 'cat-groceries'),
    ('subcat-beverages', 'Beverages', 'cat-groceries'),
    -- Dining
    ('subcat-fastfood', 'Fast Food', 'cat-dining'),
    ('subcat-restaurants', 'Restaurants', 'cat-dining'),
    ('subcat-cafes', 'Cafés', 'cat-dining'),
    -- Transport
    ('subcat-fuel', 'Fuel', 'cat-transport'),
    ('subcat-publictransport', 'Public Transport', 'cat-transport'),
    ('subcat-parking', 'Parking', 'cat-transport'),
    -- Shopping
    ('subcat-clothing', 'Clothing', 'cat-shopping'),
    ('subcat-electronics', 'Electronics', 'cat-shopping'),
    ('subcat-home', 'Home & Garden', 'cat-shopping');

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- Monthly spending summary
CREATE OR REPLACE VIEW v_monthly_spending AS
SELECT 
    TO_CHAR(date, 'YYYY-MM') AS month,
    COUNT(*) AS receipt_count,
    SUM(total) AS total_spent,
    AVG(total) AS avg_receipt
FROM receipts
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC;

-- Category spending breakdown
CREATE OR REPLACE VIEW v_category_spending AS
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    c.icon AS category_icon,
    c.color AS category_color,
    COALESCE(SUM(ri.total), 0) AS total_spent,
    COUNT(DISTINCT ri.id) AS item_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
LEFT JOIN receipt_items ri ON ri.product_id = p.id
GROUP BY c.id, c.name, c.icon, c.color
ORDER BY total_spent DESC;

-- Merchant statistics
CREATE OR REPLACE VIEW v_merchant_stats AS
SELECT 
    m.id AS merchant_id,
    m.name AS merchant_name,
    COUNT(r.id) AS receipt_count,
    COALESCE(SUM(r.total), 0) AS total_spent,
    MAX(r.date) AS last_visit,
    COALESCE(AVG(r.total), 0) AS avg_receipt
FROM merchants m
LEFT JOIN receipts r ON r.merchant_id = m.id
GROUP BY m.id, m.name
ORDER BY total_spent DESC;

-- Product price statistics
CREATE OR REPLACE VIEW v_product_prices AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    MIN(ph.price) AS min_price,
    MAX(ph.price) AS max_price,
    AVG(ph.price) AS avg_price,
    COUNT(ph.id) AS price_records
FROM products p
LEFT JOIN price_history ph ON ph.product_id = p.id
GROUP BY p.id, p.name;

-- ============================================================================
-- USEFUL FUNCTIONS
-- ============================================================================

-- Get spending for a specific month
CREATE OR REPLACE FUNCTION get_month_spending(target_month TEXT)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(total), 0)
        FROM receipts
        WHERE TO_CHAR(date, 'YYYY-MM') = target_month
    );
END;
$$ LANGUAGE plpgsql;

-- Get category breakdown for a month
CREATE OR REPLACE FUNCTION get_category_breakdown(target_month TEXT)
RETURNS TABLE (
    category_id VARCHAR,
    category_name VARCHAR,
    category_icon VARCHAR,
    category_color VARCHAR,
    total DECIMAL,
    percentage DECIMAL
) AS $$
DECLARE
    grand_total DECIMAL;
BEGIN
    grand_total := get_month_spending(target_month);
    
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(ri.total), 0)::DECIMAL AS total,
        CASE 
            WHEN grand_total > 0 THEN 
                (COALESCE(SUM(ri.total), 0) / grand_total * 100)::DECIMAL
            ELSE 0
        END AS percentage
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN receipt_items ri ON ri.product_id = p.id
    LEFT JOIN receipts r ON r.id = ri.receipt_id 
        AND TO_CHAR(r.date, 'YYYY-MM') = target_month
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS (adjust as needed)
-- ============================================================================

-- Example: Create app user with limited permissions
-- CREATE USER pocket_app WITH PASSWORD 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pocket_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pocket_app;
