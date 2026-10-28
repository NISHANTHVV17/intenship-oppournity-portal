// Student dashboard: application counts + 3 recently posted internships.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import InternshipCard from '../../components/InternshipCard';
import LoadingSpinner from '../../components/LoadingSpinner';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card stat-card h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${color}-subtle text-${color}`}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="h3 fw-bold mb-0">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/stats/student')
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Simple profile completeness hint
  const profileIncomplete = !user.college || !user.department || !user.skills || user.skills.length === 0;

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Hello, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-muted mb-0">Here is a quick overview of your internship applications.</p>
        </div>
        <Link to="/internships" className="btn btn-primary">
          <i className="bi bi-search me-2"></i>Find Internships
        </Link>
      </div>

      {profileIncomplete && (
        <div className="alert alert-info d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
          <span><i className="bi bi-info-circle me-2"></i>Complete your profile (college, department and skills) to stand out.</span>
          <Link to="/student/profile" className="btn btn-sm btn-outline-primary">Edit Profile</Link>
        </div>
      )}

      {loading && <LoadingSpinner text="Loading your dashboard..." />}
      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && stats && (
        <>
          <div className="row g-3 mb-5">
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-file-earmark-text" label="Total Applications" value={stats.total} color="primary" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-hourglass-split" label="Pending" value={stats.pending} color="secondary" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-check-circle" label="Accepted" value={stats.accepted} color="success" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-x-circle" label="Rejected" value={stats.rejected} color="danger" />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 fw-bold mb-0">Recently Posted Internships</h2>
            <Link to="/student/applications" className="text-decoration-none">
              My Applications <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="row g-4">
            {stats.recentInternships.map((internship) => (
              <div className="col-md-6 col-lg-4" key={internship.id}>
                <InternshipCard internship={internship} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default StudentDashboard;
