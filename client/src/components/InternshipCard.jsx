// Card shown in internship listings, the home page and the dashboard.

import { Link } from 'react-router-dom';
import { formatDate, formatStipend, isDeadlinePassed } from '../utils/helpers';

// Colour for each work mode badge
const MODE_COLORS = {
  Remote: 'success',
  'On-site': 'primary',
  Hybrid: 'warning',
};

function InternshipCard({ internship }) {
  const closed = isDeadlinePassed(internship.deadline);

  return (
    <div className="card internship-card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-start gap-3 mb-3">
          {/* First letter of the company as a simple "logo" */}
          <div className="company-logo">{internship.company.charAt(0)}</div>
          <div className="flex-grow-1">
            <h5 className="card-title mb-1">{internship.title}</h5>
            <div className="text-muted small">{internship.company}</div>
          </div>
          {closed && <span className="badge bg-danger">Closed</span>}
        </div>

        <div className="mb-3 d-flex flex-wrap gap-2">
          <span className={`badge bg-${MODE_COLORS[internship.mode] || 'secondary'}-subtle text-${MODE_COLORS[internship.mode] || 'secondary'}-emphasis`}>
            {internship.mode}
          </span>
          <span className="badge bg-light text-dark border">{internship.category}</span>
        </div>

        <ul className="list-unstyled small text-muted mb-3">
          <li className="mb-1">
            <i className="bi bi-geo-alt me-2"></i>{internship.location}
          </li>
          <li className="mb-1">
            <i className="bi bi-cash-coin me-2"></i>
            <span className={internship.isPaid ? 'text-success fw-semibold' : ''}>
              {formatStipend(internship.stipend)}
            </span>
          </li>
          <li className="mb-1">
            <i className="bi bi-hourglass-split me-2"></i>{internship.duration}
          </li>
          <li>
            <i className="bi bi-calendar-event me-2"></i>
            Apply by <span className={closed ? 'text-danger' : ''}>{formatDate(internship.deadline)}</span>
          </li>
        </ul>

        <Link to={`/internships/${internship.id}`} className="btn btn-outline-primary mt-auto">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default InternshipCard;
