const express = require('express');
const router = express.Router();
const {
  getEmployeeHours,
  getProjectAllocation,
  getCostCenterSummary,
  getDashboardStats,
  getMyAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Employee analytics (accessible to all authenticated users)
router.get('/my-analytics', protect, getMyAnalytics);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router.get('/employee-hours', getEmployeeHours);
router.get('/project-allocation', getProjectAllocation);
router.get('/cost-center-summary', getCostCenterSummary);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
