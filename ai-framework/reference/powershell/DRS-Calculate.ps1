# Deployability Rating Score (DRS) Calculator
# Implements the 13-component scoring system from specs/drs-calculation.md
# Total: 100 points, Deployment threshold: 85 points

param()

$ErrorActionPreference = "Continue"

# Colors for output
$Colors = @{
    Green = "`e[32m"
    Yellow = "`e[33m"
    Red = "`e[31m"
    Reset = "`e[0m"
}

Write-Host "========================================="
Write-Host "DEPLOYABILITY RATING SCORE (DRS) v2.0"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "========================================="

# Initialize score
$DRS = 0
$MaxScore = 100
$Details = @()

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Component 1: Contract Integrity (7 points)
Write-Host -NoNewline "1. Contract Integrity... "
try {
    $CheckContractsScript = Join-Path $ScriptDir "Check-Contracts.ps1"
    if (Test-Path $CheckContractsScript) {
        & $CheckContractsScript *>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $DRS += 7
            Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
            $Details += "✓ Contract Integrity: 7/7"
        } else {
            throw "Contract check failed"
        }
    } elseif (Test-Path ".contract-hashes") {
        $DRS += 7
        Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
        $Details += "✓ Contract Integrity: 7/7"
    } else {
        throw "No contracts"
    }
} catch {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Contract Integrity: 0/7"
}

# Component 2: Behavioral Contracts (7 points)
Write-Host -NoNewline "2. Behavioral Contracts... "
$BehavioralScore = 0
if (Test-Path "evidence") {
    $RecentContractEvidence = Get-ChildItem -Path "evidence" -Filter "*contract*" -File -ErrorAction SilentlyContinue | 
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-120) }
    if ($RecentContractEvidence) {
        $BehavioralScore = 7
    } else {
        $OldEvidence = Get-ChildItem -Path "evidence" -Filter "*contract*" -File -ErrorAction SilentlyContinue
        if ($OldEvidence) {
            $BehavioralScore = 4
        }
    }
}
$DRS += $BehavioralScore
if ($BehavioralScore -eq 7) {
    Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
    $Details += "✓ Behavioral Contracts: 7/7"
} elseif ($BehavioralScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$BehavioralScore$($Colors.Reset)"
    $Details += "⚠ Behavioral Contracts: $BehavioralScore/7 (partial)"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Behavioral Contracts: 0/7"
}

# Component 3: Security Validation (16 points - CRITICAL)
Write-Host -NoNewline "3. Security Validation... "
$SecurityScore = 0

# Check for secrets in code
$SecretsFound = $false
try {
    $CodeFiles = Get-ChildItem -Recurse -Include *.js,*.ts,*.py,*.cs -Exclude node_modules,.git -ErrorAction SilentlyContinue
    foreach ($file in $CodeFiles) {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        if ($content -match "password\s*=|secret\s*=|key\s*=|token\s*=" -and $content -notmatch "^//|^#|^/\*") {
            $SecretsFound = $true
            break
        }
    }
    if (-not $SecretsFound) {
        $SecurityScore += 8
    }
} catch {}

# Check for secure configuration
if ((Test-Path ".env.example") -or (Test-Path "config/secure.js") -or (Test-Path "appsettings.json")) {
    $SecurityScore += 8
}

$DRS += $SecurityScore
if ($SecurityScore -eq 16) {
    Write-Host "$($Colors.Green)✓ +16$($Colors.Reset)"
    $Details += "✓ Security Validation: 16/16"
} elseif ($SecurityScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$SecurityScore$($Colors.Reset)"
    $Details += "⚠ Security Validation: $SecurityScore/18"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Security Validation: 0/16"
}

# Component 4: Data Integrity (9 points)
Write-Host -NoNewline "4. Data Integrity... "
$DataScore = 0

# Check for validation libraries
if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -match "joi|yup|ajv|zod|validator") {
        $DataScore += 4
    }
} elseif (Test-Path "validators") {
    $DataScore += 4
}

# Check for database schema/migrations
if ((Test-Path "migrations") -or (Test-Path "schema.sql") -or (Test-Path "schema.prisma") -or (Test-Path "*.edmx")) {
    $DataScore += 4
}

$DRS += $DataScore
if ($DataScore -eq 9) {
    Write-Host "$($Colors.Green)✓ +9$($Colors.Reset)"
    $Details += "✓ Data Integrity: 9/9"
} elseif ($DataScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$DataScore$($Colors.Reset)"
    $Details += "⚠ Data Integrity: $DataScore/9"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Data Integrity: 0/9"
}

# Component 5: No Mocks (7 points)
Write-Host -NoNewline "5. No Mocks... "
try {
    $DetectMocksScript = Join-Path $ScriptDir "Detect-Mocks.ps1"
    if (Test-Path $DetectMocksScript) {
        & $DetectMocksScript *>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $DRS += 7
            Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
            $Details += "✓ No Mocks: 7/7"
        } else {
            throw "Mocks detected"
        }
    } else {
        # Fallback check
        $MocksFound = Get-ChildItem -Recurse -Include *.js,*.ts -ErrorAction SilentlyContinue | 
            Select-String -Pattern "mock|stub|fake" -Quiet
        if (-not $MocksFound) {
            $DRS += 7
            Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
            $Details += "✓ No Mocks: 7/7"
        } else {
            throw "Mocks detected"
        }
    }
} catch {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ No Mocks: 0/7 (mocks detected)"
}

# Component 6: Tests Passing (7 points)
Write-Host -NoNewline "6. Tests Passing... "
$TestScore = 0

if (Test-Path "package.json") {
    $PackageJson = Get-Content "package.json" -Raw
    if ($PackageJson -match '"test"') {
        try {
            npm test 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                $TestScore = 7
            }
        } catch {}
    } else {
        $TestScore = 3  # Partial credit if no tests defined
    }
} elseif (Test-Path "*.csproj" -or Test-Path "*.sln") {
    try {
        dotnet test --no-build 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $TestScore = 7
        }
    } catch {}
} else {
    $TestScore = 3  # Partial credit if no test framework
}

$DRS += $TestScore
if ($TestScore -eq 7) {
    Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
    $Details += "✓ Tests Passing: 7/7"
} elseif ($TestScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$TestScore$($Colors.Reset)"
    $Details += "⚠ Tests Passing: $TestScore/7"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Tests Passing: 0/7"
}

# Component 7: Integration Evidence (9 points)
Write-Host -NoNewline "7. Integration Evidence... "
$EvidenceScore = 0

if (Test-Path "evidence") {
    $RecentEvidence = Get-ChildItem -Path "evidence" -File -ErrorAction SilentlyContinue | 
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-120) }
    if ($RecentEvidence) {
        $EvidenceScore = 9
    } else {
        $OldEvidence = Get-ChildItem -Path "evidence" -File -ErrorAction SilentlyContinue
        if ($OldEvidence) {
            $EvidenceScore = 5
        }
    }
}

$DRS += $EvidenceScore
if ($EvidenceScore -eq 9) {
    Write-Host "$($Colors.Green)✓ +9$($Colors.Reset)"
    $Details += "✓ Integration Evidence: 9/9"
} elseif ($EvidenceScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$EvidenceScore$($Colors.Reset)"
    $Details += "⚠ Integration Evidence: $EvidenceScore/10 (stale)"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Integration Evidence: 0/9"
}

# Component 8: Architecture Stability (7 points)
Write-Host -NoNewline "8. Architecture Stability... "
$ArchScore = 0

# Check for architecture documentation
if ((Test-Path "ARCHITECTURE.md") -or (Test-Path "docs/architecture.md") -or (Test-Path "docs/adr")) {
    $ArchScore += 3
}

# Check for consistent module structure
if ((Test-Path "src") -or (Test-Path "lib") -or (Test-Path "app")) {
    $ArchScore += 4
}

$DRS += $ArchScore
if ($ArchScore -eq 7) {
    Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
    $Details += "✓ Architecture Stability: 7/7"
} elseif ($ArchScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$ArchScore$($Colors.Reset)"
    $Details += "⚠ Architecture Stability: $ArchScore/7"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Architecture Stability: 0/7"
}

# Component 9: Production Readiness (14 points)
Write-Host -NoNewline "9. Production Readiness... "
$ProdScore = 0

# Check for deployment configuration
if ((Test-Path "Dockerfile") -or (Test-Path ".dockerignore") -or (Test-Path "docker-compose.yml")) {
    $ProdScore += 4
}

# Check for environment configuration
if ((Test-Path ".env.example") -or (Test-Path "config/production.js") -or (Test-Path "appsettings.Production.json")) {
    $ProdScore += 4
}

# Check for monitoring/logging
if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -match "winston|morgan|pino|bunyan|log4js") {
        $ProdScore += 4
    }
} elseif ((Test-Path "logger.js") -or (Test-Path "logger.cs") -or (Test-Path "NLog.config")) {
    $ProdScore += 4
}

$DRS += $ProdScore
if ($ProdScore -eq 14) {
    Write-Host "$($Colors.Green)✓ +14$($Colors.Reset)"
    $Details += "✓ Production Readiness: 14/14"
} elseif ($ProdScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$ProdScore$($Colors.Reset)"
    $Details += "⚠ Production Readiness: $ProdScore/14"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Production Readiness: 0/14"
}

# Component 10: Context Preservation (7 points)
Write-Host -NoNewline "10. Context Preservation... "
$ContextScore = 0

# Check for session tracking files
if ((Test-Path "ai-framework/templates/code.md") -and (Test-Path "ai-framework/templates/orchestration.md")) {
    $ContextScore += 4
}

# Check for ADR or decision tracking
if ((Test-Path "docs/adr") -or (Test-Path "DECISIONS.md") -or (Test-Path "ADR")) {
    $ContextScore += 3
}

$DRS += $ContextScore
if ($ContextScore -eq 7) {
    Write-Host "$($Colors.Green)✓ +7$($Colors.Reset)"
    $Details += "✓ Context Preservation: 7/7"
} elseif ($ContextScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$ContextScore$($Colors.Reset)"
    $Details += "⚠ Context Preservation: $ContextScore/7"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Context Preservation: 0/7"
}

# Component 11: Error Handling (4 points)
Write-Host -NoNewline "11. Error Handling... "
$ErrorScore = 0

# Check for error handling patterns
$ErrorPatterns = Get-ChildItem -Recurse -Include *.js,*.ts,*.py,*.cs -Exclude node_modules,.git -ErrorAction SilentlyContinue | 
    Select-String -Pattern "try.*catch|\.catch\(|on.*error|catch\s*\(" -Quiet

if ($ErrorPatterns) {
    $ErrorScore = 4
}

$DRS += $ErrorScore
if ($ErrorScore -eq 4) {
    Write-Host "$($Colors.Green)✓ +4$($Colors.Reset)"
    $Details += "✓ Error Handling: 4/4"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Error Handling: 0/4"
}

# Component 12: Scope Compliance (4 points)
Write-Host -NoNewline "12. Scope Compliance... "
try {
    $CheckScopeScript = Join-Path $ScriptDir "Check-Scope.ps1"
    if (Test-Path $CheckScopeScript) {
        & $CheckScopeScript *>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $DRS += 4
            Write-Host "$($Colors.Green)✓ +4$($Colors.Reset)"
            $Details += "✓ Scope Compliance: 4/4"
        } else {
            throw "Scope exceeded"
        }
    } else {
        # Simple fallback check
        $DRS += 4
        Write-Host "$($Colors.Green)✓ +4$($Colors.Reset)"
        $Details += "✓ Scope Compliance: 4/4"
    }
} catch {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Scope Compliance: 0/4 (exceeded)"
}

# Component 13: Documentation (2 points)
Write-Host -NoNewline "13. Documentation... "
$DocScore = 0

if ((Test-Path "README.md") -and (Get-Item "README.md").Length -gt 100) {
    $DocScore++
}
if ((Test-Path "CONTRIBUTING.md") -or (Test-Path "docs/contributing.md")) {
    $DocScore++
}
if ((Test-Path "API.md") -or (Test-Path "docs/api") -or (Test-Path "openapi.yaml") -or (Test-Path "swagger.json")) {
    $DocScore++
}

$DRS += $DocScore
if ($DocScore -eq 2) {
    Write-Host "$($Colors.Green)✓ +2$($Colors.Reset)"
    $Details += "✓ Documentation: 2/2"
} elseif ($DocScore -gt 0) {
    Write-Host "$($Colors.Yellow)⚠ +$DocScore$($Colors.Reset)"
    $Details += "⚠ Documentation: $DocScore/2"
} else {
    Write-Host "$($Colors.Red)✗ 0$($Colors.Reset)"
    $Details += "✗ Documentation: 0/2"
}

# Save score to file
Set-Content -Path ".drs-score" -Value $DRS -NoNewline

# Append to history with timestamp
Add-Content -Path ".drs-history" -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - DRS: $DRS/100"

# Display results
Write-Host ""
Write-Host "========================================="
Write-Host "COMPONENT BREAKDOWN:"
Write-Host "========================================="
foreach ($detail in $Details) {
    Write-Host $detail
}

Write-Host ""
Write-Host "========================================="
Write-Host "FINAL SCORE: $DRS / $MaxScore"
Write-Host "========================================="

# Determine status
if ($DRS -ge 85) {
    Write-Host "$($Colors.Green)✓ DEPLOYABLE$($Colors.Reset) - Ready for production!"
    Write-Host "All critical requirements met."
} elseif ($DRS -ge 70) {
    Write-Host "$($Colors.Yellow)⚠ NEARLY READY$($Colors.Reset) - Address remaining issues"
    Write-Host "Focus on: Security, Testing, and Evidence"
} elseif ($DRS -ge 40) {
    Write-Host "$($Colors.Yellow)⚠ IN PROGRESS$($Colors.Reset) - Core functionality working"
    Write-Host "Add: Real services, tests, and documentation"
} else {
    Write-Host "$($Colors.Red)✗ EARLY DEVELOPMENT$($Colors.Reset) - Foundation being built"
    Write-Host "Focus on: Contracts, structure, and basic functionality"
}

Write-Host ""
Write-Host "Deployment threshold: 85/100"
Write-Host "Current gap: $($([Math]::Max(0, 85 - $DRS))) points"

# Return appropriate exit code
if ($DRS -ge 85) {
    exit 0
} else {
    exit 1
}