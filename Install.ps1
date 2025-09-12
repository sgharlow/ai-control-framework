# AI Control Framework Installer - PowerShell Version
# Works on Windows, Mac, and Linux with PowerShell Core

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$ProjectDirectory,
    
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Colors for output
if ($PSVersionTable.PSVersion.Major -ge 7 -or $IsWindows -eq $false) {
    $Colors = @{
        Blue = "`e[34m"
        Green = "`e[32m"
        Yellow = "`e[33m"
        Red = "`e[31m"
        Reset = "`e[0m"
    }
} else {
    # Windows PowerShell 5.x
    $Colors = @{
        Blue = ""
        Green = ""
        Yellow = ""
        Red = ""
        Reset = ""
    }
}

# Framework version
$Version = "2.0.0"

Write-Host "$($Colors.Blue)=========================================================$($Colors.Reset)"
Write-Host "$($Colors.Blue)       AI Control Framework Installer v$Version         $($Colors.Reset)"
Write-Host "$($Colors.Blue)=========================================================$($Colors.Reset)"
Write-Host ""

# Resolve project directory path
if ([System.IO.Path]::IsPathRooted($ProjectDirectory)) {
    $ProjectDir = $ProjectDirectory
} else {
    $ProjectDir = Join-Path (Get-Location) $ProjectDirectory
}

# Verify directory exists or create it
if (-not (Test-Path $ProjectDir)) {
    Write-Host "$($Colors.Yellow)Creating project directory: $ProjectDir$($Colors.Reset)"
    New-Item -ItemType Directory -Path $ProjectDir -Force | Out-Null
}

Set-Location $ProjectDir

Write-Host "$($Colors.Green)-> Installing framework in: $(Get-Location)$($Colors.Reset)"
Write-Host ""

# Create directory structure
Write-Host "Creating framework structure..."
$Directories = @(
    "ai-framework",
    "ai-framework/templates",
    "ai-framework/specs",
    "ai-framework/reference",
    "ai-framework/reference/bash",
    "ai-framework/reference/powershell",
    "ai-framework/reference/python",
    "ai-framework/reference/checklists",
    "ai-framework/docs",
    "ai-framework-mcp-server",
    "ai-framework-mcp-server/src",
    "ai-framework-mcp-server/dist",
    "evidence"
)

foreach ($dir in $Directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Define files/directories to exclude
$ExcludePatterns = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    "*.log",
    "*.tmp",
    ".DS_Store",
    "Thumbs.db",
    "package-lock.json",
    "yarn.lock",
    ".env",
    ".env.local"
)

# Function to check if path should be excluded
function Should-Exclude {
    param([string]$Path)
    
    foreach ($pattern in $ExcludePatterns) {
        if ($Path -like "*$pattern*") {
            return $true
        }
    }
    return $false
}

# Function to copy files with exclusions
function Copy-WithExclusions {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    Get-ChildItem -Path $Source -Recurse -Force | ForEach-Object {
        $relativePath = $_.FullName.Substring($Source.Length + 1)
        $targetPath = Join-Path $Destination $relativePath
        
        if (-not (Should-Exclude $relativePath)) {
            if ($_.PSIsContainer) {
                # Create directory if it doesn't exist
                if (-not (Test-Path $targetPath)) {
                    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
                }
            } else {
                # Copy file
                $targetDir = Split-Path $targetPath -Parent
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                Copy-Item -Path $_.FullName -Destination $targetPath -Force
            }
        }
    }
}

# Copy framework files
Write-Host "Copying framework files (excluding node_modules, etc.)..."
$SourceFramework = Join-Path $ScriptDir "ai-framework"

if (Test-Path $SourceFramework) {
    try {
        Copy-WithExclusions -Source $SourceFramework -Destination "ai-framework"
        Write-Host "$($Colors.Green)✓ Framework files copied (with exclusions)$($Colors.Reset)"
    } catch {
        Write-Host "$($Colors.Yellow)Warning: Some files could not be copied: $_$($Colors.Reset)"
    }
} else {
    Write-Host "$($Colors.Red)Error: Source ai-framework directory not found at $SourceFramework$($Colors.Reset)"
    exit 1
}

# Copy MCP server files
Write-Host "Copying MCP server files (excluding node_modules, etc.)..."
$SourceMCPServer = Join-Path $ScriptDir "ai-framework-mcp-server"

if (Test-Path $SourceMCPServer) {
    try {
        Copy-WithExclusions -Source $SourceMCPServer -Destination "ai-framework-mcp-server"
        Write-Host "$($Colors.Green)✓ MCP server files copied (with exclusions)$($Colors.Reset)"
        
        # Check if npm is available and install dependencies
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            Write-Host "Installing MCP server dependencies..."
            Push-Location "ai-framework-mcp-server"
            try {
                npm install --silent 2>$null
                npm run build --silent 2>$null
                Write-Host "$($Colors.Green)OK MCP server built successfully$($Colors.Reset)"
            } catch {
                Write-Host "$($Colors.Yellow)Warning: MCP server build failed. Manual build may be required.$($Colors.Reset)"
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "$($Colors.Yellow)Note: npm not found. Install Node.js to build MCP server.$($Colors.Reset)"
        }
    } catch {
        Write-Host "$($Colors.Yellow)Warning: Some MCP server files could not be copied: $_$($Colors.Reset)"
    }
} else {
    Write-Host "$($Colors.Yellow)Note: MCP server not found at $SourceMCPServer (optional component)$($Colors.Reset)"
}

# Copy CLAUDE.md to project root if it exists
$ClaudeMdSource = Join-Path $ScriptDir "CLAUDE.md"
if (Test-Path $ClaudeMdSource) {
    Copy-Item -Path $ClaudeMdSource -Destination . -Force
    Write-Host "$($Colors.Green)OK CLAUDE.md copied$($Colors.Reset)"
}

# Copy .gitattributes if it exists
$GitAttributesSource = Join-Path $ScriptDir ".gitattributes"
if (Test-Path $GitAttributesSource) {
    Copy-Item -Path $GitAttributesSource -Destination . -Force
    Write-Host "$($Colors.Green)OK .gitattributes copied$($Colors.Reset)"
}

# Make bash scripts executable (if on Unix-like system)
if ($IsLinux -or $IsMacOS) {
    Get-ChildItem -Path "ai-framework/reference/bash" -Filter "*.sh" -ErrorAction SilentlyContinue | ForEach-Object {
        chmod +x $_.FullName 2>$null
    }
}

# Initialize tracking files
if (-not (Test-Path ".contract-hashes")) {
    New-Item -ItemType File -Path ".contract-hashes" -Force | Out-Null
}
if (-not (Test-Path ".drs-score")) {
    Set-Content -Path ".drs-score" -Value "0" -NoNewline
}
if (-not (Test-Path ".drs-history")) {
    New-Item -ItemType File -Path ".drs-history" -Force | Out-Null
}

# Create cross-platform wrapper scripts
Write-Host "Creating wrapper scripts..."

# PowerShell wrapper
$PowerShellWrapperContent = @'
# Cross-platform wrapper for framework checks - PowerShell version
param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("contracts", "mocks", "scope", "drs", "continue", "evidence", "all")]
    [string]$Check,
    
    [Parameter(Position=1)]
    [string]$AdditionalArg
)

$ScriptMap = @{
    "contracts" = "Check-Contracts"
    "mocks" = "Detect-Mocks"
    "scope" = "Check-Scope"
    "drs" = "DRS-Calculate"
    "continue" = "Can-I-Continue"
    "evidence" = "Capture-Evidence"
    "all" = "Can-I-Continue"
}

$ScriptName = $ScriptMap[$Check]

# Try PowerShell first
$PsScript = "ai-framework/reference/powershell/$ScriptName.ps1"
if (Test-Path $PsScript) {
    if ($Check -eq "evidence" -and $AdditionalArg) {
        & $PsScript -Type $AdditionalArg
    } else {
        & $PsScript
    }
    exit $LASTEXITCODE
}

# Fall back to bash
$BashScript = "ai-framework/reference/bash/$($ScriptName.ToLower() -replace '-','_').sh"
if (Test-Path $BashScript) {
    if ($Check -eq "evidence" -and $AdditionalArg) {
        bash $BashScript $AdditionalArg
    } else {
        bash $BashScript
    }
    exit $LASTEXITCODE
}

Write-Host "Error: Script for '$Check' not found"
exit 1
'@
Set-Content -Path "Run-Check.ps1" -Value $PowerShellWrapperContent

# Bash wrapper (already created by install.sh)
if (-not (Test-Path "run-check.sh")) {
    $BashWrapperContent = @'
#!/bin/bash
# Cross-platform wrapper for framework checks

run_script() {
    local script_name="$1"
    shift
    
    # Try different implementations in order
    if [ -f "ai-framework/reference/bash/${script_name}.sh" ]; then
        bash "ai-framework/reference/bash/${script_name}.sh" "$@"
    elif [ -f "ai-framework/reference/powershell/${script_name}.ps1" ] && command -v pwsh &> /dev/null; then
        pwsh -ExecutionPolicy Bypass -File "ai-framework/reference/powershell/${script_name}.ps1" "$@"
    elif [ -f "ai-framework/reference/powershell/${script_name}.ps1" ] && command -v powershell &> /dev/null; then
        powershell -ExecutionPolicy Bypass -File "ai-framework/reference/powershell/${script_name}.ps1" "$@"
    elif command -v python &> /dev/null && [ -f "ai-framework/reference/python/${script_name}.py" ]; then
        python "ai-framework/reference/python/${script_name}.py" "$@"
    else
        echo "Error: Script ${script_name} not found"
        exit 1
    fi
}

case "$1" in
    contracts) run_script check-contracts ;;
    mocks) run_script detect-mocks ;;
    scope) run_script check-scope ;;
    drs) run_script drs-calculate ;;
    continue) run_script can-i-continue ;;
    evidence) shift; run_script capture-evidence "$@" ;;
    all) run_script can-i-continue ;;
    *) echo "Usage: $0 {contracts|mocks|scope|drs|continue|evidence|all}"; exit 1 ;;
esac
'@
    Set-Content -Path "run-check.sh" -Value $BashWrapperContent -NoNewline
    
    if ($IsLinux -or $IsMacOS) {
        chmod +x run-check.sh 2>$null
    }
}

# Create QUICK-REFERENCE.md
$QuickReferenceContent = @'
# AI Control Framework - Quick Reference

## Essential Commands

### Check if safe to continue (PowerShell)
```powershell
.\Run-Check.ps1 continue
```

### Check if safe to continue (Bash)
```bash
./run-check.sh continue
```

### Calculate Deployability Score
```powershell
.\Run-Check.ps1 drs
```

### Run all checks
```powershell
.\Run-Check.ps1 all
```

## Key Prompts for Claude Code

### Start every session with:
```
I'm using the AI Control Framework. 
Read CLAUDE.md and ai-framework/templates/code.md.
Run .\Run-Check.ps1 continue (or ./run-check.sh continue)
```

### When blocked:
```
I'm blocked. Run diagnostics and document per framework prompt F.
```

### To deploy (when DRS ≥ 85):
```
Ready to deploy. Execute framework prompt G for production deployment.
```

## Framework Rules
- Max 5 files per session
- Max 200 lines per session  
- Mocks expire after 30 minutes
- Contracts are frozen (no changes without CCR)
- DRS ≥ 85 required for deployment

## Get Help
- Documentation: ai-framework/docs/
- Prompts: ai-framework/docs/CLAUDE-CODE-PROMPTS.md
- Troubleshooting: .\Run-Check.ps1 all (or ./run-check.sh all)
'@
Set-Content -Path "QUICK-REFERENCE.md" -Value $QuickReferenceContent

# Initialize git hooks if git repo exists
if (Test-Path ".git") {
    Write-Host "$($Colors.Green)Installing git hooks...$($Colors.Reset)"
    
    $HooksDir = ".git/hooks"
    if (-not (Test-Path $HooksDir)) {
        New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
    }
    
    # Pre-commit hook
    $PreCommitHookContent = @'
#!/bin/bash
# AI Control Framework Pre-commit Hook

echo "Running AI Control Framework checks..."

# Run framework checks
if [ -f "Run-Check.ps1" ] && command -v pwsh &> /dev/null; then
    pwsh -ExecutionPolicy Bypass -File Run-Check.ps1 scope
elif [ -f "run-check.sh" ]; then
    ./run-check.sh scope
fi

if [ $? -ne 0 ]; then
    echo "Scope exceeded. Commit aborted."
    exit 1
fi

# Check DRS
if [ -f ".drs-score" ]; then
    DRS=$(cat .drs-score)
    if [ "$DRS" -lt 50 ]; then
        echo "Warning: DRS is low ($DRS/100)"
        echo "Consider improving before commit"
    fi
fi

echo "AI Control checks passed ✓"
'@
    Set-Content -Path "$HooksDir/pre-commit" -Value $PreCommitHookContent -NoNewline
    
    if ($IsLinux -or $IsMacOS) {
        chmod +x "$HooksDir/pre-commit" 2>$null
    }
}

# Create initial session file
$SessionFileContent = @"
# SESSION CONTROL — Read First, Check Often
**Purpose: Current state tracking for AI agents**

## Mission (ONE Thing)

- **Goal:** [TO BE DEFINED - Set specific test/feature goal]
- **Pattern:** [TO BE SELECTED - Choose from patterns.md]
- **Scope:** 5 files max, 200 LOC max

## Contracts (Frozen)

- **Files:** [TO BE DEFINED - List contract files when created]
- **Hash:** [Initialize using appropriate implementation]
- **Status:** AWAITING INITIALIZATION

## Real Services (No Mocks)

- **API Endpoint:** [TO BE CONFIGURED]
- **Auth Service:** [TO BE CONFIGURED]
- **Database:** [TO BE CONFIGURED]
- **Last Real Call:** [NOT YET CONNECTED]

## Deployability Score

- **Current:** 0% (Not initialized)
- **Target:** 100%
- **Blockers:**
  - No contracts defined
  - No real services connected
  - No tests created
- **Next Action:** Define project contracts and goals
- **Time to Deployable:** TBD after initialization

## Stop Conditions (Any = STOP)

- Contract hash mismatch
- Mock detected after 30m
- Scope exceeded (files/LOC)
- Confidence = LOW/BLOCKED
- No real API calls in 10m
"@
Set-Content -Path "ai-framework/templates/code.md" -Value $SessionFileContent

# Final summary
Write-Host ""
Write-Host "$($Colors.Green)=========================================================$($Colors.Reset)"
Write-Host "$($Colors.Green)OK AI Control Framework installed successfully!$($Colors.Reset)"
Write-Host "$($Colors.Green)=========================================================$($Colors.Reset)"
Write-Host ""
Write-Host "Next steps:"
Write-Host ""
Write-Host "1. Open Claude Code in this directory: $ProjectDir"
Write-Host ""
Write-Host "2. Copy and paste this initialization prompt:"
Write-Host ""
Write-Host "$($Colors.Blue)Initialize the AI Control Framework for this project.$($Colors.Reset)"
Write-Host "$($Colors.Blue)Read all template files in ai-framework/templates/$($Colors.Reset)"
Write-Host "$($Colors.Blue)Help me set up: [describe your project]$($Colors.Reset)"
Write-Host ""
Write-Host "3. For every future session, start with:"
Write-Host ""
Write-Host "$($Colors.Blue)I'm using the AI Control Framework.$($Colors.Reset)"
Write-Host "$($Colors.Blue)Read CLAUDE.md and ai-framework/IMPLEMENTATION-GUIDE.md$($Colors.Reset)"
Write-Host "$($Colors.Blue)Perform safety checks using appropriate implementation$($Colors.Reset)"
Write-Host ""
Write-Host "$($Colors.Yellow)Quick reference saved to: QUICK-REFERENCE.md$($Colors.Reset)"
Write-Host "$($Colors.Yellow)Full prompts available in: ai-framework/prompts.md$($Colors.Reset)"
Write-Host ""
if (Test-Path "ai-framework-mcp-server/dist/index.js") {
    Write-Host "$($Colors.Green)MCP Server installed! Configure in your IDE's MCP settings.$($Colors.Reset)"
    Write-Host "$($Colors.Yellow)See ai-framework/MCP-SERVER-INTEGRATION.md for setup.$($Colors.Reset)"
    Write-Host ""
}
Write-Host "Happy disciplined coding!"