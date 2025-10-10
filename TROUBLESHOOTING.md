# Troubleshooting Guide

## Common Issues and Solutions

### 1. MongoDB Connection Issues

#### Problem: "MongoServerError: connect ECONNREFUSED"
**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (Windows)
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

#### Problem: "Authentication failed"
**Solution:**
- Check `MONGODB_URI` in backend `.env`
- Ensure MongoDB is running on the correct port (default: 27017)
- Verify database name in connection string

---

### 2. Port Already in Use

#### Problem: "Port 5000 is already in use"
**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

#### Problem: "Port 5173 is already in use"
**Solution:**
```bash
# Change port in frontend/vite.config.js
server: {
  port: 5174
}
```

---

### 3. Authentication Issues

#### Problem: "Invalid token" or "Token expired"
**Solution:**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Login again
3. Check JWT_SECRET is set in backend `.env`
4. Verify JWT_EXPIRE setting

#### Problem: "Not authorized to access this route"
**Solution:**
- Ensure you're logged in
- Check user role (admin vs employee)
- Verify token is being sent in Authorization header
- Check token expiration

---

### 4. CORS Issues

#### Problem: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:**
1. Check backend CORS configuration in `server.js`
2. Verify `VITE_API_URL` in frontend `.env`
3. Ensure backend is running before frontend

---

### 5. Database Seeding Issues

#### Problem: "Duplicate key error"
**Solution:**
```bash
# Clear database and reseed
# In MongoDB shell or Compass
use time-tracking
db.dropDatabase()

# Then run seed again
cd backend
npm run seed
```

#### Problem: "Validation failed"
**Solution:**
- Check password requirements (min 8 chars, uppercase, lowercase, number, special char)
- Verify email format
- Check required fields in seed data

---

### 6. Frontend Build Issues

#### Problem: "Module not found" errors
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Problem: "Vite build fails"
**Solution:**
1. Check Node.js version (should be v18+)
2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```
3. Rebuild:
   ```bash
   npm run build
   ```

---

### 7. Backend API Issues

#### Problem: "Cannot POST /api/auth/login"
**Solution:**
- Verify backend server is running
- Check API URL in frontend `.env`
- Ensure route is correctly defined in backend

#### Problem: "500 Internal Server Error"
**Solution:**
1. Check backend console for error details
2. Verify MongoDB connection
3. Check model validations
4. Review error logs

---

### 8. Styling Issues

#### Problem: "Tailwind classes not working"
**Solution:**
1. Check `tailwind.config.js` content paths
2. Verify `@tailwind` directives in `main.css`
3. Restart dev server:
   ```bash
   npm run dev
   ```

#### Problem: "Icons not displaying"
**Solution:**
- Verify `lucide-vue-next` is installed
- Check import statements
- Clear browser cache

---

### 9. State Management Issues

#### Problem: "User state not persisting"
**Solution:**
- Check localStorage in browser DevTools
- Verify authStore is properly configured
- Ensure token is being saved on login

#### Problem: "State not updating"
**Solution:**
- Check Pinia store actions
- Verify reactive references
- Check Vue DevTools for state changes

---

### 10. Docker Issues

#### Problem: "Cannot connect to MongoDB in Docker"
**Solution:**
```yaml
# In docker-compose.yml, use service name
MONGODB_URI=mongodb://mongodb:27017/time-tracking
```

#### Problem: "Container keeps restarting"
**Solution:**
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up --build
```

---

### 11. Performance Issues

#### Problem: "Slow API responses"
**Solution:**
1. Add database indexes (already included)
2. Implement pagination for large datasets
3. Optimize MongoDB queries
4. Enable caching

#### Problem: "Frontend slow to load"
**Solution:**
1. Check network tab in DevTools
2. Optimize bundle size
3. Implement lazy loading (already done)
4. Enable production build optimizations

---

### 12. Testing Issues

#### Problem: "Tests failing"
**Solution:**
```bash
# Backend tests
cd backend
npm test -- --verbose

# Frontend tests
cd frontend
npm test -- --run
```

#### Problem: "Cannot find module in tests"
**Solution:**
- Check test file imports
- Verify jest/vitest configuration
- Ensure test dependencies are installed

---

## Environment-Specific Issues

### Development Environment

#### Problem: "Hot reload not working"
**Solution:**
1. Check file watcher limits (Linux/Mac)
2. Restart dev server
3. Clear cache and restart

### Production Environment

#### Problem: "Build fails in production"
**Solution:**
1. Set `NODE_ENV=production`
2. Check environment variables
3. Verify all dependencies are installed
4. Review build logs

---

## Debugging Tips

### Backend Debugging
```javascript
// Add console.logs in controllers
console.log('Request body:', req.body);
console.log('User:', req.user);

// Use debugger
debugger;

// Check MongoDB queries
Model.find().explain('executionStats');
```

### Frontend Debugging
```javascript
// Vue DevTools - Install browser extension
// Console logging
console.log('Store state:', authStore.$state);

// Check API calls
// Network tab in browser DevTools
```

### Database Debugging
```bash
# MongoDB shell
mongosh
use time-tracking
db.users.find().pretty()
db.timesheets.countDocuments()

# Check indexes
db.users.getIndexes()
```

---

## Getting Help

### Check Logs
1. **Backend logs:** Check terminal running backend
2. **Frontend logs:** Check browser console (F12)
3. **MongoDB logs:** Check MongoDB log files
4. **Docker logs:** `docker-compose logs`

### Verify Configuration
1. Check all `.env` files
2. Verify ports are correct
3. Check MongoDB connection string
4. Verify API URLs

### Common Commands
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version

# Check running processes
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

---

## Still Having Issues?

1. **Review Documentation:**
   - README.md
   - API_DOCUMENTATION.md
   - QUICK_START_GUIDE.md

2. **Check Error Messages:**
   - Read error messages carefully
   - Search for specific error codes
   - Check stack traces

3. **Verify Setup:**
   - Ensure all prerequisites are installed
   - Check all configuration files
   - Verify environment variables

4. **Clean Install:**
   ```bash
   # Backend
   cd backend
   rm -rf node_modules package-lock.json
   npm install

   # Frontend
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Reset Database:**
   ```bash
   # Drop database and reseed
   mongosh time-tracking --eval "db.dropDatabase()"
   cd backend
   npm run seed
   ```

---

## Contact & Support

If you're still experiencing issues:
- Check GitHub Issues
- Review API documentation
- Verify all steps in Quick Start Guide
- Ensure all prerequisites are met

---

**Remember:** Most issues are related to:
1. MongoDB not running
2. Incorrect environment variables
3. Port conflicts
4. Missing dependencies
5. Authentication/token issues

Always check these first! 🔍
