const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, verifyOTP, resendOTP, setPassword, verifyResetToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../middleware/validators');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiters');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginLimiter, loginValidation, validate, login);
router.post('/verify-otp', otpLimiter, validate, verifyOTP);
router.post('/resend-otp', otpLimiter, validate, resendOTP);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/set-password', validate, setPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
