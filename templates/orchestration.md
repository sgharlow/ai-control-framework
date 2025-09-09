# ORCHESTRATION — Control Tower & Contract Guardian

This file GOVERNS ALL ACTIONS. Check every 10 minutes. Violations = STOP.

## IMMEDIATE STOP TRIGGERS
**Any of these = STOP EVERYTHING:**
- Contract hash mismatch detected
- Mock found after 30-minute mark
- More than 5 files changed
- More than 200 lines added
- No real API call in last 10 minutes
- Confidence level = LOW or BLOCKED
- Deployability score decreased by more than 10%

## AUTOMATED STOP CONDITIONS (Run Every 10 min)

**Scripts that MUST pass:**
- ./check-contracts.sh - Verifies hash matches frozen contracts
- ./detect-mocks.sh - Fails if mocks detected after 30m mark
- ./check-scope.sh - Fails if files/LOC exceed session limits
- ./verify-real-endpoints.sh - Fails if no real traffic in last 10m

## SESSION SCOPE BOUNDARIES (Hard Limits)

- **Max Files Changed:** 5 files (excluding tests/docs)
- **Max Lines Added:** 200 LOC net additions
- **Max New Dependencies:** 0 (unless pre-approved)
- **Max Contract Changes:** 0 (CCR required for ANY change)
- **Session Goal:** ONE specific acceptance test passing

## CONVERGENCE GATES (Focus on Deployability)

### 0-30 min: Contract Lock & Real Connection
- Contracts frozen with SHA256: _______________
- Real endpoint authenticated & responding
- Scope boundaries set (files/LOC/goal)
- Pattern selected from PATTERNS.md
- **Deployability:** 10%

### 30-60 min: Working Thin Slice
- ONE acceptance test passing E2E
- Real data flowing (no mocks)
- 3 Proofs captured
- **Deployability:** 40%

### 60-90 min: Production-Ready Code
- All error paths handled
- Tests green in CI
- Performance within SLO
- **Deployability:** 70%

### 90-120 min: Ship-Ready
- Rollback tested
- Deploy checklist green
- DRS >= 85
- **Deployability:** 100%

## CONTRACT ENFORCEMENT

**Frozen Contracts:**
- Files: api/openapi.yaml, db/schema.sql
- Hash: sha256:abc123...
- Last Verified: 2025-09-09 14:30

**Enforcement Rules:**
- NO changes without CCR approval
- Auto-revert on hash mismatch
- Breaking change = session ABORT

## CONVERGENCE TRACKING

- **Deployability Score:** 72%
- **Blockers to Deploy:**
  - Authentication: Need real OAuth token
  - Performance: p95 at 450ms (target 200ms)
- **Recovery Actions:**
  - Highest Impact: Fix auth (+20% deployability)
  - Time Estimate: 15 min

## AI CONFIDENCE PROTOCOL

**Status Levels and Required Actions:**
- **HIGH:** Continue as planned
- **MEDIUM:** Focus on highest-impact blocker
- **LOW:** STOP - request human input on specific question
- **BLOCKED:** STOP - cannot proceed without specific dependency