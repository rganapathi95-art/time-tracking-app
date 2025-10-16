const mongoose = require('mongoose');

const workHourLimitSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required'],
    unique: true
  },
  weeklyLimit: {
    type: Number,
    required: [true, 'Weekly limit is required'],
    min: [1, 'Weekly limit must be at least 1 hour'],
    max: [168, 'Weekly limit cannot exceed 168 hours'],
    default: 80
  },
  // Optional: daily limit
  dailyLimit: {
    type: Number,
    min: [1, 'Daily limit must be at least 1 hour'],
    max: [24, 'Daily limit cannot exceed 24 hours'],
    default: 24
  },
  // Track if this is a custom limit or default
  isCustom: {
    type: Boolean,
    default: false
  },
  // Warning threshold (percentage of limit)
  warningThreshold: {
    type: Number,
    min: [50, 'Warning threshold must be at least 50%'],
    max: [100, 'Warning threshold cannot exceed 100%'],
    default: 90
  },
  // Whether to enforce strict limits
  enforceLimit: {
    type: Boolean,
    default: true
  },
  // Admin notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Effective date range (optional)
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: {
    type: Date
  },
  // Track who made changes
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
workHourLimitSchema.index({ employee: 1 });
workHourLimitSchema.index({ isCustom: 1 });

// Method to check if limit is currently effective
workHourLimitSchema.methods.isEffective = function() {
  const now = new Date();
  if (this.effectiveFrom && now < this.effectiveFrom) {
    return false;
  }
  if (this.effectiveTo && now > this.effectiveTo) {
    return false;
  }
  return true;
};

// Static method to get or create default limit for employee
workHourLimitSchema.statics.getOrCreateLimit = async function(employeeId) {
  let limit = await this.findOne({ employee: employeeId });
  if (!limit) {
    limit = await this.create({
      employee: employeeId,
      weeklyLimit: 80,
      dailyLimit: 24,
      isCustom: false
    });
  }
  return limit;
};

module.exports = mongoose.model('WorkHourLimit', workHourLimitSchema);
