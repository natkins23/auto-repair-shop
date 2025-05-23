import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import GaragePage from './pages/public/GaragePage';
import BookingFlow from './pages/public/BookingFlow';
import BookingConfirmationPage from './pages/public/BookingConfirmationPage';
import RepairStatusPage from './pages/public/RepairStatusPage';
import RepairHistoryPage from './pages/public/RepairHistoryPage';

// Admin Pages
import AdminIndexPage from './pages/admin/IndexPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminBookingsPage from './pages/admin/BookingsPage';
import BookingDetailPage from './pages/admin/BookingDetailPage';
import AdminVehiclesPage from './pages/admin/VehiclesPage';
import AdminLoginPage from './pages/admin/LoginPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import PublicRoute from './components/auth/PublicRoute';

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
        <ThemeProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="repair-status" element={<RepairStatusPage />} />
            
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
            <Route path="repair-history" element={
              <ProtectedRoute>
                <RepairHistoryPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminIndexPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="bookings/:bookingId" element={<BookingDetailPage />} />
            <Route path="vehicles" element={<AdminVehiclesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
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
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
