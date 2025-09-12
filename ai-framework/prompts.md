# Prompts — A–T
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

## P. ASSESS — Comprehensive Project State Analysis
**Purpose: Determine current project health and optimal next actions**

### Execution Steps:
1. **Framework Compliance Check**
   - Read `orchestration.md` - verify session state, mode, and time gates
   - Check DRS score - current deployability rating (target: ≥85)
   - Review `tasks.md` - completion status, blockers, partial progress
   - Verify evidence freshness (< 2h requirement)

2. **Technical Health Assessment**
   - Real service connectivity status (no mocks > 30min)
   - Contract integrity verification (hash unchanged)
   - Behavioral contract validation status
   - Security validation status (vulnerabilities, compliance)
   - Architecture stability assessment
   - Integration evidence freshness
   - Production readiness validation
   - Context preservation status
   - Scope compliance check (≤5 files, ≤200 LOC per session)
   - Pattern application status (`PATTERNS.md` usage)

3. **Progress Analysis**
   - Calculate completion percentage from `tasks.md`
   - Identify next logical milestone or deliverable
   - Assess session time remaining vs. work scope
   - Determine confidence level for continuation

### Decision Matrix Output:
```
Project Health: [EXCELLENT/GOOD/CONCERNING/BLOCKED]
DRS Score: X/100 (threshold: 85)
Completion: X% 
Session Time: X min remaining
Confidence: [HIGH/MEDIUM/LOW]
Recommended Action: [CONTINUE/DEPLOY/DEBUG/ENHANCE/STOP]
Next Session Type: [DEVELOPMENT/ENHANCEMENT/DEBUG/MAINTENANCE]
Time Estimate: X minutes
Blockers: [List any framework violations or technical issues]
```

### Confidence Declaration Required:
- **Level**: [HIGH/MEDIUM/LOW]
- **Reason**: Specific technical/business justification
- **Risk Assessment**: What could go wrong in next session
- **Question**: Any uncertainties requiring human input

## Q. DECIDE — Automatic Next Action Selection
**Purpose: Determine optimal next development step based on current state**

### Decision Tree Logic:
1. **If DRS < 85 and deployment requested:**
   - Mode: CRITICAL_PATH
   - Action: Focus on highest-impact DRS improvements
   - Pattern: Apply relevant recovery patterns from `PATTERNS.md`
   - Priority: Fix mocks, reduce scope, complete evidence

2. **If new enhancement requested:**
   - Mode: ENHANCEMENT
   - Action: Assess scope, create enhancement tasks, maintain compliance
   - Validation: Ensure ≤5 files, ≤200 LOC, real services only
   - Pattern: Apply enhancement patterns

3. **If bug/issue reported:**
   - Mode: DEBUG
   - Action: Minimal change fix, add regression test, update evidence
   - Constraint: No scope expansion beyond fix
   - Pattern: Apply debugging patterns

4. **If system working well (DRS ≥ 85):**
   - Mode: OPTIMIZATION
   - Action: Code quality, documentation, strategic enhancements
   - Focus: User value and maintainability

### Output Format:
```
Situation Analysis: [Brief current state description]
Recommended Mode: [DEVELOPMENT/ENHANCEMENT/DEBUG/OPTIMIZATION]
Next Action: [Specific task with acceptance criteria]
Pattern to Apply: PATTERN-XXX (if applicable)
Time Estimate: X minutes
Expected DRS Impact: +/-X points
Scope Estimate: X files, X LOC
Confidence: [HIGH/MEDIUM/LOW] - [Reason]
```

### Confidence Declaration Required:
- **Level**: [HIGH/MEDIUM/LOW]
- **Reason**: Why this action is optimal now
- **Alternative**: Second-best option if primary fails
- **Question**: Any decision points needing human input

## R. ENHANCE — Context-Aware Enhancement Handler
**Purpose: Handle new enhancements while maintaining framework discipline**

### Pre-Enhancement Assessment:
1. **Scope Analysis**
   - Feature complexity assessment (simple/moderate/complex)
   - Framework compliance impact (files affected, LOC estimate)
   - Real service integration requirements
   - Contract change implications (should be NONE)
   - Behavioral contract impact assessment
   - Security implications and vulnerability assessment
   - Architecture stability implications
   - Production readiness impact
   - Context preservation requirements

2. **Session Planning**
   - Break into framework-compliant chunks (≤5 files, ≤200 LOC)
   - Identify required patterns from `PATTERNS.md`
   - Set realistic time gates (30m checkpoints)
   - Plan evidence capture points

### Enhancement Execution Rules:
- **ADDITIVE ONLY**: New functionality, minimal existing code changes
- **REAL SERVICES**: No mocks beyond 30 minutes
- **SCOPE LIMITS**: Max 5 files, 200 LOC per session
- **EVIDENCE REQUIRED**: Capture proof every 30 minutes
- **DRS MAINTAINED**: Must not degrade deployability

### Enhancement Types:
- **FEATURE**: New user-facing functionality
- **INTEGRATION**: Add new service/API connection
- **UI_IMPROVEMENT**: User experience enhancements
- **PERFORMANCE**: Optimization without behavior change

### Success Criteria Checklist:
- [ ] DRS maintained or improved
- [ ] All existing functionality preserved
- [ ] New functionality fully tested with real services
- [ ] Framework compliance maintained
- [ ] Evidence captured and current
- [ ] No contract changes introduced
- [ ] Behavioral contracts validated
- [ ] Security validation passed (no new vulnerabilities)
- [ ] Architecture stability maintained
- [ ] Integration evidence generated
- [ ] Production readiness validated
- [ ] Context preservation maintained

### Confidence Declaration Required:
- **Level**: [HIGH/MEDIUM/LOW]
- **Reason**: Why enhancement is safe to proceed
- **Risk**: What could break existing functionality
- **Question**: Any technical uncertainties

## S. CORRECT — Debugging and Correction Context
**Purpose: Fix issues with minimal scope creep and framework compliance**

### Issue Analysis:
1. **Problem Classification**
   - Bug severity (critical/high/medium/low)
   - Scope of impact (single function/module/system)
   - Framework compliance status (does fix violate rules?)
   - Root cause identification

2. **Minimal Change Strategy**
   - Identify smallest possible fix
   - Ensure fix doesn't expand scope beyond issue
   - Verify no contract changes required
   - Plan regression test addition

### Correction Execution:
- **Mode**: DEBUGGER (strict scope limits)
- **Change Rule**: Minimum viable fix only
- **Test Requirement**: Add regression test for issue
- **Evidence Update**: Document fix and test results
- **Scope Limit**: ≤3 files for bug fixes

### Fix Validation:
1. **Regression Test**: Proves issue is resolved
2. **Existing Tests**: All still pass
3. **Real Services**: No new mocks introduced
4. **DRS Impact**: Neutral or positive
5. **Evidence**: Updated within 30 minutes

### Output Format:
```
Issue: [Brief description]
Root Cause: [Technical explanation]
Fix Strategy: [Minimal change approach]
Files Affected: [List, max 3]
Test Plan: [Regression test description]
DRS Impact: [Expected change]
Time Estimate: X minutes
```

### Confidence Declaration Required:
- **Level**: [HIGH/MEDIUM/LOW]
- **Reason**: Why this fix is safe and minimal
- **Risk**: What could go wrong with fix
- **Question**: Any uncertainties about approach

## T. DEPLOY-DECIDE — Intelligent Deployment Decision
**Purpose: Make informed deployment decisions with comprehensive readiness assessment**

### Deployment Readiness Gates:
1. **Framework Compliance**
   - DRS ≥ 85 (mandatory threshold)
   - Contract hashes unchanged
   - Zero production-path mocks
   - All TODOs have expiry dates
   - Evidence < 2 hours old

2. **Technical Validation**
   - Real endpoint health confirmed
   - Integration correlation IDs working
   - Negative evidence documented
   - Performance benchmarks met
   - Rollback plan prepared

3. **Quality Assurance**
   - All tests passing
   - Code review completed (if applicable)
   - Security scan clean (if applicable)
   - Documentation updated

### Deployment Scenarios:

**SCENARIO A: Green Light (DRS ≥ 85, all gates pass)**
- Action: Proceed with deployment
- Pre-deploy: Final health check, rollback verification
- Deploy: Execute deployment with monitoring
- Post-deploy: Verify functionality, monitor metrics

**SCENARIO B: Yellow Light (DRS 70-84, minor issues)**
- Action: Address specific gaps before deployment
- Focus: Quick wins to reach DRS ≥ 85
- Timeline: Target 15-30 minutes of fixes
- Re-assess: Run deployment decision again

**SCENARIO C: Red Light (DRS < 70, major issues)**
- Action: STOP deployment, focus on critical path
- Mode: CRITICAL_PATH recovery
- Priority: Framework compliance, real services, evidence
- Timeline: Significant work required before deployment

### Output Format:
```
Deployment Status: [GREEN/YELLOW/RED]
DRS Score: X/100
Gate Status:
  - Framework Compliance: [PASS/FAIL]
  - Technical Validation: [PASS/FAIL] 
  - Quality Assurance: [PASS/FAIL]
Blockers: [List any failing gates]
Recommended Action: [DEPLOY/FIX_AND_DEPLOY/STOP]
Time to Ready: [X minutes if not ready]
Risk Assessment: [LOW/MEDIUM/HIGH]
```

### Confidence Declaration Required:
- **Level**: [HIGH/MEDIUM/LOW]
- **Reason**: Why deployment decision is correct
- **Risk**: What could go wrong in deployment
- **Question**: Any deployment concerns needing input