const express = require('express');
const router = express.Router();
const {
  getTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  bulkApprove
} = require('../controllers/timesheetController');
const { protect, authorize } = require('../middleware/auth');
const { timesheetValidation, mongoIdValidation, validate } = require('../middleware/validators');

// All routes require authentication
router.use(protect);

router.get('/', getTimesheets);
router.get('/:id', mongoIdValidation, validate, getTimesheet);
router.post('/', timesheetValidation, validate, createTimesheet);
router.put('/:id', mongoIdValidation, validate, updateTimesheet);
router.delete('/:id', mongoIdValidation, validate, deleteTimesheet);

// Admin only routes
router.post('/bulk-approve', authorize('admin'), bulkApprove);

module.exports = router;
