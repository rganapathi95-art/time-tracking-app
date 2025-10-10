const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  hours: {
    type: Number,
    required: [true, 'Hours are required'],
    min: [0.25, 'Minimum hours is 0.25'],
    max: [24, 'Maximum hours is 24']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
timesheetSchema.index({ employee: 1, date: -1 });
timesheetSchema.index({ project: 1 });
timesheetSchema.index({ status: 1 });

// Compound index for preventing duplicate entries
timesheetSchema.index({ employee: 1, project: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Timesheet', timesheetSchema);
