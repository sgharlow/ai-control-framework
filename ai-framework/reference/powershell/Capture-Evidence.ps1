# Capture-Evidence.ps1
# PowerShell Evidence Capture Script
# Records real API interactions for audit trail
# Cross-platform compatible (Windows/Linux/Mac)

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("api", "db", "test", "perf", "all")]
    [string]$Type,
    
    [Parameter(Position=1)]
    [string]$Endpoint = "",
    
    [Parameter(Position=2)]
    [string]$Method = "GET",
    
    [Parameter(Position=3)]
    [string]$Data = ""
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
            "Blue" { Write-Host $Text -ForegroundColor Blue }
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

function Get-CrossPlatformPath {
    param([string]$Path)
    if ($IsLinux -or $IsMacOS) {
        return $Path -replace '\\', '/'
    }
    return $Path
}

# Configuration
$EvidenceDir = "evidence"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Ensure evidence directory exists
if (-not (Test-Path $EvidenceDir)) {
    New-Item -ItemType Directory -Path $EvidenceDir -Force | Out-Null
}

# Function to capture API response
function Capture-ApiResponse {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Data = ""
    )
    
    $OutputFile = Join-Path $EvidenceDir "${Timestamp}_api_response.json"
    
    Write-ColorOutput "Capturing evidence from: $Endpoint" "Blue"
    Write-ColorOutput "Method: $Method" "Blue"
    
    try {
        # Build parameters for Invoke-RestMethod
        $params = @{
            Uri = $Endpoint
            Method = $Method
            Headers = @{
                'Content-Type' = 'application/json'
                'X-Request-ID' = "trace-$Timestamp"
            }
            TimeoutSec = 30
        }
        
        if ($Data -and $Method -ne "GET") {
            $params.Body = $Data
        }
        
        # Measure execution time
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        try {
            $response = Invoke-RestMethod @params
            $stopwatch.Stop()
            
            # Create response object with metadata
            $responseData = @{
                timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
                endpoint = $Endpoint
                method = $Method
                response = $response
                metadata = @{
                    time_total = $stopwatch.Elapsed.TotalSeconds
                    status = "SUCCESS"
                    correlation_id = "trace-$Timestamp"
                }
            }
            
            # Save response
            $responseData | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
            
            Write-ColorOutput "✓ Evidence captured: $OutputFile" "Green"
            
            # Create summary
            $summaryFile = Join-Path $EvidenceDir "${Timestamp}_summary.txt"
            $sessionMission = if (Test-Path "ai-framework/templates/code.md") {
                (Get-Content "ai-framework/templates/code.md" | Select-String "Mission" -Context 0,1 | Select-Object -Last 1).ToString()
            } else {
                "N/A"
            }
            
            $summary = @"
Evidence Capture Summary
========================
Timestamp: $(Get-Date)
Endpoint: $Endpoint
Method: $Method
Response File: $OutputFile
Session: $sessionMission

Verification:
- Real endpoint contacted: YES
- Response captured: YES
- Correlation ID: trace-$Timestamp
"@
            
            $summary | Out-File -FilePath $summaryFile -Encoding UTF8
            Write-ColorOutput "Summary saved: $summaryFile" "Blue"
            
            return $true
        }
        catch {
            $stopwatch.Stop()
            
            # Save error information
            $errorData = @{
                timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
                endpoint = $Endpoint
                method = $Method
                error = $_.Exception.Message
                metadata = @{
                    time_total = $stopwatch.Elapsed.TotalSeconds
                    status = "ERROR"
                    correlation_id = "trace-$Timestamp"
                }
            }
            
            $errorData | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
            Write-ColorOutput "✗ Failed to capture evidence: $($_.Exception.Message)" "Red"
            return $false
        }
    }
    catch {
        Write-ColorOutput "✗ Failed to capture evidence: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Function to capture database state
function Capture-DbState {
    param([string]$DbUrl)
    
    $OutputFile = Join-Path $EvidenceDir "${Timestamp}_db_state.sql"
    
    Write-ColorOutput "Capturing database state..." "Blue"
    
    # Check for pg_dump
    if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
        try {
            & pg_dump $DbUrl --schema-only | Out-File -FilePath $OutputFile -Encoding UTF8
            Write-ColorOutput "✓ Database schema captured" "Green"
        }
        catch {
            Write-ColorOutput "✗ Failed to capture database state: $($_.Exception.Message)" "Red"
        }
    } else {
        Write-ColorOutput "⚠ pg_dump not available" "Yellow"
    }
}

# Function to capture test results
function Capture-TestResults {
    $OutputFile = Join-Path $EvidenceDir "${Timestamp}_test_results.txt"
    
    Write-ColorOutput "Capturing test results..." "Blue"
    
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            try {
                & npm test *>&1 | Out-File -FilePath $OutputFile -Encoding UTF8
                Write-ColorOutput "✓ Test results captured" "Green"
            }
            catch {
                # Test might fail but we still want to capture the output
                Write-ColorOutput "✓ Test results captured (with failures)" "Yellow"
            }
        } else {
            Write-ColorOutput "⚠ No test script found in package.json" "Yellow"
        }
    } else {
        Write-ColorOutput "⚠ No test suite found" "Yellow"
    }
}

# Function to capture performance metrics
function Capture-Performance {
    param([string]$Endpoint)
    
    $OutputFile = Join-Path $EvidenceDir "${Timestamp}_performance.txt"
    
    Write-ColorOutput "Capturing performance metrics..." "Blue"
    
    $perfData = @"
Performance Test - $(Get-Date)
Endpoint: $Endpoint

"@
    
    # Run 10 requests and measure
    for ($i = 1; $i -le 10; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $null = Invoke-RestMethod -Uri $Endpoint -Method GET -TimeoutSec 10
            $stopwatch.Stop()
            $responseTime = $stopwatch.Elapsed.TotalSeconds
            $perfData += "Request $i`: $([math]::Round($responseTime, 3))s`n"
        }
        catch {
            $perfData += "Request $i`: FAIL`n"
        }
    }
    
    $perfData | Out-File -FilePath $OutputFile -Encoding UTF8
    Write-ColorOutput "✓ Performance metrics captured" "Green"
}

# Main execution
Write-ColorOutput "=========================================" "Blue"
Write-ColorOutput "EVIDENCE CAPTURE" "Blue"
Write-ColorOutput "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Blue"
Write-ColorOutput "=========================================" "Blue"
Write-Host ""

# Execute based on type
switch ($Type) {
    "api" {
        if (-not $Endpoint) {
            Write-ColorOutput "Error: Endpoint required for API evidence capture" "Red"
            Write-Host "Usage: ./Capture-Evidence.ps1 api <endpoint> [method] [data]"
            exit 1
        }
        Capture-ApiResponse -Endpoint $Endpoint -Method $Method -Data $Data
    }
    "db" {
        if (-not $Endpoint) {
            Write-ColorOutput "Error: Database URL required for DB evidence capture" "Red"
            Write-Host "Usage: ./Capture-Evidence.ps1 db <database_url>"
            exit 1
        }
        Capture-DbState -DbUrl $Endpoint
    }
    "test" {
        Capture-TestResults
    }
    "perf" {
        if (-not $Endpoint) {
            Write-ColorOutput "Error: Endpoint required for performance capture" "Red"
            Write-Host "Usage: ./Capture-Evidence.ps1 perf <endpoint>"
            exit 1
        }
        Capture-Performance -Endpoint $Endpoint
    }
    "all" {
        if ($Endpoint) {
            Capture-ApiResponse -Endpoint $Endpoint -Method $Method -Data $Data
            Capture-Performance -Endpoint $Endpoint
        }
        Capture-TestResults
        if ($args.Count -gt 1) {
            Capture-DbState -DbUrl $args[1]
        }
    }
}

# Git commit evidence if in git repo
if (Test-Path ".git") {
    try {
        & git add "$EvidenceDir/${Timestamp}*" 2>$null
        & git commit -m "Evidence: Captured at $Timestamp" 2>$null
    }
    catch {
        # Ignore git errors
    }
}

Write-Host ""
Write-ColorOutput "Evidence directory: $EvidenceDir" "Blue"
Write-ColorOutput "Latest evidence: ${Timestamp}*" "Blue"

# Fallback message
Write-Host ""
Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
Write-ColorOutput "./ai-framework/reference/bash/capture-evidence.sh" "Yellow"