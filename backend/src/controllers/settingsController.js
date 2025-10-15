const Settings = require('../models/Settings');

// Public: get logo and basic info without auth
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({});
    return res.status(200).json({
      success: true,
      data: {
        companyName: settings?.companyName || '',
        logo: settings?.logo || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

// Admin: get full settings
exports.getSettings = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const settings = await Settings.findOne({});
    return res.status(200).json({ success: true, data: settings || {} });
  } catch (err) {
    next(err);
  }
};

// Admin: update settings (upsert singleton)
exports.updateSettings = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const payload = {};

    // Map fields explicitly to avoid arbitrary writes
    if (typeof req.body.companyName === 'string') payload.companyName = req.body.companyName;
    if (typeof req.body.email === 'string') payload.email = req.body.email;
    if (typeof req.body.phone === 'string') payload.phone = req.body.phone;
    if (typeof req.body.website === 'string') payload.website = req.body.website;
    if (typeof req.body.address === 'string') payload.address = req.body.address;
    if (typeof req.body.logo === 'string') payload.logo = req.body.logo; // data URL

    if (req.body.system && typeof req.body.system === 'object') {
      payload.system = {};
      if (typeof req.body.system.defaultCurrency === 'string') payload.system.defaultCurrency = req.body.system.defaultCurrency;
      if (typeof req.body.system.dateFormat === 'string') payload.system.dateFormat = req.body.system.dateFormat;
      if (typeof req.body.system.autoApprove === 'boolean') payload.system.autoApprove = req.body.system.autoApprove;
    }

    payload.updatedBy = req.user._id;

    const updated = await Settings.findOneAndUpdate(
      {},
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
