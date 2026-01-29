import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export default function RedeemRewards() {
  const location = useLocation();
  const navigate = useNavigate();
  const reward = location.state?.reward;
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!reward) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No reward selected
        </Typography>
        <Button variant="contained" onClick={() => navigate('/rewards')} sx={{ mt: 2 }}>
          Browse Rewards
        </Button>
      </Box>
    );
  }

  const handleRedeem = async () => {
    setLoading(true);
    try {
      // TODO: Implement Supabase redemption
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch (error) {
      console.error('Redemption failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Confirm Redemption
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {reward.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {reward.description}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will deduct <strong>{reward.points} points</strong> from your balance.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/rewards')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setConfirmOpen(true)}
            >
              Redeem Now
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Redemption</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to redeem <strong>{reward.name}</strong> for{' '}
            <strong>{reward.points} points</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRedeem} variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onClose={() => navigate('/rewards')}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Redemption Successful!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your {reward.name} voucher has been sent to your email.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/rewards')}>
            Back to Rewards
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
