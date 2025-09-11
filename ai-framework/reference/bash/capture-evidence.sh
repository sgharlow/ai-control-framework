#!/bin/bash
# Evidence Capture Script
# Records real API interactions for audit trail

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
EVIDENCE_DIR="evidence"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Ensure evidence directory exists
mkdir -p "$EVIDENCE_DIR"

# Function to capture API response
capture_api_response() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    local output_file="${EVIDENCE_DIR}/${TIMESTAMP}_api_response.json"
    
    echo "Capturing evidence from: $endpoint"
    echo "Method: $method"
    
    # Build curl command
    CURL_CMD="curl -s -X $method"
    CURL_CMD="$CURL_CMD -H 'Content-Type: application/json'"
    CURL_CMD="$CURL_CMD -w '\n\n---METADATA---\nHTTP_CODE: %{http_code}\nTIME_TOTAL: %{time_total}\nTIME_CONNECT: %{time_connect}\n'"
    
    if [ -n "$data" ]; then
        CURL_CMD="$CURL_CMD -d '$data'"
    fi
    
    CURL_CMD="$CURL_CMD '$endpoint'"
    
    # Execute and capture
    eval "$CURL_CMD" > "$output_file" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Evidence captured: $output_file${NC}"
        
        # Also create a summary
        cat > "${EVIDENCE_DIR}/${TIMESTAMP}_summary.txt" <<EOF
Evidence Capture Summary
========================
Timestamp: $(date)
Endpoint: $endpoint
Method: $method
Response File: $output_file
Session: $(cat ai-framework/templates/code.md | grep "Mission" -A 1 | tail -1)

Verification:
- Real endpoint contacted: YES
- Response captured: YES
- Correlation ID: $(uuidgen 2>/dev/null || echo "N/A")
EOF
        
        echo "Summary saved: ${EVIDENCE_DIR}/${TIMESTAMP}_summary.txt"
        return 0
    else
        echo -e "${RED}✗ Failed to capture evidence${NC}"
        return 1
    fi
}

# Function to capture database state
capture_db_state() {
    local db_url="$1"
    local output_file="${EVIDENCE_DIR}/${TIMESTAMP}_db_state.sql"
    
    echo "Capturing database state..."
    
    if command -v pg_dump &> /dev/null; then
        pg_dump "$db_url" --schema-only > "$output_file" 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database schema captured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ pg_dump not available${NC}"
    fi
}

# Function to capture test results
capture_test_results() {
    local output_file="${EVIDENCE_DIR}/${TIMESTAMP}_test_results.txt"
    
    echo "Capturing test results..."
    
    if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
        npm test > "$output_file" 2>&1 || true
        echo -e "${GREEN}✓ Test results captured${NC}"
    else
        echo -e "${YELLOW}⚠ No test suite found${NC}"
    fi
}

# Function to capture performance metrics
capture_performance() {
    local endpoint="$1"
    local output_file="${EVIDENCE_DIR}/${TIMESTAMP}_performance.txt"
    
    echo "Capturing performance metrics..."
    
    # Run 10 requests and measure
    echo "Performance Test - $(date)" > "$output_file"
    echo "Endpoint: $endpoint" >> "$output_file"
    echo "" >> "$output_file"
    
    for i in {1..10}; do
        response_time=$(curl -o /dev/null -s -w '%{time_total}\n' "$endpoint" 2>/dev/null || echo "FAIL")
        echo "Request $i: ${response_time}s" >> "$output_file"
    done
    
    echo -e "${GREEN}✓ Performance metrics captured${NC}"
}

# Main execution
echo "========================================="
echo "EVIDENCE CAPTURE"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Parse arguments
case "$1" in
    api)
        capture_api_response "$2" "$3" "$4"
        ;;
    db)
        capture_db_state "$2"
        ;;
    test)
        capture_test_results
        ;;
    perf)
        capture_performance "$2"
        ;;
    all)
        # Capture everything
        if [ -n "$2" ]; then
            capture_api_response "$2"
            capture_performance "$2"
        fi
        capture_test_results
        if [ -n "$3" ]; then
            capture_db_state "$3"
        fi
        ;;
    *)
        echo "Usage: $0 {api|db|test|perf|all} [endpoint] [method] [data]"
        echo ""
        echo "Examples:"
        echo "  $0 api https://api.example.com/users GET"
        echo "  $0 api https://api.example.com/users POST '{\"name\":\"test\"}'"
        echo "  $0 db postgresql://localhost/mydb"
        echo "  $0 test"
        echo "  $0 perf https://api.example.com/health"
        echo "  $0 all https://api.example.com/users postgresql://localhost/mydb"
        exit 1
        ;;
esac

# Git commit evidence
if [ -d ".git" ]; then
    git add "${EVIDENCE_DIR}/${TIMESTAMP}*" 2>/dev/null || true
    git commit -m "Evidence: Captured at ${TIMESTAMP}" 2>/dev/null || true
fi

echo ""
echo "Evidence directory: $EVIDENCE_DIR"
echo "Latest evidence: ${TIMESTAMP}*"