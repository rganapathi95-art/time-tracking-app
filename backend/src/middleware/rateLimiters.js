const rateLimit = require('express-rate-limit');

// Login attempts limiter: mitigates brute-force attacks
// Default: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
});

module.exports = {
  loginLimiter
};
