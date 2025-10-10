const User = require('../models/User');

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
