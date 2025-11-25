import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  alpha,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { supabase } from '../services/supabaseClient';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import RedeemIcon from '@mui/icons-material/Redeem';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';

// Stats interface
interface DashboardStats {
  totalMembers: number;
  activeRewards: number;
  pendingKyc: number;
  totalPayments: number;
  pendingRedemptions: number;
  totalRedemptions: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeRewards: 0,
    pendingKyc: 0,
    totalPayments: 0,
    pendingRedemptions: 0,
    totalRedemptions: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics from database
  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        membersResult,
        rewardsResult,
        pendingKycResult,
        paymentsResult,
        pendingRedemptionsResult,
        totalRedemptionsResult
      ] = await Promise.all([
        // Total members count
        supabase.from('members').select('*', { count: 'exact', head: true }),
        // Active rewards count
        supabase.from('rewards_catalog').select('*', { count: 'exact', head: true }).eq('is_active', true),
        // Pending KYC (members without verified email or incomplete profile)
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('email_verified', false),
        // Total payments this month
        supabase.from('payments').select('amount_paid'),
        // Pending redemptions
        supabase.from('points_redemptions').select('*', { count: 'exact', head: true }).eq('status', 'Requested'),
        // Total redemptions
        supabase.from('points_redemptions').select('*', { count: 'exact', head: true })
      ]);

      // Calculate total payment amount
      const totalPaymentAmount = paymentsResult.data?.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0) || 0;

      setStats({
        totalMembers: membersResult.count || 0,
        activeRewards: rewardsResult.count || 0,
        pendingKyc: pendingKycResult.count || 0,
        totalPayments: totalPaymentAmount,
        pendingRedemptions: pendingRedemptionsResult.count || 0,
        totalRedemptions: totalRedemptionsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(1)}K`;
    }
    return `KES ${amount.toLocaleString()}`;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Card configurations with icons and colors - now using dynamic stats
  const getDashboardCards = () => [
    {
      title: 'Members',
      subtitle: 'Manage customer profiles',
      description: 'View, search, and manage customer profiles with KYC data.',
      icon: PeopleIcon,
      path: '/members',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      stats: formatNumber(stats.totalMembers),
      statsLabel: 'Total Members'
    },
    {
      title: 'Payments',
      subtitle: 'Reconciliation Engine',
      description: 'View payment history and run manual reconciliation processes.',
      icon: PaymentIcon,
      path: '/payments',
      color: '#10b981',
      bgColor: '#ecfdf5',
      stats: formatCurrency(stats.totalPayments),
      statsLabel: 'Total Collected'
    },
    {
      title: 'Rewards',
      subtitle: 'Catalog Management',
      description: 'Add, edit, and manage redeemable rewards and stock.',
      icon: CardGiftcardIcon,
      path: '/rewards',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      stats: formatNumber(stats.activeRewards),
      statsLabel: 'Active Rewards'
    },
    {
      title: 'Redemptions',
      subtitle: 'Fulfillment Center',
      description: 'Process and fulfill member redemption requests.',
      icon: RedeemIcon,
      path: '/redemptions',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      stats: formatNumber(stats.pendingRedemptions),
      statsLabel: 'Pending'
    },
    {
      title: 'Analytics',
      subtitle: 'Business Intelligence',
      description: 'View system metrics, growth charts, and performance reports.',
      icon: AnalyticsIcon,
      path: '/analytics',
      color: '#ec4899',
      bgColor: '#fdf2f8',
      stats: formatNumber(stats.totalRedemptions),
      statsLabel: 'Total Redemptions'
    },
    {
      title: 'KYC Verification',
      subtitle: 'Document Review',
      description: 'Review and approve customer KYC information.',
      icon: VerifiedUserIcon,
      path: '/kyc',
      color: '#06b6d4',
      bgColor: '#ecfeff',
      stats: formatNumber(stats.pendingKyc),
      statsLabel: 'Pending Review'
    },
    {
      title: 'Audit Logs',
      subtitle: 'System Activity',
      description: 'Track system events, transactions, and user activities.',
      icon: HistoryIcon,
      path: '/audit',
      color: '#64748b',
      bgColor: '#f8fafc',
      stats: '-',
      statsLabel: 'View Activity'
    }
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || 'User');
      }
    };
    getUser();
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
              <DashboardIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Kenbright 360
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Admin Portal
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh Statistics">
              <IconButton 
                onClick={handleRefresh} 
                disabled={loading}
                sx={{ color: 'white' }}
              >
                <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              </IconButton>
            </Tooltip>
            <Chip 
              avatar={<Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3) !important' }}><PersonIcon sx={{ color: 'white', fontSize: 18 }} /></Avatar>}
              label={userEmail?.split('@')[0] || 'Admin'}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                color: 'white',
                '& .MuiChip-label': { fontWeight: 500 }
              }}
            />
            <Tooltip title="Logout">
              <Button 
                variant="outlined"
                size="small"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Logout
              </Button>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box 
          sx={{ 
            mb: 4,
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative circles */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: '40%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>
              {getGreeting()}
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {userEmail?.split('@')[0] || 'Admin'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 600 }}>
              Manage your Kenbright 360 loyalty program. Monitor members, process payments, 
              manage rewards, and track system performance from this central dashboard.
            </Typography>
            
            {/* Quick Stats */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mt: 3 }}>
              {[
                { label: 'Total Members', value: loading ? '...' : formatNumber(stats.totalMembers), icon: <PeopleIcon fontSize="small" /> },
                { label: 'Active Rewards', value: loading ? '...' : formatNumber(stats.activeRewards), icon: <CardGiftcardIcon fontSize="small" /> },
                { label: 'Pending KYC', value: loading ? '...' : formatNumber(stats.pendingKyc), icon: <VerifiedUserIcon fontSize="small" /> },
              ].map((stat) => (
                <Box key={stat.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{stat.value}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{stat.label}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Dashboard Cards */}
        <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 3 }}>
          Quick Access
        </Typography>
        
        <Grid container spacing={3}>
          {getDashboardCards().map((card) => {
            const IconComponent = card.icon;
            return (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={card.title}>
                <Card 
                  onClick={() => navigate(card.path)}
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px ${alpha(card.color, 0.15)}`,
                      borderColor: card.color,
                      '& .card-arrow': {
                        opacity: 1,
                        transform: 'translateX(0)'
                      },
                      '& .card-icon-bg': {
                        transform: 'scale(1.1)'
                      }
                    }
                  }}
                >
                  {/* Top accent line */}
                  <Box sx={{ 
                    height: 4, 
                    background: `linear-gradient(90deg, ${card.color}, ${alpha(card.color, 0.5)})` 
                  }} />
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar 
                        className="card-icon-bg"
                        sx={{ 
                          bgcolor: card.bgColor, 
                          width: 56, 
                          height: 56,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <IconComponent sx={{ color: card.color, fontSize: 28 }} />
                      </Avatar>
                      <Chip 
                        label={card.stats}
                        size="small"
                        sx={{ 
                          bgcolor: card.bgColor,
                          color: card.color,
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color={card.color} fontWeight="500" sx={{ mb: 1 }}>
                      {card.subtitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {card.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.disabled">
                        {card.statsLabel}
                      </Typography>
                      <Box 
                        className="card-arrow"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: card.color,
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          opacity: 0,
                          transform: 'translateX(-10px)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Open
                        <ArrowForwardIcon sx={{ fontSize: 18 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 KIBL. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Powered by Kenbright AI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
