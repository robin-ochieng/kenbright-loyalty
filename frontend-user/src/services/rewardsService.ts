import { supabase } from './supabaseClient';
import { Reward, Redemption } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const rewardsService = {
  async getRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards_catalog')
      .select('*')
      .eq('is_active', true)
      .order('points_cost', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
    return data as Reward[];
  },

  async getMyRedemptions(memberId: number): Promise<Redemption[]> {
    const { data, error } = await supabase
      .from('points_redemptions')
      .select('*, reward:rewards_catalog(*)')
      .eq('member_id', memberId)
      .order('redemption_date', { ascending: false });

    if (error) {
      console.error('Error fetching redemptions:', error);
      throw error;
    }
    return data as Redemption[];
  },

  async redeemReward(rewardId: number): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`${API_URL}/rewards/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ reward_id: rewardId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Redemption failed');
    }

    return await response.json();
  }
};
