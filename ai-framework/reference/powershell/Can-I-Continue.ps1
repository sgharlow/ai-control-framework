# Session Continuation Checker
# Determines if AI agent should continue or stop

param()

$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Green = "`e[32m"
    Yellow = "`e[33m"
    Red = "`e[31m"
    Reset = "`e[0m"
}

Write-Host "========================================="
Write-Host "CAN I CONTINUE CHECK"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "========================================="

$Continue = $true
$Warnings = 0
$Errors = 0

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check 1: Contract integrity
Write-Host -NoNewline "1. Contract integrity... "
try {
    $CheckContractsScript = Join-Path $ScriptDir "Check-Contracts.ps1"
    if (Test-Path $CheckContractsScript) {
        & $CheckContractsScript *>&1 | Out-Null
        Write-Host "$($Colors.Green)✓ OK$($Colors.Reset)"
    } else {
        # Fall back to bash script if PS1 doesn't exist
        $BashScript = Join-Path (Split-Path $ScriptDir) "bash/check-contracts.sh"
        if (Test-Path $BashScript) {
            & bash $BashScript 2>&1 | Out-Null
            Write-Host "$($Colors.Green)✓ OK$($Colors.Reset)"
        } else {
            throw "Contract check script not found"
        }
    }
} catch {
    Write-Host "$($Colors.Red)✗ STOP - Contract violation$($Colors.Reset)"
    $Continue = $false
    $Errors++
}

# Check 2: Scope boundaries
Write-Host -NoNewline "2. Scope boundaries... "
try {
    $CheckScopeScript = Join-Path $ScriptDir "Check-Scope.ps1"
    if (Test-Path $CheckScopeScript) {
        & $CheckScopeScript *>&1 | Out-Null
        Write-Host "$($Colors.Green)✓ OK$($Colors.Reset)"
    } else {
        # Fall back to bash script
        $BashScript = Join-Path (Split-Path $ScriptDir) "bash/check-scope.sh"
        if (Test-Path $BashScript) {
            & bash $BashScript 2>&1 | Out-Null
            Write-Host "$($Colors.Green)✓ OK$($Colors.Reset)"
        } else {
            throw "Scope check script not found"
        }
    }
} catch {
    Write-Host "$($Colors.Red)✗ STOP - Scope exceeded$($Colors.Reset)"
    $Continue = $false
    $Errors++
}

# Check 3: Mock time limit
Write-Host -NoNewline "3. Mock time limit... "
try {
    $DetectMocksScript = Join-Path $ScriptDir "Detect-Mocks.ps1"
    if (Test-Path $DetectMocksScript) {
        & $DetectMocksScript *>&1 | Out-Null
        Write-Host "$($Colors.Green)✓ OK$($Colors.Reset)"
    } else {
        # Fall back to bash script
        $BashScript = Join-Path (Split-Path $ScriptDir) "bash/detect-mocks.sh"
        if (Test-Path $BashScript) {
            & bash $BashScript 2>&1 | Out-Null
            Write-Host "$($Colors.Green)✓ OK$($Colors.Reset)"
        } else {
            throw "Mock detection script not found"
        }
    }
} catch {
    $SessionStartFile = "ai-framework/templates/code.md"
    if (Test-Path $SessionStartFile) {
        $FileInfo = Get-Item $SessionStartFile
        $Minutes = [Math]::Floor((Get-Date - $FileInfo.LastWriteTime).TotalMinutes)
        if ($Minutes -gt 30) {
            Write-Host "$($Colors.Red)✗ STOP - Mocks after 30min$($Colors.Reset)"
            $Continue = $false
            $Errors++
        } else {
            Write-Host "$($Colors.Yellow)⚠ Warning - Replace mocks soon$($Colors.Reset)"
            $Warnings++
        }
    }
}

# Check 4: DRS trend
Write-Host -NoNewline "4. DRS trend... "
if (Test-Path ".drs-score") {
    $CurrentDRS = [int](Get-Content ".drs-score" -Raw).Trim()
    if (Test-Path ".drs-history") {
        $History = Get-Content ".drs-history" | Select-Object -Last 2
        if ($History.Count -ge 2) {
            $PreviousLine = $History[0]
            if ($PreviousLine -match '\s+(\d+)') {
                $PreviousDRS = [int]$Matches[1]
                if ($CurrentDRS -lt ($PreviousDRS - 10)) {
                    Write-Host "$($Colors.Red)✗ STOP - DRS declining ($PreviousDRS → $CurrentDRS)$($Colors.Reset)"
                    $Continue = $false
                    $Errors++
                } else {
                    Write-Host "$($Colors.Green)✓ OK (DRS: $CurrentDRS)$($Colors.Reset)"
                }
            } else {
                Write-Host "$($Colors.Green)✓ OK (DRS: $CurrentDRS)$($Colors.Reset)"
            }
        } else {
            Write-Host "$($Colors.Green)✓ OK (DRS: $CurrentDRS)$($Colors.Reset)"
        }
    } else {
        Write-Host "$($Colors.Green)✓ OK (DRS: $CurrentDRS)$($Colors.Reset)"
    }
} else {
    Write-Host "$($Colors.Yellow)⚠ No DRS data$($Colors.Reset)"
    $Warnings++
}

# Check 5: Real API activity
Write-Host -NoNewline "5. Real API activity... "
$EvidenceDir = "evidence"
if (Test-Path $EvidenceDir) {
    $RecentFiles = Get-ChildItem -Path $EvidenceDir -File -Recurse -ErrorAction SilentlyContinue |
                   Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-10) }
    $RecentCount = ($RecentFiles | Measure-Object).Count
    if ($RecentCount -eq 0) {
        Write-Host "$($Colors.Yellow)⚠ No recent API calls (10min)$($Colors.Reset)"
        $Warnings++
    } else {
        Write-Host "$($Colors.Green)✓ OK ($RecentCount recent calls)$($Colors.Reset)"
    }
} else {
    Write-Host "$($Colors.Yellow)⚠ No evidence directory$($Colors.Reset)"
    $Warnings++
}

# Check 6: Session time limits
Write-Host -NoNewline "6. Session duration... "
$SessionStartFile = "ai-framework/templates/code.md"
if (Test-Path $SessionStartFile) {
    $FileInfo = Get-Item $SessionStartFile
    $Minutes = [Math]::Floor((Get-Date - $FileInfo.LastWriteTime).TotalMinutes)
    if ($Minutes -gt 120) {
        Write-Host "$($Colors.Yellow)⚠ Session exceeds 2 hours ($($Minutes)min)$($Colors.Reset)"
        $Warnings++
    } else {
        Write-Host "$($Colors.Green)✓ OK ($($Minutes)min)$($Colors.Reset)"
    }
} else {
    Write-Host "$($Colors.Green)✓ OK$($Colors.Reset)"
}

# Summary
Write-Host ""
Write-Host "========================================="
if ($Continue -and $Warnings -eq 0) {
    Write-Host "$($Colors.Green)RESULT: CONTINUE$($Colors.Reset)"
    Write-Host "All checks passed. Safe to proceed."
    exit 0
} elseif ($Continue -and $Warnings -gt 0) {
    Write-Host "$($Colors.Yellow)RESULT: CONTINUE WITH CAUTION$($Colors.Reset)"
    Write-Host "Warnings: $Warnings - Address these issues soon"
    exit 0
} else {
    Write-Host "$($Colors.Red)RESULT: STOP IMMEDIATELY$($Colors.Reset)"
    Write-Host "Errors: $Errors - Cannot continue"
    Write-Host ""
    Write-Host "Required actions:"
    Write-Host "1. Fix all errors shown above"
    Write-Host "2. Run this check again"
    Write-Host "3. Only proceed when all checks pass"
    exit 1
}