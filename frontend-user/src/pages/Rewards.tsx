import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { rewardsService } from '../services/rewardsService';
import { dashboardService } from '../services/dashboardService';
import { Reward, Redemption } from '../types';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HistoryIcon from '@mui/icons-material/History';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Rewards: React.FC = () => {
  const { member } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchData = async () => {
    if (!member) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [rewardsData, balanceData, redemptionsData] = await Promise.all([
        rewardsService.getRewards(),
        dashboardService.getMemberBalance(member.member_id),
        rewardsService.getMyRedemptions(member.member_id)
      ]);
      setRewards(rewardsData);
      setBalance(balanceData);
      setRedemptions(redemptionsData);
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [member]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRedeem = async (reward: Reward) => {
    if (balance < reward.points_cost) {
      setNotification({
        open: true,
        message: 'Insufficient points balance',
        severity: 'error'
      });
      return;
    }

    try {
      setRedeeming(reward.reward_id);
      await rewardsService.redeemReward(reward.reward_id);
      setNotification({
        open: true,
        message: 'Reward redeemed successfully!',
        severity: 'success'
      });
      // Refresh data
      fetchData();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.message || 'Failed to redeem reward',
        severity: 'error'
      });
    } finally {
      setRedeeming(null);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!member) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">
          No member profile found. Please contact support if this issue persists.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Rewards Catalog
        </Typography>
        <Chip 
          label={`Balance: ${balance} Points`} 
          color="primary" 
          variant="outlined" 
          sx={{ fontSize: '1.2rem', py: 2, px: 1 }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="rewards tabs">
          <Tab icon={<LocalOfferIcon />} label="Available Rewards" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label="My Redemptions" iconPosition="start" />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {rewards.map((reward) => (
            <Grid item xs={12} sm={6} md={4} key={reward.reward_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {reward.reward_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {reward.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {reward.points_cost} Points
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="large" 
                    variant="contained" 
                    fullWidth
                    disabled={balance < reward.points_cost || redeeming === reward.reward_id}
                    onClick={() => handleRedeem(reward)}
                  >
                    {redeeming === reward.reward_id ? 'Processing...' : 'Redeem'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {rewards.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">No rewards available at the moment.</Alert>
            </Grid>
          )}
        </Grid>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {redemptions.map((redemption) => (
            <Grid item xs={12} key={redemption.redemption_id}>
              <Card>
                <CardContent>
                  <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                      <Typography variant="h6">
                        {redemption.reward?.reward_name || 'Unknown Reward'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Redeemed on {new Date(redemption.redemption_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Chip 
                        label={redemption.status} 
                        color={redemption.status === 'Fulfilled' ? 'success' : 'warning'} 
                      />
                      <Typography variant="body1" sx={{ mt: 1, textAlign: 'right' }}>
                        -{redemption.points_spent} Points
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {redemptions.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">You haven't redeemed any rewards yet.</Alert>
            </Grid>
          )}
        </Grid>
      </CustomTabPanel>

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

export default Rewards;
