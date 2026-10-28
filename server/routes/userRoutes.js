const express = require('express');
const { updateProfile } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', verifyToken, requireRole('student'), updateProfile);

module.exports = router;
