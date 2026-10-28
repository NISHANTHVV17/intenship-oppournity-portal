const express = require('express');
const {
  applyToInternship,
  getMyApplications,
  withdrawApplication,
  getAllApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Every application route needs a logged-in user
router.use(verifyToken);

// Student routes
// NOTE: '/my' must be defined before '/:id' style routes so it is not treated as an id
router.get('/my', requireRole('student'), getMyApplications);
router.post('/', requireRole('student'), applyToInternship);
router.delete('/:id', requireRole('student'), withdrawApplication);

// Admin routes
router.get('/', requireRole('admin'), getAllApplications);
router.patch('/:id/status', requireRole('admin'), updateApplicationStatus);

module.exports = router;
