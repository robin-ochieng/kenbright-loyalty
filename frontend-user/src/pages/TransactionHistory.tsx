import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function TransactionHistory() {
  const [tab, setTab] = useState(0);

  // Mock data - replace with actual data from Supabase
  const transactions = [
    { id: 1, type: 'purchase', description: 'Electronics Store Purchase', amount: 'KES 15,000', points: '+500', date: '2026-01-28', status: 'completed' },
    { id: 2, type: 'redemption', description: 'Coffee Voucher Redeemed', amount: '-200 pts', points: '-200', date: '2026-01-27', status: 'completed' },
    { id: 3, type: 'purchase', description: 'Grocery Shopping', amount: 'KES 4,500', points: '+150', date: '2026-01-26', status: 'completed' },
    { id: 4, type: 'redemption', description: 'Movie Ticket Redeemed', amount: '-500 pts', points: '-500', date: '2026-01-25', status: 'pending' },
    { id: 5, type: 'purchase', description: 'Restaurant Payment', amount: 'KES 8,000', points: '+300', date: '2026-01-24', status: 'completed' },
    { id: 6, type: 'bonus', description: 'Referral Bonus', amount: 'Bonus', points: '+250', date: '2026-01-23', status: 'completed' },
  ];

  const purchases = transactions.filter((t) => t.type === 'purchase' || t.type === 'bonus');
  const redemptions = transactions.filter((t) => t.type === 'redemption');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderTransactionList = (items: typeof transactions) => (
    <Card>
      <List sx={{ p: 0 }}>
        {items.map((item, index) => (
          <Box key={item.id}>
            <ListItem sx={{ py: 2 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">{item.description}</Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      color={getStatusColor(item.status) as any}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.date} • {item.amount}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={item.points.startsWith('+') ? 'success.main' : 'error.main'}
                    >
                      {item.points} pts
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            {index < items.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Purchases" />
        <Tab label="Redemptions" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        {renderTransactionList(transactions)}
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {renderTransactionList(purchases)}
      </TabPanel>
      <TabPanel value={tab} index={2}>
        {renderTransactionList(redemptions)}
      </TabPanel>
    </Box>
  );
}
