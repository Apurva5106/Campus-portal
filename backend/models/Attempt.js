// Records a student's attempt/result on a given Level's quiz
const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
    levelKey: { type: String, required: true },
    scorePercent: { type: Number, required: true },
    pointsEarned: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
