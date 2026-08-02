// Handles job posting (recruiter) and job browsing (student/all)
const Job = require('../models/Job');
const Application = require('../models/Application');
const { extractSkills } = require('../utils/nlpMatcher');

// @desc   Create a new job posting
// @route  POST /api/jobs
// @access Private (recruiter)
const createJob = async (req, res) => {
  try {
    const { title, companyName, description, location, salaryRange, jobType, minResumeScore } = req.body;
    if (!title || !companyName || !description) {
      return res.status(400).json({ message: 'title, companyName and description are required' });
    }

    const requiredSkills = extractSkills(description);

    const job = await Job.create({
      recruiter: req.user._id,
      title,
      companyName,
      description,
      requiredSkills,
      location,
      salaryRange,
      jobType,
      minResumeScore: minResumeScore || 0,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

// @desc   Get all active jobs (students browse; recruiters see their own via /my)
// @route  GET /api/jobs
// @access Private
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort('-createdAt').populate('recruiter', 'name companyName');

    let jobIdsApplied = [];
    if (req.user.role === 'student') {
      const applications = await Application.find({ student: req.user._id }).select('job');
      jobIdsApplied = applications.map((a) => String(a.job));
    }

    const result = jobs.map((j) => ({
      ...j.toObject(),
      alreadyApplied: jobIdsApplied.includes(String(j._id)),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// @desc   Get jobs posted by the logged-in recruiter
// @route  GET /api/jobs/my
// @access Private (recruiter)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort('-createdAt');
    // attach applicant counts
    const withCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicantCount: count };
      })
    );
    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your jobs', error: error.message });
  }
};

// @desc   Get single job details
// @route  GET /api/jobs/:id
// @access Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name companyName');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

// @desc   Recruiter deactivates/closes a job
// @route  PUT /api/jobs/:id/close
// @access Private (recruiter, owner only)
const closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.recruiter) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to modify this job' });
    }
    job.isActive = false;
    await job.save();
    res.json({ message: 'Job closed successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error closing job', error: error.message });
  }
};

module.exports = { createJob, getJobs, getMyJobs, getJobById, closeJob };
