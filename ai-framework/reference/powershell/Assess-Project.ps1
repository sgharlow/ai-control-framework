# Assess-Project.ps1
# Simple Project Assessment Script
# Provides basic project metrics without complex type detection
# EXCLUDES all AI Control Framework files from assessment
# Cross-platform compatible (Windows/Linux/Mac)

[CmdletBinding()]
param()

# Error handling
$ErrorActionPreference = "Continue"  # Allow script to continue on non-critical errors

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

function Count-UserFiles {
    param([string[]]$Extensions)
    
    # Exclusion patterns for framework files
    $excludePatterns = @(
        "*node_modules*",
        "*.git*",
        "*ai-framework*",
        "*DO NOT TOUCH*",
        "*CLAUDE.md",
        "*.sh",
        "*FRAMEWORK*",
        "*OPERATIONALIZATION*",
        "*TROUBLESHOOTING*"
    )
    
    $count = 0
    foreach ($ext in $Extensions) {
        try {
            $files = Get-ChildItem -Path "." -Filter "*$ext" -Recurse -File -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                $shouldExclude = $false
                foreach ($pattern in $excludePatterns) {
                    if ($file.FullName -like $pattern) {
                        $shouldExclude = $true
                        break
                    }
                }
                if (-not $shouldExclude) {
                    $count++
                }
            }
        } catch {
            # Ignore errors from inaccessible directories
        }
    }
    return $count
}

function Count-ConfigFiles {
    $configFiles = @("package.json", "requirements.txt", "Gemfile", "go.mod", "pom.xml", "*.csproj")
    $excludePatterns = @("*ai-framework*", "*DO NOT TOUCH*")
    
    $count = 0
    foreach ($configFile in $configFiles) {
        try {
            if ($configFile.Contains("*")) {
                $files = Get-ChildItem -Path "." -Filter $configFile -Recurse -File -Depth 2 -ErrorAction SilentlyContinue
            } else {
                $files = Get-ChildItem -Path "." -Filter $configFile -Recurse -File -Depth 2 -ErrorAction SilentlyContinue
            }
            
            foreach ($file in $files) {
                $shouldExclude = $false
                foreach ($pattern in $excludePatterns) {
                    if ($file.FullName -like $pattern) {
                        $shouldExclude = $true
                        break
                    }
                }
                if (-not $shouldExclude) {
                    $count++
                }
            }
        } catch {
            # Ignore errors
        }
    }
    return $count
}

function Count-TestFiles {
    $excludePatterns = @(
        "*node_modules*",
        "*.git*",
        "*ai-framework*",
        "*DO NOT TOUCH*",
        "*.sh"
    )
    
    $count = 0
    try {
        $files = Get-ChildItem -Path "." -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
            $_.Name -like "*test*" -or $_.Name -like "*spec*"
        }
        
        foreach ($file in $files) {
            $shouldExclude = $false
            foreach ($pattern in $excludePatterns) {
                if ($file.FullName -like $pattern) {
                    $shouldExclude = $true
                    break
                }
            }
            if (-not $shouldExclude) {
                $count++
            }
        }
    } catch {
        # Ignore errors
    }
    return $count
}

# Header
Write-Host "═══════════════════════════════════════"
Write-Host "PROJECT ASSESSMENT (User Project Only)"
Write-Host "═══════════════════════════════════════"

Write-ColorOutput "🔍 SCANNING USER PROJECT (excluding framework files)..." "Blue"

# Basic File Analysis
Write-Host "📁 FILE ANALYSIS:"

$codeExtensions = @(".js", ".ts", ".py", ".java", ".cs", ".php", ".rb", ".go")
$totalFiles = Count-UserFiles $codeExtensions
Write-Host "   User code files: $totalFiles"

$configFiles = Count-ConfigFiles
Write-Host "   User config files: $configFiles"

$testFiles = Count-TestFiles
Write-Host "   User test files: $testFiles"

# Git Status
Write-Host ""
Write-Host "📊 GIT STATUS:"
if (Test-Path ".git") {
    try {
        $gitStatus = & git status --porcelain 2>$null
        if ($LASTEXITCODE -eq 0) {
            $uncommitted = ($gitStatus | Measure-Object).Count
            Write-Host "   Uncommitted changes: $uncommitted"
            
            $lastCommit = & git log -1 --format="%cr" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   Last commit: $lastCommit"
            } else {
                Write-Host "   Last commit: No commits"
            }
        } else {
            Write-Host "   Git status: Unable to read"
        }
    } catch {
        Write-Host "   Git status: Error accessing git"
    }
} else {
    Write-Host "   Not a git repository"
}

# Build Status
Write-Host ""
Write-Host "🔧 BUILD STATUS:"
if (Test-Path "package.json") {
    if (Test-Path "node_modules") {
        Write-Host "   Node.js: Dependencies installed ✓"
    } else {
        Write-Host "   Node.js: Dependencies missing ✗"
    }
} elseif (Test-Path "requirements.txt") {
    Write-Host "   Python: requirements.txt found"
} elseif (Test-Path "Gemfile") {
    Write-Host "   Ruby: Gemfile found"
} elseif (Test-Path "go.mod") {
    Write-Host "   Go: go.mod found"
} else {
    Write-Host "   Build system: Not detected"
}

# Test Status
Write-Host ""
Write-Host "🧪 TEST STATUS:"
if ($testFiles -gt 0) {
    Write-Host "   Test files present: ✓ ($testFiles files)"
    
    # Try to detect if tests are runnable
    if (Test-Path "package.json") {
        try {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            if ($packageJson.scripts.test) {
                Write-Host "   Test script configured: ✓"
            } else {
                Write-Host "   Test script: Not configured"
            }
        } catch {
            Write-Host "   Test script: Unable to parse package.json"
        }
    } elseif (Test-Path "Makefile") {
        try {
            $makefileContent = Get-Content "Makefile" -Raw
            if ($makefileContent -match "test:") {
                Write-Host "   Test target in Makefile: ✓"
            } else {
                Write-Host "   Test runner: Unknown"
            }
        } catch {
            Write-Host "   Test runner: Unknown"
        }
    } else {
        Write-Host "   Test runner: Unknown"
    }
} else {
    Write-Host "   Test files: None found ✗"
}

# Completion Estimate
Write-Host ""
Write-Host "📈 COMPLETION ESTIMATE:"
$completionScore = 0

# Basic scoring
if ($totalFiles -gt 0) {
    $completionScore += 20
}

if ($configFiles -gt 0) {
    $completionScore += 20
}

if ($testFiles -gt 0) {
    $completionScore += 30
}

# Git cleanliness check
try {
    if (Test-Path ".git") {
        $gitStatus = & git status --porcelain 2>$null
        if ($LASTEXITCODE -eq 0 -and (-not $gitStatus)) {
            $completionScore += 15
        }
    }
} catch {
    # Ignore git errors for scoring
}

# Check for user README (not framework README)
$userReadme = $false
if (Test-Path "README.md") {
    try {
        $readmeContent = Get-Content "README.md" -Raw
        if ($readmeContent -notmatch "AI Control Framework") {
            $userReadme = $true
        }
    } catch {
        # Assume it's a user README if we can't read it
        $userReadme = $true
    }
} elseif (Test-Path "readme.md") {
    try {
        $readmeContent = Get-Content "readme.md" -Raw
        if ($readmeContent -notmatch "AI Control Framework") {
            $userReadme = $true
        }
    } catch {
        $userReadme = $true
    }
}

if ($userReadme) {
    $completionScore += 15
}

Write-Host "   Estimated completion: ${completionScore}%"

# Recommendations
Write-Host ""
Write-Host "💡 RECOMMENDED SESSION TYPE:"
if ($completionScore -lt 30) {
    Write-Host "   DEVELOPMENT - Project needs significant work"
} elseif ($completionScore -lt 70) {
    Write-Host "   DEVELOPMENT - Continue building features"
} elseif ($completionScore -lt 90) {
    Write-Host "   ASSESSMENT - Verify completeness, then DEPLOYMENT"
} else {
    Write-Host "   ASSESSMENT - Project appears complete, verify status"
}

Write-Host ""
Write-Host "⚠️  POTENTIAL ISSUES:"
if ($testFiles -eq 0) {
    Write-Host "   - No test files detected"
}

try {
    if (Test-Path ".git") {
        $gitStatus = & git status --porcelain 2>$null
        if ($LASTEXITCODE -eq 0) {
            $uncommittedCount = ($gitStatus | Measure-Object).Count
            if ($uncommittedCount -gt 5) {
                Write-Host "   - Many uncommitted changes ($uncommittedCount)"
            }
        }
    }
} catch {
    # Ignore git errors
}

if ($totalFiles -gt 50) {
    Write-Host "   - Large codebase (>50 files) - consider focused sessions"
}

Write-Host "═══════════════════════════════════════"

# Fallback message
Write-Host ""
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/assess-project.sh" "Yellow"