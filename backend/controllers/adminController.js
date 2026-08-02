// Admin-only operations: manage users, manage levels/questions, view data, manage jobs
const User = require('../models/User');
const Level = require('../models/Level');
const Job = require('../models/Job');
const Application = require('../models/Application');

// ---------------- USERS ----------------

// @desc   Get all students (with progress info) in a clean table-ready format
// @route  GET /api/admin/students
const getAllStudents = async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('name email college branch graduationYear points badges unlockedLevels isActive linkedin createdAt')
    .sort('-points');
  res.json(students);
};

// @desc   Get all recruiters/companies (with job counts) in a clean table-ready format
// @route  GET /api/admin/recruiters
const getAllRecruiters = async (req, res) => {
  const recruiters = await User.find({ role: 'recruiter' })
    .select('name email companyName companyDesignation isActive createdAt')
    .sort('-createdAt');

  const withJobCounts = await Promise.all(
    recruiters.map(async (r) => {
      const jobCount = await Job.countDocuments({ recruiter: r._id });
      return { ...r.toObject(), jobCount };
    })
  );
  res.json(withJobCounts);
};

// @desc   Activate/Deactivate any student or recruiter account
// @route  PUT /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify another admin account' });

  user.isActive = !user.isActive;
  await user.save();
  res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
};

// @desc   Delete a student or recruiter account
// @route  DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin account' });

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
};

// ---------------- LEVELS / QUESTIONS ----------------

// @desc   Create a level (if it doesn't already exist for that key)
// @route  POST /api/admin/levels
const createLevel = async (req, res) => {
  const { key, title, description, order, passingScore } = req.body;
  const exists = await Level.findOne({ key });
  if (exists) return res.status(400).json({ message: 'Level with this key already exists' });

  const level = await Level.create({ key, title, description, order, passingScore });
  res.status(201).json(level);
};

// @desc   Update level metadata (title/description/order/passingScore/active)
// @route  PUT /api/admin/levels/:id
const updateLevel = async (req, res) => {
  const level = await Level.findById(req.params.id);
  if (!level) return res.status(404).json({ message: 'Level not found' });

  const { title, description, order, passingScore, isActive } = req.body;
  if (title !== undefined) level.title = title;
  if (description !== undefined) level.description = description;
  if (order !== undefined) level.order = order;
  if (passingScore !== undefined) level.passingScore = passingScore;
  if (isActive !== undefined) level.isActive = isActive;

  await level.save();
  res.json(level);
};

// @desc   Get all levels including questions & correct answers (admin view only)
// @route  GET /api/admin/levels
const getAllLevelsAdmin = async (req, res) => {
  const levels = await Level.find().sort('order');
  res.json(levels);
};

// @desc   Add a question to a level
// @route  POST /api/admin/levels/:id/questions
const addQuestion = async (req, res) => {
  const { questionText, options, correctOptionIndex, points } = req.body;
  if (!questionText || !options || options.length < 2 || correctOptionIndex === undefined) {
    return res.status(400).json({ message: 'questionText, at least 2 options, and correctOptionIndex are required' });
  }

  const level = await Level.findById(req.params.id);
  if (!level) return res.status(404).json({ message: 'Level not found' });

  level.questions.push({ questionText, options, correctOptionIndex, points: points || 10 });
  await level.save();
  res.status(201).json(level);
};

// @desc   Edit an existing question within a level
// @route  PUT /api/admin/levels/:id/questions/:questionId
const editQuestion = async (req, res) => {
  const level = await Level.findById(req.params.id);
  if (!level) return res.status(404).json({ message: 'Level not found' });

  const question = level.questions.id(req.params.questionId);
  if (!question) return res.status(404).json({ message: 'Question not found' });

  const { questionText, options, correctOptionIndex, points } = req.body;
  if (questionText !== undefined) question.questionText = questionText;
  if (options !== undefined) question.options = options;
  if (correctOptionIndex !== undefined) question.correctOptionIndex = correctOptionIndex;
  if (points !== undefined) question.points = points;

  await level.save();
  res.json(level);
};

// @desc   Delete a question from a level
// @route  DELETE /api/admin/levels/:id/questions/:questionId
const deleteQuestion = async (req, res) => {
  const level = await Level.findById(req.params.id);
  if (!level) return res.status(404).json({ message: 'Level not found' });

  level.questions.id(req.params.questionId).deleteOne();
  await level.save();
  res.json(level);
};

// ---------------- JOBS ----------------

// @desc   Admin view of all jobs across all recruiters
// @route  GET /api/admin/jobs
const getAllJobsAdmin = async (req, res) => {
  const jobs = await Job.find().populate('recruiter', 'name companyName email').sort('-createdAt');
  const withCounts = await Promise.all(
    jobs.map(async (job) => {
      const count = await Application.countDocuments({ job: job._id });
      return { ...job.toObject(), applicantCount: count };
    })
  );
  res.json(withCounts);
};

// @desc   Admin force-closes/removes any job
// @route  PUT /api/admin/jobs/:id/toggle
const toggleJobActive = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  job.isActive = !job.isActive;
  await job.save();
  res.json({ message: `Job ${job.isActive ? 'reopened' : 'closed'}`, job });
};

module.exports = {
  getAllStudents,
  getAllRecruiters,
  toggleUserActive,
  deleteUser,
  createLevel,
  updateLevel,
  getAllLevelsAdmin,
  addQuestion,
  editQuestion,
  deleteQuestion,
  getAllJobsAdmin,
  toggleJobActive,
};
