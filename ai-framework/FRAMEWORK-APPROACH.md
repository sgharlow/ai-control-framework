# AI Control Framework - Specification-First Approach

## The Problem We Solved

The original framework had a critical flaw: **bash script dependency**. This meant:
- ❌ Windows users needed WSL or Git Bash
- ❌ Scripts broke with path/environment differences  
- ❌ Users ran scripts blindly without understanding
- ❌ One broken script made framework unusable

## The Solution: Specification-First, Implementation-Flexible

We've restructured the framework to separate:
1. **WHAT** must be checked (specifications)
2. **HOW** to check it (reference implementations)

## New Structure

```
ai-framework/
├── specs/                          # WHAT to check (required reading)
│   ├── framework-overview.md       # Start here
│   ├── contract-integrity.md       # Prevent interface drift
│   ├── mock-detection.md           # Force real services
│   ├── scope-control.md            # Limit change size
│   └── drs-calculation.md          # Measure deployability
│
├── reference/                      # HOW to check (examples only)
│   ├── bash/                       # Linux/Mac/WSL scripts
│   ├── powershell/                 # Windows scripts
│   ├── python/                     # Universal scripts
│   └── checklists/                 # Manual fallback (always works)
│
├── IMPLEMENTATION-GUIDE.md         # How to adapt to your environment
└── FRAMEWORK-APPROACH.md           # This file
```

## How It Works

### 1. Users Read Specifications First
The `specs/` directory contains language-agnostic descriptions of what each check must accomplish. Users understand the WHY and WHAT before worrying about HOW.

### 2. Users Choose Their Implementation
Based on their environment, users select:
- **Bash scripts** if on Linux/Mac/WSL
- **PowerShell scripts** if on Windows
- **Python scripts** for universal compatibility
- **Manual checklists** when nothing else works

### 3. Users Adapt as Needed
The reference implementations are starting points. Users:
- Modify paths for their project structure
- Adjust commands for their tools
- Create custom implementations
- Share improvements with community

### 4. Framework Remains Effective
Whether using automated scripts or manual checklists, the core discipline is maintained:
- Contracts stay frozen
- Mocks timeout after 30 minutes
- Scope stays limited
- DRS provides objective readiness

## Key Benefits

### For Users
- ✅ **Works everywhere** - No platform lock-in
- ✅ **Educational** - Understand what you're checking
- ✅ **Flexible** - Adapt to any environment
- ✅ **Reliable** - Manual fallback always available

### For Framework
- ✅ **Broader adoption** - No bash requirement
- ✅ **Community contributions** - Multiple implementations
- ✅ **Evolution** - New languages/platforms easily added
- ✅ **Resilience** - Not dependent on specific tools

## Migration from Old Approach

### Old Way (Brittle)
```
Run ./check-contracts.sh
Run ./detect-mocks.sh
Run ./drs-calculate.sh
```

### New Way (Flexible)
```
Perform contract integrity check (see specs/contract-integrity.md)
Perform mock detection (see specs/mock-detection.md)  
Calculate DRS (see specs/drs-calculation.md)

Use appropriate implementation from reference/ or complete manually.
```

## Example Implementations

### Automated (Bash on Linux)
```bash
# Copy reference scripts
cp ai-framework/reference/bash/* my-scripts/
# Run checks
./my-scripts/check-contracts.sh
```

### Automated (PowerShell on Windows)
```powershell
# Use PowerShell references
.\ai-framework\reference\powershell\Check-Contracts.ps1
```

### Semi-Automated (Python Universal)
```python
# Run Python implementation
python ai-framework/reference/python/check_contracts.py
```

### Manual (Always Works)
```
1. Open ai-framework/reference/checklists/contract-integrity.md
2. Complete each item
3. Document results
```

## The Philosophy

**"The framework's value is in the discipline it enforces, not the scripts that check it."**

Whether you:
- Run a bash script
- Execute PowerShell
- Use Python
- Check manually with a printed checklist

**What matters is that you:**
1. Keep contracts frozen
2. Replace mocks within 30 minutes
3. Limit scope to manageable chunks
4. Measure deployability objectively

## Community Contributions Welcome

We encourage implementations in:
- Ruby
- Go
- Node.js
- Rust
- Make
- Gradle
- Maven
- Any other tool/language

Share your implementations to help others!

## Remember

The framework is about **discipline**, not **scripts**. The specifications define the discipline. The implementations are just helpers.

**Read the specs. Understand the why. Implement the how that works for you.**

---

*This approach makes the framework truly universal while maintaining its core value: shipping deployable code faster.*