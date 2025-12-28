# Getting Started with AI Control Framework

## What is This Framework?

The AI Control Framework enforces discipline in AI-assisted development through:
- **Contract Freezing** - Prevents interface drift
- **Mock Timeout** - Forces real service integration within 30 minutes
- **Scope Control** - Limits changes to 5 files/200 lines per session
- **DRS Scoring** - Objective 0-100 deployability measure

## Quick Start (2 Minutes)

### 1. Install Framework
```bash
git clone https://github.com/yourusername/ai-control-framework.git
cd ai-control-framework
./install.sh /path/to/your/project
```

### 2. Choose Your Implementation

The framework uses a **"Specification-First, Implementation-Flexible"** approach:

```
Can you run Bash scripts?
├─ YES → Use reference/bash/
├─ NO → Windows? → Use reference/powershell/
├─ NO → Use reference/python/
└─ NOTHING WORKS → Use reference/checklists/
```

### 3. Start Your First Session

```
I'm using the AI Control Framework v2.0.0

CRITICAL: First read ai-framework/IMPLEMENTATION-GUIDE.md
Then read CLAUDE.md and ai-framework/templates/code.md

Perform safety checks per ai-framework/specs/
Use implementation appropriate for my environment.
```

## Core Concepts

### Session Types
- **ASSESSMENT** - Read-only discovery (30 min max)
- **DEVELOPMENT** - Active coding (5 files, 200 lines, 120 min max)
- **DEPLOYMENT** - Production prep (3 files, 100 lines, 60 min max)

### The Four Disciplines

1. **Contract Integrity** ([specs/contract-integrity.md](../specs/contract-integrity.md))
   - Interfaces locked with SHA256 hashes
   - No changes without formal approval

2. **Mock Detection** ([specs/mock-detection.md](../specs/mock-detection.md))
   - 30-minute grace period for exploration
   - Must use real services after timeout

3. **Scope Control** ([specs/scope-control.md](../specs/scope-control.md))
   - Maximum 5 files changed per session
   - Maximum 200 lines added/modified

4. **DRS Calculation** ([specs/drs-calculation.md](../specs/drs-calculation.md))
   - 0-40: Early development
   - 40-70: In progress
   - 70-85: Nearly ready
   - 85-100: **DEPLOYABLE**

## Implementation Options

### Automated (Scripts)
- **Bash** - Linux/Mac/WSL (`reference/bash/`)
- **PowerShell** - Windows (`reference/powershell/`)
- **Python** - Universal (`reference/python/`)

### Manual (Checklists)
- Always available fallback (`reference/checklists/`)
- Print and check manually
- Document results

## Essential Commands

### Using the Wrapper (if Bash available)
```bash
./run-check.sh continue    # Safety check
./run-check.sh drs         # Calculate score
./run-check.sh all         # Run everything
```

### Direct Implementation
```bash
# Bash
./ai-framework/reference/bash/check-contracts.sh

# PowerShell
.\ai-framework\reference\powershell\Check-Contracts.ps1

# Python
python ai-framework/reference/python/check_contracts.py

# Manual
Complete checklist at ai-framework/reference/checklists/
```

## Framework Structure

```
ai-framework/
├── specs/              # WHAT to check (read these!)
├── reference/          # HOW to check (examples)
│   ├── bash/
│   ├── powershell/
│   ├── python/
│   └── checklists/
├── templates/          # Project configuration
└── docs/              # Documentation
```

## Common Issues & Solutions

### "Scripts don't work in my environment"
→ Use Python implementation or manual checklists

### "Mocks timeout but I need more time"
→ End session, start new one for another 30 minutes

### "Contract changed accidentally"
→ Run Contract Change Request (CCR) process

### "DRS won't go above 85"
→ Check for missing tests, error handling, or documentation

## Next Steps

1. **For New Projects**: Initialize with framework templates
2. **For Existing Projects**: Run ASSESSMENT session first
3. **For Teams**: See [TEAM-SETUP.md](TEAM-SETUP.md)
4. **For Customization**: See [CUSTOMIZATION.md](CUSTOMIZATION.md)

## Getting Help

- **Specifications**: Read `ai-framework/specs/` for requirements
- **Implementation**: See `ai-framework/IMPLEMENTATION-GUIDE.md`
- **Troubleshooting**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Remember**: The framework's value is in the discipline, not the scripts. Whether automated or manual, maintain the four disciplines!