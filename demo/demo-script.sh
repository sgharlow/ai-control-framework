#!/bin/bash
# AI Control Framework Demo Script
#
# This script simulates a DRS calculation for GIF/video recording.
# Use with: asciinema, terminalizer, or screen recording software.
#
# To record: asciinema rec demo.cast
# To convert: agg demo.cast demo.gif
#
# Recommended terminal settings:
# - Font: 16pt monospace
# - Window: 80x24 characters
# - Theme: Dark background

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Typing effect function
type_text() {
    local text="$1"
    local delay="${2:-0.03}"
    for (( i=0; i<${#text}; i++ )); do
        echo -n "${text:$i:1}"
        sleep "$delay"
    done
    echo ""
}

# Simulate command with typing effect
run_command() {
    local cmd="$1"
    echo -ne "${GREEN}\$${NC} "
    type_text "$cmd" 0.04
    sleep 0.5
}

# Clear and show title
clear
echo ""
echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════════════════════════════╗"
echo "  ║          AI CONTROL FRAMEWORK - DEMO                     ║"
echo "  ║          Stop shipping non-deployable AI code            ║"
echo "  ╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
sleep 2

# Step 1: Show problem
echo ""
echo -e "${YELLOW}▶ The Problem: Is this AI-generated code ready to deploy?${NC}"
sleep 1.5
echo ""
echo "   Most developers: \"Uh... maybe? Let me check...\" 🤔"
sleep 1.5
echo "   With this framework: Run one command. Get a score."
sleep 2

# Step 2: Run DRS calculation
echo ""
echo -e "${YELLOW}▶ Step 1: Check Deployability Rating Score (DRS)${NC}"
sleep 1
echo ""

run_command "./ai-framework/reference/bash/drs-calculate.sh"
sleep 0.5

# Simulated DRS output
echo ""
echo -e "${CYAN}Scanning project...${NC}"
sleep 0.8
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${BOLD}         DEPLOYABILITY RATING SCORE: ${RED}34/100${NC}${BOLD}            ${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
sleep 0.3
echo -e "${RED}✗${NC} Contract Integrity      (0/8)   ${RED}← No contracts frozen${NC}"
sleep 0.2
echo -e "${RED}✗${NC} No Mocks                (0/8)   ${RED}← 7 mocks detected${NC}"
sleep 0.2
echo -e "${YELLOW}⚠${NC} Tests Passing           (4/7)   ${YELLOW}← 2 tests failing${NC}"
sleep 0.2
echo -e "${YELLOW}⚠${NC} Scope Compliance        (2/4)   ${YELLOW}← 8 files changed${NC}"
sleep 0.2
echo -e "${GREEN}✓${NC} Documentation           (3/3)"
sleep 0.2
echo -e "${GREEN}✓${NC} Error Handling          (4/4)"
sleep 0.2
echo ""
echo -e "${RED}${BOLD}❌ NOT READY TO DEPLOY - DRS < 85${NC}"
echo ""
sleep 2

# Step 3: Show what needs fixing
echo -e "${YELLOW}▶ Step 2: Framework tells you exactly what to fix${NC}"
sleep 1.5
echo ""
echo "   To reach DRS 85 (deploy-ready):"
echo ""
echo "   1. Replace 7 mock data patterns with real API calls"
echo "   2. Freeze contracts: ./ai-framework/scripts/freeze-contracts.sh"
echo "   3. Fix 2 failing tests in auth.test.ts"
echo ""
sleep 2.5

# Step 4: After fixes
echo -e "${YELLOW}▶ Step 3: After 45 minutes of focused work...${NC}"
sleep 1
echo ""

run_command "./ai-framework/reference/bash/drs-calculate.sh"
sleep 0.5

# Improved DRS output
echo ""
echo -e "${CYAN}Scanning project...${NC}"
sleep 0.8
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${BOLD}         DEPLOYABILITY RATING SCORE: ${GREEN}87/100${NC}${BOLD}            ${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
sleep 0.3
echo -e "${GREEN}✓${NC} Contract Integrity      (8/8)"
sleep 0.2
echo -e "${GREEN}✓${NC} No Mocks                (8/8)"
sleep 0.2
echo -e "${GREEN}✓${NC} Tests Passing           (7/7)"
sleep 0.2
echo -e "${GREEN}✓${NC} Scope Compliance        (4/4)"
sleep 0.2
echo -e "${GREEN}✓${NC} Documentation           (3/3)"
sleep 0.2
echo -e "${GREEN}✓${NC} Error Handling          (4/4)"
sleep 0.2
echo ""
echo -e "${GREEN}${BOLD}✅ READY TO DEPLOY - DRS ≥ 85${NC}"
echo ""
sleep 2

# Summary
echo ""
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}  RESULTS                                                   ${NC}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Before framework:  \"Is it ready?\" → \"Maybe...\" 😬"
echo "  After framework:   \"Is it ready?\" → \"DRS 87. Ship it.\" ✅"
echo ""
echo "  Time saved: 3-5 days of rework → 45 minutes of fixes"
echo ""
sleep 2

# CTA
echo ""
echo -e "${GREEN}${BOLD}  Try it now:${NC}"
echo ""
echo "  git clone https://github.com/sgharlow/ai-control-framework"
echo "  ./install.sh your-project"
echo ""
echo -e "${CYAN}  Stop hoping AI code will work. Start knowing it will deploy.${NC}"
echo ""
sleep 3
