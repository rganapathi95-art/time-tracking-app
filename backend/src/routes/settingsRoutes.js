const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPublicSettings,
  getSettings,
  updateSettings
} = require('../controllers/settingsController');

// Public: minimal branding (logo + companyName)
router.get('/public', getPublicSettings);

// Admin-only
router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

module.exports = router;
