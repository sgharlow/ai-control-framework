# Mock Detection Script - Enforces real service usage
# Fails if mocks detected after 30-minute mark

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
Write-Host "MOCK DETECTION SCAN"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "========================================="

# Get session start time from code.md if it exists
$SessionStartFile = "ai-framework/templates/code.md"
if (Test-Path $SessionStartFile) {
    $FileInfo = Get-Item $SessionStartFile
    $Minutes = [Math]::Floor((Get-Date - $FileInfo.LastWriteTime).TotalMinutes)
    Write-Host "Session duration: $Minutes minutes"
} else {
    $Minutes = 0
}

# Define directories to scan (excluding test directories)
$ScanDirs = @(
    "src",
    "lib",
    "app",
    "api",
    "services",
    "components"
)

# Mock indicators to search for
$MockPatterns = @(
    "mock",
    "stub",
    "fake",
    "dummy",
    "test.*data",
    "hardcoded.*response",
    "setTimeout.*simulate",
    "Promise\.resolve.*fake"
)

# Build regex pattern
$Pattern = ($MockPatterns -join "|")

# File extensions to scan
$Extensions = @("*.js", "*.ts", "*.jsx", "*.tsx", "*.py", "*.rb", "*.java", "*.cs", "*.ps1")

# Scan for mocks
Write-Host "Scanning for mock implementations..."
$MockCount = 0
$MockFiles = @()

foreach ($dir in $ScanDirs) {
    if (Test-Path $dir) {
        $Files = Get-ChildItem -Path $dir -Recurse -Include $Extensions -File -ErrorAction SilentlyContinue
        
        foreach ($file in $Files) {
            # Exclude legitimate test files
            if ($file.Name -notmatch '\.(test|spec|mock)\.') {
                $Content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                if ($Content -match "(?i)($Pattern)") {
                    $MockFiles += $file.FullName
                    $MockCount++
                }
            }
        }
    }
}

# Report results
if ($MockCount -eq 0) {
    Write-Host "$($Colors.Green)✓ No mocks detected in production code$($Colors.Reset)"
    exit 0
} else {
    Write-Host "$($Colors.Yellow)⚠ Found $MockCount files with potential mocks:$($Colors.Reset)"
    
    foreach ($file in $MockFiles) {
        Write-Host "  - $file"
        
        # Show first few matching lines
        $Content = Get-Content $file -ErrorAction SilentlyContinue
        if ($Content) {
            $LineNum = 1
            $MatchesShown = 0
            foreach ($line in $Content) {
                if ($line -match "(?i)($Pattern)" -and $MatchesShown -lt 2) {
                    Write-Host "    Line $LineNum`: $line"
                    $MatchesShown++
                }
                $LineNum++
                if ($MatchesShown -ge 2) { break }
            }
        }
    }
    
    # Enforce 30-minute rule
    if ($Minutes -gt 30) {
        Write-Host ""
        Write-Host "$($Colors.Red)✗ VIOLATION: Mocks detected after 30-minute mark!$($Colors.Reset)"
        Write-Host "Required action: Replace all mocks with real service calls"
        Write-Host "Use PATTERN-001: Real Service First"
        exit 1
    } else {
        Write-Host ""
        $Remaining = 30 - $Minutes
        Write-Host "$($Colors.Yellow)Warning: You have $Remaining minutes to replace mocks$($Colors.Reset)"
        exit 0
    }
}