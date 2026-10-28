// All routes of the application.

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Internships from './pages/Internships';
import InternshipDetails from './pages/InternshipDetails';
import NotFound from './pages/NotFound';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyApplications from './pages/student/MyApplications';
import Profile from './pages/student/Profile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddInternship from './pages/admin/AddInternship';
import EditInternship from './pages/admin/EditInternship';
import ManageApplications from './pages/admin/ManageApplications';

function App() {
  const { pathname } = useLocation();

  // Scroll to the top whenever the page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/internships/:id" element={<InternshipDetails />} />

          {/* Student only */}
          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/applications" element={<ProtectedRoute role="student"><MyApplications /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/internships/new" element={<AdminRoute><AddInternship /></AdminRoute>} />
          <Route path="/admin/internships/:id/edit" element={<AdminRoute><EditInternship /></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><ManageApplications /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
