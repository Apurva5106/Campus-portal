const express = require('express');
const router = express.Router();
const { getLevels, getLevelQuiz, submitQuiz } = require('../controllers/levelController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLevels);
router.get('/:key/quiz', protect, getLevelQuiz);
router.post('/:key/submit', protect, submitQuiz);

module.exports = router;
