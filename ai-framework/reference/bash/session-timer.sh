#!/bin/bash
# Session Timer - Track elapsed time and gate violations
# Part of AI Control Framework v1.1.0

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Session start tracking file
SESSION_FILE=".session-start"
SESSION_TYPE_FILE=".session-type"

# Get or set session start time
if [ ! -f "$SESSION_FILE" ]; then
    date +%s > "$SESSION_FILE"
    echo "DEVELOPMENT" > "$SESSION_TYPE_FILE"
fi

SESSION_START=$(cat "$SESSION_FILE" 2>/dev/null || echo $(date +%s))
SESSION_TYPE=$(cat "$SESSION_TYPE_FILE" 2>/dev/null || echo "DEVELOPMENT")
CURRENT_TIME=$(date +%s)
ELAPSED=$((CURRENT_TIME - SESSION_START))
ELAPSED_MIN=$((ELAPSED / 60))

echo "========================================="
echo "SESSION TIMER"
echo "========================================="
echo "Session Type: $SESSION_TYPE"
echo "Started: $(date -d @$SESSION_START '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r $SESSION_START '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'Unknown')"
echo "Elapsed: ${ELAPSED_MIN} minutes"
echo ""

# Time gates based on session type
case "$SESSION_TYPE" in
    ASSESSMENT)
        MAX_TIME=30
        ;;
    DEVELOPMENT)
        MAX_TIME=120
        ;;
    DEPLOYMENT)
        MAX_TIME=60
        ;;
    *)
        MAX_TIME=120
        ;;
esac

# Check time gates
if [ $ELAPSED_MIN -lt 30 ]; then
    echo -e "${GREEN}✓ Mock window: ${ELAPSED_MIN}/30 minutes${NC}"
else
    echo -e "${YELLOW}⚠ Mock window expired (30+ minutes)${NC}"
fi

if [ $ELAPSED_MIN -gt $MAX_TIME ]; then
    echo -e "${RED}✗ SESSION TIME LIMIT EXCEEDED!${NC}"
    echo -e "${RED}Maximum for $SESSION_TYPE: $MAX_TIME minutes${NC}"
    echo ""
    echo "Action required:"
    echo "1. Save your work"
    echo "2. Run ./ai-framework/scripts/end-session.sh"
    echo "3. Start a new session"
    exit 1
else
    REMAINING=$((MAX_TIME - ELAPSED_MIN))
    echo -e "Time remaining: ${GREEN}${REMAINING} minutes${NC}"
fi

echo ""
echo "Gates:"
echo "- Mock timeout: 30 minutes"
echo "- Session limit: $MAX_TIME minutes"
echo "- DRS checks: Every 30 minutes"
echo ""

# Check if DRS check is due
if [ $((ELAPSED_MIN % 30)) -eq 0 ] && [ $ELAPSED_MIN -gt 0 ]; then
    echo -e "${YELLOW}⚠ Time for DRS check!${NC}"
    echo "Run: ./ai-framework/scripts/drs-calculate.sh"
fi

exit 0