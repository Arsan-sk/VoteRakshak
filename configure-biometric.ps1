#!/usr/bin/env powershell
# Quick script to enable/disable biometric mode across all config files

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ⚙️  BIOMETRIC MODE CONFIGURATOR" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration files to update:" -ForegroundColor Yellow
Write-Host "  1. server/.env (BIOMETRIC_MODE)" -ForegroundColor White
Write-Host "  2. polling-booth/.env (VITE_BIOMETRIC_MODE)" -ForegroundColor White
Write-Host "  3. voter-portal/.env (VITE_BIOMETRIC_MODE)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enable biometric mode? (YES/NO)"

if ($choice -ieq "YES" -or $choice -ieq "Y") {
    Write-Host ""
    Write-Host "Setting BIOMETRIC_MODE=true..." -ForegroundColor Green
    
    # Update server/.env
    $serverEnv = "D:\Aavishkar\Project\VoteRakshak\server\.env"
    if (Test-Path $serverEnv) {
        (Get-Content $serverEnv) -replace 'BIOMETRIC_MODE=false', 'BIOMETRIC_MODE=true' | Set-Content $serverEnv
        Write-Host "   ✅ Updated: server/.env" -ForegroundColor Green
    }
    
    # Update polling-booth/.env
    $boothEnv = "D:\Aavishkar\Project\VoteRakshak\polling-booth\.env"
    if (Test-Path $boothEnv) {
        (Get-Content $boothEnv) -replace 'VITE_BIOMETRIC_MODE=false', 'VITE_BIOMETRIC_MODE=true' | Set-Content $boothEnv
        Write-Host "   ✅ Updated: polling-booth/.env" -ForegroundColor Green
    }
    
    # Update voter-portal/.env
    $portalEnv = "D:\Aavishkar\Project\VoteRakshak\voter-portal\.env"
    if (Test-Path $portalEnv) {
        (Get-Content $portalEnv) -replace 'VITE_BIOMETRIC_MODE=false', 'VITE_BIOMETRIC_MODE=true' | Set-Content $portalEnv
        Write-Host "   ✅ Updated: voter-portal/.env" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ All files updated to BIOMETRIC_MODE=true" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart your development servers" -ForegroundColor White
    Write-Host "  2. Hard refresh browser (Ctrl+Shift+R)" -ForegroundColor White
    Write-Host "  3. Test fingerprint scanning" -ForegroundColor White

} elseif ($choice -ieq "NO" -or $choice -ieq "N") {
    Write-Host ""
    Write-Host "Setting BIOMETRIC_MODE=false (PIN mode)..." -ForegroundColor Yellow
    
    # Update server/.env
    $serverEnv = "D:\Aavishkar\Project\VoteRakshak\server\.env"
    if (Test-Path $serverEnv) {
        (Get-Content $serverEnv) -replace 'BIOMETRIC_MODE=true', 'BIOMETRIC_MODE=false' | Set-Content $serverEnv
        Write-Host "   ✅ Updated: server/.env" -ForegroundColor Green
    }
    
    # Update polling-booth/.env
    $boothEnv = "D:\Aavishkar\Project\VoteRakshak\polling-booth\.env"
    if (Test-Path $boothEnv) {
        (Get-Content $boothEnv) -replace 'VITE_BIOMETRIC_MODE=true', 'VITE_BIOMETRIC_MODE=false' | Set-Content $boothEnv
        Write-Host "   ✅ Updated: polling-booth/.env" -ForegroundColor Green
    }
    
    # Update voter-portal/.env
    $portalEnv = "D:\Aavishkar\Project\VoteRakshak\voter-portal\.env"
    if (Test-Path $portalEnv) {
        (Get-Content $portalEnv) -replace 'VITE_BIOMETRIC_MODE=true', 'VITE_BIOMETRIC_MODE=false' | Set-Content $portalEnv
        Write-Host "   ✅ Updated: voter-portal/.env" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ All files updated to BIOMETRIC_MODE=false (PIN mode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now use 4-digit PIN for authentication" -ForegroundColor Yellow

} else {
    Write-Host "❌ Invalid choice. Please run again with YES or NO" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
