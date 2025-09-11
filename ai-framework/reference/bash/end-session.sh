#!/bin/bash
# End Session - Clean session closure with handoff generation
# Part of AI Control Framework v1.1.0

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              SESSION CLOSURE PROTOCOL                  ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check for active session
if [ ! -f ".session-start" ]; then
    echo -e "${YELLOW}No active session found.${NC}"
    exit 0
fi

SESSION_START=$(cat .session-start)
SESSION_TYPE=$(cat .session-type 2>/dev/null || echo "DEVELOPMENT")
CURRENT_TIME=$(date +%s)
ELAPSED=$((CURRENT_TIME - SESSION_START))
ELAPSED_MIN=$((ELAPSED / 60))

echo "Session Summary:"
echo "- Type: $SESSION_TYPE"
echo "- Duration: $ELAPSED_MIN minutes"
echo "- Started: $(date -d @$SESSION_START '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r $SESSION_START '+%Y-%m-%d %H:%M:%S' 2>/dev/null)"
echo ""

# Run final checks
echo "Running final checks..."
echo ""

# Check DRS
echo -n "Final DRS Score: "
if [ -f ".drs-score" ]; then
    DRS=$(cat .drs-score)
    if [ "$DRS" -ge 85 ]; then
        echo -e "${GREEN}$DRS/100 - DEPLOYABLE${NC}"
    elif [ "$DRS" -ge 70 ]; then
        echo -e "${YELLOW}$DRS/100 - NEARLY READY${NC}"
    else
        echo -e "${RED}$DRS/100 - MORE WORK NEEDED${NC}"
    fi
else
    echo "Not calculated"
fi

# Check for uncommitted changes
echo -n "Git status: "
if git diff --quiet 2>/dev/null; then
    echo -e "${GREEN}✓ Clean${NC}"
else
    echo -e "${YELLOW}⚠ Uncommitted changes${NC}"
fi

# Generate handoff document
HANDOFF_FILE="handoff-$(date +%Y%m%d-%H%M%S).md"
echo ""
echo "Generating handoff document..."

cat > "$HANDOFF_FILE" << EOF
# Session Handoff Document
Generated: $(date '+%Y-%m-%d %H:%M:%S')

## Session Details
- **Type**: $SESSION_TYPE
- **Duration**: $ELAPSED_MIN minutes
- **DRS Score**: $(cat .drs-score 2>/dev/null || echo "0")/100

## Work Completed
$(git log --oneline -5 2>/dev/null || echo "No commits in this session")

## Current State
### Contracts
$(cat .contract-hashes | head -5 2>/dev/null || echo "No contracts defined")

### Changed Files
$(git diff --name-only 2>/dev/null || echo "No uncommitted changes")

## Next Session Recommendations
EOF

# Add recommendations based on DRS
if [ -f ".drs-score" ]; then
    DRS=$(cat .drs-score)
    if [ "$DRS" -ge 85 ]; then
        echo "- Ready for deployment" >> "$HANDOFF_FILE"
        echo "- Run deployment checks" >> "$HANDOFF_FILE"
    elif [ "$DRS" -ge 70 ]; then
        echo "- Address remaining DRS issues" >> "$HANDOFF_FILE"
        echo "- Focus on: $(grep "✗\|⚠" .drs-details 2>/dev/null | head -2)" >> "$HANDOFF_FILE"
    else
        echo "- Continue development" >> "$HANDOFF_FILE"
        echo "- Priority: Increase DRS score" >> "$HANDOFF_FILE"
    fi
fi

echo "" >> "$HANDOFF_FILE"
echo "## To Resume" >> "$HANDOFF_FILE"
echo '```bash' >> "$HANDOFF_FILE"
echo "./ai-framework/scripts/session-initializer.sh --resume" >> "$HANDOFF_FILE"
echo '```' >> "$HANDOFF_FILE"

echo -e "${GREEN}✓ Handoff document created: $HANDOFF_FILE${NC}"

# Archive session data
echo ""
echo "Archiving session data..."
mkdir -p .session-archive
cp .session-start ".session-archive/session-$SESSION_START.start" 2>/dev/null || true
cp .session-type ".session-archive/session-$SESSION_START.type" 2>/dev/null || true
cp .drs-score ".session-archive/session-$SESSION_START.drs" 2>/dev/null || true

# Clean up session files
echo "Cleaning up session files..."
rm -f .session-start
rm -f .session-type
rm -f .session-active

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Session ended successfully${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Session archived. Handoff document: $HANDOFF_FILE"
echo ""
echo "To start a new session:"
echo "  ./ai-framework/scripts/session-initializer.sh"
echo ""
echo "To resume from handoff:"
echo "  ./ai-framework/scripts/session-initializer.sh --resume"
echo ""

exit 0