const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  assignProject,
  removeProject
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { updateUserValidation, mongoIdValidation, validate } = require('../middleware/validators');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', mongoIdValidation, validate, getUser);
router.put('/:id', mongoIdValidation, updateUserValidation, validate, updateUser);
router.delete('/:id', mongoIdValidation, validate, deleteUser);
router.post('/:id/assign-project', mongoIdValidation, validate, assignProject);
router.delete('/:id/remove-project/:projectId', validate, removeProject);

module.exports = router;
