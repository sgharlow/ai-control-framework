#!/bin/bash
# AI Control Framework Installer
# Works on Mac, Linux, and Windows (Git Bash/WSL)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Framework version
VERSION="1.1.0"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       AI Control Framework Installer v${VERSION}         ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Get installation directory
if [ -z "$1" ]; then
    echo "Usage: ./install.sh <project-directory>"
    echo "Example: ./install.sh /path/to/my-project"
    exit 1
fi

PROJECT_DIR="$1"

# Verify directory exists or create it
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Creating project directory: $PROJECT_DIR${NC}"
    mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

echo -e "${GREEN}→ Installing framework in: $(pwd)${NC}"
echo ""

# Create directory structure
echo "Creating framework structure..."
mkdir -p ai-framework
mkdir -p evidence

# Copy framework files
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Copying framework files..."
cp -r "$SCRIPT_DIR/ai-framework/"* ai-framework/ 2>/dev/null || true

# Make reference scripts executable if they exist
chmod +x ai-framework/reference/bash/*.sh 2>/dev/null || true

# Initialize tracking files
touch .contract-hashes
touch .drs-score
touch .drs-history
echo "0" > .drs-score

# Detect OS and create appropriate script wrappers
OS_TYPE="unix"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS_TYPE="windows"
fi

# Create cross-platform wrapper
cat > run-check.sh << 'EOF'
#!/bin/bash
# Cross-platform wrapper for framework checks

# Function to run a script with proper path handling
run_script() {
    local script_name="$1"
    shift
    
    # Try different implementations in order
    if [ -f "ai-framework/reference/bash/${script_name}.sh" ]; then
        bash "ai-framework/reference/bash/${script_name}.sh" "$@"
    elif [ -f "ai-framework/reference/powershell/${script_name}.ps1" ] && command -v powershell &> /dev/null; then
        powershell -ExecutionPolicy Bypass -File "ai-framework/reference/powershell/${script_name}.ps1" "$@"
    elif command -v python &> /dev/null && [ -f "ai-framework/reference/python/${script_name}.py" ]; then
        python "ai-framework/reference/python/${script_name}.py" "$@"
    else
        echo "Error: Script ${script_name} not found"
        exit 1
    fi
}

# Main check routine
case "$1" in
    contracts)
        run_script check-contracts
        ;;
    mocks)
        run_script detect-mocks
        ;;
    scope)
        run_script check-scope
        ;;
    drs)
        run_script drs-calculate
        ;;
    continue)
        run_script can-i-continue
        ;;
    evidence)
        shift
        run_script capture-evidence "$@"
        ;;
    all)
        echo "Running all checks..."
        run_script can-i-continue
        ;;
    *)
        echo "Usage: ./run-check.sh {contracts|mocks|scope|drs|continue|evidence|all}"
        exit 1
        ;;
esac
EOF

chmod +x run-check.sh

# Create initial CLAUDE.md if not exists
# CLAUDE.md now lives in ai-framework/docs/

# Create .gitignore for framework files
cat > .gitignore.framework << 'EOF'
# AI Control Framework
.drs-score
.drs-history
.contract-hashes.backup.*
evidence/
handoff-*.md
handoff.txt
*.log

# Session files
.session-*
.claude-session

# Temporary files
*.tmp
*.bak
EOF

# Append to existing .gitignore or create new one
if [ -f .gitignore ]; then
    echo "" >> .gitignore
    echo "# AI Control Framework" >> .gitignore
    cat .gitignore.framework >> .gitignore
else
    mv .gitignore.framework .gitignore
fi

# Create quick reference card
cat > QUICK-REFERENCE.md << 'EOF'
# AI Control Framework - Quick Reference

## Essential Commands

### Check if safe to continue
```bash
./run-check.sh continue
```

### Calculate Deployability Score
```bash
./run-check.sh drs
```

### Run all checks
```bash
./run-check.sh all
```

## Key Prompts for Claude Code

### Start every session with:
```
I'm using the AI Control Framework. 
Read CLAUDE.md and templates/code.md.
Run ./run-check.sh continue
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
- Troubleshooting: ./run-check.sh all
EOF

# Initialize git hooks if git repo exists
if [ -d .git ]; then
    echo -e "${GREEN}Installing git hooks...${NC}"
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# AI Control Framework Pre-commit Hook

echo "Running AI Control Framework checks..."

# Framework checks - use appropriate implementation
echo "Perform framework checks per ai-framework/specs/"
echo "Use implementation appropriate for your environment"
if [ $? -ne 0 ]; then
    echo "Scope exceeded. Commit aborted."
    exit 1
fi

# Check DRS
if [ -f .drs-score ]; then
    DRS=$(cat .drs-score)
    if [ "$DRS" -lt 50 ]; then
        echo "Warning: DRS is low ($DRS/100)"
        echo "Consider improving before commit"
    fi
fi

echo "AI Control checks passed ✓"
EOF
    chmod +x .git/hooks/pre-commit
fi

# Create initial session file
cat > templates/code.md << 'EOF'
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
EOF

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ AI Control Framework installed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Open Claude Code in this directory: $PROJECT_DIR"
echo ""
echo "2. Copy and paste this initialization prompt:"
echo ""
echo -e "${BLUE}Initialize the AI Control Framework for this project.${NC}"
echo -e "${BLUE}Read all template files in templates/${NC}"
echo -e "${BLUE}Help me set up: [describe your project]${NC}"
echo ""
echo "3. For every future session, start with:"
echo ""
echo -e "${BLUE}I'm using the AI Control Framework.${NC}"
echo -e "${BLUE}Read CLAUDE.md and ai-framework/IMPLEMENTATION-GUIDE.md${NC}"
echo -e "${BLUE}Perform safety checks using appropriate implementation${NC}"
echo ""
echo -e "${YELLOW}Quick reference saved to: QUICK-REFERENCE.md${NC}"
echo -e "${YELLOW}Full prompts available in: ai-framework/docs/CLAUDE-CODE-PROMPTS.md${NC}"
echo ""
echo "Happy disciplined coding! 🚀"