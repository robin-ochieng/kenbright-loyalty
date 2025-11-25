import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { historyService } from '../services/historyService';
import { LoyaltyTransaction } from '../types';
import { format } from 'date-fns';

const History: React.FC = () => {
  const { member } = useAuth();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!member) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await historyService.getTransactionHistory(member.member_id);
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [member]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!member) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">
          No member profile found. Please contact support if this issue persists.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction History
      </Typography>
      <Typography paragraph color="text.secondary" sx={{ mb: 4 }}>
        View your complete history of points earned and redeemed.
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="transaction history table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Transaction Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((row) => (
                <TableRow
                  key={row.ledger_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {format(new Date(row.transaction_date), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.transaction_type} 
                      color={row.points_earned > 0 ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.description || '-'}</TableCell>
                  <TableCell align="right" sx={{ 
                    color: row.points_earned > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}>
                    {row.points_earned > 0 ? `+${row.points_earned}` : `-${row.points_redeemed}`}
                  </TableCell>
                  <TableCell align="right">{row.cumulative_balance}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No transactions found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default History;
