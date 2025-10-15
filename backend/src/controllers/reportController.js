const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Project = require('../models/Project');
const Timesheet = require('../models/Timesheet');
const CostCenter = require('../models/CostCenter');

// @desc    Generate comprehensive report (HTML)
// @route   GET /api/reports/comprehensive
// @access  Private/Admin
exports.getComprehensiveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'html' } = req.query;

    // Fetch all data
    const [users, projects, timesheets, costCenters] = await Promise.all([
      User.find().select('-password').lean(),
      Project.find().populate('costCenter').populate('assignedEmployees', 'firstName lastName email').lean(),
      Timesheet.find(startDate && endDate ? {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      } : {})
        .populate('employee', 'firstName lastName email')
        .populate('project', 'name code country elementNumber')
        .lean(),
      CostCenter.find().lean()
    ]);

    // Calculate statistics
    const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
    const totalUsers = users.length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;

    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: startDate && endDate ? { startDate, endDate } : 'All Time',
      summary: {
        totalUsers,
        totalProjects,
        activeProjects,
        totalHours: totalHours.toFixed(2),
        totalTimesheets: timesheets.length
      },
      users,
      projects,
      timesheets,
      costCenters
    };

    if (format === 'pdf') {
      return exports.generatePDFReport(req, res, reportData);
    }

    // Return HTML format
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Users Report
// @route   GET /api/reports/users
// @access  Private/Admin
exports.getUsersReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('assignedProjects', 'name code')
      .lean();

    const reportData = {
      generatedAt: new Date().toISOString(),
      type: 'Users Report',
      dateRange: startDate && endDate ? { startDate, endDate } : 'All Time',
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      lockedUsers: users.filter(u => u.lockUntil && new Date(u.lockUntil) > new Date()).length,
      users
    };

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Projects Report
// @route   GET /api/reports/projects
// @access  Private/Admin
exports.getProjectsReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const projects = await Project.find(query)
      .populate('costCenter', 'name code')
      .populate('assignedEmployees', 'firstName lastName email')
      .lean();

    const reportData = {
      generatedAt: new Date().toISOString(),
      type: 'Projects Report',
      dateRange: startDate && endDate ? { startDate, endDate } : 'All Time',
      totalProjects: projects.length,
      projectsByStatus: {
        planning: projects.filter(p => p.status === 'planning').length,
        active: projects.filter(p => p.status === 'active').length,
        'on-hold': projects.filter(p => p.status === 'on-hold').length,
        completed: projects.filter(p => p.status === 'completed').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length
      },
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      projects
    };

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Timesheets Report
// @route   GET /api/reports/timesheets
// @access  Private/Admin
exports.getTimesheetsReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const timesheets = await Timesheet.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('project', 'name code country elementNumber')
      .lean();

    const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);

    const reportData = {
      generatedAt: new Date().toISOString(),
      type: 'Timesheets Report',
      dateRange: startDate && endDate ? { startDate, endDate } : 'All Time',
      totalTimesheets: timesheets.length,
      totalHours: totalHours.toFixed(2),
      timesheets
    };

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate PDF Report
// @route   GET /api/reports/pdf
// @access  Private/Admin
exports.generatePDFReport = async (req, res, reportData) => {
  try {
    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      bufferPages: true
    });
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to draw Excel-style table
    const drawTable = (headers, rows, startY, columnWidths) => {
      const tableTop = startY || doc.y;
      const itemHeight = 18;
      const tableLeft = 40;
      
      // Calculate column widths if not provided
      const colWidths = columnWidths || headers.map(() => (doc.page.width - 80) / headers.length);
      
      // Draw header row with blue background
      doc.fontSize(9).font('Helvetica-Bold');
      let xPos = tableLeft;
      headers.forEach((header, i) => {
        // Header background (blue)
        doc.rect(xPos, tableTop, colWidths[i], itemHeight)
           .fillAndStroke('#4472C4', '#000000');
        
        // Header text (white)
        doc.fillColor('#FFFFFF')
           .text(header, xPos + 5, tableTop + 5, {
             width: colWidths[i] - 10,
             align: 'center',
             ellipsis: true
           });
        xPos += colWidths[i];
      });
      
      // Draw data rows with alternating colors
      let currentY = tableTop + itemHeight;
      doc.font('Helvetica').fontSize(8);
      
      rows.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (currentY > doc.page.height - 80) {
          doc.addPage();
          currentY = 40;
          
          // Redraw headers on new page
          doc.fontSize(9).font('Helvetica-Bold');
          xPos = tableLeft;
          headers.forEach((header, i) => {
            doc.rect(xPos, currentY, colWidths[i], itemHeight)
               .fillAndStroke('#4472C4', '#000000');
            doc.fillColor('#FFFFFF')
               .text(header, xPos + 5, currentY + 5, {
                 width: colWidths[i] - 10,
                 align: 'center',
                 ellipsis: true
               });
            xPos += colWidths[i];
          });
          currentY += itemHeight;
          doc.font('Helvetica').fontSize(8);
        }
        
        // Alternating row colors (white and light gray)
        const fillColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#F2F2F2';
        xPos = tableLeft;
        
        row.forEach((cell, i) => {
          // Cell background
          doc.rect(xPos, currentY, colWidths[i], itemHeight)
             .fillAndStroke(fillColor, '#000000');
          
          // Cell text (black)
          const cellText = String(cell || '-');
          const align = typeof cell === 'number' ? 'right' : 'left';
          
          doc.fillColor('#000000')
             .text(cellText, xPos + 5, currentY + 5, {
               width: colWidths[i] - 10,
               align: align,
               ellipsis: true
             });
          xPos += colWidths[i];
        });
        currentY += itemHeight;
      });
      
      return currentY + 20;
    };

    // Title Page
    doc.fontSize(24).fillColor('#1f2937')
       .text('Time Sheet Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#6b7280')
       .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    if (reportData.dateRange && reportData.dateRange !== 'All Time') {
      doc.text(`Period: ${reportData.dateRange.startDate} to ${reportData.dateRange.endDate}`, { align: 'center' });
    }
    doc.moveDown(2);

    // Summary Section with boxes
    if (reportData.summary) {
      doc.fontSize(16).fillColor('#1f2937').text('Summary Overview', { underline: true });
      doc.moveDown();
      
      const summaryItems = [
        ['Total Users', reportData.summary.totalUsers],
        ['Total Projects', reportData.summary.totalProjects],
        ['Active Projects', reportData.summary.activeProjects],
        ['Total Hours', reportData.summary.totalHours],
        ['Total Timesheets', reportData.summary.totalTimesheets]
      ];
      
      summaryItems.forEach(([label, value]) => {
        doc.fontSize(11).fillColor('#374151').text(`${label}: `, { continued: true })
           .fillColor('#059669').fontSize(12).text(value);
      });
      doc.moveDown(2);
    }

    // Users Table
    if (reportData.users && reportData.users.length > 0) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1f2937').text('Users Report', { underline: true });
      doc.moveDown();
      
      const userHeaders = ['SL.No', 'Name', 'Email', 'Role', 'Department', 'Position', 'Status', 'OTP'];
      const userRows = reportData.users.map((u, index) => [
        index + 1,
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.role,
        u.department || '-',
        u.position || '-',
        u.isActive ? 'Active' : 'Inactive',
        u.otpEnabled ? 'Yes' : 'No'
      ]);
      
      // Custom column widths
      const userColWidths = [35, 90, 120, 50, 70, 70, 50, 40];
      
      drawTable(userHeaders, userRows, null, userColWidths);
    }

    // Projects Table
    if (reportData.projects && reportData.projects.length > 0) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1f2937').text('Projects Report', { underline: true });
      doc.moveDown();
      
      const projectHeaders = ['SL.No', 'Project Name', 'Country', 'Element No', 'Status', 'Budget', 'Employees'];
      const projectRows = reportData.projects.map((p, index) => [
        index + 1,
        p.name,
        p.country || '-',
        p.elementNumber || '-',
        p.status,
        `$${(p.budget || 0).toLocaleString()}`,
        p.assignedEmployees?.length || 0
      ]);
      
      // Custom column widths for better layout
      const projectColWidths = [35, 150, 70, 80, 70, 70, 60];
      
      drawTable(projectHeaders, projectRows, null, projectColWidths);
    }

    // Timesheets Table
    if (reportData.timesheets && reportData.timesheets.length > 0) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1f2937').text('Timesheets Report', { underline: true });
      doc.moveDown();
      
      const timesheetHeaders = ['SL.No', 'Date', 'Employee', 'Project', 'Country', 'Element No', 'Hours', 'Status'];
      const timesheetRows = reportData.timesheets.slice(0, 100).map((ts, index) => [
        index + 1,
        new Date(ts.date).toLocaleDateString(),
        `${ts.employee?.firstName || ''} ${ts.employee?.lastName || ''}`,
        ts.project?.name || '-',
        ts.project?.country || '-',
        ts.project?.elementNumber || '-',
        ts.hours,
        ts.status || 'draft'
      ]);
      
      // Custom column widths
      const timesheetColWidths = [35, 70, 100, 120, 60, 70, 45, 55];
      
      drawTable(timesheetHeaders, timesheetRows, null, timesheetColWidths);
    }

    // Cost Centers
    if (reportData.costCenters && reportData.costCenters.length > 0) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1f2937').text('Cost Centers', { underline: true });
      doc.moveDown();
      
      const ccHeaders = ['SL.No', 'Name', 'Code', 'Description'];
      const ccRows = reportData.costCenters.map((cc, index) => [
        index + 1,
        cc.name,
        cc.code,
        (cc.description || '-').substring(0, 60)
      ]);
      
      // Custom column widths
      const ccColWidths = [35, 150, 80, 270];
      
      drawTable(ccHeaders, ccRows, null, ccColWidths);
    }

    // Page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#6b7280')
         .text(`Page ${i + 1} of ${pages.count}`, 
           40, doc.page.height - 30, 
           { align: 'center' });
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
};

// @desc    Generate custom report with advanced filters
// @route   POST /api/reports/custom
// @access  Private (Admin and Employee with restrictions)
exports.generateCustomReport = async (req, res, next) => {
  try {
    const {
      reportType = 'timesheet',
      startDate,
      endDate,
      employees = [],
      projects = [],
      costCenters = [],
      departments = [],
      status = [],
      groupBy = 'date',
      includeMetrics = true,
      format = 'json'
    } = req.body;

    // Build query based on filters
    let query = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Employee filter (restrict to self for non-admin)
    if (req.user.role !== 'admin') {
      query.employee = req.user.id;
    } else if (employees.length > 0) {
      query.employee = { $in: employees };
    }

    // Project filter
    if (projects.length > 0) {
      query.project = { $in: projects };
    }

    // Status filter
    if (status.length > 0) {
      query.status = { $in: status };
    }

    // Fetch timesheets with populated data
    let timesheets = await Timesheet.find(query)
      .populate('employee', 'firstName lastName email department position hourlyRate currency')
      .populate('project', 'name code costCenter country elementNumber budget currency')
      .populate({
        path: 'project',
        populate: {
          path: 'costCenter',
          select: 'name code department'
        }
      })
      .sort({ date: -1 })
      .lean();

    // Apply additional filters
    if (costCenters.length > 0) {
      timesheets = timesheets.filter(ts => 
        ts.project?.costCenter && costCenters.includes(ts.project.costCenter._id.toString())
      );
    }

    if (departments.length > 0) {
      timesheets = timesheets.filter(ts => 
        ts.employee?.department && departments.includes(ts.employee.department)
      );
    }

    // Group data based on groupBy parameter
    let groupedData = {};
    
    switch (groupBy) {
      case 'employee':
        groupedData = timesheets.reduce((acc, ts) => {
          const key = ts.employee?._id?.toString() || 'unknown';
          if (!acc[key]) {
            acc[key] = {
              employee: ts.employee,
              timesheets: [],
              totalHours: 0,
              totalCost: 0
            };
          }
          acc[key].timesheets.push(ts);
          acc[key].totalHours += ts.hours;
          if (ts.employee?.hourlyRate) {
            acc[key].totalCost += ts.hours * ts.employee.hourlyRate;
          }
          return acc;
        }, {});
        break;

      case 'project':
        groupedData = timesheets.reduce((acc, ts) => {
          const key = ts.project?._id?.toString() || 'unknown';
          if (!acc[key]) {
            acc[key] = {
              project: ts.project,
              timesheets: [],
              totalHours: 0,
              totalCost: 0
            };
          }
          acc[key].timesheets.push(ts);
          acc[key].totalHours += ts.hours;
          if (ts.employee?.hourlyRate) {
            acc[key].totalCost += ts.hours * ts.employee.hourlyRate;
          }
          return acc;
        }, {});
        break;

      case 'costCenter':
        groupedData = timesheets.reduce((acc, ts) => {
          const key = ts.project?.costCenter?._id?.toString() || 'unknown';
          if (!acc[key]) {
            acc[key] = {
              costCenter: ts.project?.costCenter,
              timesheets: [],
              totalHours: 0,
              totalCost: 0
            };
          }
          acc[key].timesheets.push(ts);
          acc[key].totalHours += ts.hours;
          if (ts.employee?.hourlyRate) {
            acc[key].totalCost += ts.hours * ts.employee.hourlyRate;
          }
          return acc;
        }, {});
        break;

      case 'department':
        groupedData = timesheets.reduce((acc, ts) => {
          const key = ts.employee?.department || 'unknown';
          if (!acc[key]) {
            acc[key] = {
              department: key,
              timesheets: [],
              totalHours: 0,
              totalCost: 0
            };
          }
          acc[key].timesheets.push(ts);
          acc[key].totalHours += ts.hours;
          if (ts.employee?.hourlyRate) {
            acc[key].totalCost += ts.hours * ts.employee.hourlyRate;
          }
          return acc;
        }, {});
        break;

      case 'date':
      default:
        groupedData = timesheets.reduce((acc, ts) => {
          const key = new Date(ts.date).toISOString().split('T')[0];
          if (!acc[key]) {
            acc[key] = {
              date: key,
              timesheets: [],
              totalHours: 0,
              totalCost: 0
            };
          }
          acc[key].timesheets.push(ts);
          acc[key].totalHours += ts.hours;
          if (ts.employee?.hourlyRate) {
            acc[key].totalCost += ts.hours * ts.employee.hourlyRate;
          }
          return acc;
        }, {});
        break;
    }

    // Calculate overall metrics
    const metrics = includeMetrics ? {
      totalTimesheets: timesheets.length,
      totalHours: timesheets.reduce((sum, ts) => sum + ts.hours, 0),
      totalCost: timesheets.reduce((sum, ts) => {
        return sum + (ts.employee?.hourlyRate ? ts.hours * ts.employee.hourlyRate : 0);
      }, 0),
      averageHoursPerDay: 0,
      uniqueEmployees: new Set(timesheets.map(ts => ts.employee?._id?.toString())).size,
      uniqueProjects: new Set(timesheets.map(ts => ts.project?._id?.toString())).size,
      statusBreakdown: {
        draft: timesheets.filter(ts => ts.status === 'draft').length,
        submitted: timesheets.filter(ts => ts.status === 'submitted').length,
        approved: timesheets.filter(ts => ts.status === 'approved').length,
        rejected: timesheets.filter(ts => ts.status === 'rejected').length
      }
    } : null;

    // Calculate average hours per day
    if (metrics && startDate && endDate) {
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      metrics.averageHoursPerDay = (metrics.totalHours / days).toFixed(2);
    }

    const reportData = {
      generatedAt: new Date().toISOString(),
      generatedBy: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        role: req.user.role
      },
      reportType,
      filters: {
        startDate,
        endDate,
        employees: employees.length,
        projects: projects.length,
        costCenters: costCenters.length,
        departments,
        status
      },
      groupBy,
      metrics,
      data: Object.values(groupedData)
    };

    // Handle different output formats
    if (format === 'csv') {
      return exports.generateCSVReport(res, reportData, timesheets);
    }

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate CSV report
// @route   Helper function
// @access  Private
exports.generateCSVReport = (res, reportData, timesheets) => {
  try {
    // CSV headers
    const headers = [
      'Date',
      'Employee Name',
      'Employee Email',
      'Department',
      'Project Name',
      'Project Code',
      'Cost Center',
      'Hours',
      'Description',
      'Status',
      'Hourly Rate',
      'Cost'
    ];

    // CSV rows
    const rows = timesheets.map(ts => [
      new Date(ts.date).toISOString().split('T')[0],
      ts.employee ? `${ts.employee.firstName} ${ts.employee.lastName}` : 'N/A',
      ts.employee?.email || 'N/A',
      ts.employee?.department || 'N/A',
      ts.project?.name || 'N/A',
      ts.project?.code || 'N/A',
      ts.project?.costCenter?.name || 'N/A',
      ts.hours,
      `"${(ts.description || '').replace(/"/g, '""')}"`,
      ts.status,
      ts.employee?.hourlyRate || 0,
      ts.employee?.hourlyRate ? (ts.hours * ts.employee.hourlyRate).toFixed(2) : 0
    ]);

    // Build CSV content
    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.join(',')).join('\n');

    // Add summary at the end
    csv += '\n\n';
    csv += 'Summary\n';
    csv += `Total Timesheets,${reportData.metrics?.totalTimesheets || 0}\n`;
    csv += `Total Hours,${reportData.metrics?.totalHours || 0}\n`;
    csv += `Total Cost,${reportData.metrics?.totalCost?.toFixed(2) || 0}\n`;

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="timesheet-report-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('CSV generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating CSV report'
    });
  }
};

// @desc    Get employee's personal reports
// @route   GET /api/reports/my-reports
// @access  Private/Employee
exports.getMyReports = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const { startDate, endDate, groupBy = 'month' } = req.query;

    // Build query
    let query = { employee: employeeId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Fetch timesheets
    const timesheets = await Timesheet.find(query)
      .populate('project', 'name code')
      .sort({ date: -1 })
      .lean();

    // Get user info for hourly rate
    const user = await User.findById(employeeId).select('hourlyRate currency');

    // Group by specified parameter
    let groupedData = {};
    
    if (groupBy === 'month') {
      groupedData = timesheets.reduce((acc, ts) => {
        const date = new Date(ts.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[key]) {
          acc[key] = { month: key, hours: 0, cost: 0, count: 0, timesheets: [] };
        }
        acc[key].hours += ts.hours;
        acc[key].cost += user.hourlyRate ? ts.hours * user.hourlyRate : 0;
        acc[key].count += 1;
        acc[key].timesheets.push(ts);
        return acc;
      }, {});
    } else if (groupBy === 'project') {
      groupedData = timesheets.reduce((acc, ts) => {
        const key = ts.project?._id?.toString() || 'unknown';
        if (!acc[key]) {
          acc[key] = { 
            project: ts.project, 
            hours: 0, 
            cost: 0, 
            count: 0, 
            timesheets: [] 
          };
        }
        acc[key].hours += ts.hours;
        acc[key].cost += user.hourlyRate ? ts.hours * user.hourlyRate : 0;
        acc[key].count += 1;
        acc[key].timesheets.push(ts);
        return acc;
      }, {});
    }

    // Calculate summary
    const summary = {
      totalHours: timesheets.reduce((sum, ts) => sum + ts.hours, 0),
      totalCost: user.hourlyRate ? timesheets.reduce((sum, ts) => sum + ts.hours, 0) * user.hourlyRate : 0,
      totalTimesheets: timesheets.length,
      currency: user.currency || 'USD',
      statusBreakdown: {
        draft: timesheets.filter(ts => ts.status === 'draft').length,
        submitted: timesheets.filter(ts => ts.status === 'submitted').length,
        approved: timesheets.filter(ts => ts.status === 'approved').length,
        rejected: timesheets.filter(ts => ts.status === 'rejected').length
      }
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        groupedData: Object.values(groupedData),
        timesheets: timesheets.slice(0, 50) // Limit to recent 50
      }
    });
  } catch (error) {
    next(error);
  }
};
