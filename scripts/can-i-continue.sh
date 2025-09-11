#!/bin/bash
# Session Continuation Checker
# Determines if AI agent should continue or stop

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================="
echo "CAN I CONTINUE CHECK"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

CONTINUE=true
WARNINGS=0
ERRORS=0

# Check 1: Contract integrity
echo -n "1. Contract integrity... "
if ./check-contracts.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ STOP - Contract violation${NC}"
    CONTINUE=false
    ((ERRORS++))
fi

# Check 2: Scope boundaries
echo -n "2. Scope boundaries... "
if ./check-scope.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ STOP - Scope exceeded${NC}"
    CONTINUE=false
    ((ERRORS++))
fi

# Check 3: Mock time limit
echo -n "3. Mock time limit... "
if ./detect-mocks.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    SESSION_START_FILE="Claude-template/code.md"
    if [ -f "$SESSION_START_FILE" ]; then
        MINUTES=$((($(date +%s) - $(stat -c %Y "$SESSION_START_FILE" 2>/dev/null || stat -f %m "$SESSION_START_FILE" 2>/dev/null || echo 0)) / 60))
        if [ $MINUTES -gt 30 ]; then
            echo -e "${RED}✗ STOP - Mocks after 30min${NC}"
            CONTINUE=false
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ Warning - Replace mocks soon${NC}"
            ((WARNINGS++))
        fi
    fi
fi

# Check 4: DRS trend
echo -n "4. DRS trend... "
if [ -f ".drs-score" ]; then
    CURRENT_DRS=$(cat .drs-score)
    if [ -f ".drs-history" ]; then
        PREVIOUS_DRS=$(tail -2 .drs-history | head -1 | awk '{print $2}')
        if [ -n "$PREVIOUS_DRS" ] && [ "$CURRENT_DRS" -lt "$((PREVIOUS_DRS - 10))" ]; then
            echo -e "${RED}✗ STOP - DRS declining (${PREVIOUS_DRS} → ${CURRENT_DRS})${NC}"
            CONTINUE=false
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ OK (DRS: ${CURRENT_DRS})${NC}"
        fi
    else
        echo -e "${GREEN}✓ OK (DRS: ${CURRENT_DRS})${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No DRS data${NC}"
    ((WARNINGS++))
fi

# Check 5: Real API activity
echo -n "5. Real API activity... "
EVIDENCE_DIR="evidence"
if [ -d "$EVIDENCE_DIR" ]; then
    RECENT=$(find "$EVIDENCE_DIR" -type f -mmin -10 2>/dev/null | wc -l)
    if [ "$RECENT" -eq 0 ]; then
        echo -e "${YELLOW}⚠ No recent API calls (10min)${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ OK (${RECENT} recent calls)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No evidence directory${NC}"
    ((WARNINGS++))
fi

# Check 6: Session time limits
echo -n "6. Session duration... "
SESSION_START_FILE="Claude-template/code.md"
if [ -f "$SESSION_START_FILE" ]; then
    MINUTES=$((($(date +%s) - $(stat -c %Y "$SESSION_START_FILE" 2>/dev/null || stat -f %m "$SESSION_START_FILE" 2>/dev/null || echo 0)) / 60))
    if [ $MINUTES -gt 120 ]; then
        echo -e "${YELLOW}⚠ Session exceeds 2 hours (${MINUTES}min)${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ OK (${MINUTES}min)${NC}"
    fi
else
    echo -e "${GREEN}✓ OK${NC}"
fi

# Summary
echo ""
echo "========================================="
if [ "$CONTINUE" = true ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}RESULT: CONTINUE${NC}"
    echo "All checks passed. Safe to proceed."
    exit 0
elif [ "$CONTINUE" = true ] && [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}RESULT: CONTINUE WITH CAUTION${NC}"
    echo "Warnings: $WARNINGS - Address these issues soon"
    exit 0
else
    echo -e "${RED}RESULT: STOP IMMEDIATELY${NC}"
    echo "Errors: $ERRORS - Cannot continue"
    echo ""
    echo "Required actions:"
    echo "1. Fix all errors shown above"
    echo "2. Run this check again"
    echo "3. Only proceed when all checks pass"
    exit 1
fi