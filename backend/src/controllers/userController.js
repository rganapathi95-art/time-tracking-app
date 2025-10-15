const User = require('../models/User');
const crypto = require('crypto');
const { sendUserCreationEmail } = require('../config/email');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { role, department, isActive, search } = req.query;
    
    // Build query
    let query = {};
    
    if (role) query.role = role;
    if (department) query.department = department;
    // Only add isActive filter if it's explicitly 'true' or 'false', not empty string
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('assignedProjects', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedProjects', 'name code status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    // Don't allow password update through this endpoint
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign project to user
// @route   POST /api/users/:id/assign-project
// @access  Private/Admin
exports.assignProject = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if project is already assigned
    if (user.assignedProjects.includes(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Project already assigned to this user'
      });
    }

    user.assignedProjects.push(projectId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Project assigned successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove project from user
// @route   DELETE /api/users/:id/remove-project/:projectId
// @access  Private/Admin
exports.removeProject = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.assignedProjects = user.assignedProjects.filter(
      project => project.toString() !== req.params.projectId
    );
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Project removed successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block user (deactivate)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block your own account'
      });
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock user (activate)
// @route   PUT /api/users/:id/unblock
// @access  Private/Admin
exports.unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, department, position, hourlyRate, currency } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(16).toString('hex');
    
    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: tempPassword,
      role: role || 'employee',
      department,
      position,
      hourlyRate,
      currency: currency || 'USD',
      isPasswordSet: false,
      otpEnabled: true,
      otpSecret: otp,
      otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      passwordResetToken: hashedResetToken,
      passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send email with OTP and password setup link
    try {
      await sendUserCreationEmail(email, otp, firstName, resetToken);
    } catch (emailError) {
      console.error('Failed to send user creation email:', emailError);
      // Continue even if email fails - user is already created
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. An email has been sent with setup instructions.',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        currency: user.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user OTP preference (Admin)
// @route   PUT /api/users/:id/toggle-otp
// @access  Private/Admin
exports.toggleUserOTP = async (req, res, next) => {
  try {
    const { otpEnabled } = req.body;

    if (typeof otpEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'otpEnabled must be a boolean value'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.otpEnabled = otpEnabled;
    
    // Clear any existing OTP data when disabling
    if (!otpEnabled) {
      user.otpSecret = null;
      user.otpExpiresAt = null;
    }
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `OTP ${otpEnabled ? 'enabled' : 'disabled'} for user`,
      data: {
        userId: user._id,
        otpEnabled: user.otpEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};
