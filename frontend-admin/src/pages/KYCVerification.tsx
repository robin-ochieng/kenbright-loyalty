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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider
} from '@mui/material';
import { kycService } from '../services/kycService';
import { Member } from '../services/memberService';

export default function KYCVerification() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    loadPendingKYC();
  }, []);

  const loadPendingKYC = async () => {
    try {
      const data = await kycService.getPendingKYC();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await kycService.approveKYC(id);
      loadPendingKYC();
      setSelectedMember(null);
    } catch (err: any) {
      setError(err.message || 'Failed to approve KYC');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await kycService.rejectKYC(id);
      loadPendingKYC();
      setSelectedMember(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reject KYC');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        KYC Verification Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="kyc table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>National ID</TableCell>
              <TableCell>Employment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.member_id}>
                <TableCell>{member.member_id}</TableCell>
                <TableCell>
                  {member.first_name} {member.last_name}
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {member.email}
                  </Typography>
                </TableCell>
                <TableCell>{member.national_id}</TableCell>
                <TableCell>{member.employment_status}</TableCell>
                <TableCell>
                  <Chip 
                    label={member.status || 'Pending'} 
                    color="warning" 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => setSelectedMember(member)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No pending KYC requests found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Review Dialog */}
      <Dialog 
        open={!!selectedMember} 
        onClose={() => setSelectedMember(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review KYC Information</DialogTitle>
        <DialogContent dividers>
          {selectedMember && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Full Name</Typography>
                <Typography>{selectedMember.first_name} {selectedMember.last_name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">National ID</Typography>
                <Typography>{selectedMember.national_id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Date of Birth</Typography>
                <Typography>{selectedMember.date_of_birth ? new Date(selectedMember.date_of_birth).toLocaleDateString() : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Gender</Typography>
                <Typography>{selectedMember.gender || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Phone</Typography>
                <Typography>{selectedMember.phone_number}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography>{selectedMember.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Address</Typography>
                <Typography>
                  {selectedMember.physical_address}, {selectedMember.city}, {selectedMember.country}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Employment Information</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography>{selectedMember.employment_status}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Employer</Typography>
                <Typography>{selectedMember.employer_name || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Occupation</Typography>
                <Typography>{selectedMember.occupation || 'N/A'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMember(null)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => selectedMember && handleReject(selectedMember.member_id)}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => selectedMember && handleApprove(selectedMember.member_id)}
          >
            Approve & Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
