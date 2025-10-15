-- =============================================
-- KENBRIGHT 360 DATABASE SCHEMA
-- =============================================

-- Members table with comprehensive KYC
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    
    -- KYC Contact Information
    physical_address TEXT,
    postal_address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Kenya',
    
    -- KYC Employment Information
    employment_status VARCHAR(50),
    employer_name VARCHAR(255),
    occupation VARCHAR(100),
    
    -- Loyalty Program Fields
    tier VARCHAR(20) DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    referral_code VARCHAR(50) UNIQUE,
    referred_by_member_id INTEGER REFERENCES members(member_id),
    
    -- Social Authentication
    auth_provider VARCHAR(20) DEFAULT 'email',
    social_provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Products Catalog
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) UNIQUE NOT NULL,
    product_category VARCHAR(20) NOT NULL CHECK (product_category IN ('Core', 'Optional')),
    points_calculation_ratio INTEGER NOT NULL,
    requires_kyc BOOLEAN DEFAULT TRUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member-Product Relationships
CREATE TABLE member_products (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    policy_number VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Lapsed')),
    unique_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, product_id)
);

-- Payment Transactions
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(member_id),
    product_id INTEGER REFERENCES products(product_id),
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paybill_number VARCHAR(20),
    unique_reference_used VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Suspense' CHECK (status IN ('Matched', 'Suspense')),
    partner_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Points Ledger
CREATE TABLE loyalty_ledger (
    ledger_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(payment_id),
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    cumulative_balance INTEGER NOT NULL,
    transaction_type VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rewards Catalog
CREATE TABLE rewards_catalog (
    reward_id SERIAL PRIMARY KEY,
    reward_name VARCHAR(255) NOT NULL,
    points_cost INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Points Redemptions
CREATE TABLE points_redemptions (
    redemption_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    reward_id INTEGER NOT NULL REFERENCES rewards_catalog(reward_id),
    points_spent INTEGER NOT NULL,
    redemption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Requested' CHECK (status IN ('Requested', 'Processing', 'Fulfilled', 'Cancelled'))
);

-- Customer Assets (for cross-selling)
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('Vehicle', 'Home', 'Personal Office')),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family Dependents
CREATE TABLE dependents (
    dependent_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(20) NOT NULL CHECK (relationship IN ('Spouse', 'Child', 'Parent', 'Sibling')),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Logins
CREATE TABLE social_logins (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_members_phone ON members(phone_number);
CREATE INDEX idx_members_email ON members(email_address);
CREATE INDEX idx_members_tier ON members(tier);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(unique_reference_used);
CREATE INDEX idx_ledger_member ON loyalty_ledger(member_id);
CREATE INDEX idx_ledger_date ON loyalty_ledger(transaction_date);

-- Insert initial products data
INSERT INTO products (product_name, product_category, points_calculation_ratio, requires_kyc) VALUES
-- Core Products
('Motor Insurance', 'Core', 100, true),
('Medical Insurance', 'Core', 100, true),
('Home Insurance', 'Core', 100, true),
('Pension (KIPF)', 'Core', 1000, true),
('Wekapesa', 'Core', 1000, true),
-- Optional Products
('Travel Insurance', 'Optional', 100, true),
('Personal Accident', 'Optional', 100, true),
('Pet Insurance', 'Optional', 100, true),
('Income Protection', 'Optional', 100, true),
('Home Office Insurance', 'Optional', 100, true);

-- Insert sample rewards
INSERT INTO rewards_catalog (reward_name, points_cost, description) VALUES
('10% Off Motor Insurance Renewal', 1000, 'Get 10% discount on your next motor insurance renewal'),
('15% Off Home Insurance', 1500, '15% discount on home insurance purchase'),
('Free Travel Insurance', 2000, 'Complimentary travel insurance for one trip'),
('Insurance Premium Waiver', 5000, 'Waive one month of insurance premiums'),
('Gift Voucher - KES 500', 500, 'KES 500 shopping voucher');

SELECT '✅ Kenbright 360 database schema created successfully!' as message;