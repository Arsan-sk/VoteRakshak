# 🚨 BOOTH NOT ONLINE - QUICK ACTION PLAN

## The Problem (FIXED)
BOOTH_004 (ECS) shows "does not appear to be online" in officer dashboard, but the booth server IS running.

**Root Cause:** 
- Booth on network machine (e.g., 192.168.1.101) tries to connect to localhost:5000 ❌
- localhost on booth machine ≠ backend server IP
- Backend never registers booth → unlock returns 404

---

## Your Immediate Action Items

### 1️⃣ FIND YOUR SERVER IP (Right Now)

Open PowerShell on **SERVER MACHINE** and run:

```powershell
ipconfig | findstr "IPv4"
```

You'll see something like:
```
IPv4 Address. . . . . . . . . . : 192.168.1.100
```

**💾 SAVE THIS IP: ________________**  (e.g., 192.168.1.100)

---

### 2️⃣ UPDATE .ENV FILES (On Each Machine)

#### On BOOTH_004 Machine:
Edit `D:\Aavishkar\Project\VoteRakshak\polling-booth\.env`

Change:
```bash
VITE_BACKEND_URL=http://localhost:5000
VITE_BOOTH_ID=BOOTH_004
```

To (use your saved SERVER IP):
```bash
VITE_BACKEND_URL=http://192.168.1.100:5000
VITE_BOOTH_ID=BOOTH_004
```

#### On OFFICER DASHBOARD Machine:
Edit `D:\Aavishkar\Project\VoteRakshak\officer-dashboard\.env`

Change:
```bash
VITE_BACKEND_URL=http://localhost:5000
```

To:
```bash
VITE_BACKEND_URL=http://192.168.1.100:5000
```

#### Do the Same for OTHER BOOTHS (if on different machines):
- `polling-booth/.env` on each booth machine
- Same fix: Replace localhost:5000 with your SERVER_IP:5000

---

### 3️⃣ RESTART ALL SERVICES

**On SERVER MACHINE** (where backend runs):

```powershell
# Kill existing Node processes
taskkill /F /IM node.exe

# Restart backend
cd d:\Aavishkar\Project\VoteRakshak\server
npm run dev
```

✅ You should see:
```
🚀 VoteRakshak Backend — PHASE 2
📡 HTTP:      http://localhost:5000
🌐 Network:   http://192.168.1.100:5000  (your server IP)
```

**On BOOTH_004 MACHINE** (in NEW terminal):

```powershell
cd d:\Aavishkar\Project\VoteRakshak\polling-booth
npm run dev
```

✅ Check console for:
```
🔌 Initializing socket for BOOTH_004 to http://192.168.1.100:5000
✅ Connected to server
🏢 Booth registered: BOOTH_004
```

**On OFFICER DASHBOARD MACHINE** (in NEW terminal):

```powershell
cd d:\Aavishkar\Project\VoteRakshak\officer-dashboard
npm run dev
```

✅ Check console for:
```
🔌 Officer Dashboard API connecting to: http://192.168.1.100:5000
```

---

### 4️⃣ VERIFY IT WORKS

Open **Officer Dashboard** in browser: `http://localhost:5174`

Look for in console (F12 → Console):
```
✅ BOOTH_004 (ECS) - Status: idle - ONLINE
```

Try to unlock a booth → Should work! ✅

---

## ⚠️ If Still Not Working

### Check 1: Is Backend Actually Running?
```powershell
# On server machine
netstat -ano | findstr 5000
```

Should show: `TCP 0.0.0.0:5000 LISTENING`

### Check 2: Can Booth Reach Backend?
```powershell
# On booth machine
$tcp = New-Object System.Net.Sockets.TcpClient
$tcp.Connect("192.168.1.100", 5000)  # Use your SERVER IP
Write-Host "✅ Connected"
$tcp.Close()
```

### Check 3: Check Browser Console (F12)

**Booth Console (Polling Booth Machine):**
- Should show: `✅ Connected to server`
- If shows: `❌ Connection error` → Backend URL is wrong or backend not running

**Officer Console (Officer Dashboard Machine):**
- Should show: `🔌 Officer Dashboard API connecting to: http://192.168.1.100:5000`
- Should show active booths being loaded

### Check 4: Firewall
Windows Firewall might block port 5000:
```powershell
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Node.js Port 5000" dir=in action=allow program="C:\Program Files\nodejs\node.exe" localport=5000 protocol=tcp
```

---

## 📝 Quick Reference

| Step | Command/Action | Machine |
|------|---|---|
| 1 | `ipconfig \| findstr IPv4` | Server |
| 2 | Update VITE_BACKEND_URL in .env | All (booths & officer dashboard) |
| 3 | `npm run dev` | Backend: Server, Booth: booth machine, Officer: officer machine |
| 4 | Open console (F12) | Check for ✅ Connected messages |
| 5 | Test unlock | Officer Dashboard |

---

## 🎯 Expected Timeline
- Finding IP: 30 seconds
- Updating .env files: 2 minutes
- Restarting services: 1 minute
- Testing: 1 minute

**Total: ~5 minutes**

---

## 📚 Full Documentation

See **FIX_BOOTH_NOT_ONLINE_NETWORK.md** for:
- Detailed troubleshooting guide
- Architecture diagrams
- All debugging checks
- Explanation of what changed

---

## ✅ Summary of What Was Fixed

| Item | Before | After |
|------|--------|-------|
| API URL handling | Hardcoded localhost | Uses VITE_BACKEND_URL from .env |
| Booth registration | Failed on network machines | Works with server IP |
| Officer dashboard connectivity | Couldn't find network booths | Finds all registered booths |
| Error logging | Generic messages | Diagnostic info showing backend URL |
| .env files | Missing officer-dashboard/.env | Created with documentation |

**The fix: Update .env files with server IP, restart services → Done! ✨**

---

**Status:** ✅ Code fixed and committed  
**Your action:** Update .env files (2 min) and restart apps (1 min)  
**Result:** All booths show online, unlock works, voting continues  
