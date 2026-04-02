import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { MemberDetail } from './pages/MemberDetail';
import { Cats } from './pages/Cats';
import { CatDetail } from './pages/CatDetail';
import { Services } from './pages/Services';
import { Bookings } from './pages/Bookings';
import { Calendar } from './pages/Calendar';
import { Notifications } from './pages/Notifications';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="cats" element={<Cats />} />
        <Route path="cats/:id" element={<CatDetail />} />
        <Route path="services" element={<Services />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
