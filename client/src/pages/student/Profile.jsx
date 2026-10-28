// Student profile page: view and edit personal details and skills.

import { useState } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Skills are edited as a comma-separated string, e.g. "React, Node.js"
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    college: user.college || '',
    department: user.department || '',
    year: user.year || '',
    skills: (user.skills || []).join(', '),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (form.name.trim().length < 2) newErrors.name = 'Please enter your full name.';
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = 'Phone number must be 7–15 digits.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const skills = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
      const res = await api.put('/users/profile', { ...form, skills });
      updateUser(res.data.user);
      setForm({ ...form, skills: res.data.user.skills.join(', ') });
      showToast('Profile updated successfully.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Preview of skills as badges while typing
  const skillPreview = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);

  return (
    <div className="container py-4">
      <h1 className="h3 fw-bold mb-4">My Profile</h1>

      <div className="row g-4">
        {/* ----- Summary card ----- */}
        <div className="col-lg-4">
          <div className="card p-4 text-center">
            <div className="company-logo mx-auto mb-3" style={{ width: 80, height: 80, fontSize: '2rem', borderRadius: '50%' }}>
              {user.name.charAt(0)}
            </div>
            <h2 className="h5 fw-bold mb-1">{user.name}</h2>
            <div className="text-muted mb-2">{user.email}</div>
            <span className="badge bg-primary text-capitalize mb-3">{user.role}</span>
            <ul className="list-unstyled text-start small mb-0">
              <li className="mb-1"><i className="bi bi-building me-2"></i>{user.college || 'College not set'}</li>
              <li className="mb-1"><i className="bi bi-journal me-2"></i>{user.department || 'Department not set'}</li>
              <li className="mb-1"><i className="bi bi-calendar3 me-2"></i>{user.year || 'Year not set'}</li>
              <li><i className="bi bi-clock-history me-2"></i>Member since {formatDate(user.createdAt)}</li>
            </ul>
          </div>
        </div>

        {/* ----- Edit form ----- */}
        <div className="col-lg-8">
          <div className="card p-4">
            <h2 className="h5 fw-bold mb-3">Edit Details</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">Full Name <span className="text-danger">*</span></label>
                  <input id="name" name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={handleChange} />
                  <div className="invalid-feedback">{errors.name}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input id="email" className="form-control" value={user.email} disabled />
                  <div className="form-text">Email cannot be changed.</div>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input id="phone" name="phone" type="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} value={form.phone} onChange={handleChange} />
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="college" className="form-label">College</label>
                  <input id="college" name="college" className="form-control" value={form.college} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="department" className="form-label">Department</label>
                  <input id="department" name="department" className="form-control" value={form.department} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="year" className="form-label">Year</label>
                  <select id="year" name="year" className="form-select" value={form.year} onChange={handleChange}>
                    <option value="">Select year</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 mb-3">
                  <label htmlFor="skills" className="form-label">Skills</label>
                  <input
                    id="skills"
                    name="skills"
                    className="form-control"
                    placeholder="e.g. JavaScript, React, Python"
                    value={form.skills}
                    onChange={handleChange}
                  />
                  <div className="form-text">Separate skills with commas.</div>
                  {skillPreview.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {skillPreview.map((skill, index) => (
                        <span key={`${skill}-${index}`} className="badge skill-badge rounded-pill px-3 py-2">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
