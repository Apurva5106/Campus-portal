// Handles a student applying to a job (resume required) and recruiter viewing applicants
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { matchResumeToJob } = require('../utils/nlpMatcher');

// @desc   Student applies to a job. Requires resume already uploaded to profile
//         (or one is attached at apply-time). On success, full student info +
//         resume is sent through to the recruiter via the Application record.
// @route  POST /api/applications/:jobId
// @access Private (student)
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found or closed' });

    const student = await User.findById(req.user._id);

    // ---- Enforce resume-first rule ----
    if (!student.resume || !student.resume.rawText) {
      return res.status(400).json({
        message: 'You must upload your resume before applying to any job.',
        requireResumeUpload: true,
      });
    }

    const existing = await Application.findOne({ job: job._id, student: student._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const { score, matchedSkills, missingSkills } = matchResumeToJob(student.resume.rawText, job.description);

    if (job.minResumeScore && score < job.minResumeScore) {
      return res.status(400).json({
        message: `Your resume match score (${score}%) is below this job's minimum requirement (${job.minResumeScore}%).`,
        matchScore: score,
      });
    }

    const application = await Application.create({
      job: job._id,
      student: student._id,
      recruiter: job.recruiter,
      resumeSnapshot: {
        fileName: student.resume.fileName,
        filePath: student.resume.filePath,
        rawText: student.resume.rawText,
      },
      studentSnapshot: {
        name: student.name,
        email: student.email,
        college: student.college,
        branch: student.branch,
        graduationYear: student.graduationYear,
        linkedin: student.linkedin,
        points: student.points,
      },
      matchScore: score,
      matchedSkills,
      missingSkills,
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error applying to job', error: error.message });
  }
};

// @desc   Student views their own applications
// @route  GET /api/applications/my
// @access Private (student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title companyName location jobType')
      .sort('-createdAt');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// @desc   Recruiter views all applicants for a specific job, sorted by AI match score
// @route  GET /api/applications/job/:jobId
// @access Private (recruiter, job owner)
const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.recruiter) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view applicants for this job' });
    }

    const applications = await Application.find({ job: job._id }).sort('-matchScore');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applicants', error: error.message });
  }
};

// @desc   Recruiter updates an application's status (shortlist / reject / hire)
// @route  PUT /api/applications/:id/status
// @access Private (recruiter, job owner)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['applied', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.recruiter) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();
    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
};

// @desc   Securely download/view the resume attached to a specific application.
//         Only the recruiter who owns the job, the student who applied, or an
//         admin may access it -- resumes are personal data and must never be
//         served from a public/static route.
// @route  GET /api/applications/:id/resume
// @access Private (recruiter owner, student owner, or admin)
const downloadResume = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const isRecruiterOwner = req.user.role === 'recruiter' && String(application.recruiter) === String(req.user._id);
    const isOwnerStudent = req.user.role === 'student' && String(application.student) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiterOwner && !isOwnerStudent && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this resume' });
    }

    const filePath = application.resumeSnapshot?.filePath;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    // res.download sets Content-Disposition so the browser can open/save it correctly
    res.download(filePath, application.resumeSnapshot.fileName || 'resume');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading resume', error: error.message });
  }
};

module.exports = { applyToJob, getMyApplications, getApplicantsForJob, updateApplicationStatus, downloadResume };
