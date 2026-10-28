const express = require('express');
const {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
} = require('../controllers/internshipController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes – anyone can browse internships
router.get('/', getInternships);
router.get('/:id', getInternshipById);

// Admin-only routes
router.post('/', verifyToken, requireRole('admin'), createInternship);
router.put('/:id', verifyToken, requireRole('admin'), updateInternship);
router.delete('/:id', verifyToken, requireRole('admin'), deleteInternship);

module.exports = router;
