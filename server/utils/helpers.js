// Small helper functions shared by the data files and controllers.

/**
 * Format a Date object as "YYYY-MM-DD" using the local timezone.
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Today's date as "YYYY-MM-DD".
 */
function todayString() {
  return formatDate(new Date());
}

/**
 * Returns a "YYYY-MM-DD" date that is `days` days from today
 * (use a negative number for a date in the past).
 * Used by the sample data so the demo deadlines always look realistic.
 */
function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Returns an ISO timestamp that is `days` days in the past.
 */
function daysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * A deadline is "passed" when today is AFTER the deadline date.
 * (Students can still apply on the deadline day itself.)
 * "YYYY-MM-DD" strings can be compared directly as text.
 */
function isDeadlinePassed(deadline) {
  return deadline < todayString();
}

/**
 * Checks that a string is a valid http/https URL.
 */
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Checks that a string is a real date in "YYYY-MM-DD" format.
 */
function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
}

/**
 * Accepts either an array of skills or a comma-separated string
 * and always returns a clean array of non-empty strings.
 */
function toSkillsArray(value) {
  if (Array.isArray(value)) {
    return value.map((skill) => String(skill).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((skill) => skill.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Escapes special characters so user text can be used safely in a RegExp
 * (used by the internship search box).
 */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates an Error object with an HTTP status code attached.
 * The central error handler reads `statusCode` to build the response.
 */
function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  formatDate,
  todayString,
  daysFromNow,
  daysAgoISO,
  isDeadlinePassed,
  isValidUrl,
  isValidDateString,
  toSkillsArray,
  escapeRegex,
  createError,
};
