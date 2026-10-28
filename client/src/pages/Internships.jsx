// Internship listings with search, filters and sorting.
// Filtering is done by the backend: GET /api/internships?search=&category=&paid=&mode=&sort=

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import InternshipCard from '../components/InternshipCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { CATEGORIES, MODES } from '../utils/helpers';

const EMPTY_FILTERS = { search: '', category: '', paid: '', mode: '', sort: 'newest' };

function Internships() {
  // Allow links like /internships?category=Data%20Science from the Home page
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    category: searchParams.get('category') || '',
  });
  // The search box updates "searchText" immediately, and "filters.search"
  // a moment later (debounce), so we don't call the API on every key press.
  const [searchText, setSearchText] = useState('');
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce the search box by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update when the text really changed (avoids an extra API call)
      setFilters((current) => (current.search === searchText ? current : { ...current, search: searchText }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch internships whenever a filter changes
  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/internships', { params: filters })
      .then((res) => setInternships(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const clearFilters = () => {
    setSearchText('');
    setFilters(EMPTY_FILTERS);
  };

  const hasActiveFilters =
    searchText || filters.category || filters.paid || filters.mode || filters.sort !== 'newest';

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Browse Internships</h1>
        <p className="text-muted mb-0">Find the internship that matches your skills and interests.</p>
      </div>

      {/* ----- Search and filters ----- */}
      <div className="card p-3 mb-4">
        <div className="row g-2">
          <div className="col-12 col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, company or location"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                aria-label="Search internships"
              />
            </div>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select name="category" className="form-select" value={filters.category} onChange={handleFilterChange} aria-label="Category">
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select name="paid" className="form-select" value={filters.paid} onChange={handleFilterChange} aria-label="Stipend">
              <option value="">Paid &amp; unpaid</option>
              <option value="true">Paid only</option>
              <option value="false">Unpaid only</option>
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select name="mode" className="form-select" value={filters.mode} onChange={handleFilterChange} aria-label="Mode">
              <option value="">All modes</option>
              {MODES.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select name="sort" className="form-select" value={filters.sort} onChange={handleFilterChange} aria-label="Sort">
              <option value="newest">Newest first</option>
              <option value="deadline">Deadline (soonest)</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-2">
            <button className="btn btn-link btn-sm p-0" onClick={clearFilters}>
              <i className="bi bi-x-circle me-1"></i>Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ----- Results ----- */}
      {loading && <LoadingSpinner text="Loading internships..." />}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && internships.length === 0 && (
        <EmptyState icon="bi-search" title="No internships found" message="Try a different search or clear the filters.">
          <button className="btn btn-outline-primary" onClick={clearFilters}>Clear filters</button>
        </EmptyState>
      )}

      {!loading && !error && internships.length > 0 && (
        <>
          <p className="text-muted small">
            Showing {internships.length} internship{internships.length !== 1 ? 's' : ''}
          </p>
          <div className="row g-4">
            {internships.map((internship) => (
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

export default Internships;
