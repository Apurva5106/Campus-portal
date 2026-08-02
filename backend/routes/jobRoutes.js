const express = require('express');
const router = express.Router();
const { createJob, getJobs, getMyJobs, getJobById, closeJob } = require('../controllers/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('recruiter'), createJob);
router.get('/', protect, getJobs);
router.get('/my', protect, authorizeRoles('recruiter'), getMyJobs);
router.get('/:id', protect, getJobById);
router.put('/:id/close', protect, authorizeRoles('recruiter'), closeJob);

module.exports = router;
