-- =====================================================
-- SQL Script: Create Member Profile for Existing User
-- Run this in your Supabase SQL Editor
-- =====================================================

-- This script creates a member profile for robinochieng73@gmail.com
-- who has an auth account but no member record

INSERT INTO members (
  user_id,
  email_address,
  first_name,
  last_name,
  phone_number,
  national_id,
  date_of_birth,
  gender,
  tier,
  referral_code,
  country,
  city,
  email_verified,
  created_at
)
SELECT 
  id as user_id,
  email as email_address,
  COALESCE(raw_user_meta_data->>'first_name', 'Robin') as first_name,
  COALESCE(raw_user_meta_data->>'last_name', 'Ochieng') as last_name,
  COALESCE(raw_user_meta_data->>'phone_number', '+254700000000') as phone_number,
  COALESCE(raw_user_meta_data->>'national_id', 'PENDING') as national_id,
  '1990-01-01' as date_of_birth,
  'Male' as gender,
  'BRONZE' as tier,
  'ROBI' || floor(random() * 10000)::text as referral_code,
  'Kenya' as country,
  'Nairobi' as city,
  email_confirmed_at IS NOT NULL as email_verified,
  NOW() as created_at
FROM auth.users
WHERE email = 'robinochieng73@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM members WHERE email_address = 'robinochieng73@gmail.com'
  );

-- Verify the member was created
SELECT * FROM members WHERE email_address = 'robinochieng73@gmail.com';
