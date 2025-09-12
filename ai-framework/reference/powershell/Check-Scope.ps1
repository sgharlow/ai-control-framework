# Scope Control Script - Prevents feature creep
# Enforces: Max 5 files, Max 200 LOC

param()

$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "`e[31m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Reset = "`e[0m"
}

Write-Host "========================================="
Write-Host "SCOPE BOUNDARY CHECK"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "========================================="

# Configuration - Session Type Aware
$SessionType = "DEVELOPMENT"  # Default

# Check for session type in code.md
$CodeMdPath = "ai-framework/templates/code.md"
if (Test-Path $CodeMdPath) {
    $Content = Get-Content $CodeMdPath -Raw
    if ($Content -match "Session Type:\s*(\w+)") {
        $SessionType = $Matches[1].ToUpper()
    }
}

# Set limits based on session type
switch ($SessionType) {
    "ASSESSMENT" {
        $MaxFiles = 0
        $MaxLines = 0
    }
    "DEPLOYMENT" {
        $MaxFiles = 3
        $MaxLines = 50
    }
    default {
        $MaxFiles = 5
        $MaxLines = 200
    }
}

Write-Host "Session Type: $SessionType"

# Check if we're in a git repository
try {
    git rev-parse --git-dir 2>&1 | Out-Null
} catch {
    Write-Host "$($Colors.Yellow)Warning: Not a git repository. Scope check skipped.$($Colors.Reset)"
    exit 0
}

# Check uncommitted changes
Write-Host "Analyzing scope of changes..."

# Get list of changed files
$ChangedFilesRaw = git diff --name-only --diff-filter=ACM 2>$null

# Filter out framework and non-user files
$UserFiles = $ChangedFilesRaw | Where-Object {
    $_ -and
    $_ -notmatch '\.(test|spec|md)$' -and
    $_ -notmatch '^(test|tests|docs|documentation)/' -and
    $_ -notmatch '^ai-framework/' -and
    $_ -notmatch '^DO NOT TOUCH/' -and
    $_ -notmatch '^CLAUDE\.md$' -and
    $_ -notmatch '\.sh$' -and
    $_ -notmatch '^\.contract-hashes$' -and
    $_ -notmatch '^\.drs-' -and
    $_ -notmatch 'FRAMEWORK' -and
    $_ -notmatch 'OPERATIONALIZATION' -and
    $_ -notmatch 'TROUBLESHOOTING'
}

$ChangedFiles = ($UserFiles | Measure-Object).Count

# Get diff statistics
$DiffStat = git diff --stat 2>$null
if ($DiffStat) {
    $LastLine = $DiffStat | Select-Object -Last 1
    
    # Parse insertions and deletions
    $LinesAdded = 0
    $LinesRemoved = 0
    
    if ($LastLine -match '(\d+)\s+insertion') {
        $LinesAdded = [int]$Matches[1]
    }
    if ($LastLine -match '(\d+)\s+deletion') {
        $LinesRemoved = [int]$Matches[1]
    }
    
    $NetLines = $LinesAdded - $LinesRemoved
} else {
    $NetLines = 0
}

Write-Host "User files changed: $ChangedFiles (max: $MaxFiles) [framework files excluded]"
Write-Host "Net lines added: $NetLines (max: $MaxLines)"

# Check violations
$Violations = 0
$ViolationMessages = @()

if ($ChangedFiles -gt $MaxFiles) {
    $Violations = 1
    $ViolationMessages += "  - Too many files: $ChangedFiles > $MaxFiles"
}

if ($NetLines -gt $MaxLines) {
    $Violations = 1
    $ViolationMessages += "  - Too many lines: $NetLines > $MaxLines"
}

# Report results
if ($Violations -eq 0) {
    Write-Host "$($Colors.Green)✓ Within scope boundaries$($Colors.Reset)"
    
    # Show remaining capacity
    $FilesRemaining = $MaxFiles - $ChangedFiles
    $LinesRemaining = $MaxLines - $NetLines
    Write-Host ""
    Write-Host "Remaining capacity:"
    Write-Host "  Files: $FilesRemaining"
    Write-Host "  Lines: $LinesRemaining"
    exit 0
} else {
    Write-Host "$($Colors.Red)✗ SCOPE VIOLATION DETECTED!$($Colors.Reset)"
    foreach ($msg in $ViolationMessages) {
        Write-Host $msg
    }
    Write-Host ""
    Write-Host "Required actions:"
    Write-Host "1. Review changes with: git diff --stat"
    Write-Host "2. Identify non-essential changes"
    Write-Host "3. Revert unnecessary modifications"
    Write-Host "4. Focus on ONE specific goal"
    Write-Host ""
    Write-Host "Use PATTERN-003: Scope Sentinel"
    exit 1
}