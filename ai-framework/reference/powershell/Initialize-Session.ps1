# Initialize-Session.ps1
# Initialize Session - Start a new AI coding session
# Part of AI Control Framework v1.1.0
# Cross-platform compatible (Windows/Linux/Mac)

[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [ValidateSet("ASSESSMENT", "DEVELOPMENT", "DEPLOYMENT", "assessment", "development", "deployment")]
    [string]$SessionType = "DEVELOPMENT",
    
    [switch]$Resume
)

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

function Get-CrossPlatformScriptPath {
    param([string]$ScriptName)
    $scriptDir = Split-Path $MyInvocation.ScriptName -Parent
    if ($IsLinux -or $IsMacOS) {
        return Join-Path $scriptDir $ScriptName -Replace '\\', '/'
    }
    return Join-Path $scriptDir $ScriptName
}

function Invoke-CrossPlatformScript {
    param([string]$ScriptPath, [string[]]$Arguments = @())
    
    if ($IsLinux -or $IsMacOS) {
        # Try PowerShell first, fallback to bash
        if (Test-Path $ScriptPath) {
            try {
                & pwsh $ScriptPath @Arguments
                return $LASTEXITCODE -eq 0
            } catch {
                # Fallback to bash equivalent
                $bashScript = $ScriptPath -replace '\.ps1$', '.sh' -replace 'powershell', 'bash'
                if (Test-Path $bashScript) {
                    & bash $bashScript @Arguments
                    return $LASTEXITCODE -eq 0
                }
                return $false
            }
        }
        return $false
    } else {
        # Windows - use PowerShell
        if (Test-Path $ScriptPath) {
            try {
                & $ScriptPath @Arguments
                return $LASTEXITCODE -eq 0
            } catch {
                return $false
            }
        }
        return $false
    }
}

# Handle resume mode
if ($Resume) {
    if (Test-Path ".session-type") {
        $SessionType = Get-Content ".session-type" -Raw
        $SessionType = $SessionType.Trim()
    }
}

# Normalize session type
$SessionType = $SessionType.ToUpper()

Write-ColorOutput "═══════════════════════════════════════════════════════" "Blue"
Write-ColorOutput "        AI CONTROL FRAMEWORK SESSION INITIALIZER        " "Blue"
Write-ColorOutput "                      Version 1.1.0                     " "Blue"
Write-ColorOutput "═══════════════════════════════════════════════════════" "Blue"
Write-Host ""

# Check for existing session
if ((Test-Path ".session-start") -and (-not $Resume)) {
    Write-ColorOutput "⚠ Active session detected" "Yellow"
    Write-Host ""
    
    $existingStart = Get-Content ".session-start" -Raw
    $existingType = if (Test-Path ".session-type") { Get-Content ".session-type" -Raw } else { "UNKNOWN" }
    $existingStart = $existingStart.Trim()
    $existingType = $existingType.Trim()
    
    try {
        $startTime = [DateTimeOffset]::FromUnixTimeSeconds([long]$existingStart)
        $elapsed = [math]::Floor(((Get-Date) - $startTime).TotalMinutes)
        
        Write-Host "Existing session:"
        Write-Host "- Type: $existingType"
        Write-Host "- Started: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))"
        Write-Host "- Elapsed: $elapsed minutes"
    }
    catch {
        Write-Host "Existing session detected (details unavailable)"
    }
    
    Write-Host ""
    Write-Host "Options:"
    Write-Host "1. Continue existing session"
    Write-Host "2. End current and start new"
    Write-Host "3. Cancel"
    Write-Host ""
    
    $choice = Read-Host "Choice (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Host "Continuing existing session..."
            exit 0
        }
        "2" {
            Write-Host "Ending current session..."
            $endSessionScript = Get-CrossPlatformScriptPath "End-Session.ps1"
            Invoke-CrossPlatformScript $endSessionScript
        }
        "3" {
            Write-Host "Cancelled."
            exit 0
        }
        default {
            Write-Host "Invalid choice. Cancelled."
            exit 1
        }
    }
}

# Set session type parameters
switch ($SessionType) {
    "ASSESSMENT" {
        $MaxTime = 30
        $Description = "Read-only discovery mode"
    }
    "DEPLOYMENT" {
        $MaxTime = 60
        $Description = "Production deployment mode"
    }
    default {
        $SessionType = "DEVELOPMENT"
        $MaxTime = 120
        $Description = "Standard development mode"
    }
}

Write-Host "Initializing $SessionType session..."
Write-Host "- Description: $Description"
Write-Host "- Time limit: $MaxTime minutes"
Write-Host "- Mock timeout: 30 minutes"
Write-Host ""

# Initialize session files
$sessionStart = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$sessionStart | Out-File ".session-start" -Encoding ASCII -NoNewline
$SessionType | Out-File ".session-type" -Encoding ASCII -NoNewline
New-Item ".session-active" -ItemType File -Force | Out-Null

# Initialize framework files if needed
if (-not (Test-Path ".contract-hashes")) {
    Write-Host "Initializing contract tracking..."
    New-Item ".contract-hashes" -ItemType File -Force | Out-Null
}

if (-not (Test-Path ".drs-score")) {
    Write-Host "Initializing DRS tracking..."
    "0" | Out-File ".drs-score" -Encoding ASCII -NoNewline
    New-Item ".drs-history" -ItemType File -Force | Out-Null
}

# Run initial checks
Write-Host "Running initial checks..."
Write-Host ""

# Check contracts
Write-Host -NoNewline "Contract integrity... "
$checkContractsScript = Get-CrossPlatformScriptPath "Check-Contracts.ps1"
if (Invoke-CrossPlatformScript $checkContractsScript) {
    Write-ColorOutput "✓" "Green"
} else {
    Write-ColorOutput "⚠ No contracts defined yet" "Yellow"
}

# Check scope
Write-Host -NoNewline "Scope boundaries... "
$checkScopeScript = Get-CrossPlatformScriptPath "Check-Scope.ps1"
if (Invoke-CrossPlatformScript $checkScopeScript) {
    Write-ColorOutput "✓" "Green"
} else {
    Write-ColorOutput "⚠ Check failed" "Yellow"
}

# Check for mocks
Write-Host -NoNewline "Mock detection... "
$detectMocksScript = Get-CrossPlatformScriptPath "Detect-Mocks.ps1"
if (Invoke-CrossPlatformScript $detectMocksScript) {
    Write-ColorOutput "✓" "Green"
} else {
    Write-ColorOutput "⚠ Mocks present" "Yellow"
}

# Calculate initial DRS
Write-Host -NoNewline "DRS calculation... "
$drsScript = Get-CrossPlatformScriptPath "DRS-Calculate.ps1"
try {
    $drsOutput = & $drsScript 2>$null
    $drsMatch = $drsOutput | Select-String "TOTAL DRS.*?(\d+)"
    if ($drsMatch) {
        $drs = $drsMatch.Matches[0].Groups[1].Value
    } else {
        $drs = "0"
    }
    $drs | Out-File ".drs-score" -Encoding ASCII -NoNewline
    Write-ColorOutput "$drs/100" "Yellow"
}
catch {
    $drs = "0"
    $drs | Out-File ".drs-score" -Encoding ASCII -NoNewline
    Write-ColorOutput "0/100" "Yellow"
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
Write-ColorOutput "✓ Session initialized successfully" "Green"
Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
Write-Host ""

# Generate session prompt for Claude
$promptText = @"
Session started: $SessionType mode

Copy this to Claude Code:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I'm using the AI Control Framework.
SESSION TYPE: $SessionType

MANDATORY: Read these files in order:
1. CLAUDE.md - Framework instructions
2. ai-framework/templates/code.md - Session state

Run ./ai-framework/scripts/can-i-continue.sh now.
Only proceed if it returns CONTINUE.

Current DRS: $drs/100 (target: 85+)
Time limit: $MaxTime minutes
Mock timeout: 30 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@

Write-Host $promptText

Write-Host ""
Write-Host "Monitoring commands:"
Write-Host "  ./ai-framework/scripts/session-timer.sh    - Check time"
Write-Host "  ./ai-framework/scripts/drs-calculate.sh     - Check DRS"
Write-Host "  ./ai-framework/scripts/can-i-continue.sh    - Safety check"
Write-Host "  ./ai-framework/scripts/end-session.sh       - End session"
Write-Host ""

# Fallback message
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/initialize-session.sh" "Yellow"

exit 0