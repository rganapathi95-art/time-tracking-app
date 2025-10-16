const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },

    // Store logo as data URL for simplicity; can be moved to file storage later
    logo: { type: String, default: '' },

    system: {
      defaultCurrency: { type: String, default: 'USD' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      autoApprove: { type: Boolean, default: false }
    },

    // Notification scheduling settings
    notifications: {
      timesheetReminder: {
        enabled: { type: Boolean, default: true },
        dayOfWeek: { type: Number, default: 6, min: 0, max: 6 }, // 0=Sunday, 6=Saturday
        time: { type: String, default: '09:00' }, // 24-hour format HH:mm
        daysBeforeDeadline: { type: Number, default: 0, min: 0, max: 7 }
      },
      hourLimitWarning: {
        enabled: { type: Boolean, default: true },
        threshold: { type: Number, default: 90, min: 50, max: 100 } // percentage
      }
    },

    // Default work hour limits
    workHours: {
      defaultWeeklyLimit: { type: Number, default: 80, min: 1, max: 168 },
      defaultDailyLimit: { type: Number, default: 24, min: 1, max: 24 },
      enforceByDefault: { type: Boolean, default: true }
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Ensure singleton collection (one document). Consumers should use findOne() and create if missing.
module.exports = mongoose.model('Settings', SettingsSchema);
