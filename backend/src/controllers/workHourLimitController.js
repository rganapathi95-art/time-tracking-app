const WorkHourLimit = require('../models/WorkHourLimit');
const User = require('../models/User');
const Timesheet = require('../models/Timesheet');

// @desc    Get all work hour limits
// @route   GET /api/work-hour-limits
// @access  Private/Admin
exports.getWorkHourLimits = async (req, res, next) => {
  try {
    const { isCustom } = req.query;
    
    let query = {};
    if (isCustom !== undefined) {
      query.isCustom = isCustom === 'true';
    }

    const limits = await WorkHourLimit.find(query)
      .populate('employee', 'firstName lastName email department')
      .populate('lastModifiedBy', 'firstName lastName')
      .sort({ 'employee.lastName': 1 });

    res.status(200).json({
      success: true,
      count: limits.length,
      data: limits
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get work hour limit for specific employee
// @route   GET /api/work-hour-limits/employee/:employeeId
// @access  Private
exports.getEmployeeLimit = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    // Employees can only view their own limits
    if (req.user.role === 'employee' && req.user.id !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own work hour limits'
      });
    }

    let limit = await WorkHourLimit.findOne({ employee: employeeId })
      .populate('employee', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName');

    // If no limit exists, create default
    if (!limit) {
      limit = await WorkHourLimit.getOrCreateLimit(employeeId);
      limit = await WorkHourLimit.findById(limit._id)
        .populate('employee', 'firstName lastName email');
    }

    res.status(200).json({
      success: true,
      data: limit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's work hour limit
// @route   GET /api/work-hour-limits/my-limit
// @access  Private
exports.getMyLimit = async (req, res, next) => {
  try {
    let limit = await WorkHourLimit.findOne({ employee: req.user.id })
      .populate('employee', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName');

    // If no limit exists, create default
    if (!limit) {
      limit = await WorkHourLimit.getOrCreateLimit(req.user.id);
      limit = await WorkHourLimit.findById(limit._id)
        .populate('employee', 'firstName lastName email');
    }

    res.status(200).json({
      success: true,
      data: limit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update work hour limit
// @route   POST /api/work-hour-limits
// @access  Private/Admin
exports.createOrUpdateLimit = async (req, res, next) => {
  try {
    const { employee, weeklyLimit, dailyLimit, warningThreshold, enforceLimit, notes, effectiveFrom, effectiveTo } = req.body;

    // Check if employee exists
    const user = await User.findById(employee);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (user.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'Work hour limits can only be set for employees'
      });
    }

    let limit = await WorkHourLimit.findOne({ employee });

    if (limit) {
      // Update existing limit
      limit.weeklyLimit = weeklyLimit;
      limit.dailyLimit = dailyLimit;
      limit.warningThreshold = warningThreshold;
      limit.enforceLimit = enforceLimit;
      limit.notes = notes;
      limit.effectiveFrom = effectiveFrom;
      limit.effectiveTo = effectiveTo;
      limit.isCustom = true;
      limit.lastModifiedBy = req.user.id;
      await limit.save();
    } else {
      // Create new limit
      limit = await WorkHourLimit.create({
        employee,
        weeklyLimit,
        dailyLimit,
        warningThreshold,
        enforceLimit,
        notes,
        effectiveFrom,
        effectiveTo,
        isCustom: true,
        lastModifiedBy: req.user.id
      });
    }

    limit = await WorkHourLimit.findById(limit._id)
      .populate('employee', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Work hour limit saved successfully',
      data: limit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update work hour limits
// @route   POST /api/work-hour-limits/bulk-update
// @access  Private/Admin
exports.bulkUpdateLimits = async (req, res, next) => {
  try {
    const { employeeIds, weeklyLimit, dailyLimit, warningThreshold, enforceLimit } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of employee IDs'
      });
    }

    const results = [];
    
    for (const employeeId of employeeIds) {
      try {
        let limit = await WorkHourLimit.findOne({ employee: employeeId });
        
        if (limit) {
          limit.weeklyLimit = weeklyLimit;
          limit.dailyLimit = dailyLimit;
          limit.warningThreshold = warningThreshold;
          limit.enforceLimit = enforceLimit;
          limit.isCustom = true;
          limit.lastModifiedBy = req.user.id;
          await limit.save();
        } else {
          limit = await WorkHourLimit.create({
            employee: employeeId,
            weeklyLimit,
            dailyLimit,
            warningThreshold,
            enforceLimit,
            isCustom: true,
            lastModifiedBy: req.user.id
          });
        }
        
        results.push({ success: true, employeeId, limit });
      } catch (error) {
        results.push({ success: false, employeeId, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.status(200).json({
      success: true,
      message: `${successCount} work hour limit(s) updated successfully`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work hour limit (reset to default)
// @route   DELETE /api/work-hour-limits/:id
// @access  Private/Admin
exports.deleteLimit = async (req, res, next) => {
  try {
    const limit = await WorkHourLimit.findById(req.params.id);

    if (!limit) {
      return res.status(404).json({
        success: false,
        message: 'Work hour limit not found'
      });
    }

    await limit.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Work hour limit deleted successfully (reset to default)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check current week hours for employee
// @route   GET /api/work-hour-limits/check-hours/:employeeId
// @access  Private
exports.checkCurrentWeekHours = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    // Employees can only check their own hours
    if (req.user.role === 'employee' && req.user.id !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You can only check your own hours'
      });
    }

    // Get or create limit
    let limit = await WorkHourLimit.findOne({ employee: employeeId });
    if (!limit) {
      limit = await WorkHourLimit.getOrCreateLimit(employeeId);
    }

    // Calculate current week start and end
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get approved timesheets for current week
    const timesheets = await Timesheet.find({
      employee: employeeId,
      date: { $gte: weekStart, $lte: weekEnd },
      status: { $in: ['approved', 'submitted'] }
    });

    const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
    const percentage = (totalHours / limit.weeklyLimit) * 100;
    const remainingHours = limit.weeklyLimit - totalHours;
    const isOverLimit = totalHours > limit.weeklyLimit;
    const isNearLimit = percentage >= limit.warningThreshold;

    res.status(200).json({
      success: true,
      data: {
        limit: limit.weeklyLimit,
        totalHours,
        remainingHours,
        percentage: Math.round(percentage * 100) / 100,
        isOverLimit,
        isNearLimit,
        warningThreshold: limit.warningThreshold,
        enforceLimit: limit.enforceLimit,
        weekStart,
        weekEnd,
        timesheets: timesheets.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate timesheet hours against limits
// @route   POST /api/work-hour-limits/validate
// @access  Private
exports.validateTimesheetHours = async (req, res, next) => {
  try {
    const { employeeId, date, hours, excludeTimesheetId } = req.body;

    // Get or create limit
    let limit = await WorkHourLimit.findOne({ employee: employeeId });
    if (!limit) {
      limit = await WorkHourLimit.getOrCreateLimit(employeeId);
    }

    // Check daily limit
    if (hours > limit.dailyLimit) {
      return res.status(200).json({
        success: true,
        isValid: false,
        reason: 'daily_limit',
        message: `Hours exceed daily limit of ${limit.dailyLimit} hours`,
        limit: limit.dailyLimit,
        canBypass: req.user.role === 'admin'
      });
    }

    // Calculate week boundaries for the given date
    const checkDate = new Date(date);
    const dayOfWeek = checkDate.getDay();
    const weekStart = new Date(checkDate);
    weekStart.setDate(checkDate.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get timesheets for the week
    const query = {
      employee: employeeId,
      date: { $gte: weekStart, $lte: weekEnd },
      status: { $in: ['approved', 'submitted', 'draft'] }
    };

    // Exclude current timesheet if updating
    if (excludeTimesheetId) {
      query._id = { $ne: excludeTimesheetId };
    }

    const timesheets = await Timesheet.find(query);
    const currentWeekHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
    const projectedTotal = currentWeekHours + hours;

    // Check weekly limit
    if (limit.enforceLimit && projectedTotal > limit.weeklyLimit) {
      return res.status(200).json({
        success: true,
        isValid: false,
        reason: 'weekly_limit',
        message: `Adding ${hours} hours would exceed weekly limit of ${limit.weeklyLimit} hours (current: ${currentWeekHours} hours)`,
        currentHours: currentWeekHours,
        limit: limit.weeklyLimit,
        projectedTotal,
        canBypass: req.user.role === 'admin'
      });
    }

    // Check warning threshold
    const percentage = (projectedTotal / limit.weeklyLimit) * 100;
    const isNearLimit = percentage >= limit.warningThreshold;

    res.status(200).json({
      success: true,
      isValid: true,
      isNearLimit,
      currentHours: currentWeekHours,
      projectedTotal,
      limit: limit.weeklyLimit,
      percentage: Math.round(percentage * 100) / 100,
      warningThreshold: limit.warningThreshold,
      message: isNearLimit 
        ? `Warning: You will be at ${Math.round(percentage)}% of your weekly limit` 
        : 'Hours are within limits'
    });
  } catch (error) {
    next(error);
  }
};
