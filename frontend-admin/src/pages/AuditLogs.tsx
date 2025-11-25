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
  Button,
  Stack
} from '@mui/material';
import { auditService, AuditLogEntry } from '../services/auditService';
import { exportToCSV } from '../utils/exportUtils';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await auditService.getSystemActivity();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(logs, `audit_logs_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">System Audit Logs</Typography>
        <Button variant="outlined" onClick={handleExport}>Export to CSV</Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="audit logs table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.type} 
                    color={
                      log.type === 'Payment' ? 'success' : 
                      log.type === 'Redemption' ? 'warning' : 'info'
                    } 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{log.member_name}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>{log.amount}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.status} 
                    size="small" 
                    color={log.status === 'Completed' || log.status === 'Matched' ? 'success' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No activity found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
