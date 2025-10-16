const TimesheetPeriod = require('../models/TimesheetPeriod');
const { sendPeriodOpenedNotification } = require('../utils/notificationService');
const User = require('../models/User');

// @desc    Get all timesheet periods
// @route   GET /api/timesheet-periods
// @access  Private
exports.getTimesheetPeriods = async (req, res, next) => {
  try {
    const { status, isActive } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const periods = await TimesheetPeriod.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('restrictedUsers', 'firstName lastName email')
      .sort({ startDate: -1 });

    // Filter periods based on user access (for employees)
    let filteredPeriods = periods;
    if (req.user.role === 'employee') {
      filteredPeriods = periods.filter(period => period.hasUserAccess(req.user.id));
    }

    res.status(200).json({
      success: true,
      count: filteredPeriods.length,
      data: filteredPeriods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single timesheet period
// @route   GET /api/timesheet-periods/:id
// @access  Private
exports.getTimesheetPeriod = async (req, res, next) => {
  try {
    const period = await TimesheetPeriod.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('restrictedUsers', 'firstName lastName email');

    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet period not found'
      });
    }

    // Check if employee has access
    if (req.user.role === 'employee' && !period.hasUserAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this timesheet period'
      });
    }

    res.status(200).json({
      success: true,
      data: period
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create timesheet period
// @route   POST /api/timesheet-periods
// @access  Private/Admin
exports.createTimesheetPeriod = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const period = await TimesheetPeriod.create(req.body);

    const populatedPeriod = await TimesheetPeriod.findById(period._id)
      .populate('createdBy', 'firstName lastName')
      .populate('restrictedUsers', 'firstName lastName email');

    // Send notifications if period is active
    if (period.status === 'active') {
      const userIds = period.allowAllUsers 
        ? (await User.find({ role: 'employee', isActive: true }).select('_id')).map(u => u._id)
        : period.restrictedUsers;
      
      if (userIds.length > 0) {
        await sendPeriodOpenedNotification(period, userIds);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Timesheet period created successfully',
      data: populatedPeriod
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update timesheet period
// @route   PUT /api/timesheet-periods/:id
// @access  Private/Admin
exports.updateTimesheetPeriod = async (req, res, next) => {
  try {
    let period = await TimesheetPeriod.findById(req.params.id);

    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet period not found'
      });
    }

    const wasInactive = period.status !== 'active';
    const willBeActive = req.body.status === 'active';

    period = await TimesheetPeriod.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('createdBy', 'firstName lastName')
      .populate('restrictedUsers', 'firstName lastName email');

    // Send notifications if period was just activated
    if (wasInactive && willBeActive) {
      const userIds = period.allowAllUsers 
        ? (await User.find({ role: 'employee', isActive: true }).select('_id')).map(u => u._id)
        : period.restrictedUsers;
      
      if (userIds.length > 0) {
        await sendPeriodOpenedNotification(period, userIds);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Timesheet period updated successfully',
      data: period
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete timesheet period
// @route   DELETE /api/timesheet-periods/:id
// @access  Private/Admin
exports.deleteTimesheetPeriod = async (req, res, next) => {
  try {
    const period = await TimesheetPeriod.findById(req.params.id);

    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet period not found'
      });
    }

    await period.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Timesheet period deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active periods for current user
// @route   GET /api/timesheet-periods/active/my-periods
// @access  Private
exports.getMyActivePeriods = async (req, res, next) => {
  try {
    const now = new Date();
    
    const periods = await TimesheetPeriod.find({
      status: 'active',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: -1 });

    // Filter based on user access
    const filteredPeriods = periods.filter(period => period.hasUserAccess(req.user.id));

    res.status(200).json({
      success: true,
      count: filteredPeriods.length,
      data: filteredPeriods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if date is within allowed period
// @route   POST /api/timesheet-periods/validate-date
// @access  Private
exports.validateDate = async (req, res, next) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const checkDate = new Date(date);
    
    const periods = await TimesheetPeriod.find({
      status: 'active',
      isActive: true,
      startDate: { $lte: checkDate },
      endDate: { $gte: checkDate }
    });

    // Check if user has access to any period containing this date
    const accessiblePeriod = periods.find(period => period.hasUserAccess(req.user.id));

    res.status(200).json({
      success: true,
      isValid: !!accessiblePeriod,
      period: accessiblePeriod || null,
      message: accessiblePeriod 
        ? 'Date is within an allowed timesheet period' 
        : 'Date is not within any allowed timesheet period'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send reminders for a period
// @route   POST /api/timesheet-periods/:id/send-reminders
// @access  Private/Admin
exports.sendReminders = async (req, res, next) => {
  try {
    const period = await TimesheetPeriod.findById(req.params.id);

    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet period not found'
      });
    }

    const { sendTimesheetReminders } = require('../utils/notificationService');
    
    const userIds = period.allowAllUsers 
      ? (await User.find({ role: 'employee', isActive: true }).select('_id')).map(u => u._id)
      : period.restrictedUsers;

    const results = await sendTimesheetReminders(period._id, userIds);

    res.status(200).json({
      success: true,
      message: 'Reminders sent successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};
