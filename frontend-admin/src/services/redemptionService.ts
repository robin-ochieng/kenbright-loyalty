import { supabase } from './supabaseClient';

export interface Redemption {
  redemption_id: number;
  member_id: number;
  reward_id: number;
  points_redeemed: number;
  redemption_date: string;
  status: string;
  members?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reward_catalog?: {
    reward_name: string;
  };
}

export const redemptionService = {
  async getRedemptions() {
    const { data, error } = await supabase
      .from('points_redemption')
      .select(`
        *,
        members (first_name, last_name, email),
        reward_catalog (reward_name)
      `)
      .order('redemption_date', { ascending: false });
    
    if (error) throw error;
    return data as Redemption[];
  },

  async updateStatus(id: number, status: string) {
    const { data, error } = await supabase
      .from('points_redemption')
      .update({ status })
      .eq('redemption_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Redemption;
  }
};
