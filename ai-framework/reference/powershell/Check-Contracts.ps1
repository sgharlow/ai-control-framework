# Contract Integrity Check - PowerShell Reference Implementation
# Based on: ai-framework/specs/contract-integrity.md

param(
    [string]$HashFile = ".contract-hashes",
    [string[]]$ContractPatterns = @("api/*.yaml", "api/*.yml", "database/*.sql", "proto/*.proto")
)

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "CONTRACT INTEGRITY CHECK" -ForegroundColor Blue
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Function to get file hash
function Get-ContractHash {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $hash = Get-FileHash -Path $FilePath -Algorithm SHA256
        return $hash.Hash
    }
    return $null
}

# Find all contract files
$contractFiles = @()
foreach ($pattern in $ContractPatterns) {
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    $contractFiles += $files
}

if ($contractFiles.Count -eq 0) {
    Write-Host "No contract files found matching patterns: $($ContractPatterns -join ', ')" -ForegroundColor Yellow
    Write-Host "Define contracts to enable integrity checking." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($contractFiles.Count) contract files" -ForegroundColor Green

# Check if hash file exists
if (-not (Test-Path $HashFile)) {
    Write-Host "WARNING: No contract hashes found. Initializing..." -ForegroundColor Yellow
    
    # Create initial hashes
    $hashes = @{}
    foreach ($file in $contractFiles) {
        $hash = Get-ContractHash -FilePath $file.FullName
        if ($hash) {
            $relativePath = Resolve-Path -Path $file.FullName -Relative
            $hashes[$relativePath] = $hash
            Write-Host "  Hashed: $relativePath" -ForegroundColor Gray
        }
    }
    
    # Save hashes
    $hashes | ConvertTo-Json | Out-File -FilePath $HashFile -Encoding UTF8
    Write-Host "`nContract hashes initialized and frozen." -ForegroundColor Green
    Write-Host "File: $HashFile" -ForegroundColor Gray
    exit 0
}

# Load existing hashes
Write-Host "Checking contract integrity..." -ForegroundColor Cyan
$existingHashes = Get-Content -Path $HashFile | ConvertFrom-Json

# Compare current with stored
$violations = @()
$checked = 0

foreach ($file in $contractFiles) {
    $relativePath = Resolve-Path -Path $file.FullName -Relative
    $currentHash = Get-ContractHash -FilePath $file.FullName
    
    $existingHash = $existingHashes.$relativePath
    
    if (-not $existingHash) {
        $violations += "NEW FILE: $relativePath (not in baseline)"
    }
    elseif ($currentHash -ne $existingHash) {
        $violations += "MODIFIED: $relativePath"
    }
    else {
        $checked++
    }
}

# Check for deleted files
$existingPaths = $existingHashes.PSObject.Properties.Name
foreach ($path in $existingPaths) {
    if (-not (Test-Path $path)) {
        $violations += "DELETED: $path"
    }
}

# Report results
if ($violations.Count -gt 0) {
    Write-Host "`n× CONTRACT VIOLATION DETECTED!" -ForegroundColor Red
    Write-Host "" 
    Write-Host "Changed contracts:" -ForegroundColor Red
    foreach ($violation in $violations) {
        Write-Host "  - $violation" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "STOP: Contract changes require approval" -ForegroundColor Red
    Write-Host "Run Contract Change Request (CCR) process or revert changes" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "✓ All contracts verified ($checked files unchanged)" -ForegroundColor Green
    Write-Host "Contract integrity maintained" -ForegroundColor Green
    exit 0
}

<#
.SYNOPSIS
    Checks contract file integrity to prevent interface drift
    
.DESCRIPTION
    This script implements the contract integrity specification from
    ai-framework/specs/contract-integrity.md
    
.PARAMETER HashFile
    Path to store contract hashes (default: .contract-hashes)
    
.PARAMETER ContractPatterns
    File patterns to check as contracts
    
.EXAMPLE
    .\Check-Contracts.ps1
    
.EXAMPLE
    .\Check-Contracts.ps1 -ContractPatterns @("src/api/*.ts", "schema/*.json")
#>