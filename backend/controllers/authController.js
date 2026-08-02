// Handles registration & login for Student, Recruiter, and Admin roles
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Mongoose's schema-level `lowercase: true` only normalises emails when a
// document is created/saved -- it does NOT touch plain query filters like
// User.findOne({ email }). So we must lowercase/trim on every lookup here too,
// otherwise "Admin@Site.com" typed at login will never match the
// "admin@site.com" that was stored, causing a silent, confusing login failure.
const normaliseEmail = (email) => (email || '').trim().toLowerCase();

const buildUserResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  college: user.college,
  linkedin: user.linkedin,
  companyName: user.companyName,
  points: user.points,
  badges: user.badges,
  unlockedLevels: user.unlockedLevels,
  token,
});

// @desc   Register a new Student or Recruiter (Admin accounts are created separately/securely)
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, college, branch, graduationYear, linkedin, companyName, companyDesignation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Admin accounts must NOT be created through the public register endpoint
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created through public registration' });
    }

    const normalisedEmail = normaliseEmail(email);
    const existingUser = await User.findOne({ email: normalisedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email: normalisedEmail,
      password,
      role: role === 'recruiter' ? 'recruiter' : 'student',
      college,
      branch,
      graduationYear,
      linkedin,
      companyName,
      companyDesignation,
    });

    const token = generateToken(user._id, user.role);
    return res.status(201).json(buildUserResponse(user, token));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc   Login for Student / Recruiter
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: normaliseEmail(email) });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admins must log in via the secure admin login endpoint' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated. Contact admin.' });
    }

    const token = generateToken(user._id, user.role);
    return res.json(buildUserResponse(user, token));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc   Secure Admin login -- requires email + password + a shared ADMIN_SECRET_KEY
// @route  POST /api/auth/admin/login
// @access Public (but locked behind secret key)
const loginAdmin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    const user = await User.findOne({ email: normaliseEmail(email), role: 'admin' });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(user._id, user.role);
    return res.json(buildUserResponse(user, token));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
};

// @desc   Bootstrap/create an Admin account -- also requires the secret key.
//         In production, disable this route after the first admin is created,
//         or protect it further (e.g. only allow from server-side script).
// @route  POST /api/auth/admin/register
// @access Public (locked behind secret key)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const normalisedEmail = normaliseEmail(email);
    const existingUser = await User.findOne({ email: normalisedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const admin = await User.create({ name, email: normalisedEmail, password, role: 'admin' });
    const token = generateToken(admin._id, admin.role);
    return res.status(201).json(buildUserResponse(admin, token));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error creating admin', error: error.message });
  }
};

// @desc   Get currently logged-in user's profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, loginAdmin, registerAdmin, getMe };
