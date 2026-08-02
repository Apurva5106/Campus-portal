// Admin-managed "Placement History" list (add / edit / delete placed students)
// Includes LinkedIn column as required.
const PlacedStudent = require('../models/PlacedStudent');

// @desc   Get all placed students (public-ish; visible to all logged-in users)
// @route  GET /api/placed
const getPlacedStudents = async (req, res) => {
  const { year, college } = req.query;
  const filter = {};
  if (year) filter.placementYear = Number(year);
  if (college) filter.college = new RegExp(college, 'i');

  const records = await PlacedStudent.find(filter).sort('-placementYear -createdAt');
  res.json(records);
};

// @desc   Admin adds a new placed student record
// @route  POST /api/admin/placed
const addPlacedStudent = async (req, res) => {
  const { studentName, college, branch, graduationYear, companyName, role, package: pkg, linkedin, placementYear, student } = req.body;

  if (!studentName || !college || !companyName || !role || !placementYear) {
    return res.status(400).json({ message: 'studentName, college, companyName, role and placementYear are required' });
  }

  const record = await PlacedStudent.create({
    student,
    studentName,
    college,
    branch,
    graduationYear,
    companyName,
    role,
    package: pkg,
    linkedin,
    placementYear,
    addedBy: req.user._id,
  });

  res.status(201).json(record);
};

// @desc   Admin edits an existing placed student record (including LinkedIn link)
// @route  PUT /api/admin/placed/:id
const editPlacedStudent = async (req, res) => {
  const record = await PlacedStudent.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Placed student record not found' });

  const fields = ['studentName', 'college', 'branch', 'graduationYear', 'companyName', 'role', 'package', 'linkedin', 'placementYear'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) record[f] = req.body[f];
  });
  record.addedBy = req.user._id;

  await record.save();
  res.json(record);
};

// @desc   Admin deletes a placed student record
// @route  DELETE /api/admin/placed/:id
const deletePlacedStudent = async (req, res) => {
  const record = await PlacedStudent.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Placed student record not found' });
  await record.deleteOne();
  res.json({ message: 'Placed student record deleted' });
};

module.exports = { getPlacedStudents, addPlacedStudent, editPlacedStudent, deletePlacedStudent };
