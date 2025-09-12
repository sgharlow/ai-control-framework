# Approve-Contract-Change.ps1
# Contract Change Request (CCR) Approval Script
# LAST RESORT - Only use when contract change is absolutely necessary
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
    
    # Final fallback - compute manually (slower but works)
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
Write-Host "CONTRACT CHANGE REQUEST (CCR)"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "========================================="

Write-ColorOutput "⚠ WARNING: Contract changes can break integrations" "Yellow"
Write-Host ""

# Require justification
Write-Host "Please provide justification for contract change:"
Write-Host "(Press Ctrl+C to cancel)"
$justification = Read-Host "Justification"

if ([string]::IsNullOrWhiteSpace($justification)) {
    Write-ColorOutput "✗ Justification required" "Red"
    exit 1
}

# Require impact analysis
Write-Host ""
Write-Host "List affected components (comma-separated):"
$affected = Read-Host "Affected"

if ([string]::IsNullOrWhiteSpace($affected)) {
    Write-ColorOutput "✗ Impact analysis required" "Red"
    exit 1
}

# Backup current hashes
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = ".contract-hashes.backup.$timestamp"

if (Test-Path ".contract-hashes") {
    Copy-Item ".contract-hashes" $backupFile
} else {
    Write-ColorOutput "Warning: No existing contract hashes found" "Yellow"
    New-Item ".contract-hashes" -ItemType File -Force | Out-Null
}

# Log the CCR
$ccrLog = "ccr-log.txt"
$ccrEntry = @"
========================================
CCR Approved: $(Get-Date)
Justification: $justification
Affected Components: $affected
Previous Hash File: $backupFile
========================================

"@

Add-Content -Path $ccrLog -Value $ccrEntry

# Recalculate hashes
Write-Host ""
Write-Host "Recalculating contract hashes..."

$contractFiles = @(
    "api/openapi.yaml",
    "db/schema.sql",
    "api/contracts/*.json",
    "interfaces/*.ts"
)

# Clear the contract hashes file
"" | Out-File ".contract-hashes" -Encoding UTF8 -NoNewline

foreach ($pattern in $contractFiles) {
    if ($pattern.Contains("*")) {
        # Handle wildcards
        $directory = Split-Path $pattern -Parent
        $fileName = Split-Path $pattern -Leaf
        
        if (Test-Path $directory) {
            $files = Get-ChildItem -Path $directory -Filter $fileName -File -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                try {
                    $hash = Get-FileHash-CrossPlatform $file.FullName
                    Add-Content -Path ".contract-hashes" -Value "$($file.FullName): $hash"
                } catch {
                    Write-ColorOutput "Warning: Could not hash $($file.FullName)" "Yellow"
                }
            }
        }
    } else {
        # Direct file
        if (Test-Path $pattern) {
            try {
                $hash = Get-FileHash-CrossPlatform $pattern
                Add-Content -Path ".contract-hashes" -Value "${pattern}: $hash"
            } catch {
                Write-ColorOutput "Warning: Could not hash $pattern" "Yellow"
            }
        }
    }
}

Write-ColorOutput "✓ Contract hashes updated" "Green"

# Reset DRS
"0" | Out-File ".drs-score" -Encoding ASCII -NoNewline
$drsEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): 0 (CCR Reset)"
Add-Content -Path ".drs-history" -Value $drsEntry

# Update code.md if it exists
if (Test-Path "ai-framework/templates/code.md") {
    Write-Host ""
    Write-Host "Updating session control..."
    Write-ColorOutput "⚠ Remember to update code.md with new contract details" "Yellow"
}

# Git commit the change
if (Test-Path ".git") {
    try {
        & git add .contract-hashes $ccrLog 2>$null
        & git commit -m "CCR: $justification" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Changes committed to git" "Green"
        }
    } catch {
        Write-ColorOutput "Warning: Could not commit to git" "Yellow"
    }
}

Write-Host ""
Write-ColorOutput "CONTRACT CHANGE APPROVED" "Green"
Write-Host "Next steps:"
Write-Host "1. Run full regression tests"
Write-Host "2. Update all dependent code"
Write-Host "3. Verify integrations still work"
Write-Host "4. Run ./drs-calculate.sh to measure impact"
Write-Host ""

# Fallback message
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/approve-contract-change.sh" "Yellow"