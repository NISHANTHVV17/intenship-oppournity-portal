// Handles applying, withdrawing and managing applications.

const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { isDeadlinePassed, isValidUrl, createError } = require('../utils/helpers');

const STATUSES = ['Pending', 'Shortlisted', 'Accepted', 'Rejected'];

/**
 * Adds internship and student details to a list of applications so the
 * frontend can display names without making extra API calls.
 * Uses 2 queries in total (not one per application).
 */
async function withDetails(applications) {
  const internshipIds = [...new Set(applications.map((app) => app.internshipId))];
  const studentIds = [...new Set(applications.map((app) => app.studentId))];

  const [internships, students] = await Promise.all([
    Internship.find({ id: { $in: internshipIds } }),
    User.find({ id: { $in: studentIds } }),
  ]);

  return applications.map((app) => {
    const internship = internships.find((item) => item.id === app.internshipId);
    const student = students.find((user) => user.id === app.studentId);

    return {
      ...app.toJSON(),
      internship: internship
        ? {
            id: internship.id,
            title: internship.title,
            company: internship.company,
            category: internship.category,
            deadline: internship.deadline,
          }
        : null,
      student: student ? { id: student.id, name: student.name, email: student.email } : null,
    };
  });
}

/**
 * POST /api/applications  (student)
 * Body: { internshipId, resumeUrl, coverLetter }
 */
async function applyToInternship(req, res, next) {
  try {
    const { internshipId, resumeUrl, coverLetter } = req.body;

    const internship = await Internship.findOne({ id: String(internshipId || '') });
    if (!internship) throw createError(404, 'Internship not found.');

    if (isDeadlinePassed(internship.deadline)) {
      throw createError(400, 'The deadline for this internship has passed.');
    }

    const alreadyApplied = await Application.exists({ studentId: req.user.id, internshipId: internship.id });
    if (alreadyApplied) throw createError(409, 'You have already applied to this internship.');

    if (!resumeUrl || !isValidUrl(String(resumeUrl).trim())) {
      throw createError(400, 'Please provide a valid resume URL (starting with http:// or https://).');
    }

    const letter = String(coverLetter || '').trim();
    if (letter.length < 50 || letter.length > 1000) {
      throw createError(400, 'Cover letter must be between 50 and 1000 characters.');
    }

    const newApplication = await Application.create({
      studentId: req.user.id,
      internshipId: internship.id,
      resumeUrl: String(resumeUrl).trim(),
      coverLetter: letter,
      status: 'Pending', // every new application starts as Pending
    });

    const [application] = await withDetails([newApplication]);
    res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/applications/my  (student)
 * Newest applications first.
 */
async function getMyApplications(req, res, next) {
  try {
    const applications = await Application.find({ studentId: req.user.id }).sort({ appliedAt: -1 });
    res.json(await withDetails(applications));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/applications/:id  (student – withdraw)
 * Allowed only for the student's own application while it is still Pending.
 */
async function withdrawApplication(req, res, next) {
  try {
    const application = await Application.findOne({ id: req.params.id });
    if (!application) throw createError(404, 'Application not found.');

    if (application.studentId !== req.user.id) {
      throw createError(403, 'You can only withdraw your own applications.');
    }
    if (application.status !== 'Pending') {
      throw createError(400, 'Only pending applications can be withdrawn.');
    }

    await application.deleteOne();
    res.json({ message: 'Application withdrawn successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/applications?internshipId=&status=  (admin)
 */
async function getAllApplications(req, res, next) {
  try {
    const { internshipId = '', status = '' } = req.query;

    const filter = {};
    if (internshipId) filter.internshipId = String(internshipId);
    if (status) filter.status = String(status);

    const applications = await Application.find(filter).sort({ appliedAt: -1 });
    res.json(await withDetails(applications));
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/applications/:id/status  (admin)
 * Body: { status, adminRemark }
 */
async function updateApplicationStatus(req, res, next) {
  try {
    const { status, adminRemark } = req.body;

    const application = await Application.findOne({ id: req.params.id });
    if (!application) throw createError(404, 'Application not found.');

    if (!STATUSES.includes(status)) {
      throw createError(400, `Status must be one of: ${STATUSES.join(', ')}.`);
    }

    const remark = adminRemark === undefined ? application.adminRemark : String(adminRemark).trim();
    if (remark.length > 500) throw createError(400, 'Remark must be 500 characters or less.');

    application.status = status;
    application.adminRemark = remark;
    application.updatedAt = new Date();
    await application.save();

    const [updated] = await withDetails([application]);
    res.json({ message: `Application status updated to ${status}.`, application: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  applyToInternship,
  getMyApplications,
  withdrawApplication,
  getAllApplications,
  updateApplicationStatus,
};
