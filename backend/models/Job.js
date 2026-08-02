// Job posting created by a Recruiter
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    companyName: { type: String, required: true },
    description: { type: String, required: true }, // used for NLP skill matching
    requiredSkills: [String], // optional explicit list, also parsed from description
    location: { type: String },
    salaryRange: { type: String },
    jobType: { type: String, enum: ['full-time', 'internship', 'part-time'], default: 'full-time' },
    minResumeScore: { type: Number, default: 0 }, // optional threshold
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
