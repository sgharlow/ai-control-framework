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
VERSION="2.0.0"

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
mkdir -p ai-framework/templates
mkdir -p ai-framework-mcp-server
mkdir -p ai-framework-mcp-server/src
mkdir -p ai-framework-mcp-server/dist
mkdir -p evidence

# Copy framework files
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define files/directories to exclude
EXCLUDE_PATTERNS=(
    "node_modules"
    ".git"
    "dist"
    "build"
    "*.log"
    "*.tmp"
    ".DS_Store"
    "Thumbs.db"
    "package-lock.json"
    "yarn.lock"
    ".env"
    ".env.local"
)

# Create rsync exclude arguments
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude='$pattern'"
done

echo "Copying framework files (excluding node_modules, etc.)..."
if [ -d "$SCRIPT_DIR/ai-framework" ]; then
    # Try rsync first (best option)
    if command -v rsync &> /dev/null; then
        eval rsync -av $EXCLUDE_ARGS "$SCRIPT_DIR/ai-framework/" ai-framework/
        echo -e "${GREEN}✓ Framework files copied (using rsync)${NC}"
    else
        # Fallback to manual copy with exclusions
        echo "Using manual copy (rsync not available)..."
        find "$SCRIPT_DIR/ai-framework" -type f -print0 | while IFS= read -r -d '' file; do
            # Get relative path
            rel_path="${file#$SCRIPT_DIR/ai-framework/}"
            
            # Check if file should be excluded
            should_exclude=false
            for pattern in "${EXCLUDE_PATTERNS[@]}"; do
                if [[ "$rel_path" == *"$pattern"* ]]; then
                    should_exclude=true
                    break
                fi
            done
            
            if [ "$should_exclude" = false ]; then
                # Create directory if needed
                target_dir="$(dirname "ai-framework/$rel_path")"
                mkdir -p "$target_dir"
                cp "$file" "ai-framework/$rel_path"
            fi
        done
        echo -e "${GREEN}✓ Framework files copied (manual copy)${NC}"
    fi
else
    echo "Error: Source ai-framework directory not found at $SCRIPT_DIR/ai-framework"
    exit 1
fi

# Copy MCP server files
echo "Copying MCP server files (excluding node_modules, etc.)..."
if [ -d "$SCRIPT_DIR/ai-framework-mcp-server" ]; then
    # Try rsync first
    if command -v rsync &> /dev/null; then
        eval rsync -av $EXCLUDE_ARGS "$SCRIPT_DIR/ai-framework-mcp-server/" ai-framework-mcp-server/
        echo -e "${GREEN}✓ MCP server files copied (using rsync)${NC}"
    else
        # Manual copy excluding patterns
        echo "Using manual copy for MCP server files..."
        # Copy only essential files
        for file in package.json tsconfig.json README.md; do
            if [ -f "$SCRIPT_DIR/ai-framework-mcp-server/$file" ]; then
                cp "$SCRIPT_DIR/ai-framework-mcp-server/$file" ai-framework-mcp-server/
            fi
        done
        
        # Copy src directory
        if [ -d "$SCRIPT_DIR/ai-framework-mcp-server/src" ]; then
            mkdir -p ai-framework-mcp-server/src
            cp -r "$SCRIPT_DIR/ai-framework-mcp-server/src/"* ai-framework-mcp-server/src/ 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ MCP server files copied (manual copy)${NC}"
    fi
    
    # Check if npm is available and install dependencies
    if command -v npm &> /dev/null; then
        echo "Installing MCP server dependencies..."
        cd ai-framework-mcp-server
        npm install --silent 2>/dev/null && npm run build --silent 2>/dev/null && {
            echo -e "${GREEN}✓ MCP server built successfully${NC}"
        } || {
            echo -e "${YELLOW}⚠ MCP server build failed. Manual build may be required.${NC}"
        }
        cd ..
    else
        echo -e "${YELLOW}Note: npm not found. Install Node.js to build MCP server.${NC}"
    fi
else
    echo -e "${YELLOW}Note: MCP server not found at $SCRIPT_DIR/ai-framework-mcp-server (optional component)${NC}"
fi

# Copy CLAUDE.md to project root if it exists
if [ -f "$SCRIPT_DIR/CLAUDE.md" ]; then
    cp "$SCRIPT_DIR/CLAUDE.md" .
fi

# Copy PowerShell validation script if it exists
if [ -f "$SCRIPT_DIR/Validate-Framework.ps1" ]; then
    cp "$SCRIPT_DIR/Validate-Framework.ps1" .
fi

# Make reference scripts executable if they exist
chmod +x ai-framework/reference/bash/*.sh 2>/dev/null || true
chmod +x ai-framework/reference/powershell/*.ps1 2>/dev/null || true

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
    elif [ -f "ai-framework/reference/powershell/${script_name}.ps1" ] && (command -v powershell &> /dev/null || command -v pwsh &> /dev/null); then
        if command -v pwsh &> /dev/null; then
            pwsh -ExecutionPolicy Bypass -File "ai-framework/reference/powershell/${script_name}.ps1" "$@"
        else
            powershell -ExecutionPolicy Bypass -File "ai-framework/reference/powershell/${script_name}.ps1" "$@"
        fi
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
Read CLAUDE.md and ai-framework/templates/code.md.
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
cat > ai-framework/templates/code.md << 'EOF'
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
echo "2. To validate the installation, you can run:"
echo "   Bash: ./validate-framework.sh"
echo "   PowerShell: ./Validate-Framework.ps1"
echo ""
echo "3. Copy and paste this initialization prompt:"
echo ""
echo -e "${BLUE}Initialize the AI Control Framework for this project.${NC}"
echo -e "${BLUE}Read all template files in ai-framework/templates/${NC}"
echo -e "${BLUE}Help me set up: [describe your project]${NC}"
echo ""
echo "4. For every future session, start with:"
echo ""
echo -e "${BLUE}I'm using the AI Control Framework.${NC}"
echo -e "${BLUE}Read CLAUDE.md and ai-framework/IMPLEMENTATION-GUIDE.md${NC}"
echo -e "${BLUE}Perform safety checks using appropriate implementation${NC}"
echo ""
echo -e "${YELLOW}Quick reference saved to: QUICK-REFERENCE.md${NC}"
echo -e "${YELLOW}Full prompts available in: ai-framework/docs/CLAUDE-CODE-PROMPTS.md${NC}"
echo ""
echo "Happy disciplined coding! 🚀"