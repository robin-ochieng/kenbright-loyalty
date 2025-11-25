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
  Stack,
  Card,
  CardContent,
  Grid,
  Container,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Sync as SyncIcon,
  AccountBalance as BankIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paymentService, Payment } from '../services/paymentService';
import { exportToCSV } from '../utils/exportUtils';

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return { bg: '#dcfce7', color: '#16a34a', border: '#86efac' };
    case 'pending':
      return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
    case 'failed':
      return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
    default:
      return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  }
};

const getReconciliationColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'reconciled':
      return { bg: '#dcfce7', color: '#16a34a', border: '#86efac' };
    case 'pending':
      return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
    case 'failed':
    case 'mismatch':
      return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
    default:
      return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  }
};

export default function PaymentReconciliation() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    reconciled: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
    calculateStats();
  }, [payments, searchQuery, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.transaction_ref?.toLowerCase().includes(query) ||
        p.payment_method?.toLowerCase().includes(query) ||
        String(p.amount).includes(query)
      );
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    
    setFilteredPayments(filtered);
  };

  const calculateStats = () => {
    const total = payments.length;
    const completed = payments.filter(p => p.status?.toLowerCase() === 'completed').length;
    const pending = payments.filter(p => p.status?.toLowerCase() === 'pending').length;
    const reconciled = payments.filter(p => p.reconciliation_status?.toLowerCase() === 'reconciled').length;
    const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    
    setStats({ total, completed, pending, reconciled, totalAmount });
  };

  const handleExport = () => {
    const exportData = filteredPayments.map(p => ({
      'Payment ID': p.payment_id,
      'Transaction Ref': p.transaction_ref,
      'Amount': p.amount,
      'Method': p.payment_method,
      'Date': new Date(p.payment_date).toLocaleDateString(),
      'Status': p.status,
      'Reconciliation': p.reconciliation_status || 'Pending',
    }));
    exportToCSV(exportData, `payments_reconciliation_${new Date().toISOString().split('T')[0]}`);
    setSuccessMessage('Payments exported successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleReconcile = async () => {
    setReconciling(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await paymentService.runReconciliation();
      setSuccessMessage(`Reconciliation completed. Processed: ${result.results?.processed_count || 0}`);
      await loadPayments();
    } catch (err: any) {
      setError(err.message || 'Reconciliation failed');
    } finally {
      setReconciling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh',
        gap: 2
      }}>
        <CircularProgress size={48} />
        <Typography color="text.secondary">Loading payments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        color: 'white',
        py: 3,
        px: 3,
        mb: 3
      }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
                <BackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight="bold">Payment Reconciliation</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Review, reconcile, and manage payment transactions
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={loadPayments}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Refresh
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ExportIcon />}
                onClick={handleExport}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Export CSV
              </Button>
              <Button 
                variant="contained" 
                startIcon={reconciling ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
                onClick={handleReconcile}
                disabled={reconciling}
                sx={{ 
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                {reconciling ? 'Processing...' : 'Run Reconciliation'}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Payments', value: stats.total, icon: <ReceiptIcon />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Completed', value: stats.completed, icon: <CheckIcon />, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Pending', value: stats.pending, icon: <PendingIcon />, color: '#d97706', bg: '#fef3c7' },
            { label: 'Reconciled', value: stats.reconciled, icon: <BankIcon />, color: '#0ea5e9', bg: '#f0f9ff' },
            { label: 'Total Amount', value: `KES ${stats.totalAmount.toLocaleString()}`, icon: <BankIcon />, color: '#7c3aed', bg: '#f5f3ff', isAmount: true },
          ].map((stat) => (
            <Grid item xs={6} sm={4} md={2.4} key={stat.label}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                  <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 40, height: 40, mx: 'auto', mb: 1 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography 
                    variant={stat.isAmount ? 'h6' : 'h4'} 
                    fontWeight="bold" 
                    sx={{ color: stat.color }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

        {/* Search and Filter Card */}
        <Card elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Search by transaction ref, method, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ 
                flex: 1, 
                maxWidth: { sm: 400 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f8fafc'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Status: {statusFilter}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}
            >
              {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map(status => (
                <MenuItem 
                  key={status} 
                  onClick={() => { setStatusFilter(status); setFilterAnchorEl(null); }}
                  selected={statusFilter === status}
                  sx={{ minWidth: 120 }}
                >
                  {status}
                </MenuItem>
              ))}
            </Menu>
            <Chip 
              label={`Showing ${filteredPayments.length} of ${payments.length} payments`}
              size="small"
              sx={{ bgcolor: '#f1f5f9' }}
            />
          </Stack>
        </Card>

        {/* Payments Table */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', py: 2 }}>Payment ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Transaction Ref</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="right">Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Reconciliation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9' }}>
                          <ReceiptIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Avatar>
                        <Typography color="text.secondary" fontWeight="medium">
                          {searchQuery || statusFilter !== 'ALL' 
                            ? 'No payments match your search criteria' 
                            : 'No payments found'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => {
                    const statusStyle = getStatusColor(payment.status);
                    const reconcileStyle = getReconciliationColor(payment.reconciliation_status);
                    return (
                      <TableRow
                        key={payment.payment_id}
                        sx={{ 
                          '&:hover': { bgcolor: '#f8fafc' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            #{payment.payment_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              bgcolor: '#e0e7ff', 
                              color: '#4f46e5',
                              width: 36,
                              height: 36,
                              fontSize: '0.75rem',
                            }}>
                              <ReceiptIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Typography fontWeight="600" color="text.primary">
                              {payment.transaction_ref}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="700" color="text.primary" sx={{ fontSize: '1rem' }}>
                            KES {Number(payment.amount).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.payment_method}
                            size="small"
                            sx={{ 
                              bgcolor: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(payment.payment_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.status} 
                            size="small"
                            sx={{ 
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 600,
                              border: `1px solid ${statusStyle.border}`
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.reconciliation_status || 'Pending'} 
                            size="small"
                            sx={{ 
                              bgcolor: reconcileStyle.bg,
                              color: reconcileStyle.color,
                              fontWeight: 600,
                              border: `1px solid ${reconcileStyle.border}`
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </Box>
  );
}
