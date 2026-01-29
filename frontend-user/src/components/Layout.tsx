import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  CardGiftcard as RewardsIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Stars as PointsIcon,
} from '@mui/icons-material';

const navItems = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { label: 'Points', icon: <PointsIcon />, path: '/points' },
  { label: 'Rewards', icon: <RewardsIcon />, path: '/rewards' },
  { label: 'History', icon: <HistoryIcon />, path: '/history' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = navItems.findIndex((item) => item.path === location.pathname);

  return (
    <Box sx={{ pb: 7, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Kenbright 360
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/profile')}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>U</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={currentIndex >= 0 ? currentIndex : 0}
          onChange={(_, newValue) => {
            navigate(navItems[newValue].path);
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
