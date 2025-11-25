import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Dependent, DependentFormData } from '../../types';
import {
  getDependents,
  createDependent,
  updateDependent,
  deleteDependent,
} from '../../services/dependentsService';

interface DependentsManagerProps {
  memberId: number;
  onNotification: (message: string, severity: 'success' | 'error') => void;
}

const relationshipOptions: DependentFormData['relationship'][] = ['Spouse', 'Child', 'Parent', 'Sibling'];

const getRelationshipColor = (relationship: string) => {
  switch (relationship) {
    case 'Spouse': return 'primary';
    case 'Child': return 'success';
    case 'Parent': return 'warning';
    case 'Sibling': return 'info';
    default: return 'default';
  }
};

export const DependentsManager: React.FC<DependentsManagerProps> = ({ memberId, onNotification }) => {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DependentFormData>({
    full_name: '',
    relationship: 'Spouse',
    date_of_birth: '',
  });

  const fetchDependents = async () => {
    try {
      setLoading(true);
      const data = await getDependents(memberId);
      setDependents(data);
    } catch (error) {
      console.error('Error fetching dependents:', error);
      onNotification('Failed to load dependents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependents();
  }, [memberId]);

  const handleOpenDialog = (dependent?: Dependent) => {
    if (dependent) {
      setSelectedDependent(dependent);
      setFormData({
        full_name: dependent.full_name,
        relationship: dependent.relationship,
        date_of_birth: dependent.date_of_birth?.slice(0, 10) || '',
      });
    } else {
      setSelectedDependent(null);
      setFormData({ full_name: '', relationship: 'Spouse', date_of_birth: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDependent(null);
    setFormData({ full_name: '', relationship: 'Spouse', date_of_birth: '' });
  };

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      onNotification('Please enter a name', 'error');
      return;
    }

    try {
      setSaving(true);
      if (selectedDependent) {
        await updateDependent(selectedDependent.dependent_id, formData);
        onNotification('Dependent updated successfully', 'success');
      } else {
        await createDependent(memberId, formData);
        onNotification('Dependent added successfully', 'success');
      }
      handleCloseDialog();
      fetchDependents();
    } catch (error) {
      console.error('Error saving dependent:', error);
      onNotification('Failed to save dependent', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (dependent: Dependent) => {
    setSelectedDependent(dependent);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDependent) return;

    try {
      setSaving(true);
      await deleteDependent(selectedDependent.dependent_id);
      onNotification('Dependent removed successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedDependent(null);
      fetchDependents();
    } catch (error) {
      console.error('Error deleting dependent:', error);
      onNotification('Failed to remove dependent', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <PeopleIcon color="primary" />
            <Box>
              <Typography variant="h6">Family & Dependents</Typography>
              <Typography variant="body2" color="text.secondary">
                Add dependents for life and medical insurance coverage
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="small"
          >
            Add Dependent
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {dependents.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No dependents added yet. Add family members to include them in your insurance coverage.
          </Alert>
        ) : (
          <List>
            {dependents.map((dependent, index) => (
              <React.Fragment key={dependent.dependent_id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight="medium">{dependent.full_name}</Typography>
                        <Chip
                          label={dependent.relationship}
                          size="small"
                          color={getRelationshipColor(dependent.relationship) as any}
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={
                      dependent.date_of_birth
                        ? `Born: ${new Date(dependent.date_of_birth).toLocaleDateString()}`
                        : 'Date of birth not specified'
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(dependent)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteClick(dependent)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDependent ? 'Edit Dependent' : 'Add New Dependent'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value as DependentFormData['relationship'] })}
              select
              fullWidth
              required
            >
              {relationshipOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : selectedDependent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Dependent?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{selectedDependent?.full_name}</strong> from your dependents list?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={saving}>
            {saving ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DependentsManager;
