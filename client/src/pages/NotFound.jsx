import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <div className="display-1 fw-bold text-primary">404</div>
      <h1 className="h3 mb-3">Page not found</h1>
      <p className="text-muted mb-4">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">
        <i className="bi bi-house me-2"></i>Go Home
      </Link>
    </div>
  );
}

export default NotFound;
