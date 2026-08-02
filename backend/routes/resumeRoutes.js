const express = require('express');
const router = express.Router();
const { uploadResume, getMyResume } = require('../controllers/resumeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.post('/upload', protect, authorizeRoles('student'), upload.single('resume'), uploadResume);
router.get('/me', protect, authorizeRoles('student'), getMyResume);

module.exports = router;
