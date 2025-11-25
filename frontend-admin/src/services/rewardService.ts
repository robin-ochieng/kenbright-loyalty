import { supabase } from './supabaseClient';

export interface Reward {
  reward_id: number;
  reward_name: string;
  description: string;
  points_required: number;
  stock_quantity: number;
  is_active: boolean;
  category: string;
  image_url?: string;
}

export const rewardService = {
  async getRewards() {
    const { data, error } = await supabase
      .from('reward_catalog')
      .select('*')
      .order('reward_id', { ascending: true });
    
    if (error) throw error;
    return data as Reward[];
  },

  async createReward(reward: Omit<Reward, 'reward_id'>) {
    const { data, error } = await supabase
      .from('reward_catalog')
      .insert([reward])
      .select()
      .single();
    
    if (error) throw error;
    return data as Reward;
  },

  async updateReward(id: number, updates: Partial<Reward>) {
    const { data, error } = await supabase
      .from('reward_catalog')
      .update(updates)
      .eq('reward_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Reward;
  },

  async deleteReward(id: number) {
    const { error } = await supabase
      .from('reward_catalog')
      .delete()
      .eq('reward_id', id);
    
    if (error) throw error;
  }
};
