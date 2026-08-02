const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllStudents,
  getAllRecruiters,
  toggleUserActive,
  deleteUser,
  createLevel,
  updateLevel,
  getAllLevelsAdmin,
  addQuestion,
  editQuestion,
  deleteQuestion,
  getAllJobsAdmin,
  toggleJobActive,
} = require('../controllers/adminController');
const {
  addPlacedStudent,
  editPlacedStudent,
  deletePlacedStudent,
} = require('../controllers/placedController');

// All admin routes require a valid JWT AND role === 'admin'
router.use(protect, authorizeRoles('admin'));

// ---- Users ----
router.get('/students', getAllStudents);
router.get('/recruiters', getAllRecruiters);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);

// ---- Levels & Questions ----
router.get('/levels', getAllLevelsAdmin);
router.post('/levels', createLevel);
router.put('/levels/:id', updateLevel);
router.post('/levels/:id/questions', addQuestion);
router.put('/levels/:id/questions/:questionId', editQuestion);
router.delete('/levels/:id/questions/:questionId', deleteQuestion);

// ---- Jobs (oversight) ----
router.get('/jobs', getAllJobsAdmin);
router.put('/jobs/:id/toggle', toggleJobActive);

// ---- Placed Students (placement history management) ----
router.post('/placed', addPlacedStudent);
router.put('/placed/:id', editPlacedStudent);
router.delete('/placed/:id', deletePlacedStudent);

module.exports = router;
