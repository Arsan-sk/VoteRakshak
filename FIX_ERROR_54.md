# 🔧 ERR_CONNECTION_CLOSED (Error 54) - Diagnostic & Fix Guide

## ❌ Problem Description

**Symptoms:**
- Browser error: `Failed to load resource: net::ERR_CONNECTION_CLOSED`
- Frontend error: "error 54"
- Network tab shows: Status 200 (response started)
- Connection abruptly closes while trying to receive data

**Root Cause:** SGI biometric service (sgibiosrv.exe) is:
- Accepting the connection ✅
- Sending HTTP 200 response headers ✅
- **BUT closing the connection before sending response body** ❌

This is **error 54 = ECONNRESET (connection reset by peer)**

---

## 🔍 Diagnosis Steps

### Step 1: Verify SGI Service is Running
```powershell
# Check if sgibiosrv.exe is running
tasklist | findstr /I sgibiosrv

# Check port 8443
netstat -ano | findstr 8443
```

**Should show:**
```
sgibiosrv.exe        PID    ...
TCP    0.0.0.0:8443    LISTENING
```

### Step 2: Check Network Connection
```powershell
# Test TCP connection to port 8443
powershell -Command "try { `$tcp = New-Object System.Net.Sockets.TcpClient; `$tcp.Connect('127.0.0.1', 8443); Write-Host 'Connected'; `$tcp.Close() } catch { Write-Host `$_.Exception.Message }"
```

**Should show:** "Connected" (no errors)

### Step 3: Check for SGI Service Crashes
```powershell
# Look for process crashes
Get-EventLog -LogName System -Source "*SGI*" -Newest 20 | Format-Table TimeGenerated, EventType, Message

# Or check Application log
Get-EventLog -LogName Application -Newest 50 | Where-Object { $_.Source -like "*Secur*" -or $_.Source -like "*SGI*" }
```

### Step 4: Manual Connection Test
```powershell
# Try connecting and reading response manually
powershell -Command "[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {`$true}; `$client = New-Object System.Net.WebClient; try { `$response = `$client.UploadString('https://localhost:8443/SGIFPCapture', ''); Write-Host `$response } catch { Write-Host 'Error: ' + `$_.Exception.Message }"
```

---

## ✅ Solution: 3-Step Fix

### Fix 1: Restart SGI Service (if it crashed)

**Option A - Kill and Restart:**
```powershell
# Find and kill the process
taskkill /IM sgibiosrv.exe /F

# Wait 2 seconds
Start-Sleep -Seconds 2

# Restart it
& "C:\Program Files\SecuGen\SGIBioAPI\sgibiosrv.exe"
```

Or find the installation path:
```powershell
# Find where SGI is installed
Get-ChildItem -Path "$env:ProgramFiles*" -Recurse -Filter "sgibiosrv.exe" 2>$null
```

**Option B - Unplug/Replug Scanner:**
1. Unplug USB fingerprint scanner
2. Wait 5 seconds
3. Plug it back in
4. SGI service auto-starts

### Fix 2: Clear/Reset SGI Service State

```powershell
# Stop the service
taskkill /IM sgibiosrv.exe /F

# Clear temporary files (if any)
Remove-Item -Path "$env:TEMP\SGI*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\BioAPI*" -Force -ErrorAction SilentlyContinue

# Restart
Start-Sleep -Seconds 2
& "C:\Program Files\SecuGen\SGIBioAPI\sgibiosrv.exe"

# Wait for service to initialize
Start-Sleep -Seconds 5
```

### Fix 3: Hard Reset - Complete Service Restart

```powershell
# Kill all SGI processes
Get-Process | Where-Object {$_.ProcessName -like "*sgi*" -or $_.ProcessName -like "*bio*"} | Stop-Process -Force

# Wait
Start-Sleep -Seconds 3

# Disconnect and reconnect scanner (hardware reset)
# Or restart Computer

# Then start SGI service manually
```

---

## 🧪 Verification Test

After fixing, test the connection:

```powershell
# Test 1: Port is listening
Write-Host "Port 8443 status:"
netstat -ano | findstr 8443
# Should show: LISTENING

# Test 2: Service is running
Write-Host "`nSGI Service status:"
tasklist | findstr sgibiosrv
# Should show process ID

# Test 3: Quick connectivity check
Write-Host "`nConnectivity test:"
powershell -Command "try {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {`$true};
    `$http = [System.Net.HttpWebRequest]::CreateHttp('https://localhost:8443/SGIFPCapture');
    `$http.Timeout = 5000;
    `$http.Method = 'POST';
    `$response = `$http.GetResponse();
    Write-Host 'Connected: ' + `$response.StatusCode;
    `$response.Close();
} catch {
    Write-Host 'Error: ' + `$_.Exception.Message
}"
```

---

## 🚨 If Error Persists

### Deeper Investigation

1. **Check Windows Firewall**
   ```powershell
   # Check if Windows Firewall is blocking port 8443
   Get-NetFirewallRule -DisplayName "*8443*" -ErrorAction SilentlyContinue
   ```

2. **Check if Another Process is Using Port 8443**
   ```powershell
   # Find what's using port 8443
   netstat -ano | findstr ":8443"
   # Note the PID, then:
   Get-Process -Id <PID>
   ```

3. **Check SecureGen Installation**
   ```powershell
   # Verify files exist
   dir "C:\Program Files\SecuGen\SGIBioAPI"
   # Should show: sgibiosrv.exe, DLLs, certificates, etc.
   ```

4. **Reinstall SecuGen BWAPI**
   - Uninstall: Control Panel → Uninstall → SecuGen BioAPI
   - Restart computer
   - Reinstall from original installer
   - Restart again

---

## 📋 Updated Error Messages in Code

I've updated the biometric code to provide clearer error messages:

**polling-booth/VotingScreen.jsx:**
```javascript
- Old: "Fingerprint scanner not reachable. Check SGIBioSrv."
+ New: "Connection failed: ERR_CONNECTION_CLOSED. Check if sgibiosrv.exe is running on port 8443."
```

**voter-portal/Register.jsx:**
```javascript
- Old: "Cannot reach SGIBioSrv (port 8000)"
+ New: "ERR_CONNECTION_CLOSED (error 54) — SGI service may have crashed. Restart it."
```

---

## 🛠️ Recovery Script

Save this as `fix-biometric-error54.ps1`:

```powershell
Write-Host "🔧 Fixing ERR_CONNECTION_CLOSED (Error 54)..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Killing SGI service..." -ForegroundColor Yellow
taskkill /IM sgibiosrv.exe /F 2>$null
Start-Sleep -Seconds 2

Write-Host "Step 2: Clearing temp files..." -ForegroundColor Yellow
Remove-Item -Path "$env:TEMP\SGI*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\BioAPI*" -Force -ErrorAction SilentlyContinue

Write-Host "Step 3: Restarting SGI service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
& "C:\Program Files\SecuGen\SGIBioAPI\sgibiosrv.exe" 2>$null || & "C:\Program Files (x86)\SecuGen\SGIBioAPI\sgibiosrv.exe"
Start-Sleep -Seconds 5

Write-Host "Step 4: Verifying..." -ForegroundColor Yellow
$sgiRunning = tasklist | findstr /I sgibiosrv
$port8443 = netstat -ano | findstr 8443

if ($sgiRunning -and $port8443) {
    Write-Host "✅ Fixed! SGI service is running on port 8443" -ForegroundColor Green
} else {
    Write-Host "❌ Service still not responding. Try unplugging and replugging the scanner." -ForegroundColor Red
}
```

Run with:
```powershell
powershell -ExecutionPolicy Bypass -File fix-biometric-error54.ps1
```

---

## 📞 Still Not Working?

1. **Check browser console** for additional error details
2. **Run:** `.\verify-system.bat` to diagnose all systems
3. **Check Windows Event Viewer** for SecuGen crashes
4. **Try in different browser** (Chrome, Firefox, Edge) to rule out browser issues
5. **Check if scanner is actually plugged in** and recognized by Windows
6. **Look in Device Manager** for "SecuGen" device with no warning icon

---

## ✨ Quick Fixes (Try These First)

```powershell
# 1. Replug scanner
#    (Wait 5 seconds after unplugging)

# 2. Restart Node servers (if ports changed)
#    Kill Node.js processes and restart npm run dev

# 3. Force refresh browser
#    Ctrl+Shift+R (hard refresh)

# 4. Clear browser cache
#    F12 → Settings → Clear site data → Reload
```

---

**Status:** ✅ Code updated with better error handling  
**Action:** Run fix script or restart SGI service  
**Test:** Open http://localhost:5175 and try scanning again
