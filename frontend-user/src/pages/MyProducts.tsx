import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  DirectionsCar as CarIcon,
  LocalHospital as MedicalIcon,
  Home as HomeIcon,
  TrendingUp as PensionIcon,
  Flight as TravelIcon,
  Policy as PolicyIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
  Warning as LapsedIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getMemberProducts, getProductStats } from '../services/productsService';
import { MemberProduct } from '../types';

// Map product names to icons
const getProductIcon = (productName: string) => {
  const name = productName.toLowerCase();
  if (name.includes('motor') || name.includes('vehicle')) return <CarIcon />;
  if (name.includes('medical') || name.includes('health')) return <MedicalIcon />;
  if (name.includes('home') || name.includes('property')) return <HomeIcon />;
  if (name.includes('pension') || name.includes('kipf') || name.includes('wekapesa')) return <PensionIcon />;
  if (name.includes('travel')) return <TravelIcon />;
  return <PolicyIcon />;
};

// Get status color and icon
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'Active':
      return { color: 'success' as const, icon: <ActiveIcon fontSize="small" /> };
    case 'Expired':
      return { color: 'error' as const, icon: <ExpiredIcon fontSize="small" /> };
    case 'Lapsed':
      return { color: 'warning' as const, icon: <LapsedIcon fontSize="small" /> };
    default:
      return { color: 'default' as const, icon: <PolicyIcon fontSize="small" /> };
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MyProducts() {
  const { member } = useAuth();
  const [products, setProducts] = useState<MemberProduct[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?.member_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [productsData, statsData] = await Promise.all([
          getMemberProducts(member.member_id),
          getProductStats(member.member_id),
        ]);
        setProducts(productsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load your products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?.member_id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter products by category
  const coreProducts = products.filter(p => p.product?.product_category === 'CORE');
  const optionalProducts = products.filter(p => p.product?.product_category === 'OPTIONAL');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!member) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="warning">
          No member profile found. Please contact support if this issue persists.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Insurance Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your insurance policies
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            <Typography variant="body2">Total Policies</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h4" fontWeight="bold">{stats.active}</Typography>
            <Typography variant="body2">Active</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="h4" fontWeight="bold">{stats.expired}</Typography>
            <Typography variant="body2">Expired</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Products Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`All Products (${products.length})`} />
            <Tab label={`Core (${coreProducts.length})`} />
            <Tab label={`Optional (${optionalProducts.length})`} />
          </Tabs>
        </Box>

        {/* All Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <ProductList products={products} />
        </TabPanel>

        {/* Core Products Tab */}
        <TabPanel value={tabValue} index={1}>
          <ProductList products={coreProducts} />
        </TabPanel>

        {/* Optional Products Tab */}
        <TabPanel value={tabValue} index={2}>
          <ProductList products={optionalProducts} />
        </TabPanel>
      </Card>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <Card sx={{ mt: 3, p: 4, textAlign: 'center' }}>
          <ShieldIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Insurance Products Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact your insurance agent to add policies to your account.
          </Typography>
        </Card>
      )}
    </Box>
  );
}

// Product List Component
function ProductList({ products }: { products: MemberProduct[] }) {
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No products in this category</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {products.map((memberProduct) => (
        <ProductCard key={memberProduct.id} memberProduct={memberProduct} />
      ))}
    </Stack>
  );
}

// Individual Product Card
function ProductCard({ memberProduct }: { memberProduct: MemberProduct }) {
  const { product, policy_number, status, unique_reference, created_at } = memberProduct;
  const statusInfo = getStatusInfo(status);

  return (
    <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Product Icon */}
          <Grid item xs={2} sm={1}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              {product && getProductIcon(product.product_name)}
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={10} sm={7}>
            <Typography variant="subtitle1" fontWeight="bold">
              {product?.product_name || 'Unknown Product'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                label={product?.product_category || 'N/A'}
                size="small"
                color={product?.product_category === 'CORE' ? 'primary' : 'secondary'}
                variant="outlined"
              />
              <Chip
                label={status}
                size="small"
                color={statusInfo.color}
                icon={statusInfo.icon}
              />
            </Stack>
          </Grid>

          {/* Policy Info */}
          <Grid item xs={12} sm={4}>
            <Divider sx={{ display: { xs: 'block', sm: 'none' }, my: 1 }} />
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              {policy_number && (
                <Typography variant="body2" color="text.secondary">
                  Policy: <strong>{policy_number}</strong>
                </Typography>
              )}
              {unique_reference && (
                <Typography variant="body2" color="text.secondary">
                  Ref: {unique_reference}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Added: {new Date(created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Info - Points Ratio */}
        {product && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Points Ratio:</strong> {product.points_calculation_ratio}x
              {product.description && (
                <> • {product.description}</>
              )}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
