const express = require('express');
const router = express.Router();
const {
  getWorkHourLimits,
  getEmployeeLimit,
  getMyLimit,
  createOrUpdateLimit,
  bulkUpdateLimits,
  deleteLimit,
  checkCurrentWeekHours,
  validateTimesheetHours
} = require('../controllers/workHourLimitController');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate, mongoIdValidation } = require('../middleware/validators');

// All routes require authentication
router.use(protect);

// Validation rules
const limitValidation = [
  body('employee')
    .notEmpty().withMessage('Employee is required')
    .isMongoId().withMessage('Invalid employee ID'),
  body('weeklyLimit')
    .notEmpty().withMessage('Weekly limit is required')
    .isFloat({ min: 1, max: 168 }).withMessage('Weekly limit must be between 1 and 168 hours'),
  body('dailyLimit')
    .optional()
    .isFloat({ min: 1, max: 24 }).withMessage('Daily limit must be between 1 and 24 hours'),
  body('warningThreshold')
    .optional()
    .isFloat({ min: 50, max: 100 }).withMessage('Warning threshold must be between 50 and 100'),
  body('enforceLimit')
    .optional()
    .isBoolean().withMessage('Enforce limit must be a boolean')
];

const bulkUpdateValidation = [
  body('employeeIds')
    .isArray({ min: 1 }).withMessage('Employee IDs must be a non-empty array'),
  body('weeklyLimit')
    .notEmpty().withMessage('Weekly limit is required')
    .isFloat({ min: 1, max: 168 }).withMessage('Weekly limit must be between 1 and 168 hours')
];

const validateHoursValidation = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required')
    .isMongoId().withMessage('Invalid employee ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('hours')
    .notEmpty().withMessage('Hours are required')
    .isFloat({ min: 0.25, max: 24 }).withMessage('Hours must be between 0.25 and 24')
];

// Employee accessible routes
router.get('/my-limit', getMyLimit);
router.get('/check-hours/:employeeId', [
  param('employeeId').isMongoId().withMessage('Invalid employee ID'),
  validate
], checkCurrentWeekHours);
router.post('/validate', validateHoursValidation, validate, validateTimesheetHours);

// Admin only routes
router.get('/', authorize('admin'), getWorkHourLimits);
router.get('/employee/:employeeId', [
  param('employeeId').isMongoId().withMessage('Invalid employee ID'),
  validate
], getEmployeeLimit);
router.post('/', authorize('admin'), limitValidation, validate, createOrUpdateLimit);
router.post('/bulk-update', authorize('admin'), bulkUpdateValidation, validate, bulkUpdateLimits);
router.delete('/:id', authorize('admin'), mongoIdValidation, validate, deleteLimit);

module.exports = router;
