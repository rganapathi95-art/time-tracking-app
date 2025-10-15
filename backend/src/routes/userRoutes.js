const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignProject,
  removeProject,
  blockUser,
  unblockUser,
  toggleUserOTP
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { createUserValidation, updateUserValidation, mongoIdValidation, validate } = require('../middleware/validators');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.post('/', createUserValidation, validate, createUser);
router.get('/:id', mongoIdValidation, validate, getUser);
router.put('/:id', mongoIdValidation, updateUserValidation, validate, updateUser);
router.delete('/:id', mongoIdValidation, validate, deleteUser);
router.put('/:id/block', mongoIdValidation, validate, blockUser);
router.put('/:id/unblock', mongoIdValidation, validate, unblockUser);
router.put('/:id/toggle-otp', mongoIdValidation, validate, toggleUserOTP);
router.post('/:id/assign-project', mongoIdValidation, validate, assignProject);
router.delete('/:id/remove-project/:projectId', validate, removeProject);

module.exports = router;
