# New Features Implementation Guide

This document describes the newly implemented features for the Time Tracking Application.

## 📅 Timesheet Trigger System

### Overview
Administrators can now control when employees can submit timesheets by defining timesheet periods with specific date ranges.

### Features
- **Admin Control**: Create, update, and delete timesheet periods
- **Date Range Management**: Define start and end dates for each period
- **User Access Control**: Restrict periods to specific employees or allow all employees
- **Flexible Scheduling**: Support for one-time, weekly, biweekly, and monthly recurring periods
- **Period Status**: Track periods as upcoming, active, or closed

### API Endpoints
- `GET /api/timesheet-periods` - Get all periods
- `POST /api/timesheet-periods` - Create new period (Admin)
- `PUT /api/timesheet-periods/:id` - Update period (Admin)
- `DELETE /api/timesheet-periods/:id` - Delete period (Admin)
- `GET /api/timesheet-periods/active/my-periods` - Get user's active periods
- `POST /api/timesheet-periods/validate-date` - Validate if date is within allowed period

### Frontend Views
- **Admin**: `/admin/timesheet-periods` - Manage timesheet periods
- **Employee**: Validation happens automatically when creating timesheets

### Database Model
```javascript
{
  name: String,
  startDate: Date,
  endDate: Date,
  status: ['upcoming', 'active', 'closed'],
  isActive: Boolean,
  recurringType: ['none', 'weekly', 'biweekly', 'monthly'],
  allowAllUsers: Boolean,
  restrictedUsers: [ObjectId]
}
```

---

## 📢 Notification System

### Overview
Comprehensive notification system supporting both email and in-app notifications with user preferences.

### Features
- **Email Notifications**: Sent via SMTP (configurable in .env)
- **In-App Notifications**: Real-time notifications in the application
- **User Preferences**: Users can control which notifications they receive
- **Notification Types**:
  - Timesheet reminders
  - Timesheet approval/rejection
  - Period opened
  - Hour limit warnings
  - System notifications

### API Endpoints
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/clear-read` - Clear all read notifications

### Frontend Components
- **NotificationDropdown**: Bell icon with unread count badge
- Polls for new notifications every 30 seconds
- Click notification to navigate to related content

### Configuration
Add to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
APP_NAME=Time Tracking App
APP_URL=http://localhost:5173
```

### Database Model
```javascript
{
  recipient: ObjectId,
  type: String,
  title: String,
  message: String,
  isRead: Boolean,
  emailSent: Boolean,
  priority: ['low', 'medium', 'high'],
  actionUrl: String,
  relatedTimesheet: ObjectId,
  relatedPeriod: ObjectId
}
```

---

## ⏱️ Work Hour Limit Management

### Overview
Set and manage weekly and daily hour limits for employees with real-time tracking and validation.

### Features
- **Default Limits**: 80-hour weekly limit, 24-hour daily limit
- **Custom Limits**: Admin can set individual limits per employee
- **Bulk Updates**: Update multiple employees at once
- **Real-time Tracking**: Display current week hours with progress bar
- **Warning Threshold**: Configurable warning at X% of limit (default 90%)
- **Enforcement**: Optional strict enforcement to prevent exceeding limits

### API Endpoints
- `GET /api/work-hour-limits` - Get all limits (Admin)
- `GET /api/work-hour-limits/my-limit` - Get current user's limit
- `POST /api/work-hour-limits` - Create/update limit (Admin)
- `POST /api/work-hour-limits/bulk-update` - Bulk update limits (Admin)
- `GET /api/work-hour-limits/check-hours/:employeeId` - Check current week hours
- `POST /api/work-hour-limits/validate` - Validate timesheet hours

### Frontend Views
- **Admin**: `/admin/work-hour-limits` - Manage employee limits
- **Employee**: Weekly hours display on timesheets page

### Database Model
```javascript
{
  employee: ObjectId,
  weeklyLimit: Number (default: 80),
  dailyLimit: Number (default: 24),
  warningThreshold: Number (default: 90),
  enforceLimit: Boolean (default: true),
  isCustom: Boolean,
  notes: String
}
```

---

## ✅ Timesheet Validation & Limits

### Overview
Real-time validation during timesheet entry with error prevention and admin bypass capabilities.

### Features
- **Period Validation**: Ensure date is within an active timesheet period
- **Daily Limit Check**: Prevent exceeding daily hour limit
- **Weekly Limit Check**: Prevent exceeding weekly hour limit
- **Real-time Feedback**: Show current hours and projected total
- **Warning Messages**: Alert when approaching limits
- **Admin Bypass**: Admins can bypass limits when necessary

### Validation Flow
1. User enters timesheet date and hours
2. System checks if date is within active period
3. System validates against daily limit
4. System calculates current week hours
5. System validates against weekly limit
6. If near threshold, send warning notification
7. If over limit and enforcement enabled, reject entry

### Error Messages
- "The selected date is not within any allowed timesheet period"
- "Hours exceed daily limit of X hours"
- "Adding X hours would exceed weekly limit of Y hours (current: Z hours)"

### Admin Bypass
Admins can bypass limits by including `bypassLimits: true` in the request body.

---

## 🔧 Settings Configuration

### Overview
New settings added to control notification scheduling and default work hour limits.

### Settings Structure
```javascript
{
  notifications: {
    timesheetReminder: {
      enabled: Boolean,
      dayOfWeek: Number (0-6, 0=Sunday),
      time: String (HH:mm format),
      daysBeforeDeadline: Number
    },
    hourLimitWarning: {
      enabled: Boolean,
      threshold: Number (percentage)
    }
  },
  workHours: {
    defaultWeeklyLimit: Number,
    defaultDailyLimit: Number,
    enforceByDefault: Boolean
  }
}
```

### API Endpoints
Use existing settings endpoints:
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings (Admin)

---

## 🚀 Getting Started

### Backend Setup

1. **Install Dependencies** (already done if using existing project)
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   Add to `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   APP_NAME=Time Tracking App
   APP_URL=http://localhost:5173
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies** (already done if using existing project)
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 📊 User Workflows

### Admin Workflow

1. **Setup Timesheet Periods**
   - Navigate to Admin > Timesheet Periods
   - Create periods for employees to submit timesheets
   - Set date ranges and access controls

2. **Configure Work Hour Limits**
   - Navigate to Admin > Work Hour Limits
   - Set individual or bulk limits for employees
   - Configure warning thresholds

3. **Manage Notifications**
   - Update notification settings in Settings
   - Send manual reminders from period management
   - Monitor notification delivery

### Employee Workflow

1. **View Active Periods**
   - Periods are validated automatically when creating timesheets
   - Only dates within active periods are allowed

2. **Track Weekly Hours**
   - View current week hours on timesheets page
   - See progress bar and percentage used
   - Receive warnings when approaching limit

3. **Receive Notifications**
   - Click bell icon to view notifications
   - Get reminders for timesheet submission
   - Receive approval/rejection notifications

---

## 🔐 Security & Permissions

### Role-Based Access
- **Admin**: Full access to all features
- **Employee**: Limited to own data and viewing capabilities

### Validation
- All inputs validated on both frontend and backend
- MongoDB sanitization to prevent injection
- Rate limiting on API endpoints

---

## 🧪 Testing

### Manual Testing Checklist

**Timesheet Periods:**
- [ ] Create period with date range
- [ ] Update period status
- [ ] Restrict period to specific employees
- [ ] Send reminders for active period
- [ ] Validate timesheet date against periods

**Notifications:**
- [ ] Receive in-app notification
- [ ] Receive email notification (if SMTP configured)
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Update notification preferences

**Work Hour Limits:**
- [ ] Set custom limit for employee
- [ ] Bulk update limits
- [ ] Create timesheet within limits
- [ ] Attempt to exceed daily limit
- [ ] Attempt to exceed weekly limit
- [ ] Receive warning at threshold
- [ ] Admin bypass limits

---

## 📝 Notes

- Email notifications require SMTP configuration
- Notification polling interval: 30 seconds
- Week starts on Sunday (day 0)
- Default Saturday (day 6) for reminder notifications
- All dates stored in UTC in database

---

## 🐛 Troubleshooting

### Email Notifications Not Sending
- Check SMTP credentials in .env
- Verify SMTP_HOST and SMTP_PORT
- For Gmail, use App Password, not regular password

### Validation Not Working
- Ensure timesheet periods are created and active
- Check period date ranges include desired dates
- Verify user has access to the period

### Weekly Hours Not Updating
- Refresh page after submitting timesheet
- Check that timesheet status is not 'draft' only
- Verify work hour limit exists for employee

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
