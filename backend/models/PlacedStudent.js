// Official record of a placed student, managed by Admin.
// Editable by Admin (edit placed student list), includes LinkedIn column.
const mongoose = require('mongoose');

const placedStudentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional link to a User account
    studentName: { type: String, required: true },
    college: { type: String, required: true },
    branch: { type: String },
    graduationYear: { type: Number },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    package: { type: String }, // e.g. "12 LPA"
    linkedin: { type: String }, // LinkedIn profile URL
    placementYear: { type: Number, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who added/edited
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacedStudent', placedStudentSchema);
