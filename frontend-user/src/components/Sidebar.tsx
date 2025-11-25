import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar,
  Divider,
  Typography
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'My Products', icon: <ShieldIcon />, path: '/products' },
    { text: 'Rewards', icon: <CardGiftcardIcon />, path: '/rewards' },
    { text: 'My Activity', icon: <HistoryIcon />, path: '/history' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Logo Section - Clickable to go home */}
      <Box 
        onClick={() => navigate('/')}
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 64,
          borderBottom: '1px solid #e0e0e0',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <Box
          component="img"
          src="/Kenbright 360 Logo.png"
          alt="Kenbright 360"
          sx={{ 
            height: 45,
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
      
      {/* Navigation */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                // Close drawer on mobile when item is clicked
                if (mobileOpen) handleDrawerToggle();
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                  color: '#1565c0',
                  '& .MuiListItemIcon-root': {
                    color: '#1565c0',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    color: '#1565c0',
                  },
                  '&:hover': {
                    backgroundColor: '#bbdefb',
                  },
                },
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? '#1565c0' : '#555555' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  fontSize: '0.95rem',
                  color: location.pathname === item.path ? '#1565c0' : '#333333',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#666666', mb: 0.5 }}>
          © 2025 KIBL
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#999999', fontSize: '0.65rem' }}>
          Powered by Kenbright AI
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="navigation menu"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#ffffff',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
