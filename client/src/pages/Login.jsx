// Login page for both students and admins.
// After login the user is redirected based on their role.

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { EMAIL_REGEX } from '../utils/helpers';

function Login() {
  const { login, isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go straight to the dashboard.
  if (isLoggedIn) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!EMAIL_REGEX.test(form.email)) newErrors.email = 'Please enter a valid email address.';
    if (!form.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      showToast(`Welcome back, ${loggedInUser.name}!`, 'success');

      // Go back to the page the user tried to open, or to their dashboard
      const fallback = loggedInUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      const from = location.state?.from;
      const canGoBack = from && (loggedInUser.role === 'admin' ? from.startsWith('/admin') : !from.startsWith('/admin'));
      navigate(canGoBack ? from : fallback, { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Fills in demo credentials with one click
  const fillDemo = (email, password) => {
    setForm({ email, password });
    setErrors({});
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-7 col-lg-5">
          <div className="card p-4">
            <div className="text-center mb-4">
              <i className="bi bi-box-arrow-in-right display-6 text-primary"></i>
              <h1 className="h3 fw-bold mt-2">Login</h1>
              <p className="text-muted mb-0">Welcome back! Please sign in to continue.</p>
            </div>

            {searchParams.get('expired') && (
              <div className="alert alert-warning small">Your session has expired. Please log in again.</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <div className="invalid-feedback">{errors.email}</div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <div className="invalid-feedback">{errors.password}</div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting && <span className="spinner-border spinner-border-sm me-2"></span>}
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              New student? <Link to="/register">Create an account</Link>
            </p>

            {/* Demo credentials for testing */}
            <div className="border rounded p-3 mt-4 bg-light small">
              <div className="fw-semibold mb-2">
                <i className="bi bi-key me-1"></i>Demo accounts (click to fill)
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fillDemo('admin@portal.com', 'admin123')}>
                  Admin
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fillDemo('student@portal.com', 'student123')}>
                  Student (Rahul)
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fillDemo('priya@portal.com', 'student123')}>
                  Student (Priya)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
