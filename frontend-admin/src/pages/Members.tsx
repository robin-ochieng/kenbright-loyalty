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
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack
} from '@mui/material';
import { memberService, Member } from '../services/memberService';
import { exportToCSV } from '../utils/exportUtils';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(members, `members_list_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Member Management</Typography>
        <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="members table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Joined Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member.member_id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {member.member_id}
                </TableCell>
                <TableCell>{member.first_name} {member.last_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone_number}</TableCell>
                <TableCell>
                  <Chip 
                    label={member.status} 
                    color={member.status === 'Active' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{member.points_balance}</TableCell>
                <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
