# ════════════════════════════════════════════════════════════
# VoteRakshak Biometric Scanner FIX & START Guide
# ════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔧 BIOMETRIC SERVICE SETUP & FIX" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Find SGI installation
$foundPath = $null

# Check Program Files
if (Test-Path "$env:ProgramFiles\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe") {
    $foundPath = "$env:ProgramFiles\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe"
    Write-Host "✅ Found SGI installation: $foundPath" -ForegroundColor Green
}

# Check Program Files (x86)
if (-not $foundPath) {
    $x86Path = "${env:ProgramFiles(x86)}\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe"
    if (Test-Path $x86Path) {
        $foundPath = $x86Path
        Write-Host "✅ Found SGI installation: $foundPath" -ForegroundColor Green
    }
}

# Check custom paths
if (-not $foundPath) {
    @("C:\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe", "D:\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe") | ForEach-Object {
        if (Test-Path $_) {
            $foundPath = $_
            Write-Host "✅ Found SGI installation: $_" -ForegroundColor Green
        }
    }
}

if (-not $foundPath) {
    Write-Host ""
    Write-Host "❌ ERROR: SGI_BWAPI_Win_64bit.exe NOT FOUND!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 HOW TO FIX:" -ForegroundColor Yellow
    Write-Host "   1. Download SecuGen BWAPI driver package" -ForegroundColor White
    Write-Host "   2. Run the installer (SGIBioAPI_Setup.exe or similar)" -ForegroundColor White
    Write-Host "   3. Default install path: C:\Program Files\SecuGen\SGIBioAPI" -ForegroundColor White
    Write-Host "   4. Complete the installation" -ForegroundColor White
    Write-Host "   5. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after installing SGI BWAPI"
    exit
}

Write-Host ""
Write-Host "Step 1️⃣  Checking if SGI service is already running..." -ForegroundColor Yellow

$sgiProcess = Get-Process | Where-Object { $_.ProcessName -like "*SGI*" -or $_.ProcessName -like "*BioAPI*" }
if ($sgiProcess) {
    Write-Host "   ✅ SGI service already running" -ForegroundColor Green
    Write-Host "   Process: $($sgiProcess.ProcessName)" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Not running yet" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 2️⃣  Starting SGI_BWAPI service..." -ForegroundColor Yellow

try {
    $workingDir = Split-Path -Parent $foundPath
    Write-Host "   Working directory: $workingDir" -ForegroundColor Gray
    Write-Host "   Starting: $foundPath" -ForegroundColor Gray
    
    Start-Process $foundPath -WorkingDirectory $workingDir -ErrorAction Stop
    
    Write-Host "   ✅ SGI service started" -ForegroundColor Green
    Write-Host "   ⏳ Waiting for service to listen on port 8000..." -ForegroundColor Yellow
    
    # Wait up to 10 seconds for port to be ready
    $maxAttempts = 10
    $attempt = 0
    $portReady = $false
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempt++
        
        $portCheck = netstat -ano | Select-String ":8000"
        if ($portCheck) {
            $portReady = $true
            Write-Host "   ✅ Port 8000 is now LISTENING (attempt $attempt/$maxAttempts)" -ForegroundColor Green
            break
        }
        Write-Host "   ⏳ Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }
    
    if (-not $portReady) {
        Write-Host "   ⚠️  Port 8000 not ready yet (might take longer)" -ForegroundColor Yellow
        Write-Host "   Wait 5-10 more seconds and run diagnostic again" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Error starting service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Try running as Administrator:" -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 3️⃣  Verifying port 8000..." -ForegroundColor Yellow

try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("127.0.0.1", 8000)
    if ($tcpClient.Connected) {
        Write-Host "   ✅ Port 8000 is REACHABLE" -ForegroundColor Green
    }
    $tcpClient.Close()
} catch {
    Write-Host "   ❌ Port 8000 not responding yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4️⃣  Update VoteRakshak configuration..." -ForegroundColor Yellow
Write-Host ""

# Show what needs to be changed
Write-Host "   You need to enable BIOMETRIC_MODE in:" -ForegroundColor Cyan
Write-Host "   "
Write-Host "   📁 server/.env" -ForegroundColor White
Write-Host "      Change: BIOMETRIC_MODE=false" -ForegroundColor Red
Write-Host "      To:     BIOMETRIC_MODE=true" -ForegroundColor Green
Write-Host "   "
Write-Host "   📁 polling-booth/.env" -ForegroundColor White
Write-Host "      Change: VITE_BIOMETRIC_MODE=false" -ForegroundColor Red
Write-Host "      To:     VITE_BIOMETRIC_MODE=true" -ForegroundColor Green
Write-Host "   "
Write-Host "   📁 voter-portal/.env" -ForegroundColor White
Write-Host "      Change: VITE_BIOMETRIC_MODE=false" -ForegroundColor Red
Write-Host "      To:     VITE_BIOMETRIC_MODE=true" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Edit the .env files above and enable BIOMETRIC_MODE" -ForegroundColor White
Write-Host "  2. Restart your application servers" -ForegroundColor White
Write-Host "  3. Test fingerprint scanning" -ForegroundColor White
Write-Host ""
Write-Host "Run diagnostic again:" -ForegroundColor Yellow
Write-Host "  .\biometric-diagnostic.ps1" -ForegroundColor Cyan
Write-Host ""
