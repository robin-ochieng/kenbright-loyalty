import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { paymentService, Payment } from '../services/paymentService';
import { exportToCSV } from '../utils/exportUtils';

export default function PaymentReconciliation() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(payments, `payments_list_${new Date().toISOString().split('T')[0]}`);
  };

  const handleReconcile = async () => {
    setReconciling(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await paymentService.runReconciliation();
      setSuccessMessage(`Reconciliation completed. Processed: ${result.results?.processed_count || 0}`);
      await loadPayments(); // Reload to see updated statuses
    } catch (err: any) {
      setError(err.message || 'Reconciliation failed');
    } finally {
      setReconciling(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Payment Reconciliation
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleReconcile}
            disabled={reconciling}
          >
            {reconciling ? <CircularProgress size={24} color="inherit" /> : 'Run Reconciliation'}
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="payments table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ref</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reconciliation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.payment_id}>
                <TableCell>{payment.payment_id}</TableCell>
                <TableCell>{payment.transaction_ref}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{payment.payment_method}</TableCell>
                <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={payment.status} 
                    color={payment.status === 'Completed' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={payment.reconciliation_status || 'Pending'} 
                    color={payment.reconciliation_status === 'Reconciled' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No payments found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
