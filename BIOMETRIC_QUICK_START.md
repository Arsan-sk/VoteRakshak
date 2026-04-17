# 🔐 BIOMETRIC SCANNER - QUICK START GUIDE

## ⚡ Current Status

✅ **SGI Biometric Service:** RUNNING (sgibiosrv.exe, PID 6984)  
✅ **Port 8443:** LISTENING (fixed from 8000)  
✅ **Configuration:** UPDATED  

---

## 🎯 Step-by-Step Setup (5 minutes)

### **Step 1: Enable Biometric Mode**

Edit these 3 files and change settings to `true`:

**File 1:** `server\.env`
```
BIOMETRIC_MODE=true
FINGERPRINT_REQUIRED=true
```

**File 2:** `polling-booth\.env`
```
VITE_BIOMETRIC_MODE=true
```

**File 3:** `voter-portal\.env`
```
VITE_BIOMETRIC_MODE=true
```

### **Step 2: Start Backend Server**

```powershell
cd D:\Aavishkar\Project\VoteRakshak\server
npm install  # (first time only)
npm run dev
```

You should see:
```
✅ Server running on port 5000
```

### **Step 3: Start Polling Booth Frontend**

```powershell
cd D:\Aavishkar\Project\VoteRakshak\polling-booth
npm install  # (first time only)
npm run dev
```

You should see:
```
✅ Local: http://localhost:5175
```

### **Step 4: Connect & Test Fingerprint**

1. **Attach the fingerprint scanner** to USB
2. **Open browser:** http://localhost:5175
3. **Go to voting screen**
4. **Click "Scan Fingerprint"**
5. **Place your finger on scanner**
6. ✅ You should see your fingerprint image appear!

---

## 📋 File Changes Made

| Filefile | Change |
|---|---|
| `server/.env` | `SGIBIOSRV_URL=https://localhost:8000` → `https://localhost:8443` |
| `voter-portal/Register.jsx` | Updated endpoint to 8443 |
| `polling-booth/VotingScreen.jsx` | Updated endpoint to 8443 |

---

## ✅ Verification Checklist

Run after setup:
```powershell
# Check service is running
powershell -Command "tasklist | findstr /I sgi"
# Should show: sgibiosrv.exe

# Check port is listening
powershell -Command "netstat -ano | findstr 8443"
# Should show: TCP 0.0.0.0:8443 LISTENING

# Check backend is running
curl http://localhost:5000/api/health
# Should return JSON with status: "healthy"
```

---

## 🎯 Architecture

```
┌─────────────────────────────────────────────┐
│  Polling Booth Frontend (Port 5175)         │
│  POST https://localhost:8443/SGIFPCapture   │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  SGI Biometric Service (Port 8443)          │
│  sgibiosrv.exe                              │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  Fingerprint Scanner (USB)                  │
│  Captures fingerprint → Returns template    │
└─────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: "Fingerprint scanner not reachable"

**Fix 1:** Verify port 8443
```powershell
netstat -ano | findstr 8443
```
Should show `LISTENING` status.

**Fix 2:** Restart SGI service
```powershell
# Kill existing process
taskkill /PID 6984 /F

# Start fresh by unplugging/replugging scanner
# Or find and run: C:\Program Files\SecuGen\SGIBioAPI\sgibiosrv.exe
```

**Fix 3:** Check scanner connection
- Try different USB port
- Check Device Manager for "SecuGen" device
- Reinstall USB drivers if needed

### Issue: "Module not found" or "Cannot find sgibiosrv"

```powershell
# Check if SGI is installed
dir "$env:ProgramFiles\SecuGen\SGIBioAPI\"
```

If not found:
1. Download SecuGen BioAPI SDK
2. Install to: `C:\Program Files\SecuGen\SGIBioAPI`
3. Restart computer
4. Run this guide again

### Issue: Biometric still not working

1. **Hard refresh frontend:** Ctrl+Shift+R (clears cache)
2. **Restart all servers:** Kill and restart Node.js
3. **Check logs:**
   ```powershell
   # Check Event Viewer for SecuGen errors
   Get-EventLog -LogName System -Source "SecuGen" -Newest 10
   ```

---

## 🚀 Production Setup

When ready for production:

1. Set `BIOMETRIC_MODE=true` (already done)
2. Set `FINGERPRINT_REQUIRED=true` in server/.env
3. Enable SSL/TLS certificates for 8443
4. Restrict USB device access (only authorized scanners)
5. Log all fingerprint verifications for audit trail

---

## 📞 Support

If issues persist:
1. Check this guide's troubleshooting section
2. Run verification checklist above
3. Check Event Viewer logs for errors
4. Verify scanner is compatible with SecuGen SDK

---

**Last Updated:** 2025-04-17  
**Port Updated From:** 8000 → 8443  
**Status:** ✅ Ready for testing
