# Local Network Access Guide

## ✅ Configuration Complete

Your time-tracking app is now configured to be accessible from any device on your local network!

---

## 🚀 How to Start the Servers

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
The backend will now listen on `0.0.0.0:5000` (accessible from all network interfaces)

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
The frontend will now listen on `0.0.0.0:5173` (accessible from all network interfaces)

---

## 🌐 How to Access from Other Devices

### Step 1: Find Your Computer's IP Address

**On Windows (PowerShell or Command Prompt):**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet)
- Example: `192.168.1.100`

**On Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for your local IP (usually starts with 192.168.x.x or 10.x.x.x)

### Step 2: Access from Other Devices

Once you have your IP address (e.g., `192.168.1.100`), other devices on the same network can access:

**Frontend (Main App):**
```
http://192.168.1.100:5173
```

**Backend API (if needed):**
```
http://192.168.1.100:5000
```

---

## 📱 Accessing from Different Devices

### From Another Computer
1. Open any web browser
2. Go to `http://YOUR_IP:5173`
3. Login and use the app normally

### From Mobile Phone/Tablet
1. Make sure your phone is connected to the **same WiFi network**
2. Open browser (Chrome, Safari, etc.)
3. Go to `http://YOUR_IP:5173`
4. Login and use the app

### From Another Device on Same Network
- Any device connected to the same router/WiFi can access the app
- Just use `http://YOUR_IP:5173` in their browser

---

## 🔒 Security Notes

### Current Configuration (Development Mode)
- ✅ CORS allows local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- ✅ Only accessible on your local network (not from internet)
- ✅ Requires authentication (login) to use

### What This Means
- **Safe**: Only people connected to your WiFi/network can access
- **Not Public**: Not accessible from the internet
- **Secure**: Still requires username/password to login

---

## 🔥 Firewall Configuration (If Needed)

If other devices can't connect, you may need to allow the ports through your firewall:

### Windows Firewall
1. Open "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter ports: `5000, 5173`
6. Allow the connection
7. Apply to all profiles (Domain, Private, Public)
8. Name it "Time Tracking App"

### Quick PowerShell Command (Run as Administrator)
```powershell
# Allow frontend port
New-NetFirewallRule -DisplayName "Time Tracking Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

# Allow backend port
New-NetFirewallRule -DisplayName "Time Tracking Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

## 🧪 Testing the Connection

### From Your Computer
```bash
# Test frontend
curl http://localhost:5173

# Test backend
curl http://localhost:5000/api/auth/health
```

### From Another Device
Open browser and go to:
```
http://YOUR_IP:5173
```

You should see the login page!

---

## 📊 Example Scenario

**Your Setup:**
- Your computer IP: `192.168.1.100`
- Backend running on port `5000`
- Frontend running on port `5173`

**Access URLs:**
- **From your computer**: `http://localhost:5173`
- **From other devices**: `http://192.168.1.100:5173`

**Who Can Access:**
- ✅ Your phone (connected to same WiFi)
- ✅ Colleague's laptop (connected to same WiFi)
- ✅ Tablet (connected to same WiFi)
- ❌ Someone outside your network
- ❌ Someone on the internet

---

## 🛠️ Troubleshooting

### Problem: Can't access from other devices

**Solution 1: Check Firewall**
- Make sure ports 5000 and 5173 are allowed
- Run the PowerShell commands above

**Solution 2: Verify IP Address**
- Make sure you're using the correct IP
- Run `ipconfig` again to confirm

**Solution 3: Check Network**
- Ensure both devices are on the **same WiFi network**
- Some networks have "AP Isolation" that blocks device-to-device communication

**Solution 4: Restart Servers**
- Stop both backend and frontend
- Start them again
- Look for the network URLs in the console output

### Problem: CORS errors in browser console

**Solution:**
- The backend is configured to allow local network IPs in development mode
- If you still see errors, check that `NODE_ENV=development` in your `.env` file

### Problem: Connection refused

**Solution:**
- Make sure both servers are running
- Check that they're listening on `0.0.0.0` not just `localhost`
- Verify firewall isn't blocking the ports

---

## 📝 What Changed

### Backend (`server.js`)
- Now listens on `0.0.0.0` instead of `localhost`
- CORS allows local network IPs in development mode
- Accepts connections from 192.168.x.x, 10.x.x.x, and 172.16-31.x.x ranges

### Frontend (`vite.config.js`)
- Now listens on `0.0.0.0` instead of `localhost`
- Accessible from any device on the network

---

## 🎯 Quick Start Checklist

- [ ] Start backend server (`npm run dev` in backend folder)
- [ ] Start frontend server (`npm run dev` in frontend folder)
- [ ] Find your computer's IP address (`ipconfig`)
- [ ] Allow ports through firewall (if needed)
- [ ] Access from another device: `http://YOUR_IP:5173`
- [ ] Login and test functionality

---

## 🌟 Production Deployment

**Note:** This configuration is for **local network access only**.

For production deployment (accessible from internet):
- Use a proper hosting service (AWS, DigitalOcean, Heroku, etc.)
- Set up HTTPS with SSL certificates
- Configure proper CORS origins
- Use environment variables for production URLs
- Set up proper security measures

---

## 💡 Tips

1. **Bookmark the URL**: Save `http://YOUR_IP:5173` on mobile devices for quick access
2. **Static IP**: Consider setting a static IP for your computer so the URL doesn't change
3. **Network Name**: Make sure everyone is on the same WiFi network
4. **Performance**: Local network access is fast and doesn't use internet bandwidth

---

## ✅ You're All Set!

Your app is now accessible to anyone on your local network. Share the URL with your team and start tracking time!

**Your Access URL:**
```
http://YOUR_IP_HERE:5173
```

Replace `YOUR_IP_HERE` with your actual IP address from `ipconfig`.
