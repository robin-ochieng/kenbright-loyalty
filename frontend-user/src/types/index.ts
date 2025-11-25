export interface Member {
  member_id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  national_id?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  physical_address?: string;
  postal_address?: string;
  city?: string;
  country?: string;
  employment_status?: string;
  employer_name?: string;
  occupation?: string;
  avatar_url?: string;
}

export interface LoyaltyTransaction {
  ledger_id: number;
  member_id: number;
  points_earned: number;
  points_redeemed: number;
  cumulative_balance: number;
  transaction_type: string;
  transaction_date: string;
  description?: string; // Optional, if we join with other tables later
}

export interface Reward {
  reward_id: number;
  reward_name: string;
  points_cost: number;
  description: string;
  is_active: boolean;
}

export interface Redemption {
  redemption_id: number;
  member_id: number;
  reward_id: number;
  points_spent: number;
  redemption_date: string;
  status: 'Requested' | 'Processing' | 'Fulfilled' | 'Cancelled';
  reward?: Reward; // For joining
}

// Product Types
export interface Product {
  product_id: number;
  product_name: string;
  product_category: 'CORE' | 'OPTIONAL';
  points_calculation_ratio: number;
  requires_kyc: boolean;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface MemberProduct {
  id: number;
  member_id: number;
  product_id: number;
  policy_number?: string;
  status: 'Active' | 'Expired' | 'Lapsed';
  unique_reference?: string;
  created_at: string;
  // Joined data
  product?: Product;
}

// Dependent Types
export interface Dependent {
  dependent_id: number;
  member_id: number;
  full_name: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling';
  date_of_birth?: string;
  created_at: string;
}

export interface DependentFormData {
  full_name: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling';
  date_of_birth?: string;
}

// Asset Types
export type AssetType = 'Vehicle' | 'Home' | 'Personal Office';

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  registration_number: string;
  color?: string;
  estimated_value?: number;
}

export interface HomeDetails {
  property_type: 'House' | 'Apartment' | 'Townhouse' | 'Other';
  location: string;
  bedrooms?: number;
  estimated_value?: number;
  is_owned: boolean;
}

export interface OfficeDetails {
  business_name?: string;
  location: string;
  office_type: 'Owned' | 'Rented';
  estimated_value?: number;
}

export interface Asset {
  asset_id: number;
  member_id: number;
  asset_type: AssetType;
  details: VehicleDetails | HomeDetails | OfficeDetails;
  created_at: string;
}

export interface AssetFormData {
  asset_type: AssetType;
  details: VehicleDetails | HomeDetails | OfficeDetails;
}

