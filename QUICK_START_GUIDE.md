# Quick Start Guide - Time Tracking Application

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

## Installation Steps

### Option 1: Automated Setup (Windows)

1. **Run the setup script:**
   ```powershell
   .\setup.ps1
   ```

2. **Seed the database:**
   ```powershell
   cd backend
   npm run seed
   ```

3. **Start the application:**
   ```powershell
   cd ..
   .\start.ps1
   ```

### Option 2: Manual Setup

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

3. **Configure Environment Variables:**
   
   Backend (`.env` in `/backend`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/time-tracking
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```
   
   Frontend (`.env` in `/frontend`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB:**
   ```bash
   # Windows (if MongoDB is installed as a service)
   net start MongoDB
   
   # Or run manually
   mongod
   ```

5. **Seed the Database:**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start Frontend Server (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

### Option 3: Docker Setup

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **Seed the database (in a new terminal):**
   ```bash
   docker-compose exec backend npm run seed
   ```

## Accessing the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## Default Login Credentials

### Admin Account
- **Email:** admin@timetrack.com
- **Password:** Admin@123

### Employee Accounts
- **Email:** john.doe@timetrack.com
- **Password:** Employee@123

- **Email:** jane.smith@timetrack.com
- **Password:** Employee@123

## Features Overview

### Admin Features
✅ **Dashboard** - View system statistics and quick actions
✅ **Employee Management** - Add, edit, delete employees
✅ **Project Management** - Create and manage projects
✅ **Cost Center Management** - Manage cost centers and budgets
✅ **Timesheet Approval** - Review and approve employee timesheets
✅ **Analytics & Reports** - View detailed analytics and reports

### Employee Features
✅ **My Projects** - View assigned projects
✅ **My Timesheets** - Submit and manage timesheets
✅ **Time Logging** - Log hours worked on projects

## Project Structure

```
time-tracking-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities and seed data
│   │   └── server.js       # Express server
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/         # CSS and static assets
│   │   ├── components/     # Vue components
│   │   ├── router/         # Vue Router configuration
│   │   ├── services/       # API service layer
│   │   ├── stores/         # Pinia state management
│   │   ├── views/          # Page components
│   │   ├── App.vue         # Root component
│   │   └── main.js         # Application entry point
│   └── package.json
├── docker-compose.yml      # Docker configuration
└── README.md              # Main documentation
```

## Common Commands

### Backend
```bash
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run tests
npm run seed     # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm test         # Run tests
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoint documentation.

## Testing

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

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env` file
- Verify MongoDB is listening on port 27017

### Port Already in Use
- Backend (5000): Change `PORT` in backend `.env`
- Frontend (5173): Change port in `vite.config.js`

### CORS Issues
- Ensure backend CORS is configured correctly
- Check `VITE_API_URL` in frontend `.env`

### Authentication Issues
- Clear browser localStorage
- Verify JWT_SECRET is set in backend `.env`
- Check token expiration settings

## Security Best Practices

1. **Change default credentials** immediately in production
2. **Update JWT_SECRET** to a strong, unique value
3. **Enable HTTPS** in production
4. **Configure CORS** properly for production domains
5. **Use environment variables** for all sensitive data
6. **Regular security updates** - keep dependencies updated

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a process manager (PM2, systemd)
3. Configure reverse proxy (Nginx, Apache)
4. Enable SSL/TLS certificates
5. Set up database backups

### Frontend
1. Build production bundle: `npm run build`
2. Serve static files with a web server
3. Configure proper caching headers
4. Enable gzip compression

## Support & Resources

- **GitHub Issues:** Report bugs and request features
- **API Documentation:** See API_DOCUMENTATION.md
- **Main README:** See README.md for detailed information

## License

MIT License - See LICENSE file for details

---

**Happy Time Tracking! 🚀**
