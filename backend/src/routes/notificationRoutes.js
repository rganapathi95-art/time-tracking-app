const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { mongoIdValidation, validate } = require('../middleware/validators');

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.get('/:id', mongoIdValidation, validate, getNotification);
router.put('/:id/read', mongoIdValidation, validate, markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', mongoIdValidation, validate, deleteNotification);
router.delete('/clear-read', clearReadNotifications);

module.exports = router;
