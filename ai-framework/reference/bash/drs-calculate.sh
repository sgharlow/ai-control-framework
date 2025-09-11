#!/bin/bash
# Deployability Rating Score (DRS) Calculator
# Measures actual convergence toward production readiness

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================="
echo "DEPLOYABILITY RATING SCORE (DRS)"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Initialize score
DRS=0
MAX_SCORE=100
DETAILS=""

# Check 1: Contract Integrity (20 points)
echo -n "Checking contract integrity... "
if "$(dirname "$0")/check-contracts.sh" > /dev/null 2>&1; then
    DRS=$((DRS + 20))
    echo -e "${GREEN}✓ +20${NC}"
    DETAILS="${DETAILS}\n✓ Contracts unchanged (20/20)"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Contract violation (0/20)"
fi

# Check 2: No Mocks in Production Path (20 points)
echo -n "Checking for mocks... "
if "$(dirname "$0")/detect-mocks.sh" > /dev/null 2>&1; then
    DRS=$((DRS + 20))
    echo -e "${GREEN}✓ +20${NC}"
    DETAILS="${DETAILS}\n✓ No mocks detected (20/20)"
else
    echo -e "${YELLOW}⚠ 0${NC}"
    DETAILS="${DETAILS}\n⚠ Mocks present (0/20)"
fi

# Check 3: Tests Passing (15 points)
echo -n "Checking test status... "
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    if npm test > /dev/null 2>&1; then
        DRS=$((DRS + 15))
        echo -e "${GREEN}✓ +15${NC}"
        DETAILS="${DETAILS}\n✓ All tests passing (15/15)"
    else
        echo -e "${RED}✗ 0${NC}"
        DETAILS="${DETAILS}\n✗ Tests failing (0/15)"
    fi
else
    echo -e "${YELLOW}? +7${NC}"
    DRS=$((DRS + 7))
    DETAILS="${DETAILS}\n? No tests found (7/15)"
fi

# Check 4: Scope Control (10 points)
echo -n "Checking scope boundaries... "
if "$(dirname "$0")/check-scope.sh" > /dev/null 2>&1; then
    DRS=$((DRS + 10))
    echo -e "${GREEN}✓ +10${NC}"
    DETAILS="${DETAILS}\n✓ Within scope (10/10)"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Scope exceeded (0/10)"
fi

# Check 5: Real API Evidence (15 points)
echo -n "Checking for real API evidence... "
EVIDENCE_DIR="evidence"
if [ -d "$EVIDENCE_DIR" ]; then
    RECENT_EVIDENCE=$(find "$EVIDENCE_DIR" -type f -mmin -120 2>/dev/null | wc -l)
    if [ "$RECENT_EVIDENCE" -gt 0 ]; then
        DRS=$((DRS + 15))
        echo -e "${GREEN}✓ +15${NC}"
        DETAILS="${DETAILS}\n✓ Recent API evidence (15/15)"
    else
        DRS=$((DRS + 5))
        echo -e "${YELLOW}⚠ +5${NC}"
        DETAILS="${DETAILS}\n⚠ Stale API evidence (5/15)"
    fi
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ No API evidence (0/15)"
fi

# Check 6: Documentation (10 points)
echo -n "Checking documentation... "
DOCS_COMPLETE=0
[ -f "ai-framework/templates/code.md" ] && ((DOCS_COMPLETE++))
[ -f "ai-framework/templates/progress.md" ] && ((DOCS_COMPLETE++))
[ -f "ai-framework/templates/tasks.md" ] && ((DOCS_COMPLETE++))

if [ $DOCS_COMPLETE -eq 3 ]; then
    DRS=$((DRS + 10))
    echo -e "${GREEN}✓ +10${NC}"
    DETAILS="${DETAILS}\n✓ Documentation complete (10/10)"
elif [ $DOCS_COMPLETE -gt 0 ]; then
    PARTIAL=$((DOCS_COMPLETE * 3))
    DRS=$((DRS + PARTIAL))
    echo -e "${YELLOW}⚠ +${PARTIAL}${NC}"
    DETAILS="${DETAILS}\n⚠ Partial documentation (${PARTIAL}/10)"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ No documentation (0/10)"
fi

# Check 7: Error Handling (10 points)
echo -n "Checking error handling... "
ERROR_PATTERNS=$(grep -r "catch\|except\|rescue\|on.*error" --include="*.js" --include="*.ts" --include="*.py" --include="*.rb" src/ 2>/dev/null | wc -l)
if [ "$ERROR_PATTERNS" -gt 5 ]; then
    DRS=$((DRS + 10))
    echo -e "${GREEN}✓ +10${NC}"
    DETAILS="${DETAILS}\n✓ Error handling present (10/10)"
elif [ "$ERROR_PATTERNS" -gt 0 ]; then
    DRS=$((DRS + 5))
    echo -e "${YELLOW}⚠ +5${NC}"
    DETAILS="${DETAILS}\n⚠ Basic error handling (5/10)"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ No error handling (0/10)"
fi

# Calculate final score
echo ""
echo "========================================="
echo -e "DEPLOYABILITY SCORE: ${DRS}/${MAX_SCORE}"
echo "========================================="

# Show details
echo -e "\nBreakdown:$DETAILS"

# Deployment readiness assessment
echo ""
if [ $DRS -ge 85 ]; then
    echo -e "${GREEN}★ READY TO DEPLOY ★${NC}"
    echo "Run: ./deploy-production.sh"
elif [ $DRS -ge 70 ]; then
    echo -e "${YELLOW}⚠ NEARLY READY${NC}"
    echo "Address remaining issues to reach 85+ DRS"
elif [ $DRS -ge 50 ]; then
    echo -e "${YELLOW}⚠ MAKING PROGRESS${NC}"
    echo "Focus on highest-impact improvements"
else
    echo -e "${RED}✗ NOT DEPLOYABLE${NC}"
    echo "Major issues need resolution"
fi

# Save score to file for tracking
echo "$DRS" > .drs-score
echo "$(date '+%Y-%m-%d %H:%M:%S'): $DRS" >> .drs-history

exit 0