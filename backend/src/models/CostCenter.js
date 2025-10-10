const mongoose = require('mongoose');

const costCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cost center name is required'],
    trim: true,
    maxlength: [100, 'Cost center name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Cost center code is required'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Cost center code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  department: {
    type: String,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
costCenterSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('CostCenter', costCenterSchema);
