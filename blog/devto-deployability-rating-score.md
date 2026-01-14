# The Deployability Rating Score: Quantifying "Done" in AI Coding Sessions

*Stop asking "is it done?" Start asking "what's the DRS?"*

---

**TL;DR:** "Done" is a feeling. "85 DRS" is a measurement. The Deployability Rating Score (DRS) gives you a 100-point scale to objectively measure whether code is ready to deploy, replacing vague confidence with concrete evidence.

---

## The Problem: "Done" Means Nothing

Ask a developer if their feature is done. You'll hear:

- "I think so"
- "Mostly"
- "Just need to clean up a few things"
- "It works on my machine"

These answers are useless. They tell you nothing about whether the code can safely ship to production. They're feelings, not measurements.

AI makes this worse. The AI confidently says "the implementation is complete," but complete according to what standard? The AI has no concept of deployment readiness.

You need a number. Something you can track, compare, and use to make ship/no-ship decisions.

---

## Introducing the Deployability Rating Score (DRS)

The DRS is a 100-point score that measures how ready code is to deploy to production. It evaluates 13 specific components, each with a defined weight based on deployment risk.

**The scale:**
- **85-100**: Ship it. Code is production-ready.
- **70-84**: Almost there. Minor issues remaining.
- **50-69**: Significant gaps. Not safe to deploy.
- **Below 50**: Stop. Major problems to address.

**The rule:** Don't deploy below 85. No exceptions.

---

## The 13 DRS Components

Each component addresses a specific deployment risk. The weights reflect how much damage a failure in that area can cause.

### Tier 1: Security and Data (25 points)

**Security Validation (16 points)**
- Authentication working correctly
- Authorization rules enforced
- Input validation present
- No secrets in code
- SQL injection prevention
- XSS prevention

*Why it's heavily weighted: Security failures can end companies.*

**Data Integrity (9 points)**
- Database migrations safe
- Data validation at boundaries
- Backup/restore tested
- No data loss scenarios

*Why it matters: Data corruption is often irreversible.*

### Tier 2: Core Functionality (30 points)

**Contract Integrity (7 points)**
- API contracts match specification
- No breaking changes to interfaces
- Schema versions correct

**Behavioral Contracts (7 points)**
- Functions return expected outputs
- Error responses match documentation
- Edge cases handled as specified

**Tests Passing (7 points)**
- All unit tests green
- Integration tests passing
- No skipped or pending tests

**Integration Evidence (9 points)**
- Real services connected (not mocks)
- API calls verified
- Third-party integrations tested

### Tier 3: Production Readiness (21 points)

**Production Readiness (14 points)**
- Environment variables configured
- Logging implemented
- Monitoring hooks present
- Graceful degradation working
- Rollback procedure tested

**Architecture Stability (7 points)**
- No circular dependencies
- Performance within bounds
- Memory usage acceptable
- No architectural regressions

### Tier 4: Operational Safety (24 points)

**No Mocks in Production Path (7 points)**
- All mocks removed or isolated
- Real dependencies injected
- No stubbed data in production flow

**Context Preservation (7 points)**
- Session state handled correctly
- Stateless where expected
- State persistence working

**Error Handling (4 points)**
- Errors caught and logged
- User-facing messages appropriate
- No unhandled exceptions

**Scope Compliance (4 points)**
- Changes limited to intended scope
- No feature creep
- Documentation matches implementation

**Documentation (2 points)**
- README updated
- API docs current
- Changelog present

---

## Calculating Your DRS

At any checkpoint, score each component:

```markdown
## DRS Calculation - [DATE/TIME]

### Security & Data (25 points)
- Security Validation: __/16
- Data Integrity: __/9

### Core Functionality (30 points)
- Contract Integrity: __/7
- Behavioral Contracts: __/7
- Tests Passing: __/7
- Integration Evidence: __/9

### Production Readiness (21 points)
- Production Readiness: __/14
- Architecture Stability: __/7

### Operational Safety (24 points)
- No Mocks: __/7
- Context Preservation: __/7
- Error Handling: __/4
- Scope Compliance: __/4
- Documentation: __/2

## TOTAL DRS: __/100
```

### Scoring Guidelines

For each component, score honestly:

- **Full points**: Component fully satisfied, evidence available
- **Partial points**: Mostly satisfied, minor gaps
- **Zero points**: Not addressed or significant issues

Don't give yourself credit for "I'll fix it later." Score the current state.

---

## Example: DRS in Action

### Session Start

```
Security Validation: 0/16 (not implemented yet)
Data Integrity: 0/9
Contract Integrity: 5/7 (API defined, not all tested)
Behavioral Contracts: 0/7
Tests Passing: 0/7 (no tests written)
Integration Evidence: 0/9 (using mocks)
Production Readiness: 0/14
Architecture Stability: 7/7 (clean start)
No Mocks: 0/7 (all mocked)
Context Preservation: 0/7
Error Handling: 0/4
Scope Compliance: 4/4 (scope defined)
Documentation: 1/2 (README exists)

TOTAL DRS: 17/100
```

Starting DRS is always low. That's fine. The goal is to increase it.

### After 60 Minutes

```
Security Validation: 12/16 (auth works, missing XSS tests)
Data Integrity: 7/9 (migrations working, backup untested)
Contract Integrity: 7/7 (all contracts verified)
Behavioral Contracts: 5/7 (edge cases pending)
Tests Passing: 7/7 (all green)
Integration Evidence: 9/9 (real API calls verified)
Production Readiness: 8/14 (env vars done, monitoring pending)
Architecture Stability: 7/7 (no regressions)
No Mocks: 7/7 (all mocks removed)
Context Preservation: 7/7 (state handled)
Error Handling: 3/4 (most errors caught)
Scope Compliance: 4/4 (stayed in scope)
Documentation: 2/2 (updated)

TOTAL DRS: 85/100 - READY TO SHIP
```

This is a deployable state. Not perfect, but safe.

---

## DRS as a Session Guide

The DRS tells you what to work on next. Always address the lowest-scoring high-weight components first.

### Priority Order

1. **Security (16 points)** - Address security gaps before anything else
2. **Production Readiness (14 points)** - Can it actually run in production?
3. **Data Integrity (9 points)** - Can we trust the data?
4. **Integration Evidence (9 points)** - Are we hitting real services?

Don't polish documentation (2 points) while security is at zero. The weights guide your attention.

### The DRS Delta

Track how DRS changes over time:

```
10:00 - DRS: 17 (starting)
10:30 - DRS: 45 (+28) - Good progress
11:00 - DRS: 72 (+27) - On track
11:30 - DRS: 68 (-4) - REGRESSION! Investigate
12:00 - DRS: 85 (+17) - Deployable
```

If DRS decreases, something broke. Stop and investigate before continuing.

---

## Why 85, Not 100?

Perfect is the enemy of deployed. 85 DRS means:

- Security is solid (12+ out of 16)
- Core functionality works
- Production basics covered
- No critical gaps

The remaining 15 points are often polish: perfect documentation, comprehensive edge case tests, optimized performance. Important, but not blocking.

**The 85 threshold** balances risk management with shipping velocity. Below 85, you're taking unnecessary risk. Above 85, you're often over-engineering.

---

## Using DRS with AI

Tell the AI your current DRS and what's missing:

> "Current DRS is 72. Security validation is at 12/16 because we haven't implemented XSS prevention. Production readiness is at 6/14 because monitoring isn't configured. Which should we address first?"

The AI can now provide targeted help instead of generic suggestions. You've given it a framework for prioritization.

### DRS Checkpoints

Every 30 minutes, recalculate DRS and share with the AI:

> "Checkpoint: DRS increased from 45 to 68. We're still missing integration evidence (0/9) because we're using mocks. Let's focus on connecting real services."

This keeps the AI aligned with your actual progress, not just the code it's generating.

---

## Common DRS Patterns

### The Stuck Pattern

```
10:00 - DRS: 45
10:30 - DRS: 47
11:00 - DRS: 46
11:30 - DRS: 48
```

DRS isn't moving. You're busy but not progressing. Step back and identify the blocker.

### The Regression Pattern

```
10:00 - DRS: 60
10:30 - DRS: 72
11:00 - DRS: 65
```

DRS decreased. A "fix" broke something. Review what changed in the last 30 minutes.

### The Sprint Pattern

```
10:00 - DRS: 20
10:30 - DRS: 50
11:00 - DRS: 78
11:30 - DRS: 85
```

Rapid, consistent improvement. This is what good AI-assisted development looks like.

---

## Implementing DRS in Your Workflow

### Option 1: Manual Calculation

Keep a DRS template in your session notes. Fill it out every 30 minutes. Takes 3-5 minutes.

### Option 2: Automated Checks

Create scripts that check each component:
- Run test suite (Tests Passing)
- Check for mock keywords (No Mocks)
- Verify API connections (Integration Evidence)
- Run security linter (Security Validation)

Aggregate the results into a DRS score.

### Option 3: AI-Assisted Calculation

Ask the AI to help calculate DRS:

> "Based on our current code state, help me score each DRS component. Be honest about gaps."

Verify the AI's assessment against your own judgment.

---

## The Meta Point

The DRS replaces subjective "done" with objective measurement. It forces you to:

1. **Define** what deployment-ready means (the 13 components)
2. **Measure** your current state (the score)
3. **Prioritize** what matters most (the weights)
4. **Track** real progress (the delta)

This structure is especially valuable with AI, which can make you feel productive without actually making you ready to ship.

---

## Try It Today

Next session:
1. Calculate your starting DRS
2. Note which components score zero
3. Focus on high-weight zero-score components
4. Recalculate every 30 minutes
5. Don't deploy until you hit 85

Within a few sessions, you'll internalize what "ready to deploy" actually means. That intuition is invaluable.

---

*This is Part 7 of the AI Control Framework series. The framework provides systematic methods for maintaining human control over AI-assisted development. [View the full framework on GitHub](https://github.com/sgharlow/ai-control-framework)*

**Previous articles:**
1. Why 95% of AI Coding Sessions Fail
2. The 30-Minute Mock Rule
3. Session Recovery Guide
4. The Contract Freeze Protocol
5. Scope Control: The 5-File Rule
6. The Convergence Test

---

*What metrics do you use to determine if code is ready to ship? Share your approach in the comments.*

#programming #ai #productivity #devjournal
