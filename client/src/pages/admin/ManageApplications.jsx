// Admin page to review all applications, filter them and change their status.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { STATUSES, formatDate } from '../../utils/helpers';

function ManageApplications() {
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]); // for the filter dropdown
  const [filters, setFilters] = useState({ internshipId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // id of the row whose status is being saved (to disable its dropdown)
  const [updatingId, setUpdatingId] = useState(null);

  // Review modal state
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'Pending', adminRemark: '' });
  const [remarkError, setRemarkError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load internships once for the filter dropdown
  useEffect(() => {
    api
      .get('/internships')
      .then((res) => setInternships(res.data))
      .catch(() => setInternships([]));
  }, []);

  // Load applications whenever a filter changes
  useEffect(() => {
    setLoading(true);
    api
      .get('/applications', { params: filters })
      .then((res) => {
        setApplications(res.data);
        setError('');
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  // Replace one application in the list after it was updated
  const replaceApplication = (updated) => {
    setApplications((current) => {
      const next = current.map((app) => (app.id === updated.id ? updated : app));
      // If a status filter is active, hide rows that no longer match
      return filters.status ? next.filter((app) => app.status === filters.status) : next;
    });
  };

  // Sends the PATCH request used by both the dropdown and the modal
  const saveStatus = async (applicationId, status, adminRemark) => {
    const res = await api.patch(`/applications/${applicationId}/status`, { status, adminRemark });
    replaceApplication(res.data.application);
    showToast(res.data.message, 'success');
  };

  // Quick change from the table dropdown (keeps the existing remark)
  const handleQuickStatusChange = async (app, newStatus) => {
    setUpdatingId(app.id);
    try {
      await saveStatus(app.id, newStatus, app.adminRemark);
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  const openReview = (app) => {
    setSelected(app);
    setReviewForm({ status: app.status, adminRemark: app.adminRemark || '' });
    setRemarkError('');
  };

  const handleReviewSave = async () => {
    if (reviewForm.adminRemark.length > 500) {
      setRemarkError('Remark must be 500 characters or less.');
      return;
    }
    setSaving(true);
    try {
      await saveStatus(selected.id, reviewForm.status, reviewForm.adminRemark.trim());
      setSelected(null);
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Manage Applications</h1>
        <p className="text-muted mb-0">Review applications, update their status and leave remarks for students.</p>
      </div>

      {/* ----- Filters ----- */}
      <div className="card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <select name="internshipId" className="form-select" value={filters.internshipId} onChange={handleFilterChange} aria-label="Filter by internship">
              <option value="">All internships</option>
              {internships.map((item) => (
                <option key={item.id} value={item.id}>{item.title} – {item.company}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange} aria-label="Filter by status">
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => setFilters({ internshipId: '', status: '' })}
              disabled={!filters.internshipId && !filters.status}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ----- Table ----- */}
      <div className="card">
        {loading && <LoadingSpinner text="Loading applications..." />}
        {!loading && error && <div className="alert alert-danger m-3">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <EmptyState icon="bi-inbox" title="No applications found" message="Try changing the filters, or wait for students to apply." />
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>Internship</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th style={{ minWidth: '150px' }}>Change Status</th>
                  <th>Remark</th>
                  <th className="text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="fw-semibold">{app.student ? app.student.name : 'Unknown student'}</div>
                      <div className="small text-muted">{app.student ? app.student.email : ''}</div>
                    </td>
                    <td>
                      {app.internship ? (
                        <>
                          <Link to={`/internships/${app.internship.id}`} className="text-decoration-none">{app.internship.title}</Link>
                          <div className="small text-muted">{app.internship.company}</div>
                        </>
                      ) : (
                        <span className="text-muted">Removed</span>
                      )}
                    </td>
                    <td className="text-nowrap">{formatDate(app.appliedAt)}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={app.status}
                        disabled={updatingId === app.id}
                        onChange={(event) => handleQuickStatusChange(app, event.target.value)}
                        aria-label="Change status"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="small" style={{ maxWidth: '220px' }}>
                      {app.adminRemark || <span className="text-muted">—</span>}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary text-nowrap" onClick={() => openReview(app)}>
                        <i className="bi bi-eye me-1"></i>Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----- Review modal: cover letter + status + remark ----- */}
      <Modal
        show={Boolean(selected)}
        size="lg"
        title="Review Application"
        onClose={() => !saving && setSelected(null)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setSelected(null)} disabled={saving}>Close</button>
            <button className="btn btn-primary" onClick={handleReviewSave} disabled={saving}>
              {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
              Save Changes
            </button>
          </>
        }
      >
        {selected && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="small text-muted">Student</div>
                <div className="fw-semibold">{selected.student?.name}</div>
                <div className="small">{selected.student?.email}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Internship</div>
                <div className="fw-semibold">{selected.internship?.title}</div>
                <div className="small">{selected.internship?.company}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Applied On</div>
                <div>{formatDate(selected.appliedAt)}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Resume</div>
                <a href={selected.resumeUrl} target="_blank" rel="noopener noreferrer">
                  Open resume <i className="bi bi-box-arrow-up-right small"></i>
                </a>
              </div>
            </div>

            <div className="small text-muted mb-1">Cover Letter</div>
            <div className="cover-letter-text mb-3">{selected.coverLetter}</div>

            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="reviewStatus" className="form-label">Status</label>
                <select
                  id="reviewStatus"
                  className="form-select"
                  value={reviewForm.status}
                  onChange={(event) => setReviewForm({ ...reviewForm, status: event.target.value })}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-8">
                <label htmlFor="adminRemark" className="form-label">Remark (optional)</label>
                <textarea
                  id="adminRemark"
                  rows="3"
                  className={`form-control ${remarkError ? 'is-invalid' : ''}`}
                  placeholder="e.g. Interview scheduled for Monday 10 AM"
                  value={reviewForm.adminRemark}
                  onChange={(event) => {
                    setReviewForm({ ...reviewForm, adminRemark: event.target.value });
                    setRemarkError('');
                  }}
                ></textarea>
                <div className="invalid-feedback">{remarkError}</div>
                <div className="form-text text-end">{reviewForm.adminRemark.length} / 500</div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ManageApplications;
