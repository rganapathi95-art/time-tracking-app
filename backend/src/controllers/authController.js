const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
      issuer: process.env.JWT_ISSUER || 'time-tracking-api',
      audience: process.env.JWT_AUDIENCE || 'time-tracking-frontend',
      algorithm: 'HS256'
    }
  );
};

// Brute-force and lockout configuration
const MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10);
const WINDOW_MINUTES = parseInt(process.env.LOGIN_ATTEMPT_WINDOW_MINUTES || '15', 10); // rolling window to count attempts
const LOCKOUT_MINUTES = parseInt(process.env.LOGIN_LOCKOUT_MINUTES || '15', 10); // lockout duration after hitting max

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (but typically admin only in production)
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, department, position, hourlyRate } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      department,
      position,
      hourlyRate
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Check lockout status
    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      const remainingMs = user.lockUntil.getTime() - now.getTime();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked due to repeated failed logins. Try again in ${remainingMin} minute(s).`
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Failed login handling: track attempts within rolling window
      const last = user.lastFailedLoginAt ? new Date(user.lastFailedLoginAt) : null;
      const windowAgo = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

      if (!last || last < windowAgo) {
        // Window expired, reset attempts
        user.failedLoginAttempts = 1;
      } else {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      }
      user.lastFailedLoginAt = now;

      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        user.failedLoginAttempts = 0; // reset counter after lockout is set
      }

      await user.save({ validateBeforeSave: false });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Successful login: reset counters
    if (user.failedLoginAttempts || user.lockUntil || user.lastFailedLoginAt) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      user.lastFailedLoginAt = null;
      await user.save({ validateBeforeSave: false });
    }

    // Generate token (with issuer/audience)
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedProjects', 'name code');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
