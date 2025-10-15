const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validators');

// All routes require authentication
router.use(protect);

router.get('/', getProfile);
router.put('/', validate, updateProfile);
router.put('/preferences', validate, updatePreferences);
router.put('/change-password', validate, changePassword);

module.exports = router;
