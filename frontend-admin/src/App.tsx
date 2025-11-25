import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import PaymentReconciliation from './pages/PaymentReconciliation';
import Rewards from './pages/Rewards';
import Redemptions from './pages/Redemptions';
import Analytics from './pages/Analytics';
import KYCVerification from './pages/KYCVerification';
import AuditLogs from './pages/AuditLogs';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/payments" element={<PaymentReconciliation />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/redemptions" element={<Redemptions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/kyc" element={<KYCVerification />} />
          <Route path="/audit" element={<AuditLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
