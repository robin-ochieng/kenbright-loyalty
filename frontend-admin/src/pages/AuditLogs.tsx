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
  CircularProgress,
  Button,
  Stack,
  Container,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  History as HistoryIcon,
  Payment as PaymentIcon,
  Redeem as RedeemIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auditService, AuditLogEntry } from '../services/auditService';
import { exportToCSV } from '../utils/exportUtils';

export default function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    payments: 0,
    redemptions: 0,
    other: 0
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getSystemActivity();
      setLogs(data);
      
      // Calculate stats
      const payments = data.filter(l => l.type === 'Payment').length;
      const redemptions = data.filter(l => l.type === 'Redemption').length;
      setStats({
        total: data.length,
        payments,
        redemptions,
        other: data.length - payments - redemptions
      });
    } catch (error) {
      console.error('Failed to load audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(logs, `audit_logs_${new Date().toISOString().split('T')[0]}`);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeChipStyles = (type: string) => {
    switch (type) {
      case 'Payment':
        return { bgcolor: '#dcfce7', color: '#166534', icon: <PaymentIcon sx={{ fontSize: 14 }} /> };
      case 'Redemption':
        return { bgcolor: '#fef3c7', color: '#92400e', icon: <RedeemIcon sx={{ fontSize: 14 }} /> };
      default:
        return { bgcolor: '#eff6ff', color: '#1e40af', icon: <HistoryIcon sx={{ fontSize: 14 }} /> };
    }
  };

  const getStatusChipStyles = (status: string) => {
    if (status === 'Completed' || status === 'Matched') {
      return { bgcolor: '#dcfce7', color: '#166534' };
    } else if (status === 'Pending') {
      return { bgcolor: '#fef3c7', color: '#92400e' };
    }
    return { bgcolor: '#f1f5f9', color: '#475569' };
  };

  const statsCards = [
    { label: 'Total Activities', value: stats.total, icon: <HistoryIcon />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Payments', value: stats.payments, icon: <PaymentIcon />, color: '#10b981', bg: '#dcfce7' },
    { label: 'Redemptions', value: stats.redemptions, icon: <RedeemIcon />, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Other', value: stats.other, icon: <ScheduleIcon />, color: '#8b5cf6', bg: '#f3e8ff' },
  ];

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
        <Typography color="text.secondary">Loading audit logs...</Typography>
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
                <Typography variant="h4" fontWeight="bold">System Audit Logs</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Track all system activities and transactions
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
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
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={loadLogs}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" fontSize="0.875rem" mb={0.5}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 48, height: 48 }}>
                      {stat.icon}
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and Filter */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 3,
            borderRadius: 3,
            border: '1px solid #e2e8f0'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <TextField
                placeholder="Search by member or description..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  <MenuItem value="Payment">Payments</MenuItem>
                  <MenuItem value="Redemption">Redemptions</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => {
                  const typeStyles = getTypeChipStyles(log.type);
                  const statusStyles = getStatusChipStyles(log.status);
                  
                  return (
                    <TableRow 
                      key={log.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: '#f8fafc' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography fontWeight={500}>
                            {new Date(log.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.date).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.type}
                          icon={typeStyles.icon}
                          size="small"
                          sx={{ 
                            bgcolor: typeStyles.bgcolor,
                            color: typeStyles.color,
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: typeStyles.color }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{log.member_name || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color="text.primary">
                          {log.amount ? `KES ${Number(log.amount).toLocaleString()}` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.status}
                          size="small"
                          sx={{ 
                            bgcolor: statusStyles.bgcolor,
                            color: statusStyles.color,
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box>
                        <HistoryIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                          No audit logs found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          Activity logs will appear here
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </Box>
  );
}
