const CostCenter = require('../models/CostCenter');

// @desc    Get all cost centers
// @route   GET /api/cost-centers
// @access  Private
exports.getCostCenters = async (req, res, next) => {
  try {
    const { department, isActive, search } = req.query;
    
    // Build query
    let query = {};
    
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const costCenters = await CostCenter.find(query)
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: costCenters.length,
      data: costCenters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single cost center
// @route   GET /api/cost-centers/:id
// @access  Private
exports.getCostCenter = async (req, res, next) => {
  try {
    const costCenter = await CostCenter.findById(req.params.id)
      .populate('manager', 'firstName lastName email department');

    if (!costCenter) {
      return res.status(404).json({
        success: false,
        message: 'Cost center not found'
      });
    }

    res.status(200).json({
      success: true,
      data: costCenter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create cost center
// @route   POST /api/cost-centers
// @access  Private/Admin
exports.createCostCenter = async (req, res, next) => {
  try {
    const costCenter = await CostCenter.create(req.body);

    const populatedCostCenter = await CostCenter.findById(costCenter._id)
      .populate('manager', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Cost center created successfully',
      data: populatedCostCenter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cost center
// @route   PUT /api/cost-centers/:id
// @access  Private/Admin
exports.updateCostCenter = async (req, res, next) => {
  try {
    const costCenter = await CostCenter.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('manager', 'firstName lastName email');

    if (!costCenter) {
      return res.status(404).json({
        success: false,
        message: 'Cost center not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cost center updated successfully',
      data: costCenter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete cost center
// @route   DELETE /api/cost-centers/:id
// @access  Private/Admin
exports.deleteCostCenter = async (req, res, next) => {
  try {
    const costCenter = await CostCenter.findById(req.params.id);

    if (!costCenter) {
      return res.status(404).json({
        success: false,
        message: 'Cost center not found'
      });
    }

    // Check if cost center is being used by any projects
    const Project = require('../models/Project');
    const projectCount = await Project.countDocuments({ costCenter: costCenter._id });

    if (projectCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete cost center. It is being used by ${projectCount} project(s)`
      });
    }

    await costCenter.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Cost center deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
