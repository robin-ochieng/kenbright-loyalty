-- =============================================
-- KENBRIGHT 360 SAMPLE/SEED DATA FOR TESTING
-- =============================================
-- Run this after the schema.sql has been executed
-- NOTE: For members, you need to first create users in Supabase Auth,
-- then link them here using the user_id (UUID)
-- =============================================

-- =============================================
-- 1. PRODUCTS (if not already inserted)
-- =============================================
INSERT INTO products (product_name, product_category, points_calculation_ratio, requires_kyc, description, is_active) VALUES
-- Core Products
('Motor Insurance', 'CORE', 100, true, 'Comprehensive motor vehicle insurance covering third party liability, theft, and damage.', true),
('Medical Insurance', 'CORE', 100, true, 'Health insurance covering inpatient and outpatient services across Kenya.', true),
('Home Insurance', 'CORE', 100, true, 'Protect your home and contents against fire, theft, and natural disasters.', true),
('Pension (KIPF)', 'CORE', 1000, true, 'Kenya Individual Pension Fund for your retirement savings.', true),
('Wekapesa', 'CORE', 1000, true, 'Flexible savings plan with competitive interest rates.', true),
-- Optional Products
('Travel Insurance', 'OPTIONAL', 100, true, 'Coverage for medical emergencies, trip cancellation, and lost baggage while traveling.', true),
('Personal Accident', 'OPTIONAL', 100, true, 'Financial protection against accidental death or disability.', true),
('Pet Insurance', 'OPTIONAL', 100, true, 'Healthcare coverage for your beloved pets.', true),
('Income Protection', 'OPTIONAL', 100, true, 'Replaces your income if you cannot work due to illness or injury.', true),
('Home Office Insurance', 'OPTIONAL', 100, true, 'Coverage for home-based business equipment and liability.', true)
ON CONFLICT (product_name) DO NOTHING;

-- =============================================
-- 2. REWARDS CATALOG
-- =============================================
INSERT INTO rewards_catalog (reward_name, points_cost, description, is_active) VALUES
('10% Off Motor Insurance Renewal', 1000, 'Get 10% discount on your next motor insurance renewal', true),
('15% Off Home Insurance', 1500, '15% discount on home insurance purchase', true),
('Free Travel Insurance', 2000, 'Complimentary travel insurance for one trip (up to 14 days)', true),
('Insurance Premium Waiver', 5000, 'Waive one month of insurance premiums (max KES 5,000)', true),
('Gift Voucher - KES 500', 500, 'KES 500 shopping voucher redeemable at partner stores', true),
('Gift Voucher - KES 1000', 1000, 'KES 1,000 shopping voucher redeemable at partner stores', true),
('Free Medical Checkup', 3000, 'Complimentary comprehensive medical checkup at partner hospitals', true),
('Airport Lounge Access', 2500, 'One-time access to JKIA Premier Lounge', true),
('20% Off Pet Insurance', 800, '20% discount on new pet insurance policy', true),
('Family Movie Tickets', 1200, 'Four movie tickets at any Westgate Cinema', true),
('Spa Day Voucher', 4000, 'Full spa day experience at partner wellness centers', true),
('Fuel Voucher - KES 2000', 2000, 'KES 2,000 fuel voucher redeemable at Shell stations', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. SAMPLE MEMBERS
-- =============================================
-- NOTE: Replace the user_id UUIDs with actual Supabase Auth user IDs
-- You can get these from your Supabase Auth dashboard after creating users

-- First, let's create members WITHOUT user_id for testing purposes
-- In production, you would link these to actual auth.users

INSERT INTO members (
    user_id,
    national_id, phone_number, email_address, first_name, last_name,
    date_of_birth, gender, physical_address, postal_address, city, country,
    employment_status, employer_name, occupation, tier, referral_code, email_verified
) VALUES
-- Member 1: John Kamau (PLATINUM tier)
(
    (SELECT id FROM auth.users WHERE email = 'admin@kenbright.com' LIMIT 1),
    '12345678', '+254722100001', 'admin@kenbright.com', 'John', 'Kamau',
    '1985-03-15', 'Male', '123 Kenyatta Avenue, Westlands', 'P.O. Box 12345', 'Nairobi', 'Kenya',
    'Employed', 'Safaricom PLC', 'Software Engineer', 'PLATINUM', 'JOHN2024', true
),
-- Member 2: Mary Wanjiku (GOLD tier)
(
    NULL,
    '23456789', '+254722100002', 'mary.wanjiku@email.com', 'Mary', 'Wanjiku',
    '1990-07-22', 'Female', '456 Moi Avenue, CBD', 'P.O. Box 23456', 'Nairobi', 'Kenya',
    'Employed', 'KCB Bank', 'Branch Manager', 'GOLD', 'MARY2024', true
),
-- Member 3: Peter Ochieng (SILVER tier)
(
    NULL,
    '34567890', '+254722100003', 'peter.ochieng@email.com', 'Peter', 'Ochieng',
    '1988-11-08', 'Male', '789 Oginga Odinga Street', 'P.O. Box 34567', 'Kisumu', 'Kenya',
    'Self-Employed', 'Ochieng Enterprises', 'Business Owner', 'SILVER', 'PETER2024', true
),
-- Member 4: Grace Muthoni (BRONZE tier)
(
    NULL,
    '45678901', '+254722100004', 'grace.muthoni@email.com', 'Grace', 'Muthoni',
    '1995-02-14', 'Female', '101 Kimathi Street', 'P.O. Box 45678', 'Nakuru', 'Kenya',
    'Employed', 'Equity Bank', 'Customer Service', 'BRONZE', 'GRACE2024', true
),
-- Member 5: David Kipchoge (GOLD tier)
(
    NULL,
    '56789012', '+254722100005', 'david.kipchoge@email.com', 'David', 'Kipchoge',
    '1982-05-30', 'Male', '202 Eldoret Highway', 'P.O. Box 56789', 'Eldoret', 'Kenya',
    'Employed', 'Kenya Athletics', 'Professional Athlete', 'GOLD', 'DAVID2024', true
),
-- Member 6: Sarah Akinyi (SILVER tier)
(
    NULL,
    '67890123', '+254722100006', 'sarah.akinyi@email.com', 'Sarah', 'Akinyi',
    '1992-09-18', 'Female', '303 Nyerere Road', 'P.O. Box 67890', 'Mombasa', 'Kenya',
    'Employed', 'Kenya Ports Authority', 'Logistics Manager', 'SILVER', 'SARAH2024', true
),
-- Member 7: James Mwangi (PLATINUM tier)
(
    NULL,
    '78901234', '+254722100007', 'james.mwangi@email.com', 'James', 'Mwangi',
    '1975-12-25', 'Male', '404 State House Road', 'P.O. Box 78901', 'Nairobi', 'Kenya',
    'Self-Employed', 'Mwangi Investments', 'CEO', 'PLATINUM', 'JAMES2024', true
),
-- Member 8: Faith Chebet (BRONZE tier)
(
    NULL,
    '89012345', '+254722100008', 'faith.chebet@email.com', 'Faith', 'Chebet',
    '1998-04-10', 'Female', '505 University Way', 'P.O. Box 89012', 'Nairobi', 'Kenya',
    'Student', 'University of Nairobi', 'Student', 'BRONZE', 'FAITH2024', false
),
-- Member 9: Michael Otieno (SILVER tier)
(
    NULL,
    '90123456', '+254722100009', 'michael.otieno@email.com', 'Michael', 'Otieno',
    '1987-08-05', 'Male', '606 Thika Road', 'P.O. Box 90123', 'Nairobi', 'Kenya',
    'Employed', 'Nation Media Group', 'Journalist', 'SILVER', 'MICHAEL2024', true
),
-- Member 10: Lucy Njeri (GOLD tier)
(
    NULL,
    '01234567', '+254722100010', 'lucy.njeri@email.com', 'Lucy', 'Njeri',
    '1983-01-20', 'Female', '707 Karen Road', 'P.O. Box 01234', 'Nairobi', 'Kenya',
    'Self-Employed', 'Njeri Boutique', 'Fashion Designer', 'GOLD', 'LUCY2024', true
)
ON CONFLICT (email_address) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    tier = EXCLUDED.tier;

-- =============================================
-- 4. MEMBER PRODUCTS (Policy Assignments)
-- =============================================
INSERT INTO member_products (member_id, product_id, policy_number, status, unique_reference) VALUES
-- John Kamau (member_id = 1) - Multiple products
(1, 1, 'MOT-2024-001001', 'Active', 'KAA-123A'),
(1, 2, 'MED-2024-001001', 'Active', 'MED-JK-001'),
(1, 4, 'PEN-2024-001001', 'Active', 'KIPF-JK-001'),
(1, 6, 'TRV-2024-001001', 'Active', 'TRV-JK-001'),

-- Mary Wanjiku (member_id = 2)
(2, 1, 'MOT-2024-002001', 'Active', 'KBB-456B'),
(2, 2, 'MED-2024-002001', 'Active', 'MED-MW-001'),
(2, 3, 'HOM-2024-002001', 'Active', 'HOM-MW-001'),

-- Peter Ochieng (member_id = 3)
(3, 1, 'MOT-2024-003001', 'Active', 'KCC-789C'),
(3, 5, 'WKP-2024-003001', 'Active', 'WKP-PO-001'),

-- Grace Muthoni (member_id = 4)
(4, 2, 'MED-2024-004001', 'Active', 'MED-GM-001'),

-- David Kipchoge (member_id = 5)
(5, 1, 'MOT-2024-005001', 'Active', 'KDD-012D'),
(5, 2, 'MED-2024-005001', 'Active', 'MED-DK-001'),
(5, 7, 'PAC-2024-005001', 'Active', 'PAC-DK-001'),

-- Sarah Akinyi (member_id = 6)
(6, 1, 'MOT-2024-006001', 'Active', 'KMB-345E'),
(6, 3, 'HOM-2024-006001', 'Active', 'HOM-SA-001'),

-- James Mwangi (member_id = 7) - Premium customer with many products
(7, 1, 'MOT-2024-007001', 'Active', 'KNB-678F'),
(7, 2, 'MED-2024-007001', 'Active', 'MED-JM-001'),
(7, 3, 'HOM-2024-007001', 'Active', 'HOM-JM-001'),
(7, 4, 'PEN-2024-007001', 'Active', 'KIPF-JM-001'),
(7, 5, 'WKP-2024-007001', 'Active', 'WKP-JM-001'),
(7, 10, 'HOF-2024-007001', 'Active', 'HOF-JM-001'),

-- Faith Chebet (member_id = 8)
(8, 2, 'MED-2024-008001', 'Lapsed', 'MED-FC-001'),

-- Michael Otieno (member_id = 9)
(9, 1, 'MOT-2024-009001', 'Active', 'KOT-901G'),
(9, 2, 'MED-2024-009001', 'Expired', 'MED-MO-001'),

-- Lucy Njeri (member_id = 10)
(10, 1, 'MOT-2024-010001', 'Active', 'KNJ-234H'),
(10, 2, 'MED-2024-010001', 'Active', 'MED-LN-001'),
(10, 8, 'PET-2024-010001', 'Active', 'PET-LN-001')
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. PAYMENTS
-- =============================================
INSERT INTO payments (member_id, product_id, amount_paid, payment_date, paybill_number, unique_reference_used, status, partner_code) VALUES
-- John Kamau payments
(1, 1, 45000.00, '2024-01-15 10:30:00', '123456', 'KAA-123A', 'Matched', 'KB-MOT'),
(1, 2, 85000.00, '2024-01-20 14:15:00', '123456', 'MED-JK-001', 'Matched', 'KB-MED'),
(1, 4, 12000.00, '2024-02-01 09:00:00', '123456', 'KIPF-JK-001', 'Matched', 'KB-PEN'),
(1, 4, 12000.00, '2024-03-01 09:00:00', '123456', 'KIPF-JK-001', 'Matched', 'KB-PEN'),
(1, 4, 12000.00, '2024-04-01 09:00:00', '123456', 'KIPF-JK-001', 'Matched', 'KB-PEN'),
(1, 6, 5000.00, '2024-03-10 11:45:00', '123456', 'TRV-JK-001', 'Matched', 'KB-TRV'),

-- Mary Wanjiku payments
(2, 1, 38000.00, '2024-01-18 16:00:00', '123456', 'KBB-456B', 'Matched', 'KB-MOT'),
(2, 2, 65000.00, '2024-02-05 12:30:00', '123456', 'MED-MW-001', 'Matched', 'KB-MED'),
(2, 3, 25000.00, '2024-02-15 10:00:00', '123456', 'HOM-MW-001', 'Matched', 'KB-HOM'),

-- Peter Ochieng payments
(3, 1, 32000.00, '2024-02-01 08:45:00', '123456', 'KCC-789C', 'Matched', 'KB-MOT'),
(3, 5, 5000.00, '2024-02-15 14:00:00', '123456', 'WKP-PO-001', 'Matched', 'KB-WKP'),
(3, 5, 5000.00, '2024-03-15 14:00:00', '123456', 'WKP-PO-001', 'Matched', 'KB-WKP'),

-- Grace Muthoni payments
(4, 2, 35000.00, '2024-03-01 11:00:00', '123456', 'MED-GM-001', 'Matched', 'KB-MED'),

-- David Kipchoge payments
(5, 1, 55000.00, '2024-01-25 15:30:00', '123456', 'KDD-012D', 'Matched', 'KB-MOT'),
(5, 2, 120000.00, '2024-02-10 09:15:00', '123456', 'MED-DK-001', 'Matched', 'KB-MED'),
(5, 7, 15000.00, '2024-02-20 13:00:00', '123456', 'PAC-DK-001', 'Matched', 'KB-PAC'),

-- Sarah Akinyi payments
(6, 1, 42000.00, '2024-02-08 10:30:00', '123456', 'KMB-345E', 'Matched', 'KB-MOT'),
(6, 3, 30000.00, '2024-03-05 16:45:00', '123456', 'HOM-SA-001', 'Matched', 'KB-HOM'),

-- James Mwangi payments (High value customer)
(7, 1, 150000.00, '2024-01-10 08:00:00', '123456', 'KNB-678F', 'Matched', 'KB-MOT'),
(7, 2, 250000.00, '2024-01-15 10:00:00', '123456', 'MED-JM-001', 'Matched', 'KB-MED'),
(7, 3, 75000.00, '2024-01-20 12:00:00', '123456', 'HOM-JM-001', 'Matched', 'KB-HOM'),
(7, 4, 50000.00, '2024-02-01 09:00:00', '123456', 'KIPF-JM-001', 'Matched', 'KB-PEN'),
(7, 4, 50000.00, '2024-03-01 09:00:00', '123456', 'KIPF-JM-001', 'Matched', 'KB-PEN'),
(7, 5, 25000.00, '2024-02-15 14:30:00', '123456', 'WKP-JM-001', 'Matched', 'KB-WKP'),
(7, 10, 18000.00, '2024-03-01 11:00:00', '123456', 'HOF-JM-001', 'Matched', 'KB-HOF'),

-- Michael Otieno payments
(9, 1, 28000.00, '2024-03-10 09:30:00', '123456', 'KOT-901G', 'Matched', 'KB-MOT'),

-- Lucy Njeri payments
(10, 1, 48000.00, '2024-02-20 15:00:00', '123456', 'KNJ-234H', 'Matched', 'KB-MOT'),
(10, 2, 72000.00, '2024-02-25 11:30:00', '123456', 'MED-LN-001', 'Matched', 'KB-MED'),
(10, 8, 8000.00, '2024-03-15 14:00:00', '123456', 'PET-LN-001', 'Matched', 'KB-PET'),

-- Some suspense payments (unmatched)
(NULL, NULL, 15000.00, '2024-03-20 10:00:00', '123456', 'UNKNOWN-001', 'Suspense', NULL),
(NULL, NULL, 22500.00, '2024-03-22 14:30:00', '123456', 'UNKNOWN-002', 'Suspense', NULL);

-- =============================================
-- 6. LOYALTY LEDGER (Points Transactions)
-- =============================================
-- Points are calculated based on payment amount / points_calculation_ratio

INSERT INTO loyalty_ledger (member_id, payment_id, points_earned, points_redeemed, cumulative_balance, transaction_type, transaction_date) VALUES
-- John Kamau transactions
(1, 1, 450, 0, 450, 'Premium Payment', '2024-01-15 10:30:00'),
(1, 2, 850, 0, 1300, 'Premium Payment', '2024-01-20 14:15:00'),
(1, 3, 12, 0, 1312, 'Pension Contribution', '2024-02-01 09:00:00'),
(1, 4, 12, 0, 1324, 'Pension Contribution', '2024-03-01 09:00:00'),
(1, 5, 12, 0, 1336, 'Pension Contribution', '2024-04-01 09:00:00'),
(1, 6, 50, 0, 1386, 'Premium Payment', '2024-03-10 11:45:00'),
(1, NULL, 100, 0, 1486, 'Welcome Bonus', '2024-01-15 10:30:00'),
(1, NULL, 0, 500, 986, 'Reward Redemption', '2024-02-15 16:00:00'),

-- Mary Wanjiku transactions
(2, 7, 380, 0, 380, 'Premium Payment', '2024-01-18 16:00:00'),
(2, 8, 650, 0, 1030, 'Premium Payment', '2024-02-05 12:30:00'),
(2, 9, 250, 0, 1280, 'Premium Payment', '2024-02-15 10:00:00'),
(2, NULL, 100, 0, 1380, 'Welcome Bonus', '2024-01-18 16:00:00'),
(2, NULL, 200, 0, 1580, 'Referral Bonus', '2024-03-01 10:00:00'),

-- Peter Ochieng transactions
(3, 10, 320, 0, 320, 'Premium Payment', '2024-02-01 08:45:00'),
(3, 11, 5, 0, 325, 'Savings Contribution', '2024-02-15 14:00:00'),
(3, 12, 5, 0, 330, 'Savings Contribution', '2024-03-15 14:00:00'),
(3, NULL, 100, 0, 430, 'Welcome Bonus', '2024-02-01 08:45:00'),

-- Grace Muthoni transactions
(4, 13, 350, 0, 350, 'Premium Payment', '2024-03-01 11:00:00'),
(4, NULL, 100, 0, 450, 'Welcome Bonus', '2024-03-01 11:00:00'),

-- David Kipchoge transactions
(5, 14, 550, 0, 550, 'Premium Payment', '2024-01-25 15:30:00'),
(5, 15, 1200, 0, 1750, 'Premium Payment', '2024-02-10 09:15:00'),
(5, 16, 150, 0, 1900, 'Premium Payment', '2024-02-20 13:00:00'),
(5, NULL, 100, 0, 2000, 'Welcome Bonus', '2024-01-25 15:30:00'),
(5, NULL, 0, 1000, 1000, 'Reward Redemption', '2024-03-05 10:00:00'),

-- Sarah Akinyi transactions
(6, 17, 420, 0, 420, 'Premium Payment', '2024-02-08 10:30:00'),
(6, 18, 300, 0, 720, 'Premium Payment', '2024-03-05 16:45:00'),
(6, NULL, 100, 0, 820, 'Welcome Bonus', '2024-02-08 10:30:00'),

-- James Mwangi transactions (High value)
(7, 19, 1500, 0, 1500, 'Premium Payment', '2024-01-10 08:00:00'),
(7, 20, 2500, 0, 4000, 'Premium Payment', '2024-01-15 10:00:00'),
(7, 21, 750, 0, 4750, 'Premium Payment', '2024-01-20 12:00:00'),
(7, 22, 50, 0, 4800, 'Pension Contribution', '2024-02-01 09:00:00'),
(7, 23, 50, 0, 4850, 'Pension Contribution', '2024-03-01 09:00:00'),
(7, 24, 25, 0, 4875, 'Savings Contribution', '2024-02-15 14:30:00'),
(7, 25, 180, 0, 5055, 'Premium Payment', '2024-03-01 11:00:00'),
(7, NULL, 500, 0, 5555, 'Welcome Bonus', '2024-01-10 08:00:00'),
(7, NULL, 1000, 0, 6555, 'Tier Upgrade Bonus', '2024-02-01 00:00:00'),
(7, NULL, 0, 2000, 4555, 'Reward Redemption', '2024-03-10 14:00:00'),

-- Michael Otieno transactions
(9, 26, 280, 0, 280, 'Premium Payment', '2024-03-10 09:30:00'),
(9, NULL, 100, 0, 380, 'Welcome Bonus', '2024-03-10 09:30:00'),

-- Lucy Njeri transactions
(10, 27, 480, 0, 480, 'Premium Payment', '2024-02-20 15:00:00'),
(10, 28, 720, 0, 1200, 'Premium Payment', '2024-02-25 11:30:00'),
(10, 29, 80, 0, 1280, 'Premium Payment', '2024-03-15 14:00:00'),
(10, NULL, 100, 0, 1380, 'Welcome Bonus', '2024-02-20 15:00:00'),
(10, NULL, 0, 500, 880, 'Reward Redemption', '2024-03-20 11:00:00');

-- =============================================
-- 7. POINTS REDEMPTIONS
-- =============================================
INSERT INTO points_redemptions (member_id, reward_id, points_spent, redemption_date, status) VALUES
-- John Kamau redemption
(1, 5, 500, '2024-02-15 16:00:00', 'Fulfilled'),

-- David Kipchoge redemption
(5, 1, 1000, '2024-03-05 10:00:00', 'Fulfilled'),

-- James Mwangi redemption
(7, 3, 2000, '2024-03-10 14:00:00', 'Processing'),

-- Lucy Njeri redemption
(10, 5, 500, '2024-03-20 11:00:00', 'Fulfilled'),

-- Some pending redemptions
(2, 2, 1500, '2024-03-25 09:00:00', 'Requested'),
(3, 5, 500, '2024-03-26 10:30:00', 'Requested'),
(6, 9, 800, '2024-03-27 14:15:00', 'Processing');

-- =============================================
-- 8. DEPENDENTS
-- =============================================
INSERT INTO dependents (member_id, full_name, relationship, date_of_birth) VALUES
-- John Kamau's family
(1, 'Jane Kamau', 'Spouse', '1987-06-20'),
(1, 'Brian Kamau', 'Child', '2015-03-10'),
(1, 'Alice Kamau', 'Child', '2018-09-05'),

-- Mary Wanjiku's family
(2, 'Samuel Wanjiku', 'Spouse', '1988-04-15'),
(2, 'Diana Wanjiku', 'Child', '2019-11-22'),

-- David Kipchoge's family
(5, 'Grace Kipchoge', 'Spouse', '1984-08-12'),
(5, 'Joshua Kipchoge', 'Child', '2012-05-30'),
(5, 'Mercy Kipchoge', 'Child', '2016-02-14'),
(5, 'Elizabeth Kipchoge', 'Parent', '1955-01-10'),

-- James Mwangi's family
(7, 'Margaret Mwangi', 'Spouse', '1978-10-05'),
(7, 'Kevin Mwangi', 'Child', '2005-07-18'),
(7, 'Sharon Mwangi', 'Child', '2008-12-01'),
(7, 'Peter Mwangi', 'Parent', '1948-03-25'),
(7, 'Mary Mwangi', 'Parent', '1950-08-30'),

-- Lucy Njeri's family
(10, 'Thomas Njeri', 'Spouse', '1981-09-12'),
(10, 'Carol Njeri', 'Child', '2014-04-08'),

-- Sarah Akinyi's family
(6, 'Michael Akinyi', 'Spouse', '1990-02-28'),
(6, 'Joy Akinyi', 'Child', '2020-06-15');

-- =============================================
-- 9. ASSETS
-- =============================================
INSERT INTO assets (member_id, asset_type, details) VALUES
-- John Kamau's assets
(1, 'Vehicle', '{"make": "Toyota", "model": "Land Cruiser Prado", "year": 2022, "registration_number": "KAA 123A", "color": "White", "estimated_value": 8500000}'),
(1, 'Vehicle', '{"make": "Mercedes-Benz", "model": "C200", "year": 2020, "registration_number": "KAA 456B", "color": "Silver", "estimated_value": 5500000}'),
(1, 'Home', '{"address": "123 Kenyatta Avenue, Westlands", "property_type": "Apartment", "bedrooms": 3, "estimated_value": 15000000, "is_owned": true}'),

-- Mary Wanjiku's assets
(2, 'Vehicle', '{"make": "Honda", "model": "CR-V", "year": 2021, "registration_number": "KBB 456B", "color": "Blue", "estimated_value": 4200000}'),
(2, 'Home', '{"address": "456 Moi Avenue, CBD", "property_type": "Townhouse", "bedrooms": 4, "estimated_value": 25000000, "is_owned": true}'),

-- Peter Ochieng's assets
(3, 'Vehicle', '{"make": "Isuzu", "model": "D-Max", "year": 2019, "registration_number": "KCC 789C", "color": "Red", "estimated_value": 3500000}'),
(3, 'Personal Office', '{"address": "Business Center, Kisumu", "office_type": "Commercial Space", "square_meters": 50, "estimated_value": 2000000}'),

-- David Kipchoge's assets
(5, 'Vehicle', '{"make": "Range Rover", "model": "Sport", "year": 2023, "registration_number": "KDD 012D", "color": "Black", "estimated_value": 18000000}'),
(5, 'Home', '{"address": "Eldoret Premium Estate", "property_type": "Villa", "bedrooms": 5, "estimated_value": 45000000, "is_owned": true}'),

-- Sarah Akinyi's assets
(6, 'Vehicle', '{"make": "Mazda", "model": "CX-5", "year": 2020, "registration_number": "KMB 345E", "color": "Gray", "estimated_value": 3800000}'),
(6, 'Home', '{"address": "Nyali Beach Road, Mombasa", "property_type": "Bungalow", "bedrooms": 3, "estimated_value": 18000000, "is_owned": true}'),

-- James Mwangi's assets (High value)
(7, 'Vehicle', '{"make": "BMW", "model": "X7", "year": 2023, "registration_number": "KNB 678F", "color": "Black", "estimated_value": 22000000}'),
(7, 'Vehicle', '{"make": "Porsche", "model": "Cayenne", "year": 2022, "registration_number": "KNB 789G", "color": "White", "estimated_value": 19000000}'),
(7, 'Home', '{"address": "Karen Estate, Nairobi", "property_type": "Mansion", "bedrooms": 7, "estimated_value": 120000000, "is_owned": true}'),
(7, 'Home', '{"address": "Diani Beach, Coast", "property_type": "Beach House", "bedrooms": 4, "estimated_value": 35000000, "is_owned": true}'),
(7, 'Personal Office', '{"address": "Westlands Business Park", "office_type": "Corporate Office", "square_meters": 200, "estimated_value": 15000000}'),

-- Lucy Njeri's assets
(10, 'Vehicle', '{"make": "Volkswagen", "model": "Tiguan", "year": 2021, "registration_number": "KNJ 234H", "color": "Red", "estimated_value": 4500000}'),
(10, 'Personal Office', '{"address": "Karen Shopping Center", "office_type": "Retail Space", "square_meters": 80, "estimated_value": 8000000}');

-- =============================================
-- 10. REFERRAL RELATIONSHIPS
-- =============================================
-- Update some members to show referral relationships
UPDATE members SET referred_by_member_id = 1 WHERE member_id = 2; -- Mary referred by John
UPDATE members SET referred_by_member_id = 2 WHERE member_id = 4; -- Grace referred by Mary
UPDATE members SET referred_by_member_id = 7 WHERE member_id = 9; -- Michael referred by James
UPDATE members SET referred_by_member_id = 7 WHERE member_id = 10; -- Lucy referred by James

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the data was inserted correctly:

SELECT '✅ Seed data inserted successfully!' as status;

SELECT 'Members' as table_name, COUNT(*) as count FROM members
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Member Products', COUNT(*) FROM member_products
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Loyalty Ledger', COUNT(*) FROM loyalty_ledger
UNION ALL
SELECT 'Rewards Catalog', COUNT(*) FROM rewards_catalog
UNION ALL
SELECT 'Redemptions', COUNT(*) FROM points_redemptions
UNION ALL
SELECT 'Dependents', COUNT(*) FROM dependents
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets;

-- Show member summary with points
SELECT 
    m.first_name || ' ' || m.last_name as member_name,
    m.tier,
    m.email_address,
    COALESCE(
        (SELECT cumulative_balance FROM loyalty_ledger 
         WHERE member_id = m.member_id 
         ORDER BY transaction_date DESC LIMIT 1), 0
    ) as current_points,
    (SELECT COUNT(*) FROM member_products WHERE member_id = m.member_id) as products_count,
    (SELECT COUNT(*) FROM dependents WHERE member_id = m.member_id) as dependents_count,
    (SELECT COUNT(*) FROM assets WHERE member_id = m.member_id) as assets_count
FROM members m
ORDER BY m.tier DESC, member_name;
