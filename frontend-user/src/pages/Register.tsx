import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  Link,
  Grid,
  MenuItem
} from '@mui/material';
import { supabase } from '../services/supabaseClient';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    nationalId: '',
    dateOfBirth: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Generate a unique referral code
  const generateReferralCode = (firstName: string) => {
    const randomNum = Math.floor(Math.random() * 10000);
    return `${firstName.toUpperCase().slice(0, 4)}${randomNum}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            national_id: formData.nationalId
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // 2. Create member profile in the members table
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          user_id: authData.user.id,
          email_address: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
          national_id: formData.nationalId,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          tier: 'BRONZE',
          referral_code: generateReferralCode(formData.firstName),
          country: 'Kenya',
          email_verified: false
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        // If member creation fails, we should inform user but auth was successful
        if (memberError.code === '23505') {
          throw new Error('A user with this email, phone number, or national ID already exists');
        }
        throw new Error('Account created but profile setup failed. Please contact support.');
      }

      // Success - show message about email verification
      setSuccess('Account created successfully! Please check your email to verify your account, then log in.');
      
      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        py: 4
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 3, sm: 4, md: 5 }, 
            width: '100%', 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="img"
              src="/Kenbright 360 Logo.png"
              alt="Kenbright 360"
              sx={{ 
                height: 55,
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 600, color: '#333' }}
          >
            Create Account
          </Typography>
          <Typography 
            variant="body1" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 3 }}
          >
            Join the Kenbright 360 Loyalty Program
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="nationalId"
                  label="National ID"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="phoneNumber"
                  label="Phone Number"
                  name="phoneNumber"
                  autoComplete="tel"
                  placeholder="+254700000000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="dateOfBirth"
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  id="gender"
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  size="medium"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  helperText="Minimum 6 characters"
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  size="medium"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 4, 
                mb: 2, 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
        
        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: 'block' }}
          >
            © 2025 KIBL. All rights reserved.
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ display: 'block', color: '#999999', fontSize: '0.7rem', mt: 0.5 }}
          >
            Powered by Kenbright AI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
