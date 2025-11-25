import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress,
  Card,
  CardContent,
  Container,
  Stack,
  IconButton,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Redeem as RedeemIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  DateRange as DateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { analyticsService, AnalyticsSummary } from '../services/analyticsService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [memberGrowth, setMemberGrowth] = useState<any[]>([]);
  const [pointsActivity, setPointsActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, members, points] = await Promise.all([
        analyticsService.getSummaryStats(),
        analyticsService.getMemberGrowthData(),
        analyticsService.getPointsActivityData()
      ]);
      setSummary(stats);
      setMemberGrowth(members);
      setPointsActivity(points);
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

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
        <Typography color="text.secondary">Loading analytics data...</Typography>
      </Box>
    );
  }

  const statsCards = [
    { 
      label: 'Total Members', 
      value: summary?.totalMembers || 0, 
      icon: <PeopleIcon />, 
      color: '#3b82f6', 
      bg: '#eff6ff',
      trend: '+12%',
      trendUp: true 
    },
    { 
      label: 'Points Issued', 
      value: (summary?.totalPointsIssued || 0).toLocaleString(), 
      icon: <TrendingUpIcon />, 
      color: '#10b981', 
      bg: '#dcfce7',
      trend: '+8%',
      trendUp: true 
    },
    { 
      label: 'Points Redeemed', 
      value: (summary?.totalPointsRedeemed || 0).toLocaleString(), 
      icon: <RedeemIcon />, 
      color: '#f59e0b', 
      bg: '#fef3c7',
      trend: '+15%',
      trendUp: true 
    },
    { 
      label: 'Total Revenue', 
      value: `KES ${(summary?.totalRevenue || 0).toLocaleString()}`, 
      icon: <MoneyIcon />, 
      color: '#8b5cf6', 
      bg: '#f3e8ff',
      trend: '+22%',
      trendUp: true 
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        color: 'white',
        py: 3,
        px: 3,
        mb: 3
      }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
                <BackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight="bold">Business Intelligence Dashboard</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Real-time analytics and performance metrics
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="outlined" 
                startIcon={<DateIcon />}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Last 30 Days
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={loadData}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography color="text.secondary" fontSize="0.875rem" mb={0.5}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Stack direction="row" alignItems="center" mt={1} spacing={0.5}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: stat.trendUp ? '#10b981' : '#ef4444',
                            fontWeight: 600 
                          }}
                        >
                          {stat.trend}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          vs last month
                        </Typography>
                      </Stack>
                    </Box>
                    <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 48, height: 48 }}>
                      {stat.icon}
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3}>
          {/* Member Growth Chart */}
          <Grid item xs={12} lg={6}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Member Growth</Typography>
                    <Typography variant="body2" color="text.secondary">
                      New member registrations over time
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }}>
                    <ChartIcon />
                  </Avatar>
                </Stack>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={memberGrowth}>
                    <defs>
                      <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMembers)"
                      name="New Members"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Points Activity Chart */}
          <Grid item xs={12} lg={6}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Points Activity</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points earned vs redeemed
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#dcfce7', color: '#10b981' }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Stack>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pointsActivity} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="earned" 
                      fill="#10b981" 
                      name="Earned" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="redeemed" 
                      fill="#f59e0b" 
                      name="Redeemed"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
