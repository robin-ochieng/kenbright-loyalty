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
  Divider,
  Stack
} from '@mui/material';
import { supabase } from '../services/supabaseClient';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      // For now, only Google is fully configured
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
        });
        if (error) throw error;
      } else {
        // Placeholder for Facebook and Twitter
        setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in coming soon!`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate social login');
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
            p: { xs: 4, sm: 5, md: 6 }, 
            width: '100%', 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/Kenbright 360 Logo.png"
              alt="Kenbright 360"
              sx={{ 
                height: 60,
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
            sx={{ fontWeight: 600, color: '#333', mb: 1 }}
          >
            Welcome Back
          </Typography>
          <Typography 
            variant="body1" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 4 }}
          >
            Sign in to access your loyalty account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 3, 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR CONTINUE WITH
              </Typography>
            </Divider>

            {/* Social Login Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialLogin('google')}
                sx={{ 
                  py: 1.5,
                  borderColor: '#db4437',
                  color: '#db4437',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#c33d2e',
                    backgroundColor: 'rgba(219, 68, 55, 0.04)'
                  }
                }}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={() => handleSocialLogin('facebook')}
                sx={{ 
                  py: 1.5,
                  borderColor: '#1877f2',
                  color: '#1877f2',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#166fe5',
                    backgroundColor: 'rgba(24, 119, 242, 0.04)'
                  }
                }}
              >
                Facebook
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TwitterIcon />}
                onClick={() => handleSocialLogin('twitter')}
                sx={{ 
                  py: 1.5,
                  borderColor: '#1da1f2',
                  color: '#1da1f2',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#1a91da',
                    backgroundColor: 'rgba(29, 161, 242, 0.04)'
                  }
                }}
              >
                Twitter
              </Button>
            </Stack>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              justifyContent="space-between" 
              alignItems="center"
              spacing={1}
              sx={{ mt: 2 }}
            >
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Forgot password?
              </Link>
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Don't have an account? Sign Up
              </Link>
            </Stack>
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
