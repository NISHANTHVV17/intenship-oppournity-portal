// Admin dashboard: statistics + list of internships with Edit/Delete.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate, formatStipend, isDeadlinePassed } from '../../utils/helpers';

const STATUS_COLORS = {
  Pending: 'secondary',
  Shortlisted: 'info',
  Accepted: 'success',
  Rejected: 'danger',
};

function StatCard({ icon, label, value, color, link }) {
  return (
    <div className="card stat-card h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${color}-subtle text-${color}`}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div className="flex-grow-1">
          <div className="text-muted small">{label}</div>
          <div className="h3 fw-bold mb-0">{value}</div>
        </div>
        {link && (
          <Link to={link} className="stretched-link text-muted" aria-label={`Open ${label}`}>
            <i className="bi bi-chevron-right"></i>
          </Link>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load stats and internships at the same time
  const loadData = useCallback(async () => {
    try {
      const [statsRes, internshipsRes] = await Promise.all([
        api.get('/stats/admin'),
        api.get('/internships', { params: { sort: 'newest' } }),
      ]);
      setStats(statsRes.data);
      setInternships(internshipsRes.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/internships/${toDelete.id}`);
      showToast(res.data.message, 'success');
      setToDelete(null);
      loadData(); // refresh stats and list
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // Highest category count, used to size the progress bars
  const maxCategoryCount = Math.max(1, ...stats.applicationsPerCategory.map((item) => item.count));

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted mb-0">Overview of internships, students and applications.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/applications" className="btn btn-outline-primary">
            <i className="bi bi-list-check me-2"></i>Applications
          </Link>
          <Link to="/admin/internships/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>Add Internship
          </Link>
        </div>
      </div>

      {/* ----- Main stats ----- */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard icon="bi-briefcase" label="Total Internships" value={stats.totalInternships} color="primary" />
        </div>
        <div className="col-md-4">
          <StatCard icon="bi-people" label="Total Students" value={stats.totalStudents} color="warning" />
        </div>
        <div className="col-md-4">
          <StatCard icon="bi-file-earmark-text" label="Total Applications" value={stats.totalApplications} color="success" link="/admin/applications" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* ----- Status counts ----- */}
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Applications by Status</h2>
              <div className="row g-3">
                {Object.entries(stats.statusCounts).map(([status, count]) => (
                  <div className="col-6" key={status}>
                    <div className={`border rounded p-3 text-center border-${STATUS_COLORS[status]}`}>
                      <div className={`h4 fw-bold mb-0 text-${STATUS_COLORS[status] === 'info' ? 'info-emphasis' : STATUS_COLORS[status]}`}>
                        {count}
                      </div>
                      <div className="small text-muted">{status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ----- Applications per category ----- */}
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Applications per Category</h2>
              {stats.applicationsPerCategory.length === 0 && <p className="text-muted mb-0">No data yet.</p>}
              {stats.applicationsPerCategory.map((item) => (
                <div className="mb-2" key={item.category}>
                  <div className="d-flex justify-content-between small">
                    <span>{item.category}</span>
                    <span className="fw-semibold">{item.count}</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }} role="progressbar" aria-valuenow={item.count} aria-valuemin="0" aria-valuemax={maxCategoryCount}>
                    <div className="progress-bar bg-primary" style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----- Internships table ----- */}
      <div className="card">
        <div className="card-body pb-0 d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0">Manage Internships</h2>
          <span className="text-muted small">{internships.length} total</span>
        </div>

        {internships.length === 0 ? (
          <EmptyState icon="bi-briefcase" title="No internships yet" message="Create your first internship posting.">
            <Link to="/admin/internships/new" className="btn btn-primary">Add Internship</Link>
          </EmptyState>
        ) : (
          <div className="table-responsive mt-2">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Mode</th>
                  <th>Stipend</th>
                  <th>Deadline</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/internships/${item.id}`} className="fw-semibold text-decoration-none">{item.title}</Link>
                    </td>
                    <td>{item.company}</td>
                    <td className="small">{item.category}</td>
                    <td>{item.mode}</td>
                    <td className="text-nowrap small">{formatStipend(item.stipend)}</td>
                    <td className="text-nowrap">
                      {formatDate(item.deadline)}
                      {isDeadlinePassed(item.deadline) && <span className="badge bg-danger ms-2">Closed</span>}
                    </td>
                    <td className="text-end text-nowrap">
                      <Link to={`/admin/internships/${item.id}/edit`} className="btn btn-sm btn-outline-primary me-2" title="Edit">
                        <i className="bi bi-pencil"></i>
                        <span className="d-none d-xl-inline ms-1">Edit</span>
                      </Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(item)} title="Delete">
                        <i className="bi bi-trash"></i>
                        <span className="d-none d-xl-inline ms-1">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Delete internship?"
        message={`Are you sure you want to delete "${toDelete?.title}"? All applications for this internship will also be deleted.`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

export default AdminDashboard;
