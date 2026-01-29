import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Points from './pages/Points';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import RedeemRewards from './pages/RedeemRewards';
import TransactionHistory from './pages/TransactionHistory';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/points" element={<Points />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/redeem" element={<RedeemRewards />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
