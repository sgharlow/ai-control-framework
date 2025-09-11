# CLAUDE CODE CONFIGURATION
**AI Agent Operating Instructions - READ FIRST**

## ⚠️ CRITICAL: IMPLEMENTATION REQUIRED

**This framework uses a "Specification-First, Implementation-Flexible" approach.**

The framework provides:
- **SPECIFICATIONS** of what to check (`ai-framework/specs/`)
- **REFERENCE IMPLEMENTATIONS** as examples (`ai-framework/reference/`)
- **MANUAL CHECKLISTS** as fallback (`ai-framework/reference/checklists/`)

**YOU MUST:**
1. Read `ai-framework/IMPLEMENTATION-GUIDE.md` FIRST
2. Choose or adapt an implementation that works in your environment
3. Use the specifications to understand WHAT to check
4. Use the references to understand HOW to check
5. Fall back to manual checklists if scripts fail

**The scripts are NOT magic - they are EXAMPLES that need adaptation!**

## MANDATORY SESSION START PROCEDURE

1. **Load Framework Files** (Every Session)
   - Read `ai-framework/templates/code.md` - Current session state
   - Read `ai-framework/templates/orchestration.md` - Control rules
   - Read `ai-framework/templates/patterns.md` - Implementation patterns
   - Read `ai-framework/IMPLEMENTATION-GUIDE.md` - How to run checks
   - Perform safety checks per `ai-framework/specs/` guidelines

2. **Select Pattern Before Coding**
   - NO implementation without pattern selection
   - Match task to PATTERN-XXX from patterns.md
   - Document pattern choice in templates/code.md

3. **Framework Checks** (Every 10 minutes)
   
   **CRITICAL**: These checks MUST be performed using appropriate implementation:
   - **Specification Location**: `ai-framework/specs/`
   - **Reference Implementations**: `ai-framework/reference/`
   - **Choose**: Bash, PowerShell, Python, or Manual Checklist
   
   Required Checks:
   - Contract Integrity (specs/contract-integrity.md)
   - Mock Detection (specs/mock-detection.md)  
   - Scope Control (specs/scope-control.md)
   - DRS Calculation (specs/drs-calculation.md)

## HARD STOP CONDITIONS
**ANY of these = STOP IMMEDIATELY:**
- Contract hash mismatch
- Mock detected after 30 minutes
- More than 5 files changed
- More than 200 lines added
- No real API call in 10 minutes
- DRS decreased by >10%

## CONVERGENCE GATES (Time-Based Targets)

| Time | Target | Required Evidence |
|------|--------|------------------|
| 0-30min | Contract lock + Real connection | Frozen hashes, API responding |
| 30-60min | Working thin slice | ONE test passing E2E |
| 60-90min | Production-ready | Error handling, tests green |
| 90-120min | Ship-ready | DRS ≥ 85, rollback tested |

## CONFIDENCE PROTOCOL

When confidence is LOW or UNCERTAIN:
```
Confidence: LOW
Task Completion: X%
Uncertainty: [specific issue]
Best Pattern Match: PATTERN-XXX (Y% match)
Question: [one specific question]
Default Action: [safe fallback if no response in 5min]
```

## EVIDENCE REQUIREMENTS

Capture every 30 minutes using appropriate method:
- If scripts work: Use reference implementation
- If not: Document manually in evidence/ folder
- Include: API responses, test results, performance metrics

## SESSION WORKFLOW

### Starting Work
1. Perform safety checks using appropriate implementation:
   - See `ai-framework/IMPLEMENTATION-GUIDE.md`
   - Use reference scripts OR manual checklists
2. Load orchestration.md rules
3. Select pattern from patterns.md
4. Update templates/code.md with mission
5. Begin implementation

### During Work
- Check orchestration.md every 10 minutes
- Perform framework checks regularly (use appropriate implementation)
- Update progress.md with completion %
- Capture evidence every 30 minutes
- Mark todos completed immediately

### Ending Session
1. Calculate final DRS (use appropriate implementation)
2. Update all tracking documents
3. Commit with message: `SESSION-END: DRS [XX], Task [XXX] [STATUS]`

## PROMPT SHORTCUTS

Use these exact prompts from `ai-framework/prompts.md`:
- **A** - Initialize session
- **B** - Set context and rules
- **C** - Resume work safely
- **D** - Plan smallest next win
- **E** - Verify compliance
- **F** - Handle blockers
- **G** - Deploy to production
- **H** - Debug without scope creep
- **I** - End session handoff
- **N** - Request human guidance
- **O** - Generate pull request

## KEY SUCCESS METRICS

- **DRS (Deployability Rating Score)**: Must reach 85+ to deploy
- **Contract Stability**: 0 changes without CCR
- **Mock Lifetime**: <30 minutes maximum
- **Scope Control**: ≤5 files, ≤200 LOC
- **Evidence Freshness**: <2 hours old

## REMEMBER

1. **Contracts are FROZEN** - No changes without CCR approval
2. **Real services ONLY** - Mocks expire at 30 minutes
3. **Scope is LIMITED** - 5 files, 200 lines maximum
4. **Progress is MEASURABLE** - Track DRS, not activity
5. **Evidence is REQUIRED** - Capture proofs regularly

This framework prevents:
- False progress through mocking
- Architecture drift through contract changes
- Scope creep through hard limits
- Wasted effort through convergence gates
- Breaking changes through frozen interfaces

**Your mission: Deliver deployable code, not just activity.**