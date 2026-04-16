# ═══════════════════════════════════════════════════════
# VoteRakshak Phase 2 — Launch All 7 Booths
# Run: .\start-booths.ps1
# Each booth opens in its own terminal window
# ═══════════════════════════════════════════════════════

$boothDir = "D:\Aavishkar\Project\VoteRakshak\polling-booth"

$booths = @(
    @{ Mode = "booth1"; Name = "CO Booth   (BOOTH_001)"; Port = 5175 },
    @{ Mode = "booth2"; Name = "AI/ML Booth(BOOTH_002)"; Port = 5177 },
    @{ Mode = "booth3"; Name = "DS Booth   (BOOTH_003)"; Port = 5178 },
    @{ Mode = "booth4"; Name = "ECS Booth  (BOOTH_004)"; Port = 5179 },
    @{ Mode = "booth5"; Name = "ME Booth   (BOOTH_005)"; Port = 5180 },
    @{ Mode = "booth6"; Name = "CE Booth   (BOOTH_006)"; Port = 5181 },
    @{ Mode = "booth7"; Name = "EE Booth   (BOOTH_007)"; Port = 5182 }
)

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  VoteRakshak Phase 2 — Starting Booths  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($booth in $booths) {
    Write-Host "Starting $($booth.Name) → http://localhost:$($booth.Port)" -ForegroundColor Green

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$boothDir'; Write-Host '🏢 $($booth.Name) - Port $($booth.Port)' -ForegroundColor Cyan; npm run dev:$($booth.Mode)"
    ) -WindowStyle Normal
    
    Start-Sleep -Milliseconds 500  # stagger startup slightly
}

Write-Host ""
Write-Host "All 7 booths launching! Access them at:" -ForegroundColor Yellow
Write-Host "  CO  → http://localhost:5175" -ForegroundColor White
Write-Host "  AI  → http://localhost:5177" -ForegroundColor White
Write-Host "  DS  → http://localhost:5178" -ForegroundColor White
Write-Host "  ECS → http://localhost:5179" -ForegroundColor White
Write-Host "  ME  → http://localhost:5180" -ForegroundColor White
Write-Host "  CE  → http://localhost:5181" -ForegroundColor White
Write-Host "  EE  → http://localhost:5182" -ForegroundColor White
Write-Host ""
