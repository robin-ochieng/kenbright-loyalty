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
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  Container,
  IconButton,
  InputAdornment,
  Avatar,
  Tooltip,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Redeem as RedeemIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Cancel as CancelledIcon,
  FilterList as FilterIcon,
  CheckCircleOutline as FulfillIcon,
  HighlightOff as RejectIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { redemptionService, Redemption } from '../services/redemptionService';
import { exportToCSV } from '../utils/exportUtils';

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'fulfilled':
      return { bg: '#dcfce7', color: '#16a34a', border: '#86efac' };
    case 'pending':
    case 'requested':
    case 'processing':
      return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
    case 'cancelled':
    case 'rejected':
      return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
    default:
      return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  }
};

export default function Redemptions() {
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    loadRedemptions();
  }, []);

  useEffect(() => {
    filterRedemptions();
    calculateStats();
  }, [redemptions, searchQuery, statusFilter]);

  const loadRedemptions = async () => {
    try {
      setLoading(true);
      const data = await redemptionService.getRedemptions();
      setRedemptions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  };

  const filterRedemptions = () => {
    let filtered = [...redemptions];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.members?.first_name?.toLowerCase().includes(query) ||
        r.members?.last_name?.toLowerCase().includes(query) ||
        r.members?.email_address?.toLowerCase().includes(query) ||
        r.members?.email?.toLowerCase().includes(query) ||
        r.rewards_catalog?.reward_name?.toLowerCase().includes(query) ||
        r.reward_catalog?.reward_name?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'ALL') {
      const statusLower = statusFilter.toLowerCase();
      filtered = filtered.filter(r => {
        const rStatus = r.status?.toLowerCase();
        if (statusLower === 'pending') return rStatus === 'pending' || rStatus === 'requested' || rStatus === 'processing';
        if (statusLower === 'completed') return rStatus === 'completed' || rStatus === 'fulfilled';
        return rStatus === statusLower;
      });
    }
    
    setFilteredRedemptions(filtered);
  };

  const calculateStats = () => {
    const total = redemptions.length;
    const pending = redemptions.filter(r => r.status?.toLowerCase() === 'pending' || r.status?.toLowerCase() === 'requested').length;
    const completed = redemptions.filter(r => r.status?.toLowerCase() === 'completed' || r.status?.toLowerCase() === 'fulfilled').length;
    const cancelled = redemptions.filter(r => r.status?.toLowerCase() === 'cancelled').length;
    const totalPoints = redemptions.reduce((sum, r) => sum + (r.points_spent || r.points_redeemed || 0), 0);
    
    setStats({ total, pending, completed, cancelled, totalPoints });
  };

  const handleExport = () => {
    const exportData = filteredRedemptions.map(r => ({
      'Redemption ID': r.redemption_id,
      'Date': new Date(r.redemption_date).toLocaleDateString(),
      'Member': `${r.members?.first_name || ''} ${r.members?.last_name || ''}`.trim(),
      'Email': r.members?.email_address || r.members?.email || '',
      'Reward': r.rewards_catalog?.reward_name || r.reward_catalog?.reward_name || '',
      'Points': r.points_spent || r.points_redeemed,
      'Status': r.status,
    }));
    exportToCSV(exportData, `redemptions_${new Date().toISOString().split('T')[0]}`);
    setSuccessMessage('Redemptions exported successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await redemptionService.updateStatus(id, newStatus);
      setSuccessMessage(`Redemption ${newStatus.toLowerCase()} successfully`);
      loadRedemptions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
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
        <Typography color="text.secondary">Loading redemption requests...</Typography>
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
                <Typography variant="h4" fontWeight="bold">Redemption Fulfillment Center</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Process and manage reward redemption requests
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={loadRedemptions}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Refresh
              </Button>
              <Button 
                variant="contained" 
                startIcon={<ExportIcon />}
                onClick={handleExport}
                sx={{ 
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Export CSV
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Requests', value: stats.total, icon: <RedeemIcon />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Pending', value: stats.pending, icon: <PendingIcon />, color: '#d97706', bg: '#fef3c7' },
            { label: 'Completed', value: stats.completed, icon: <CompletedIcon />, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Cancelled', value: stats.cancelled, icon: <CancelledIcon />, color: '#dc2626', bg: '#fee2e2' },
            { label: 'Total Points', value: stats.totalPoints.toLocaleString(), icon: <RedeemIcon />, color: '#7c3aed', bg: '#f5f3ff' },
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
                  <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
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
              placeholder="Search by member name, email, or reward..."
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
              {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map(status => (
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
              label={`Showing ${filteredRedemptions.length} of ${redemptions.length} requests`}
              size="small"
              sx={{ bgcolor: '#f1f5f9' }}
            />
          </Stack>
        </Card>

        {/* Redemptions Table */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', py: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Reward</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="right">Points</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRedemptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9' }}>
                          <RedeemIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Avatar>
                        <Typography color="text.secondary" fontWeight="medium">
                          {searchQuery || statusFilter !== 'ALL' 
                            ? 'No redemptions match your search criteria' 
                            : 'No redemption requests found'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRedemptions.map((redemption) => {
                    const statusStyle = getStatusStyles(redemption.status);
                    const statusLower = redemption.status?.toLowerCase();
                    const isPending = statusLower === 'pending' || statusLower === 'requested' || statusLower === 'processing';
                    return (
                      <TableRow
                        key={redemption.redemption_id}
                        sx={{ 
                          '&:hover': { bgcolor: '#f8fafc' },
                          transition: 'background-color 0.2s',
                          bgcolor: isPending ? 'rgba(254, 243, 199, 0.2)' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            #{redemption.redemption_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.primary">
                            {new Date(redemption.redemption_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(redemption.redemption_date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              bgcolor: '#e0e7ff', 
                              color: '#4f46e5',
                              width: 36,
                              height: 36,
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {redemption.members?.first_name?.charAt(0)}{redemption.members?.last_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="600" color="text.primary" fontSize="0.9rem">
                                {redemption.members?.first_name} {redemption.members?.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                {redemption.members?.email_address || redemption.members?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: '#fef3c7', 
                              color: '#d97706',
                              width: 32,
                              height: 32,
                            }}>
                              <RedeemIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography fontWeight="500" color="text.primary" fontSize="0.9rem">
                              {redemption.rewards_catalog?.reward_name || redemption.reward_catalog?.reward_name || 'Unknown Reward'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="700" color="primary.main" sx={{ fontSize: '1rem' }}>
                            {(redemption.points_spent || redemption.points_redeemed || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={redemption.status} 
                            size="small"
                            sx={{ 
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 600,
                              border: `1px solid ${statusStyle.border}`
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {isPending ? (
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="Fulfill Request">
                                <Button 
                                  size="small" 
                                  variant="contained"
                                  onClick={() => handleStatusUpdate(redemption.redemption_id, 'Completed')}
                                  sx={{ 
                                    minWidth: 0,
                                    px: 1.5,
                                    bgcolor: '#16a34a',
                                    '&:hover': { bgcolor: '#15803d' },
                                    fontSize: '0.75rem'
                                  }}
                                  startIcon={<FulfillIcon sx={{ fontSize: 16 }} />}
                                >
                                  Fulfill
                                </Button>
                              </Tooltip>
                              <Tooltip title="Reject Request">
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  onClick={() => handleStatusUpdate(redemption.redemption_id, 'Cancelled')}
                                  sx={{ 
                                    minWidth: 0,
                                    px: 1.5,
                                    color: '#dc2626',
                                    borderColor: '#dc2626',
                                    '&:hover': { bgcolor: '#fee2e2', borderColor: '#dc2626' },
                                    fontSize: '0.75rem'
                                  }}
                                  startIcon={<RejectIcon sx={{ fontSize: 16 }} />}
                                >
                                  Reject
                                </Button>
                              </Tooltip>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              {redemption.status === 'Completed' ? 'Fulfilled' : 'No actions'}
                            </Typography>
                          )}
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
