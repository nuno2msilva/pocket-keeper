-- Initial database schema for Expense Tracker
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE app_role AS ENUM ('user', 'admin');

-- Sync status enum
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'conflict');

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMPTZ,
    community_opted_in BOOLEAN DEFAULT FALSE
);

-- ===========================================
-- USER ROLES TABLE (separate for security)
-- ===========================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- ===========================================
-- REFRESH TOKENS TABLE
-- ===========================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE
);

-- ===========================================
-- USER CATEGORIES (local to each user)
-- ===========================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status sync_status DEFAULT 'synced',
    local_id VARCHAR(100),
    UNIQUE(user_id, name)
);

-- ===========================================
-- USER SUBCATEGORIES
-- ===========================================
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status sync_status DEFAULT 'synced',
    local_id VARCHAR(100)
);

-- ===========================================
-- COMMUNITY PRODUCTS (shared, opt-in)
-- ===========================================
CREATE TABLE community_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    category_hint VARCHAR(100),
    trust_score INTEGER DEFAULT 50,
    contribution_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- COMMUNITY MERCHANTS (shared, opt-in)
-- ===========================================
CREATE TABLE community_merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    nif VARCHAR(20),
    address TEXT,
    trust_score INTEGER DEFAULT 50,
    contribution_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, nif)
);

-- ===========================================
-- USER PRODUCTS (personal product data)
-- ===========================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_product_id UUID REFERENCES community_products(id),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    default_price DECIMAL(10, 2) DEFAULT 0,
    barcode VARCHAR(100),
    exclude_from_price_history BOOLEAN DEFAULT FALSE,
    is_solidified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status sync_status DEFAULT 'synced',
    local_id VARCHAR(100)
);

-- ===========================================
-- USER MERCHANTS (personal merchant data)
-- ===========================================
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_merchant_id UUID REFERENCES community_merchants(id),
    name VARCHAR(255) NOT NULL,
    nif VARCHAR(20),
    address TEXT,
    is_solidified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status sync_status DEFAULT 'synced',
    local_id VARCHAR(100)
);

-- ===========================================
-- RECEIPTS
-- ===========================================
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME,
    receipt_number VARCHAR(100),
    customer_nif VARCHAR(20),
    has_customer_nif BOOLEAN DEFAULT FALSE,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    encrypted_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status sync_status DEFAULT 'synced',
    local_id VARCHAR(100)
);

-- ===========================================
-- RECEIPT ITEMS
-- ===========================================
CREATE TABLE receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    exclude_from_price_history BOOLEAN DEFAULT FALSE,
    local_id VARCHAR(100)
);

-- ===========================================
-- OFFLINE SYNC QUEUE
-- ===========================================
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

-- ===========================================
-- INDEXES for performance
-- ===========================================
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_subcategories_user ON subcategories(user_id);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_merchants_user ON merchants(user_id);
CREATE INDEX idx_merchants_nif ON merchants(nif);
CREATE INDEX idx_receipts_user ON receipts(user_id);
CREATE INDEX idx_receipts_date ON receipts(date);
CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_unprocessed ON sync_queue(user_id) WHERE processed_at IS NULL;
CREATE INDEX idx_community_products_barcode ON community_products(barcode);
CREATE INDEX idx_community_merchants_nif ON community_merchants(nif);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if user has role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_products_updated_at BEFORE UPDATE ON community_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_merchants_updated_at BEFORE UPDATE ON community_merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
