// Handles updating the logged-in student's profile.

const User = require('../models/User');
const { toSkillsArray, createError } = require('../utils/helpers');

/**
 * PUT /api/users/profile  (student)
 * Body: { name, phone, college, department, year, skills }
 * Email and role cannot be changed here.
 */
async function updateProfile(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) throw createError(404, 'User not found.');

    const { name, phone, college, department, year, skills } = req.body;

    if (!name || !String(name).trim()) throw createError(400, 'Name is required.');
    if (phone && !/^[0-9+\-\s]{7,15}$/.test(String(phone).trim())) {
      throw createError(400, 'Phone number must be 7–15 digits.');
    }

    user.name = String(name).trim();
    user.phone = phone ? String(phone).trim() : '';
    user.college = college ? String(college).trim() : '';
    user.department = department ? String(department).trim() : '';
    user.year = year ? String(year).trim() : '';
    user.skills = toSkillsArray(skills);
    await user.save();

    res.json({ message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
}

module.exports = { updateProfile };
