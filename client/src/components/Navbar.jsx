// Top navigation bar. The links change depending on the user's role.

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Navbar() {
  const { user, isLoggedIn, isAdmin, isStudent, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  // Controls the mobile "hamburger" menu
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    showToast('You have been logged out.', 'info');
    navigate('/');
  };

  // NavLink adds the "active" class automatically for the current page
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={closeMenu}>
          <i className="bi bi-mortarboard-fill me-2"></i>InternPortal
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className={linkClass} to="/" end onClick={closeMenu}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/internships" onClick={closeMenu}>Internships</NavLink>
            </li>

            {isStudent && (
              <>
                <li className="nav-item">
                  <NavLink className={linkClass} to="/student/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkClass} to="/student/applications" onClick={closeMenu}>My Applications</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkClass} to="/student/profile" onClick={closeMenu}>Profile</NavLink>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className={linkClass} to="/admin/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkClass} to="/admin/internships/new" onClick={closeMenu}>Add Internship</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkClass} to="/admin/applications" onClick={closeMenu}>Applications</NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row gap-2 py-2 py-lg-0 align-items-lg-center">
            {isLoggedIn ? (
              <>
                <span className="navbar-text text-white me-lg-2">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name}
                  <span className="badge bg-light text-primary ms-2 text-capitalize">{user.role}</span>
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i>Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login" onClick={closeMenu}>Login</Link>
                <Link className="btn btn-light btn-sm text-primary fw-semibold" to="/register" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
