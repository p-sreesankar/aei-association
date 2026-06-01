import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '@components/LoadingSpinner';
import { useAuth } from '@hooks/useAuth';

function ProtectedRoute({ children, adminOnly = false, loginPath = '/login', fallbackPath = '/mock-tests' }) {
  const location = useLocation();
  const { loading, user, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default ProtectedRoute;