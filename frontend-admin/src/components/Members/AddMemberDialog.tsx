import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { CreateMemberData } from '../../services/memberService';

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMemberData) => Promise<void>;
}

const initialFormData: CreateMemberData = {
  first_name: '',
  last_name: '',
  email_address: '',
  phone_number: '',
  national_id: '',
  date_of_birth: '',
  gender: 'Male',
  tier: 'BRONZE',
  physical_address: '',
  postal_address: '',
  city: 'Nairobi',
  country: 'Kenya',
  employment_status: '',
  employer_name: '',
  occupation: '',
  send_welcome_email: true,
};

const genderOptions = ['Male', 'Female', 'Other'];
const tierOptions = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const employmentOptions = ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired'];

export default function AddMemberDialog({ open, onClose, onSubmit }: AddMemberDialogProps) {
  const [formData, setFormData] = useState<CreateMemberData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof CreateMemberData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.first_name || !formData.last_name) {
      setError('First and last name are required');
      return;
    }
    if (!formData.email_address || !formData.email_address.includes('@')) {
      setError('Valid email address is required');
      return;
    }
    if (!formData.phone_number) {
      setError('Phone number is required');
      return;
    }
    if (!formData.national_id) {
      setError('National ID is required');
      return;
    }
    if (!formData.date_of_birth) {
      setError('Date of birth is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData(initialFormData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h5">Add New Member</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new loyalty program member
          </Typography>
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
                value={formData.first_name}
                onChange={handleChange('first_name')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange('last_name')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="National ID"
                value={formData.national_id}
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
                value={formData.date_of_birth}
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
                value={formData.gender}
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
                label="Initial Tier"
                value={formData.tier}
                onChange={handleChange('tier')}
                disabled={loading}
                helperText="Set initial loyalty tier"
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
                required
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email_address}
                onChange={handleChange('email_address')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={formData.phone_number}
                onChange={handleChange('phone_number')}
                placeholder="+254700000000"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Physical Address"
                value={formData.physical_address}
                onChange={handleChange('physical_address')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Address"
                value={formData.postal_address}
                onChange={handleChange('postal_address')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleChange('country')}
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Employment Information */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Employment Information (Optional)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Employment Status"
                value={formData.employment_status}
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
                value={formData.employer_name}
                onChange={handleChange('employer_name')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Occupation"
                value={formData.occupation}
                onChange={handleChange('occupation')}
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Account Setup */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Account Setup
          </Typography>
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.send_welcome_email}
                  onChange={handleChange('send_welcome_email')}
                  disabled={loading}
                />
              }
              label="Send welcome email with password setup link"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              The member will receive an email to set their password and access the portal.
            </Typography>
          </Box>
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
            {loading ? 'Creating...' : 'Create Member'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
