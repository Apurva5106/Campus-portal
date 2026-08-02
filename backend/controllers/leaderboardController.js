// Global student leaderboard, ranked by points
const User = require('../models/User');

// @desc   Get top students ranked by points
// @route  GET /api/leaderboard
// @access Private
const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const students = await User.find({ role: 'student' })
      .select('name college points badges unlockedLevels')
      .sort('-points')
      .limit(limit);

    const ranked = students.map((s, index) => ({
      rank: index + 1,
      _id: s._id,
      name: s.name,
      college: s.college,
      points: s.points,
      badgeCount: s.badges.length,
    }));

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

module.exports = { getLeaderboard };
