// Handles resume upload + AI-generated summary/suggestions/score for the student
const User = require('../models/User');
const extractTextFromFile = require('../utils/extractText');
const { generateResumeSummary } = require('../utils/nlpMatcher');

// @desc   Upload/replace a student's resume, returns instant AI summary + score
// @route  POST /api/resume/upload
// @access Private (student)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No resume file uploaded' });

    const rawText = await extractTextFromFile(req.file.path);
    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        message: 'Could not read enough text from this file. Please upload a text-based PDF or a .txt file.',
      });
    }

    const { qualityScore, detectedSkills, suggestions, summaryText, experienceYears } =
      generateResumeSummary(rawText);

    const user = await User.findById(req.user._id);
    user.resume = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      rawText,
      qualityScore,
      detectedSkills,
      suggestions,
      uploadedAt: new Date(),
    };
    await user.save();

    res.json({
      message: 'Resume uploaded and analysed successfully',
      qualityScore,
      detectedSkills,
      suggestions,
      summaryText,
      experienceYears,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing resume', error: error.message });
  }
};

// @desc   Get the current student's stored resume analysis (without re-uploading)
// @route  GET /api/resume/me
// @access Private (student)
const getMyResume = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.resume || !user.resume.filePath) {
    return res.status(404).json({ message: 'No resume uploaded yet' });
  }
  const { fileName, qualityScore, detectedSkills, suggestions, uploadedAt } = user.resume;
  res.json({ fileName, qualityScore, detectedSkills, suggestions, uploadedAt });
};

module.exports = { uploadResume, getMyResume };
