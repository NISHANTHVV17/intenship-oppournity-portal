// CRUD operations for internships.

const Internship = require('../models/Internship');
const Application = require('../models/Application');
const {
  isValidDateString,
  toSkillsArray,
  escapeRegex,
  createError,
} = require('../utils/helpers');

const MODES = ['Remote', 'On-site', 'Hybrid'];

/**
 * Validates internship data sent by the admin.
 * Returns a clean internship object (without id/postedAt) or throws a 400 error.
 */
function validateInternship(body) {
  const {
    title,
    company,
    location,
    mode,
    category,
    description,
    requiredSkills,
    stipend,
    duration,
    deadline,
    openings,
  } = body;

  if (!title || !String(title).trim()) throw createError(400, 'Title is required.');
  if (!company || !String(company).trim()) throw createError(400, 'Company is required.');
  if (!location || !String(location).trim()) throw createError(400, 'Location is required.');
  if (!MODES.includes(mode)) throw createError(400, 'Mode must be Remote, On-site or Hybrid.');
  if (!category || !String(category).trim()) throw createError(400, 'Category is required.');
  if (!description || String(description).trim().length < 20) {
    throw createError(400, 'Description must be at least 20 characters.');
  }

  const skills = toSkillsArray(requiredSkills);
  if (skills.length === 0) throw createError(400, 'At least one required skill is needed.');

  const stipendNumber = Number(stipend);
  if (stipend === '' || stipend === undefined || Number.isNaN(stipendNumber) || stipendNumber < 0) {
    throw createError(400, 'Stipend must be a number (0 for unpaid).');
  }

  if (!duration || !String(duration).trim()) throw createError(400, 'Duration is required.');
  if (!isValidDateString(deadline)) throw createError(400, 'Deadline must be a valid date (YYYY-MM-DD).');

  const openingsNumber = Number(openings);
  if (!Number.isInteger(openingsNumber) || openingsNumber < 1) {
    throw createError(400, 'Openings must be a whole number of at least 1.');
  }

  return {
    title: String(title).trim(),
    company: String(company).trim(),
    location: String(location).trim(),
    mode,
    category: String(category).trim(),
    description: String(description).trim(),
    requiredSkills: skills,
    stipend: stipendNumber,
    isPaid: stipendNumber > 0, // isPaid is always derived from the stipend
    duration: String(duration).trim(),
    deadline,
    openings: openingsNumber,
  };
}

/**
 * GET /api/internships?search=&category=&paid=&mode=&sort=
 *   search   -> matches title, company or location (case-insensitive)
 *   category -> exact category name
 *   paid     -> "true" (paid only) or "false" (unpaid only)
 *   mode     -> Remote | On-site | Hybrid
 *   sort     -> "newest" (default) or "deadline" (closest deadline first)
 */
async function getInternships(req, res, next) {
  try {
    const { search = '', category = '', paid = '', mode = '', sort = 'newest' } = req.query;

    // Build the MongoDB filter step by step
    const filter = {};

    if (String(search).trim()) {
      const regex = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ title: regex }, { company: regex }, { location: regex }];
    }
    if (category) filter.category = String(category);
    if (paid === 'true') filter.isPaid = true;
    if (paid === 'false') filter.isPaid = false;
    if (mode) filter.mode = String(mode);

    const sortOrder = sort === 'deadline' ? { deadline: 1 } : { postedAt: -1 };

    const internships = await Internship.find(filter).sort(sortOrder);
    res.json(internships);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/internships/:id
 */
async function getInternshipById(req, res, next) {
  try {
    const internship = await Internship.findOne({ id: req.params.id });
    if (!internship) throw createError(404, 'Internship not found.');
    res.json(internship);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/internships  (admin)
 */
async function createInternship(req, res, next) {
  try {
    const data = validateInternship(req.body);
    const newInternship = await Internship.create(data); // id and postedAt get default values
    res.status(201).json({ message: 'Internship created successfully.', internship: newInternship });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/internships/:id  (admin)
 */
async function updateInternship(req, res, next) {
  try {
    const data = validateInternship(req.body);

    // Keep the original id and postedAt, replace everything else.
    // { new: true } returns the updated document instead of the old one.
    const internship = await Internship.findOneAndUpdate({ id: req.params.id }, data, {
      new: true,
      runValidators: true,
    });
    if (!internship) throw createError(404, 'Internship not found.');

    res.json({ message: 'Internship updated successfully.', internship });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/internships/:id  (admin)
 * Also deletes every application for this internship.
 */
async function deleteInternship(req, res, next) {
  try {
    const internship = await Internship.findOneAndDelete({ id: req.params.id });
    if (!internship) throw createError(404, 'Internship not found.');

    const result = await Application.deleteMany({ internshipId: req.params.id });

    res.json({
      message: `Internship deleted successfully (${result.deletedCount} related application(s) removed).`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
};
