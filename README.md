# Time Tracking Application

A full-stack time tracking web application built with Vue.js, Node.js, Express, and MongoDB.

## Features

### Admin Features
- User authentication (JWT-based)
- Manage employees (CRUD operations)
- Manage projects (CRUD operations)
- Manage cost centers (CRUD operations)
- View analytics and reports
- Charts for employee hours and project allocation

### Employee Features
- View assigned projects
- Submit timesheets
- Edit timesheets
- View personal timesheet history

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
```

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
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Users (Admin only)
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

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

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control (RBAC)
- Protected API endpoints
- XSS protection
- CORS configuration

## License

MIT
