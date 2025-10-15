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

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Ensure singleton collection (one document). Consumers should use findOne() and create if missing.
module.exports = mongoose.model('Settings', SettingsSchema);
