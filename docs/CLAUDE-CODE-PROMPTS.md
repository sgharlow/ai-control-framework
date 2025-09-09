# Claude Code Prompts for AI Development Control Framework

## A. START - Initialize Project Templates

```
Initialize the AI Development Control Framework for this project. 

Read all 9 template files in Claude-template/templates/ and help me populate them with project-specific values:

1. First, ask me for:
   - Project name and primary goal
   - Main contracts/interfaces (API specs, database schemas)
   - External services/endpoints this project will use
   - Primary acceptance test that defines "done"
   - Development constraints (time, resources, existing code)

2. Then populate each template:
   - orchestration.md: Set contract files, session boundaries, convergence gates
   - patterns.md: Identify which patterns apply to this project
   - requirements.md: Document the core requirements and acceptance criteria
   - design.md: Capture architecture decisions and constraints
   - tasks.md: Break down work into specific, measurable tasks
   - todos.md: Create initial todo items with deadlines
   - progress.md: Initialize component tracking at 0%
   - deploy.md: Set deployment requirements and rollback procedures
   - code.md: Set the mission, pattern, and initial DRS

3. Create the automation scripts if they don't exist:
   - check-contracts.sh
   - detect-mocks.sh  
   - check-scope.sh
   - drs-calculate.sh
   - can-i-continue.sh
   - capture-evidence.sh

4. Initialize contract hashes by running ./check-contracts.sh

5. Create CLAUDE.md with project-specific configuration

Output a summary showing all initialized values and confirm the framework is ready.
```

## B. SET CONTEXT - Begin Claude Code Session

```
I'm using the AI Development Control Framework for disciplined, convergent development.

MANDATORY: Read these files in order:
1. CLAUDE.md - Your operating instructions
2. Claude-template/code.md - Current session state
3. Claude-template/templates/orchestration.md - Control rules (check every 10 min)
4. Claude-template/templates/patterns.md - Required patterns
5. Claude-template/templates/progress.md - Current progress

ENFORCE these rules for ALL work:
- NO implementation without pattern selection from patterns.md
- NO changes to contract files without CCR approval
- NO mocks after 30 minutes (enforced by detect-mocks.sh)
- MAX 5 files, 200 LOC per session (enforced by check-scope.sh)
- STOP immediately if DRS drops >10% or confidence is LOW

Run ./can-i-continue.sh now. Only proceed if it returns CONTINUE.

For this session:
- Check orchestration.md every 10 minutes
- Update progress.md every 15 minutes
- Capture evidence every 30 minutes
- Declare confidence level with each decision

Confirm you've loaded the framework and state current DRS, active pattern, and mission.
```

## C. RESUME WORK - Continue Existing Tasks

```
Resume work following the AI Development Control Framework.

1. Run these checks immediately:
   ./can-i-continue.sh
   ./drs-calculate.sh
   git diff --stat

2. Load current state:
   - Read Claude-template/code.md for mission and pattern
   - Read Claude-template/templates/tasks.md for current task
   - Read Claude-template/templates/todos.md for pending items
   - Read Claude-template/templates/progress.md for completion status

3. Identify next action:
   - Find the highest-impact incomplete task
   - Verify it follows the selected pattern
   - Ensure it increases DRS

4. Before proceeding, declare:
   - Current DRS: [value]
   - Active pattern: [PATTERN-XXX]
   - Task resuming: [specific task]
   - Confidence level: [HIGH/MEDIUM/LOW]
   - Expected DRS change: [+X%]

Continue ONLY if:
- DRS is stable or improving
- Can add ≥10% progress this session
- Confidence ≥ MEDIUM

Begin work on the identified task, updating todos as you complete them.
```

## D. NEW WORK - Add and Execute New Task

```
Add new work item to the AI Development Control Framework.

1. Describe the new work:
   - Type: [feature/bug/task]
   - Description: [specific, measurable goal]
   - Acceptance criteria: [how to verify completion]

2. Verify alignment:
   - Does this fit within current session scope (5 files, 200 LOC)?
   - Which pattern from patterns.md applies?
   - Will this increase or decrease DRS?
   - Is this higher priority than existing todos?

3. If approved, update:
   - Claude-template/templates/tasks.md - Add new task with DoD
   - Claude-template/templates/todos.md - Add specific todo items
   - Claude-template/code.md - Update mission if this is now primary goal

4. Before starting:
   - Run ./can-i-continue.sh
   - Run ./check-scope.sh
   - Confirm pattern selection

5. Declare:
   - Pattern to use: [PATTERN-XXX]
   - Files to modify: [list, must be ≤5]
   - Estimated LOC: [must be ≤200]
   - Expected DRS impact: [must be positive]

Begin implementation ONLY after all checks pass.
```

## E. VERIFY WORK - Audit Current State

```
Perform comprehensive audit of current work against the AI Development Control Framework.

Run all verification scripts:
1. ./can-i-continue.sh - Check continuation safety
2. ./check-contracts.sh - Verify no contract drift
3. ./detect-mocks.sh - Ensure no stale mocks
4. ./check-scope.sh - Confirm within boundaries
5. ./drs-calculate.sh - Measure deployability

Review all control documents for violations:
1. orchestration.md compliance:
   - Are time gates being met?
   - Is evidence fresh (<2h)?
   - Are stop triggers being honored?

2. patterns.md compliance:
   - Is current work following selected pattern?
   - Are anti-patterns being avoided?

3. progress.md accuracy:
   - Do percentages reflect actual completion?
   - Is deployability assessment honest?

4. todos.md status:
   - Are any mocks past expiry?
   - Are deadlines being met?

Report:
- Current DRS: [value] (trend: ↑/↓/→)
- Contract integrity: [LOCKED/VIOLATED]
- Mock status: [count] mocks, [age] oldest
- Scope usage: [X/5] files, [Y/200] LOC
- Pattern compliance: [PATTERN-XXX] [%match]
- Confidence level: [HIGH/MEDIUM/LOW]
- Blockers: [list any stop conditions triggered]

Required actions:
[List specific steps to fix any violations]

Can continue: [YES/NO]
```

## F. BLOCKED - Handle Hard Stops

```
I'm blocked and need to document the issue per the AI Development Control Framework.

Current blocker:
- Type: [contract violation / scope exceeded / DRS declining / confidence LOW / external dependency]
- Description: [specific issue blocking progress]
- Attempted fixes: [what I've already tried]
- Required action: [what needs to happen to unblock]

Run diagnostics:
1. ./can-i-continue.sh
2. ./check-contracts.sh
3. ./check-scope.sh
4. ./drs-calculate.sh

Update tasks.md with:
- Blocker timestamp
- Attempted solutions
- External dependencies needed
- Estimated time to resolution

If contract violation detected:
- Document why change is needed
- Prepare CCR justification
- List all affected components

Report:
- Can work around? [YES/NO]
- Alternative approach? [describe or NONE]
- Human decision needed? [specific question]
- Safe to continue other work? [YES/NO]

STOP all work if contract violation or DRS < 50%.
```

## G. DEPLOY - Ready for Production

```
Initiate production deployment following the AI Development Control Framework.

Pre-deployment verification:
1. Run ./deploy-check.sh --verbose
2. Confirm ALL must be green:
   - DRS ≥ 85
   - Contract hashes unchanged
   - Zero mocks in production path
   - No TODOs without expiry
   - Evidence < 2 hours old
   - All acceptance tests passing

Generate deployment proof:
1. Real endpoint health check
2. End-to-end flow with correlation ID
3. Performance metrics (p95 < target)
4. Rollback plan documented

If all checks pass:
1. Create deployment commit with:
   - All evidence files
   - DRS score
   - Test results
2. Tag release: v[X.Y.Z]-drs[SCORE]
3. Run: ./deploy-production.sh --require-all-gates

Post-deployment:
1. Monitor for 5 minutes
2. Capture production evidence
3. Update progress.md to 100%

Rollback trigger (any):
- Error rate > 1%
- P95 latency > 500ms
- Contract mismatch detected
```

## H. HANDOFF - End Session Cleanly

```
End the current session with proper handoff documentation per the AI Development Control Framework.

Generate handoff artifacts:
1. ./drs-calculate.sh > handoff.txt
2. git status >> handoff.txt
3. ./can-i-continue.sh >> handoff.txt
4. git diff --stat >> handoff.txt

Update documentation:
1. orchestration.md:
   - Current session state
   - Last gate reached
   - Time spent
   
2. tasks.md:
   - Mark current task status
   - Document partial progress
   - List blockers encountered

3. todos.md:
   - Update completion percentages
   - Flag expiring mocks
   - Note critical next actions

4. progress.md:
   - Update all component percentages
   - Calculate time to deployable
   - Document recovery options

Create session-end commit:
git add -A
git commit -m "SESSION-END: DRS [current], Task [task-id] [status], Next: [critical action]"

Generate summary for next session:
- Current DRS: [value] (trend)
- Completed this session: [list]
- Blocked on: [list]
- Critical next step: [specific action]
- Estimated time to deploy: [hours]
- Pattern in use: [PATTERN-XXX]

Save as: handoff-[YYYYMMDD-HHMM].md
```

## I. UNCERTAINTY - Request Human Guidance

```
I need human guidance per the AI Development Control Framework uncertainty protocol.

Current situation:
- Overall Confidence: [LOW/UNCERTAIN]
- Task Completion: [X]%
- Specific Uncertainty: [exact technical issue]

Pattern analysis:
- Best match: PATTERN-[XXX] ([Y]% similarity)
- Previous success rate: [Z]%
- Alternative patterns: [list with match %]

Options identified:
A) [First approach]
   - Time estimate: ~[X] minutes
   - Progress impact: +[Y]%
   - Risk: [specific risk]
   
B) [Second approach]
   - Time estimate: ~[X] minutes  
   - Progress impact: +[Y]%
   - Risk: [specific risk]

What I need answered (ONE question):
[Specific, answerable question]

Default action if no response in 5 minutes:
[Safest option that won't break anything]

Current framework status:
- DRS: [value]
- Contracts: [LOCKED/VIOLATED]
- Scope used: [X/5] files, [Y/200] LOC
- Time in session: [minutes]
```

## J. PR-READY - Generate Pull Request

```
Generate a pull request per the AI Development Control Framework standards.

Pre-PR checklist:
1. All tests passing? [YES/NO]
2. Contracts unchanged? [YES/NO]  
3. Evidence captured? [YES/NO]
4. DRS ≥ 70? [YES/NO]
5. No unexpired mocks? [YES/NO]

Generate PR content:

Title: [Team convention - ask if unknown]

Description:
## What Changed
[From requirements.md - what was implemented]

## What Didn't Change
- Contracts preserved: [list unchanged interfaces]
- No architectural modifications
- Dependencies unchanged

## Evidence
- API endpoint test: [link/timestamp]
- Integration test: [link/timestamp]
- Performance test: [link/timestamp]

## Metrics
- DRS Score: [value]
- Test Coverage: [percentage]
- Files Changed: [X/5]
- Lines Added: [Y/200]

## Checklist
- [ ] Contracts unchanged (verified by check-contracts.sh)
- [ ] Real services tested (no mocks in prod path)
- [ ] Evidence attached (less than 2 hours old)
- [ ] No TODOs without expiry dates
- [ ] Rollback plan documented

## Review Hints
Pay attention to:
- [Specific area needing careful review]

Uncertain about:
- [Technical decision that could be improved]

Could be improved:
- [Known suboptimal area with explanation]

## Pattern Used
PATTERN-[XXX]: [Pattern name]
Success rate: [X]%

Ready to create PR? [Confirm before proceeding]
```

## Usage Instructions

1. **First Time Setup**: Use prompt A (START) to initialize all templates for your project

2. **Every Session Start**: Use prompt B (SET CONTEXT) to load the framework rules

3. **Continuing Work**: Use prompt C (RESUME WORK) when returning to an existing project

4. **Adding Features**: Use prompt D (NEW WORK) to add new tasks while maintaining discipline

5. **Regular Audits**: Use prompt E (VERIFY WORK) every 30-60 minutes to ensure compliance

6. **When Stuck**: Use prompt F (BLOCKED) to document and handle blockers properly

7. **Deployment Time**: Use prompt G (DEPLOY) when DRS ≥ 85 and ready for production

8. **Session End**: Use prompt H (HANDOFF) to create clean handoff for next session

9. **Need Help**: Use prompt I (UNCERTAINTY) when confidence is LOW

10. **Pull Request**: Use prompt J (PR-READY) to generate compliant PR

## Key Success Factors

- **Always run SET CONTEXT first** - This loads the enforcement rules
- **Never skip VERIFY WORK** - Regular audits prevent drift
- **Trust the scripts** - Automated checks prevent human override temptation
- **Respect stop conditions** - They prevent wasted effort
- **Track DRS obsessively** - It measures real progress toward deployment

## Framework Benefits

This prompt system ensures:
- ✅ No false progress through mocking
- ✅ No architecture drift through contract changes  
- ✅ No scope creep through hard limits
- ✅ No wasted effort through convergence gates
- ✅ No breaking changes through frozen interfaces

The prompts transform Claude Code from an eager assistant into a disciplined engineer following proven patterns toward measurable deployment readiness.