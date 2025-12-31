# AI Control Framework - Implementation Guide

## ⚠️ CRITICAL: Framework Adaptation Required

**This framework uses a "Specification-First, Implementation-Flexible" approach.** The scripts provided are REFERENCE IMPLEMENTATIONS that must be adapted to your environment.

## What This Means

### ✅ The Framework Provides:
- **SPECIFICATIONS** of what must be checked (the "what")
- **REFERENCE IMPLEMENTATIONS** showing how it could be done (the "how")
- **CHECKLISTS** for manual fallback when automation fails

### ⚠️ You Must:
- **IMPLEMENT OR ADAPT** the checks for your specific environment
- **CHOOSE** between automated scripts or manual checklists
- **ENSURE** the checks actually run (somehow)

## Quick Start Decision Tree

```
Can you run Bash scripts?
├─ YES → Use reference/bash/ implementations
│   └─ Adapt paths and commands as needed
├─ NO → Are you on Windows?
│   ├─ YES → Use reference/powershell/ implementations
│   │   └─ Or install Git Bash/WSL
│   └─ NO → Use reference/python/ implementations
└─ NONE WORK → Use reference/checklists/ manually
```

## Implementation Options

### Option 1: Direct Script Usage (Bash Environment)
```bash
# If you have Bash (Linux/Mac/WSL/Git Bash)
cp -r ai-framework/reference/bash/* ai-framework/scripts/
chmod +x ai-framework/scripts/*.sh

# Use directly in prompts:
"Run ./ai-framework/scripts/check-contracts.sh"
```

### Option 2: PowerShell Adaptation (Windows)
```powershell
# Copy PowerShell references
Copy-Item ai-framework/reference/powershell/* ai-framework/scripts/

# Use in prompts:
"Run .\ai-framework\scripts\Check-Contracts.ps1"
```

### Option 3: Python Universal Implementation
```python
# Install Python implementation
pip install -r ai-framework/reference/python/requirements.txt

# Use in prompts:
"Run python ai-framework/reference/python/check_contracts.py"
```

### Option 4: Manual Checklists (Always Works)
```
# When scripts fail or aren't available
"Complete the contract integrity checklist at:
 ai-framework/reference/checklists/contract-integrity.md"
```

## Adapting Reference Implementations

### Common Adaptations Needed

#### 1. Path Separators (Windows vs Unix)
```bash
# Unix/Bash version:
CONTRACTS="api/*.yaml"

# Windows/PowerShell version:
$contracts = "api\*.yaml"

# Python (universal):
contracts = Path("api").glob("*.yaml")
```

#### 2. Command Differences
```bash
# Bash:
find . -name "*.yaml"

# PowerShell:
Get-ChildItem -Recurse -Filter "*.yaml"

# Python:
Path(".").rglob("*.yaml")
```

#### 3. Hash Generation
```bash
# Bash:
sha256sum file.yaml

# PowerShell:
Get-FileHash file.yaml -Algorithm SHA256

# Python:
hashlib.sha256(open('file.yaml','rb').read()).hexdigest()
```

## Critical Prompts Update

### Instead of Hardcoded Scripts:

❌ **OLD WAY (Brittle):**
```
Run ./ai-framework/scripts/check-contracts.sh
```

✅ **NEW WAY (Flexible):**
```
Perform contract integrity check:
- Specification: ai-framework/specs/contract-integrity.md
- Use appropriate implementation from ai-framework/reference/
- Or complete manually with ai-framework/reference/checklists/
```

## Creating Your Implementation

### Step 1: Read the Specification
```
ai-framework/specs/
├── contract-integrity.md    # What to check
├── mock-detection.md        # What to check
├── scope-control.md         # What to check
└── drs-calculation.md       # What to check
```

### Step 2: Choose Your Approach
- **Automated**: Adapt reference scripts
- **Semi-Automated**: Mix scripts and manual
- **Manual**: Use checklists exclusively

### Step 3: Test Your Implementation
Verify it correctly:
- Detects contract changes
- Finds mocks after 30 minutes
- Counts files and lines
- Calculates DRS score

### Step 4: Document Your Approach
Create `my-implementation.md`:
```markdown
# Our Framework Implementation

## Environment
- Platform: Windows 10
- Shell: PowerShell 7
- Languages: Python 3.9

## Implementations Used
- Contracts: PowerShell script (adapted)
- Mocks: Python script (custom)
- Scope: Manual checklist
- DRS: Python calculator

## How to Run Checks
1. Start session: `python start_session.py`
2. Check safety: `./check_all.ps1`
3. Calculate DRS: `python drs.py`
```

## Fallback Strategy

When scripts fail, always fall back to manual:

```
Script failed? → Use checklist
Checklist unclear? → Read specification
Still stuck? → Check core principles:
  1. Have contracts changed? (If yes, stop)
  2. Are there mocks? (If yes after 30min, stop)
  3. Too many files changed? (If yes, stop)
  4. DRS above 85? (If no, not ready)
```

## Integration Examples

### VS Code Tasks
```json
{
  "label": "Framework: Check All",
  "type": "shell",
  "command": "python",
  "args": ["${workspaceFolder}/ai-framework/reference/python/check_all.py"],
  "problemMatcher": []
}
```

### Git Hooks (Universal Python)
```python
#!/usr/bin/env python3
# .git/hooks/pre-commit
import subprocess
import sys

result = subprocess.run(
    ["python", "ai-framework/reference/python/check_all.py"],
    capture_output=True
)
if result.returncode != 0:
    print("Framework checks failed!")
    sys.exit(1)
```

### CI/CD (GitHub Actions)
```yaml
- name: Framework Checks
  run: |
    # Try multiple implementations
    python ai-framework/reference/python/check_all.py || \
    bash ai-framework/reference/bash/can-i-continue.sh || \
    echo "Manual review required"
```

## Troubleshooting

### "Script not found"
- Check if you've copied reference to scripts/
- Verify correct path separator for your OS
- Try the Python or manual version

### "Permission denied"
- Windows: Run as Administrator
- Unix: `chmod +x script.sh`
- Or use Python version (no permissions needed)

### "Command not found"
- Missing dependencies (git, python, etc.)
- Use different reference implementation
- Fall back to manual checklist

### "Different results on different machines"
- Ensure same implementation used
- Check for environment variables
- Normalize paths and line endings

## Best Practices

1. **Start with Manual**: Understand what you're checking
2. **Automate Gradually**: Script one check at a time
3. **Test Thoroughly**: Ensure catches real issues
4. **Document Clearly**: Others need to run checks too
5. **Share Solutions**: Help the community

## The Golden Rule

**The framework's value is in the discipline, not the scripts.**

Whether you:
- Run Bash scripts
- Execute PowerShell
- Use Python
- Check manually

**What matters is that you:**
1. Check contracts haven't changed
2. Replace mocks after 30 minutes
3. Limit scope to 5 files/200 lines
4. Achieve DRS 85+ before deploying

---

**Remember: Adapt the implementation to your environment. The specifications are the requirements; the scripts are just examples.**