const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { status, costCenter, search } = req.query;
    
    // Build query
    let query = {};
    
    // Employees only see their assigned projects
    if (req.user.role === 'employee') {
      query.assignedEmployees = req.user.id;
    }
    
    if (status) query.status = status;
    if (costCenter) query.costCenter = costCenter;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('costCenter', 'name code')
      .populate('assignedEmployees', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('costCenter', 'name code budget')
      .populate('assignedEmployees', 'firstName lastName email department position');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if employee has access to this project
    if (req.user.role === 'employee') {
      const hasAccess = project.assignedEmployees.some(
        emp => emp._id.toString() === req.user.id
      );
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);

    // Update assigned employees
    if (req.body.assignedEmployees && req.body.assignedEmployees.length > 0) {
      await User.updateMany(
        { _id: { $in: req.body.assignedEmployees } },
        { $addToSet: { assignedProjects: project._id } }
      );
    }

    const populatedProject = await Project.findById(project._id)
      .populate('costCenter', 'name code')
      .populate('assignedEmployees', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Handle assigned employees update
    if (req.body.assignedEmployees) {
      const oldEmployees = project.assignedEmployees.map(id => id.toString());
      const newEmployees = req.body.assignedEmployees;

      // Remove project from employees no longer assigned
      const removedEmployees = oldEmployees.filter(id => !newEmployees.includes(id));
      if (removedEmployees.length > 0) {
        await User.updateMany(
          { _id: { $in: removedEmployees } },
          { $pull: { assignedProjects: project._id } }
        );
      }

      // Add project to newly assigned employees
      const addedEmployees = newEmployees.filter(id => !oldEmployees.includes(id));
      if (addedEmployees.length > 0) {
        await User.updateMany(
          { _id: { $in: addedEmployees } },
          { $addToSet: { assignedProjects: project._id } }
        );
      }
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('costCenter', 'name code')
      .populate('assignedEmployees', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Remove project from all assigned employees
    await User.updateMany(
      { assignedProjects: project._id },
      { $pull: { assignedProjects: project._id } }
    );

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
