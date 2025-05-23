import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';

interface AdminRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

/**
 * A wrapper component that redirects to admin login if user is not an admin
 */
const AdminRoute = ({ 
  children, 
  redirectTo = '/admin/login' 
}: AdminRouteProps) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for admin user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as AdminUser;
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser || !currentUser.isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
