// 404 handler for unknown routes + central error-handling middleware.

/**
 * Runs when no route matched the request.
 */
function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Central error handler. Any controller can call next(error)
 * and the error will end up here. Express recognises an error
 * handler because it has FOUR parameters.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Invalid JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body.' });
  }

  // MongoDB unique index violation (e.g. same email, or applying twice)
  if (err.code === 11000) {
    const message = err.keyPattern && err.keyPattern.email
      ? 'An account with this email already exists.'
      : 'You have already applied to this internship.';
    return res.status(409).json({ message });
  }

  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    const firstError = Object.values(err.errors)[0];
    return res.status(400).json({ message: firstError ? firstError.message : 'Invalid data.' });
  }

  const statusCode = err.statusCode || 500;

  // Log unexpected errors so they can be debugged in the terminal
  if (statusCode === 500) {
    console.error('Unexpected error:', err);
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? 'Something went wrong on the server.' : err.message,
  });
}

module.exports = { notFound, errorHandler };
