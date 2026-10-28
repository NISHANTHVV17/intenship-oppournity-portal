// Student registration page. (Admins cannot self-register.)

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { EMAIL_REGEX } from '../utils/helpers';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  college: '',
  department: '',
  year: '',
};

function Register() {
  const { register, isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (form.name.trim().length < 2) newErrors.name = 'Please enter your full name.';
    if (!EMAIL_REGEX.test(form.email)) newErrors.email = 'Please enter a valid email address.';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match.';
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = 'Phone number must be 7–15 digits.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // confirmPassword is only for the frontend, don't send it
      const { confirmPassword, ...data } = form;
      const newUser = await register(data);
      showToast(`Welcome, ${newUser.name}! Your account has been created.`, 'success');
      navigate('/student/dashboard', { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render a text input with its inline error
  const renderInput = (name, label, type = 'text', placeholder = '', required = false) => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <div className="invalid-feedback">{errors[name]}</div>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-7">
          <div className="card p-4">
            <div className="text-center mb-4">
              <i className="bi bi-person-plus display-6 text-primary"></i>
              <h1 className="h3 fw-bold mt-2">Student Registration</h1>
              <p className="text-muted mb-0">Create your account to start applying.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6">{renderInput('name', 'Full Name', 'text', 'e.g. Anita Rao', true)}</div>
                <div className="col-md-6">{renderInput('email', 'Email', 'email', 'you@example.com', true)}</div>
                <div className="col-md-6">{renderInput('password', 'Password', 'password', 'At least 6 characters', true)}</div>
                <div className="col-md-6">{renderInput('confirmPassword', 'Confirm Password', 'password', 'Re-enter password', true)}</div>
                <div className="col-md-6">{renderInput('phone', 'Phone', 'tel', 'Optional')}</div>
                <div className="col-md-6">{renderInput('college', 'College', 'text', 'Optional')}</div>
                <div className="col-md-6">{renderInput('department', 'Department', 'text', 'e.g. Computer Science')}</div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="year" className="form-label">Year</label>
                    <select id="year" name="year" className="form-select" value={form.year} onChange={handleChange}>
                      <option value="">Select year (optional)</option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting && <span className="spinner-border spinner-border-sm me-2"></span>}
                {submitting ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
