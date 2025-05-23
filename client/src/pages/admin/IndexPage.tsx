import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminIndexPage = () => {
  const navigate = useNavigate();

  // Redirect to dashboard on mount
  useEffect(() => {
    navigate('/admin/dashboard');
  }, [navigate]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Portal</h1>
        <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default AdminIndexPage;
