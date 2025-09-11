# DEPLOY — Runbook & Rollback

## Pre-Deploy Checklist

- Contract hash unchanged from session start
- Zero mocks in production code path
- All acceptance tests passing
- 3 Proofs captured and fresh (< 2h old)
- DRS >= 85
- Performance within SLO (p95 < 200ms)
- Rollback plan documented and tested

## Deployment Steps

1. Run ./check-contracts.sh - must pass
2. Run ./detect-mocks.sh - must show zero
3. Run acceptance tests - must be green
4. Verify 3 proofs exist and are current
5. Deploy to staging - smoke test
6. Deploy to production - monitor for 5 min
7. If any issues - execute rollback immediately

## Rollback Procedure

- **Trigger:** Any contract mismatch, error rate > 1%, or p95 > 500ms
- **Action:** Revert to previous deployment immediately
- **Time Limit:** Complete rollback within 2 minutes
- **Verification:** Run smoke tests on reverted version