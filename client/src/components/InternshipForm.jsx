// Form shared by the "Add Internship" and "Edit Internship" pages.
// Props:
//   initialValues – internship data to edit (or undefined for a new one)
//   onSubmit      – async function that receives the cleaned data
//   submitText    – label for the submit button

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, MODES, todayString } from '../utils/helpers';

const EMPTY_FORM = {
  title: '',
  company: '',
  location: '',
  mode: 'Remote',
  category: CATEGORIES[0],
  description: '',
  requiredSkills: '',
  stipend: '0',
  duration: '',
  deadline: '',
  openings: '1',
};

// Converts internship data from the API into form-friendly strings
function toFormValues(internship) {
  if (!internship) return EMPTY_FORM;
  return {
    title: internship.title,
    company: internship.company,
    location: internship.location,
    mode: internship.mode,
    category: internship.category,
    description: internship.description,
    requiredSkills: internship.requiredSkills.join(', '),
    stipend: String(internship.stipend),
    duration: internship.duration,
    deadline: internship.deadline,
    openings: String(internship.openings),
  };
}

function InternshipForm({ initialValues, onSubmit, submitText = 'Save' }) {
  const isNew = !initialValues;
  const [form, setForm] = useState(() => toFormValues(initialValues));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required.';
    if (!form.company.trim()) newErrors.company = 'Company is required.';
    if (!form.location.trim()) newErrors.location = 'Location is required.';
    if (form.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters.';
    if (form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean).length === 0) {
      newErrors.requiredSkills = 'Enter at least one skill.';
    }
    if (form.stipend === '' || Number.isNaN(Number(form.stipend)) || Number(form.stipend) < 0) {
      newErrors.stipend = 'Stipend must be 0 or more (0 = unpaid).';
    }
    if (!form.duration.trim()) newErrors.duration = 'Duration is required (e.g. 3 months).';
    if (!form.deadline) {
      newErrors.deadline = 'Deadline is required.';
    } else if (isNew && form.deadline < todayString()) {
      newErrors.deadline = 'Deadline cannot be in the past for a new internship.';
    }
    if (!Number.isInteger(Number(form.openings)) || Number(form.openings) < 1) {
      newErrors.openings = 'Openings must be a whole number of at least 1.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        stipend: Number(form.stipend),
        openings: Number(form.openings),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for simple text/number/date inputs with inline errors
  const renderInput = (name, label, type = 'text', placeholder = '', extra = {}) => (
    <>
      <label htmlFor={name} className="form-label">
        {label} <span className="text-danger">*</span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        {...extra}
      />
      <div className="invalid-feedback">{errors[name]}</div>
    </>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3">
        <div className="col-md-6">{renderInput('title', 'Title', 'text', 'e.g. Frontend Developer Intern')}</div>
        <div className="col-md-6">{renderInput('company', 'Company', 'text', 'e.g. TechNova Solutions')}</div>
        <div className="col-md-6">{renderInput('location', 'Location', 'text', 'e.g. Bengaluru or Remote')}</div>

        <div className="col-6 col-md-3">
          <label htmlFor="mode" className="form-label">Mode <span className="text-danger">*</span></label>
          <select id="mode" name="mode" className="form-select" value={form.mode} onChange={handleChange}>
            {MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3">
          <label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
          <select id="category" name="category" className="form-select" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <label htmlFor="description" className="form-label">Description <span className="text-danger">*</span></label>
          <textarea
            id="description"
            name="description"
            rows="5"
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the role, responsibilities and what the intern will learn."
          ></textarea>
          <div className="invalid-feedback">{errors.description}</div>
        </div>

        <div className="col-12">
          {renderInput('requiredSkills', 'Required Skills', 'text', 'e.g. HTML, CSS, React')}
          <div className="form-text">Separate skills with commas.</div>
        </div>

        <div className="col-6 col-md-3">
          {renderInput('stipend', 'Stipend (₹/month)', 'number', '0 = unpaid', { min: 0 })}
        </div>
        <div className="col-6 col-md-3">{renderInput('duration', 'Duration', 'text', 'e.g. 3 months')}</div>
        <div className="col-6 col-md-3">{renderInput('deadline', 'Deadline', 'date')}</div>
        <div className="col-6 col-md-3">{renderInput('openings', 'Openings', 'number', '1', { min: 1 })}</div>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="spinner-border spinner-border-sm me-2"></span>}
          {submitting ? 'Saving...' : submitText}
        </button>
        <Link to="/admin/dashboard" className="btn btn-outline-secondary">Cancel</Link>
      </div>
    </form>
  );
}

export default InternshipForm;
