# AI Control Framework Documentation

## Essential Guides

- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Quick start guide for new users
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[CUSTOMIZATION.md](CUSTOMIZATION.md)** - How to adapt the framework for your needs
- **[TEAM-SETUP.md](TEAM-SETUP.md)** - Setting up the framework for teams

## Additional Resources

- **[EXAMPLE-WALKTHROUGH.md](EXAMPLE-WALKTHROUGH.md)** - Step-by-step example project
- **[METRICS.md](METRICS.md)** - Understanding DRS and other metrics
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the framework

## Interactive Visualization

Open **[ai-framework-visualization.html](ai-framework-visualization.html)** in your browser for an interactive system diagram.

## Main Documentation

- **[Framework README](../README.md)** - Comprehensive framework documentation
- **[Implementation Guide](../IMPLEMENTATION-GUIDE.md)** - Platform-specific implementation
- **[MCP Server](../../ai-framework-mcp-server/README.md)** - MCP integration for IDEs

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
Current Version: **2.0.0** (24 Prompts, MCP Server Integration)

## License
MIT - See LICENSE file in root