# SESSION CONTROL — Read First, Check Often
**Purpose: Current state tracking for AI agents**

## Mission (ONE Thing)

- **Goal:** Implement core functionality with test coverage
- **Pattern:** See patterns.md for applicable patterns
- **Scope:** 5 files max, 200 LOC max

## Contracts (Frozen)

- **Files:** interfaces/, api/contracts/, models/
- **Hash:** Run check-contracts.sh to initialize
- **Status:** PENDING INITIALIZATION

## Real Services (No Mocks)

- **API Endpoint:** https://api.example.com (configure your endpoint)
- **Auth Service:** https://auth.example.com (configure your auth)
- **Database:** postgresql://localhost:5432/dbname (configure your DB)
- **Last Real Call:** Pending first connection

## Deployability Score

- **Current:** 0% (Not initialized)
- **Target:** 100%
- **Blockers:**
  - No contracts defined
  - No real services connected
  - No tests created
- **Next Action:** Define project contracts and goals
- **Time to Deployable:** TBD after initialization

## Stop Conditions (Any = STOP)

- Contract hash mismatch
- Mock detected after 30m
- Scope exceeded (files/LOC)
- Confidence = LOW/BLOCKED
- No real API calls in 10m
