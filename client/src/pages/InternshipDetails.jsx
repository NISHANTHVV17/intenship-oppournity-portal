// Shows one internship and (for students) the Apply form.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatStipend, isDeadlinePassed, isValidUrl } from '../utils/helpers';

const MIN_LETTER = 50;
const MAX_LETTER = 1000;

function InternshipDetails() {
  const { id } = useParams();
  const { isLoggedIn, isStudent, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // The student's existing application for this internship (if any)
  const [myApplication, setMyApplication] = useState(null);

  const [form, setForm] = useState({ resumeUrl: '', coverLetter: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/internships/${id}`);
        setInternship(res.data);

        // Students: check whether they already applied
        if (isStudent) {
          const appsRes = await api.get('/applications/my');
          setMyApplication(appsRes.data.find((app) => app.internshipId === id) || null);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setNotFound(true);
        } else {
          showToast(getErrorMessage(error), 'danger');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isStudent, showToast]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!isValidUrl(form.resumeUrl.trim())) {
      newErrors.resumeUrl = 'Enter a valid URL starting with http:// or https:// (e.g. a Google Drive link).';
    }
    const length = form.coverLetter.trim().length;
    if (length < MIN_LETTER || length > MAX_LETTER) {
      newErrors.coverLetter = `Cover letter must be between ${MIN_LETTER} and ${MAX_LETTER} characters (currently ${length}).`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/applications', {
        internshipId: id,
        resumeUrl: form.resumeUrl.trim(),
        coverLetter: form.coverLetter.trim(),
      });
      setMyApplication(res.data.application);
      setForm({ resumeUrl: '', coverLetter: '' });
      showToast('Application submitted successfully!', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading internship..." />;

  if (notFound || !internship) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-briefcase" title="Internship not found" message="It may have been removed by the admin.">
          <Link to="/internships" className="btn btn-primary">Back to Internships</Link>
        </EmptyState>
      </div>
    );
  }

  const closed = isDeadlinePassed(internship.deadline);
  const letterLength = form.coverLetter.trim().length;

  // Decide what to show in the "Apply" panel
  const renderApplyPanel = () => {
    if (isAdmin) {
      return (
        <>
          <p className="text-muted">You are logged in as an admin.</p>
          <Link to={`/admin/internships/${internship.id}/edit`} className="btn btn-outline-primary w-100">
            <i className="bi bi-pencil me-2"></i>Edit this internship
          </Link>
        </>
      );
    }

    if (!isLoggedIn) {
      return (
        <>
          <p className="text-muted">Log in as a student to apply for this internship.</p>
          <Link to="/login" state={{ from: `/internships/${internship.id}` }} className={`btn btn-primary w-100 ${closed ? 'disabled' : ''}`}>
            {closed ? 'Applications Closed' : 'Login to Apply'}
          </Link>
        </>
      );
    }

    if (myApplication) {
      return (
        <div className="text-center">
          <i className="bi bi-check-circle-fill text-success display-6"></i>
          <p className="mt-2 mb-2">You applied on {formatDate(myApplication.appliedAt)}.</p>
          <p>Status: <StatusBadge status={myApplication.status} /></p>
          <Link to="/student/applications" className="btn btn-outline-primary w-100">View My Applications</Link>
        </div>
      );
    }

    if (closed) {
      return (
        <>
          <div className="alert alert-danger small">The deadline for this internship has passed.</div>
          <button className="btn btn-secondary w-100" disabled>Applications Closed</button>
        </>
      );
    }

    // Student who has not applied yet and the internship is open
    return (
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="resumeUrl" className="form-label">Resume URL <span className="text-danger">*</span></label>
          <input
            id="resumeUrl"
            name="resumeUrl"
            type="url"
            className={`form-control ${errors.resumeUrl ? 'is-invalid' : ''}`}
            placeholder="https://drive.google.com/..."
            value={form.resumeUrl}
            onChange={handleChange}
          />
          <div className="invalid-feedback">{errors.resumeUrl}</div>
          <div className="form-text">Share a public link (Google Drive, Dropbox, portfolio).</div>
        </div>

        <div className="mb-3">
          <label htmlFor="coverLetter" className="form-label">Cover Letter <span className="text-danger">*</span></label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            rows="6"
            className={`form-control ${errors.coverLetter ? 'is-invalid' : ''}`}
            placeholder="Tell the company why you are a good fit..."
            value={form.coverLetter}
            onChange={handleChange}
            maxLength={MAX_LETTER}
          ></textarea>
          <div className="invalid-feedback">{errors.coverLetter}</div>
          <div className={`form-text text-end ${letterLength > 0 && letterLength < MIN_LETTER ? 'text-danger' : ''}`}>
            {letterLength} / {MAX_LETTER} characters (minimum {MIN_LETTER})
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
          {submitting && <span className="spinner-border spinner-border-sm me-2"></span>}
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    );
  };

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/internships">Internships</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{internship.title}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* ----- Details ----- */}
        <div className="col-lg-8">
          <div className="card p-4">
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="company-logo">{internship.company.charAt(0)}</div>
              <div className="flex-grow-1">
                <h1 className="h3 fw-bold mb-1">{internship.title}</h1>
                <div className="text-muted">{internship.company}</div>
              </div>
              {closed ? <span className="badge bg-danger fs-6">Closed</span> : <span className="badge bg-success fs-6">Open</span>}
            </div>

            <div className="row g-3 my-2">
              <div className="col-6 col-md-4">
                <div className="small text-muted">Location</div>
                <div className="fw-semibold"><i className="bi bi-geo-alt me-1"></i>{internship.location}</div>
              </div>
              <div className="col-6 col-md-4">
                <div className="small text-muted">Mode</div>
                <div className="fw-semibold"><i className="bi bi-laptop me-1"></i>{internship.mode}</div>
              </div>
              <div className="col-6 col-md-4">
                <div className="small text-muted">Stipend</div>
                <div className="fw-semibold"><i className="bi bi-cash-coin me-1"></i>{formatStipend(internship.stipend)}</div>
              </div>
              <div className="col-6 col-md-4">
                <div className="small text-muted">Duration</div>
                <div className="fw-semibold"><i className="bi bi-hourglass-split me-1"></i>{internship.duration}</div>
              </div>
              <div className="col-6 col-md-4">
                <div className="small text-muted">Apply By</div>
                <div className={`fw-semibold ${closed ? 'text-danger' : ''}`}>
                  <i className="bi bi-calendar-event me-1"></i>{formatDate(internship.deadline)}
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="small text-muted">Openings</div>
                <div className="fw-semibold"><i className="bi bi-people me-1"></i>{internship.openings}</div>
              </div>
            </div>

            <hr />
            <h2 className="h5 fw-bold">About the Internship</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{internship.description}</p>

            <h2 className="h5 fw-bold mt-2">Required Skills</h2>
            <div className="d-flex flex-wrap gap-2">
              {internship.requiredSkills.map((skill) => (
                <span key={skill} className="badge skill-badge rounded-pill px-3 py-2">{skill}</span>
              ))}
            </div>

            <p className="text-muted small mt-4 mb-0">
              Category: {internship.category} · Posted on {formatDate(internship.postedAt)}
            </p>
          </div>
        </div>

        {/* ----- Apply panel ----- */}
        <div className="col-lg-4">
          <div className="card p-4">
            <h2 className="h5 fw-bold mb-3">Apply for this Internship</h2>
            {renderApplyPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternshipDetails;
