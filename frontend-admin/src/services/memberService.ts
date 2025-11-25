import { supabase } from './supabaseClient';

export interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: string;
  tier_id: number;
  points_balance: number;
  created_at: string;
  // KYC Fields
  national_id?: string;
  date_of_birth?: string;
  gender?: string;
  physical_address?: string;
  city?: string;
  country?: string;
  employment_status?: string;
  employer_name?: string;
  occupation?: string;
}

export const memberService = {
  async getMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Member[];
  },

  async getMemberById(id: number) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', id)
      .single();
    
    if (error) throw error;
    return data as Member;
  },

  async updateMemberStatus(id: number, status: string) {
    const { data, error } = await supabase
      .from('members')
      .update({ status })
      .eq('member_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Member;
  }
};
