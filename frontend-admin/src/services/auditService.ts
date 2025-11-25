import { supabase } from './supabaseClient';

export interface AuditLogEntry {
  id: string;
  type: 'Payment' | 'Redemption' | 'Points';
  description: string;
  date: string;
  status: string;
  member_name?: string;
  amount?: number;
}

export const auditService = {
  async getSystemActivity(): Promise<AuditLogEntry[]> {
    const activities: AuditLogEntry[] = [];

    // 1. Fetch Payments
    const { data: payments } = await supabase
      .from('payments')
      .select(`
        payment_id, amount_paid, payment_date, status,
        members (first_name, last_name)
      `)
      .order('payment_date', { ascending: false })
      .limit(50);

    if (payments) {
      payments.forEach((p: any) => {
        activities.push({
          id: `PAY-${p.payment_id}`,
          type: 'Payment',
          description: `Payment of KES ${p.amount_paid}`,
          date: p.payment_date,
          status: p.status,
          member_name: p.members ? `${p.members.first_name} ${p.members.last_name}` : 'Unknown',
          amount: p.amount_paid
        });
      });
    }

    // 2. Fetch Redemptions
    const { data: redemptions } = await supabase
      .from('points_redemption')
      .select(`
        redemption_id, points_redeemed, redemption_date, status,
        members (first_name, last_name),
        reward_catalog (reward_name)
      `)
      .order('redemption_date', { ascending: false })
      .limit(50);

    if (redemptions) {
      redemptions.forEach((r: any) => {
        activities.push({
          id: `RED-${r.redemption_id}`,
          type: 'Redemption',
          description: `Redeemed ${r.points_redeemed} pts for ${r.reward_catalog?.reward_name}`,
          date: r.redemption_date,
          status: r.status,
          member_name: r.members ? `${r.members.first_name} ${r.members.last_name}` : 'Unknown',
          amount: r.points_redeemed
        });
      });
    }

    // 3. Fetch Ledger (Points)
    const { data: ledger } = await supabase
      .from('loyalty_ledger')
      .select(`
        ledger_id, points_earned, transaction_date, transaction_type,
        members (first_name, last_name)
      `)
      .order('transaction_date', { ascending: false })
      .limit(50);

    if (ledger) {
      ledger.forEach((l: any) => {
        activities.push({
          id: `LED-${l.ledger_id}`,
          type: 'Points',
          description: `${l.transaction_type}: ${l.points_earned} pts`,
          date: l.transaction_date,
          status: 'Completed',
          member_name: l.members ? `${l.members.first_name} ${l.members.last_name}` : 'Unknown',
          amount: l.points_earned
        });
      });
    }

    // Sort combined list by date desc
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};
