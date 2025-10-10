const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { projectValidation, mongoIdValidation, validate } = require('../middleware/validators');

// All routes require authentication
router.use(protect);

router.get('/', getProjects);
router.get('/:id', mongoIdValidation, validate, getProject);

// Admin only routes
router.post('/', authorize('admin'), projectValidation, validate, createProject);
router.put('/:id', authorize('admin'), mongoIdValidation, projectValidation, validate, updateProject);
router.delete('/:id', authorize('admin'), mongoIdValidation, validate, deleteProject);

module.exports = router;
