#!/bin/bash
# Deployability Rating Score (DRS) Calculator
# Implements the 13-component scoring system from specs/drs-calculation.md
# Total: 100 points, Deployment threshold: 85 points

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================="
echo "DEPLOYABILITY RATING SCORE (DRS) v2.0"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Initialize score
DRS=0
MAX_SCORE=100
DETAILS=""

# Component 1: Contract Integrity (7 points)
echo -n "1. Contract Integrity... "
if [ -f ".contract-hashes" ] && "$(dirname "$0")/check-contracts.sh" > /dev/null 2>&1; then
    DRS=$((DRS + 7))
    echo -e "${GREEN}✓ +7${NC}"
    DETAILS="${DETAILS}\n✓ Contract Integrity: 7/7"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Contract Integrity: 0/7"
fi

# Component 2: Behavioral Contracts (7 points)
echo -n "2. Behavioral Contracts... "
# Check for behavioral contract validation (API responses, data flows)
if [ -d "evidence" ] && [ "$(find evidence -name "*contract*" -type f -mmin -120 2>/dev/null | wc -l)" -gt 0 ]; then
    DRS=$((DRS + 7))
    echo -e "${GREEN}✓ +7${NC}"
    DETAILS="${DETAILS}\n✓ Behavioral Contracts: 7/7"
else
    echo -e "${YELLOW}⚠ +4${NC}"
    DRS=$((DRS + 4))
    DETAILS="${DETAILS}\n⚠ Behavioral Contracts: 4/7 (partial)"
fi

# Component 3: Security Validation (16 points - CRITICAL)
echo -n "3. Security Validation... "
SECURITY_SCORE=0
# Check for secrets in code
if ! grep -r "password\|secret\|key\|token" --include="*.js" --include="*.ts" --include="*.py" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | grep -v "// \|# \|/\*" > /dev/null; then
    SECURITY_SCORE=$((SECURITY_SCORE + 8))
fi
# Check for .env.example or secure config
if [ -f ".env.example" ] || [ -f "config/secure.js" ]; then
    SECURITY_SCORE=$((SECURITY_SCORE + 8))
fi
DRS=$((DRS + SECURITY_SCORE))
if [ $SECURITY_SCORE -eq 16 ]; then
    echo -e "${GREEN}✓ +16${NC}"
    DETAILS="${DETAILS}\n✓ Security Validation: 16/16"
elif [ $SECURITY_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${SECURITY_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Security Validation: ${SECURITY_SCORE}/16"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Security Validation: 0/16"
fi

# Component 4: Data Integrity (9 points)
echo -n "4. Data Integrity... "
DATA_SCORE=0
# Check for transaction handling, validation rules
if [ -f "package.json" ] && (grep -q "joi\|yup\|ajv\|zod" package.json 2>/dev/null || [ -d "validators" ]); then
    DATA_SCORE=$((DATA_SCORE + 5))
fi
# Check for database migrations or schema
if [ -d "migrations" ] || [ -f "schema.sql" ] || [ -f "schema.prisma" ]; then
    DATA_SCORE=$((DATA_SCORE + 4))
fi
DRS=$((DRS + DATA_SCORE))
if [ $DATA_SCORE -eq 9 ]; then
    echo -e "${GREEN}✓ +9${NC}"
    DETAILS="${DETAILS}\n✓ Data Integrity: 9/9"
elif [ $DATA_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${DATA_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Data Integrity: ${DATA_SCORE}/9"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Data Integrity: 0/9"
fi

# Component 5: No Mocks (7 points)
echo -n "5. No Mocks... "
if "$(dirname "$0")/detect-mocks.sh" > /dev/null 2>&1; then
    DRS=$((DRS + 7))
    echo -e "${GREEN}✓ +7${NC}"
    DETAILS="${DETAILS}\n✓ No Mocks: 7/7"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ No Mocks: 0/7 (mocks detected)"
fi

# Component 6: Tests Passing (7 points)
echo -n "6. Tests Passing... "
TEST_SCORE=0
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    if npm test > /dev/null 2>&1; then
        TEST_SCORE=7
    else
        TEST_SCORE=0
    fi
elif [ -f "Makefile" ] && grep -q "test:" Makefile; then
    if make test > /dev/null 2>&1; then
        TEST_SCORE=7
    fi
else
    TEST_SCORE=3  # Partial credit if no tests defined
fi
DRS=$((DRS + TEST_SCORE))
if [ $TEST_SCORE -eq 7 ]; then
    echo -e "${GREEN}✓ +7${NC}"
    DETAILS="${DETAILS}\n✓ Tests Passing: 7/7"
elif [ $TEST_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${TEST_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Tests Passing: ${TEST_SCORE}/7"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Tests Passing: 0/7"
fi

# Component 7: Integration Evidence (9 points)
echo -n "7. Integration Evidence... "
EVIDENCE_SCORE=0
if [ -d "evidence" ]; then
    RECENT_EVIDENCE=$(find evidence -type f -mmin -120 2>/dev/null | wc -l)
    if [ "$RECENT_EVIDENCE" -gt 0 ]; then
        EVIDENCE_SCORE=9
    else
        OLD_EVIDENCE=$(find evidence -type f 2>/dev/null | wc -l)
        if [ "$OLD_EVIDENCE" -gt 0 ]; then
            EVIDENCE_SCORE=5
        fi
    fi
fi
DRS=$((DRS + EVIDENCE_SCORE))
if [ $EVIDENCE_SCORE -eq 9 ]; then
    echo -e "${GREEN}✓ +9${NC}"
    DETAILS="${DETAILS}\n✓ Integration Evidence: 9/9"
elif [ $EVIDENCE_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${EVIDENCE_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Integration Evidence: ${EVIDENCE_SCORE}/9 (stale)"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Integration Evidence: 0/9"
fi

# Component 8: Architecture Stability (7 points)
echo -n "8. Architecture Stability... "
ARCH_SCORE=0
# Check for architecture documentation
if [ -f "ARCHITECTURE.md" ] || [ -f "docs/architecture.md" ] || [ -d "docs/adr" ]; then
    ARCH_SCORE=$((ARCH_SCORE + 3))
fi
# Check for consistent module structure
if [ -d "src" ] || [ -d "lib" ] || [ -d "app" ]; then
    ARCH_SCORE=$((ARCH_SCORE + 4))
fi
DRS=$((DRS + ARCH_SCORE))
if [ $ARCH_SCORE -eq 7 ]; then
    echo -e "${GREEN}✓ +7${NC}"
    DETAILS="${DETAILS}\n✓ Architecture Stability: 7/7"
elif [ $ARCH_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${ARCH_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Architecture Stability: ${ARCH_SCORE}/7"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Architecture Stability: 0/7"
fi

# Component 9: Production Readiness (14 points)
echo -n "9. Production Readiness... "
PROD_SCORE=0
# Check for deployment configuration
if [ -f "Dockerfile" ] || [ -f ".dockerignore" ] || [ -f "docker-compose.yml" ]; then
    PROD_SCORE=$((PROD_SCORE + 4))
fi
# Check for environment configuration
if [ -f ".env.example" ] || [ -f "config/production.js" ]; then
    PROD_SCORE=$((PROD_SCORE + 4))
fi
# Check for monitoring/logging
if grep -q "winston\|morgan\|pino\|bunyan" package.json 2>/dev/null || [ -f "logger.js" ]; then
    PROD_SCORE=$((PROD_SCORE + 4))
fi
DRS=$((DRS + PROD_SCORE))
if [ $PROD_SCORE -eq 14 ]; then
    echo -e "${GREEN}✓ +14${NC}"
    DETAILS="${DETAILS}\n✓ Production Readiness: 14/14"
elif [ $PROD_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${PROD_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Production Readiness: ${PROD_SCORE}/14"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Production Readiness: 0/14"
fi

# Component 10: Context Preservation (7 points)
echo -n "10. Context Preservation... "
CONTEXT_SCORE=0
# Check for session tracking files
if [ -f "ai-framework/templates/code.md" ] && [ -f "ai-framework/templates/orchestration.md" ]; then
    CONTEXT_SCORE=$((CONTEXT_SCORE + 4))
fi
# Check for ADR or decision tracking
if [ -d "docs/adr" ] || [ -f "DECISIONS.md" ]; then
    CONTEXT_SCORE=$((CONTEXT_SCORE + 3))
fi
DRS=$((DRS + CONTEXT_SCORE))
if [ $CONTEXT_SCORE -eq 7 ]; then
    echo -e "${GREEN}✓ +7${NC}"
    DETAILS="${DETAILS}\n✓ Context Preservation: 7/7"
elif [ $CONTEXT_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${CONTEXT_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Context Preservation: ${CONTEXT_SCORE}/7"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Context Preservation: 0/7"
fi

# Component 11: Error Handling (4 points)
echo -n "11. Error Handling... "
ERROR_SCORE=0
# Check for error handling patterns
if grep -r "try.*catch\|.catch(\|on.*error" --include="*.js" --include="*.ts" --include="*.py" --exclude-dir=node_modules . 2>/dev/null | head -5 > /dev/null; then
    ERROR_SCORE=4
fi
DRS=$((DRS + ERROR_SCORE))
if [ $ERROR_SCORE -eq 4 ]; then
    echo -e "${GREEN}✓ +4${NC}"
    DETAILS="${DETAILS}\n✓ Error Handling: 4/4"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Error Handling: 0/4"
fi

# Component 12: Scope Compliance (4 points)
echo -n "12. Scope Compliance... "
if "$(dirname "$0")/check-scope.sh" > /dev/null 2>&1; then
    DRS=$((DRS + 4))
    echo -e "${GREEN}✓ +4${NC}"
    DETAILS="${DETAILS}\n✓ Scope Compliance: 4/4"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Scope Compliance: 0/4 (exceeded)"
fi

# Component 13: Documentation (2 points)
echo -n "13. Documentation... "
DOC_SCORE=0
DOC_FILES=0
if [ -f "README.md" ] && [ -s "README.md" ]; then
    DOC_FILES=$((DOC_FILES + 1))
fi
if [ -f "CONTRIBUTING.md" ] || [ -f "docs/contributing.md" ]; then
    DOC_FILES=$((DOC_FILES + 1))
fi
if [ -f "API.md" ] || [ -d "docs/api" ] || [ -f "openapi.yaml" ]; then
    DOC_FILES=$((DOC_FILES + 1))
fi
# Scale to 2 points max
if [ $DOC_FILES -ge 2 ]; then
    DOC_SCORE=2
elif [ $DOC_FILES -eq 1 ]; then
    DOC_SCORE=1
fi
DRS=$((DRS + DOC_SCORE))
if [ $DOC_SCORE -eq 2 ]; then
    echo -e "${GREEN}✓ +2${NC}"
    DETAILS="${DETAILS}\n✓ Documentation: 2/2"
elif [ $DOC_SCORE -gt 0 ]; then
    echo -e "${YELLOW}⚠ +${DOC_SCORE}${NC}"
    DETAILS="${DETAILS}\n⚠ Documentation: ${DOC_SCORE}/2"
else
    echo -e "${RED}✗ 0${NC}"
    DETAILS="${DETAILS}\n✗ Documentation: 0/2"
fi

# Save score to file
echo "$DRS" > .drs-score

# Append to history with timestamp
echo "$(date '+%Y-%m-%d %H:%M:%S') - DRS: $DRS/100" >> .drs-history

# Display results
echo ""
echo "========================================="
echo "COMPONENT BREAKDOWN:"
echo "========================================="
echo -e "$DETAILS"
echo ""
echo "========================================="
echo "FINAL SCORE: $DRS / $MAX_SCORE"
echo "========================================="

# Determine status
if [ $DRS -ge 85 ]; then
    echo -e "${GREEN}✓ DEPLOYABLE${NC} - Ready for production!"
    echo "All critical requirements met."
elif [ $DRS -ge 70 ]; then
    echo -e "${YELLOW}⚠ NEARLY READY${NC} - Address remaining issues"
    echo "Focus on: Security, Testing, and Evidence"
elif [ $DRS -ge 40 ]; then
    echo -e "${YELLOW}⚠ IN PROGRESS${NC} - Core functionality working"
    echo "Add: Real services, tests, and documentation"
else
    echo -e "${RED}✗ EARLY DEVELOPMENT${NC} - Foundation being built"
    echo "Focus on: Contracts, structure, and basic functionality"
fi

echo ""
echo "Deployment threshold: 85/100"
echo "Current gap: $((85 - DRS)) points"

# Return appropriate exit code
if [ $DRS -ge 85 ]; then
    exit 0
else
    exit 1
fi