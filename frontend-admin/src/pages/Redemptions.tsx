import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { redemptionService, Redemption } from '../services/redemptionService';
import { exportToCSV } from '../utils/exportUtils';

export default function Redemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRedemptions();
  }, []);

  const loadRedemptions = async () => {
    try {
      const data = await redemptionService.getRedemptions();
      setRedemptions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(redemptions, `redemptions_list_${new Date().toISOString().split('T')[0]}`);
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await redemptionService.updateStatus(id, newStatus);
      loadRedemptions();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Redemption Fulfillment Center</Typography>
        <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="redemptions table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Reward</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {redemptions.map((redemption) => (
              <TableRow key={redemption.redemption_id}>
                <TableCell>{redemption.redemption_id}</TableCell>
                <TableCell>{new Date(redemption.redemption_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {redemption.members?.first_name} {redemption.members?.last_name}
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {redemption.members?.email}
                  </Typography>
                </TableCell>
                <TableCell>{redemption.reward_catalog?.reward_name}</TableCell>
                <TableCell>{redemption.points_redeemed}</TableCell>
                <TableCell>
                  <Chip 
                    label={redemption.status} 
                    color={
                      redemption.status === 'Completed' ? 'success' : 
                      redemption.status === 'Pending' ? 'warning' : 'default'
                    } 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {redemption.status === 'Pending' && (
                      <>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success"
                          onClick={() => handleStatusUpdate(redemption.redemption_id, 'Completed')}
                        >
                          Fulfill
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleStatusUpdate(redemption.redemption_id, 'Cancelled')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {redemptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No redemption requests found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
