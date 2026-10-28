// Protects pages that need a logged-in user.
//   <ProtectedRoute>...</ProtectedRoute>               -> any logged-in user
//   <ProtectedRoute role="student">...</ProtectedRoute> -> students only
// Not logged in -> redirect to /login (and come back after login).
// Wrong role    -> redirect to that user's own dashboard.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ role, children }) {
  const { user, isLoggedIn, authLoading } = useAuth();
  const location = useLocation();

  // Wait until the saved token has been checked
  if (authLoading) return <LoadingSpinner text="Checking your session..." />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    const home = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}

export default ProtectedRoute;
