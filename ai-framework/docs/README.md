# AI Control Framework Documentation

## Core Documents

### Getting Started
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Quick start guide and overview
- **[IMPLEMENTATION-GUIDE.md](../IMPLEMENTATION-GUIDE.md)** - How to adapt the framework to your environment
- **[FRAMEWORK-APPROACH.md](../FRAMEWORK-APPROACH.md)** - Philosophy and architecture

### Using the Framework
- **[CLAUDE-CODE-PROMPTS.md](CLAUDE-CODE-PROMPTS.md)** - Prompts for AI assistants
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[EXAMPLE-WALKTHROUGH.md](EXAMPLE-WALKTHROUGH.md)** - Step-by-step tutorial

### Advanced Topics
- **[TEAM-SETUP.md](TEAM-SETUP.md)** - Team standardization guide
- **[CUSTOMIZATION.md](CUSTOMIZATION.md)** - Adapting limits and rules
- **[METRICS.md](METRICS.md)** - Tracking productivity and quality
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute

## Framework Structure

```
ai-framework/
├── specs/                 # Specifications (WHAT to check)
│   ├── contract-integrity.md
│   ├── mock-detection.md
│   ├── scope-control.md
│   └── drs-calculation.md
│
├── reference/            # Reference implementations (HOW to check)
│   ├── bash/            # Linux/Mac/WSL scripts
│   ├── powershell/      # Windows PowerShell
│   ├── python/          # Universal Python
│   └── checklists/      # Manual fallback
│
├── templates/           # Project configuration
│   ├── code.md         # Session state
│   ├── orchestration.md # Control rules
│   └── patterns.md     # Implementation patterns
│
└── docs/               # This documentation
```

## Key Concepts

1. **Specification-First**: Framework defines WHAT must be checked, not HOW
2. **Implementation-Flexible**: Choose Bash, PowerShell, Python, or manual
3. **Four Disciplines**: Contracts, Mocks, Scope, DRS
4. **Session Types**: Assessment, Development, Deployment

## Quick Reference

### Check Contracts
- **Spec**: `specs/contract-integrity.md`
- **Bash**: `reference/bash/check-contracts.sh`
- **PowerShell**: `reference/powershell/Check-Contracts.ps1`
- **Python**: `reference/python/check_contracts.py`
- **Manual**: `reference/checklists/contract-integrity.md`

### Detect Mocks (30-min timeout)
- **Spec**: `specs/mock-detection.md`
- **Implementations**: See reference folder

### Control Scope (5 files, 200 lines)
- **Spec**: `specs/scope-control.md`
- **Implementations**: See reference folder

### Calculate DRS (85+ to deploy)
- **Spec**: `specs/drs-calculation.md`
- **Implementations**: See reference folder

## Version
Current Version: **1.1.0**

## License
MIT - See LICENSE file in root