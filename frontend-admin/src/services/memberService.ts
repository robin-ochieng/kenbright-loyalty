import { supabase } from './supabaseClient';

export interface Member {
  member_id: number;
  user_id?: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  referral_code?: string;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
  // KYC Fields
  national_id?: string;
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
  // Computed/joined fields
  points_balance?: number;
}

export interface CreateMemberData {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  national_id: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  physical_address?: string;
  postal_address?: string;
  city?: string;
  country?: string;
  employment_status?: string;
  employer_name?: string;
  occupation?: string;
  send_welcome_email?: boolean;
  temporary_password?: string;
}

export interface UpdateMemberData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  physical_address?: string;
  postal_address?: string;
  city?: string;
  country?: string;
  employment_status?: string;
  employer_name?: string;
  occupation?: string;
  email_verified?: boolean;
}

// Helper to generate referral code
const generateReferralCode = (firstName: string): string => {
  const randomNum = Math.floor(Math.random() * 10000);
  return `${firstName.toUpperCase().slice(0, 4)}${randomNum}`;
};

// Helper to generate temporary password
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const memberService = {
  /**
   * Get all members with optional points balance
   */
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get points balances for all members
    const membersWithPoints = await Promise.all(
      (data || []).map(async (member) => {
        const points = await this.getMemberPointsBalance(member.member_id);
        return { ...member, points_balance: points };
      })
    );
    
    return membersWithPoints as Member[];
  },

  /**
   * Get single member by ID
   */
  async getMemberById(id: number): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', id)
      .single();
    
    if (error) throw error;
    
    const points = await this.getMemberPointsBalance(id);
    return { ...data, points_balance: points } as Member;
  },

  /**
   * Get member's current points balance from ledger
   */
  async getMemberPointsBalance(memberId: number): Promise<number> {
    const { data, error } = await supabase
      .from('loyalty_ledger')
      .select('cumulative_balance')
      .eq('member_id', memberId)
      .order('transaction_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 0; // No rows found
      console.error('Error fetching points:', error);
      return 0;
    }
    return data?.cumulative_balance || 0;
  },

  /**
   * Create new member with Supabase Auth user
   * Note: This requires a Supabase Edge Function or service role access
   * For now, we create the member record and the user will set password via email
   */
  async createMember(memberData: CreateMemberData): Promise<Member> {
    const tempPassword = memberData.temporary_password || generateTempPassword();
    
    // First, create the auth user using Supabase Admin API
    // Note: This requires service role key - we'll use an edge function in production
    // For development, we create member first, then user signs up separately
    
    // Create member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email_address: memberData.email_address,
        phone_number: memberData.phone_number,
        national_id: memberData.national_id,
        date_of_birth: memberData.date_of_birth,
        gender: memberData.gender,
        tier: memberData.tier || 'BRONZE',
        physical_address: memberData.physical_address,
        postal_address: memberData.postal_address,
        city: memberData.city || 'Nairobi',
        country: memberData.country || 'Kenya',
        employment_status: memberData.employment_status,
        employer_name: memberData.employer_name,
        occupation: memberData.occupation,
        referral_code: generateReferralCode(memberData.first_name),
        email_verified: false,
      })
      .select()
      .single();

    if (memberError) {
      // Handle duplicate errors
      if (memberError.code === '23505') {
        if (memberError.message.includes('email')) {
          throw new Error('A member with this email already exists');
        }
        if (memberError.message.includes('phone')) {
          throw new Error('A member with this phone number already exists');
        }
        if (memberError.message.includes('national_id')) {
          throw new Error('A member with this National ID already exists');
        }
        throw new Error('A member with these details already exists');
      }
      throw memberError;
    }

    // If send_welcome_email is true, send password reset email
    if (memberData.send_welcome_email) {
      try {
        await this.sendPasswordResetEmail(memberData.email_address);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't throw - member was created successfully
      }
    }

    return member as Member;
  },

  /**
   * Update existing member
   */
  async updateMember(id: number, memberData: UpdateMemberData): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .update({
        ...memberData,
        updated_at: new Date().toISOString(),
      })
      .eq('member_id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Update failed: duplicate phone number or National ID');
      }
      throw error;
    }
    return data as Member;
  },

  /**
   * Update member's tier
   */
  async updateMemberTier(id: number, tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'): Promise<Member> {
    return this.updateMember(id, { tier });
  },

  /**
   * Delete member (soft delete recommended in production)
   */
  async deleteMember(id: number): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('member_id', id);
    
    if (error) throw error;
  },

  /**
   * Send password reset email to member
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  },

  /**
   * Search members by name, email, or phone
   */
  async searchMembers(query: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email_address.ilike.%${query}%,phone_number.ilike.%${query}%,national_id.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Member[];
  },

  /**
   * Get members by tier
   */
  async getMembersByTier(tier: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('tier', tier)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Member[];
  },

  /**
   * Get member statistics
   */
  async getMemberStats(): Promise<{
    total: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    verified: number;
  }> {
    const { data, error } = await supabase
      .from('members')
      .select('tier, email_verified');
    
    if (error) throw error;
    
    const members = data || [];
    return {
      total: members.length,
      bronze: members.filter(m => m.tier === 'BRONZE').length,
      silver: members.filter(m => m.tier === 'SILVER').length,
      gold: members.filter(m => m.tier === 'GOLD').length,
      platinum: members.filter(m => m.tier === 'PLATINUM').length,
      verified: members.filter(m => m.email_verified).length,
    };
  },

  /**
   * Manually add points to a member (admin action)
   */
  async addPointsToMember(memberId: number, points: number, reason: string): Promise<void> {
    // Get current balance
    const currentBalance = await this.getMemberPointsBalance(memberId);
    
    // Insert ledger entry
    const { error } = await supabase
      .from('loyalty_ledger')
      .insert({
        member_id: memberId,
        points_earned: points,
        points_redeemed: 0,
        cumulative_balance: currentBalance + points,
        transaction_type: 'Admin Adjustment',
        transaction_date: new Date().toISOString(),
      });
    
    if (error) throw error;
  },

  /**
   * Bulk import members from CSV data
   */
  async bulkImportMembers(members: BulkMemberData[]): Promise<BulkImportResult> {
    const results: BulkImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Process members one at a time to handle individual errors
    for (let i = 0; i < members.length; i++) {
      const memberData = members[i];
      
      try {
        // Generate referral code
        const referralCode = generateReferralCode(memberData.first_name);
        
        // Insert member record
        const { data: member, error: memberError } = await supabase
          .from('members')
          .insert({
            first_name: memberData.first_name,
            last_name: memberData.last_name,
            email_address: memberData.email_address,
            phone_number: memberData.phone_number,
            national_id: memberData.national_id,
            date_of_birth: memberData.date_of_birth,
            gender: memberData.gender,
            tier: memberData.tier || 'BRONZE',
            physical_address: memberData.physical_address,
            city: memberData.city || 'Nairobi',
            country: memberData.country || 'Kenya',
            employer_name: memberData.employer_name,
            occupation: memberData.occupation,
            referral_code: referralCode,
            email_verified: false,
          })
          .select()
          .single();

        if (memberError) {
          let errorMessage = memberError.message;
          
          // Handle duplicate errors
          if (memberError.code === '23505') {
            if (memberError.message.includes('email')) {
              errorMessage = 'Email already exists';
            } else if (memberError.message.includes('phone')) {
              errorMessage = 'Phone number already exists';
            } else if (memberError.message.includes('national_id')) {
              errorMessage = 'National ID already exists';
            } else {
              errorMessage = 'Duplicate record';
            }
          }
          
          results.failed++;
          results.errors.push({
            row: i + 1,
            email: memberData.email_address,
            error: errorMessage,
          });
          continue;
        }

        // Send password reset email for the member to set up their account
        try {
          await this.sendPasswordResetEmail(memberData.email_address);
        } catch (emailError) {
          console.warn(`Failed to send welcome email to ${memberData.email_address}:`, emailError);
          // Don't fail the import if email fails - member was created successfully
        }

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          email: memberData.email_address,
          error: err.message || 'Unknown error',
        });
      }
    }

    return results;
  },
};

// Types for bulk import
export interface BulkMemberData {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  national_id: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  physical_address?: string;
  city?: string;
  country?: string;
  employer_name?: string;
  occupation?: string;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: { row: number; email: string; error: string }[];
}
