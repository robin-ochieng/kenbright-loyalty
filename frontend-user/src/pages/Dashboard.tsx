import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Stars as PointsIcon,
  CardGiftcard as RewardsIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

export default function Dashboard() {
  // Mock data - replace with actual data from Supabase
  const userData = {
    name: 'John Doe',
    points: 2450,
    tier: 'Gold',
    nextTier: 'Platinum',
    pointsToNextTier: 550,
    recentActivity: [
      { id: 1, type: 'earned', description: 'Purchase at Store A', points: 150, date: '2026-01-28' },
      { id: 2, type: 'redeemed', description: 'Coffee Voucher', points: -200, date: '2026-01-27' },
      { id: 3, type: 'earned', description: 'Purchase at Store B', points: 300, date: '2026-01-25' },
    ],
  };

  const tierProgress = ((3000 - userData.pointsToNextTier) / 3000) * 100;

  return (
    <Box>
      {/* Welcome Section */}
      <Typography variant="h5" gutterBottom>
        Welcome back, {userData.name.split(' ')[0]}!
      </Typography>

      {/* Points Card */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PointsIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Available Points
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {userData.points.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${userData.tier} Member`}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </CardContent>
      </Card>

      {/* Tier Progress */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress to {userData.nextTier}
            </Typography>
            <Typography variant="body2" color="primary">
              {userData.pointsToNextTier} points to go
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={tierProgress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RewardsIcon color="secondary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Rewards
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                +450
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Points This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Card>
        <CardContent sx={{ p: 0 }}>
          {userData.recentActivity.map((activity, index) => (
            <Box
              key={activity.id}
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: index < userData.recentActivity.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              <Box>
                <Typography variant="body1">{activity.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activity.date}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                fontWeight="bold"
                color={activity.points > 0 ? 'success.main' : 'error.main'}
              >
                {activity.points > 0 ? '+' : ''}{activity.points}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
