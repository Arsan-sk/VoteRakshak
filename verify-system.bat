@echo off
REM Quick test to verify biometric system is working
cls

echo ════════════════════════════════════════════════════════════
echo  🔍 VOTERAKSHAK BIOMETRIC VERIFICATION TEST
echo ════════════════════════════════════════════════════════════
echo.

REM Test 1: Check if SGI service is running
echo [1/5] Checking SGI Service...
tasklist | findstr /I "sgibiosrv" >nul
if %errorlevel%==0 (
    echo ✅ PASS: SGI service is running
) else (
    echo ❌ FAIL: SGI service not found
    echo   Action: Check Device Manager or replug scanner
)
echo.

REM Test 2: Check port 8443
echo [2/5] Checking Port 8443...
netstat -ano | findstr /R ":8443.*LISTENING" >nul
if %errorlevel%==0 (
    echo ✅ PASS: Port 8443 is listening
) else (
    echo ❌ FAIL: Port 8443 not responding
    echo   Action: Restart sgibiosrv.exe
)
echo.

REM Test 3: Check config files
echo [3/5] Checking Configuration Files...
findstr "SGIBIOSRV_URL=https://localhost:8443" D:\Aavishkar\Project\VoteRakshak\server\.env >nul
if %errorlevel%==0 (
    echo ✅ PASS: server/.env configured correctly
) else (
    echo ❌ FAIL: server/.env needs update
)
echo.

REM Test 4: Biometric mode status
echo [4/5] Checking Biometric Mode...
findstr "BIOMETRIC_MODE=" D:\Aavishkar\Project\VoteRakshak\server\.env
echo (If above shows 'false', run: configure-biometric.ps1)
echo.

REM Test 5: File integrity
echo [5/5] Checking Critical Files...
set "files=0"
if exist "D:\Aavishkar\Project\VoteRakshak\server\.env" set /a files+=1
if exist "D:\Aavishkar\Project\VoteRakshak\polling-booth\.env" set /a files+=1
if exist "D:\Aavishkar\Project\VoteRakshak\voter-portal\.env" set /a files+=1

if %files%==3 (
    echo ✅ PASS: All .env files found
) else (
    echo ❌ FAIL: Some files missing
)
echo.

echo ════════════════════════════════════════════════════════════
echo  📋 NEXT STEPS:
echo ════════════════════════════════════════════════════════════
echo.
echo 1. powershell -ExecutionPolicy Bypass -File configure-biometric.ps1
echo    (Answer YES to enable fingerprint mode)
echo.
echo 2. cd server ^&^& npm run dev
echo.
echo 3. (New terminal) cd polling-booth ^&^& npm run dev
echo.
echo 4. Open: http://localhost:5175
echo.
echo 5. Test fingerprint scanning
echo.
pause
