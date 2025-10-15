const User = require('../models/User');
const Project = require('../models/Project');
const Timesheet = require('../models/Timesheet');
const CostCenter = require('../models/CostCenter');
const mongoose = require('mongoose');

// @desc    Get employee hours summary
// @route   GET /api/analytics/employee-hours
// @access  Private/Admin
exports.getEmployeeHours = async (req, res, next) => {
  try {
    const { startDate, endDate, status = 'approved' } = req.query;
    
    let matchStage = { status };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const employeeHours = await Timesheet.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$employee',
          totalHours: { $sum: '$hours' },
          timesheetCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          _id: 1,
          employeeName: {
            $concat: ['$employee.firstName', ' ', '$employee.lastName']
          },
          email: '$employee.email',
          department: '$employee.department',
          hourlyRate: '$employee.hourlyRate',
          totalHours: 1,
          timesheetCount: 1,
          totalCost: { $multiply: ['$totalHours', '$employee.hourlyRate'] }
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    const totalHours = employeeHours.reduce((sum, emp) => sum + emp.totalHours, 0);
    const totalCost = employeeHours.reduce((sum, emp) => sum + emp.totalCost, 0);

    res.status(200).json({
      success: true,
      data: {
        employees: employeeHours,
        summary: {
          totalHours,
          totalCost,
          employeeCount: employeeHours.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project allocation data
// @route   GET /api/analytics/project-allocation
// @access  Private/Admin
exports.getProjectAllocation = async (req, res, next) => {
  try {
    const { startDate, endDate, status = 'approved' } = req.query;
    
    let matchStage = { status };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const projectAllocation = await Timesheet.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$project',
          totalHours: { $sum: '$hours' },
          employeeCount: { $addToSet: '$employee' },
          timesheetCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $lookup: {
          from: 'costcenters',
          localField: 'project.costCenter',
          foreignField: '_id',
          as: 'costCenter'
        }
      },
      { $unwind: '$costCenter' },
      {
        $project: {
          _id: 1,
          projectName: '$project.name',
          projectCode: '$project.code',
          projectStatus: '$project.status',
          projectBudget: '$project.budget',
          costCenterName: '$costCenter.name',
          totalHours: 1,
          employeeCount: { $size: '$employeeCount' },
          timesheetCount: 1
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    const totalHours = projectAllocation.reduce((sum, proj) => sum + proj.totalHours, 0);

    res.status(200).json({
      success: true,
      data: {
        projects: projectAllocation,
        summary: {
          totalHours,
          projectCount: projectAllocation.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cost center summary
// @route   GET /api/analytics/cost-center-summary
// @access  Private/Admin
exports.getCostCenterSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, status = 'approved' } = req.query;
    
    let matchStage = { status };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const costCenterSummary = await Timesheet.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$project.costCenter',
          totalHours: { $sum: '$hours' },
          totalCost: { $sum: { $multiply: ['$hours', '$employee.hourlyRate'] } },
          projectCount: { $addToSet: '$project._id' },
          employeeCount: { $addToSet: '$employee._id' }
        }
      },
      {
        $lookup: {
          from: 'costcenters',
          localField: '_id',
          foreignField: '_id',
          as: 'costCenter'
        }
      },
      { $unwind: '$costCenter' },
      {
        $project: {
          _id: 1,
          costCenterName: '$costCenter.name',
          costCenterCode: '$costCenter.code',
          costCenterBudget: '$costCenter.budget',
          department: '$costCenter.department',
          totalHours: 1,
          totalCost: 1,
          projectCount: { $size: '$projectCount' },
          employeeCount: { $size: '$employeeCount' },
          budgetUtilization: {
            $cond: {
              if: { $gt: ['$costCenter.budget', 0] },
              then: {
                $multiply: [
                  { $divide: ['$totalCost', '$costCenter.budget'] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    const totalHours = costCenterSummary.reduce((sum, cc) => sum + cc.totalHours, 0);
    const totalCost = costCenterSummary.reduce((sum, cc) => sum + cc.totalCost, 0);

    res.status(200).json({
      success: true,
      data: {
        costCenters: costCenterSummary,
        summary: {
          totalHours,
          totalCost,
          costCenterCount: costCenterSummary.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Total counts
    const [
      totalEmployees,
      totalProjects,
      totalCostCenters,
      pendingTimesheets,
      monthlyHours,
      weeklyHours
    ] = await Promise.all([
      User.countDocuments({ role: 'employee', isActive: true }),
      Project.countDocuments({ isActive: true }),
      CostCenter.countDocuments({ isActive: true }),
      Timesheet.countDocuments({ status: 'submitted' }),
      Timesheet.aggregate([
        { $match: { date: { $gte: startOfMonth }, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$hours' } } }
      ]),
      Timesheet.aggregate([
        { $match: { date: { $gte: startOfWeek }, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$hours' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalProjects,
        totalCostCenters,
        pendingTimesheets,
        monthlyHours: monthlyHours[0]?.total || 0,
        weeklyHours: weeklyHours[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee personal analytics
// @route   GET /api/analytics/my-analytics
// @access  Private/Employee
exports.getMyAnalytics = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get employee's timesheets statistics
    const [
      totalHoursLogged,
      monthlyHours,
      weeklyHours,
      pendingTimesheets,
      approvedTimesheets,
      rejectedTimesheets,
      projectsWorkedOn,
      recentTimesheets,
      monthlyTrend
    ] = await Promise.all([
      // Total hours logged (all time, approved)
      Timesheet.aggregate([
        { $match: { employee: mongoose.Types.ObjectId(employeeId), status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$hours' } } }
      ]),
      // Monthly hours
      Timesheet.aggregate([
        { $match: { employee: mongoose.Types.ObjectId(employeeId), date: { $gte: startOfMonth }, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$hours' } } }
      ]),
      // Weekly hours
      Timesheet.aggregate([
        { $match: { employee: mongoose.Types.ObjectId(employeeId), date: { $gte: startOfWeek }, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$hours' } } }
      ]),
      // Pending timesheets count
      Timesheet.countDocuments({ employee: employeeId, status: 'submitted' }),
      // Approved timesheets count
      Timesheet.countDocuments({ employee: employeeId, status: 'approved' }),
      // Rejected timesheets count
      Timesheet.countDocuments({ employee: employeeId, status: 'rejected' }),
      // Projects worked on
      Timesheet.aggregate([
        { $match: { employee: mongoose.Types.ObjectId(employeeId) } },
        { $group: { _id: '$project' } },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: '$project' },
        {
          $project: {
            _id: '$project._id',
            name: '$project.name',
            code: '$project.code',
            status: '$project.status'
          }
        }
      ]),
      // Recent timesheets (last 10)
      Timesheet.find({ employee: employeeId })
        .populate('project', 'name code')
        .sort({ date: -1 })
        .limit(10)
        .select('date hours description status project'),
      // Monthly trend (last 6 months)
      Timesheet.aggregate([
        {
          $match: {
            employee: mongoose.Types.ObjectId(employeeId),
            date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
            status: 'approved'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            hours: { $sum: '$hours' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Hours by project
    const hoursByProject = await Timesheet.aggregate([
      { $match: { employee: mongoose.Types.ObjectId(employeeId), status: 'approved' } },
      {
        $group: {
          _id: '$project',
          totalHours: { $sum: '$hours' },
          timesheetCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          projectName: '$project.name',
          projectCode: '$project.code',
          totalHours: 1,
          timesheetCount: 1
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    // Calculate earnings (if hourly rate is set)
    const user = await User.findById(employeeId).select('hourlyRate currency');
    const estimatedEarnings = user.hourlyRate ? (totalHoursLogged[0]?.total || 0) * user.hourlyRate : null;
    const monthlyEarnings = user.hourlyRate ? (monthlyHours[0]?.total || 0) * user.hourlyRate : null;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalHoursLogged: totalHoursLogged[0]?.total || 0,
          monthlyHours: monthlyHours[0]?.total || 0,
          weeklyHours: weeklyHours[0]?.total || 0,
          pendingTimesheets,
          approvedTimesheets,
          rejectedTimesheets,
          estimatedEarnings,
          monthlyEarnings,
          currency: user.currency || 'USD'
        },
        projectsWorkedOn,
        hoursByProject,
        recentTimesheets,
        monthlyTrend: monthlyTrend.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          hours: item.hours,
          count: item.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
