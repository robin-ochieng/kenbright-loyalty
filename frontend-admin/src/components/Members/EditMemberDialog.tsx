import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Chip,
  Box,
} from '@mui/material';
import { Member, UpdateMemberData } from '../../services/memberService';

interface EditMemberDialogProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateMemberData) => Promise<void>;
}

const genderOptions = ['Male', 'Female', 'Other'];
const tierOptions = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const employmentOptions = ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired'];

const getTierColor = (tier: string): 'default' | 'warning' | 'info' | 'success' => {
  switch (tier) {
    case 'PLATINUM': return 'success';
    case 'GOLD': return 'warning';
    case 'SILVER': return 'info';
    default: return 'default';
  }
};

export default function EditMemberDialog({ open, member, onClose, onSubmit }: EditMemberDialogProps) {
  const [formData, setFormData] = useState<UpdateMemberData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        phone_number: member.phone_number,
        national_id: member.national_id,
        date_of_birth: member.date_of_birth?.slice(0, 10),
        gender: member.gender,
        tier: member.tier,
        physical_address: member.physical_address,
        postal_address: member.postal_address,
        city: member.city,
        country: member.country,
        employment_status: member.employment_status,
        employer_name: member.employer_name,
        occupation: member.occupation,
        email_verified: member.email_verified,
      });
    }
  }, [member]);

  const handleChange = (field: keyof UpdateMemberData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    setError(null);
    setLoading(true);

    try {
      await onSubmit(member.member_id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5">Edit Member</Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {member.member_id} • {member.email_address}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={member.tier} 
                color={getTierColor(member.tier)} 
                size="small" 
              />
              <Chip 
                label={member.email_verified ? 'Verified' : 'Unverified'} 
                color={member.email_verified ? 'success' : 'warning'} 
                variant="outlined"
                size="small" 
              />
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Personal Information */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.first_name || ''}
                onChange={handleChange('first_name')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.last_name || ''}
                onChange={handleChange('last_name')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="National ID"
                value={formData.national_id || ''}
                onChange={handleChange('national_id')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={handleChange('date_of_birth')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Gender"
                value={formData.gender || ''}
                onChange={handleChange('gender')}
                disabled={loading}
              >
                {genderOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Tier"
                value={formData.tier || ''}
                onChange={handleChange('tier')}
                disabled={loading}
              >
                {tierOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Contact Information */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={member.email_address}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={formData.phone_number || ''}
                onChange={handleChange('phone_number')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Physical Address"
                value={formData.physical_address || ''}
                onChange={handleChange('physical_address')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Address"
                value={formData.postal_address || ''}
                onChange={handleChange('postal_address')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="City"
                value={formData.city || ''}
                onChange={handleChange('city')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country || ''}
                onChange={handleChange('country')}
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Employment Information */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Employment Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Employment Status"
                value={formData.employment_status || ''}
                onChange={handleChange('employment_status')}
                disabled={loading}
              >
                <MenuItem value="">-- Select --</MenuItem>
                {employmentOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Employer Name"
                value={formData.employer_name || ''}
                onChange={handleChange('employer_name')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Occupation"
                value={formData.occupation || ''}
                onChange={handleChange('occupation')}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Member Stats */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Member Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Points Balance</Typography>
              <Typography variant="h6">{member.points_balance?.toLocaleString() || 0}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Referral Code</Typography>
              <Typography variant="h6">{member.referral_code || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Member Since</Typography>
              <Typography variant="h6">
                {new Date(member.created_at).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              <Typography variant="h6">
                {member.updated_at ? new Date(member.updated_at).toLocaleDateString() : 'Never'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
