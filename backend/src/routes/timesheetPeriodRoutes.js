const express = require('express');
const router = express.Router();
const {
  getTimesheetPeriods,
  getTimesheetPeriod,
  createTimesheetPeriod,
  updateTimesheetPeriod,
  deleteTimesheetPeriod,
  getMyActivePeriods,
  validateDate,
  sendReminders
} = require('../controllers/timesheetPeriodController');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate, mongoIdValidation } = require('../middleware/validators');

// All routes require authentication
router.use(protect);

// Validation rules
const periodValidation = [
  body('name')
    .notEmpty().withMessage('Period name is required')
    .isLength({ max: 100 }).withMessage('Period name cannot exceed 100 characters'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format'),
  body('status')
    .optional()
    .isIn(['upcoming', 'active', 'closed']).withMessage('Invalid status'),
  body('recurringType')
    .optional()
    .isIn(['none', 'weekly', 'biweekly', 'monthly']).withMessage('Invalid recurring type')
];

// Public routes (accessible by all authenticated users)
router.get('/active/my-periods', getMyActivePeriods);
router.post('/validate-date', [
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
  validate
], validateDate);

// General routes
router.get('/', getTimesheetPeriods);
router.get('/:id', mongoIdValidation, validate, getTimesheetPeriod);

// Admin only routes
router.post('/', authorize('admin'), periodValidation, validate, createTimesheetPeriod);
router.put('/:id', authorize('admin'), mongoIdValidation, validate, updateTimesheetPeriod);
router.delete('/:id', authorize('admin'), mongoIdValidation, validate, deleteTimesheetPeriod);
router.post('/:id/send-reminders', authorize('admin'), mongoIdValidation, validate, sendReminders);

module.exports = router;
