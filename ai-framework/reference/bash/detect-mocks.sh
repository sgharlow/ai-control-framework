#!/bin/bash
# Mock Detection Script - Enforces real service usage
# Fails if mocks detected after 30-minute mark

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "MOCK DETECTION SCAN"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Get session start time from code.md if it exists
SESSION_START_FILE="ai-framework/templates/code.md"
if [ -f "$SESSION_START_FILE" ]; then
    SESSION_DURATION=$(($(date +%s) - $(stat -c %Y "$SESSION_START_FILE" 2>/dev/null || stat -f %m "$SESSION_START_FILE" 2>/dev/null || echo 0)))
    MINUTES=$((SESSION_DURATION / 60))
    echo "Session duration: ${MINUTES} minutes"
else
    MINUTES=0
fi

# Define directories to scan (excluding test directories)
SCAN_DIRS=(
    "src"
    "lib"
    "app"
    "api"
    "services"
    "components"
)

# Mock indicators to search for
MOCK_PATTERNS=(
    "mock"
    "stub"
    "fake"
    "dummy"
    "test.*data"
    "hardcoded.*response"
    "setTimeout.*simulate"
    "Promise.resolve.*fake"
)

# Build grep pattern
PATTERN=""
for p in "${MOCK_PATTERNS[@]}"; do
    if [ -z "$PATTERN" ]; then
        PATTERN="$p"
    else
        PATTERN="$PATTERN|$p"
    fi
done

# Scan for mocks
echo "Scanning for mock implementations..."
MOCK_COUNT=0
MOCK_FILES=()

for dir in "${SCAN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        while IFS= read -r file; do
            if grep -qiE "($PATTERN)" "$file" 2>/dev/null; then
                # Exclude legitimate test files
                if [[ ! "$file" =~ \.(test|spec|mock)\. ]]; then
                    MOCK_FILES+=("$file")
                    ((MOCK_COUNT++))
                fi
            fi
        done < <(find "$dir" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.rb" -o -name "*.java" \) 2>/dev/null)
    fi
done

# Report results
if [ $MOCK_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ No mocks detected in production code${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Found $MOCK_COUNT files with potential mocks:${NC}"
    for file in "${MOCK_FILES[@]}"; do
        echo "  - $file"
        grep -nHiE "($PATTERN)" "$file" | head -2
    done
    
    # Enforce 30-minute rule
    if [ $MINUTES -gt 30 ]; then
        echo ""
        echo -e "${RED}✗ VIOLATION: Mocks detected after 30-minute mark!${NC}"
        echo "Required action: Replace all mocks with real service calls"
        echo "Use PATTERN-001: Real Service First"
        exit 1
    else
        echo ""
        echo -e "${YELLOW}Warning: You have $((30 - MINUTES)) minutes to replace mocks${NC}"
        exit 0
    fi
fi