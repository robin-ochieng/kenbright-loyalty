import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Chip,
  MenuItem,
  Stack,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LockResetIcon from '@mui/icons-material/LockReset';
import { supabase } from '../services/supabaseClient';
import { DependentsManager } from '../components/Profile/DependentsManager';
import { AssetsManager } from '../components/Profile/AssetsManager';

type ProfileForm = {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  national_id: string;
  date_of_birth: string;
  gender: '' | 'Male' | 'Female' | 'Other';
  physical_address: string;
  postal_address: string;
  city: string;
  country: string;
  employment_status: string;
  employer_name: string;
  occupation: string;
};

const genderOptions = ['Male', 'Female', 'Other'];

const Profile: React.FC = () => {
  const { member, loading, refreshMember } = useAuth();
  const [formData, setFormData] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email_address: member.email_address || '',
        phone_number: member.phone_number || '',
        national_id: member.national_id || '',
        date_of_birth: member.date_of_birth ? member.date_of_birth.slice(0, 10) : '',
        gender: member.gender || '',
        physical_address: member.physical_address || '',
        postal_address: member.postal_address || '',
        city: member.city || '',
        country: member.country || 'Kenya',
        employment_status: member.employment_status || '',
        employer_name: member.employer_name || '',
        occupation: member.occupation || '',
      });
    }
  }, [member]);

  const handleChange = (field: keyof ProfileForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAvatarUploadClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !member) return;

    try {
      setAvatarUploading(true);
      await profileService.uploadAvatar(member.member_id, member.user_id, file);
      await refreshMember();
      setNotification({ open: true, message: 'Avatar updated successfully', severity: 'success' });
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      setNotification({ open: true, message: error.message || 'Failed to upload avatar', severity: 'error' });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordFieldChange = (field: 'newPassword' | 'confirmPassword') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPasswordForm((prev) => ({ ...prev, [field]: value }));
    };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please provide and confirm your new password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setPasswordError(null);
      setPasswordLoading(true);
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      setNotification({ open: true, message: 'Password updated successfully', severity: 'success' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Failed to update password:', error);
      setNotification({ open: true, message: error.message || 'Failed to update password', severity: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!member?.email_address) return;
    try {
      setSendingReset(true);
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(member.email_address, {
        redirectTo,
      });
      if (error) throw error;
      setNotification({ open: true, message: 'Password reset email sent', severity: 'success' });
    } catch (error: any) {
      console.error('Failed to send reset email:', error);
      setNotification({ open: true, message: error.message || 'Failed to send reset email', severity: 'error' });
    } finally {
      setSendingReset(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!member || !formData) return;

    try {
      setSaving(true);
      const { gender, ...rest } = formData;
      await profileService.updateMember(member.member_id, {
        ...rest,
        gender: gender || undefined,
        date_of_birth: formData.date_of_birth,
      });
      await refreshMember();
      setNotification({ open: true, message: 'Profile updated successfully', severity: 'success' });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setNotification({ open: true, message: error.message || 'Failed to update profile', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => setNotification((prev) => ({ ...prev, open: false }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!member) {
    return (
      <Box sx={{ mt: 4, px: 2 }}>
        <Alert severity="warning">
          No member profile found. Please contact support if this issue persists.
        </Alert>
      </Box>
    );
  }

  if (!formData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">My Profile</Typography>
          <Typography color="text.secondary">
            Review your details and keep them up to date.
          </Typography>
        </Box>
        <Chip label={`Tier: ${member?.tier}`} color="primary" variant="outlined" sx={{ ml: 'auto' }} />
      </Stack>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={member?.avatar_url || undefined}
            alt={member ? `${member.first_name} ${member.last_name}` : 'Profile avatar'}
            sx={{ width: 88, height: 88 }}
          />
          <Tooltip title={avatarUploading ? 'Uploading...' : 'Upload new photo'}>
            <span>
              <IconButton color="primary" onClick={handleAvatarUploadClick} disabled={avatarUploading}>
                <PhotoCameraIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Box>
          <Typography variant="subtitle1">Profile Photo</Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a clear square image (JPG or PNG, max 2MB).
          </Typography>
          {avatarUploading && (
            <Typography variant="caption" color="text.secondary">
              Uploading image...
            </Typography>
          )}
        </Box>
      </Box>

      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleAvatarChange}
      />

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Personal Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange('last_name')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                value={formData.email_address}
                fullWidth
                InputProps={{ readOnly: true }}
                helperText="Email is managed through authentication"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                value={formData.phone_number}
                onChange={handleChange('phone_number')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="National ID"
                value={formData.national_id}
                onChange={handleChange('national_id')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange('date_of_birth')}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Gender"
                value={formData.gender}
                onChange={handleChange('gender')}
                select
                fullWidth
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Physical Address"
                value={formData.physical_address}
                onChange={handleChange('physical_address')}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Postal Address"
                value={formData.postal_address}
                onChange={handleChange('postal_address')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Country"
                value={formData.country}
                onChange={handleChange('country')}
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Employment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Employment Status"
                value={formData.employment_status}
                onChange={handleChange('employment_status')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Employer Name"
                value={formData.employer_name}
                onChange={handleChange('employer_name')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Occupation"
                value={formData.occupation}
                onChange={handleChange('occupation')}
                fullWidth
              />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <LockResetIcon color="primary" />
          <Box>
            <Typography variant="h6">Password & Security</Typography>
            <Typography variant="body2" color="text.secondary">
              Update your password or request a reset link via email.
            </Typography>
          </Box>
        </Stack>

        <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordFieldChange('newPassword')}
                fullWidth
                required
                autoComplete="new-password"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Confirm Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordFieldChange('confirmPassword')}
                fullWidth
                required
                autoComplete="new-password"
                error={Boolean(passwordError)}
                helperText={passwordError || ' '}
              />
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleSendResetLink}
              disabled={sendingReset}
            >
              {sendingReset ? 'Sending link...' : 'Email me a reset link'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Dependents Section */}
      {member && (
        <DependentsManager
          memberId={member.member_id}
          onNotification={(message, severity) => setNotification({ open: true, message, severity })}
        />
      )}

      {/* Assets Section */}
      {member && (
        <AssetsManager
          memberId={member.member_id}
          onNotification={(message, severity) => setNotification({ open: true, message, severity })}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
