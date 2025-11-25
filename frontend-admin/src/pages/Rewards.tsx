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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Container,
  IconButton,
  InputAdornment,
  Avatar,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  CardGiftcard as GiftIcon,
  Inventory as InventoryIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { rewardService, Reward } from '../services/rewardService';

const getCategoryColor = (category: string | undefined) => {
  switch (category?.toLowerCase()) {
    case 'travel':
      return { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' };
    case 'shopping':
      return { bg: '#fce7f3', color: '#be185d', border: '#f9a8d4' };
    case 'dining':
      return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
    case 'entertainment':
      return { bg: '#e0e7ff', color: '#4f46e5', border: '#c7d2fe' };
    default:
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  }
};

export default function Rewards() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuReward, setMenuReward] = useState<Reward | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
  });

  // Form state
  const [formData, setFormData] = useState<Partial<Reward>>({
    reward_name: '',
    description: '',
    points_cost: 0,
    stock_quantity: 0,
    is_active: true,
    category: 'General'
  });

  useEffect(() => {
    loadRewards();
  }, []);

  useEffect(() => {
    filterRewards();
    calculateStats();
  }, [rewards, searchQuery, statusFilter]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await rewardService.getRewards();
      setRewards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const filterRewards = () => {
    let filtered = [...rewards];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.reward_name?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      filtered = filtered.filter(r => r.is_active === isActive);
    }
    
    setFilteredRewards(filtered);
  };

  const calculateStats = () => {
    const total = rewards.length;
    const active = rewards.filter(r => r.is_active).length;
    const inactive = rewards.filter(r => !r.is_active).length;
    const lowStock = rewards.filter(r => (r.stock_quantity || 0) < 10).length;
    
    setStats({ total, active, inactive, lowStock });
  };

  const handleOpenDialog = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward);
      setFormData(reward);
    } else {
      setEditingReward(null);
      setFormData({
        reward_name: '',
        description: '',
        points_cost: 0,
        stock_quantity: 0,
        is_active: true,
        category: 'General'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReward(null);
  };

  const handleSave = async () => {
    try {
      if (editingReward) {
        await rewardService.updateReward(editingReward.reward_id, formData);
        setSuccessMessage('Reward updated successfully');
      } else {
        await rewardService.createReward(formData as Omit<Reward, 'reward_id'>);
        setSuccessMessage('Reward created successfully');
      }
      handleCloseDialog();
      loadRewards();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save reward');
    }
  };

  const handleDelete = async (reward: Reward) => {
    if (window.confirm(`Are you sure you want to delete "${reward.reward_name}"?`)) {
      try {
        await rewardService.deleteReward(reward.reward_id);
        setSuccessMessage('Reward deleted successfully');
        loadRewards();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.message || 'Failed to delete reward');
      }
    }
    handleMenuClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, reward: Reward) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuReward(reward);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuReward(null);
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
        <Typography color="text.secondary">Loading rewards catalog...</Typography>
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
                <Typography variant="h4" fontWeight="bold">Rewards Catalog</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Manage rewards, points, and inventory
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={loadRewards}
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
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ 
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Add Reward
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Rewards', value: stats.total, icon: <GiftIcon />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Active', value: stats.active, icon: <ActiveIcon />, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Inactive', value: stats.inactive, icon: <InactiveIcon />, color: '#dc2626', bg: '#fee2e2' },
            { label: 'Low Stock (<10)', value: stats.lowStock, icon: <InventoryIcon />, color: '#d97706', bg: '#fef3c7' },
          ].map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
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

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

        {/* Search and Filter Card */}
        <Card elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Search by name, category, or description..."
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
              {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
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
              label={`Showing ${filteredRewards.length} of ${rewards.length} rewards`}
              size="small"
              sx={{ bgcolor: '#f1f5f9' }}
            />
          </Stack>
        </Card>

        {/* Rewards Table */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', py: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Reward</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="right">Points Required</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="right">Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRewards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9' }}>
                          <GiftIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Avatar>
                        <Typography color="text.secondary" fontWeight="medium">
                          {searchQuery || statusFilter !== 'ALL' 
                            ? 'No rewards match your search criteria' 
                            : 'No rewards found'}
                        </Typography>
                        {!searchQuery && statusFilter === 'ALL' && (
                          <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ mt: 1 }}
                          >
                            Add First Reward
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRewards.map((reward) => {
                    const categoryStyle = getCategoryColor(reward.category);
                    const stockLow = (reward.stock_quantity || 0) < 10;
                    return (
                      <TableRow
                        key={reward.reward_id}
                        sx={{ 
                          '&:hover': { bgcolor: '#f8fafc' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            #{reward.reward_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              bgcolor: '#fef3c7', 
                              color: '#d97706',
                              width: 40,
                              height: 40,
                            }}>
                              <GiftIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography fontWeight="600" color="text.primary">
                                {reward.reward_name}
                              </Typography>
                              {reward.description && (
                                <Typography variant="caption" color="text.disabled" sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  maxWidth: 200
                                }}>
                                  {reward.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="700" color="primary.main" sx={{ fontSize: '1rem' }}>
                            {(reward.points_cost || reward.points_required || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={reward.stock_quantity || 0}
                            size="small"
                            sx={{ 
                              bgcolor: stockLow ? '#fee2e2' : '#dcfce7',
                              color: stockLow ? '#dc2626' : '#16a34a',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={reward.category || 'General'}
                            size="small"
                            sx={{ 
                              bgcolor: categoryStyle.bg,
                              color: categoryStyle.color,
                              fontWeight: 500,
                              border: `1px solid ${categoryStyle.border}`
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={reward.is_active ? 'Active' : 'Inactive'} 
                            size="small"
                            sx={{ 
                              bgcolor: reward.is_active ? '#dcfce7' : '#fee2e2',
                              color: reward.is_active ? '#16a34a' : '#dc2626',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit Reward">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenDialog(reward)}
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
                                onClick={(e) => handleMenuClick(e, reward)}
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
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}
        >
          <MenuItem onClick={() => {
            if (menuReward) handleOpenDialog(menuReward);
            handleMenuClose();
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#64748b' }} />
            Edit Reward
          </MenuItem>
          <MenuItem 
            onClick={() => menuReward && handleDelete(menuReward)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
            Delete Reward
          </MenuItem>
        </Menu>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {editingReward ? 'Edit Reward' : 'Add New Reward'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingReward ? 'Update reward details below' : 'Fill in the details for the new reward'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Reward Name"
              fullWidth
              value={formData.reward_name}
              onChange={(e) => setFormData({ ...formData, reward_name: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Points Cost"
                  type="number"
                  fullWidth
                  value={formData.points_cost || formData.points_required || 0}
                  onChange={(e) => setFormData({ ...formData, points_cost: Number(e.target.value) })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Stock Quantity"
                  type="number"
                  fullWidth
                  value={formData.stock_quantity || 0}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  helperText="Optional - leave 0 for unlimited"
                />
              </Grid>
            </Grid>
            <TextField
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText="E.g., Travel, Shopping, Dining, Entertainment, General"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography>Active Status</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Inactive rewards won't be visible to members
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            {editingReward ? 'Update Reward' : 'Create Reward'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
