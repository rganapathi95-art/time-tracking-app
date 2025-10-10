const express = require('express');
const router = express.Router();
const {
  getEmployeeHours,
  getProjectAllocation,
  getCostCenterSummary,
  getDashboardStats
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/employee-hours', getEmployeeHours);
router.get('/project-allocation', getProjectAllocation);
router.get('/cost-center-summary', getCostCenterSummary);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
