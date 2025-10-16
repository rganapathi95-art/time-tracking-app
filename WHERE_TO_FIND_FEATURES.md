# Where to Find the New Features

## 🎯 Quick Access Guide

### For Admin Users

After logging in as an admin, you'll see these new menu items in the **left sidebar**:

1. **📅 Timesheet Periods**
   - **Location**: Admin Menu → Timesheet Periods
   - **URL**: `/admin/timesheet-periods`
   - **What you can do**:
     - Create new timesheet periods with date ranges
     - Set periods as upcoming, active, or closed
     - Restrict periods to specific employees
     - Send reminders to employees
     - Set up recurring periods (weekly, biweekly, monthly)

2. **⏱️ Work Hour Limits**
   - **Location**: Admin Menu → Work Hour Limits
   - **URL**: `/admin/work-hour-limits`
   - **What you can do**:
     - View all employee hour limits
     - Set custom weekly/daily limits per employee
     - Bulk update limits for multiple employees
     - Configure warning thresholds
     - Enable/disable strict enforcement
     - Reset custom limits to defaults

3. **🔔 Notifications**
   - **Location**: Bell icon in the top-right header
   - **What you can do**:
     - View all your notifications
     - See unread count badge
     - Mark notifications as read
     - Delete individual notifications
     - Clear all read notifications

---

### For Employee Users

After logging in as an employee, you'll see:

1. **📊 Weekly Hours Tracking**
   - **Location**: Employee Menu → My Timesheets (at the top of the page)
   - **What you see**:
     - Current week hours vs. your limit
     - Progress bar with color coding:
       - 🟢 Green = Within limit
       - 🟡 Yellow = Near limit (90%+)
       - 🔴 Red = Over limit
     - Percentage used
     - Status badge

2. **🔔 Notifications**
   - **Location**: Bell icon in the top-right header
   - **What you receive**:
     - Timesheet approval/rejection notifications
     - Period opened notifications
     - Hour limit warnings
     - Timesheet reminders

3. **✅ Automatic Validation**
   - **Location**: Happens automatically when creating/editing timesheets
   - **What it checks**:
     - Date must be within an active timesheet period
     - Hours must not exceed daily limit
     - Hours must not exceed weekly limit
     - Shows clear error messages if validation fails

---

## 📱 Visual Guide

### Admin Sidebar Menu
```
┌─────────────────────────┐
│ ADMIN                   │
├─────────────────────────┤
│ 📊 Dashboard            │
│ 👥 Users                │
│ 📁 Projects             │
│ 🏢 Cost Centers         │
│ 📋 Timesheets           │
│ 📅 Timesheet Periods    │ ← NEW!
│ ⏱️  Work Hour Limits     │ ← NEW!
│ 📈 Analytics            │
│ 📄 Reports              │
│ ⚙️  Settings             │
└─────────────────────────┘
```

### Top Header (All Users)
```
┌──────────────────────────────────────────────┐
│ ☰ Menu          [Your App]          🔔 (3)  │ ← Notification Bell
└──────────────────────────────────────────────┘
```

### Employee Timesheet Page
```
┌─────────────────────────────────────────────┐
│ My Timesheets                    [+ Add]    │
├─────────────────────────────────────────────┤
│ Weekly Hours                                │
│ 35h / 80h                          43% used │
│ ████████░░░░░░░░░░░░  [Within Limit]       │ ← NEW!
├─────────────────────────────────────────────┤
│ [Filters]                                   │
│ [Timesheet List]                            │
└─────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Step 1: Start the Application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Login

- Open browser to `http://localhost:5173`
- Login with your credentials

### Step 3: Access Features

**As Admin:**
1. Look at the left sidebar
2. Click on **"Timesheet Periods"** or **"Work Hour Limits"**
3. Click the bell icon 🔔 in the top-right to see notifications

**As Employee:**
1. Click **"My Timesheets"** in the sidebar
2. See your weekly hours at the top
3. Click the bell icon 🔔 to see notifications
4. Try creating a timesheet - validation happens automatically

---

## 🎨 UI Elements

### Notification Bell
- **Location**: Top-right corner of every page
- **Badge**: Shows unread count (e.g., 🔔 3)
- **Dropdown**: Click to see recent notifications
- **Auto-refresh**: Checks for new notifications every 30 seconds

### Weekly Hours Display
- **Progress Bar Colors**:
  - Green: 0-89% of limit
  - Yellow: 90-100% of limit
  - Red: Over 100% of limit
- **Updates**: Automatically after creating/editing timesheets

### Status Badges
- **Upcoming**: Yellow badge
- **Active**: Green badge
- **Closed**: Gray badge
- **Custom Limit**: Blue badge
- **Default Limit**: Gray badge

---

## 🔍 Troubleshooting

### "I don't see the new menu items"
- Make sure you're logged in as an **admin**
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache and reload

### "I don't see the notification bell"
- Check the top-right corner of the page
- Make sure you're logged in
- Refresh the page

### "Weekly hours not showing"
- Make sure you're on the **My Timesheets** page
- You need to have at least one timesheet for the current week
- Refresh the page

### "Can't create timesheet"
- Check if there's an active timesheet period for that date
- Ask your admin to create a period if none exists
- Check if you're within your hour limits

---

## 📞 Need Help?

If features are still not visible:

1. **Check browser console** (F12) for errors
2. **Verify backend is running** on port 5000
3. **Verify frontend is running** on port 5173
4. **Check that routes were added** to router/index.js
5. **Ensure you're using the latest code** (restart both servers)

---

## ✅ Quick Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Logged in as admin or employee
- [ ] Can see sidebar menu
- [ ] Can see notification bell in header
- [ ] (Admin) Can see "Timesheet Periods" in menu
- [ ] (Admin) Can see "Work Hour Limits" in menu
- [ ] (Employee) Can see weekly hours on timesheets page
- [ ] Can click bell icon and see notifications dropdown

---

## 🎉 You're All Set!

All features are now accessible through the UI. Enjoy using your enhanced time tracking application!
