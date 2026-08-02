// A "Level" represents a learning module: Aptitude, DSA, Programming, Resume, Interview
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true, validate: (v) => v.length >= 2 },
  correctOptionIndex: { type: Number, required: true },
  points: { type: Number, default: 10 },
});

const levelSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['aptitude', 'dsa', 'programming', 'resume', 'interview'],
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true }, // determines unlock sequence
    passingScore: { type: Number, default: 60 }, // % required to unlock next level
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Level', levelSchema);
