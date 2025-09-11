# Overview — START HERE — File Navigation Guide

## CRITICAL: Read This First
**This framework prevents AI coding agents from:** 
- Creating mocks instead of real connections
- Changing frozen contracts between modules
- Adding unnecessary features and scope
- Giving false sense of progress
- Deviating from defined architecture

## Which File to Use When

### Starting a New Session
1. Read **overview.md** (this file)
2. Load **orchestration.md** - Check gates and boundaries
3. Review **code.md** - Understand current state
4. Select pattern from **patterns.md**
5. Check **requirements.md** - Confirm session goal

### Every 10 Minutes
- Check **orchestration.md** - Run automated stop conditions
- Update **progress.md** - Track deployability score
- Review **todos.md** - Check mock expiration

### When Stuck
- Consult **patterns.md** - Find proven solution
- Check **prompts.md** - Use specific prompt for situation
- Update **todos.md** - Document blocker with expiry

### Before Any Code Change
- Verify **design.md** - Ensure contracts unchanged
- Check **requirements.md** - Stay within session scope
- Reference **patterns.md** - Apply correct pattern

### Ready to Deploy
- Follow **deploy.md** - Complete all checklists
- Update **progress.md** - Confirm 100% deployability
- Clear **todos.md** - No critical items remaining

## File Hierarchy
1. **orchestration.md** - GOVERNS ALL (check every 10 min)
2. **code.md** - Current session state
3. **design.md** - Contract guardian (NEVER modify contracts)
4. **patterns.md** - Must select before coding
5. **requirements.md** - Single test focus
6. **progress.md** - Deployability tracking
7. **deploy.md** - Ship checklist
8. **todos.md** - Active issues
9. **tasks.md** - Task breakdown
10. **overview.md** - High-level context (THIS DOCUMENT)
11. **prompts.md** - AI interaction guide


## Problem
{{User/job-to-be-done}} are struggling with {{pain}} which causes {{impact}}.

## Working-Backwards Validation (Always On)
- Begin each session by checking deploy gates and **DRS**.
- If **DRS < 85**, raise it before adding scope.

## DRS (0–100) — Suggested Weights
- Evidence freshness (3 proofs ≤ 2h): 20
- Contracts stable (no unapproved deltas): 20
- Tests green (contract+integration+perf): 18
- Mocks (0 critical, none expired): 8
- Performance target met (p95): 8
- Observability (trace IDs end-to-end): 8
- Pattern Utilization (success patterns; no antipatterns): 10
- Confidence Hygiene (no LOW/UNCERTAIN w/o ticket): 8

## Learning & Momentum
- Pattern Learning System → see **PATTERNS.md**
- Incremental Success Tracking → see **PROGRESS.md**
- AI Confidence Protocol → declare level + reason + (if needed) one precise human question

## Outcome (Definition of Success)
- Metric 1: {{e.g. time-to-first-value ≤ 30m}}
- Metric 2: {{e.g. p95 latency ≤ 300ms}}
- Metric 3: {{e.g. support tickets/week ↓ 50%}}

## High-Level Approach (Thin Slice First)
Describe the minimal, end-to-end flow that proves value with the fewest moving parts.

## Success Demo Script (2–3 minutes)
1) Do {{action}}  
2) Observe {{result}}  
3) Validate via {{evidence}}

## Risks & Mitigations
- Risk: {{...}} → Mitigation: {{...}}

# Guidance for Each Situation

## A. START — Initialize Session (MANDATORY FIRST STEP)

**Execute exactly:**
1. Load and display orchestration.md
2. Verify contract hash matches design.md
3. Set 30-minute timer
4. Select pattern from patterns.md
5. State: "Session initialized. Pattern [XXX] selected. Confidence: [LEVEL]"

## B. EVERY 10 MINUTES (MANDATORY CHECK)

**Execute exactly:**
1. Run: ./check-contracts.sh
2. Run: ./detect-mocks.sh
3. Run: ./verify-real-endpoints.sh
4. Update progress.md with deployability score
5. State: "10-min check complete. Deployability: [XX]%. Confidence: [LEVEL]"

## C. BEFORE ANY CODE CHANGE

**Execute exactly:**
1. Verify contract hash unchanged
2. Confirm within scope limits (5 files, 200 LOC)
3. Verify pattern being followed
4. State: "Pre-code check complete. Pattern [XXX] applied. Proceeding."

## D. WHEN CONFIDENCE IS LOW

**Execute exactly:**
1. STOP all work
2. Document specific uncertainty
3. List 2-3 specific options with time/impact
4. Ask ONE specific question
5. State: "LOW confidence. Need input on: [specific question]"

## E. WHEN BLOCKED

**Execute exactly:**
1. STOP all work
2. Document blocker in todos.md with timestamp
3. Identify if blocker is technical or external
4. If external: document and wait
5. If technical: try ONE alternative approach using different pattern
6. State: "BLOCKED by [specific issue]. Trying alternative: [approach]"

## F. AT EACH TIME GATE

### 30-Minute Gate
**Must have:**
- Real service connected
- Contract hash frozen
- Pattern selected
- State: "30-min gate: [PASS/FAIL]. Real service: [YES/NO]"

### 60-Minute Gate
**Must have:**
- ONE test passing E2E
- No mocks in code
- 3 Proofs captured
- State: "60-min gate: [PASS/FAIL]. Test passing: [YES/NO]"

### 90-Minute Gate
**Must have:**
- All error paths handled
- Tests green
- Performance acceptable
- State: "90-min gate: [PASS/FAIL]. Deployability: [XX]%"

### 120-Minute Gate
**Must have:**
- DRS >= 85
- Deploy checklist complete
- Rollback tested
- State: "120-min gate: [PASS/FAIL]. Ready to ship: [YES/NO]"

## G. ENDING SESSION

**Execute exactly:**
1. Update all progress percentages
2. Document any new patterns discovered
3. Update todos.md with expiration times
4. Commit with message: "SESSION-END: DRS [XX], Deployability [XX]%, Next: [action]"
5. State: "Session ended. Deployability: [XX]%. Next session should: [specific action]"
