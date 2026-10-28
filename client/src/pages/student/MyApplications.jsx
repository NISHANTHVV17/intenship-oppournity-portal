// Table of the logged-in student's applications with a Withdraw option.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate } from '../../utils/helpers';

function MyApplications() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // The application selected for withdrawal (shows the confirm modal)
  const [toWithdraw, setToWithdraw] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    api
      .get('/applications/my')
      .then((res) => setApplications(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await api.delete(`/applications/${toWithdraw.id}`);
      setApplications(applications.filter((app) => app.id !== toWithdraw.id));
      showToast('Application withdrawn.', 'success');
      setToWithdraw(null);
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">My Applications</h1>
          <p className="text-muted mb-0">Track the status of every internship you applied for.</p>
        </div>
        <Link to="/internships" className="btn btn-outline-primary">
          <i className="bi bi-plus-lg me-2"></i>Apply to more
        </Link>
      </div>

      <div className="card">
        {loading && <LoadingSpinner text="Loading applications..." />}
        {!loading && error && <div className="alert alert-danger m-3">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <EmptyState icon="bi-inbox" title="No applications yet" message="Start exploring internships and apply to the ones you like.">
            <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
          </EmptyState>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Internship</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Admin Remark</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      {app.internship ? (
                        <Link to={`/internships/${app.internship.id}`} className="fw-semibold text-decoration-none">
                          {app.internship.title}
                        </Link>
                      ) : (
                        <span className="text-muted">Internship removed</span>
                      )}
                    </td>
                    <td>{app.internship ? app.internship.company : '-'}</td>
                    <td className="text-nowrap">{formatDate(app.appliedAt)}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td className="small" style={{ minWidth: '180px' }}>
                      {app.adminRemark || <span className="text-muted">—</span>}
                    </td>
                    <td className="text-end">
                      {app.status === 'Pending' ? (
                        <button className="btn btn-sm btn-outline-danger text-nowrap" onClick={() => setToWithdraw(app)}>
                          <i className="bi bi-x-lg me-1"></i>Withdraw
                        </button>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        show={Boolean(toWithdraw)}
        title="Withdraw application?"
        message={`Are you sure you want to withdraw your application for "${toWithdraw?.internship?.title}"? This cannot be undone.`}
        confirmText="Withdraw"
        loading={withdrawing}
        onConfirm={handleWithdraw}
        onCancel={() => setToWithdraw(null)}
      />
    </div>
  );
}

export default MyApplications;
