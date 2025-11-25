import { supabase } from './supabaseClient';

export interface Payment {
  payment_id: number;
  transaction_ref: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  member_id: number;
  policy_number: string;
  reconciliation_status: string;
}

export const paymentService = {
  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data as Payment[];
  },

  async runReconciliation() {
    // Call the backend endpoint for reconciliation
    // Note: You might need to configure a proxy or use the full URL
    // For now, we'll assume the backend is at http://localhost:8000
    const response = await fetch('http://localhost:8000/engines/payments/reconcile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Reconciliation failed');
    }

    return await response.json();
  },

  async getReconciliationStats() {
    const response = await fetch('http://localhost:8000/engines/payments/reconciliation-report');
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return await response.json();
  }
};
