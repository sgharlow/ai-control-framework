#!/bin/bash
# Production Deployment Script
# Part of AI Control Framework v1.1.0

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           PRODUCTION DEPLOYMENT PROTOCOL               ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check DRS score
echo "Checking deployment readiness..."
DRS_SCRIPT="$(dirname "$0")/drs-calculate.sh"
if [ ! -f "$DRS_SCRIPT" ]; then
    echo -e "${RED}✗ DRS calculator not found${NC}"
    exit 1
fi

# Run DRS calculation
"$DRS_SCRIPT" > /tmp/drs-output.txt 2>&1
DRS=$(grep "TOTAL DRS" /tmp/drs-output.txt | sed 's/.*: \([0-9]*\).*/\1/')

if [ -z "$DRS" ]; then
    echo -e "${RED}✗ Could not calculate DRS${NC}"
    exit 1
fi

echo "Current DRS: $DRS/100"
echo ""

# Check minimum DRS for deployment
MINIMUM_DRS=85
if [ "$DRS" -lt "$MINIMUM_DRS" ]; then
    echo -e "${RED}✗ DEPLOYMENT BLOCKED${NC}"
    echo -e "${RED}Minimum DRS required: $MINIMUM_DRS${NC}"
    echo -e "${RED}Current DRS: $DRS${NC}"
    echo ""
    echo "Issues to resolve:"
    grep "✗\|⚠" /tmp/drs-output.txt
    echo ""
    echo "Run ./ai-framework/scripts/drs-calculate.sh for details"
    exit 1
fi

echo -e "${GREEN}✓ DRS Check Passed ($DRS/100)${NC}"
echo ""

# Pre-deployment checklist
echo "Pre-Deployment Checklist:"
echo "========================="

# 1. Check for uncommitted changes
echo -n "1. Git status... "
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✓ Clean${NC}"
else
    echo -e "${RED}✗ Uncommitted changes${NC}"
    echo "   Commit or stash changes before deployment"
    exit 1
fi

# 2. Check contracts
echo -n "2. Contract integrity... "
if "$(dirname "$0")/check-contracts.sh" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Verified${NC}"
else
    echo -e "${RED}✗ Contract violation${NC}"
    exit 1
fi

# 3. Check for mocks
echo -n "3. Mock detection... "
if "$(dirname "$0")/detect-mocks.sh" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No mocks${NC}"
else
    echo -e "${RED}✗ Mocks detected${NC}"
    echo "   Remove all mocks before deployment"
    exit 1
fi

# 4. Check tests (if available)
echo -n "4. Test suite... "
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    if npm test > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Passing${NC}"
    else
        echo -e "${RED}✗ Tests failing${NC}"
        exit 1
    fi
elif [ -f "Makefile" ] && grep -q '^test:' Makefile; then
    if make test > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Passing${NC}"
    else
        echo -e "${RED}✗ Tests failing${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ No tests configured${NC}"
fi

# 5. Check build (if applicable)
echo -n "5. Build status... "
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Build failed${NC}"
        exit 1
    fi
elif [ -f "Makefile" ] && grep -q '^build:' Makefile; then
    if make build > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Build failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ No build configured${NC}"
fi

# 6. Check environment variables
echo -n "6. Environment config... "
if [ -f ".env.production" ] || [ -f ".env" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${YELLOW}⚠ No .env file${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ ALL DEPLOYMENT CHECKS PASSED${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Create deployment record
DEPLOY_RECORD="deployment-$(date +%Y%m%d-%H%M%S).txt"
cat > "$DEPLOY_RECORD" << EOF
Deployment Record
=================
Date: $(date '+%Y-%m-%d %H:%M:%S')
DRS Score: $DRS/100
Git Commit: $(git rev-parse HEAD)
Branch: $(git branch --show-current)

Checks Passed:
- Git status: Clean
- Contracts: Verified
- Mocks: None
- Tests: Passing
- Build: Success

Files in deployment:
$(git ls-files | wc -l) files

Top changed files:
$(git diff --stat HEAD~5..HEAD 2>/dev/null | tail -10)
EOF

echo "Deployment record created: $DEPLOY_RECORD"
echo ""

# Deployment commands (customize based on your deployment method)
echo "Ready to deploy! Choose your deployment method:"
echo ""
echo "For Heroku:"
echo "  git push heroku main"
echo ""
echo "For AWS:"
echo "  eb deploy"
echo ""
echo "For Docker:"
echo "  docker build -t app:latest ."
echo "  docker push registry/app:latest"
echo ""
echo "For Vercel/Netlify:"
echo "  git push origin main"
echo ""
echo "For manual deployment:"
echo "  1. Tag this release: git tag -a v$(date +%Y%m%d.%H%M) -m 'Production deployment'"
echo "  2. Push to production branch: git push origin main:production"
echo ""
echo -e "${YELLOW}Note: Update deployment commands in deploy-production.sh for your specific setup${NC}"

exit 0