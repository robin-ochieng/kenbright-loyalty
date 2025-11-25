import { supabase } from './supabaseClient';
import { LoyaltyTransaction } from '../types';

export const historyService = {
  async getTransactionHistory(memberId: number): Promise<LoyaltyTransaction[]> {
    const { data, error } = await supabase
      .from('loyalty_ledger')
      .select('*')
      .eq('member_id', memberId)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
    return data as LoyaltyTransaction[];
  }
};
