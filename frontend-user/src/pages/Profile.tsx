import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Logout,
  Stars,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  
  // Mock data - replace with actual data from Supabase
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254 700 123 456',
    location: 'Nairobi, Kenya',
    memberSince: 'January 2025',
    tier: 'Gold',
    totalPoints: 12450,
  });

  const handleLogout = () => {
    // TODO: Implement Supabase logout
    navigate('/login');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>

      {/* Profile Card */}
      <Card sx={{ mb: 3, textAlign: 'center' }}>
        <CardContent sx={{ py: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: 32,
            }}
          >
            {userData.name.charAt(0)}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {userData.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {userData.tier} Member • Since {userData.memberSince}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            <Stars color="secondary" />
            <Typography variant="h6" color="secondary.main">
              {userData.totalPoints.toLocaleString()} Lifetime Points
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Personal Information</Typography>
            <Button startIcon={<Edit />} size="small" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          </Box>
          <List sx={{ p: 0 }}>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Person color="action" />
              </ListItemIcon>
              <ListItemText primary="Full Name" secondary={userData.name} />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Email color="action" />
              </ListItemIcon>
              <ListItemText primary="Email" secondary={userData.email} />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Phone color="action" />
              </ListItemIcon>
              <ListItemText primary="Phone" secondary={userData.phone} />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <LocationOn color="action" />
              </ListItemIcon>
              <ListItemText primary="Location" secondary={userData.location} />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <List sx={{ p: 0 }}>
            <ListItem button sx={{ px: 0 }}>
              <ListItemIcon>
                <Security color="action" />
              </ListItemIcon>
              <ListItemText primary="Change Password" secondary="Update your password" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outlined"
        color="error"
        fullWidth
        startIcon={<Logout />}
        onClick={handleLogout}
      >
        Sign Out
      </Button>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={userData.location}
            onChange={(e) => setUserData({ ...userData, location: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setEditOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
