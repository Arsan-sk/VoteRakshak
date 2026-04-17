# 🔐 VoteRakshak Biometric Scanner - Complete Setup Guide

## 🎯 Overview
The VoteRakshak voting system uses SecuGen fingerprint scanners via the SGI_BWAPI driver. When you attach the scanner, it communicates through:
- **Port 8000** (HTTPS) - SGI Biometric API Service
- **Port 5000** (HTTP) - VoteRakshak Backend Server

---

## ❌ Problem: "Fingerprint Scanner Not Reachable"

This error means the SGI biometric service is NOT running or NOT listening on port 8000.

---

## ✅ SOLUTION: Step-by-Step Setup

### **Step 1️⃣: Verify SGI Driver Installation (5 minutes)**

Open PowerShell and run:
```powershell
cd D:\Aavishkar\Project\VoteRakshak
.\biometric-diagnostic.ps1
```

**What it checks:**
- ✅ Is SGI_BWAPI_Win_64bit.exe installed?
- ✅ Is port 8000 listening?
- ✅ Is the biometric service running?
- ✅ Can we reach the fingerprint scanner endpoint?

**Expected output:**
```
✅ Found: C:\Program Files\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe
✅ Port 8000 IS LISTENING
✅ SGI Process FOUND: SGI_BWAPI_Win_64bit (PID: 1234)
✅ PORT 8000 IS REACHABLE
✅ SYSTEM STATUS: All OK - SGI service is running!
```

**If you see errors:**
- "NOT FOUND" → SGI driver not installed (see Step 2)
- "NOT LISTENING" → Driver needs to be started (see Step 3)

---

### **Step 2️⃣: Install SGI Driver (if not installed)**

#### Option A: Download SecuGen BioAPI SDK
1. Visit: https://www.secugen.com/downloads (or check your documentation)
2. Download: **SGIBioAPI SDK for Windows 64-bit**
3. Run the installer
4. Choose install path: `C:\Program Files\SecuGen\SGIBioAPI`
5. Complete installation
6. **Restart your computer** after installation

#### Option B: Use Existing Installation
If you already installed SGI_BWAPI_Win_64bit.exe, verify the location:
```powershell
Get-ChildItem -Path "C:\Program Files*" -Recurse -Filter "*SGI*" -ErrorAction SilentlyContinue
```

---

### **Step 3️⃣: Start the Biometric Service (2 minutes)**

Open PowerShell **as Administrator** and run:
```powershell
cd D:\Aavishkar\Project\VoteRakshak
.\biometric-fix.ps1
```

**What it does:**
1. ✅ Finds SGI installation automatically
2. ✅ Starts SGI_BWAPI_Win_64bit.exe service
3. ✅ Waits for port 8000 to be ready
4. ✅ Shows next configuration steps

**Expected output:**
```
✅ Found SGI installation: C:\Program Files\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe
✅ SGI service started
✅ Port 8000 is now LISTENING
```

---

### **Step 4️⃣: Enable BIOMETRIC_MODE in Configuration Files (2 minutes)**

Now enable fingerprint authentication in 3 files:

#### File 1: `server/.env`
```ini
# Change FROM:
BIOMETRIC_MODE=false

# Change TO:
BIOMETRIC_MODE=true
FINGERPRINT_REQUIRED=true
```

#### File 2: `polling-booth/.env`
```ini
# Change FROM:
VITE_BIOMETRIC_MODE=false

# Change TO:
VITE_BIOMETRIC_MODE=true
```

#### File 3: `voter-portal/.env`
```ini
# Change FROM:
VITE_BIOMETRIC_MODE=false

# Change TO:
VITE_BIOMETRIC_MODE=true
```

---

### **Step 5️⃣: Start VoteRakshak Services (3 minutes)**

#### Terminal 1: Start Backend Server
```powershell
cd D:\Aavishkar\Project\VoteRakshak\server
npm install  # (if needed)
npm run dev
```

You should see:
```
✅ Server running on port 5000
```

#### Terminal 2: Start Polling Booth
```powershell
cd D:\Aavishkar\Project\VoteRakshak\polling-booth
npm install  # (if needed)
npm run dev
```

You should see:
```
✅ Local: http://localhost:5175
```

---

### **Step 6️⃣: Test Biometric Connection (2 minutes)**

Run the test suite:
```powershell
cd D:\Aavishkar\Project\VoteRakshak
.\biometric-test.ps1
```

**Expected output:**
```
Test 1️⃣ → Port 8000 Connectivity
   ✅ PASS: Port 8000 is accessible

Test 2️⃣ → HTTPS Endpoint
   ✅ PASS: Endpoint is reachable

Test 3️⃣ → VoteRakshak Server Health
   ✅ PASS: Server is running on port 5000

Test 4️⃣ → Configuration Files
   ✅ server/.env: BIOMETRIC_MODE=true
   ✅ polling-booth/.env: VITE_BIOMETRIC_MODE=true
   ✅ voter-portal/.env: VITE_BIOMETRIC_MODE=true

Test 5️⃣ → SGI Service Process
   ✅ PASS: SGI process is running

✅ All tests passed!
```

---

### **Step 7️⃣: Physical Setup & Testing (5 minutes)**

1. **Connect Fingerprint Scanner**
   - Plug USB scanner into computer
   - Windows should auto-detect it
   - Wait 5 seconds for driver to load

2. **Test in Polling Booth**
   - Open: http://localhost:5175
   - Go to voting screen
   - Click "Scan Fingerprint"
   - Place finger on scanner
   - Wait for image to appear

3. **Verify Fingerprint is Captured**
   - You should see a fingerprint image
   - Status should show "✅ Fingerprint captured"
   - No error messages

4. **Test End-to-End Vote**
   - Fingerprint confirms voter identity
   - Click vote button
   - Transaction recorded on blockchain

---

## 🔍 Troubleshooting

### **Problem: "Port 8000 NOT LISTENING"**

**Solution:**
```powershell
.\biometric-fix.ps1
```

If that doesn't work:
1. Check Task Manager → find any "SGI" process → End it
2. Delete Windows Temporary Files: `%temp%\SGI*`
3. Restart computer
4. Run `.\biometric-fix.ps1` again

### **Problem: "Cannot find SGI_BWAPI_Win_64bit.exe"**

**Solution:**
1. Reinstall SecuGen BioAPI SDK
2. Use default installation path: `C:\Program Files\SecuGen\SGIBioAPI`
3. Restart computer after installation
4. Run `.\biometric-diagnostic.ps1` to verify

### **Problem: "Fingerprint scanner not detected"**

**Solution:**
1. Check USB connection (try different USB port)
2. In Device Manager: Devices → look for "SecuGen" device
3. If it shows "?" → reinstall USB drivers from BioAPI package
4. Restart and reconnect scanner

### **Problem: "VITE_BIOMETRIC_MODE not recognized"**

**Solution:**
1. Make sure you're editing the correct `.env` file (in `polling-booth` folder)
2. It must be `VITE_BIOMETRIC_MODE` (not `BIOMETRIC_MODE`)
3. Save file and restart dev server
4. Hard refresh browser (Ctrl+Shift+R)

### **Problem: Biometric works in booth but not in voter-portal**

**Solution:**
1. Check `voter-portal/.env` for `VITE_BIOMETRIC_MODE=true`
2. Restart voter-portal dev server
3. Both apps need this setting

---

## 📋 File Checklist

Ensure these files exist in your project:

```
✅ VoteRakshak/
  ├─ biometric-diagnostic.ps1    (Auto-diagnostic tool)
  ├─ biometric-fix.ps1            (Start service & configure)
  ├─ biometric-test.ps1           (Test all connections)
  ├─ server/
  │  ├─ .env                      (BIOMETRIC_MODE=true)
  │  ├─ utils/biometric.js        (Backend biometric logic)
  │  └─ server.js                 (Express server on port 5000)
  ├─ polling-booth/
  │  ├─ .env                      (VITE_BIOMETRIC_MODE=true)
  │  ├─ src/components/
  │  │  └─ VotingScreen.jsx       (Fingerprint capture code)
  │  └─ vite.config.js
  └─ voter-portal/
     ├─ .env                      (VITE_BIOMETRIC_MODE=true)
     ├─ src/pages/
     │  └─ Register.jsx           (Fingerprint registration)
     └─ vite.config.js
```

---

## 🎯 Complete Test Flow

After setup, run this sequence to verify everything:

```powershell
# 1. Check system readiness
.\biometric-diagnostic.ps1

# 2. Start SGI service (if not running)
.\biometric-fix.ps1

# 3. In Terminal 1: Start backend
cd server && npm run dev

# 4. In Terminal 2: Start polling booth
cd polling-booth && npm run dev

# 5. In Terminal 3: Run tests
.\biometric-test.ps1

# 6. In browser: http://localhost:5175
# Click "Scan Fingerprint" and test scanning
```

---

## 📞 Getting Help

If issues persist:

1. **Check logs:**
   ```powershell
   Get-EventLog -LogName System -Source "SecuGen" -Newest 20
   Get-EventLog -LogName Application -Source "*SGI*" -Newest 20
   ```

2. **Run full diagnostic:**
   ```powershell
   .\biometric-diagnostic.ps1 | Tee-Object -FilePath "biometric-diagnostic-log.txt"
   ```

3. **Check Port 8000 alternatives:**
   ```powershell
   netstat -ano | Select-String "8000"  # Should show SGI service
   netstat -ano | Select-String "5000"  # Should show Node.js server
   ```

4. **Kill stuck processes:**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*SGI*"} | Stop-Process -Force
   ```

---

## ✨ Success Signs

When everything is working:

✅ Fingerprint image appears when scanning  
✅ No "not reachable" errors  
✅ Vote confirms with biometric  
✅ Blockchain transaction records fingerprint hash  
✅ Multiple voters can use same scanner  
✅ No duplicate votes from same person  

---

**Last Updated:** 2025-04-17  
**For Issues:** Check logs with `.\biometric-diagnostic.ps1`
