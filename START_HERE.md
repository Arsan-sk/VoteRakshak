# 🚀 START HERE - 5 MINUTE QUICK START

## ⚡ What's Already Done

✅ SGI Service running on port 8443  
✅ All config files updated to use port 8443  
✅ All necessary files checked and correct  

## 🔧 3-Step Activation

### Step 1: Enable Biometric Mode (1 min)

```powershell
cd D:\Aavishkar\Project\VoteRakshak
powershell -ExecutionPolicy Bypass -File configure-biometric.ps1
```
**When prompted:** Type `YES` and press Enter

### Step 2: Start Backend Server (1 min)

```powershell
cd D:\Aavishkar\Project\VoteRakshak\server
npm run dev
```

Wait for: `✅ Server running on port 5000`

### Step 3: Start Frontend in NEW Terminal (1 min)

```powershell
cd D:\Aavishkar\Project\VoteRakshak\polling-booth
npm run dev
```

Wait for: `✅ Local: http://localhost:5175`

## 🧪 Test It (2 min)

1. **Open browser:** http://localhost:5175
2. **Go to voting screen**
3. **Click "Scan Fingerprint"**
4. **Put your finger on scanner**
5. ✅ **You should see the fingerprint image!**

---

## ❌ If It Doesn't Work

### Issue: "Fingerprint scanner not reachable"

**Quick Fix:**
```powershell
# Check if service is still running
tasklist | findstr /I sgi
# Should show: sgibiosrv.exe

# If not found, replug the scanner

# Check port 8443
netstat -ano | findstr 8443
# Should show: LISTENING
```

### Issue: "Still not working"

Read the full documentation:
```
D:\Aavishkar\Project\VoteRakshak\BIOMETRIC_QUICK_START.md
```

---

## 🎯 What Each File Does

| File | Action |
|------|--------|
| `configure-biometric.ps1` | Enable/disable fingerprint mode |
| `check-biometric.ps1` | Check if system is ready |
| `BIOMETRIC_STATUS.md` | This summary |
| `.env files` | Configuration (auto-updated) |

---

**You're ready to test now!** 🚀  
Follow the 3 steps above and test.
