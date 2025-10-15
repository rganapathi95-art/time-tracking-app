const { body, param, validationResult } = require('express-validator');

// Validation result handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
exports.registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .optional()
    .isIn(['admin', 'employee']).withMessage('Invalid role')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Admin creates user validation (no password required)
exports.createUserValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'employee']).withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Position cannot exceed 100 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Currency code must be 3 characters')
];

exports.updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('First name cannot be empty')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty().withMessage('Last name cannot be empty')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'employee']).withMessage('Invalid role'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
];

// Project validation rules
exports.projectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Project name cannot exceed 100 characters'),
  body('code')
    .trim()
    .notEmpty().withMessage('Project code is required')
    .isLength({ max: 20 }).withMessage('Project code cannot exceed 20 characters')
    .toUpperCase(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('costCenter')
    .notEmpty().withMessage('Cost center is required')
    .isMongoId().withMessage('Invalid cost center ID'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled']).withMessage('Invalid status')
];

// Cost Center validation rules
exports.costCenterValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Cost center name is required')
    .isLength({ max: 100 }).withMessage('Cost center name cannot exceed 100 characters'),
  body('code')
    .trim()
    .notEmpty().withMessage('Cost center code is required')
    .isLength({ max: 20 }).withMessage('Cost center code cannot exceed 20 characters')
    .toUpperCase(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('manager')
    .optional()
    .isMongoId().withMessage('Invalid manager ID')
];

// Timesheet validation rules
exports.timesheetValidation = [
  body('project')
    .notEmpty().withMessage('Project is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('hours')
    .notEmpty().withMessage('Hours are required')
    .isFloat({ min: 0.25, max: 24 }).withMessage('Hours must be between 0.25 and 24'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'submitted', 'approved', 'rejected']).withMessage('Invalid status')
];

// MongoDB ObjectId validation
exports.mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
