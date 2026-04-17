# ════════════════════════════════════════════════════════════
# VoteRakshak Biometric Scanner Diagnostic Tool
# Checks SGI driver installation, port 8000, and connectivity
# ════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 BIOMETRIC SCANNER DIAGNOSTIC TOOL" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if SGI_BWAPI_Win_64bit.exe is installed
Write-Host "Step 1️⃣  Checking for SGI BWAPI installation..." -ForegroundColor Yellow

$foundPath = $null

# Check Program Files
if (Test-Path "$env:ProgramFiles\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe") {
    $foundPath = "$env:ProgramFiles\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe"
    Write-Host "   ✅ Found: $foundPath" -ForegroundColor Green
}

# Check Program Files (x86)
if (-not $foundPath) {
    $x86Path = "${env:ProgramFiles(x86)}\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe"
    if (Test-Path $x86Path) {
        $foundPath = $x86Path
        Write-Host "   ✅ Found: $foundPath" -ForegroundColor Green
    }
}

# Check custom paths
if (-not $foundPath) {
    @("C:\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe", "D:\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe") | ForEach-Object {
        if (Test-Path $_) {
            $foundPath = $_
            Write-Host "   ✅ Found: $_" -ForegroundColor Green
        }
    }
}

if (-not $foundPath) {
    Write-Host "   ❌ NOT FOUND in standard locations" -ForegroundColor Red
    Write-Host "      Checking Program Files..." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Check if port 8000 is in use
Write-Host "Step 2️⃣  Checking port 8000 status..." -ForegroundColor Yellow

$portInUse = netstat -ano | Select-String ":8000"
if ($portInUse) {
    Write-Host "   ✅ Port 8000 IS LISTENING" -ForegroundColor Green
    Write-Host "   Process info:" -ForegroundColor Green
    Write-Host "   $portInUse" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 8000 is NOT LISTENING" -ForegroundColor Red
    Write-Host "   This means SGIBioSrv is NOT running" -ForegroundColor Red
}

Write-Host ""

# Step 3: Check if SGI process is running
Write-Host "Step 3️⃣  Checking for running SGI processes..." -ForegroundColor Yellow

$sgiProcess = Get-Process | Where-Object { $_.ProcessName -like "*SGI*" -or $_.ProcessName -like "*BioAPI*" }
if ($sgiProcess) {
    Write-Host "   ✅ SGI Process FOUND:" -ForegroundColor Green
    $sgiProcess | ForEach-Object {
        Write-Host "      Name: $($_.ProcessName), PID: $($_.Id), Memory: $($_.WorkingSet / 1MB)MB" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ NO SGI processes running" -ForegroundColor Red
}

Write-Host ""

# Step 4: Test connectivity to port 8000
Write-Host "Step 4️⃣  Testing connectivity to localhost:8000..." -ForegroundColor Yellow

try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("127.0.0.1", 8000)
    if ($tcpClient.Connected) {
        Write-Host "   ✅ PORT 8000 IS REACHABLE" -ForegroundColor Green
    }
    $tcpClient.Close()
} catch {
    Write-Host "   ❌ PORT 8000 IS NOT REACHABLE" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 5: Test HTTPS endpoint
$endpoint = "https://localhost:8000/SGIFPCapture"
Write-Host "Step 5️⃣  Testing HTTPS endpoint ($endpoint)..." -ForegroundColor Yellow

try {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    $response = Invoke-WebRequest -Uri $endpoint -Method POST -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ ENDPOINT IS REACHABLE" -ForegroundColor Green
    Write-Host "   Response Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*404*") {
        Write-Host "   ⚠️  Port 8000 responding but endpoint not found (404)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ ENDPOINT NOT REACHABLE" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📋 DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($foundPath -and $portInUse) {
    Write-Host "✅ SYSTEM STATUS: All OK - SGI service is running!" -ForegroundColor Green
    Write-Host "You can enable BIOMETRIC_MODE in your .env files" -ForegroundColor Green
} else {
    Write-Host "⚠️  ISSUES FOUND:" -ForegroundColor Yellow
    if (-not $foundPath) {
        Write-Host "   • SGI_BWAPI_Win_64bit.exe is NOT installed" -ForegroundColor Red
    }
    if (-not $portInUse) {
        Write-Host "   • Port 8000 is NOT listening (service not running)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "For next steps, run: .\biometric-fix.ps1" -ForegroundColor Yellow
Write-Host ""
