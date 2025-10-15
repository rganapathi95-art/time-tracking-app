# Time Tracking Application

A full-stack time tracking web application built with Vue.js, Node.js, Express, and MongoDB.

## Features

### Admin Features
- User authentication (JWT-based)
- **User Management**
  - View all users with filtering and search
  - Add new users with role assignment
  - Edit user details
  - Delete users
  - **Block/Unblock users** (activate/deactivate accounts)
  - **Manage user OTP preferences** (enable/disable for any user)
- Manage projects (CRUD operations)
- Manage cost centers (CRUD operations)
- View analytics and reports
- Charts for employee hours and project allocation

### Employee Features
- View assigned projects
- Submit timesheets
- Edit timesheets
- View personal timesheet history
- **Profile & Settings**
  - View and edit personal profile
  - **Enable/Disable Email OTP Login** (optional two-factor authentication)
  - Change password securely

### Security Features
- **Optional Email OTP Login** - Two-factor authentication via email
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Account blocking/unblocking
- Secure password change with verification

## Tech Stack

### Frontend
- Vue.js 3 (Composition API)
- Vue Router
- Pinia (State Management)
- Tailwind CSS
- Chart.js for analytics
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Express Validator for input validation
- Nodemailer for email OTP delivery

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Environment Variables

### Backend (.env in /backend)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/time-tracking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development

# Email/SMTP Configuration (for OTP)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="Time Tracking App <noreply@timetrack.com>"

# OTP Configuration
OTP_EXPIRY_MINUTES=10

# Brute-force protection
LOGIN_MAX_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW_MINUTES=15
LOGIN_LOCKOUT_MINUTES=15
```

**Note for OTP Setup:**
- For testing, use [Ethereal Email](https://ethereal.email/) - a fake SMTP service
- For production, use a real email service (Gmail, SendGrid, AWS SES, Mailgun, etc.)
- For Gmail: Use an App Password, not your regular password

### Frontend (.env in /frontend)
```
VITE_API_URL=http://localhost:5000/api
```

## Installation & Setup

### 1. Clone the repository
```bash
cd C:\Users\rrajay\CascadeProjects\time-tracking-app
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Setup MongoDB
Make sure MongoDB is running on your local machine or update the MONGODB_URI in backend/.env

### 5. Start the Backend Server
```bash
cd backend
npm run dev
```

### 6. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Test Accounts

After running the seed script, you can use these accounts:

### Admin Account
- Email: admin@timetrack.com
- Password: Admin@123

### Employee Account
- Email: john.doe@timetrack.com
- Password: Employee@123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user (returns OTP requirement if enabled)
- **POST `/api/auth/verify-otp`** - Verify OTP code
- **POST `/api/auth/resend-otp`** - Resend OTP code
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout user

### Profile (All authenticated users)
- **GET `/api/profile`** - Get current user profile
- **PUT `/api/profile`** - Update profile details
- **PUT `/api/profile/preferences`** - Update OTP preference
- **PUT `/api/profile/change-password`** - Change password

### Users (Admin only)
- GET `/api/users` - Get all users (with filtering and search)
- GET `/api/users/:id` - Get user by ID
- **POST `/api/users`** - Create new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user
- **PUT `/api/users/:id/block`** - Block user account
- **PUT `/api/users/:id/unblock`** - Unblock user account
- **PUT `/api/users/:id/toggle-otp`** - Enable/disable OTP for user

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create project (Admin)
- PUT `/api/projects/:id` - Update project (Admin)
- DELETE `/api/projects/:id` - Delete project (Admin)

### Cost Centers
- GET `/api/cost-centers` - Get all cost centers
- POST `/api/cost-centers` - Create cost center (Admin)
- PUT `/api/cost-centers/:id` - Update cost center (Admin)
- DELETE `/api/cost-centers/:id` - Delete cost center (Admin)

### Timesheets
- GET `/api/timesheets` - Get timesheets (filtered by role)
- POST `/api/timesheets` - Create timesheet
- PUT `/api/timesheets/:id` - Update timesheet
- DELETE `/api/timesheets/:id` - Delete timesheet

### Analytics (Admin only)
- GET `/api/analytics/employee-hours` - Get employee hours summary
- GET `/api/analytics/project-allocation` - Get project allocation data
- GET `/api/analytics/cost-center-summary` - Get cost center summary

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Docker Setup (Optional)

```bash
docker-compose up
```

## Project Structure

```
time-tracking-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── tests/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── services/
│   │   └── App.vue
│   ├── .env
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Security Features

- **Email OTP Authentication** - Optional two-factor authentication via email
- **Account Management** - Block/unblock user accounts
- JWT-based authentication with secure token generation
- Password hashing with bcrypt (salt rounds: 10)
- Input validation and sanitization
- Role-based access control (RBAC)
- Protected API endpoints
- XSS protection
- CORS configuration
- Rate limiting:
  - Login attempts: 5 per 15 minutes
  - OTP requests: 10 per 15 minutes
  - General API: 100 requests per 10 minutes
- Brute-force protection with account lockout
- Secure password change with current password verification

## Testing OTP Login

1. **Setup Email Service** (for testing, use Ethereal Email):
   - Visit https://ethereal.email/
   - Click "Create Ethereal Account"
   - Copy credentials to `backend/.env`

2. **Enable OTP**:
   - Login to the app
   - Click "Profile" in the navbar
   - Toggle "Email OTP Login" switch to ON

3. **Test OTP Flow**:
   - Logout and login again
   - You'll receive an OTP code via email
   - Check console logs for preview URL (in development)
   - Enter the 6-digit code to complete login

## Additional Documentation

- **API_DOCUMENTATION.md** - Complete API reference
- **IMPLEMENTATION_SUMMARY.md** - Detailed implementation guide for new features
- **PROJECT_SUMMARY.md** - Project overview and architecture
- **QUICK_START_GUIDE.md** - Quick setup instructions
- **TROUBLESHOOTING.md** - Common issues and solutions

## License

MIT
