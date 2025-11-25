import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Button,
  Box,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const drawerWidth = 240;

interface NavbarProps {
  handleDrawerToggle: () => void;
}

export default function Navbar({ handleDrawerToggle }: NavbarProps) {
  const { user, member } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Sign out from Supabase directly
      await supabase.auth.signOut();
      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();
      // Force navigation to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/login';
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar>
        <IconButton
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' }, color: '#333' }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Mobile Logo - Clickable to go home */}
        <Box 
          onClick={() => navigate('/')}
          sx={{ 
            display: { xs: 'flex', sm: 'none' }, 
            alignItems: 'center',
            flexGrow: 1,
            cursor: 'pointer'
          }}
        >
          <Box
            component="img"
            src="/Kenbright 360 Logo.png"
            alt="Kenbright 360"
            sx={{ height: 36 }}
          />
        </Box>
        
        {/* Desktop spacer */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
                fontSize: '0.875rem'
              }}
            >
              {member?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                color: '#333',
                fontWeight: 500
              }}
            >
              {member ? `${member.first_name} ${member.last_name}` : user?.email}
            </Typography>
          </Box>
          
          {/* Logout Button */}
          <Button 
            variant="outlined"
            size="small"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              color: '#d32f2f',
              borderColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#ffebee',
                borderColor: '#b71c1c',
              },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Logout</Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
