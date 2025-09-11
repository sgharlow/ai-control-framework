#!/bin/bash
# Contract Change Request (CCR) Approval Script
# LAST RESORT - Only use when contract change is absolutely necessary

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "CONTRACT CHANGE REQUEST (CCR)"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

echo -e "${YELLOW}⚠ WARNING: Contract changes can break integrations${NC}"
echo ""

# Require justification
echo "Please provide justification for contract change:"
echo "(Press Ctrl+C to cancel)"
read -p "Justification: " JUSTIFICATION

if [ -z "$JUSTIFICATION" ]; then
    echo -e "${RED}✗ Justification required${NC}"
    exit 1
fi

# Require impact analysis
echo ""
echo "List affected components (comma-separated):"
read -p "Affected: " AFFECTED

if [ -z "$AFFECTED" ]; then
    echo -e "${RED}✗ Impact analysis required${NC}"
    exit 1
fi

# Backup current hashes
cp .contract-hashes .contract-hashes.backup.$(date +%Y%m%d_%H%M%S)

# Log the CCR
CCR_LOG="ccr-log.txt"
cat >> "$CCR_LOG" <<EOF
========================================
CCR Approved: $(date)
Justification: $JUSTIFICATION
Affected Components: $AFFECTED
Previous Hash File: .contract-hashes.backup.$(date +%Y%m%d_%H%M%S)
========================================

EOF

# Recalculate hashes
echo ""
echo "Recalculating contract hashes..."

CONTRACT_FILES=(
    "api/openapi.yaml"
    "db/schema.sql"
    "api/contracts/*.json"
    "interfaces/*.ts"
)

> .contract-hashes

for file in "${CONTRACT_FILES[@]}"; do
    if [ -f "$file" ]; then
        sha256sum "$file" >> .contract-hashes 2>/dev/null || true
    elif [ -d "$(dirname "$file")" ]; then
        find "$(dirname "$file")" -name "$(basename "$file")" -type f -exec sha256sum {} \; >> .contract-hashes 2>/dev/null || true
    fi
done

echo -e "${GREEN}✓ Contract hashes updated${NC}"

# Reset DRS
echo "0" > .drs-score
echo "$(date '+%Y-%m-%d %H:%M:%S'): 0 (CCR Reset)" >> .drs-history

# Update code.md
if [ -f "ai-framework/templates/code.md" ]; then
    echo ""
    echo "Updating session control..."
    # Note: In real implementation, this would update the file
    echo -e "${YELLOW}⚠ Remember to update code.md with new contract details${NC}"
fi

# Git commit the change
if [ -d ".git" ]; then
    git add .contract-hashes "$CCR_LOG"
    git commit -m "CCR: $JUSTIFICATION" || true
fi

echo ""
echo -e "${GREEN}CONTRACT CHANGE APPROVED${NC}"
echo "Next steps:"
echo "1. Run full regression tests"
echo "2. Update all dependent code"
echo "3. Verify integrations still work"
echo "4. Run ./drs-calculate.sh to measure impact"