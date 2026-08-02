// Entry point for the Campus Placement Platform backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const levelRoutes = require('./routes/levelRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const placedRoutes = require('./routes/placedRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: resumes are intentionally NOT served from a public/static route --
// they contain personal data and are only accessible via the authenticated
// GET /api/applications/:id/resume endpoint (see applicationController.downloadResume).

app.get('/', (req, res) => res.json({ message: 'Campus Placement Platform API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/placed', placedRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
