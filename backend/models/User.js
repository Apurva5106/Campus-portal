// Unified User model for Student / Recruiter / Admin (role-based)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },

    // ---- Student-specific fields ----
    college: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    linkedin: { type: String },
    resume: {
      fileName: String,
      filePath: String,
      rawText: String,
      qualityScore: { type: Number, default: 0 },
      detectedSkills: [String],
      suggestions: [String],
      uploadedAt: Date,
    },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    unlockedLevels: {
      type: [String],
      default: ['aptitude'], // first level unlocked by default
    },

    // ---- Recruiter-specific fields ----
    companyName: { type: String },
    companyDesignation: { type: String },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
