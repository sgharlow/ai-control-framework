# Session-Initializer.ps1
# Session Initialization Script
# Creates session state file for persistence across tool invocations
# Ensures all framework components can coordinate
# Cross-platform compatible (Windows/Linux/Mac)

[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [ValidateSet("ASSESSMENT", "DEVELOPMENT", "DEPLOYMENT", "assessment", "development", "deployment")]
    [string]$SessionType = ""
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

function Get-FileHash-CrossPlatform {
    param([string]$FilePath)
    
    if (Get-Command Get-FileHash -ErrorAction SilentlyContinue) {
        # PowerShell Core or Windows PowerShell 5.1+
        return (Get-FileHash -Path $FilePath -Algorithm SHA256).Hash.ToLower()
    } elseif ($IsLinux -or $IsMacOS) {
        # Linux/Mac fallback
        try {
            $hash = & sha256sum $FilePath 2>$null
            if ($LASTEXITCODE -eq 0) {
                return ($hash -split '\s+')[0]
            }
            # Try shasum as fallback
            $hash = & shasum -a 256 $FilePath 2>$null
            if ($LASTEXITCODE -eq 0) {
                return ($hash -split '\s+')[0]
            }
        } catch {}
    }
    
    # Final fallback - compute manually
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        $hashBytes = $sha256.ComputeHash($bytes)
        return [System.BitConverter]::ToString($hashBytes) -replace '-', '' | ForEach-Object { $_.ToLower() }
    } catch {
        throw "Unable to compute file hash for $FilePath"
    }
}

Write-Host "========================================="
Write-Host "AI CONTROL FRAMEWORK - SESSION INIT"
Write-Host "========================================="

# Get session type from argument or prompt
if ([string]::IsNullOrWhiteSpace($SessionType)) {
    Write-Host "Select session type:"
    Write-Host "  1) ASSESSMENT - Read-only discovery (30 min)"
    Write-Host "  2) DEVELOPMENT - Build features (120 min, default)"
    Write-Host "  3) DEPLOYMENT - Ship to production (60 min)"
    Write-Host ""
    $choice = Read-Host "Enter choice [1-3] (default: 2)"
    
    switch ($choice) {
        "1" { $SessionType = "ASSESSMENT" }
        "3" { $SessionType = "DEPLOYMENT" }
        default { $SessionType = "DEVELOPMENT" }
    }
}

# Validate and normalize session type
$SessionType = $SessionType.ToUpper()
switch ($SessionType) {
    "ASSESSMENT" { }
    "DEVELOPMENT" { }
    "DEPLOYMENT" { }
    default { 
        Write-ColorOutput "Invalid session type. Using DEVELOPMENT" "Yellow"
        $SessionType = "DEVELOPMENT"
    }
}

Write-ColorOutput "Session Type: $SessionType" "Blue"
Write-Host ""

# Check for existing session
if (Test-Path ".session-state") {
    Write-ColorOutput "Warning: Existing session detected" "Yellow"
    
    try {
        $sessionState = @{}
        Get-Content ".session-state" | ForEach-Object {
            if ($_ -match "^([^:]+):\s*(.*)$") {
                $sessionState[$matches[1]] = $matches[2]
            }
        }
        
        $existingStart = $sessionState['SESSION_START']
        Write-Host "Previous session started: $existingStart"
        
        $override = Read-Host "Override existing session? (y/N)"
        
        if ($override -ne "y" -and $override -ne "Y") {
            Write-Host "Keeping existing session. Use .\End-Session.ps1 to close it first."
            exit 1
        }
        
        # Backup old session
        Move-Item ".session-state" ".session-state.backup"
        Write-Host "Previous session backed up to .session-state.backup"
    }
    catch {
        Write-ColorOutput "Error reading existing session, proceeding with new session" "Yellow"
    }
}

# Set session parameters
$maxTime = switch ($SessionType) {
    "ASSESSMENT" { 30; "Read-only discovery mode" }
    "DEPLOYMENT" { 60; "Production deployment mode" }
    default { 120; "Standard development mode" }
}
$description = switch ($SessionType) {
    "ASSESSMENT" { "Read-only discovery mode" }
    "DEPLOYMENT" { "Production deployment mode" }
    default { "Standard development mode" }
}

Write-Host "Initializing $SessionType session..."
Write-Host "- Description: $description"
Write-Host "- Time limit: $maxTime minutes"
Write-Host "- Mock timeout: 30 minutes"
Write-Host ""

# Create session state file
$sessionStart = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
Write-Host "Creating new session state..."

# Calculate mocks allowed until time (30 minutes from now)
$mocksUntil = (Get-Date).AddMinutes(30).ToString("yyyy-MM-ddTHH:mm:ssZ")

$sessionStateContent = @"
# AI Control Framework Session State
# Generated: $sessionStart
# DO NOT EDIT MANUALLY

SESSION_START: $sessionStart
SESSION_TYPE: $SessionType
PATTERN_SELECTED: none
CONFIDENCE: MEDIUM
CONTRACT_HASH: pending
DRS_BASELINE: 0
MOCKS_ALLOWED_UNTIL: $mocksUntil
"@

$sessionStateContent | Out-File ".session-state" -Encoding UTF8

Write-ColorOutput "✓ Session state created" "Green"

# Initialize contract hashes if needed
if (-not (Test-Path ".contract-hashes")) {
    Write-Host ""
    Write-Host "Initializing contract tracking..."
    
    # Find contract files
    $contractPatterns = @(
        "api/openapi.yaml",
        "db/schema.sql", 
        "api/swagger.json",
        "contracts/*.json",
        "schema/*.sql"
    )
    
    $contractFiles = @()
    foreach ($pattern in $contractPatterns) {
        if ($pattern.Contains("*")) {
            # Handle wildcards
            $directory = Split-Path $pattern -Parent
            $fileName = Split-Path $pattern -Leaf
            
            if (Test-Path $directory) {
                $files = Get-ChildItem -Path $directory -Filter $fileName -File -ErrorAction SilentlyContinue
                $contractFiles += $files.FullName
            }
        } else {
            # Direct file
            if (Test-Path $pattern) {
                $contractFiles += $pattern
            }
        }
    }
    
    if ($contractFiles.Count -gt 0) {
        $contractHashContent = @"
# Contract hashes - DO NOT EDIT
# Generated: $sessionStart
"@
        
        foreach ($file in $contractFiles) {
            try {
                $hash = Get-FileHash-CrossPlatform $file
                $contractHashContent += "`n${file}: $hash"
                Write-Host "  Frozen: $file"
            }
            catch {
                Write-ColorOutput "Warning: Could not hash $file" "Yellow"
            }
        }
        
        $contractHashContent | Out-File ".contract-hashes" -Encoding UTF8
        
        # Update session state with combined hash
        try {
            $combinedHash = Get-FileHash-CrossPlatform ".contract-hashes"
            $sessionStateContent = $sessionStateContent -replace "CONTRACT_HASH: pending", "CONTRACT_HASH: $combinedHash"
            $sessionStateContent | Out-File ".session-state" -Encoding UTF8
        }
        catch {
            Write-ColorOutput "Warning: Could not update contract hash in session state" "Yellow"
        }
        
        Write-ColorOutput "✓ Contracts frozen" "Green"
    } else {
        Write-ColorOutput "No contract files found. Define contracts in design.md" "Yellow"
    }
}

# Create required directories
if (-not (Test-Path "evidence")) {
    New-Item -ItemType Directory -Path "evidence" -Force | Out-Null
}
Write-ColorOutput "✓ Evidence directory ready" "Green"

# Set up session-specific configurations
switch ($SessionType) {
    "ASSESSMENT" {
        Write-Host ""
        Write-ColorOutput "ASSESSMENT Session Configuration:" "Blue"
        Write-Host "  • Read-only mode (0 files changed)"
        Write-Host "  • 30-minute time limit"
        Write-Host "  • Run .\Assess-Project.ps1 for analysis"
        
        # Update code.md session type if it exists
        if (Test-Path "ai-framework/templates/code.md") {
            try {
                $codeContent = Get-Content "ai-framework/templates/code.md" -Raw
                $codeContent = $codeContent -replace "Session Type:.*", "Session Type: ASSESSMENT"
                $codeContent | Out-File "ai-framework/templates/code.md" -Encoding UTF8
            }
            catch {
                Write-ColorOutput "Warning: Could not update code.md" "Yellow"
            }
        }
    }
    
    "DEVELOPMENT" {
        Write-Host ""
        Write-ColorOutput "DEVELOPMENT Session Configuration:" "Blue"
        Write-Host "  • Max 5 USER files changed"
        Write-Host "  • Max 200 lines of code"
        Write-Host "  • 120-minute session"
        Write-Host "  • Mocks allowed for 30 minutes"
        
        if (Test-Path "ai-framework/templates/code.md") {
            try {
                $codeContent = Get-Content "ai-framework/templates/code.md" -Raw
                $codeContent = $codeContent -replace "Session Type:.*", "Session Type: DEVELOPMENT"
                $codeContent | Out-File "ai-framework/templates/code.md" -Encoding UTF8
            }
            catch {
                Write-ColorOutput "Warning: Could not update code.md" "Yellow"
            }
        }
    }
    
    "DEPLOYMENT" {
        Write-Host ""
        Write-ColorOutput "DEPLOYMENT Session Configuration:" "Blue"
        Write-Host "  • Max 3 config files changed"
        Write-Host "  • Max 50 lines of code"
        Write-Host "  • 60-minute session"
        Write-Host "  • Focus on production readiness"
        
        if (Test-Path "ai-framework/templates/code.md") {
            try {
                $codeContent = Get-Content "ai-framework/templates/code.md" -Raw
                $codeContent = $codeContent -replace "Session Type:.*", "Session Type: DEPLOYMENT"
                $codeContent | Out-File "ai-framework/templates/code.md" -Encoding UTF8
            }
            catch {
                Write-ColorOutput "Warning: Could not update code.md" "Yellow"
            }
        }
    }
}

# Create session timer script
$sessionTimerContent = @'
#!/usr/bin/env pwsh
# Session timer - shows elapsed time and gates
param()

if (-not (Test-Path ".session-state")) {
    Write-Host "No session state found"
    exit 1
}

$sessionState = @{}
Get-Content ".session-state" | ForEach-Object {
    if ($_ -match "^([^:]+):\s*(.*)$") {
        $sessionState[$matches[1]] = $matches[2]
    }
}

try {
    $startTime = [DateTime]::Parse($sessionState['SESSION_START'])
    $elapsed = [math]::Floor(((Get-Date) - $startTime).TotalMinutes)
    $sessionType = $sessionState['SESSION_TYPE']
    
    Write-Host "Session: $sessionType | Elapsed: ${elapsed}m"
    
    switch ($sessionType) {
        "ASSESSMENT" { 
            if ($elapsed -ge 30) { Write-Host "⚠️  TIME LIMIT REACHED" }
        }
        "DEPLOYMENT" { 
            if ($elapsed -ge 60) { Write-Host "⚠️  TIME LIMIT REACHED" }
        }
        "DEVELOPMENT" {
            if ($elapsed -ge 30) { Write-Host "✓ 30m gate - Real services required" }
            if ($elapsed -ge 60) { Write-Host "✓ 60m gate - One test passing" }
            if ($elapsed -ge 90) { Write-Host "✓ 90m gate - Error handling complete" }
            if ($elapsed -ge 120) { Write-Host "✓ 120m gate - Ready to deploy" }
        }
    }
}
catch {
    Write-Host "Error reading session time"
}
'@

$sessionTimerContent | Out-File ".session-timer.ps1" -Encoding UTF8

# Display session checklist
Write-Host ""
Write-Host "========================================="
Write-ColorOutput "SESSION INITIALIZED SUCCESSFULLY" "Green"
Write-Host "========================================="
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. [ ] Run: .\Assess-Project.ps1"
Write-Host "2. [ ] Select pattern from patterns.md"
Write-Host "3. [ ] Load orchestration.md"
Write-Host "4. [ ] Begin work with confidence declaration"
Write-Host ""
Write-Host "Monitor with:"
Write-Host "  .\.session-timer.ps1     - Check elapsed time and gates"
Write-Host "  .\DRS-Calculate.ps1     - Check deployability score"
Write-Host "  .\Detect-Mocks.ps1      - Verify mock compliance"
Write-Host "  .\Check-Scope.ps1       - Verify scope boundaries"
Write-Host ""
Write-Host "Session commands:"
Write-Host "  Load session: `$state = Get-Content .session-state"
Write-Host "  .\End-Session.ps1      - Close session properly"
Write-Host ""
Write-ColorOutput "Remember: Check orchestration.md every 10 minutes!" "Yellow"
Write-Host "========================================="

# Fallback message
Write-Host ""
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/session-initializer.sh" "Yellow"