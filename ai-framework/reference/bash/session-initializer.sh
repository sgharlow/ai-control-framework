#!/bin/bash
# Session Initialization Script
# Creates session state file for persistence across tool invocations
# Ensures all framework components can coordinate

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "AI CONTROL FRAMEWORK - SESSION INIT"
echo "========================================="

# Get session type from argument or prompt
SESSION_TYPE="${1:-}"
if [ -z "$SESSION_TYPE" ]; then
    echo "Select session type:"
    echo "  1) ASSESSMENT - Read-only discovery (30 min)"
    echo "  2) DEVELOPMENT - Build features (120 min, default)"
    echo "  3) DEPLOYMENT - Ship to production (60 min)"
    echo ""
    read -p "Enter choice [1-3] (default: 2): " choice
    
    case "$choice" in
        1) SESSION_TYPE="ASSESSMENT" ;;
        3) SESSION_TYPE="DEPLOYMENT" ;;
        *) SESSION_TYPE="DEVELOPMENT" ;;
    esac
fi

# Validate session type
case "$SESSION_TYPE" in
    ASSESSMENT|DEVELOPMENT|DEPLOYMENT) ;;
    *) 
        echo -e "${YELLOW}Invalid session type. Using DEVELOPMENT${NC}"
        SESSION_TYPE="DEVELOPMENT"
        ;;
esac

echo -e "${BLUE}Session Type: $SESSION_TYPE${NC}"
echo ""

# Check for existing session
if [ -f ".session-state" ]; then
    echo -e "${YELLOW}Warning: Existing session detected${NC}"
    existing_start=$(grep "SESSION_START" .session-state | cut -d: -f2-)
    echo "Previous session started: $existing_start"
    read -p "Override existing session? (y/N): " override
    
    if [ "$override" != "y" ] && [ "$override" != "Y" ]; then
        echo "Keeping existing session. Use ./end-session.sh to close it first."
        exit 1
    fi
    
    # Backup old session
    mv .session-state .session-state.backup
    echo "Previous session backed up to .session-state.backup"
fi

# Create session state file
SESSION_START=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "Creating new session state..."

cat > .session-state << EOF
# AI Control Framework Session State
# Generated: $SESSION_START
# DO NOT EDIT MANUALLY

SESSION_START: $SESSION_START
SESSION_TYPE: $SESSION_TYPE
PATTERN_SELECTED: none
CONFIDENCE: MEDIUM
CONTRACT_HASH: pending
DRS_BASELINE: 0
MOCKS_ALLOWED_UNTIL: $(date -u -d "+30 minutes" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

echo -e "${GREEN}✓ Session state created${NC}"

# Initialize contract hashes if needed
if [ ! -f ".contract-hashes" ]; then
    echo ""
    echo "Initializing contract tracking..."
    
    # Find contract files
    CONTRACT_FILES=""
    for pattern in "api/openapi.yaml" "db/schema.sql" "api/swagger.json" "contracts/*.json" "schema/*.sql"; do
        for file in $pattern; do
            [ -f "$file" ] && CONTRACT_FILES="$CONTRACT_FILES $file"
        done
    done
    
    if [ -n "$CONTRACT_FILES" ]; then
        echo "# Contract hashes - DO NOT EDIT" > .contract-hashes
        echo "# Generated: $SESSION_START" >> .contract-hashes
        
        for file in $CONTRACT_FILES; do
            hash=$(sha256sum "$file" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$file" 2>/dev/null | cut -d' ' -f1)
            echo "$file: $hash" >> .contract-hashes
            echo "  Frozen: $file"
        done
        
        # Update session state with combined hash
        combined_hash=$(sha256sum .contract-hashes | cut -d' ' -f1)
        sed -i.bak "s/CONTRACT_HASH: pending/CONTRACT_HASH: $combined_hash/" .session-state
        rm .session-state.bak 2>/dev/null || true
        
        echo -e "${GREEN}✓ Contracts frozen${NC}"
    else
        echo -e "${YELLOW}No contract files found. Define contracts in design.md${NC}"
    fi
fi

# Create required directories
mkdir -p evidence
echo -e "${GREEN}✓ Evidence directory ready${NC}"

# Set up session-specific configurations
case "$SESSION_TYPE" in
    ASSESSMENT)
        echo ""
        echo -e "${BLUE}ASSESSMENT Session Configuration:${NC}"
        echo "  • Read-only mode (0 files changed)"
        echo "  • 30-minute time limit"
        echo "  • Run ./assess-project.sh for analysis"
        
        # Update code.md session type
        if [ -f "ai-framework/templates/code.md" ]; then
            sed -i.bak "s/Session Type:.*/Session Type: ASSESSMENT/" ai-framework/templates/code.md
            rm ai-framework/templates/code.md.bak 2>/dev/null || true
        fi
        ;;
        
    DEVELOPMENT)
        echo ""
        echo -e "${BLUE}DEVELOPMENT Session Configuration:${NC}"
        echo "  • Max 5 USER files changed"
        echo "  • Max 200 lines of code"
        echo "  • 120-minute session"
        echo "  • Mocks allowed for 30 minutes"
        
        if [ -f "ai-framework/templates/code.md" ]; then
            sed -i.bak "s/Session Type:.*/Session Type: DEVELOPMENT/" ai-framework/templates/code.md
            rm ai-framework/templates/code.md.bak 2>/dev/null || true
        fi
        ;;
        
    DEPLOYMENT)
        echo ""
        echo -e "${BLUE}DEPLOYMENT Session Configuration:${NC}"
        echo "  • Max 3 config files changed"
        echo "  • Max 50 lines of code"
        echo "  • 60-minute session"
        echo "  • Focus on production readiness"
        
        if [ -f "ai-framework/templates/code.md" ]; then
            sed -i.bak "s/Session Type:.*/Session Type: DEPLOYMENT/" ai-framework/templates/code.md
            rm ai-framework/templates/code.md.bak 2>/dev/null || true
        fi
        ;;
esac

# Create session timer script
cat > .session-timer.sh << 'EOF'
#!/bin/bash
# Session timer - shows elapsed time and gates
source .session-state 2>/dev/null || exit 1

start_epoch=$(date -d "$SESSION_START" +%s 2>/dev/null || date +%s)
now_epoch=$(date +%s)
elapsed_min=$(( (now_epoch - start_epoch) / 60 ))

echo "Session: $SESSION_TYPE | Elapsed: ${elapsed_min}m"

case "$SESSION_TYPE" in
    ASSESSMENT) [ $elapsed_min -ge 30 ] && echo "⚠️  TIME LIMIT REACHED" ;;
    DEPLOYMENT) [ $elapsed_min -ge 60 ] && echo "⚠️  TIME LIMIT REACHED" ;;
    DEVELOPMENT)
        [ $elapsed_min -ge 30 ] && echo "✓ 30m gate - Real services required"
        [ $elapsed_min -ge 60 ] && echo "✓ 60m gate - One test passing"
        [ $elapsed_min -ge 90 ] && echo "✓ 90m gate - Error handling complete"
        [ $elapsed_min -ge 120 ] && echo "✓ 120m gate - Ready to deploy"
        ;;
esac
EOF
chmod +x .session-timer.sh

# Display session checklist
echo ""
echo "========================================="
echo -e "${GREEN}SESSION INITIALIZED SUCCESSFULLY${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. [ ] Run: ./assess-project.sh"
echo "2. [ ] Select pattern from patterns.md"
echo "3. [ ] Load orchestration.md"
echo "4. [ ] Begin work with confidence declaration"
echo ""
echo "Monitor with:"
echo "  ./session-timer.sh     - Check elapsed time and gates"
echo "  ./drs-calculate.sh     - Check deployability score"
echo "  ./detect-mocks.sh      - Verify mock compliance"
echo "  ./check-scope.sh       - Verify scope boundaries"
echo ""
echo "Session commands:"
echo "  source .session-state  - Load session variables"
echo "  ./end-session.sh      - Close session properly"
echo ""
echo -e "${YELLOW}Remember: Check orchestration.md every 10 minutes!${NC}"
echo "========================================="