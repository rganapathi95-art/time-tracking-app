const mongoose = require('mongoose');

const timesheetPeriodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Period name is required'],
    trim: true,
    maxlength: [100, 'Period name cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Flexible scheduling - can be recurring or one-time
  recurringType: {
    type: String,
    enum: ['none', 'weekly', 'biweekly', 'monthly'],
    default: 'none'
  },
  // Notification settings for this period
  notificationDate: {
    type: Date,
    required: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  // Track which users have access to this period
  restrictedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // If empty, all users have access
  allowAllUsers: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for faster queries
timesheetPeriodSchema.index({ startDate: 1, endDate: 1 });
timesheetPeriodSchema.index({ status: 1 });
timesheetPeriodSchema.index({ isActive: 1 });

// Method to check if a user has access to this period
timesheetPeriodSchema.methods.hasUserAccess = function(userId) {
  if (this.allowAllUsers) {
    return true;
  }
  return this.restrictedUsers.some(id => id.toString() === userId.toString());
};

// Method to check if a date falls within this period
timesheetPeriodSchema.methods.containsDate = function(date) {
  const checkDate = new Date(date);
  return checkDate >= this.startDate && checkDate <= this.endDate;
};

module.exports = mongoose.model('TimesheetPeriod', timesheetPeriodSchema);
