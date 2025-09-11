#!/bin/bash
# Initialize Session - Start a new AI coding session
# Part of AI Control Framework v1.1.0

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Parse arguments
SESSION_TYPE="${1:-DEVELOPMENT}"
RESUME_MODE=false

if [ "$1" == "--resume" ]; then
    RESUME_MODE=true
    SESSION_TYPE=$(cat .session-type 2>/dev/null || echo "DEVELOPMENT")
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        AI CONTROL FRAMEWORK SESSION INITIALIZER        ${NC}"
echo -e "${BLUE}                      Version 1.1.0                     ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check for existing session
if [ -f ".session-start" ] && [ "$RESUME_MODE" == "false" ]; then
    echo -e "${YELLOW}⚠ Active session detected${NC}"
    echo ""
    EXISTING_START=$(cat .session-start)
    EXISTING_TYPE=$(cat .session-type 2>/dev/null || echo "UNKNOWN")
    ELAPSED=$(( ($(date +%s) - EXISTING_START) / 60 ))
    
    echo "Existing session:"
    echo "- Type: $EXISTING_TYPE"
    echo "- Started: $(date -d @$EXISTING_START '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r $EXISTING_START '+%Y-%m-%d %H:%M:%S' 2>/dev/null)"
    echo "- Elapsed: $ELAPSED minutes"
    echo ""
    echo "Options:"
    echo "1. Continue existing session"
    echo "2. End current and start new"
    echo "3. Cancel"
    echo ""
    read -p "Choice (1-3): " choice
    
    case $choice in
        1)
            echo "Continuing existing session..."
            exit 0
            ;;
        2)
            echo "Ending current session..."
            "$(dirname "$0")/end-session.sh"
            ;;
        3)
            echo "Cancelled."
            exit 0
            ;;
        *)
            echo "Invalid choice. Cancelled."
            exit 1
            ;;
    esac
fi

# Set session type
case "$SESSION_TYPE" in
    ASSESSMENT|assessment)
        SESSION_TYPE="ASSESSMENT"
        MAX_TIME=30
        DESCRIPTION="Read-only discovery mode"
        ;;
    DEPLOYMENT|deployment)
        SESSION_TYPE="DEPLOYMENT"
        MAX_TIME=60
        DESCRIPTION="Production deployment mode"
        ;;
    DEVELOPMENT|development|*)
        SESSION_TYPE="DEVELOPMENT"
        MAX_TIME=120
        DESCRIPTION="Standard development mode"
        ;;
esac

echo "Initializing $SESSION_TYPE session..."
echo "- Description: $DESCRIPTION"
echo "- Time limit: $MAX_TIME minutes"
echo "- Mock timeout: 30 minutes"
echo ""

# Initialize session files
date +%s > .session-start
echo "$SESSION_TYPE" > .session-type
touch .session-active

# Initialize framework files if needed
if [ ! -f ".contract-hashes" ]; then
    echo "Initializing contract tracking..."
    touch .contract-hashes
fi

if [ ! -f ".drs-score" ]; then
    echo "Initializing DRS tracking..."
    echo "0" > .drs-score
    touch .drs-history
fi

# Run initial checks
echo "Running initial checks..."
echo ""

# Check contracts
echo -n "Contract integrity... "
if "$(dirname "$0")/check-contracts.sh" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ No contracts defined yet${NC}"
fi

# Check scope
echo -n "Scope boundaries... "
if "$(dirname "$0")/check-scope.sh" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Check failed${NC}"
fi

# Check for mocks
echo -n "Mock detection... "
if "$(dirname "$0")/detect-mocks.sh" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Mocks present${NC}"
fi

# Calculate initial DRS
echo -n "DRS calculation... "
DRS=$("$(dirname "$0")/drs-calculate.sh" 2>/dev/null | grep "TOTAL DRS" | sed 's/.*: \([0-9]*\).*/\1/' || echo "0")
echo "$DRS" > .drs-score
echo -e "${YELLOW}$DRS/100${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Session initialized successfully${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Generate session prompt for Claude
cat << EOF
Session started: $SESSION_TYPE mode

Copy this to Claude Code:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I'm using the AI Control Framework.
SESSION TYPE: $SESSION_TYPE

MANDATORY: Read these files in order:
1. CLAUDE.md - Framework instructions
2. ai-framework/templates/code.md - Session state

Run ./ai-framework/scripts/can-i-continue.sh now.
Only proceed if it returns CONTINUE.

Current DRS: $DRS/100 (target: 85+)
Time limit: $MAX_TIME minutes
Mock timeout: 30 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo ""
echo "Monitoring commands:"
echo "  ./ai-framework/scripts/session-timer.sh    - Check time"
echo "  ./ai-framework/scripts/drs-calculate.sh     - Check DRS"
echo "  ./ai-framework/scripts/can-i-continue.sh    - Safety check"
echo "  ./ai-framework/scripts/end-session.sh       - End session"
echo ""

exit 0