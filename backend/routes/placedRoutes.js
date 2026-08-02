const express = require('express');
const router = express.Router();
const { getPlacedStudents } = require('../controllers/placedController');
const { protect } = require('../middleware/authMiddleware');

// Visible to any logged-in user (student/recruiter/admin) -- placement history section
router.get('/', protect, getPlacedStudents);

module.exports = router;
