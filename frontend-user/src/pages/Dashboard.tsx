import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  Stack
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { LoyaltyTransaction } from '../types';
import RedeemIcon from '@mui/icons-material/Redeem';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ShieldIcon from '@mui/icons-material/Shield';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';

// Tier configurations
const tierConfig = {
  BRONZE: { color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', nextTier: 'SILVER', pointsNeeded: 1000, icon: '🥉' },
  SILVER: { color: '#C0C0C0', gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)', nextTier: 'GOLD', pointsNeeded: 5000, icon: '🥈' },
  GOLD: { color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', nextTier: 'PLATINUM', pointsNeeded: 15000, icon: '🥇' },
  PLATINUM: { color: '#E5E4E2', gradient: 'linear-gradient(135deg, #E5E4E2 0%, #BCC6CC 100%)', nextTier: null, pointsNeeded: null, icon: '💎' },
};

export default function Dashboard() {
  const { user, member } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [activities, setActivities] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!member) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
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

  useEffect(() => {
    fetchData();
  }, [member]);

  const currentTier = (member?.tier?.toUpperCase() || 'BRONZE') as keyof typeof tierConfig;
  const tierInfo = tierConfig[currentTier] || tierConfig.BRONZE;
  const progressToNextTier = tierInfo.pointsNeeded 
    ? Math.min((balance / tierInfo.pointsNeeded) * 100, 100) 
    : 100;

  // Calculate stats
  const totalEarned = activities.reduce((sum, a) => sum + (a.points_earned || 0), 0);
  const totalRedeemed = activities.reduce((sum, a) => sum + (a.points_redeemed || 0), 0);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh',
        gap: 2
      }}>
        <CircularProgress size={48} />
        <Typography color="text.secondary">Loading your dashboard...</Typography>
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
      <Container maxWidth="md">
        <Card 
          elevation={0}
          sx={{ 
            mt: 4, 
            textAlign: 'center',
            backgroundColor: '#fff8e1',
            border: '1px solid #ffecb3',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom color="warning.dark">
                Member Profile Not Found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your account ({user?.email}) doesn't have a linked member profile yet.
              </Typography>
            </Box>
            <Alert severity="info" sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="body2">
                <strong>What does this mean?</strong><br />
                Your login was successful, but you need a member profile to access the loyalty program features.
                This typically happens when:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>You're a new user and your profile is being set up</li>
                <li>You signed up with a different email than your insurance policy</li>
                <li>Your profile needs to be linked by an administrator</li>
              </ul>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Please contact support at <strong>support@kenbright.co.ke</strong> or call <strong>+254 700 000 000</strong> for assistance.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box sx={{ pb: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Welcome Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%)',
          color: 'white',
          pt: 4,
          pb: 12,
          px: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: '20%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          top: '30%',
          left: '60%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }} />
        
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5, letterSpacing: 1 }}>
                {getGreeting().toUpperCase()}
              </Typography>
              <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
                {member?.first_name || 'Member'} {member?.last_name || ''}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mb: 3, maxWidth: 500 }}>
                Welcome to your Kenbright 360 loyalty dashboard. Track your points, redeem rewards, and manage your insurance benefits.
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip 
                  icon={<WorkspacePremiumIcon sx={{ color: `${tierInfo.color} !important` }} />}
                  label={`${currentTier} MEMBER`}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    py: 2.5,
                    px: 1,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }} 
                />
                <Chip 
                  icon={<VerifiedIcon sx={{ color: '#4caf50 !important' }} />}
                  label="Verified"
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(76, 175, 80, 0.2)', 
                    color: '#a5d6a7',
                    fontWeight: '500',
                  }} 
                />
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={fetchData} 
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
        {/* Stats Cards Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Points Balance Card */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Box sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }} />
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <AccountBalanceWalletIcon />
                  </Avatar>
                  <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {balance.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Available Points
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Earned */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#dcfce7', width: 48, height: 48 }}>
                    <TrendingUpIcon sx={{ color: '#16a34a' }} />
                  </Avatar>
                  <Chip 
                    icon={<TrendingUpIcon sx={{ fontSize: 14, color: '#16a34a !important' }} />}
                    label="+12%" 
                    size="small" 
                    sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 'bold' }} 
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                  {totalEarned.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Points Earned
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Redeemed */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#fef3c7', width: 48, height: 48 }}>
                    <CardGiftcardIcon sx={{ color: '#d97706' }} />
                  </Avatar>
                  <Chip 
                    label={`${activities.filter(a => a.points_redeemed > 0).length} redeems`} 
                    size="small" 
                    sx={{ bgcolor: '#fef3c7', color: '#d97706', fontSize: '0.7rem', fontWeight: 'bold' }} 
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                  {totalRedeemed.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Points Redeemed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Transactions Count */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ede9fe', width: 48, height: 48 }}>
                    <HistoryIcon sx={{ color: '#7c3aed' }} />
                  </Avatar>
                  <Chip 
                    label="All time" 
                    size="small" 
                    sx={{ bgcolor: '#ede9fe', color: '#7c3aed', fontSize: '0.7rem', fontWeight: 'bold' }} 
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                  {activities.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Tier Progress Card */}
          <Grid item xs={12} lg={8}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#fef3c7', width: 40, height: 40 }}>
                      <EmojiEventsIcon sx={{ color: '#d97706' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        Membership Tier
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your loyalty status and progress
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    View Benefits
                  </Button>
                </Box>

                {/* Tier badges */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 1 }}>
                  {Object.entries(tierConfig).map(([tier, config]) => (
                    <Box 
                      key={tier}
                      sx={{ 
                        textAlign: 'center',
                        opacity: currentTier === tier ? 1 : 0.5,
                        transform: currentTier === tier ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Box sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        background: currentTier === tier ? config.gradient : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                        border: currentTier === tier ? `3px solid ${config.color}` : '3px solid transparent',
                        boxShadow: currentTier === tier ? `0 4px 15px ${config.color}40` : 'none'
                      }}>
                        <Typography fontSize={20}>{config.icon}</Typography>
                      </Box>
                      <Typography 
                        variant="caption" 
                        fontWeight={currentTier === tier ? 'bold' : 'normal'}
                        color={currentTier === tier ? 'text.primary' : 'text.secondary'}
                      >
                        {tier}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Progress bar */}
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="500" color="text.primary">
                      Progress to {tierInfo.nextTier || 'Max Tier'}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {progressToNextTier.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressToNextTier}
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: tierInfo.gradient
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {balance.toLocaleString()} points
                    </Typography>
                    {tierInfo.nextTier && (
                      <Typography variant="caption" color="text.secondary">
                        {tierInfo.pointsNeeded?.toLocaleString()} points needed
                      </Typography>
                    )}
                  </Box>
                </Box>

                {tierInfo.nextTier ? (
                  <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                    <Typography variant="body2">
                      Earn <strong>{Math.max(0, tierInfo.pointsNeeded! - balance).toLocaleString()}</strong> more points to unlock <strong>{tierInfo.nextTier}</strong> benefits!
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ borderRadius: 2, mt: 2 }}>
                    <Typography variant="body2">
                      🎉 Congratulations! You've reached the highest tier and enjoy all premium benefits!
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions Card */}
          <Grid item xs={12} lg={4}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage your account
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { icon: <CardGiftcardIcon />, title: 'Redeem Rewards', desc: 'Browse & claim rewards', path: '/rewards', color: '#f97316', bg: '#fff7ed' },
                    { icon: <ShieldIcon />, title: 'My Products', desc: 'View insurance policies', path: '/products', color: '#3b82f6', bg: '#eff6ff' },
                    { icon: <HistoryIcon />, title: 'Activity History', desc: 'View all transactions', path: '/activity', color: '#8b5cf6', bg: '#f5f3ff' },
                    { icon: <PersonIcon />, title: 'My Profile', desc: 'Update your details', path: '/profile', color: '#10b981', bg: '#ecfdf5' },
                  ].map((action) => (
                    <Box 
                      key={action.title}
                      onClick={() => navigate(action.path)}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        p: 2, 
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          bgcolor: action.bg, 
                          borderColor: action.color,
                          transform: 'translateX(4px)',
                          boxShadow: `0 4px 12px ${action.color}20`
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: action.bg, width: 44, height: 44 }}>
                        <Box sx={{ color: action.color }}>{action.icon}</Box>
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="600" color="text.primary">{action.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
                      </Box>
                      <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity Card */}
          <Grid item xs={12}>
            <Card 
              elevation={0}
              sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#ede9fe', width: 40, height: 40 }}>
                      <HistoryIcon sx={{ color: '#7c3aed' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        Recent Activity
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your latest transactions
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="text" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/activity')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
                
                {activities.length === 0 ? (
                  <Box sx={{ 
                    py: 8, 
                    textAlign: 'center',
                    bgcolor: '#f8fafc',
                    borderRadius: 3,
                    border: '2px dashed #e2e8f0'
                  }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: '#f1f5f9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <HistoryIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
                    </Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No activity yet
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                      Your points transactions will appear here once you start earning rewards
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/products')}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Explore Products
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ 
                    bgcolor: '#f8fafc', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0'
                  }}>
                    {/* Table Header */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 120px 100px',
                      gap: 2,
                      p: 2,
                      bgcolor: '#f1f5f9',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <Typography variant="caption" fontWeight="600" color="text.secondary">TRANSACTION</Typography>
                      <Typography variant="caption" fontWeight="600" color="text.secondary">DATE</Typography>
                      <Typography variant="caption" fontWeight="600" color="text.secondary">TYPE</Typography>
                      <Typography variant="caption" fontWeight="600" color="text.secondary" textAlign="right">POINTS</Typography>
                    </Box>
                    
                    {activities.slice(0, 5).map((activity, index) => (
                      <Box 
                        key={activity.ledger_id}
                        sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr 120px 100px',
                          gap: 2,
                          p: 2,
                          alignItems: 'center',
                          bgcolor: 'white',
                          borderBottom: index < Math.min(activities.length, 5) - 1 ? '1px solid #e2e8f0' : 'none',
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ 
                            bgcolor: activity.points_earned > 0 ? '#dcfce7' : '#fef3c7',
                            width: 36,
                            height: 36
                          }}>
                            {activity.points_earned > 0 
                              ? <TrendingUpIcon sx={{ color: '#16a34a', fontSize: 18 }} /> 
                              : <TrendingDownIcon sx={{ color: '#d97706', fontSize: 18 }} />
                            }
                          </Avatar>
                          <Typography variant="body2" fontWeight="500">
                            {activity.transaction_type}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(activity.transaction_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                        <Chip
                          label={activity.points_earned > 0 ? 'Earned' : 'Redeemed'}
                          size="small"
                          sx={{
                            fontWeight: '500',
                            fontSize: '0.7rem',
                            bgcolor: activity.points_earned > 0 ? '#dcfce7' : '#fef3c7',
                            color: activity.points_earned > 0 ? '#16a34a' : '#d97706',
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          textAlign="right"
                          color={activity.points_earned > 0 ? '#16a34a' : '#dc2626'}
                        >
                          {activity.points_earned > 0 
                            ? `+${activity.points_earned.toLocaleString()}` 
                            : `-${activity.points_redeemed.toLocaleString()}`
                          }
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
