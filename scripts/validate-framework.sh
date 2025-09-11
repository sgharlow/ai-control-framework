#!/bin/bash
# AI Control Framework Validation Suite
# Tests all framework components to ensure correct operation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        AI Control Framework Validation Suite           ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="${3:-0}"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        if [ "$expected_result" -eq 0 ]; then
            echo -e "${GREEN}✓ PASSED${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${RED}✗ FAILED (expected failure but passed)${NC}"
            ((TESTS_FAILED++))
            return 1
        fi
    else
        if [ "$expected_result" -ne 0 ]; then
            echo -e "${GREEN}✓ PASSED (correctly failed)${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${RED}✗ FAILED${NC}"
            ((TESTS_FAILED++))
            return 1
        fi
    fi
}

# Create test environment
TEST_DIR=$(mktemp -d)
cd "$TEST_DIR"
echo "Test directory: $TEST_DIR"
echo ""

# Copy framework files
cp -r "$(dirname "$0")/scripts" . 2>/dev/null || true
cp -r "$(dirname "$0")/Claude-template" . 2>/dev/null || true
cp "$(dirname "$0")/CLAUDE.md" . 2>/dev/null || true

# Initialize git repo for testing
git init > /dev/null 2>&1
git config user.email "test@example.com"
git config user.name "Test User"

echo "═══════════════════════════════════════════════════════"
echo "1. INSTALLATION TESTS"
echo "═══════════════════════════════════════════════════════"

run_test "Framework directories exist" "[ -d scripts ] && [ -d Claude-template ]"
run_test "Scripts are executable" "[ -x scripts/check-contracts.sh ]"
run_test "CLAUDE.md exists" "[ -f CLAUDE.md ]"
run_test "Templates exist" "[ -d Claude-template/templates ]"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "2. CONTRACT TESTS"
echo "═══════════════════════════════════════════════════════"

# Create test contract files
mkdir -p api db
echo "openapi: 3.0.0" > api/openapi.yaml
echo "CREATE TABLE users (id INT);" > db/schema.sql

run_test "Initialize contracts" "./scripts/check-contracts.sh"
run_test "Contract hashes created" "[ -f .contract-hashes ]"

# Modify contract to test violation detection
echo "openapi: 3.0.1" > api/openapi.yaml
run_test "Detect contract violation" "./scripts/check-contracts.sh" 1

# Restore contract
echo "openapi: 3.0.0" > api/openapi.yaml
run_test "Contract restored" "./scripts/check-contracts.sh"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "3. MOCK DETECTION TESTS"
echo "═══════════════════════════════════════════════════════"

# Create test files with and without mocks
mkdir -p src
cat > src/service.js << 'EOF'
function getUsers() {
    return fetch('/api/users');
}
EOF

run_test "No mocks detected (clean)" "./scripts/detect-mocks.sh"

# Add mock
cat > src/service.js << 'EOF'
const mockUsers = [{id: 1, name: 'Test'}];
function getUsers() {
    return mockUsers;
}
EOF

# Set session start time to test timeout
touch -t $(date -d '35 minutes ago' +%Y%m%d%H%M) Claude-template/code.md 2>/dev/null || \
touch -t $(date -v-35M +%Y%m%d%H%M) Claude-template/code.md 2>/dev/null || true

run_test "Mock timeout violation" "./scripts/detect-mocks.sh" 1

# Reset for fresh session
touch Claude-template/code.md
run_test "Mock allowed in new session" "./scripts/detect-mocks.sh"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "4. SCOPE CONTROL TESTS"
echo "═══════════════════════════════════════════════════════"

# Test within limits
echo "test" > file1.txt
echo "test" > file2.txt
git add .
git commit -m "Initial" > /dev/null 2>&1

echo "change" > file1.txt
echo "change" > file2.txt
run_test "Within file limits (2 files)" "./scripts/check-scope.sh"

# Test exceeding limits
for i in {3..10}; do
    echo "change" > "file$i.txt"
done
run_test "Detect file limit exceeded" "./scripts/check-scope.sh" 1

# Reset
git reset --hard > /dev/null 2>&1

echo ""
echo "═══════════════════════════════════════════════════════"
echo "5. DRS CALCULATION TESTS"
echo "═══════════════════════════════════════════════════════"

run_test "DRS calculation runs" "./scripts/drs-calculate.sh"
run_test "DRS score file created" "[ -f .drs-score ]"
run_test "DRS history tracked" "[ -f .drs-history ]"

# Check DRS value is reasonable
DRS=$(cat .drs-score)
if [ "$DRS" -ge 0 ] && [ "$DRS" -le 100 ]; then
    echo -e "DRS value reasonable: ${GREEN}$DRS/100${NC}"
    ((TESTS_PASSED++))
else
    echo -e "DRS value invalid: ${RED}$DRS${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "6. EVIDENCE CAPTURE TESTS"
echo "═══════════════════════════════════════════════════════"

mkdir -p evidence
run_test "Evidence directory created" "[ -d evidence ]"

# Test evidence capture (mock endpoint)
./scripts/capture-evidence.sh test > /dev/null 2>&1 || true
run_test "Evidence files created" "ls evidence/*.txt 2>/dev/null | grep -q '.'"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "7. MASTER CHECK TESTS"
echo "═══════════════════════════════════════════════════════"

run_test "Can-I-Continue runs" "./scripts/can-i-continue.sh"

# Create a violation scenario
echo "openapi: 3.0.1" > api/openapi.yaml
run_test "Can-I-Continue detects issues" "./scripts/can-i-continue.sh" 1

# Fix violation
echo "openapi: 3.0.0" > api/openapi.yaml
run_test "Can-I-Continue passes after fix" "./scripts/can-i-continue.sh"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "8. FRAMEWORK INTEGRATION TESTS"
echo "═══════════════════════════════════════════════════════"

# Test typical workflow sequence
run_test "Initialize project" "touch .contract-hashes && echo 15 > .drs-score"
run_test "Check contracts" "./scripts/check-contracts.sh"
run_test "Check mocks" "./scripts/detect-mocks.sh"
run_test "Check scope" "./scripts/check-scope.sh"
run_test "Calculate DRS" "./scripts/drs-calculate.sh"
run_test "Final safety check" "./scripts/can-i-continue.sh"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "9. GIT HOOKS TESTS"
echo "═══════════════════════════════════════════════════════"

# Create pre-commit hook
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
./scripts/check-contracts.sh || exit 1
./scripts/check-scope.sh || exit 1
EOF
chmod +x .git/hooks/pre-commit

echo "change" > test-commit.txt
git add test-commit.txt
run_test "Pre-commit hook runs" "git commit -m 'Test commit'" 0

echo ""
echo "═══════════════════════════════════════════════════════"
echo "10. DOCUMENTATION TESTS"
echo "═══════════════════════════════════════════════════════"

run_test "Code.md template exists" "[ -f Claude-template/code.md ]"
run_test "Orchestration.md exists" "[ -f Claude-template/templates/orchestration.md ]"
run_test "Patterns.md exists" "[ -f Claude-template/templates/patterns.md ]"
run_test "CLAUDE.md configuration exists" "[ -f CLAUDE.md ]"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED - Framework is ready for use!${NC}"
    echo ""
    echo "The AI Control Framework has been validated and is"
    echo "functioning correctly. You can now use it with confidence."
    RESULT=0
else
    echo -e "${RED}✗ VALIDATION FAILED - $TESTS_FAILED tests did not pass${NC}"
    echo ""
    echo "Please review the failures above and ensure all framework"
    echo "components are properly installed."
    RESULT=1
fi

# Cleanup
cd - > /dev/null
rm -rf "$TEST_DIR"

echo ""
echo "═══════════════════════════════════════════════════════"

exit $RESULT