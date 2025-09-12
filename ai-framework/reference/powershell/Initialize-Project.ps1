# AI Framework Project Initializer
# Sets up a new project with framework compliance

param(
    [string]$ProjectName,
    [string]$ApiEndpoint,
    [string]$DatabaseUrl,
    [string]$Language
)

$Blue = "`e[34m"
$Yellow = "`e[33m"
$Green = "`e[32m"
$Reset = "`e[0m"

Write-Host "${Blue}=========================================${Reset}"
Write-Host "${Blue}AI Framework Project Initializer${Reset}"
Write-Host "${Blue}=========================================${Reset}"
Write-Host ""

# Get project information
if (-not $ProjectName) {
    $ProjectName = Read-Host "Project name"
}
if (-not $ApiEndpoint) {
    $ApiEndpoint = Read-Host "API endpoint (or press Enter for example)"
    if (-not $ApiEndpoint) {
        $ApiEndpoint = "https://api.example.com"
    }
}
if (-not $DatabaseUrl) {
    $DatabaseUrl = Read-Host "Database URL (or press Enter for example)"
    if (-not $DatabaseUrl) {
        $DatabaseUrl = "postgresql://localhost:5432/$ProjectName"
    }
}
if (-not $Language) {
    $Language = Read-Host "Primary language (js/ts/py/cs)"
}

# Create project structure
Write-Host "`n${Yellow}Creating project structure...${Reset}"
New-Item -ItemType Directory -Force -Path src | Out-Null
New-Item -ItemType Directory -Force -Path tests | Out-Null
New-Item -ItemType Directory -Force -Path docs | Out-Null
New-Item -ItemType Directory -Force -Path evidence | Out-Null
New-Item -ItemType Directory -Force -Path config | Out-Null

# Create initial contract files based on language
Write-Host "${Yellow}Creating contract files...${Reset}"
New-Item -ItemType Directory -Force -Path interfaces | Out-Null

switch ($Language) {
    {$_ -in 'js','ts'} {
        $contractContent = @"
// API Contract - DO NOT MODIFY without CCR
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}

export interface UserModel {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}
"@
        Set-Content -Path "interfaces/api.$Language" -Value $contractContent
    }
    'py' {
        $contractContent = @"
# API Contract - DO NOT MODIFY without CCR
from typing import Optional, TypeVar, Generic
from datetime import datetime
from dataclasses import dataclass

T = TypeVar('T')

@dataclass
class ApiResponse(Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    timestamp: float = 0

@dataclass
class UserModel:
    id: str
    email: str
    name: str
    created_at: datetime
"@
        Set-Content -Path "interfaces/api.py" -Value $contractContent
    }
    'cs' {
        $contractContent = @"
// API Contract - DO NOT MODIFY without CCR
using System;

namespace Contracts
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Error { get; set; }
        public long Timestamp { get; set; }
    }

    public class UserModel
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
"@
        Set-Content -Path "interfaces/ApiContracts.cs" -Value $contractContent
    }
}

# Initialize contract hashes
Write-Host "${Yellow}Initializing contract hashes...${Reset}"
Get-ChildItem -Path interfaces -File | ForEach-Object {
    $hash = Get-FileHash -Path $_.FullName -Algorithm SHA256
    "$($hash.Hash)  $($_.Name)" | Add-Content -Path .contract-hashes
}

# Create initial configuration
Write-Host "${Yellow}Creating configuration files...${Reset}"

# Create .env.example
$envContent = @"
# Environment Configuration
NODE_ENV=development
PORT=3000

# API Configuration
API_ENDPOINT=$ApiEndpoint
API_KEY=your-api-key-here

# Database Configuration
DATABASE_URL=$DatabaseUrl

# Security
JWT_SECRET=change-this-secret-key
ENCRYPTION_KEY=change-this-encryption-key

# Monitoring
LOG_LEVEL=info
"@
Set-Content -Path ".env.example" -Value $envContent

# Create initial package.json for JS/TS projects
if ($Language -in 'js','ts') {
    $packageJson = @"
{
  "name": "$ProjectName",
  "version": "0.1.0",
  "description": "AI Framework compliant project",
  "main": "src/index.$Language",
  "scripts": {
    "start": "node src/index.$Language",
    "test": "echo 'No tests yet' && exit 1",
    "lint": "echo 'No linting configured yet'",
    "drs": "powershell ai-framework/reference/powershell/DRS-Calculate.ps1"
  },
  "keywords": ["ai-framework"],
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}
}
"@
    Set-Content -Path "package.json" -Value $packageJson
}

# Create initial README
$readmeContent = @"
# $ProjectName

AI Framework compliant project initialized on $(Get-Date -Format 'yyyy-MM-dd')

## Quick Start

1. Configure your environment:
   ``````bash
   cp .env.example .env
   # Edit .env with your actual values
   ``````

2. Check framework compliance:
   ``````powershell
   .\ai-framework\reference\powershell\DRS-Calculate.ps1
   ``````

3. Start development following AI Framework guidelines

## Framework Compliance

- **DRS Target**: 85/100 for deployment
- **Contract Files**: interfaces/
- **Evidence**: evidence/
- **Max Scope**: 5 files, 200 LOC per session

## Configuration

- **API Endpoint**: $ApiEndpoint
- **Database**: $DatabaseUrl
- **Language**: $Language
"@
Set-Content -Path "README.md" -Value $readmeContent

# Update ai-framework/templates/code.md with project specifics
$codeTemplatePath = "ai-framework/templates/code.md"
if (Test-Path $codeTemplatePath) {
    Write-Host "${Yellow}Updating framework templates...${Reset}"
    $content = Get-Content $codeTemplatePath -Raw
    $content = $content -replace "https://api.example.com", $ApiEndpoint
    $content = $content -replace "postgresql://localhost:5432/dbname", $DatabaseUrl
    $content = $content -replace "Implement core functionality with test coverage", "Build $ProjectName with framework compliance"
    Set-Content -Path $codeTemplatePath -Value $content
}

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "${Yellow}Initializing git repository...${Reset}"
    git init
    git add .
    git commit -m "Initial commit: AI Framework project initialized"
}

# Create initial DRS score
"0" | Set-Content -Path ".drs-score"
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - DRS: 0/100 - Project initialized" | Set-Content -Path ".drs-history"

# Run initial DRS calculation
Write-Host "`n${Yellow}Running initial DRS calculation...${Reset}"
$drsScriptPath = "ai-framework/reference/powershell/DRS-Calculate.ps1"
if (Test-Path $drsScriptPath) {
    try {
        & $drsScriptPath
    } catch {
        Write-Host "DRS calculation completed with warnings"
    }
}

Write-Host ""
Write-Host "${Green}=========================================${Reset}"
Write-Host "${Green}✓ Project initialized successfully!${Reset}"
Write-Host "${Green}=========================================${Reset}"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review and update configuration in .env"
Write-Host "2. Implement your contracts in interfaces/"
Write-Host "3. Start development with: ai-framework/prompts.md"
Write-Host "4. Check compliance with: .\ai-framework\reference\powershell\DRS-Calculate.ps1"
Write-Host ""
Write-Host "Remember:"
Write-Host "- Max 5 files per session"
Write-Host "- Max 200 LOC per session"
Write-Host "- No mocks after 30 minutes"
Write-Host "- DRS ≥ 85 required for deployment"