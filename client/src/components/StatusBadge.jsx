// Coloured badge for an application status.

const STATUS_COLORS = {
  Pending: 'secondary',
  Shortlisted: 'info',
  Accepted: 'success',
  Rejected: 'danger',
};

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'secondary';
  // "info" is light, so use dark text on it for readability
  const textClass = color === 'info' ? ' text-dark' : '';
  return <span className={`badge bg-${color}${textClass}`}>{status}</span>;
}

export default StatusBadge;
