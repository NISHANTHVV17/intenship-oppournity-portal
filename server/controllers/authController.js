// Handles registration, login and fetching the logged-in user.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { toSkillsArray, createError } = require('../utils/helpers');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Creates a JWT containing the user's id, name and role (valid for 1 day).
 */
function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, {
    expiresIn: '1d',
  });
}

/**
 * POST /api/auth/register
 * Only students can self-register.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, phone, college, department, year, skills } = req.body;

    // ----- Validation -----
    if (!name || !name.trim()) throw createError(400, 'Name is required.');
    if (!email || !EMAIL_REGEX.test(email)) throw createError(400, 'A valid email is required.');
    if (!password || password.length < 6) {
      throw createError(400, 'Password must be at least 6 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const alreadyExists = await User.exists({ email: normalizedEmail });
    if (alreadyExists) throw createError(409, 'An account with this email already exists.');

    // ----- Create user -----
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student', // self-registered users are always students
      phone: phone ? String(phone).trim() : '',
      college: college ? String(college).trim() : '',
      department: department ? String(department).trim() : '',
      year: year ? String(year).trim() : '',
      skills: toSkillsArray(skills),
    });

    res.status(201).json({
      message: 'Registration successful.',
      token: generateToken(newUser),
      user: newUser, // toJSON hides passwordHash
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError(400, 'Email and password are required.');

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    // Use the same message for "no user" and "wrong password" (safer)
    if (!user) throw createError(401, 'Invalid email or password.');

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) throw createError(401, 'Invalid email or password.');

    res.json({
      message: 'Login successful.',
      token: generateToken(user),
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me  (token required)
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) throw createError(404, 'User not found.');
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe };
