// Dashboard statistics for admins and students.

const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');

const STATUSES = ['Pending', 'Shortlisted', 'Accepted', 'Rejected'];

/**
 * Counts how many applications have each status.
 * Returns { Pending: n, Shortlisted: n, Accepted: n, Rejected: n }
 */
function countByStatus(list) {
  const counts = {};
  STATUSES.forEach((status) => {
    counts[status] = list.filter((app) => app.status === status).length;
  });
  return counts;
}

/**
 * GET /api/stats/admin  (admin)
 */
async function getAdminStats(req, res, next) {
  try {
    // Only load the fields we need for counting
    const [internships, applications, totalStudents] = await Promise.all([
      Internship.find({}, 'id category'),
      Application.find({}, 'internshipId status'),
      User.countDocuments({ role: 'student' }),
    ]);

    // Count applications per internship category
    const categoryOf = {};
    const categoryMap = {};
    internships.forEach((item) => {
      categoryOf[item.id] = item.category;
      categoryMap[item.category] = 0; // include categories with 0 applications
    });
    applications.forEach((app) => {
      const category = categoryOf[app.internshipId];
      if (category) categoryMap[category] += 1;
    });

    const applicationsPerCategory = Object.keys(categoryMap)
      .map((category) => ({ category, count: categoryMap[category] }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalInternships: internships.length,
      totalStudents,
      totalApplications: applications.length,
      statusCounts: countByStatus(applications),
      applicationsPerCategory,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/stats/student  (student)
 */
async function getStudentStats(req, res, next) {
  try {
    const [myApplications, recentInternships] = await Promise.all([
      Application.find({ studentId: req.user.id }, 'status'),
      Internship.find().sort({ postedAt: -1 }).limit(3),
    ]);
    const counts = countByStatus(myApplications);

    res.json({
      total: myApplications.length,
      pending: counts.Pending,
      shortlisted: counts.Shortlisted,
      accepted: counts.Accepted,
      rejected: counts.Rejected,
      recentInternships,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAdminStats, getStudentStats };
