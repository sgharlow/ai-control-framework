# Session-Timer.ps1
# Session Timer - Track elapsed time and gate violations
# Part of AI Control Framework v1.1.0
# Cross-platform compatible (Windows/Linux/Mac)

[CmdletBinding()]
param()

# Error handling
$ErrorActionPreference = "Stop"

# Color functions for cross-platform compatibility
function Write-ColorOutput {
    param([string]$Text, [string]$Color = "White")
    
    if ($PSVersionTable.PSVersion.Major -ge 6) {
        # PowerShell Core - use ANSI colors
        switch ($Color) {
            "Green" { Write-Host $Text -ForegroundColor Green }
            "Yellow" { Write-Host $Text -ForegroundColor Yellow }
            "Red" { Write-Host $Text -ForegroundColor Red }
            "Blue" { Write-Host $Text -ForegroundColor Cyan }
            default { Write-Host $Text }
        }
    } else {
        # Windows PowerShell - use console colors
        switch ($Color) {
            "Green" { Write-Host $Text -ForegroundColor Green }
            "Yellow" { Write-Host $Text -ForegroundColor Yellow }
            "Red" { Write-Host $Text -ForegroundColor Red }
            "Blue" { Write-Host $Text -ForegroundColor Cyan }
            default { Write-Host $Text }
        }
    }
}

# Session start tracking files
$sessionFile = ".session-start"
$sessionTypeFile = ".session-type"

# Get or set session start time
if (-not (Test-Path $sessionFile)) {
    [DateTimeOffset]::Now.ToUnixTimeSeconds() | Out-File $sessionFile -Encoding ASCII -NoNewline
    "DEVELOPMENT" | Out-File $sessionTypeFile -Encoding ASCII -NoNewline
}

try {
    $sessionStart = [long](Get-Content $sessionFile -Raw).Trim()
    $sessionType = if (Test-Path $sessionTypeFile) { (Get-Content $sessionTypeFile -Raw).Trim() } else { "DEVELOPMENT" }
    $currentTime = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $elapsed = $currentTime - $sessionStart
    $elapsedMin = [math]::Floor($elapsed / 60)
    
    $startDateTime = [DateTimeOffset]::FromUnixTimeSeconds($sessionStart)
}
catch {
    Write-ColorOutput "Error reading session data" "Red"
    # Create new session data
    $sessionStart = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $sessionType = "DEVELOPMENT"
    $elapsedMin = 0
    $startDateTime = [DateTimeOffset]::Now
    
    $sessionStart | Out-File $sessionFile -Encoding ASCII -NoNewline
    $sessionType | Out-File $sessionTypeFile -Encoding ASCII -NoNewline
}

Write-Host "========================================="
Write-Host "SESSION TIMER"
Write-Host "========================================="
Write-Host "Session Type: $sessionType"
Write-Host "Started: $($startDateTime.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "Elapsed: $elapsedMin minutes"
Write-Host ""

# Time gates based on session type
$maxTime = switch ($sessionType) {
    "ASSESSMENT" { 30 }
    "DEPLOYMENT" { 60 }
    default { 120 }
}

# Check time gates
if ($elapsedMin -lt 30) {
    Write-ColorOutput "✓ Mock window: $elapsedMin/30 minutes" "Green"
} else {
    Write-ColorOutput "⚠ Mock window expired (30+ minutes)" "Yellow"
}

if ($elapsedMin -gt $maxTime) {
    Write-ColorOutput "✗ SESSION TIME LIMIT EXCEEDED!" "Red"
    Write-ColorOutput "Maximum for $sessionType`: $maxTime minutes" "Red"
    Write-Host ""
    Write-Host "Action required:"
    Write-Host "1. Save your work"
    Write-Host "2. Run .\End-Session.ps1"
    Write-Host "3. Start a new session"
    exit 1
} else {
    $remaining = $maxTime - $elapsedMin
    Write-ColorOutput "Time remaining: $remaining minutes" "Green"
}

Write-Host ""
Write-Host "Gates:"
Write-Host "- Mock timeout: 30 minutes"
Write-Host "- Session limit: $maxTime minutes"
Write-Host "- DRS checks: Every 30 minutes"
Write-Host ""

# Check if DRS check is due
if (($elapsedMin % 30) -eq 0 -and $elapsedMin -gt 0) {
    Write-ColorOutput "⚠ Time for DRS check!" "Yellow"
    Write-Host "Run: .\DRS-Calculate.ps1"
}

# Show session type specific gates
switch ($sessionType) {
    "DEVELOPMENT" {
        Write-Host "Development Gates:"
        if ($elapsedMin -ge 30) {
            Write-ColorOutput "✓ 30m gate - Real services required" "Green"
        } else {
            Write-Host "  30m gate - Real services required"
        }
        
        if ($elapsedMin -ge 60) {
            Write-ColorOutput "✓ 60m gate - One test passing" "Green"
        } else {
            Write-Host "  60m gate - One test passing"
        }
        
        if ($elapsedMin -ge 90) {
            Write-ColorOutput "✓ 90m gate - Error handling complete" "Green"
        } else {
            Write-Host "  90m gate - Error handling complete"
        }
        
        if ($elapsedMin -ge 120) {
            Write-ColorOutput "✓ 120m gate - Ready to deploy" "Green"
        } else {
            Write-Host "  120m gate - Ready to deploy"
        }
    }
    "ASSESSMENT" {
        Write-Host "Assessment Gates:"
        if ($elapsedMin -ge 15) {
            Write-ColorOutput "✓ 15m gate - Initial assessment complete" "Green"
        } else {
            Write-Host "  15m gate - Initial assessment complete"
        }
        
        if ($elapsedMin -ge 30) {
            Write-ColorOutput "⚠ 30m gate - Time limit reached" "Yellow"
        } else {
            Write-Host "  30m gate - Time limit"
        }
    }
    "DEPLOYMENT" {
        Write-Host "Deployment Gates:"
        if ($elapsedMin -ge 20) {
            Write-ColorOutput "✓ 20m gate - Pre-deployment checks" "Green"
        } else {
            Write-Host "  20m gate - Pre-deployment checks"
        }
        
        if ($elapsedMin -ge 40) {
            Write-ColorOutput "✓ 40m gate - Deployment verification" "Green"
        } else {
            Write-Host "  40m gate - Deployment verification"
        }
        
        if ($elapsedMin -ge 60) {
            Write-ColorOutput "⚠ 60m gate - Time limit reached" "Yellow"
        } else {
            Write-Host "  60m gate - Time limit"
        }
    }
}

Write-Host ""

# Additional monitoring suggestions
if ($elapsedMin -gt 0) {
    Write-Host "Monitoring suggestions:"
    Write-Host "  .\DRS-Calculate.ps1    - Check deployability score"
    Write-Host "  .\Check-Scope.ps1      - Verify scope boundaries"
    Write-Host "  .\Detect-Mocks.ps1     - Check for mock usage"
    Write-Host "  .\Can-I-Continue.ps1   - Overall safety check"
    Write-Host ""
}

# Fallback message
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/session-timer.sh" "Yellow"

exit 0