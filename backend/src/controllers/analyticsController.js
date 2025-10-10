const Timesheet = require('../models/Timesheet');
const Project = require('../models/Project');
const User = require('../models/User');
const CostCenter = require('../models/CostCenter');

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
