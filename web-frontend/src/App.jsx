import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Services from './pages/Services.jsx';
import Pandits from './pages/Pandits.jsx';
import Bookings from './pages/Bookings.jsx';
import PanditOnboard from './pages/PanditOnboard.jsx';
import ManageServices from './pages/ManageServices.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PanditPortal from './pages/PanditPortal.jsx';
import PanditProfile from './pages/PanditProfile.jsx';

function ProtectedRoute({ children, allowedTypes }) {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('user_type');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  if (allowedTypes && !allowedTypes.includes(userType)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedTypes={['admin']}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute allowedTypes={['user']}>
            <AppLayout>
              <Services />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pandits"
        element={
          <ProtectedRoute allowedTypes={['user']}>
            <AppLayout>
              <Pandits />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pandits/:panditId"
        element={
          <ProtectedRoute allowedTypes={['user']}>
            <AppLayout>
              <PanditPortal />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Bookings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pandit-onboard"
        element={
          <PanditOnboard />
        }
      />
      <Route
        path="/manage-services"
        element={
          <ProtectedRoute allowedTypes={['pandit']}>
            <AppLayout>
              <ManageServices />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pandit/profile"
        element={
          <ProtectedRoute allowedTypes={['pandit']}>
            <AppLayout>
              <PanditProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
