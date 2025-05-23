import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import GaragePage from './pages/public/GaragePage';
import BookingFlow from './pages/public/BookingFlow';
import BookingConfirmationPage from './pages/public/BookingConfirmationPage';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase auth state observer
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="garage" element={
              <ProtectedRoute>
                <GaragePage />
              </ProtectedRoute>
            } />
            <Route path="booking" element={
              <ProtectedRoute>
                <BookingFlow />
              </ProtectedRoute>
            } />
            <Route path="booking/confirmation/:id" element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            {/* Admin pages will be added later */}
            <Route index element={<div>Admin Dashboard</div>} />
            <Route path="bookings" element={<div>Manage Bookings</div>} />
            <Route path="customers" element={<div>Manage Customers</div>} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h1 className="text-4xl font-bold text-gray-900">404</h1>
              <p className="mt-2 text-lg text-gray-600">Page not found</p>
            </div>
          } />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </>
  );
}

export default App;
