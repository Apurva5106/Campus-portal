// Handles Level browsing + Quiz submission + gamified points/badges/unlocking
const Level = require('../models/Level');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

const LEVEL_ORDER = ['aptitude', 'dsa', 'programming', 'resume', 'interview'];

// @desc   Get all active levels (question correctness hidden from students)
// @route  GET /api/levels
// @access Private (student)
const getLevels = async (req, res) => {
  try {
    const levels = await Level.find({ isActive: true }).sort('order');

    const sanitised = levels.map((lvl) => ({
      _id: lvl._id,
      key: lvl.key,
      title: lvl.title,
      description: lvl.description,
      order: lvl.order,
      passingScore: lvl.passingScore,
      totalQuestions: lvl.questions.length,
      isUnlocked: req.user.role === 'student' ? req.user.unlockedLevels.includes(lvl.key) : true,
    }));

    res.json(sanitised);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching levels', error: error.message });
  }
};

// @desc   Get a single level's quiz questions (options only, no correct answers)
// @route  GET /api/levels/:key/quiz
// @access Private (student, must be unlocked)
const getLevelQuiz = async (req, res) => {
  try {
    const level = await Level.findOne({ key: req.params.key, isActive: true });
    if (!level) return res.status(404).json({ message: 'Level not found' });

    if (req.user.role === 'student' && !req.user.unlockedLevels.includes(level.key)) {
      return res.status(403).json({ message: 'This level is locked. Complete previous levels first.' });
    }

    const questions = level.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      points: q.points,
    }));

    res.json({ key: level.key, title: level.title, passingScore: level.passingScore, questions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
};

// @desc   Submit quiz answers, calculate score, award points/badges, unlock next level
// @route  POST /api/levels/:key/submit
// @access Private (student)
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, selectedOptionIndex }]
    const level = await Level.findOne({ key: req.params.key, isActive: true });
    if (!level) return res.status(404).json({ message: 'Level not found' });

    if (!req.user.unlockedLevels.includes(level.key)) {
      return res.status(403).json({ message: 'This level is locked.' });
    }

    let correctCount = 0;
    let pointsEarned = 0;

    level.questions.forEach((q) => {
      const answer = answers.find((a) => a.questionId === String(q._id));
      if (answer && answer.selectedOptionIndex === q.correctOptionIndex) {
        correctCount += 1;
        pointsEarned += q.points;
      }
    });

    const totalQuestions = level.questions.length;
    const scorePercent = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercent >= level.passingScore;

    await Attempt.create({
      student: req.user._id,
      level: level._id,
      levelKey: level.key,
      scorePercent,
      pointsEarned,
      correctCount,
      totalQuestions,
      passed,
    });

    const user = await User.findById(req.user._id);
    user.points += pointsEarned;

    // Badge logic
    const newBadges = [];
    if (passed && !user.badges.includes(`${level.key}-champion`)) {
      newBadges.push(`${level.key}-champion`);
    }
    if (scorePercent === 100 && !user.badges.includes(`${level.key}-perfect-score`)) {
      newBadges.push(`${level.key}-perfect-score`);
    }
    if (user.points >= 500 && !user.badges.includes('500-club')) {
      newBadges.push('500-club');
    }
    user.badges.push(...newBadges);

    // Unlock next level in sequence if passed
    if (passed) {
      const currentIndex = LEVEL_ORDER.indexOf(level.key);
      const nextKey = LEVEL_ORDER[currentIndex + 1];
      if (nextKey && !user.unlockedLevels.includes(nextKey)) {
        user.unlockedLevels.push(nextKey);
      }
    }

    await user.save();

    res.json({
      scorePercent,
      correctCount,
      totalQuestions,
      pointsEarned,
      passed,
      totalPoints: user.points,
      newBadges,
      unlockedLevels: user.unlockedLevels,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};

module.exports = { getLevels, getLevelQuiz, submitQuiz };
