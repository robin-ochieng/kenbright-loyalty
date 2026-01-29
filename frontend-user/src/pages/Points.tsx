import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { Stars as PointsIcon } from '@mui/icons-material';

export default function Points() {
  // Mock data - replace with actual data from Supabase
  const pointsHistory = [
    { id: 1, type: 'earned', description: 'Purchase at Electronics Store', points: 500, date: '2026-01-28', category: 'Shopping' },
    { id: 2, type: 'earned', description: 'Grocery Purchase', points: 150, date: '2026-01-27', category: 'Groceries' },
    { id: 3, type: 'redeemed', description: 'Coffee Voucher Redemption', points: -200, date: '2026-01-26', category: 'Redemption' },
    { id: 4, type: 'earned', description: 'Restaurant Bill', points: 300, date: '2026-01-25', category: 'Dining' },
    { id: 5, type: 'bonus', description: 'Monthly Bonus Points', points: 100, date: '2026-01-24', category: 'Bonus' },
    { id: 6, type: 'earned', description: 'Fuel Purchase', points: 75, date: '2026-01-23', category: 'Fuel' },
  ];

  const totalPoints = 2450;
  const earnedThisMonth = 1125;
  const redeemedThisMonth = 200;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Points
      </Typography>

      {/* Points Summary Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ff9800 0%, #ffc947 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <PointsIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h3" fontWeight="bold">
              {totalPoints.toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Total Points Balance
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h5" color="success.main" fontWeight="bold">
              +{earnedThisMonth}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Earned This Month
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h5" color="error.main" fontWeight="bold">
              -{redeemedThisMonth}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redeemed This Month
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Points History */}
      <Typography variant="h6" gutterBottom>
        Points History
      </Typography>
      <Card>
        <List sx={{ p: 0 }}>
          {pointsHistory.map((item, index) => (
            <Box key={item.id}>
              <ListItem sx={{ py: 2 }}>
                <ListItemText
                  primary={item.description}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.date}
                      </Typography>
                      <Chip label={item.category} size="small" variant="outlined" />
                    </Box>
                  }
                />
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={item.points > 0 ? 'success.main' : 'error.main'}
                >
                  {item.points > 0 ? '+' : ''}{item.points}
                </Typography>
              </ListItem>
              {index < pointsHistory.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Card>
    </Box>
  );
}
