# ════════════════════════════════════════════════════════════
# Biometric Scanner Test Suite
# Tests fingerprint scanning endpoint connectivity
# ════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 BIOMETRIC SCANNER TEST SUITE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: Port connectivity
Write-Host "Test 1️⃣  → Port 8000 Connectivity" -ForegroundColor Yellow
Write-Host "   Testing TCP connection to localhost:8000..." -ForegroundColor Gray

try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("127.0.0.1", 8000)
    if ($tcpClient.Connected) {
        Write-Host "   ✅ PASS: Port 8000 is accessible" -ForegroundColor Green
    }
    $tcpClient.Close()
} catch {
    Write-Host "   ❌ FAIL: Cannot connect to port 8000" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Fix: Run .\biometric-fix.ps1 to start the service" -ForegroundColor Yellow
}

Write-Host ""

# Test 2: HTTPS endpoint
Write-Host "Test 2️⃣  → HTTPS Endpoint (https://localhost:8000/SGIFPCapture)" -ForegroundColor Yellow
Write-Host "   Testing POST to SGIFPCapture endpoint..." -ForegroundColor Gray

try {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    
    $response = Invoke-WebRequest -Uri "https://localhost:8000/SGIFPCapture" `
        -Method POST `
        -TimeoutSec 3 `
        -ErrorAction Stop
    
    Write-Host "   ✅ PASS: Endpoint is reachable" -ForegroundColor Green
    Write-Host "   Response Status: $($response.StatusCode)" -ForegroundColor Green
    
} catch {
    $errorMsg = $_.Exception.Message
    
    if ($errorMsg -like "*404*" -or $_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ⚠️  PARTIAL: Port 8000 responding but endpoint not found" -ForegroundColor Yellow
        Write-Host "   The service needs proper configuration" -ForegroundColor Yellow
    } elseif ($errorMsg -like "*Connection refused*" -or $errorMsg -like "*No connection*") {
        Write-Host "   ❌ FAIL: Connection refused - service not listening" -ForegroundColor Red
        Write-Host "   Fix: Run .\biometric-fix.ps1" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ FAIL: Cannot reach endpoint" -ForegroundColor Red
        Write-Host "   Error: $errorMsg" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Server health check
Write-Host "Test 3️⃣  → VoteRakshak Server Health" -ForegroundColor Yellow
Write-Host "   Testing server on port 5000..." -ForegroundColor Gray

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" `
        -TimeoutSec 3 `
        -ErrorAction Stop
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   ✅ PASS: Server is running on port 5000" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Green
        Write-Host "   Phase: $($healthData.phase)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  WARNING: Server not responding on port 5000" -ForegroundColor Yellow
    Write-Host "   Make sure to run: npm run dev (in server folder)" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Configuration check
Write-Host "Test 4️⃣  → Configuration Files" -ForegroundColor Yellow
Write-Host "   Checking BIOMETRIC_MODE settings..." -ForegroundColor Gray

$configs = @(
    @{ path = ".\server\.env"; key = "BIOMETRIC_MODE" },
    @{ path = ".\polling-booth\.env"; key = "VITE_BIOMETRIC_MODE" },
    @{ path = ".\voter-portal\.env"; key = "VITE_BIOMETRIC_MODE" }
)

$allEnabled = $true
foreach ($config in $configs) {
    if (Test-Path $config.path) {
        $content = Get-Content $config.path
        $line = $content | Select-String "$($config.key)="
        
        if ($line) {
            $value = ($line -split "=")[1].Trim()
            if ($value -ieq "true") {
                Write-Host "   ✅ $($config.path): $($config.key)=$value" -ForegroundColor Green
            } else {
                Write-Host "   ❌ $($config.path): $($config.key)=$value (should be true)" -ForegroundColor Red
                $allEnabled = $false
            }
        }
    } else {
        Write-Host "   ⚠️  $($config.path) not found" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 5: SGI process check
Write-Host "Test 5️⃣  → SGI Service Process" -ForegroundColor Yellow
Write-Host "   Checking if SGI_BWAPI is running..." -ForegroundColor Gray

$sgiProcess = Get-Process | Where-Object { $_.ProcessName -like "*SGI*" -or $_.ProcessName -like "*BioAPI*" }
if ($sgiProcess) {
    Write-Host "   ✅ PASS: SGI process is running" -ForegroundColor Green
    $sgiProcess | ForEach-Object {
        Write-Host "      Process: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ FAIL: SGI service is NOT running" -ForegroundColor Red
    Write-Host "   Fix: Run .\biometric-fix.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($allEnabled) {
    Write-Host "✅ All tests passed! Biometric system should be ready." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Follow the recommendations above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Quick help:" -ForegroundColor Cyan
Write-Host "   • If port 8000 not listening:    .\biometric-fix.ps1" -ForegroundColor White
Write-Host "   • If config files disabled:      Edit .env files and enable BIOMETRIC_MODE" -ForegroundColor White
Write-Host "   • For detailed diagnostics:      .\biometric-diagnostic.ps1" -ForegroundColor White
Write-Host ""
