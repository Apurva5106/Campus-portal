const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin, registerAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public student/recruiter auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// Secure admin auth (requires ADMIN_SECRET_KEY)
router.post('/admin/login', loginAdmin);
router.post('/admin/register', registerAdmin);

// Current user profile
router.get('/me', protect, getMe);

module.exports = router;
