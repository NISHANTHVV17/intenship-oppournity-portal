// Authentication & authorization middleware.
//
// verifyToken  -> checks the "Authorization: Bearer <token>" header
// requireRole  -> allows only users with the given role(s)

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';

/**
 * Verifies the JWT sent by the client.
 * On success the decoded payload ({ id, name, role }) is stored on req.user.
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Access denied. Please log in.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }

  try {
    // The user may have been deleted (e.g. after "npm run seed").
    // Treat their token as expired.
    const userExists = await User.exists({ id: decoded.id });
    if (!userExists) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error); // database problem -> central error handler
  }
}

/**
 * Restricts a route to one or more roles.
 * Usage: router.get('/path', verifyToken, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole, JWT_SECRET };
