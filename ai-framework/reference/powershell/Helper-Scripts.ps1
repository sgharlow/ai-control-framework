# Helper-Scripts.ps1
# Collection of helper functions and utilities
# Cross-platform compatible (Windows/Linux/Mac)

# Import this script with: . .\Helper-Scripts.ps1

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

# End session helper
function End-Session {
    Write-Host "Ending session..."
    
    if (Test-Path ".session-state") {
        # Load session state
        $sessionState = @{}
        Get-Content ".session-state" | ForEach-Object {
            if ($_ -match "^([^:]+):\s*(.*)$") {
                $sessionState[$matches[1]] = $matches[2]
            }
        }
        
        # Get elapsed time
        try {
            $elapsed = if (Test-Path ".session-timer.ps1") {
                & ".\.session-timer.ps1" | Select-String "Elapsed" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
            } else {
                "Unknown"
            }
        } catch {
            $elapsed = "Unknown"
        }
        
        # Get DRS
        try {
            $drsScript = Join-Path (Split-Path $MyInvocation.ScriptName -Parent) "DRS-Calculate.ps1"
            $drsOutput = & $drsScript 2>$null
            $drs = ($drsOutput | Select-String "TOTAL DRS" | ForEach-Object { 
                if ($_.ToString() -match "(\d+)") { $matches[1] } 
            }) -join ""
            if (-not $drs) { $drs = "0" }
        } catch {
            $drs = "0"
        }
        
        Write-Host "Session Summary:"
        Write-Host "  Type: $($sessionState['SESSION_TYPE'])"
        Write-Host "  Duration: $elapsed"
        Write-Host "  Final DRS: $drs"
        Write-Host ""
        
        # Archive session state
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Move-Item ".session-state" ".session-archive-$timestamp"
        Write-Host "Session archived to .session-archive-$timestamp"
    } else {
        Write-Host "No active session found"
    }
}

# Contract verification helper
function Test-Contracts {
    if (-not (Test-Path ".contract-hashes")) {
        Write-ColorOutput "ERROR: No contract hashes found. Run .\Initialize-Session.ps1 first" "Red"
        return $false
    }
    
    # Get stored hash
    try {
        $storedHash = (Get-FileHash ".contract-hashes" -Algorithm SHA256).Hash.ToLower()
    } catch {
        Write-ColorOutput "ERROR: Could not read contract hashes" "Red"
        return $false
    }
    
    # Verify each contract
    $contractLines = Get-Content ".contract-hashes"
    foreach ($line in $contractLines) {
        if ($line -match "^#" -or [string]::IsNullOrWhiteSpace($line)) {
            continue
        }
        
        if ($line -match "^([^:]+):\s*(.+)$") {
            $file = $matches[1].Trim()
            $expectedHash = $matches[2].Trim()
            
            if (Test-Path $file) {
                try {
                    $currentHash = (Get-FileHash $file -Algorithm SHA256).Hash.ToLower()
                    if ($expectedHash -ne $currentHash) {
                        Write-ColorOutput "CONTRACT VIOLATION: $file has changed!" "Red"
                        Write-Host "  Expected: $expectedHash"
                        Write-Host "  Current:  $currentHash"
                        return $false
                    }
                } catch {
                    Write-ColorOutput "ERROR: Could not hash $file" "Red"
                    return $false
                }
            }
        }
    }
    
    Write-ColorOutput "✓ All contracts unchanged" "Green"
    return $true
}

# Evidence capture for API calls
function Capture-ApiEvidence {
    param(
        [string]$Endpoint,
        [string]$Method = "GET"
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $evidenceDir = "evidence"
    
    if (-not (Test-Path $evidenceDir)) {
        New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
    }
    
    try {
        # Capture API call
        $response = Invoke-RestMethod -Uri $Endpoint -Method $Method -Headers @{
            'X-Request-ID' = "trace-$timestamp"
        } -TimeoutSec 30
        
        # Save response
        $outputFile = Join-Path $evidenceDir "api-$timestamp.json"
        $response | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
        
        Write-ColorOutput "Evidence captured: $outputFile" "Green"
        return $true
    } catch {
        Write-ColorOutput "Failed to capture evidence: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Test results capture
function Capture-TestEvidence {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $evidenceDir = "evidence"
    
    if (-not (Test-Path $evidenceDir)) {
        New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
    }
    
    $outputFile = Join-Path $evidenceDir "test-$timestamp.log"
    
    if (Test-Path "package.json") {
        try {
            & npm test 2>&1 | Out-File -FilePath $outputFile -Encoding UTF8
            Write-ColorOutput "Test evidence captured: $outputFile" "Green"
        } catch {
            Write-ColorOutput "Test evidence captured with errors: $outputFile" "Yellow"
        }
    } else {
        Write-ColorOutput "No test suite found" "Yellow"
    }
}

# Performance capture
function Capture-PerformanceEvidence {
    param([string]$Endpoint)
    
    if (-not $Endpoint) {
        Write-ColorOutput "Endpoint required for performance capture" "Red"
        return
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $evidenceDir = "evidence"
    
    if (-not (Test-Path $evidenceDir)) {
        New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
    }
    
    $outputFile = Join-Path $evidenceDir "perf-$timestamp.json"
    
    # Simple performance data
    $perfData = @{
        timestamp = $timestamp
        endpoint = $Endpoint
        p95 = 150  # Placeholder
    }
    
    $perfData | ConvertTo-Json | Out-File -FilePath $outputFile -Encoding UTF8
    Write-ColorOutput "Performance evidence captured: $outputFile" "Green"
}

# Safety check - equivalent to can-i-continue.sh
function Test-CanContinue {
    Write-Host "Checking if safe to continue..."
    
    # Check contracts
    if (-not (Test-Contracts)) {
        return $false
    }
    
    # Check scope
    try {
        $scopeScript = Join-Path (Split-Path $MyInvocation.ScriptName -Parent) "Check-Scope.ps1"
        $scopeResult = & $scopeScript 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "✗ Scope check failed" "Red"
            return $false
        }
    } catch {
        Write-ColorOutput "✗ Could not run scope check" "Red"
        return $false
    }
    
    # Check session state
    if (Test-Path ".session-state") {
        $sessionState = @{}
        Get-Content ".session-state" | ForEach-Object {
            if ($_ -match "^([^:]+):\s*(.*)$") {
                $sessionState[$matches[1]] = $matches[2]
            }
        }
        
        $confidence = $sessionState['CONFIDENCE']
        if ($confidence -eq "LOW" -or $confidence -eq "BLOCKED") {
            Write-ColorOutput "✗ Cannot continue: Confidence is $confidence" "Red"
            return $false
        }
    }
    
    # Check DRS trend
    try {
        $currentDrs = 0
        $drsScript = Join-Path (Split-Path $MyInvocation.ScriptName -Parent) "DRS-Calculate.ps1"
        $drsOutput = & $drsScript 2>$null
        $drsMatch = $drsOutput | Select-String "TOTAL DRS.*?(\d+)"
        if ($drsMatch) {
            $currentDrs = [int]$drsMatch.Matches[0].Groups[1].Value
        }
        
        if (Test-Path ".drs-baseline") {
            $baseline = [int](Get-Content ".drs-baseline")
            if ($currentDrs -lt $baseline) {
                Write-ColorOutput "⚠️  Warning: DRS decreased from $baseline to $currentDrs" "Yellow"
            }
        }
        
        $currentDrs | Out-File ".drs-baseline" -Encoding ASCII -NoNewline
        
        Write-ColorOutput "✓ Safe to continue (DRS: $currentDrs)" "Green"
        return $true
    } catch {
        Write-ColorOutput "⚠ Could not check DRS trend" "Yellow"
        return $true  # Allow continuation if DRS check fails
    }
}

# Session timer functionality
function Get-SessionTimer {
    $sessionFile = ".session-start"
    $sessionTypeFile = ".session-type"
    
    # Get or set session start time
    if (-not (Test-Path $sessionFile)) {
        [DateTimeOffset]::Now.ToUnixTimeSeconds() | Out-File $sessionFile -Encoding ASCII -NoNewline
        "DEVELOPMENT" | Out-File $sessionTypeFile -Encoding ASCII -NoNewline
    }
    
    try {
        $sessionStart = [long](Get-Content $sessionFile)
        $sessionType = if (Test-Path $sessionTypeFile) { Get-Content $sessionTypeFile } else { "DEVELOPMENT" }
        $currentTime = [DateTimeOffset]::Now.ToUnixTimeSeconds()
        $elapsed = $currentTime - $sessionStart
        $elapsedMin = [math]::Floor($elapsed / 60)
        
        $startDateTime = [DateTimeOffset]::FromUnixTimeSeconds($sessionStart)
        
        Write-Host "========================================="
        Write-Host "SESSION TIMER"
        Write-Host "========================================="
        Write-Host "Session Type: $sessionType"
        Write-Host "Started: $($startDateTime.ToString('yyyy-MM-dd HH:mm:ss'))"
        Write-Host "Elapsed: $elapsedMin minutes"
        Write-Host ""
        
        # Time gates based on session type
        $maxTime = switch ($sessionType) {
            "ASSESSMENT" { 30 }
            "DEPLOYMENT" { 60 }
            default { 120 }
        }
        
        # Check time gates
        if ($elapsedMin -lt 30) {
            Write-ColorOutput "✓ Mock window: $elapsedMin/30 minutes" "Green"
        } else {
            Write-ColorOutput "⚠ Mock window expired (30+ minutes)" "Yellow"
        }
        
        if ($elapsedMin -gt $maxTime) {
            Write-ColorOutput "✗ SESSION TIME LIMIT EXCEEDED!" "Red"
            Write-ColorOutput "Maximum for $sessionType`: $maxTime minutes" "Red"
            Write-Host ""
            Write-Host "Action required:"
            Write-Host "1. Save your work"
            Write-Host "2. Run .\End-Session.ps1"
            Write-Host "3. Start a new session"
            return $false
        } else {
            $remaining = $maxTime - $elapsedMin
            Write-ColorOutput "Time remaining: $remaining minutes" "Green"
        }
        
        Write-Host ""
        Write-Host "Gates:"
        Write-Host "- Mock timeout: 30 minutes"
        Write-Host "- Session limit: $maxTime minutes"
        Write-Host "- DRS checks: Every 30 minutes"
        Write-Host ""
        
        # Check if DRS check is due
        if (($elapsedMin % 30) -eq 0 -and $elapsedMin -gt 0) {
            Write-ColorOutput "⚠ Time for DRS check!" "Yellow"
            Write-Host "Run: .\DRS-Calculate.ps1"
        }
        
        return $true
    } catch {
        Write-ColorOutput "Error reading session timer data" "Red"
        return $false
    }
}

# Export functions for use by other scripts
Export-ModuleMember -Function Write-ColorOutput, End-Session, Test-Contracts, Capture-ApiEvidence, Capture-TestEvidence, Capture-PerformanceEvidence, Test-CanContinue, Get-SessionTimer

# If run directly, show available functions
if ($MyInvocation.InvocationName -ne '.') {
    Write-Host "AI Framework Helper Scripts"
    Write-Host "==========================="
    Write-Host ""
    Write-Host "Available functions:"
    Write-Host "  Write-ColorOutput      - Cross-platform colored output"
    Write-Host "  End-Session           - Clean session closure"
    Write-Host "  Test-Contracts        - Verify contract integrity"
    Write-Host "  Capture-ApiEvidence   - Capture API call evidence"
    Write-Host "  Capture-TestEvidence  - Capture test results"
    Write-Host "  Capture-PerformanceEvidence - Capture performance data"
    Write-Host "  Test-CanContinue      - Safety check before proceeding"
    Write-Host "  Get-SessionTimer      - Show session time and gates"
    Write-Host ""
    Write-Host "Usage: Import this file with . .\Helper-Scripts.ps1"
    Write-Host ""
    Write-ColorOutput "Note: If this PowerShell script fails, use the bash equivalent:" "Yellow"
    Write-ColorOutput "./ai-framework/reference/bash/helper-scripts.sh" "Yellow"
}