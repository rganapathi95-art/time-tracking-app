const express = require('express');
const router = express.Router();
const {
  getCostCenters,
  getCostCenter,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter
} = require('../controllers/costCenterController');
const { protect, authorize } = require('../middleware/auth');
const { costCenterValidation, mongoIdValidation, validate } = require('../middleware/validators');

// All routes require authentication
router.use(protect);

router.get('/', getCostCenters);
router.get('/:id', mongoIdValidation, validate, getCostCenter);

// Admin only routes
router.post('/', authorize('admin'), costCenterValidation, validate, createCostCenter);
router.put('/:id', authorize('admin'), mongoIdValidation, costCenterValidation, validate, updateCostCenter);
router.delete('/:id', authorize('admin'), mongoIdValidation, validate, deleteCostCenter);

module.exports = router;
