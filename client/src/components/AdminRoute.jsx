// Shortcut for pages that only admins may open.

import ProtectedRoute from './ProtectedRoute';

function AdminRoute({ children }) {
  return <ProtectedRoute role="admin">{children}</ProtectedRoute>;
}

export default AdminRoute;
