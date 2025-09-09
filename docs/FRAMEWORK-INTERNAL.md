# Framework Internal Behaviors
**These behaviors are executed automatically by Claude Code - not user-triggered**

## Automatic Internal Behaviors

### D. PLAN - Smallest Next Win (Automatic)
**Trigger:** After loading current state or completing a task
**Behavior:**
- Analyze all incomplete tasks in todos.md
- Calculate impact on DRS for each option
- Select smallest change that increases DRS
- Prefer tasks that follow current pattern
- Document choice rationale in progress.md

### H. DEBUG - Fix Without Scope Creep (Automatic)
**Trigger:** Error detected during implementation
**Behavior:**
- Switch to DEBUGGER mode automatically
- Make minimum viable fix only
- Add regression test for the bug
- Update evidence with fix verification
- Return to previous mode after fix

### J. EMERGENCY - Contract Change Required (Automatic)
**Trigger:** Contract mismatch detected by check-contracts.sh
**Behavior:**
- STOP all work immediately
- Document the mismatch in tasks.md
- Generate CCR justification
- List all affected components
- Wait for human to run approve-contract-change.sh
- DO NOT proceed until contracts re-frozen

### K. EVIDENCE - Generate Proof (Automatic)
**Trigger:** Every 30 minutes OR before major state change
**Behavior:**
```bash
# Automatically execute:
./capture-evidence.sh api [current-endpoint] GET
./capture-evidence.sh test
./capture-evidence.sh perf [current-endpoint]
```
- Store in evidence/ directory
- Include correlation IDs
- Capture negative evidence (what doesn't work)
- Auto-commit evidence files

### L. CHECKPOINT - Time Gate Validation (Automatic)
**Trigger:** At 30, 60, 90, 120 minute marks
**Behavior:**
- 30m: Verify real services connected, else STOP
- 60m: Verify working demo slice, else escalate
- 90m: Verify DRS improving, else change approach
- 120m: Verify deploy-ready, else document blockers
- Update orchestration.md with gate status
- Escalate to UNCERTAINTY if gate not met

### M. DECLINE - DRS Degradation Response (Automatic)
**Trigger:** DRS drops >10% from previous measurement
**Behavior:**
- Show DRS trend graph
- Calculate current completion %
- Display confidence trend
- Search patterns.md for recovery approach
- Implement highest-match recovery pattern
- Target: DRS ≥ 85 within 15 minutes
- If cannot recover: trigger UNCERTAINTY prompt

## Behavioral Rules (Always Active)

### Every 10 Minutes
```bash
# Automatic execution - no user prompt needed
./check-contracts.sh
./detect-mocks.sh  
./check-scope.sh
grep "orchestration.md" -A 10 Claude-template/templates/orchestration.md
```

### Every 15 Minutes
- Update progress.md percentages
- Recalculate time to deployable
- Update confidence level

### On Every File Change
- Verify still within 5 file limit
- Verify still within 200 LOC limit
- Verify not modifying contract files

### On Every External Call
- Capture response in evidence/
- Update "Last Real Call" timestamp
- Verify endpoint matches documented

### On Pattern Mismatch
- Alert that implementation deviates from pattern
- Show correct pattern implementation
- Request confirmation to continue

### On Confidence Change
- LOW → Trigger UNCERTAINTY prompt
- MEDIUM → Focus on highest-impact task
- HIGH → Continue as planned

## State Machine Transitions

```
INITIALIZING → (contracts frozen) → WORKING
WORKING → (error detected) → DEBUGGING → WORKING
WORKING → (blocked) → BLOCKED → (resolved) → WORKING
WORKING → (30min gate) → CHECKPOINT → WORKING/BLOCKED
WORKING → (DRS drop) → DECLINING → RECOVERING → WORKING
WORKING → (confidence LOW) → UNCERTAINTY → (answered) → WORKING
WORKING → (DRS ≥ 85) → READY_TO_DEPLOY
ANY STATE → (contract violation) → EMERGENCY → STOPPED
ANY STATE → (scope exceeded) → STOPPED
```

## Implementation in CLAUDE.md

These behaviors should be embedded in the CLAUDE.md configuration as:

```markdown
## AUTOMATIC BEHAVIORS (Framework Executes)

Claude Code will automatically:
- Run checks every 10 minutes
- Capture evidence every 30 minutes  
- Validate time gates at intervals
- Switch to DEBUG mode on errors
- Stop on contract violations
- Request help when confidence is LOW
- Calculate DRS continuously
- Update progress tracking

These happen WITHOUT user prompts - they are framework-enforced.
```

## Integration with User Prompts

User prompts trigger actions, internal behaviors maintain discipline:

1. User: "SET CONTEXT" → Framework: Loads rules + starts 10-min timer
2. User: "NEW WORK" → Framework: Checks patterns + monitors scope
3. Framework: Detects error → Switches to DEBUG automatically
4. Framework: 30 minutes elapsed → Captures evidence automatically
5. Framework: DRS drops → Implements recovery automatically
6. User: "VERIFY WORK" → Framework: Shows all automatic tracking

This separation ensures:
- Users control WHAT to build
- Framework controls HOW to build safely
- Discipline is maintained automatically
- Progress is measured objectively
- Failures are caught early