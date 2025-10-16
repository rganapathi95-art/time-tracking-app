# 🚀 Quick Start - Local Network Access

## Your Network Information

**Your Computer's IP Address:** `10.102.14.63`

**Access URLs:**
- **From your computer:** `http://localhost:5173`
- **From other devices on same network:** `http://10.102.14.63:5173`

---

## 🎯 Start the Application

### Option 1: Manual Start (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Quick Commands

**Backend:**
```bash
cd c:\Users\rrajay\CascadeProjects\time-tracking-app\backend && npm run dev
```

**Frontend:**
```bash
cd c:\Users\rrajay\CascadeProjects\time-tracking-app\frontend && npm run dev
```

---

## 📱 Share with Your Team

Send this URL to anyone on the same WiFi/network:

```
http://10.102.14.63:5173
```

They can:
1. Open this URL in their browser (phone, tablet, laptop)
2. Login with their credentials
3. Use the app normally

---

## 🔥 Firewall Setup (If Needed)

If others can't connect, run these commands in **PowerShell as Administrator**:

```powershell
# Allow frontend port
New-NetFirewallRule -DisplayName "Time Tracking Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

# Allow backend port
New-NetFirewallRule -DisplayName "Time Tracking Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

## ✅ Verify It's Working

### From Your Computer
Open browser: `http://localhost:5173`

### From Another Device
1. Connect to the same WiFi network
2. Open browser: `http://10.102.14.63:5173`
3. You should see the login page

---

## 📋 Quick Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Firewall allows ports 5000 and 5173
- [ ] Other devices connected to same network
- [ ] Access URL: `http://10.102.14.63:5173`

---

## 🆘 Troubleshooting

**Can't access from other devices?**
1. Check both servers are running
2. Run firewall commands above
3. Verify other device is on same WiFi
4. Try restarting both servers

**IP Address Changed?**
Run this command to find your new IP:
```bash
ipconfig | findstr /i "IPv4"
```

---

## 🎉 You're Ready!

Your app is now accessible on your local network at:

**`http://10.102.14.63:5173`**

Share this URL with your team and start tracking time together!
