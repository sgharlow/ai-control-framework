#!/bin/bash
# Prepare clean AI Control Framework package for GitHub
# This script creates a publication-ready directory structure

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Preparing AI Control Framework for GitHub           ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Get target directory
TARGET_DIR="${1:-../ai-control-framework-github}"

echo -e "${YELLOW}Creating clean package in: $TARGET_DIR${NC}"
echo ""

# Create target directory
mkdir -p "$TARGET_DIR"

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$TARGET_DIR/scripts"
mkdir -p "$TARGET_DIR/templates"
mkdir -p "$TARGET_DIR/config"
mkdir -p "$TARGET_DIR/docs"
mkdir -p "$TARGET_DIR/examples/user-api"

# Copy scripts
echo "Copying enforcement scripts..."
cp assess-project.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - assess-project.sh not found"
cp check-contracts.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - check-contracts.sh not found"
cp detect-mocks.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - detect-mocks.sh not found"
cp check-scope.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - check-scope.sh not found"
cp drs-calculate.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - drs-calculate.sh not found"
cp can-i-continue.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - can-i-continue.sh not found"
cp capture-evidence.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - capture-evidence.sh not found"
cp approve-contract-change.sh "$TARGET_DIR/scripts/" 2>/dev/null || echo "  - approve-contract-change.sh not found"

# Copy templates
echo "Copying framework templates..."
cp Claude-template/templates/*.md "$TARGET_DIR/templates/" 2>/dev/null || echo "  - templates not found"
cp Claude-template/code.md "$TARGET_DIR/templates/" 2>/dev/null || echo "  - code.md not found"

# Copy config
echo "Copying configuration files..."
cp CLAUDE.md "$TARGET_DIR/config/" 2>/dev/null || echo "  - CLAUDE.md not found"
cp Claude-template/prompts.md "$TARGET_DIR/config/" 2>/dev/null || echo "  - prompts.md not found"

# Copy documentation
echo "Copying documentation..."
cp CLAUDE-CODE-PROMPTS.md "$TARGET_DIR/docs/" 2>/dev/null || echo "  - CLAUDE-CODE-PROMPTS.md not found"
cp EXAMPLE-WALKTHROUGH.md "$TARGET_DIR/docs/" 2>/dev/null || echo "  - EXAMPLE-WALKTHROUGH.md not found"
cp TROUBLESHOOTING.md "$TARGET_DIR/docs/" 2>/dev/null || echo "  - TROUBLESHOOTING.md not found"
cp FRAMEWORK-INTERNAL-BEHAVIORS.md "$TARGET_DIR/docs/FRAMEWORK-INTERNAL.md" 2>/dev/null || echo "  - FRAMEWORK-INTERNAL.md not found"
cp MCP-SPECIFICATION.md "$TARGET_DIR/docs/" 2>/dev/null || echo "  - MCP-SPECIFICATION.md not found"
cp OPERATIONALIZATION-GUIDE.md "$TARGET_DIR/docs/OPERATIONALIZATION.md" 2>/dev/null || echo "  - OPERATIONALIZATION.md not found"
cp FRAMEWORK-IMPROVEMENTS-SUMMARY.md "$TARGET_DIR/docs/" 2>/dev/null || echo "  - FRAMEWORK-IMPROVEMENTS-SUMMARY.md not found"
cp FRAMEWORK-EXCLUSION-FIX.md "$TARGET_DIR/docs/" 2>/dev/null || echo "  - FRAMEWORK-EXCLUSION-FIX.md not found"

# Copy root files
echo "Copying root files..."
cp README.md "$TARGET_DIR/" 2>/dev/null || echo "  - README.md not found"
cp install.sh "$TARGET_DIR/" 2>/dev/null || echo "  - install.sh not found"
cp validate-framework.sh "$TARGET_DIR/" 2>/dev/null || echo "  - validate-framework.sh not found"

# Create VERSION file
echo "Creating VERSION file..."
echo "1.1.0" > "$TARGET_DIR/VERSION"

# Create LICENSE file
echo "Creating LICENSE file..."
cat > "$TARGET_DIR/LICENSE" << 'EOF'
MIT License

Copyright (c) 2024 AI Control Framework Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create .gitignore
echo "Creating .gitignore..."
cat > "$TARGET_DIR/.gitignore" << 'EOF'
# Backup folders
DO NOT TOUCH/
*backup*/
*.backup

# Generated framework files
.contract-hashes
.contract-hashes.backup.*
.drs-score
.drs-history
evidence/
handoff*.md
handoff.txt
*.log
ccr-log.txt

# Analytics and internal tracking
.analytics/
*-SUMMARY.md
NAME-UPDATE-SUMMARY.md
PACKAGE-STRUCTURE.md

# Session files
.session-*
.claude-session
.framework-cache/

# System files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
*.swp
*.swo
*.tmp
*.bak
*~

# IDE files
.vscode/
.idea/
*.sublime-project
*.sublime-workspace
.project
.classpath
.settings/

# OS specific
desktop.ini
$RECYCLE.BIN/

# Dependencies (if any added later)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
venv/
env/
ENV/
__pycache__/
*.py[cod]
*$py.class
*.so

# Testing
coverage/
.nyc_output/
.coverage
htmlcov/
*.cover
.pytest_cache/
EOF

# Create example configuration
echo "Creating example configuration..."
cat > "$TARGET_DIR/examples/user-api/.framework-config.json" << 'EOF'
{
  "project": "User Management API",
  "framework_version": "1.0.0",
  "constraints": {
    "max_files": 5,
    "max_lines": 200,
    "mock_timeout": 30,
    "drs_target": 85
  },
  "patterns": ["PATTERN-001", "PATTERN-002"],
  "contracts": [
    "api/openapi.yaml",
    "db/schema.sql"
  ]
}
EOF

# Create example README
cat > "$TARGET_DIR/examples/user-api/README.md" << 'EOF'
# Example: User Management API

This example demonstrates using the AI Control Framework to build a REST API.

See `/docs/EXAMPLE-WALKTHROUGH.md` for the complete tutorial.

## Quick Start

1. Install framework: `../../install.sh .`
2. Initialize: Use prompt A from docs
3. Build with discipline!
EOF

# Update install.sh paths for new structure
echo "Updating install.sh for new structure..."
if [ -f "$TARGET_DIR/install.sh" ]; then
    # Create updated installer
    sed -i.bak 's|Claude-template/templates|templates|g' "$TARGET_DIR/install.sh" 2>/dev/null || \
    sed -i '' 's|Claude-template/templates|templates|g' "$TARGET_DIR/install.sh" 2>/dev/null || true
    
    sed -i.bak 's|Claude-template/code.md|templates/code.md|g' "$TARGET_DIR/install.sh" 2>/dev/null || \
    sed -i '' 's|Claude-template/code.md|templates/code.md|g' "$TARGET_DIR/install.sh" 2>/dev/null || true
    
    rm -f "$TARGET_DIR/install.sh.bak" 2>/dev/null || true
fi

# Create quick start script
echo "Creating quick start script..."
cat > "$TARGET_DIR/quickstart.sh" << 'EOF'
#!/bin/bash
# Quick start for AI Control Framework

echo "AI Control Framework Quick Start"
echo "================================="
echo ""
echo "1. Installing framework in current directory..."
./install.sh .

echo ""
echo "2. Assess your project (if existing code):"
echo "./scripts/assess-project.sh"
echo ""
echo "3. Framework installed! Now paste this in Claude Code:"
echo ""
echo "Run project assessment using the AI Control Framework."
echo "SESSION TYPE: ASSESSMENT (read-only, 30 minutes max)"
echo "Run ./scripts/assess-project.sh to get basic USER project metrics"
echo ""
echo "4. For development sessions, start with:"
echo ""
echo "I'm using the AI Control Framework."
echo "SESSION TYPE: DEVELOPMENT"
echo "Read config/CLAUDE.md and run ./scripts/can-i-continue.sh"
echo ""
echo "Happy disciplined coding! 🚀"
EOF
chmod +x "$TARGET_DIR/quickstart.sh"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Package prepared successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Clean package created in: $TARGET_DIR"
echo ""
echo "Directory structure:"
cd "$TARGET_DIR"
tree -L 2 2>/dev/null || find . -type d -not -path '*/\.*' | head -20

echo ""
echo -e "${YELLOW}What's NOT included (staying local):${NC}"
echo "  ✗ DO NOT TOUCH/ folder (your backup)"
echo "  ✗ .contract-hashes (generated file)"
echo "  ✗ .drs-score, .drs-history (generated files)"
echo "  ✗ .analytics/ folder (usage tracking)"
echo "  ✗ Any test/temporary files"
echo ""
echo -e "${GREEN}New in v1.1.0:${NC}"
echo "  ✓ assess-project.sh - Automated project discovery"
echo "  ✓ Session types (ASSESSMENT/DEVELOPMENT/DEPLOYMENT)"
echo "  ✓ Framework exclusion (prevents self-assessment)"
echo "  ✓ Auto-validation checks in progress tracking"
echo "  ✓ Enhanced documentation and troubleshooting"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. cd $TARGET_DIR"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Release v1.1.0 - Session types and auto-assessment'"
echo "5. Create GitHub repo and push"
echo ""
echo "The package is ready for GitHub! 🚀"