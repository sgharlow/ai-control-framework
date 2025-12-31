# Meta Instructions for All Prompts

### Universal Requirements

* Always declare confidence with **Level + Reason + Question (if needed)**
* Check `orchestration.md` **every 10 minutes** minimum
* Verify **pattern compliance** before any implementation
* Maintain scope limits (**5 files, 200 LOC per session**)
* Capture **evidence every 30 minutes**
* Update **DRS** after each significant action
* **Stop immediately** if confidence drops to **LOW/BLOCKED**

### Framework File Priority

1. `orchestration.md` — Governs everything (**highest priority**)
2. `patterns.md` — Must select before coding
3. `design.md` — Contracts are immutable
4. `requirements.md` — Defines session scope
5. `progress.md` — Tracks deployability

### Stop Conditions (Any = **STOP**)

* Contract hash mismatch
* Mock detected after 30 minutes
* Scope exceeded (files or LOC)
* Confidence **LOW** or **BLOCKED**
* No real API calls in 10 minutes
* DRS degraded by **>10%**

### Evidence Requirements

* Real service calls with timestamps
* Integration correlation IDs
* Performance measurements
* Both positive and negative results
* Error scenarios documented

---

## A. START — Initialize Session

**Purpose:** Begin a new development session with proper framework initialization.

### Execution Steps

**Load Framework Files**

* Read `orchestration.md` completely — this governs **ALL** actions.
* Load `overview.md` for navigation guidance.
* Review `templates/code.md` for current state.
* Check `requirements.md` for session goal.

**Verify Contracts**

* Read `design.md` for frozen contracts.
* Calculate **SHA256** hash of contract files.
* Compare with stored hash in `orchestration.md`.
* **If mismatch: STOP immediately, document issue.**

**Initialize Session State**

* Set **30-minute timer** for first gate.
* Select appropriate pattern from `patterns.md`.
* Document pattern selection reason.
* Initialize **DRS** calculation baseline.

**Declare Initial Confidence**

* **Level:** `[HIGH/MEDIUM/LOW]`
* **Reason:** Technical justification for confidence level
* **Risk:** What could go wrong in first 30 minutes
* **Question:** Any uncertainties needing immediate input

### Output

```
Session Initialized
Pattern Selected: PATTERN-XXX
Contract Hash: [SHA256]
First Gate: 30 minutes
DRS Baseline: X%
Confidence: [LEVEL] - [Reason]
Session Goal: [Specific acceptance test from requirements.md]
```

### Success Criteria

* All framework files loaded
* Contract hash verified
* Pattern selected and justified
* Timer set for first gate
* Confidence declared with reason

---

## B. SET CONTEXT — Rules of Engagement

**Purpose:** Establish and maintain framework discipline throughout session.

### Core Rules (Check Every 10 Minutes)

**Framework Governance**

* `orchestration.md` governs **ALL** actions — no exceptions
* Check stop conditions every 10 minutes
* Respect all scope boundaries (**5 files, 200 LOC**)
* Never modify framework files

**Confidence Protocol**

* Declare confidence with **EVERY** decision
* Format: **Level + Reason + Question (if needed)**
* **LOW/BLOCKED = STOP immediately**

**Pattern Compliance**

* Check `PATTERNS.md` before **ANY** implementation
* Apply selected pattern consistently
* Document any deviations with justification

**Contract Immutability**

* Contracts are **FROZEN** this session
* Any change requires CCR approval
* Hash mismatch = **STOP immediately**

### Enforcement Checklist

* [ ] Orchestration rules reviewed (last checked: `[timestamp]`)
* [ ] Pattern being followed correctly
* [ ] Confidence level appropriate for action
* [ ] Contracts unchanged (hash verified)
* [ ] Within scope limits

---

## C. RESUME — Re-enter Safely

**Purpose:** Continue work from previous session with safety checks.

### Safety Assessment

**Run Continuation Checks**

```bash
./can-i-continue.sh
./drs-calculate.sh
git diff --stat
```

**Verify Framework State**

* Contract files unchanged (verify hash)
* No framework files modified
* Session scope still valid
* Previous pattern still applicable

**Analyze Previous Progress**

* Read `PROGRESS.md` for completion status
* Check `tasks.md` for partial completion
* Review `todos.md` for active blockers
* Calculate time to completion

**Pattern Continuity Check**

* Identify pattern from previous session
* Verify pattern still appropriate
* Check success rate history
* Document any pattern changes needed

### Continuation Decision Matrix

* **DRS Trend:** `[IMPROVING/STABLE/DEGRADING]`
* **Progress Since Last:** `X%`
* **Time to Complete:** `X minutes`
* **Pattern Match:** `PATTERN-XXX (X% confidence)`
* **Blockers:** `[List any]`
* **Recommendation:** `[CONTINUE/PIVOT/STOP]`

### Required Conditions to Continue

* DRS stable or improving
* Can add **≥10%** progress this session
* Confidence **≥ MEDIUM**
* No contract violations
* Pattern still valid

---

## D. PLAN — Smallest Next Win

**Purpose:** Select minimal change for maximum deployability impact.

### Planning Process

**Assess Current State**

* Current DRS: `X%`
* Biggest blocker to deployment
* Time remaining in session
* Available patterns

**Identify Options**

* List **3–5** possible next actions
* Estimate **DRS impact** for each
* Estimate **time** for each
* Assess **risk** for each

**Select Optimal Action**

* Choose highest **DRS impact per minute**
* Must be completable **in session**
* Must follow selected pattern
* Must not violate contracts

### Decision Output

* **Current DRS:** `X%`
* **Selected Action:** `[Specific task]`
* **Expected Impact:** `+X% DRS`
* **Time Estimate:** `X minutes`
* **Pattern Applied:** `PATTERN-XXX`
* **Risk Assessment:** `[LOW/MEDIUM/HIGH]`
* **Alternative if Blocked:** `[Backup action]`

### Selection Criteria

* Maximum DRS improvement
* Minimum implementation time
* Follows established pattern
* No contract changes required
* Clear success criteria

---

## E. VERIFY — Compliance Audit

**Purpose:** Comprehensive framework compliance check.

### File-by-File Verification

**`orchestration.md` Compliance**

* Mode rules followed
* Time gates met (30/60/90/120 min)
* Evidence captured every 30 min
* Confidence declared with all decisions
* Stop conditions checked every 10 min
* Pattern actively applied

**`tasks.md` Compliance**

* Real service connections verified
* Definition of Done criteria met
* Partial progress tracked accurately
* Confidence ≥ MEDIUM for active tasks
* Time/scope budgets respected

**`todos.md` Compliance**

* All mocks have expiry **< 72h**
* Critical blockers documented
* Resolution paths identified
* No expired mocks in production path

**`deploy.md` Compliance**

* All gates showing green
* DRS ≥ **85** for deployment
* Rollback plan documented
* Performance within SLO

### Audit Output

* **Compliance Status:** `[PASS/FAIL]`
* **Violations Found:** `[List any]`
* **DRS Impact:** `[Current score]`
* **Recovery Actions:** `[If violations found]`
* **Time to Compliant:** `X minutes`

---

## F. BLOCKED — Handle Hard Stops

**Purpose:** Systematic blocker resolution with clear escalation.

### Blocker Classification

**Technical Blockers**

* Framework violation
* Contract mismatch
* Pattern failure
* Integration issue

**External Blockers**

* Missing credentials
* Service unavailable
* Human input required
* Dependency not ready

### Response Protocol

**Document in `tasks.md`**

```
BLOCKER: [Description]
Type: [TECHNICAL/EXTERNAL]
Detected: [Timestamp]
Attempted Fixes: [List]
Required Action: [Specific need]
ETA: [Best estimate]
Impact: -X% DRS
```

**Diagnosis Steps**

```bash
./can-i-continue.sh
```

* Check for anti-patterns
* Verify all gates in `deploy.md`
* Test alternative patterns

**Escalation Path**

* Try **ONE** alternative approach
* If still blocked: **STOP**
* Document for human review
* Prepare handoff state

### Blocker Recovery Matrix

* Contract violation → **STOP**, file CCR
* Pattern failure → Try next best pattern
* External dependency → Document and wait
* Low confidence → Request human input

---

## G. DEPLOY — Ready for Production

**Purpose:** Execute production deployment with safety checks.

### Pre-Deploy Validation

**Run Automated Checks**

```bash
./deploy-check.sh --verbose
./check-contracts.sh
./detect-mocks.sh
```

**Verify All Gates Green**

* **DRS ≥ 85** (mandatory)
* Contract hashes unchanged
* Zero production-path mocks
* All TODOs have expiry dates
* Evidence < **2 hours** old
* Performance within SLO

**Pre-Deploy Proof**

* Real endpoint health check
* Working flow with correlation ID
* Rollback plan tested
* Monitoring alerts configured

### Deployment Execution

```bash
# Final safety check
./deploy-production.sh --require-all-gates

# Monitor for 5 minutes
# If any issues:
./rollback.sh --immediate
```

### Post-Deploy Verification

* Application responding
* No error spike
* Performance acceptable
* Rollback ready if needed

---

## H. DEBUG — Fix Without Scope Creep

**Purpose:** Minimal-change debugging with framework discipline.

### Debug Protocol

**Set Debug Mode**

* **Mode:** `DEBUGGER`
* **Scope:** Minimum viable fix only
* **Max files:** 3
* **Max LOC:** 50

**Root Cause Analysis**

* Identify exact failure point
* Trace through real service calls
* Check contract compliance
* Verify pattern application

**Fix Strategy**

* Smallest possible change
* Add regression test first
* Verify fix locally
* Test with real services

**Evidence Update**

* Document fix applied
* Capture test results
* Update DRS calculation
* Note in `progress.md`

### Debug Constraints

* **NO** feature additions
* **NO** refactoring
* **NO** optimization
* **ONLY** fix the specific issue

---

## I. HANDOFF — End of Session

**Purpose:** Clean session termination with complete state preservation.

### Handoff Checklist

**Generate State Report**

```bash
./drs-calculate.sh > handoff.txt
git status >> handoff.txt
./can-i-continue.sh >> handoff.txt
```

**Update Framework Files**

* Update `orchestration.md` session state
* Checkpoint `tasks.md` with partial progress
* Update `todos.md` with mock expiries
* Document patterns used/discovered

**Commit State**

```bash
git add -A
git commit -m "SESSION-END: DRS [XX], Task [XXX] [STATUS], Next: [ACTION]"
```

### Handoff Documentation

**Session Summary:**

* Duration: `X minutes`
* DRS Change: `X% → Y%`
* Tasks Completed: `[List]`
* Patterns Used: `[List]`
* Blockers: `[List]`
* Next Session Should: `[Specific action]`
* Time to Deploy: `X minutes`

---

## J. EMERGENCY — Contract Change Required

**Purpose:** Handle unavoidable contract changes (**LAST RESORT**).

### CCR (Contract Change Request) Process

**Justify Change**

* Why change is required
* Alternatives considered
* Impact analysis
* Risk assessment

**Document Request**

```
CCR-001: [Title]
Current Contract: [File/Hash]
Proposed Change: [Specific modification]
Justification: [Business/Technical reason]
Impact: [Systems affected]
Migration Plan: [How to update]
Rollback Plan: [How to revert]
```

**Implementation (If Approved)**

* Update contract file
* Recalculate and freeze new hash
* Run full regression suite
* Update all integrations
* Reset DRS calculation

### CCR Criteria

* Exhausted **ALL** alternatives
* Business critical requirement
* Cannot defer to next session
* **Human approval** obtained

---

## K. EVIDENCE — Generate Proof Now

**Purpose:** Capture verifiable evidence of system behavior.

### Required Evidence Types

**Real Connection Proof**

* API call with timestamp
* Response headers/body
* Correlation ID
* Latency measurement

**Integration Proof**

* End-to-end flow trace
* Data transformation evidence
* Service interaction logs
* Error handling demonstration

**Negative Evidence**

* What **didn't** work
* Failed approaches
* Performance issues
* Error scenarios

### Evidence Capture Protocol

```bash
# Every 30 minutes, capture:
curl -X POST "$API_ENDPOINT" | tee "evidence-$(date +%s).json"
./run-integration-test.sh | tee "test-evidence-$(date +%s).log"
./measure-performance.sh | tee "perf-evidence-$(date +%s).txt"
```

### Evidence Requirements

* Timestamp all captures
* Include correlation IDs
* Show real service calls
* Document both success and failure

---

## L. CHECKPOINT — Time Gate Validation

**Purpose:** Enforce convergence gates at time boundaries.

### Gate Validation Schedule

**30-Minute Gate**

* Real services connected
* Contract hash frozen
* Pattern selected
* Evidence captured
  **Required DRS:** ≥ **10%**

**60-Minute Gate**

* Working demo slice
* One test passing E2E
* No mocks in code
* 3 Proofs captured
  **Required DRS:** ≥ **40%**

**90-Minute Gate**

* All error paths handled
* Tests green in CI
* Performance acceptable
* Documentation updated
  **Required DRS:** ≥ **70%**

**120-Minute Gate**

* Deploy-ready state
* Rollback tested
* All gates green
* Evidence complete
  **Required DRS:** ≥ **85%**

### Gate Failure Response

* Document why gate failed
* Identify recovery actions
* Estimate time to pass
* Consider session termination

---

## M. DECLINE — DRS Degradation Response

**Purpose:** Recover from deployability score degradation.

### Degradation Analysis

**Show Trend**

```
DRS Trend: [XX% → YY% → ZZ%]
Progress: X% complete
Confidence Trend: [HIGH → MEDIUM → LOW]
Time in Decline: X minutes
```

**Identify Cause**

* Contract violation?
* Mock introduced?
* Scope exceeded?
* Pattern abandoned?

**Recovery Options**

* Revert to last good state
* Apply recovery pattern
* Reduce scope
* Fix specific blocker

### Recovery Protocol

* **Rule:** No new work until trend reverses
* **Target:** DRS ≥ **85** in **15 minutes**
* **Action:** Focus on highest-impact fix
* **Fallback:** If no recovery in 15 min → **STOP**

---

## N. UNCERTAINTY — Request Human Guidance

**Purpose:** Structured escalation when confidence is low.

### Uncertainty Declaration Format

* **Overall Confidence:** `LOW/UNCERTAIN`
* **Task Completion:** `X%`
* **Specific Uncertainty:** `[Exact technical issue]`

**Pattern Analysis**

* Best Match: `PATTERN-XXX (Y% similar)`
* Success Rate: `Z%`
* Alternative: `PATTERN-YYY`

**Options Considered**

* **A)** `[Option]` — Time: `~Y min`, Progress: `+Z%`, Risk: `[H/M/L]`
* **B)** `[Option]` — Time: `~Y min`, Progress: `+Z%`, Risk: `[H/M/L]`

**What I Need (ONE question):**
`[Precise, answerable question]`

**Default Action (if no response in 5 min):**
`[Safe, reversible action]`

### Escalation Triggers

* Technical decision with unclear impact
* Multiple equally valid approaches
* Contract interpretation ambiguity
* Pattern doesn't match situation

---

## O. PR-READY — Generate Pull Request

**Purpose:** Create comprehensive PR for review.

### PR Template

## Title: \[Team convention format]

**What Changed**

* \[From `requirements.md`]
* \[Specific features added]
* \[Tests added/modified]

**What Didn’t Change**

* Contracts preserved (hash: `XXX`)
* No breaking changes
* Backward compatible

**Evidence**

* \[Link to test results]
* \[Link to performance metrics]
* \[Link to integration proof]
* Current DRS: `XX%`

**Checklist**

* [ ] Contracts unchanged
* [ ] Real services tested
* [ ] Evidence attached (< 2h old)
* [ ] No TODOs without expiry
* [ ] DRS ≥ 85
* [ ] Pattern followed: `PATTERN-XXX`

**Review Hints**

* Pay attention to: \[Specific areas]
* Uncertain about: \[Decisions made]
* Could be improved: \[Known limitations]

**Deployment Notes**

* Rollback plan: \[Specific steps]
* Feature flags: \[If applicable]
* Migration required: \[Yes/No]

---

## P. ASSESS — Comprehensive Project State Analysis

**Purpose:** Complete project health assessment with recommendations.

### Assessment Workflow

**Framework Compliance**

* Read all framework files
* Check DRS score and trend
* Verify contract integrity
* Review evidence freshness
* Assess pattern application

**Technical Health**

* Service connectivity status
* Test coverage and results
* Performance metrics
* Security scan results
* Architecture stability

**Progress Analysis**

* Calculate true completion %
* Identify critical path
* Estimate time to deploy
* Assess team velocity

### Assessment Output

```
PROJECT STATE ASSESSMENT
========================
Overall Health: [EXCELLENT/GOOD/CONCERNING/BLOCKED]
DRS Score: X/100 (Target: 85)
True Completion: X%
Deployment Readiness: [YES/NO]

Technical Status:
- Contracts: [STABLE/CHANGED]
- Services: [CONNECTED/PARTIAL/NONE]
- Tests: X% passing
- Performance: [MEETING_SLO/DEGRADED]

Blockers (Priority Order):
1. [Blocker] - Impact: -X% DRS, Fix Time: Y min
2. [Blocker] - Impact: -X% DRS, Fix Time: Y min

Recommended Actions:
1. [Immediate]: [Specific action] (+X% DRS)
2. [Next Session]: [Specific action] (+X% DRS)
3. [Future]: [Strategic improvement]

Confidence: [HIGH/MEDIUM/LOW]
Reason: [Technical justification]
```

---

## Q. DECIDE — Automatic Next Action Selection

**Purpose:** AI-driven decision making for optimal next step.

### Decision Algorithm

**Gather Context**

* Current DRS and trend
* Time remaining in session
* Active blockers
* Available patterns

**Evaluate Options**
For each possible action:

* Calculate DRS impact
* Estimate completion time
* Assess risk level
* Check pattern match
* Verify contract compliance

**Select Optimal Path**

* Highest **(DRS improvement / time)**
* Matches available pattern
* Within session scope
* No contract violations

### Decision Output

```
AUTOMATED DECISION
==================
Current State: [Brief description]
Analysis Complete: [X options evaluated]

Selected Action: [Specific task]
Justification: Highest impact/effort ratio

Details:
- Mode: [DEVELOPMENT/DEBUG/ENHANCE/DEPLOY]
- Pattern: PATTERN-XXX
- Time Required: X minutes
- DRS Impact: +X%
- Risk Level: [LOW/MEDIUM/HIGH]
- Success Probability: X%

Alternative if Blocked:
- Action: [Backup task]
- Impact: +X% DRS
- Time: Y minutes

Confidence: [HIGH/MEDIUM/LOW]
Reasoning: [Why this is optimal]
```

---

## R. ENHANCE — Context-Aware Enhancement Handler

**Purpose:** Add new functionality with framework discipline.

### Enhancement Planning

**Scope Analysis**

* Feature complexity: `[SIMPLE/MODERATE/COMPLEX]`
* Estimated LOC: `X`
* Files affected: `[List]`
* Contract impact: `[NONE required]`
* Pattern match: `PATTERN-XXX`

**Session Chunking**

* Break into **30-min** increments
* Each chunk ≤ **5 files**, ≤ **200 LOC**
* Clear success criteria per chunk
* Evidence points identified

**Risk Assessment**

* Breaking changes: `[YES/NO]`
* Performance impact: `[+/-X%]`
* Security implications: `[List]`
* Rollback complexity: `[LOW/MEDIUM/HIGH]`

### Enhancement Execution

**Enhancement Plan:**

```
Feature: [Name]
Total Scope: X files, Y LOC
Sessions Required: Z

This Session:
- Chunk 1: [Specific deliverable]
- Time: 30 min
- Files: [List, max 5]
- LOC: X (max 200)
- Pattern: PATTERN-XXX
- Evidence: [What to capture]
```

**Success Criteria**

* [ ] Feature works E2E

* [ ] No existing features broken

* [ ] Tests added and passing

* [ ] DRS maintained or improved

* [ ] Evidence captured

* **Confidence:** `[HIGH/MEDIUM/LOW]`

* **Risk:** `[What could go wrong]`

---

## S. CORRECT — Debugging and Correction Context

**Purpose:** Fix issues with minimal changes.

### Correction Workflow

**Issue Analysis**

```
Issue: [Description]
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
First Detected: [Timestamp]
Systems Affected: [List]
User Impact: [Description]
```

**Root Cause Analysis**

* Reproduction steps
* Failure point identification
* Contract violation check
* Pattern deviation check

**Fix Planning**

* Minimal change approach
* Regression test design
* Rollback plan
* Verification strategy

### Fix Implementation

**Fix Strategy:**

```
Root Cause: [Technical explanation]
Fix Approach: [Minimal change description]
Files to Modify: [Max 3]
Lines to Change: [Max 50]
```

**Test Plan**

* Regression Test: \[Description]
* Integration Test: \[Description]
* Manual Verification: \[Steps]

**Risk Assessment**

* Side Effects: \[Any identified]
* Rollback: \[How to revert]

**Time Estimate:** `X minutes`
**DRS Impact:** `+/- X%`
**Confidence:** `[HIGH/MEDIUM/LOW]`

---

## T. DEPLOY-DECIDE — Intelligent Deployment Decision

**Purpose:** Data-driven deployment readiness assessment.

### Deployment Analysis

**Gate Assessment**

```python
gates = {
    "DRS Score": (current >= 85),
    "Contracts": (hash_unchanged),
    "Mocks": (production_mocks == 0),
    "TODOs": (all_have_expiry),
    "Evidence": (age < 2_hours),
    "Tests": (all_passing),
    "Performance": (p95 < slo),
    "Rollback": (plan_documented)
}
```

**Risk Calculation**

* Change scope analysis
* Dependency impact assessment
* Rollback complexity scoring
* Historical failure rate

**Decision Logic**

* **All gates green → DEPLOY**
* **1–2 gates yellow → FIX\_THEN\_DEPLOY**
* **3+ gates red → STOP\_AND\_RECOVER**

### Deployment Decision Output

```
DEPLOYMENT READINESS ASSESSMENT
===============================
Decision: [DEPLOY/FIX_THEN_DEPLOY/STOP]
Confidence: [HIGH/MEDIUM/LOW]

Gate Status:
✅ DRS Score: 92/100
✅ Contracts: Unchanged
✅ Tests: All passing
⚠️ Evidence: 1h 45m old (update recommended)
❌ Mocks: 1 found in auth service

Required Actions for Deployment:
1. Update evidence (5 min)
2. Remove auth mock (10 min)
Total Time to Deploy-Ready: 15 minutes

Risk Level: [LOW/MEDIUM/HIGH]
Rollback Complexity: [SIMPLE/MODERATE/COMPLEX]

Recommendation: Fix identified issues, then deploy
```

---

## U. INIT\_REQUIREMENTS — Initialize Requirements

**Purpose:** Set up `requirements.md` for new project.

### Requirements Initialization

**Gather Context**

* Project type and scope
* User story or feature request
* Technical constraints
* Time/resource limitations

**Define Session Goal**

```
This Session: [ONE specific test/feature]
Acceptance Criteria: [Measurable outcome]
Out of Scope: [What NOT to do]
Definition of Done: [Clear checklist]
```

**Create Acceptance Test**

```gherkin
Feature: [Single feature name]

Scenario: [One specific scenario]
  Given [Initial state with real services]
  When [Specific user action]
  Then [Observable outcome]
  And [Evidence captured]
```

### Requirements Output

* Clear single session goal
* One acceptance test
* Explicit scope boundaries
* Measurable success criteria

---

## V. INIT\_DESIGN — Initialize Design

**Purpose:** Establish architectural boundaries and contracts.

### Design Initialization

**Define Architecture Boundaries**

* Allowed components (existing only)
* Forbidden changes (list explicitly)
* Integration points (APIs, databases)
* Security boundaries

**Freeze Contracts**

```
Contract Definition:
- API Contract: [file, hash]
- Database Contract: [file, hash]
- Message Contract: [file, hash]
- Behavioral Contract: [rules]
```

**Document Constraints**

* Performance requirements
* Security requirements
* Compliance requirements
* Technical debt boundaries

### Design Output

* Frozen contract files with hashes
* Clear architectural boundaries
* Documented constraints
* Contract violation response plan

---

## W. INIT\_TASKS — Initialize Tasks

**Purpose:** Break down work into framework-compliant tasks.

### Task Initialization

**Decomposition Strategy**

* **Vertical slices only**
* Each task independently deployable
* **Max 2 hours** per task
* Clear acceptance criteria

**Task Template**

```
TASK-XXX: [User-facing description]
Status: 0% NOT_STARTED
Confidence: [TBD after analysis]
Pattern Match: [TBD from patterns.md]
Time Budget: [Max 2h]
Scope Budget: [Max 5 files, 200 LOC]

Subtasks:
- [ ] Component 1 (X min)
- [ ] Component 2 (Y min)
- [ ] Tests (Z min)
```

**Priority Ordering**

* Highest user value first
* Dependencies considered
* Risk-ordered (high risk early)
* Quick wins identified

### Tasks Output

* Ordered task list
* Each task with clear scope
* Time/LOC budgets defined
* Pattern matches identified

---

## X. SETUP\_FRAMEWORK — Framework Initialization

**Purpose:** Complete framework setup for new project.

### Setup Workflow

**Create Framework Structure**

```bash
mkdir -p ai-framework
touch orchestration.md
touch requirements.md
touch design.md
touch tasks.md
touch progress.md
touch deploy.md
touch todos.md
touch patterns.md
```

**Initialize Scripts**

```bash
# Create monitoring scripts
create_script check-contracts.sh
create_script detect-mocks.sh
create_script drs-calculate.sh
create_script can-i-continue.sh
create_script deploy-check.sh
```

**Set Initial State**

* DRS: `0%`
* Contracts: `Not defined`
* Services: `Not connected`
* Pattern: `Not selected`

### Framework Checklist

* [ ] All files created
* [ ] Scripts executable
* [ ] Git repository initialized
* [ ] Initial commit made
* [ ] Ready for first session

---

## Y. SELECT\_PATTERN — Pattern Selection

**Purpose:** Choose optimal pattern for current situation.

### Pattern Selection Process

**Analyze Situation**

* Task type (feature/fix/integration)
* Technical constraints
* Time available
* Risk tolerance

**Evaluate Patterns**
*For each pattern in `patterns.md`:*

* Match score: `X%`
* Success rate: `Y%`
* Time to implement: `Z min`
* Risk level: `[L/M/H]`

**Select Best Match**

* Highest match score
* Proven success rate
* Fits time constraint
* Acceptable risk level

### Pattern Selection Output

```
Pattern Analysis Complete
========================
Selected: PATTERN-XXX
Match Score: X%
Success Rate: Y%
Implementation Time: Z min

Justification:
- [Why this pattern fits]
- [Expected outcomes]
- [Risk mitigation]

Alternative Pattern: PATTERN-YYY
(Use if primary pattern fails)

Confidence: [HIGH/MEDIUM/LOW]
```

---

## Z. GET\_STATE — Framework State Analysis

**Purpose:** Complete framework state snapshot.

### State Gathering

**Framework Status**

```bash
# Run all status scripts
./drs-calculate.sh
./check-contracts.sh
./detect-mocks.sh
./can-i-continue.sh
```

**File State Analysis**

* Read all framework files
* Check modification times
* Verify file integrity
* Calculate completion percentages

**Integration State**

* Service connectivity
* API health checks
* Database connections
* External dependencies

### State Output

```
FRAMEWORK STATE SNAPSHOT
=======================
Timestamp: [ISO-8601]
Session: [Duration, phase]

Scores:
- DRS: X%
- Completion: Y%
- Test Coverage: Z%

Contracts:
- Status: [FROZEN/CHANGED]
- Hash: [SHA256]
- Last Verified: [Timestamp]

Services:
- API: [CONNECTED/DISCONNECTED]
- Database: [CONNECTED/DISCONNECTED]
- External: [List with status]

Active Issues:
- [Issue 1]: Impact -X% DRS
- [Issue 2]: Impact -Y% DRS

Next Action Required:
[Specific recommendation]
```

---

## AA. SELECT\_OPTIMAL — Optimal Prompt Selection

**Purpose:** Choose the best prompt for current situation.

### Prompt Selection Logic

```python
if starting_new_session:
    return "A. START"
elif unsure_of_state:
    return "P. ASSESS"
elif dont_know_next:
    return "Q. DECIDE"
elif adding_feature:
    return "R. ENHANCE"
elif fixing_bug:
    return "S. CORRECT"
elif ready_to_deploy:
    return "T. DEPLOY-DECIDE"
elif blocked:
    return "F. BLOCKED"
elif low_confidence:
    return "N. UNCERTAINTY"
```

**Context Considerations**

* Current DRS score
* Time in session
* Recent prompt history
* Active blockers

**Prompt Chaining**

* Identify follow-up prompts
* Plan prompt sequence
* Estimate total time

### Optimal Selection Output

```
OPTIMAL PROMPT SELECTION
=======================
Current Situation: [Description]
Recommended Prompt: [X. NAME]

Reasoning:
- [Why this prompt now]
- [Expected outcome]
- [Time estimate]

Follow-up Sequence:
1. [Current prompt] (X min)
2. [Next prompt] (Y min)
3. [Final prompt] (Z min)

Total Time: XX minutes
Expected DRS Impact: +Y%
Confidence: [HIGH/MEDIUM/LOW]
```

---

## BB. GENERATE\_CONTEXT — Contextualized Prompt Generation

**Purpose:** Create fully contextualized prompts with project state.

### Context Generation Process

**Gather Project Context**

* Current files and state
* Active patterns
* Session history
* Technical constraints

**Enhance Prompt**

```
Base Prompt: [Selected prompt]
+ Current State: [DRS, completion, blockers]
+ Specific Files: [Relevant code/config]
+ Pattern Context: [Active pattern details]
+ History: [Recent actions/decisions]
= Contextualized Prompt
```

**Validation**

* Check context completeness
* Verify no contradictions
* Ensure actionability
* Include success criteria

### Contextualized Output

```
CONTEXTUALIZED PROMPT
====================
Base: [X. PROMPT_NAME]
Timestamp: [ISO-8601]

Current Context:
- DRS: X%
- Pattern: PATTERN-XXX
- Session Time: Y min remaining
- Last Action: [Description]

Specific Instructions:
[Prompt enhanced with exact file names,
 line numbers, function names, values]

Expected Output:
[Exact format and content expected]

Success Criteria:
- [ ] Specific measurable outcome 1
- [ ] Specific measurable outcome 2

Confidence Required: [HIGH/MEDIUM/LOW]
Time Limit: X minutes
```

---

## 
