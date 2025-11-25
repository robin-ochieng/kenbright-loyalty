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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Container,
  IconButton,
  Avatar,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  VerifiedUser as VerifiedIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { kycService } from '../services/kycService';
import { Member } from '../services/memberService';

export default function KYCVerification() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    incomplete: 0
  });

  useEffect(() => {
    loadPendingKYC();
  }, []);

  const loadPendingKYC = async () => {
    try {
      setLoading(true);
      const [data, kycStats] = await Promise.all([
        kycService.getPendingKYC(),
        kycService.getKYCStats()
      ]);
      setMembers(data);
      setStats(kycStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await kycService.approveKYC(id);
      loadPendingKYC();
      setSelectedMember(null);
    } catch (err: any) {
      setError(err.message || 'Failed to approve KYC');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await kycService.rejectKYC(id);
      loadPendingKYC();
      setSelectedMember(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reject KYC');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email_address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const statsCards = [
    { label: 'Total Members', value: stats.total, icon: <PersonIcon />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Verified', value: stats.verified, icon: <VerifiedIcon />, color: '#10b981', bg: '#dcfce7' },
    { label: 'Pending Review', value: stats.pending, icon: <PendingIcon />, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Incomplete', value: stats.incomplete, icon: <WarningIcon />, color: '#ef4444', bg: '#fee2e2' },
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
        <Typography color="text.secondary">Loading KYC data...</Typography>
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
                <Typography variant="h4" fontWeight="bold">KYC Verification</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Review and verify member documents
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={loadPendingKYC}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

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
                placeholder="Search by name or email..."
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
              <Tabs 
                value={tabValue} 
                onChange={(_, v) => setTabValue(v)}
                sx={{ 
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                  '& .Mui-selected': { color: '#1e3a5f' },
                  '& .MuiTabs-indicator': { backgroundColor: '#1e3a5f' }
                }}
              >
                <Tab label={`All (${stats.total})`} />
                <Tab label={`Pending (${stats.pending})`} />
                <Tab label={`Verified (${stats.verified})`} />
              </Tabs>
            </Stack>
          </CardContent>
        </Card>

        {/* Members Table */}
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
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>National ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Employment</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow 
                    key={member.member_id}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={member.member_id} 
                        size="small" 
                        sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#1e3a5f', width: 40, height: 40 }}>
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>
                            {member.first_name} {member.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email_address}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{member.national_id || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={member.employment_status || 'Unknown'} 
                        size="small"
                        sx={{ 
                          bgcolor: member.employment_status === 'Employed' ? '#dcfce7' : '#fef3c7',
                          color: member.employment_status === 'Employed' ? '#166534' : '#92400e',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={member.email_verified ? 'Verified' : 'Pending'} 
                        size="small"
                        sx={{ 
                          bgcolor: member.email_verified ? '#dcfce7' : '#fef3c7',
                          color: member.email_verified ? '#166534' : '#92400e',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<ViewIcon />}
                        onClick={() => setSelectedMember(member)}
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 2,
                          borderColor: '#1e3a5f',
                          color: '#1e3a5f',
                          '&:hover': { bgcolor: '#1e3a5f', color: 'white' }
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box>
                        <VerifiedIcon sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                          No pending KYC requests
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          All members have been verified
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

      {/* Review Dialog */}
      <Dialog 
        open={!!selectedMember} 
        onClose={() => setSelectedMember(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              {selectedMember?.first_name?.[0]}{selectedMember?.last_name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedMember?.first_name} {selectedMember?.last_name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                KYC Review
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedMember && (
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> Personal Information
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Full Name</Typography>
                        <Typography fontWeight={600}>{selectedMember.first_name} {selectedMember.last_name}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">National ID</Typography>
                        <Typography fontWeight={600}>{selectedMember.national_id || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                        <Typography fontWeight={600}>
                          {selectedMember.date_of_birth ? new Date(selectedMember.date_of_birth).toLocaleDateString() : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Gender</Typography>
                        <Typography fontWeight={600}>{selectedMember.gender || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" /> Contact Information
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography fontWeight={600}>{selectedMember.phone_number || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography fontWeight={600}>{selectedMember.email_address || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography fontWeight={600}>
                          {[selectedMember.physical_address, selectedMember.city, selectedMember.country].filter(Boolean).join(', ') || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon fontSize="small" /> Employment Information
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Typography fontWeight={600}>{selectedMember.employment_status || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Employer</Typography>
                        <Typography fontWeight={600}>{selectedMember.employer_name || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Occupation</Typography>
                        <Typography fontWeight={600}>{selectedMember.occupation || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setSelectedMember(null)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<RejectIcon />}
            onClick={() => selectedMember && handleReject(selectedMember.member_id)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<ApproveIcon />}
            onClick={() => selectedMember && handleApprove(selectedMember.member_id)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Approve & Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
