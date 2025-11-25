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
  Alert,
  Button,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  alpha,
  Container,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  VerifiedUser as VerifiedIcon,
  ArrowBack as BackIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { memberService, Member, CreateMemberData, UpdateMemberData, BulkMemberData, BulkImportResult } from '../services/memberService';
import { exportToCSV } from '../utils/exportUtils';
import AddMemberDialog from '../components/Members/AddMemberDialog';
import EditMemberDialog from '../components/Members/EditMemberDialog';
import BulkImportDialog, { ParsedMember, ImportResult } from '../components/Members/BulkImportDialog';

const getTierColor = (tier: string): 'default' | 'warning' | 'info' | 'success' => {
  switch (tier) {
    case 'PLATINUM': return 'success';
    case 'GOLD': return 'warning';
    case 'SILVER': return 'info';
    default: return 'default';
  }
};

const getTierStyles = (tier: string) => {
  switch (tier) {
    case 'PLATINUM':
      return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
    case 'GOLD':
      return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    case 'SILVER':
      return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
    default:
      return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
  }
};

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [menuMember, setMenuMember] = useState<Member | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    verified: 0,
  });

  useEffect(() => {
    loadMembers();
    loadStats();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, tierFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await memberService.getMemberStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.first_name.toLowerCase().includes(query) ||
        m.last_name.toLowerCase().includes(query) ||
        m.email_address.toLowerCase().includes(query) ||
        m.phone_number?.includes(query) ||
        m.national_id?.includes(query)
      );
    }
    
    // Apply tier filter
    if (tierFilter !== 'ALL') {
      filtered = filtered.filter(m => m.tier === tierFilter);
    }
    
    setFilteredMembers(filtered);
  };

  const handleExport = () => {
    const exportData = filteredMembers.map(m => ({
      ID: m.member_id,
      'First Name': m.first_name,
      'Last Name': m.last_name,
      Email: m.email_address,
      Phone: m.phone_number,
      'National ID': m.national_id,
      Tier: m.tier,
      Points: m.points_balance,
      Verified: m.email_verified ? 'Yes' : 'No',
      'Join Date': new Date(m.created_at).toLocaleDateString(),
    }));
    exportToCSV(exportData, `members_export_${new Date().toISOString().split('T')[0]}`);
    showNotification('Members exported successfully', 'success');
  };

  const handleAddMember = async (data: CreateMemberData) => {
    await memberService.createMember(data);
    showNotification('Member created successfully', 'success');
    loadMembers();
    loadStats();
  };

  const handleEditMember = async (id: number, data: UpdateMemberData) => {
    await memberService.updateMember(id, data);
    showNotification('Member updated successfully', 'success');
    loadMembers();
    loadStats();
  };

  const handleBulkImport = async (members: ParsedMember[]): Promise<ImportResult> => {
    const bulkData: BulkMemberData[] = members.map(m => ({
      first_name: m.first_name,
      last_name: m.last_name,
      email_address: m.email_address,
      phone_number: m.phone_number,
      national_id: m.national_id,
      date_of_birth: m.date_of_birth,
      gender: m.gender,
      tier: m.tier,
      physical_address: m.physical_address,
      city: m.city,
      country: m.country,
      employer_name: m.employer_name,
      occupation: m.occupation,
    }));

    const result = await memberService.bulkImportMembers(bulkData);
    
    if (result.success > 0) {
      showNotification(`Successfully imported ${result.success} members`, 'success');
      loadMembers();
      loadStats();
    }
    
    return result;
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    try {
      await memberService.deleteMember(selectedMember.member_id);
      showNotification('Member deleted successfully', 'success');
      loadMembers();
      loadStats();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete member', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleSendPasswordReset = async (member: Member) => {
    try {
      await memberService.sendPasswordResetEmail(member.email_address);
      showNotification(`Password reset email sent to ${member.email_address}`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to send password reset email', 'error');
    }
    handleMenuClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, member: Member) => {
    setAnchorEl(event.currentTarget);
    setMenuMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuMember(null);
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
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
        <Typography color="text.secondary">Loading members...</Typography>
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
                <Typography variant="h4" fontWeight="bold">Member Management</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  View, search, and manage customer profiles
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={() => { loadMembers(); loadStats(); }}
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
                startIcon={<ImportIcon />}
                onClick={() => setImportDialogOpen(true)}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Import CSV
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
                startIcon={<PersonAddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{ 
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Add Member
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Members', value: stats.total, icon: <PeopleIcon />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Bronze', value: stats.bronze, icon: <TrophyIcon />, color: '#92400e', bg: '#fef3c7' },
            { label: 'Silver', value: stats.silver, icon: <TrophyIcon />, color: '#64748b', bg: '#f1f5f9' },
            { label: 'Gold', value: stats.gold, icon: <TrophyIcon />, color: '#d97706', bg: '#fffbeb' },
            { label: 'Platinum', value: stats.platinum, icon: <TrophyIcon />, color: '#059669', bg: '#ecfdf5' },
            { label: 'Verified', value: stats.verified, icon: <VerifiedIcon />, color: '#0ea5e9', bg: '#f0f9ff' },
          ].map((stat) => (
            <Grid item xs={6} sm={4} md={2} key={stat.label}>
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
                  <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Search and Filter Card */}
        <Card elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Search by name, email, phone, or ID..."
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
              Tier: {tierFilter}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}
            >
              {['ALL', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map(tier => (
                <MenuItem 
                  key={tier} 
                  onClick={() => { setTierFilter(tier); setFilterAnchorEl(null); }}
                  selected={tierFilter === tier}
                  sx={{ minWidth: 120 }}
                >
                  {tier}
                </MenuItem>
              ))}
            </Menu>
            <Chip 
              label={`Showing ${filteredMembers.length} of ${members.length} members`}
              size="small"
              sx={{ bgcolor: '#f1f5f9' }}
            />
          </Stack>
        </Card>

        {/* Members Table */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', py: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Tier</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="right">Points</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9' }}>
                          <PeopleIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Avatar>
                        <Typography color="text.secondary" fontWeight="medium">
                          {searchQuery || tierFilter !== 'ALL' 
                            ? 'No members match your search criteria' 
                            : 'No members found'}
                        </Typography>
                        {!searchQuery && tierFilter === 'ALL' && (
                          <Button 
                            variant="contained" 
                            startIcon={<PersonAddIcon />}
                            onClick={() => setAddDialogOpen(true)}
                            sx={{ mt: 1 }}
                          >
                            Add First Member
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => {
                    const tierStyle = getTierStyles(member.tier);
                    return (
                      <TableRow
                        key={member.member_id}
                        sx={{ 
                          '&:hover': { bgcolor: '#f8fafc' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            #{member.member_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              bgcolor: '#e0e7ff', 
                              color: '#4f46e5',
                              width: 40,
                              height: 40,
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}>
                              {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="600" color="text.primary">
                                {member.first_name} {member.last_name}
                              </Typography>
                              {member.national_id && (
                                <Typography variant="caption" color="text.disabled">
                                  ID: {member.national_id}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{member.email_address}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.phone_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={member.tier} 
                            size="small"
                            sx={{ 
                              bgcolor: tierStyle.bg,
                              color: tierStyle.color,
                              fontWeight: 600,
                              border: `1px solid ${tierStyle.border}`
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="600" color="text.primary">
                            {(member.points_balance || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={member.email_verified ? 'Verified' : 'Pending'} 
                            size="small"
                            sx={{ 
                              bgcolor: member.email_verified ? '#dcfce7' : '#fef3c7',
                              color: member.email_verified ? '#16a34a' : '#d97706',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(member.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit Member">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setEditDialogOpen(true);
                                }}
                                sx={{ 
                                  color: '#64748b',
                                  '&:hover': { bgcolor: '#e0e7ff', color: '#4f46e5' }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More actions">
                              <IconButton 
                                size="small"
                                onClick={(e) => handleMenuClick(e, member)}
                                sx={{ 
                                  color: '#64748b',
                                  '&:hover': { bgcolor: '#f1f5f9' }
                                }}
                              >
                                <MoreIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}
        >
          <MenuItem onClick={() => {
            if (menuMember) {
              setSelectedMember(menuMember);
              setEditDialogOpen(true);
            }
            handleMenuClose();
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#64748b' }} />
            Edit Member
          </MenuItem>
          <MenuItem onClick={() => menuMember && handleSendPasswordReset(menuMember)}>
            <EmailIcon fontSize="small" sx={{ mr: 1.5, color: '#64748b' }} />
            Send Password Reset
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              if (menuMember) {
                setSelectedMember(menuMember);
                setDeleteDialogOpen(true);
              }
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
            Delete Member
          </MenuItem>
        </Menu>
      </Container>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddMember}
      />

      {/* Edit Member Dialog */}
      <EditMemberDialog
        open={editDialogOpen}
        member={selectedMember}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMember(null);
        }}
        onSubmit={handleEditMember}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedMember?.first_name} {selectedMember?.last_name}</strong>?
            This action cannot be undone and will remove all associated data including points, transactions, and redemptions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteMember} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleBulkImport}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
