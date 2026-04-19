import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { RecycleBinProvider } from './contexts/RecycleBinContext';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Courses } from './components/Courses';
import { Groups } from './components/Groups';
import { Workshops } from './components/Workshops';
import { Participants } from './components/Participants';
import { Attendance } from './components/Attendance';
import { Payments } from './components/Payments';
import { MultimediaTracker } from './components/MultimediaTracker';
import { PhaseChecklist } from './components/PhaseChecklist';
import { Reports } from './components/Reports';
import { AdminSettings } from './components/AdminSettings';
import { RecycleBin } from './components/RecycleBin';
import RequestManagement from './components/RequestManagement';
import { Feedback } from './components/Feedback';

/** Routes that require authentication */
function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/multimedia" element={<MultimediaTracker />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/checklist" element={<PhaseChecklist />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="/requests" element={<RequestManagement />} />
        <Route path="/recycle-bin" element={<RecycleBin />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage onLoginClick={() => navigate('/login')} />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onBackToHome={() => navigate('/')} />}
      />
      {/* All authenticated routes */}
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <RecycleBinProvider>
      <DataProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </DataProvider>
    </RecycleBinProvider>
  );
}