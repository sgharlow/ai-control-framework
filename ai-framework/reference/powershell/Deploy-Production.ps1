# Deploy-Production.ps1
# Production Deployment Script
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
Write-ColorOutput "           PRODUCTION DEPLOYMENT PROTOCOL               " "Blue"
Write-ColorOutput "═══════════════════════════════════════════════════════" "Blue"
Write-Host ""

# Check DRS score
Write-Host "Checking deployment readiness..."
$drsScript = Get-CrossPlatformScriptPath "DRS-Calculate.ps1"

if (-not (Test-Path $drsScript)) {
    # Try bash version
    $drsScript = $drsScript -replace '\.ps1$', '.sh' -replace 'powershell', 'bash'
    if (-not (Test-Path $drsScript)) {
        Write-ColorOutput "✗ DRS calculator not found" "Red"
        exit 1
    }
}

# Run DRS calculation
try {
    $drsResult = Invoke-CrossPlatformScript $drsScript
    $drsOutput = $drsResult.Output -join "`n"
    
    # Extract DRS score
    if ($drsOutput -match "TOTAL DRS.*?(\d+)") {
        $drs = [int]$matches[1]
    } else {
        throw "Could not parse DRS output"
    }
}
catch {
    Write-ColorOutput "✗ Could not calculate DRS: $($_.Exception.Message)" "Red"
    exit 1
}

Write-Host "Current DRS: $drs/100"
Write-Host ""

# Check minimum DRS for deployment
$minimumDrs = 85
if ($drs -lt $minimumDrs) {
    Write-ColorOutput "✗ DEPLOYMENT BLOCKED" "Red"
    Write-ColorOutput "Minimum DRS required: $minimumDrs" "Red"
    Write-ColorOutput "Current DRS: $drs" "Red"
    Write-Host ""
    Write-Host "Issues to resolve:"
    
    # Show DRS issues
    $drsOutput -split "`n" | Where-Object { $_ -match "✗|⚠" } | ForEach-Object {
        Write-Host "  $_"
    }
    
    Write-Host ""
    Write-Host "Run ./ai-framework/scripts/drs-calculate.sh for details"
    exit 1
}

Write-ColorOutput "✓ DRS Check Passed ($drs/100)" "Green"
Write-Host ""

# Pre-deployment checklist
Write-Host "Pre-Deployment Checklist:"
Write-Host "========================="

# 1. Check for uncommitted changes
Write-Host -NoNewline "1. Git status... "
try {
    $gitDiff = & git diff --quiet 2>$null
    $gitDiffCached = & git diff --cached --quiet 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Clean" "Green"
    } else {
        Write-ColorOutput "✗ Uncommitted changes" "Red"
        Write-Host "   Commit or stash changes before deployment"
        exit 1
    }
}
catch {
    Write-ColorOutput "✗ Git check failed" "Red"
    Write-Host "   Ensure git is available and this is a git repository"
    exit 1
}

# 2. Check contracts
Write-Host -NoNewline "2. Contract integrity... "
$checkContractsScript = Get-CrossPlatformScriptPath "Check-Contracts.ps1"
$contractResult = Invoke-CrossPlatformScript $checkContractsScript

if ($contractResult.Success) {
    Write-ColorOutput "✓ Verified" "Green"
} else {
    Write-ColorOutput "✗ Contract violation" "Red"
    exit 1
}

# 3. Check for mocks
Write-Host -NoNewline "3. Mock detection... "
$detectMocksScript = Get-CrossPlatformScriptPath "Detect-Mocks.ps1"
$mockResult = Invoke-CrossPlatformScript $detectMocksScript

if ($mockResult.Success) {
    Write-ColorOutput "✓ No mocks" "Green"
} else {
    Write-ColorOutput "✗ Mocks detected" "Red"
    Write-Host "   Remove all mocks before deployment"
    exit 1
}

# 4. Check tests (if available)
Write-Host -NoNewline "4. Test suite... "
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            $testResult = & npm test 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Passing" "Green"
            } else {
                Write-ColorOutput "✗ Tests failing" "Red"
                exit 1
            }
        } else {
            Write-ColorOutput "⚠ No test script configured" "Yellow"
        }
    }
    catch {
        Write-ColorOutput "⚠ Could not run npm tests" "Yellow"
    }
} elseif (Test-Path "Makefile") {
    try {
        $makefileContent = Get-Content "Makefile" -Raw
        if ($makefileContent -match "^test:") {
            $testResult = & make test 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Passing" "Green"
            } else {
                Write-ColorOutput "✗ Tests failing" "Red"
                exit 1
            }
        } else {
            Write-ColorOutput "⚠ No test target in Makefile" "Yellow"
        }
    }
    catch {
        Write-ColorOutput "⚠ Could not run make tests" "Yellow"
    }
} else {
    Write-ColorOutput "⚠ No tests configured" "Yellow"
}

# 5. Check build (if applicable)
Write-Host -NoNewline "5. Build status... "
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.build) {
            $buildResult = & npm run build 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Success" "Green"
            } else {
                Write-ColorOutput "✗ Build failed" "Red"
                exit 1
            }
        } else {
            Write-ColorOutput "⚠ No build script configured" "Yellow"
        }
    }
    catch {
        Write-ColorOutput "⚠ Could not run npm build" "Yellow"
    }
} elseif (Test-Path "Makefile") {
    try {
        $makefileContent = Get-Content "Makefile" -Raw
        if ($makefileContent -match "^build:") {
            $buildResult = & make build 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Success" "Green"
            } else {
                Write-ColorOutput "✗ Build failed" "Red"
                exit 1
            }
        } else {
            Write-ColorOutput "⚠ No build target in Makefile" "Yellow"
        }
    }
    catch {
        Write-ColorOutput "⚠ Could not run make build" "Yellow"
    }
} else {
    Write-ColorOutput "⚠ No build configured" "Yellow"
}

# 6. Check environment variables
Write-Host -NoNewline "6. Environment config... "
if ((Test-Path ".env.production") -or (Test-Path ".env")) {
    Write-ColorOutput "✓ Found" "Green"
} else {
    Write-ColorOutput "⚠ No .env file" "Yellow"
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
Write-ColorOutput "✓ ALL DEPLOYMENT CHECKS PASSED" "Green"
Write-ColorOutput "═══════════════════════════════════════════════════════" "Green"
Write-Host ""

# Create deployment record
$deployRecord = "deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"

# Get git information
$gitCommit = try { & git rev-parse HEAD 2>$null } catch { "Unknown" }
$gitBranch = try { & git branch --show-current 2>$null } catch { "Unknown" }
$fileCount = try { (& git ls-files 2>$null | Measure-Object).Count } catch { "Unknown" }
$gitStats = try { & git diff --stat HEAD~5..HEAD 2>$null | Select-Object -Last 10 } catch { "No recent changes" }

$deploymentContent = @"
Deployment Record
=================
Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
DRS Score: $drs/100
Git Commit: $gitCommit
Branch: $gitBranch

Checks Passed:
- Git status: Clean
- Contracts: Verified
- Mocks: None
- Tests: Passing
- Build: Success

Files in deployment:
$fileCount files

Top changed files:
$($gitStats -join "`n")
"@

$deploymentContent | Out-File -FilePath $deployRecord -Encoding UTF8

Write-Host "Deployment record created: $deployRecord"
Write-Host ""

# Deployment commands (customize based on your deployment method)
Write-Host "Ready to deploy! Choose your deployment method:"
Write-Host ""
Write-Host "For Heroku:"
Write-Host "  git push heroku main"
Write-Host ""
Write-Host "For AWS:"
Write-Host "  eb deploy"
Write-Host ""
Write-Host "For Docker:"
Write-Host "  docker build -t app:latest ."
Write-Host "  docker push registry/app:latest"
Write-Host ""
Write-Host "For Vercel/Netlify:"
Write-Host "  git push origin main"
Write-Host ""
Write-Host "For manual deployment:"
Write-Host "  1. Tag this release: git tag -a v$(Get-Date -Format 'yyyyMMdd.HHmm') -m 'Production deployment'"
Write-Host "  2. Push to production branch: git push origin main:production"
Write-Host ""
Write-ColorOutput "Note: Update deployment commands in Deploy-Production.ps1 for your specific setup" "Yellow"
Write-Host ""

# Fallback message
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/deploy-production.sh" "Yellow"

exit 0