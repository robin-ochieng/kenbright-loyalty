import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { supabase } from '../services/supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || 'User');
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kenbright 360 Admin
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1">
            Welcome back, {userEmail}
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Members
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Manage customer profiles
                </Typography>
                <Typography variant="body2">
                  View, search, and manage customer profiles with KYC data.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/members">View Members</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Payments
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Reconciliation Engine
                </Typography>
                <Typography variant="body2">
                  View payment history and run manual reconciliation processes.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/payments">Manage Payments</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Rewards
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Catalog Management
                </Typography>
                <Typography variant="body2">
                  Add, edit, and manage redeemable rewards and stock.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/rewards">Manage Rewards</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Redemptions
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Fulfillment Center
                </Typography>
                <Typography variant="body2">
                  Process and fulfill member redemption requests.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/redemptions">View Requests</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Analytics
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Business Intelligence
                </Typography>
                <Typography variant="body2">
                  View system metrics, growth charts, and performance reports.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/analytics">View Reports</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  KYC Verification
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Document Review
                </Typography>
                <Typography variant="body2">
                  Review and approve customer KYC information.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/kyc">Review Pending</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Audit Logs
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  System Activity
                </Typography>
                <Typography variant="body2">
                  Track system events, transactions, and user activities.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/audit">View Logs</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
