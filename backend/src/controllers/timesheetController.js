const Timesheet = require('../models/Timesheet');
const Project = require('../models/Project');

// @desc    Get all timesheets
// @route   GET /api/timesheets
// @access  Private
exports.getTimesheets = async (req, res, next) => {
  try {
    const { employee, project, status, startDate, endDate } = req.query;
    
    // Build query
    let query = {};
    
    // Employees only see their own timesheets
    if (req.user.role === 'employee') {
      query.employee = req.user.id;
    } else if (employee) {
      query.employee = employee;
    }
    
    if (project) query.project = project;
    if (status) query.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const timesheets = await Timesheet.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('project', 'name code')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: timesheets.length,
      data: timesheets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single timesheet
// @route   GET /api/timesheets/:id
// @access  Private
exports.getTimesheet = async (req, res, next) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate('employee', 'firstName lastName email department')
      .populate('project', 'name code costCenter')
      .populate('approvedBy', 'firstName lastName');

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    // Check if employee has access to this timesheet
    if (req.user.role === 'employee' && timesheet.employee._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this timesheet'
      });
    }

    res.status(200).json({
      success: true,
      data: timesheet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create timesheet
// @route   POST /api/timesheets
// @access  Private
exports.createTimesheet = async (req, res, next) => {
  try {
    // Set employee to current user if not admin
    if (req.user.role === 'employee') {
      req.body.employee = req.user.id;
    }

    // Verify employee has access to the project
    const project = await Project.findById(req.body.project);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (req.user.role === 'employee') {
      const hasAccess = project.assignedEmployees.some(
        emp => emp.toString() === req.user.id
      );
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this project'
        });
      }
    }

    const timesheet = await Timesheet.create(req.body);

    const populatedTimesheet = await Timesheet.findById(timesheet._id)
      .populate('employee', 'firstName lastName email')
      .populate('project', 'name code');

    res.status(201).json({
      success: true,
      message: 'Timesheet created successfully',
      data: populatedTimesheet
    });
  } catch (error) {
    // Handle duplicate entry error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A timesheet entry already exists for this employee, project, and date'
      });
    }
    next(error);
  }
};

// @desc    Update timesheet
// @route   PUT /api/timesheets/:id
// @access  Private
exports.updateTimesheet = async (req, res, next) => {
  try {
    let timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    // Employees can only update their own timesheets
    if (req.user.role === 'employee') {
      if (timesheet.employee.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own timesheets'
        });
      }

      // Employees cannot update approved or rejected timesheets
      if (timesheet.status === 'approved' || timesheet.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: `Cannot update ${timesheet.status} timesheet`
        });
      }

      // Employees cannot change certain fields
      delete req.body.employee;
      delete req.body.approvedBy;
      delete req.body.approvedAt;
    }

    // Handle approval
    if (req.body.status === 'approved' && req.user.role === 'admin') {
      req.body.approvedBy = req.user.id;
      req.body.approvedAt = new Date();
    }

    timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('employee', 'firstName lastName email')
      .populate('project', 'name code')
      .populate('approvedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Timesheet updated successfully',
      data: timesheet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete timesheet
// @route   DELETE /api/timesheets/:id
// @access  Private
exports.deleteTimesheet = async (req, res, next) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    // Employees can only delete their own draft timesheets
    if (req.user.role === 'employee') {
      if (timesheet.employee.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own timesheets'
        });
      }

      if (timesheet.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'You can only delete draft timesheets'
        });
      }
    }

    await timesheet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Timesheet deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk approve timesheets
// @route   POST /api/timesheets/bulk-approve
// @access  Private/Admin
exports.bulkApprove = async (req, res, next) => {
  try {
    const { timesheetIds } = req.body;

    if (!timesheetIds || !Array.isArray(timesheetIds) || timesheetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of timesheet IDs'
      });
    }

    const result = await Timesheet.updateMany(
      { _id: { $in: timesheetIds }, status: 'submitted' },
      {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} timesheet(s) approved successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    next(error);
  }
};
