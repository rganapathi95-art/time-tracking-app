const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Project code is required'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Project code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  costCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCenter',
    required: [true, 'Cost center is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  elementNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Element number cannot exceed 50 characters']
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ code: 1 }, { unique: true });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
