const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOTPEmail } = require('../config/email');

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
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

    // Check if OTP is enabled for this user
    if (user.otpEnabled) {
      // Generate and send OTP
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);
      
      user.otpSecret = otpHash;
      user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      // Send OTP email
      try {
        await sendOTPEmail(user.email, otp, user.firstName);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please try again.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email',
        data: {
          requireOtp: true,
          userId: user._id,
          email: user.email
        }
      });
    }

    // Generate token (with issuer/audience)
    const token = generateToken(user._id);

    // Store session information (logout previous session)
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    
    user.activeSession = {
      token: token,
      deviceInfo: deviceInfo,
      ipAddress: ipAddress,
      loginAt: new Date()
    };
    await user.save({ validateBeforeSave: false });
    console.log(`Session saved for user ${user.email} from device: ${deviceInfo.substring(0, 50)}...`);

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

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Find user with OTP fields
    const user = await User.findById(userId).select('+otpSecret +otpExpiresAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.otpSecret || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP expired
    if (new Date() > user.otpExpiresAt) {
      user.otpSecret = null;
      user.otpExpiresAt = null;
      await user.save({ validateBeforeSave: false });
      
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.otpSecret);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Clear OTP fields
    user.otpSecret = null;
    user.otpExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Store session information (logout previous session)
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    
    user.activeSession = {
      token: token,
      deviceInfo: deviceInfo,
      ipAddress: ipAddress,
      loginAt: new Date()
    };
    await user.save({ validateBeforeSave: false });
    console.log(`Session saved for user ${user.email} from device: ${deviceInfo.substring(0, 50)}...`);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
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

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.otpEnabled) {
      return res.status(400).json({
        success: false,
        message: 'OTP is not enabled for this user'
      });
    }

    // Generate and send new OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    
    user.otpSecret = otpHash;
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp, user.firstName);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
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

// @desc    Verify password reset token
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
exports.verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token
    const user = await User.findOne({
      passwordResetToken: hashedToken
    }).select('+passwordResetToken +passwordResetExpires +isPasswordSet');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    // Check if password is already set
    if (user.isPasswordSet) {
      return res.status(400).json({
        success: false,
        message: 'Password has already been set for this account',
        code: 'PASSWORD_ALREADY_SET'
      });
    }

    // Check if token is expired
    if (user.passwordResetExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        email: user.email,
        firstName: user.firstName
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set password for new user
// @route   POST /api/auth/set-password
// @access  Public
exports.setPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires +isPasswordSet');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Check if password is already set
    if (user.isPasswordSet) {
      return res.status(400).json({
        success: false,
        message: 'Password has already been set for this account',
        code: 'PASSWORD_ALREADY_SET'
      });
    }

    // Set new password
    user.password = password;
    user.isPasswordSet = true;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password set successfully',
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
        token: jwtToken
      }
    });
  } catch (error) {
    next(error);
  }
};
