/**
 * ProtectedRoute - Authentication guard component
 * @component
 * @description Wraps routes that require authentication, optionally with admin privileges.
 * Redirects unauthenticated users to login and non-admin users away from admin routes.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@components/ui';
import { useAuth } from '@hooks/useAuth';

/**
 * @typedef {Object} ProtectedRouteProps
 * @property {React.ReactNode} children - Content to render if authorized
 * @property {boolean} [adminOnly=false] - Whether to require admin privileges
 * @property {string} [loginPath='/login'] - Redirect path for unauthenticated users
 * @property {string} [fallbackPath='/mock-tests'] - Redirect path for unauthorized users
 */

/**
 * Route protection component with optional admin-only restriction
 * @param {ProtectedRouteProps} props
 */
export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  loginPath = '/login', 
  fallbackPath = '/mock-tests' 
}) {
  const location = useLocation();
  const { loading, user, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}