#!/bin/bash
# Contract Integrity Checker - Prevents contract drift
# Run every 10 minutes to ensure interfaces remain stable

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "CONTRACT INTEGRITY CHECK"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Define contract files to monitor
CONTRACT_FILES=(
    "api/openapi.yaml"
    "db/schema.sql"
    "api/contracts/*.json"
    "interfaces/*.ts"
)

HASH_FILE=".contract-hashes"

# Function to calculate hashes
calculate_hashes() {
    for file in "${CONTRACT_FILES[@]}"; do
        if [ -f "$file" ]; then
            sha256sum "$file" 2>/dev/null || echo "MISSING $file"
        elif [ -d "$(dirname "$file")" ]; then
            find "$(dirname "$file")" -name "$(basename "$file")" -type f -exec sha256sum {} \; 2>/dev/null
        fi
    done | sort
}

# Check if hash file exists
if [ ! -f "$HASH_FILE" ]; then
    echo -e "${YELLOW}WARNING: No contract hashes found. Initializing...${NC}"
    calculate_hashes > "$HASH_FILE"
    echo -e "${GREEN}Contract hashes initialized and frozen.${NC}"
    exit 0
fi

# Compare current hashes with frozen ones
echo "Checking contract integrity..."
TEMP_HASHES=$(mktemp)
calculate_hashes > "$TEMP_HASHES"

if diff -q "$HASH_FILE" "$TEMP_HASHES" > /dev/null; then
    echo -e "${GREEN}✓ All contracts unchanged${NC}"
    rm "$TEMP_HASHES"
    exit 0
else
    echo -e "${RED}✗ CONTRACT VIOLATION DETECTED!${NC}"
    echo ""
    echo "Changed contracts:"
    diff "$HASH_FILE" "$TEMP_HASHES" | grep "^[<>]" | head -10
    echo ""
    echo -e "${RED}STOP: Contract Change Request (CCR) required${NC}"
    echo "To proceed, you must:"
    echo "1. Document the change necessity"
    echo "2. Update dependent code"
    echo "3. Run: ./approve-contract-change.sh"
    rm "$TEMP_HASHES"
    exit 1
fi