# End-Session.ps1
# End Session - Clean session closure with handoff generation
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
                $output = & pwsh $ScriptPath @Arguments 2>&1
                return @{ Success = $LASTEXITCODE -eq 0; Output = $output }
            } catch {
                # Fallback to bash equivalent
                $bashScript = $ScriptPath -replace '\.ps1$', '.sh' -replace 'powershell', 'bash'
                if (Test-Path $bashScript) {
                    $output = & bash $bashScript @Arguments 2>&1
                    return @{ Success = $LASTEXITCODE -eq 0; Output = $output }
                }
                return @{ Success = $false; Output = $_.Exception.Message }
            }
        }
        return @{ Success = $false; Output = "Script not found" }
    } else {
        # Windows - use PowerShell
        if (Test-Path $ScriptPath) {
            try {
                $output = & $ScriptPath @Arguments 2>&1
                return @{ Success = $LASTEXITCODE -eq 0; Output = $output }
            } catch {
                return @{ Success = $false; Output = $_.Exception.Message }
            }
        }
        return @{ Success = $false; Output = "Script not found" }
    }
}

Write-ColorOutput "═══════════════════════════════════════════════════════" "Blue"
Write-ColorOutput "              SESSION CLOSURE PROTOCOL                  " "Blue"
Write-ColorOutput "═══════════════════════════════════════════════════════" "Blue"
Write-Host ""

# Check for active session
if (-not (Test-Path ".session-start")) {
    Write-ColorOutput "No active session found." "Yellow"
    exit 0
}

try {
    $sessionStart = [long](Get-Content ".session-start" -Raw).Trim()
    $sessionType = if (Test-Path ".session-type") { (Get-Content ".session-type" -Raw).Trim() } else { "DEVELOPMENT" }
    $currentTime = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $elapsed = $currentTime - $sessionStart
    $elapsedMin = [math]::Floor($elapsed / 60)
    
    $startDateTime = [DateTimeOffset]::FromUnixTimeSeconds($sessionStart)
    
    Write-Host "Session Summary:"
    Write-Host "- Type: $sessionType"
    Write-Host "- Duration: $elapsedMin minutes"
    Write-Host "- Started: $($startDateTime.ToString('yyyy-MM-dd HH:mm:ss'))"
}
catch {
    Write-ColorOutput "Error reading session data, continuing with closure..." "Yellow"
    $sessionType = "UNKNOWN"
    $elapsedMin = 0
}

Write-Host ""

# Run final checks
Write-Host "Running final checks..."
Write-Host ""

# Check DRS
Write-Host -NoNewline "Final DRS Score: "
if (Test-Path ".drs-score") {
    try {
        $drs = [int](Get-Content ".drs-score" -Raw).Trim()
        if ($drs -ge 85) {
            Write-ColorOutput "$drs/100 - DEPLOYABLE" "Green"
        } elseif ($drs -ge 70) {
            Write-ColorOutput "$drs/100 - NEARLY READY" "Yellow"
        } else {
            Write-ColorOutput "$drs/100 - MORE WORK NEEDED" "Red"
        }
    }
    catch {
        Write-Host "Error reading DRS score"
        $drs = 0
    }
} else {
    Write-Host "Not calculated"
    $drs = 0
}

# Check for uncommitted changes
Write-Host -NoNewline "Git status: "
try {
    $gitStatus = & git status --porcelain 2>$null
    if ($LASTEXITCODE -eq 0) {
        if (-not $gitStatus) {
            Write-ColorOutput "✓ Clean" "Green"
        } else {
            Write-ColorOutput "⚠ Uncommitted changes" "Yellow"
        }
    } else {
        Write-Host "Not a git repository"
    }
}
catch {
    Write-Host "Git not available"
}

# Generate handoff document
$handoffFile = "handoff-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
Write-Host ""
Write-Host "Generating handoff document..."

# Get git log if available
$gitLog = try { 
    & git log --oneline -5 2>$null | Out-String 
} catch { 
    "No commits in this session" 
}

# Get contract hashes if available
$contractInfo = if (Test-Path ".contract-hashes") {
    (Get-Content ".contract-hashes" | Select-Object -First 5) -join "`n"
} else {
    "No contracts defined"
}

# Get changed files if in git repo
$changedFiles = try {
    & git diff --name-only 2>$null | Out-String
} catch {
    "No uncommitted changes"
}

$handoffContent = @"
# Session Handoff Document
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Session Details
- **Type**: $sessionType
- **Duration**: $elapsedMin minutes
- **DRS Score**: $drs/100

## Work Completed
$gitLog

## Current State
### Contracts
$contractInfo

### Changed Files
$changedFiles

## Next Session Recommendations
"@

# Add recommendations based on DRS
if ($drs -ge 85) {
    $handoffContent += "`n- Ready for deployment`n- Run deployment checks"
} elseif ($drs -ge 70) {
    $handoffContent += "`n- Address remaining DRS issues"
    if (Test-Path ".drs-details") {
        $drsIssues = Get-Content ".drs-details" | Select-String "✗|⚠" | Select-Object -First 2
        if ($drsIssues) {
            $handoffContent += "`n- Focus on: $($drsIssues -join '; ')"
        }
    }
} else {
    $handoffContent += "`n- Continue development`n- Priority: Increase DRS score"
}

$handoffContent += @"

## To Resume
``````bash
./ai-framework/scripts/session-initializer.sh --resume
``````
"@

$handoffContent | Out-File -FilePath $handoffFile -Encoding UTF8

Write-ColorOutput "✓ Handoff document created: $handoffFile" "Green"

# Archive session data
Write-Host ""
Write-Host "Archiving session data..."
if (-not (Test-Path ".session-archive")) {
    New-Item -ItemType Directory -Path ".session-archive" -Force | Out-Null
}

try {
    if (Test-Path ".session-start") {
        $sessionStartValue = Get-Content ".session-start" -Raw
        Copy-Item ".session-start" ".session-archive/session-$sessionStartValue.start" -ErrorAction SilentlyContinue
    }
    if (Test-Path ".session-type") {
        $sessionStartValue = Get-Content ".session-start" -Raw
        Copy-Item ".session-type" ".session-archive/session-$sessionStartValue.type" -ErrorAction SilentlyContinue
    }
    if (Test-Path ".drs-score") {
        $sessionStartValue = Get-Content ".session-start" -Raw
        Copy-Item ".drs-score" ".session-archive/session-$sessionStartValue.drs" -ErrorAction SilentlyContinue
    }
}
catch {
    Write-ColorOutput "Warning: Could not archive some session files" "Yellow"
}

# Clean up session files
Write-Host "Cleaning up session files..."
try {
    Remove-Item ".session-start" -ErrorAction SilentlyContinue
    Remove-Item ".session-type" -ErrorAction SilentlyContinue
    Remove-Item ".session-active" -ErrorAction SilentlyContinue
}
catch {
    Write-ColorOutput "Warning: Could not remove some session files" "Yellow"
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
Write-ColorOutput "✓ Session ended successfully" "Green"
Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
Write-Host ""
Write-Host "Session archived. Handoff document: $handoffFile"
Write-Host ""
Write-Host "To start a new session:"
Write-Host "  ./ai-framework/scripts/session-initializer.sh"
Write-Host ""
Write-Host "To resume from handoff:"
Write-Host "  ./ai-framework/scripts/session-initializer.sh --resume"
Write-Host ""

# Fallback message
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/end-session.sh" "Yellow"

exit 0