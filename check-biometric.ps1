
# Biometric Scanner Diagnostic - Simple version
Write-Host ""
Write-Host "======== BIOMETRIC SCANNER DIAGNOSTIC ========" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Checking for SGI installation..." -ForegroundColor Yellow

$sgiPath = "$env:ProgramFiles\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe"
$x86Path = "${env:ProgramFiles(x86)}\SecuGen\SGIBioAPI\SGI_BWAPI_Win_64bit.exe"

$found = $false
if (Test-Path $sgiPath) { Write-Host "   ✅ Found: $sgiPath" -ForegroundColor Green; $found = $true }
elseif (Test-Path $x86Path) { Write-Host "   ✅ Found: $x86Path" -ForegroundColor Green; $found = $true }
else { Write-Host "   ❌ NOT FOUND - SGI not installed" -ForegroundColor Red }

Write-Host ""
Write-Host "2️⃣  Checking port 8000..." -ForegroundColor Yellow

$portCheck = netstat -ano 2>$null | Select-String ":8000"
if ($portCheck) {
    Write-Host "   ✅ Port 8000 is LISTENING" -ForegroundColor Green
    Write-Host "   $portCheck" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 8000 is NOT LISTENING" -ForegroundColor Red
}

Write-Host ""
Write-Host "3️⃣  Checking SGI process..." -ForegroundColor Yellow

$proc = Get-Process | Where-Object { $_.ProcessName -like "*SGI*" -or $_.ProcessName -like "*BioAPI*" }
if ($proc) {
    Write-Host "   ✅ Process found: $($proc.ProcessName)" -ForegroundColor Green
} else {
    Write-Host "   ❌ No SGI process running" -ForegroundColor Red
}

Write-Host ""
Write-Host "======== SUMMARY ========" -ForegroundColor Cyan
if ($found -and $portCheck -and $proc) {
    Write-Host "✅ ALL SYSTEMS OK - SGI service is running!" -ForegroundColor Green
} else {
    Write-Host "⚠️  ISSUES FOUND - Run: .\biometric-fix.ps1" -ForegroundColor Yellow
}
Write-Host ""
