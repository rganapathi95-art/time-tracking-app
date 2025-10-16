const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Create an in-app notification
 */
const createInAppNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipient: data.recipient,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedTimesheet: data.relatedTimesheet,
      relatedPeriod: data.relatedPeriod,
      priority: data.priority || 'medium',
      actionUrl: data.actionUrl,
      metadata: data.metadata || {}
    });
    return notification;
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    throw error;
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (notification, user) => {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured, skipping email notification');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Time Tracking App'}" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: notification.title,
      html: generateEmailTemplate(notification, user)
    };

    await transporter.sendMail(mailOptions);
    
    // Update notification status
    notification.emailSent = true;
    notification.emailSentAt = new Date();
    await notification.save();
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    notification.emailError = error.message;
    await notification.save();
    return false;
  }
};

/**
 * Generate email template
 */
const generateEmailTemplate = (notification, user) => {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const actionLink = notification.actionUrl ? `${appUrl}${notification.actionUrl}` : appUrl;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.APP_NAME || 'Time Tracking App'}</h1>
        </div>
        <div class="content">
          <h2>${notification.title}</h2>
          <p>Hi ${user.firstName},</p>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<a href="${actionLink}" class="button">View Details</a>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send notification to user (both in-app and email based on preferences)
 */
const sendNotification = async (data) => {
  try {
    const user = await User.findById(data.recipient);
    if (!user) {
      throw new Error('User not found');
    }

    // Determine notification type key for preferences
    const typeKey = getPreferenceKey(data.type);
    
    // Create in-app notification if user has it enabled
    let notification = null;
    if (user.notificationPreferences?.inApp?.[typeKey] !== false) {
      notification = await createInAppNotification(data);
    }

    // Send email if user has it enabled
    if (user.notificationPreferences?.email?.[typeKey] !== false) {
      if (!notification) {
        notification = await createInAppNotification(data);
      }
      await sendEmailNotification(notification, user);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Map notification type to preference key
 */
const getPreferenceKey = (type) => {
  const mapping = {
    'timesheet_reminder': 'timesheetReminders',
    'timesheet_approved': 'timesheetApproval',
    'timesheet_rejected': 'timesheetApproval',
    'period_opened': 'periodOpened',
    'hour_limit_warning': 'hourLimitWarning',
    'system': 'timesheetReminders' // Default to reminders for system messages
  };
  return mapping[type] || 'timesheetReminders';
};

/**
 * Send bulk notifications to multiple users
 */
const sendBulkNotifications = async (recipients, data) => {
  const results = [];
  for (const recipientId of recipients) {
    try {
      const notification = await sendNotification({
        ...data,
        recipient: recipientId
      });
      results.push({ success: true, recipientId, notification });
    } catch (error) {
      results.push({ success: false, recipientId, error: error.message });
    }
  }
  return results;
};

/**
 * Send timesheet reminder notifications
 */
const sendTimesheetReminders = async (periodId, userIds) => {
  const TimesheetPeriod = require('../models/TimesheetPeriod');
  const period = await TimesheetPeriod.findById(periodId);
  
  if (!period) {
    throw new Error('Timesheet period not found');
  }

  const data = {
    type: 'timesheet_reminder',
    title: 'Timesheet Submission Reminder',
    message: `Please submit your timesheet for the period: ${period.name} (${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()})`,
    relatedPeriod: periodId,
    priority: 'high',
    actionUrl: '/employee/timesheets'
  };

  return await sendBulkNotifications(userIds, data);
};

/**
 * Send hour limit warning notification
 */
const sendHourLimitWarning = async (userId, currentHours, limit, weekStart, weekEnd) => {
  const percentage = Math.round((currentHours / limit) * 100);
  
  return await sendNotification({
    recipient: userId,
    type: 'hour_limit_warning',
    title: 'Weekly Hour Limit Warning',
    message: `You have logged ${currentHours} hours out of your ${limit} hour weekly limit (${percentage}%). Week: ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
    priority: 'high',
    actionUrl: '/employee/timesheets',
    metadata: {
      currentHours,
      limit,
      percentage,
      weekStart,
      weekEnd
    }
  });
};

/**
 * Send period opened notification
 */
const sendPeriodOpenedNotification = async (period, userIds) => {
  const data = {
    type: 'period_opened',
    title: 'New Timesheet Period Available',
    message: `A new timesheet period is now open: ${period.name} (${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()})`,
    relatedPeriod: period._id,
    priority: 'medium',
    actionUrl: '/employee/timesheets'
  };

  return await sendBulkNotifications(userIds, data);
};

/**
 * Send timesheet approval/rejection notification
 */
const sendTimesheetStatusNotification = async (timesheet, status, rejectionReason = null) => {
  const isApproved = status === 'approved';
  
  return await sendNotification({
    recipient: timesheet.employee,
    type: isApproved ? 'timesheet_approved' : 'timesheet_rejected',
    title: `Timesheet ${isApproved ? 'Approved' : 'Rejected'}`,
    message: isApproved 
      ? `Your timesheet for ${timesheet.date.toLocaleDateString()} has been approved.`
      : `Your timesheet for ${timesheet.date.toLocaleDateString()} has been rejected. Reason: ${rejectionReason || 'No reason provided'}`,
    relatedTimesheet: timesheet._id,
    priority: 'medium',
    actionUrl: '/employee/timesheets'
  });
};

module.exports = {
  createInAppNotification,
  sendEmailNotification,
  sendNotification,
  sendBulkNotifications,
  sendTimesheetReminders,
  sendHourLimitWarning,
  sendPeriodOpenedNotification,
  sendTimesheetStatusNotification
};
