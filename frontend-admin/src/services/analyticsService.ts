import { supabase } from './supabaseClient';

export interface AnalyticsSummary {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalRevenue: number;
}

export const analyticsService = {
  async getSummaryStats(): Promise<AnalyticsSummary> {
    // 1. Total Members
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // 2. Points Stats (Fetch all for now - optimize with RPC later if needed)
    const { data: ledgerData } = await supabase
      .from('loyalty_ledger')
      .select('points_earned, points_redeemed');
    
    const totalPointsIssued = ledgerData?.reduce((sum, row) => sum + (row.points_earned || 0), 0) || 0;
    const totalPointsRedeemed = ledgerData?.reduce((sum, row) => sum + (row.points_redeemed || 0), 0) || 0;

    // 3. Revenue (Matched Payments)
    const { data: paymentData } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('status', 'Matched');
    
    const totalRevenue = paymentData?.reduce((sum, row) => sum + (row.amount_paid || 0), 0) || 0;

    return {
      totalMembers: memberCount || 0,
      totalPointsIssued,
      totalPointsRedeemed,
      totalRevenue
    };
  },

  async getMemberGrowthData() {
    const { data } = await supabase
      .from('members')
      .select('created_at')
      .order('created_at');
    
    // Group by Month-Year
    const grouped = data?.reduce((acc: any, curr) => {
      const date = new Date(curr.created_at);
      const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped || {}).map(([name, value]) => ({ name, value }));
  },

  async getPointsActivityData() {
    const { data } = await supabase
      .from('loyalty_ledger')
      .select('transaction_date, points_earned, points_redeemed')
      .order('transaction_date');

    const grouped = data?.reduce((acc: any, curr) => {
      const date = new Date(curr.transaction_date);
      const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[key]) acc[key] = { name: key, earned: 0, redeemed: 0 };
      acc[key].earned += curr.points_earned || 0;
      acc[key].redeemed += curr.points_redeemed || 0;
      return acc;
    }, {});

    return Object.values(grouped || {});
  }
};
