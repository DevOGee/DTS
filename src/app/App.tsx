import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { RecycleBinProvider } from './contexts/RecycleBinContext';
import { ToastProvider } from './contexts/ToastContext';
import { DYNAMIC_ROUTES } from './routes/routeConfig';
import { ProtectedRoute, RouteGuard } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Layout } from './components/Layout';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/** Dynamic routes with role-based access control */
function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Layout>
      <Routes>
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dynamic routes from configuration */}
        {DYNAMIC_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<RouteGuard routeConfig={route} />}
          />
        ))}
        
        {/* Fallback route */}
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
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RecycleBinProvider>
          <DataProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </DataProvider>
        </RecycleBinProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}