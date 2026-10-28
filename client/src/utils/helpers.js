// Small helper functions and constants used across the frontend.

export const CATEGORIES = [
  'Web Development',
  'Software Development',
  'Data Science',
  'Artificial Intelligence',
  'UI/UX Design',
  'Cybersecurity',
  'Python Development',
  'Mobile App Development',
];

export const MODES = ['Remote', 'On-site', 'Hybrid'];

export const STATUSES = ['Pending', 'Shortlisted', 'Accepted', 'Rejected'];

// Today's date as "YYYY-MM-DD" in the user's local timezone
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// Same rule as the backend: closed when today is after the deadline
export function isDeadlinePassed(deadline) {
  return deadline < todayString();
}

// "2026-11-05" or an ISO timestamp -> "5 Nov 2026"
export function formatDate(value) {
  if (!value) return '-';
  // Add a time to plain dates so they are not shifted by the timezone
  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// 15000 -> "₹15,000 / month", 0 -> "Unpaid"
export function formatStipend(stipend) {
  if (!stipend) return 'Unpaid';
  return `₹${Number(stipend).toLocaleString('en-IN')} / month`;
}

// Basic URL check used by forms
export function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
