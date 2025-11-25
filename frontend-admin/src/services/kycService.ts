import { supabase } from './supabaseClient';
import { Member } from './memberService';

export const kycService = {
  async getPendingKYC() {
    // Fetch members who are not yet Active/Verified
    // Assuming 'Pending' or null status implies need for verification
    // Also ensuring they have submitted some KYC data (e.g. national_id)
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .neq('status', 'Active') 
      .not('national_id', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Member[];
  },

  async approveKYC(id: number) {
    const { data, error } = await supabase
      .from('members')
      .update({ status: 'Active' })
      .eq('member_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Member;
  },

  async rejectKYC(id: number) {
    const { data, error } = await supabase
      .from('members')
      .update({ status: 'Rejected' })
      .eq('member_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Member;
  }
};
