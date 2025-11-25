import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { LoyaltyTransaction } from '../types';
import RedeemIcon from '@mui/icons-material/Redeem';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Dashboard() {
  const { user, member } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [activities, setActivities] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!member) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const [balanceData, activityData] = await Promise.all([
          dashboardService.getMemberBalance(member.member_id),
          dashboardService.getRecentActivity(member.member_id)
        ]);
        setBalance(balanceData);
        setActivities(activityData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!member) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          No member profile found. Please contact support if this issue persists.
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Logged in as: {user?.email}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {member?.first_name || 'Member'}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Tier: <Chip label={member?.tier || 'BRONZE'} color="primary" size="small" />
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Points Summary Card */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 180,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              Total Points
            </Typography>
            <Typography component="p" variant="h2" sx={{ fontWeight: 'bold' }}>
              {balance.toLocaleString()}
            </Typography>
            <Typography sx={{ flex: 1, opacity: 0.8 }}>
              Available to redeem
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Activity Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, minHeight: 180 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Activity
            </Typography>
            
            {activities.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No recent activity found.
              </Typography>
            ) : (
              <List>
                {activities.map((activity, index) => (
                  <div key={activity.ledger_id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: activity.points_earned > 0 ? 'success.light' : 'warning.light' 
                        }}>
                          {activity.points_earned > 0 ? <TrendingUpIcon /> : <RedeemIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.transaction_type}
                        secondary={new Date(activity.transaction_date).toLocaleDateString()}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body1" 
                          color={activity.points_earned > 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {activity.points_earned > 0 ? `+${activity.points_earned}` : `-${activity.points_redeemed}`}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < activities.length - 1 && <Divider variant="inset" component="li" />}
                  </div>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
