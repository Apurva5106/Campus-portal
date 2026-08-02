// A Student's application to a Job. Resume submission is REQUIRED to apply.
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Snapshot of resume + profile info at time of application, so recruiters
    // always see exactly what was submitted for that application.
    resumeSnapshot: {
      fileName: String,
      filePath: String,
      rawText: String,
    },
    studentSnapshot: {
      name: String,
      email: String,
      college: String,
      branch: String,
      graduationYear: Number,
      linkedin: String,
      points: Number,
    },

    matchScore: { type: Number, required: true }, // AI-generated matching score (0-100)
    matchedSkills: [String],
    missingSkills: [String],

    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'hired'],
      default: 'applied',
    },
  },
  { timestamps: true }
);

// Prevent a student from applying to the same job twice
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
