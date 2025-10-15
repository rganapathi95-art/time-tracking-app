const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedProjects', 'name code status');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, department, position, password, ...rest } = req.body;

    const updateData = {};
    
    // Only allow users to update specific fields
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (department) updateData.department = department;
    if (position) updateData.position = position;

    // Handle password update separately
    if (password) {
      const user = await User.findById(req.user.id).select('+password');
      user.password = password;
      await user.save();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences (OTP settings)
// @route   PUT /api/profile/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const { otpEnabled } = req.body;

    if (typeof otpEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'otpEnabled must be a boolean value'
      });
    }

    const user = await User.findById(req.user.id);

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
      message: `OTP login ${otpEnabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        otpEnabled: user.otpEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
