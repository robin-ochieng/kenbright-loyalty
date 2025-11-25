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
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Home as HomeIcon,
  Business as OfficeIcon,
  Inventory as AssetsIcon,
} from '@mui/icons-material';
import { Asset, AssetFormData, AssetType, VehicleDetails, HomeDetails, OfficeDetails } from '../../types';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../../services/assetsService';

interface AssetsManagerProps {
  memberId: number;
  onNotification: (message: string, severity: 'success' | 'error') => void;
}

const assetTypeOptions: AssetType[] = ['Vehicle', 'Home', 'Personal Office'];

const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case 'Vehicle': return <CarIcon />;
    case 'Home': return <HomeIcon />;
    case 'Personal Office': return <OfficeIcon />;
    default: return <AssetsIcon />;
  }
};

const getAssetColor = (type: AssetType) => {
  switch (type) {
    case 'Vehicle': return 'primary';
    case 'Home': return 'success';
    case 'Personal Office': return 'warning';
    default: return 'default';
  }
};

const emptyVehicleDetails: VehicleDetails = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  registration_number: '',
  color: '',
  estimated_value: undefined,
};

const emptyHomeDetails: HomeDetails = {
  property_type: 'House',
  location: '',
  bedrooms: undefined,
  estimated_value: undefined,
  is_owned: true,
};

const emptyOfficeDetails: OfficeDetails = {
  business_name: '',
  location: '',
  office_type: 'Rented',
  estimated_value: undefined,
};

export const AssetsManager: React.FC<AssetsManagerProps> = ({ memberId, onNotification }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formAssetType, setFormAssetType] = useState<AssetType>('Vehicle');
  const [vehicleForm, setVehicleForm] = useState<VehicleDetails>(emptyVehicleDetails);
  const [homeForm, setHomeForm] = useState<HomeDetails>(emptyHomeDetails);
  const [officeForm, setOfficeForm] = useState<OfficeDetails>(emptyOfficeDetails);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await getAssets(memberId);
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      onNotification('Failed to load assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [memberId]);

  const getAssetsByType = (type: AssetType) => assets.filter(a => a.asset_type === type);

  const handleOpenDialog = (asset?: Asset) => {
    if (asset) {
      setSelectedAsset(asset);
      setFormAssetType(asset.asset_type);
      if (asset.asset_type === 'Vehicle') {
        setVehicleForm(asset.details as VehicleDetails);
      } else if (asset.asset_type === 'Home') {
        setHomeForm(asset.details as HomeDetails);
      } else {
        setOfficeForm(asset.details as OfficeDetails);
      }
    } else {
      setSelectedAsset(null);
      setFormAssetType('Vehicle');
      setVehicleForm(emptyVehicleDetails);
      setHomeForm(emptyHomeDetails);
      setOfficeForm(emptyOfficeDetails);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAsset(null);
  };

  const getFormData = (): AssetFormData => {
    switch (formAssetType) {
      case 'Vehicle':
        return { asset_type: 'Vehicle', details: vehicleForm };
      case 'Home':
        return { asset_type: 'Home', details: homeForm };
      case 'Personal Office':
        return { asset_type: 'Personal Office', details: officeForm };
      default:
        return { asset_type: 'Vehicle', details: vehicleForm };
    }
  };

  const validateForm = (): boolean => {
    if (formAssetType === 'Vehicle') {
      if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.registration_number) {
        onNotification('Please fill in required vehicle details', 'error');
        return false;
      }
    } else if (formAssetType === 'Home') {
      if (!homeForm.location) {
        onNotification('Please enter the property location', 'error');
        return false;
      }
    } else {
      if (!officeForm.location) {
        onNotification('Please enter the office location', 'error');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const formData = getFormData();
      
      if (selectedAsset) {
        await updateAsset(selectedAsset.asset_id, formData);
        onNotification('Asset updated successfully', 'success');
      } else {
        await createAsset(memberId, formData);
        onNotification('Asset added successfully', 'success');
      }
      handleCloseDialog();
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      onNotification('Failed to save asset', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAsset) return;

    try {
      setSaving(true);
      await deleteAsset(selectedAsset.asset_id);
      onNotification('Asset removed successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedAsset(null);
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      onNotification('Failed to remove asset', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderAssetSummary = (asset: Asset) => {
    const details = asset.details;
    if (asset.asset_type === 'Vehicle') {
      const v = details as VehicleDetails;
      return `${v.make} ${v.model} (${v.year}) - ${v.registration_number}`;
    } else if (asset.asset_type === 'Home') {
      const h = details as HomeDetails;
      return `${h.property_type} at ${h.location}`;
    } else {
      const o = details as OfficeDetails;
      return `${o.office_type} office at ${o.location}`;
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
            <AssetsIcon color="primary" />
            <Box>
              <Typography variant="h6">My Assets</Typography>
              <Typography variant="body2" color="text.secondary">
                Register vehicles, homes, and offices for insurance quotes
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="small"
          >
            Add Asset
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {assets.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No assets registered yet. Add your vehicles, homes, or offices to get personalized insurance quotes.
          </Alert>
        ) : (
          <>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
              <Tab label={`All (${assets.length})`} />
              <Tab label={`Vehicles (${getAssetsByType('Vehicle').length})`} icon={<CarIcon />} iconPosition="start" />
              <Tab label={`Homes (${getAssetsByType('Home').length})`} icon={<HomeIcon />} iconPosition="start" />
              <Tab label={`Offices (${getAssetsByType('Personal Office').length})`} icon={<OfficeIcon />} iconPosition="start" />
            </Tabs>

            <Grid container spacing={2}>
              {(tabValue === 0 ? assets : assets.filter(a => 
                tabValue === 1 ? a.asset_type === 'Vehicle' :
                tabValue === 2 ? a.asset_type === 'Home' :
                a.asset_type === 'Personal Office'
              )).map((asset) => (
                <Grid item xs={12} sm={6} key={asset.asset_id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              bgcolor: `${getAssetColor(asset.asset_type)}.light`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: `${getAssetColor(asset.asset_type)}.main`,
                            }}
                          >
                            {getAssetIcon(asset.asset_type)}
                          </Box>
                          <Box>
                            <Chip
                              label={asset.asset_type}
                              size="small"
                              color={getAssetColor(asset.asset_type) as any}
                              variant="outlined"
                            />
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {renderAssetSummary(asset)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row">
                          <IconButton size="small" onClick={() => handleOpenDialog(asset)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteClick(asset)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Asset Type"
              value={formAssetType}
              onChange={(e) => setFormAssetType(e.target.value as AssetType)}
              select
              fullWidth
              disabled={!!selectedAsset}
            >
              {assetTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {/* Vehicle Form */}
            {formAssetType === 'Vehicle' && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Make"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                      fullWidth
                      required
                      placeholder="e.g., Toyota"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Model"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      fullWidth
                      required
                      placeholder="e.g., Camry"
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Year"
                      type="number"
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Registration Number"
                      value={vehicleForm.registration_number}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, registration_number: e.target.value.toUpperCase() })}
                      fullWidth
                      required
                      placeholder="e.g., KAA 123A"
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Color"
                      value={vehicleForm.color || ''}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Estimated Value (KES)"
                      type="number"
                      value={vehicleForm.estimated_value || ''}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, estimated_value: parseInt(e.target.value) || undefined })}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Home Form */}
            {formAssetType === 'Home' && (
              <>
                <TextField
                  label="Property Type"
                  value={homeForm.property_type}
                  onChange={(e) => setHomeForm({ ...homeForm, property_type: e.target.value as HomeDetails['property_type'] })}
                  select
                  fullWidth
                >
                  {['House', 'Apartment', 'Townhouse', 'Other'].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Location / Address"
                  value={homeForm.location}
                  onChange={(e) => setHomeForm({ ...homeForm, location: e.target.value })}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Number of Bedrooms"
                      type="number"
                      value={homeForm.bedrooms || ''}
                      onChange={(e) => setHomeForm({ ...homeForm, bedrooms: parseInt(e.target.value) || undefined })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Ownership"
                      value={homeForm.is_owned ? 'Owned' : 'Rented'}
                      onChange={(e) => setHomeForm({ ...homeForm, is_owned: e.target.value === 'Owned' })}
                      select
                      fullWidth
                    >
                      <MenuItem value="Owned">Owned</MenuItem>
                      <MenuItem value="Rented">Rented</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <TextField
                  label="Estimated Value (KES)"
                  type="number"
                  value={homeForm.estimated_value || ''}
                  onChange={(e) => setHomeForm({ ...homeForm, estimated_value: parseInt(e.target.value) || undefined })}
                  fullWidth
                />
              </>
            )}

            {/* Office Form */}
            {formAssetType === 'Personal Office' && (
              <>
                <TextField
                  label="Business Name (Optional)"
                  value={officeForm.business_name || ''}
                  onChange={(e) => setOfficeForm({ ...officeForm, business_name: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Location / Address"
                  value={officeForm.location}
                  onChange={(e) => setOfficeForm({ ...officeForm, location: e.target.value })}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Office Type"
                      value={officeForm.office_type}
                      onChange={(e) => setOfficeForm({ ...officeForm, office_type: e.target.value as OfficeDetails['office_type'] })}
                      select
                      fullWidth
                    >
                      <MenuItem value="Owned">Owned</MenuItem>
                      <MenuItem value="Rented">Rented</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Estimated Value (KES)"
                      type="number"
                      value={officeForm.estimated_value || ''}
                      onChange={(e) => setOfficeForm({ ...officeForm, estimated_value: parseInt(e.target.value) || undefined })}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : selectedAsset ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Asset?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this {selectedAsset?.asset_type.toLowerCase()} from your assets?
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

export default AssetsManager;
