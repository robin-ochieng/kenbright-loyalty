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
  FormControlLabel
} from '@mui/material';
import { rewardService, Reward } from '../services/rewardService';

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Reward>>({
    reward_name: '',
    description: '',
    points_required: 0,
    stock_quantity: 0,
    is_active: true,
    category: 'General'
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await rewardService.getRewards();
      setRewards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
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
        points_required: 0,
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
      } else {
        await rewardService.createReward(formData as Omit<Reward, 'reward_id'>);
      }
      handleCloseDialog();
      loadRewards();
    } catch (err: any) {
      setError(err.message || 'Failed to save reward');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await rewardService.deleteReward(id);
        loadRewards();
      } catch (err: any) {
        setError(err.message || 'Failed to delete reward');
      }
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Rewards Catalog
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Reward
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="rewards table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rewards.map((reward) => (
              <TableRow key={reward.reward_id}>
                <TableCell>{reward.reward_id}</TableCell>
                <TableCell>{reward.reward_name}</TableCell>
                <TableCell>{reward.points_required}</TableCell>
                <TableCell>{reward.stock_quantity}</TableCell>
                <TableCell>{reward.category}</TableCell>
                <TableCell>{reward.is_active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpenDialog(reward)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(reward.reward_id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingReward ? 'Edit Reward' : 'Add Reward'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.reward_name}
              onChange={(e) => setFormData({ ...formData, reward_name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Points Required"
              type="number"
              fullWidth
              value={formData.points_required}
              onChange={(e) => setFormData({ ...formData, points_required: Number(e.target.value) })}
            />
            <TextField
              label="Stock Quantity"
              type="number"
              fullWidth
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
            />
            <TextField
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
