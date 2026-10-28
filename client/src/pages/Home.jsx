// Landing page: hero section, featured internships and "how it works".

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InternshipCard from '../components/InternshipCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { CATEGORIES, isDeadlinePassed } from '../utils/helpers';

const STEPS = [
  { icon: 'bi-person-plus', title: 'Create an account', text: 'Register as a student in less than a minute.' },
  { icon: 'bi-search', title: 'Find internships', text: 'Search and filter by category, mode and stipend.' },
  { icon: 'bi-send', title: 'Apply online', text: 'Submit your resume link and a short cover letter.' },
  { icon: 'bi-graph-up-arrow', title: 'Track progress', text: 'See when you are shortlisted, accepted or rejected.' },
];

function Home() {
  const { isLoggedIn, isAdmin } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/internships', { params: { sort: 'newest' } })
      .then((res) => {
        // Show the 6 newest internships that are still open
        setFeatured(res.data.filter((item) => !isDeadlinePassed(item.deadline)).slice(0, 6));
      })
      .catch(() => setError('Could not load internships. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const dashboardLink = isAdmin ? '/admin/dashboard' : '/student/dashboard';

  return (
    <>
      {/* ----- Hero ----- */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h1 className="display-5 mb-3">Kick-start your career with the right internship</h1>
              <p className="lead mb-4 opacity-75">
                Discover internships in web development, data science, AI, design and more.
                Apply in minutes and track every application in one place.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/internships" className="btn btn-light btn-lg text-primary fw-semibold">
                  <i className="bi bi-search me-2"></i>Browse Internships
                </Link>
                {isLoggedIn ? (
                  <Link to={dashboardLink} className="btn btn-outline-light btn-lg">Go to Dashboard</Link>
                ) : (
                  <Link to="/register" className="btn btn-outline-light btn-lg">Register Now</Link>
                )}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <i className="bi bi-briefcase-fill" style={{ fontSize: '10rem', opacity: 0.25 }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* ----- Categories ----- */}
      <section className="container py-5">
        <h2 className="h4 fw-bold mb-3">Popular Categories</h2>
        <div className="d-flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/internships?category=${encodeURIComponent(category)}`}
              className="btn btn-outline-primary btn-sm rounded-pill"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* ----- Featured internships ----- */}
      <section className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 fw-bold mb-0">Featured Internships</h2>
          <Link to="/internships" className="text-decoration-none">
            View all <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {loading && <LoadingSpinner text="Loading internships..." />}
        {!loading && error && <div className="alert alert-warning">{error}</div>}
        {!loading && !error && featured.length === 0 && (
          <EmptyState icon="bi-briefcase" title="No open internships right now" message="Please check back later." />
        )}
        {!loading && !error && featured.length > 0 && (
          <div className="row g-4">
            {featured.map((internship) => (
              <div className="col-md-6 col-lg-4" key={internship.id}>
                <InternshipCard internship={internship} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ----- How it works ----- */}
      <section className="bg-white py-5">
        <div className="container">
          <h2 className="h4 fw-bold text-center mb-4">How It Works</h2>
          <div className="row g-4 text-center">
            {STEPS.map((step, index) => (
              <div className="col-sm-6 col-lg-3" key={step.title}>
                <div className="step-icon mb-3">
                  <i className={`bi ${step.icon}`}></i>
                </div>
                <h6 className="fw-bold">
                  {index + 1}. {step.title}
                </h6>
                <p className="text-muted small mb-0">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
