const express = require('express');
const { getAdminStats, getStudentStats } = require('../controllers/statsController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', verifyToken, requireRole('admin'), getAdminStats);
router.get('/student', verifyToken, requireRole('student'), getStudentStats);

module.exports = router;
