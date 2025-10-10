# MongoDB Setup Guide for Windows

## Quick Start

### Option 1: Start MongoDB as a Service (Recommended)

If MongoDB is installed as a Windows service:

```powershell
# Start MongoDB service
net start MongoDB

# Check if MongoDB is running
Get-Service MongoDB

# Stop MongoDB service (when needed)
net stop MongoDB
```

### Option 2: Start MongoDB Manually

If MongoDB is not installed as a service:

```powershell
# Navigate to MongoDB bin directory (adjust path if needed)
cd "C:\Program Files\MongoDB\Server\6.0\bin"

# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

**Note:** Make sure the data directory exists. Create it if needed:
```powershell
mkdir C:\data\db
```

## Installation

### If MongoDB is Not Installed

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and run the installer

2. **Installation Options:**
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation:**
   ```powershell
   mongod --version
   ```

## Verify MongoDB is Running

### Method 1: Check Service Status
```powershell
Get-Service MongoDB
```

Should show: `Status: Running`

### Method 2: Try Connecting
```powershell
# Using mongosh (MongoDB Shell)
mongosh

# Or using mongo (older versions)
mongo
```

If connected successfully, you'll see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/
Using MongoDB: 6.0.x
```

### Method 3: Check Port
```powershell
netstat -ano | findstr :27017
```

Should show MongoDB listening on port 27017.

## Common Issues

### Issue 1: "MongoDB service not found"

**Solution:** MongoDB is not installed as a service. Use manual start method or reinstall MongoDB with service option.

### Issue 2: "Data directory not found"

**Solution:**
```powershell
# Create data directory
mkdir C:\data\db

# Or specify custom path when starting
mongod --dbpath "C:\your\custom\path"
```

### Issue 3: "Port 27017 already in use"

**Solution:**
```powershell
# Find process using port 27017
netstat -ano | findstr :27017

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 4: "Access denied" when starting service

**Solution:** Run PowerShell or Command Prompt as Administrator:
- Right-click PowerShell
- Select "Run as Administrator"
- Try starting service again

## Configuration

### Default MongoDB Configuration

- **Host:** localhost (127.0.0.1)
- **Port:** 27017
- **Database:** time-tracking (will be created automatically)

### Connection String

The application uses this connection string (from `.env`):
```
MONGODB_URI=mongodb://localhost:27017/time-tracking
```

## MongoDB Compass (GUI Tool)

If you installed MongoDB Compass:

1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"
4. You can view/manage databases visually

## Useful MongoDB Commands

### In MongoDB Shell (mongosh)

```javascript
// Show all databases
show dbs

// Switch to time-tracking database
use time-tracking

// Show collections
show collections

// Count documents in a collection
db.users.countDocuments()

// Find all users
db.users.find().pretty()

// Drop database (careful!)
db.dropDatabase()
```

## Application Setup After MongoDB is Running

Once MongoDB is running:

1. **Seed the database:**
   ```powershell
   cd backend
   npm run seed
   ```

2. **Start the backend:**
   ```powershell
   npm run dev
   ```

3. **Verify connection:**
   You should see: `MongoDB Connected: 127.0.0.1`

## Troubleshooting Backend Connection

### Error: "connect ECONNREFUSED"

This means MongoDB is not running. Solutions:

1. **Start MongoDB:**
   ```powershell
   net start MongoDB
   ```

2. **Check if MongoDB is running:**
   ```powershell
   Get-Service MongoDB
   ```

3. **Check MongoDB logs:**
   - Location: `C:\Program Files\MongoDB\Server\6.0\log\mongod.log`
   - Look for errors

4. **Verify connection string:**
   - Check `backend/.env`
   - Should be: `MONGODB_URI=mongodb://localhost:27017/time-tracking`

### Error: "Authentication failed"

If you set up authentication:

1. Update connection string in `.env`:
   ```
   MONGODB_URI=mongodb://username:password@localhost:27017/time-tracking
   ```

## MongoDB Service Management

### Set MongoDB to Start Automatically

```powershell
# Set service to automatic start
Set-Service -Name MongoDB -StartupType Automatic

# Verify
Get-Service MongoDB | Select-Object Name, Status, StartType
```

### Restart MongoDB Service

```powershell
# Restart service
Restart-Service MongoDB

# Or
net stop MongoDB
net start MongoDB
```

## Alternative: MongoDB Atlas (Cloud)

If you prefer not to run MongoDB locally:

1. **Sign up for MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
2. **Create a free cluster**
3. **Get connection string**
4. **Update backend/.env:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/time-tracking
   ```

## Quick Reference

| Task | Command |
|------|---------|
| Start MongoDB | `net start MongoDB` |
| Stop MongoDB | `net stop MongoDB` |
| Check Status | `Get-Service MongoDB` |
| Connect Shell | `mongosh` |
| Check Port | `netstat -ano \| findstr :27017` |
| View Logs | Check `C:\Program Files\MongoDB\Server\6.0\log\` |

## Next Steps

After MongoDB is running:

1. ✅ Verify MongoDB is running
2. ✅ Seed the database: `cd backend && npm run seed`
3. ✅ Start backend: `npm run dev`
4. ✅ Start frontend: `cd frontend && npm run dev`
5. ✅ Access app: http://localhost:5173

---

**Need Help?** Check the main TROUBLESHOOTING.md file for more solutions.
