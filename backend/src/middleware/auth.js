const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Try to verify token with strict options first
    let decoded;
    try {
      const verifyOptions = {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'time-tracking-api',
        audience: process.env.JWT_AUDIENCE || 'time-tracking-frontend',
        maxAge: process.env.JWT_EXPIRE || '1h',
        clockTolerance: 5
      };
      decoded = jwt.verify(token, process.env.JWT_SECRET, verifyOptions);
    } catch (strictError) {
      // If strict verification fails, try lenient verification (for old tokens)
      console.log('Strict verification failed, trying lenient mode:', strictError.message);
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });
    }

    // Get user from token with active session
    // Note: We can't use both exclusion (-password) and inclusion (+activeSession) together
    // So we fetch the user and manually exclude password in the response
    req.user = await User.findById(decoded.id).select('+activeSession');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Session validation with backward compatibility
    try {
      // Check if active session exists and has a token
      if (req.user.activeSession && req.user.activeSession.token) {
        // Session exists - validate token matches
        if (req.user.activeSession.token !== token) {
          console.log(`Session mismatch for user ${req.user.email}:`);
          console.log(`Stored token: ${req.user.activeSession.token.substring(0, 20)}...`);
          console.log(`Incoming token: ${token.substring(0, 20)}...`);
          console.log(`Device: ${req.headers['user-agent']}`);
          return res.status(401).json({
            success: false,
            message: 'Session expired. You have been logged in from another device.',
            code: 'SESSION_REPLACED'
          });
        }
        // Token matches - proceed (no logging to reduce noise)
      } else {
        // No active session - create one for backward compatibility
        // Only create if not already in the process of being created
        if (!req.user._sessionBeingCreated) {
          console.log(`Creating new session for user ${req.user.email}`);
          req.user._sessionBeingCreated = true;
          req.user.activeSession = {
            token: token,
            deviceInfo: req.headers['user-agent'] || 'Unknown Device',
            ipAddress: req.ip || req.connection.remoteAddress || 'Unknown IP',
            loginAt: new Date()
          };
          // Save synchronously to prevent multiple saves
          await req.user.save({ validateBeforeSave: false });
          delete req.user._sessionBeingCreated;
        }
      }
    } catch (sessionError) {
      console.error('Session validation error:', sessionError);
      // Don't block request if session validation fails
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
