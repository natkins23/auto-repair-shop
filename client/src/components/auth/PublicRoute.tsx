import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * A wrapper component that redirects to booking if user is already authenticated
 */
const PublicRoute = ({ 
  children, 
  redirectTo = '/booking' 
}: PublicRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
