const Timesheet = require('../models/Timesheet');
const Project = require('../models/Project');
const WorkHourLimit = require('../models/WorkHourLimit');
const TimesheetPeriod = require('../models/TimesheetPeriod');
const { sendTimesheetStatusNotification, sendHourLimitWarning } = require('../utils/notificationService');

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
    const employeeId = req.user.role === 'employee' ? req.user.id : req.body.employee;
    req.body.employee = employeeId;

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

    // Check if date is within an allowed timesheet period
    const checkDate = new Date(req.body.date);
    const periods = await TimesheetPeriod.find({
      status: 'active',
      isActive: true,
      startDate: { $lte: checkDate },
      endDate: { $gte: checkDate }
    });

    const accessiblePeriod = periods.find(period => period.hasUserAccess(employeeId));
    
    if (!accessiblePeriod && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'The selected date is not within any allowed timesheet period'
      });
    }

    // Validate work hour limits (unless admin bypass)
    if (req.user.role !== 'admin' || !req.body.bypassLimits) {
      const limit = await WorkHourLimit.findOne({ employee: employeeId }) || 
                    await WorkHourLimit.getOrCreateLimit(employeeId);

      // Check daily limit
      if (req.body.hours > limit.dailyLimit) {
        return res.status(400).json({
          success: false,
          message: `Hours exceed daily limit of ${limit.dailyLimit} hours`,
          limitType: 'daily',
          limit: limit.dailyLimit
        });
      }

      // Calculate week boundaries
      const dayOfWeek = checkDate.getDay();
      const weekStart = new Date(checkDate);
      weekStart.setDate(checkDate.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get existing timesheets for the week
      const weekTimesheets = await Timesheet.find({
        employee: employeeId,
        date: { $gte: weekStart, $lte: weekEnd },
        status: { $in: ['approved', 'submitted', 'draft'] }
      });

      const currentWeekHours = weekTimesheets.reduce((sum, ts) => sum + ts.hours, 0);
      const projectedTotal = currentWeekHours + req.body.hours;

      // Check weekly limit
      if (limit.enforceLimit && projectedTotal > limit.weeklyLimit) {
        return res.status(400).json({
          success: false,
          message: `Adding ${req.body.hours} hours would exceed weekly limit of ${limit.weeklyLimit} hours (current: ${currentWeekHours} hours)`,
          limitType: 'weekly',
          currentHours: currentWeekHours,
          limit: limit.weeklyLimit,
          projectedTotal
        });
      }

      // Check if near warning threshold
      const percentage = (projectedTotal / limit.weeklyLimit) * 100;
      if (percentage >= limit.warningThreshold && currentWeekHours < limit.weeklyLimit * (limit.warningThreshold / 100)) {
        // Send warning notification
        try {
          await sendHourLimitWarning(employeeId, projectedTotal, limit.weeklyLimit, weekStart, weekEnd);
        } catch (notifError) {
          console.error('Error sending hour limit warning:', notifError);
        }
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

    // Track status change for notifications
    const oldStatus = timesheet.status;
    const newStatus = req.body.status;

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

    // Send notification if status changed to approved or rejected
    if (oldStatus !== newStatus && (newStatus === 'approved' || newStatus === 'rejected')) {
      try {
        await sendTimesheetStatusNotification(timesheet, newStatus, req.body.rejectionReason);
      } catch (notifError) {
        console.error('Error sending timesheet status notification:', notifError);
      }
    }

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
