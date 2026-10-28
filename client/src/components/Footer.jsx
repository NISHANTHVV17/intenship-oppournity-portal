import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark text-white-50 py-4 mt-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <div>
          <i className="bi bi-mortarboard-fill text-white me-2"></i>
          <span className="text-white fw-semibold">InternPortal</span> – Internship Listings and Applications
        </div>
        <div className="d-flex gap-3">
          <Link to="/" className="text-white-50 text-decoration-none">Home</Link>
          <Link to="/internships" className="text-white-50 text-decoration-none">Internships</Link>
          <Link to="/login" className="text-white-50 text-decoration-none">Login</Link>
        </div>
        <small>&copy; {new Date().getFullYear()} College Mini Project</small>
      </div>
    </footer>
  );
}

export default Footer;
