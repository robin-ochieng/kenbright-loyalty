import { supabase } from './supabaseClient';
import { Member, LoyaltyTransaction } from '../types';

export const dashboardService = {
  async getMemberProfile(userId: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching member profile:', error);
      return null;
    }
    return data as Member;
  },

  async getMemberBalance(memberId: number): Promise<number> {
    const { data, error } = await supabase
      .from('loyalty_ledger')
      .select('cumulative_balance')
      .eq('member_id', memberId)
      .order('transaction_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 0; // No rows found
      console.error('Error fetching balance:', error);
      throw error;
    }
    return data?.cumulative_balance || 0;
  },

  async getRecentActivity(memberId: number): Promise<LoyaltyTransaction[]> {
    const { data, error } = await supabase
      .from('loyalty_ledger')
      .select('*')
      .eq('member_id', memberId)
      .order('transaction_date', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
    return data as LoyaltyTransaction[];
  }
};
