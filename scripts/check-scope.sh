#!/bin/bash
# Scope Control Script - Prevents feature creep
# Enforces: Max 5 files, Max 200 LOC

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "SCOPE BOUNDARY CHECK"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Configuration
MAX_FILES=5
MAX_LINES=200

# Get git statistics
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Not a git repository. Scope check skipped.${NC}"
    exit 0
fi

# Check uncommitted changes
echo "Analyzing scope of changes..."

# Count changed files (excluding tests and docs)
CHANGED_FILES=$(git diff --name-only --diff-filter=ACM | grep -vE '\.(test|spec|md)' | grep -vE '^(test|tests|docs|documentation)/' | wc -l)

# Count lines added (net additions)
LINES_ADDED=$(git diff --stat | tail -1 | awk '{print $4}' | sed 's/[^0-9]//g')
LINES_REMOVED=$(git diff --stat | tail -1 | awk '{print $6}' | sed 's/[^0-9]//g')

# Handle empty values
LINES_ADDED=${LINES_ADDED:-0}
LINES_REMOVED=${LINES_REMOVED:-0}
NET_LINES=$((LINES_ADDED - LINES_REMOVED))

echo "Files changed: $CHANGED_FILES (max: $MAX_FILES)"
echo "Net lines added: $NET_LINES (max: $MAX_LINES)"

# Check violations
VIOLATIONS=0
VIOLATION_MSG=""

if [ "$CHANGED_FILES" -gt "$MAX_FILES" ]; then
    VIOLATIONS=1
    VIOLATION_MSG="${VIOLATION_MSG}\n  - Too many files: $CHANGED_FILES > $MAX_FILES"
fi

if [ "$NET_LINES" -gt "$MAX_LINES" ]; then
    VIOLATIONS=1
    VIOLATION_MSG="${VIOLATION_MSG}\n  - Too many lines: $NET_LINES > $MAX_LINES"
fi

# Report results
if [ $VIOLATIONS -eq 0 ]; then
    echo -e "${GREEN}✓ Within scope boundaries${NC}"
    
    # Show remaining capacity
    FILES_REMAINING=$((MAX_FILES - CHANGED_FILES))
    LINES_REMAINING=$((MAX_LINES - NET_LINES))
    echo ""
    echo "Remaining capacity:"
    echo "  Files: $FILES_REMAINING"
    echo "  Lines: $LINES_REMAINING"
    exit 0
else
    echo -e "${RED}✗ SCOPE VIOLATION DETECTED!${NC}"
    echo -e "$VIOLATION_MSG"
    echo ""
    echo "Required actions:"
    echo "1. Review changes with: git diff --stat"
    echo "2. Identify non-essential changes"
    echo "3. Revert unnecessary modifications"
    echo "4. Focus on ONE specific goal"
    echo ""
    echo "Use PATTERN-003: Scope Sentinel"
    exit 1
fi