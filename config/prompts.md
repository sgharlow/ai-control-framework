# Prompts — A–O
**Purpose: Exact instructions for AI agents to follow**

## A. START — Initialize Session
- Load `orchestration.md`, verify contract hash, set first gate (30m), declare confidence.

## B. SET CONTEXT — Rules of Engagement (updated)
- `orchestration.md` governs ALL actions — check every 10–15 minutes.
- **Declare confidence** with each decision (level + reason + question if needed).
- **Check PATTERNS.md** before implementing anything.
- Contracts are **FROZEN** — any changes require CCR.

## C. RESUME WORK — Re-enter Safely (updated)
1. `./can-i-continue.sh`
2. `./drs-calculate.sh`
3. `git diff --stat` (verify no contract files changed)
4. **Identify applicable patterns** (`PATTERNS.md`)
5. **Recompute partial progress** (`PROGRESS.md`)
**Continue only if:** DRS is stable/improving, can add ≥10% progress this session, and confidence ≥ MEDIUM (or human input is available).

## D. PLAN — Smallest Next Win
- Choose the smallest change that increases **DRS** and partial progress.

## E. VERIFY WORK — Compliance Audit (updated)
Check each file for violations:
- **orchestration.md**: Mode rules followed? Time gates met? Evidence cadence? **Confidence declared? Patterns checked?**
- **tasks.md**: Real service connections? DoD met? **Partial progress tracked?** Confidence ≥ MEDIUM?
- **todos.md**: Mocks < 72h with expiry?  
- **deploy.md**: All gates green? **DRS ≥ 85?**

## F. BLOCKED — Handle Hard Stops
- State the blocker in `tasks.md` (timestamp, attempted fixes, required external action, ETA).
- Diagnosis → `./can-i-continue.sh`, anti-pattern check, `deploy.md` gates.
- If blocked by contract violation → STOP; file CCR.

## G. DEPLOY — Ready for Production
- Run `./deploy-check.sh --verbose`  
- All must be green (DRS ≥ 85, contract hashes unchanged, zero prod-path mocks, no TODOs w/o expiry, evidence < 2h, negative evidence noted).
- Pre-deploy proof: real endpoint health, working flow with corr-ID, rollback plan.
- Deploy: `./deploy-production.sh --require-all-gates`

## H. DEBUG — Fix Without Scope Creep
- Mode = DEBUGGER; minimum change; add a regression test; update evidence.

## I. HANDOFF — End of Session
- `./drs-calculate.sh > handoff.txt`, `git status >> handoff.txt`, `./can-i-continue.sh >> handoff.txt`
- Update `orchestration.md` session state; checkpoint `tasks.md` (partials) and `todos.md` (mock expiries).
- Commit: `SESSION-END: DRS [XX], Task [XXX] [STATUS], Next: [ACTION]`

## J. EMERGENCY — Contract Change Required (LAST RESORT)
- CCR: justify, prove no alternative, document impact, freeze new hash, full regression, reset DRS.

## K. EVIDENCE — Generate Proof Now (every 30m)
- Required proofs: real connection, integration corr-ID, negative evidence, perf.

## L. CHECKPOINT — Time Gate Validation
- 30m: real services connected?  
- 60m: working demo slice?  
- 90m: DRS improving?  
- 120m: deploy-ready?  

## M. DECLINE — DRS Degradation Response (updated)
- Show **DRS trend**, **% progress**, **confidence trend**, and suggest known recovery patterns.  
- Rule: no new work until trend reverses. Target: DRS ≥ 85 in 15 minutes or STOP.

## N. UNCERTAINTY — Request Human Guidance (new)
Overall Confidence: LOW/UNCERTAIN
Task Completion: X%
Specific Uncertainty: <exact issue>
Pattern Search: best match PATTERN-### (Y% similar; success Z%)
Options:
  A) <option> — Time ~Y min; Progress +Z%
  B) <option> — Time ~Y2 min; Progress +Z2%
What I need (one question): <precise question>
Default in 5 minutes if no reply: <safe default>

## O. PR-READY — Generate Pull Request
Title: <team convention>
Description:
- What changed (from requirements.md)
- What didn’t change (contracts preserved)
- Evidence links (3 Proofs)
- Current DRS
Checklist:
- [ ] Contracts unchanged
- [ ] Real services tested
- [ ] Evidence attached
- [ ] No TODOs without expiry
Review Hints:
- Pay attention to: …
- Uncertain about: …
- Could be improved: …

