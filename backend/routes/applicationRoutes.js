const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  downloadResume,
} = require('../controllers/applicationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Student applies to a job (resume must already be uploaded to profile)
router.post('/:jobId', protect, authorizeRoles('student'), applyToJob);
router.get('/my', protect, authorizeRoles('student'), getMyApplications);

// Recruiter views applicants + updates status
router.get('/job/:jobId', protect, authorizeRoles('recruiter'), getApplicantsForJob);
router.put('/:id/status', protect, authorizeRoles('recruiter'), updateApplicationStatus);

// Secure resume download -- role check happens inside the controller
// (recruiter owner / applying student / admin only)
router.get('/:id/resume', protect, downloadResume);

module.exports = router;
