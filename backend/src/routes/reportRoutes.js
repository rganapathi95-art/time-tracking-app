const express = require('express');
const router = express.Router();
const {
  getComprehensiveReport,
  getUsersReport,
  getProjectsReport,
  getTimesheetsReport,
  generateCustomReport,
  getMyReports
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// Employee routes (accessible to all authenticated users)
router.get('/my-reports', protect, getMyReports);

// Custom report (accessible to all, but filtered by role)
router.post('/custom', protect, generateCustomReport);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router.get('/comprehensive', getComprehensiveReport);
router.get('/users', getUsersReport);
router.get('/projects', getProjectsReport);
router.get('/timesheets', getTimesheetsReport);

module.exports = router;
