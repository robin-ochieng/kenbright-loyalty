import { supabase } from './supabaseClient';

export interface Redemption {
  redemption_id: number;
  member_id: number;
  reward_id: number;
  points_spent: number;
  points_redeemed?: number; // alias for points_spent
  redemption_date: string;
  status: string;
  members?: {
    first_name: string;
    last_name: string;
    email_address: string;
    email?: string; // alias
  };
  rewards_catalog?: {
    reward_name: string;
  };
  reward_catalog?: {
    reward_name: string;
  };
}

export const redemptionService = {
  async getRedemptions() {
    const { data, error } = await supabase
      .from('points_redemptions')
      .select(`
        *,
        members (first_name, last_name, email_address),
        rewards_catalog (reward_name)
      `)
      .order('redemption_date', { ascending: false });
    
    if (error) throw error;
    return data as Redemption[];
  },

  async updateStatus(id: number, status: string) {
    const { data, error } = await supabase
      .from('points_redemptions')
      .update({ status })
      .eq('redemption_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Redemption;
  }
};
