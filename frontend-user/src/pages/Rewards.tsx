import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import { Stars as PointsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Rewards() {
  const navigate = useNavigate();

  // Mock data - replace with actual data from Supabase
  const rewards = [
    {
      id: 1,
      name: 'Coffee Voucher',
      description: 'Get a free coffee at any participating cafe',
      points: 200,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
      category: 'Food & Beverage',
      available: true,
    },
    {
      id: 2,
      name: 'Movie Ticket',
      description: 'One free movie ticket at any cinema',
      points: 500,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300',
      category: 'Entertainment',
      available: true,
    },
    {
      id: 3,
      name: 'Fuel Discount',
      description: 'KES 500 off on your next fuel purchase',
      points: 400,
      image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=300',
      category: 'Fuel',
      available: true,
    },
    {
      id: 4,
      name: 'Shopping Voucher',
      description: 'KES 1000 shopping voucher at partner stores',
      points: 800,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300',
      category: 'Shopping',
      available: true,
    },
    {
      id: 5,
      name: 'Spa Treatment',
      description: 'Relaxing spa session at premium partners',
      points: 1500,
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300',
      category: 'Wellness',
      available: false,
    },
    {
      id: 6,
      name: 'Weekend Getaway',
      description: '2 nights stay at a resort',
      points: 5000,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300',
      category: 'Travel',
      available: false,
    },
  ];

  const userPoints = 2450;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Available Rewards
        </Typography>
        <Chip
          icon={<PointsIcon />}
          label={`${userPoints.toLocaleString()} pts`}
          color="primary"
        />
      </Box>

      <Grid container spacing={2}>
        {rewards.map((reward) => {
          const canRedeem = userPoints >= reward.points && reward.available;
          
          return (
            <Grid item xs={12} sm={6} key={reward.id}>
              <Card sx={{ height: '100%', opacity: reward.available ? 1 : 0.6 }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={reward.image}
                  alt={reward.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {reward.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={reward.category}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {reward.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="secondary.main" fontWeight="bold">
                      {reward.points} pts
                    </Typography>
                    <Button
                      variant={canRedeem ? 'contained' : 'outlined'}
                      size="small"
                      disabled={!canRedeem}
                      onClick={() => navigate('/redeem', { state: { reward } })}
                    >
                      {!reward.available ? 'Coming Soon' : canRedeem ? 'Redeem' : 'Not Enough Points'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
