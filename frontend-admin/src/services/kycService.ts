import { supabase } from './supabaseClient';
import { Member } from './memberService';

export const kycService = {
  async getPendingKYC() {
    // Fetch members who need KYC verification
    // Using email_verified as proxy for verification status since 'status' column doesn't exist
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('email_verified', false)
      .not('national_id', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Member[];
  },

  async approveKYC(id: number) {
    // Mark member as verified
    const { data, error } = await supabase
      .from('members')
      .update({ email_verified: true })
      .eq('member_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Member;
  },

  async rejectKYC(id: number) {
    // For rejection, we could delete or flag the member
    // Since there's no status column, we'll just keep them unverified
    // In a real system, you might want to add a 'kyc_status' column
    const { data, error } = await supabase
      .from('members')
      .update({ email_verified: false })
      .eq('member_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Member;
  },

  async getKYCStats() {
    const { data: allMembers, error: err1 } = await supabase
      .from('members')
      .select('member_id, email_verified, national_id');
    
    if (err1) throw err1;

    const total = allMembers?.length || 0;
    const verified = allMembers?.filter(m => m.email_verified).length || 0;
    const pending = allMembers?.filter(m => !m.email_verified && m.national_id).length || 0;
    const incomplete = allMembers?.filter(m => !m.national_id).length || 0;

    return { total, verified, pending, incomplete };
  }
};
