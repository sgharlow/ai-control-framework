# How to Recover a Broken AI Coding Session (Without Starting Over)

**Subtitle:** The system that saves hours when your AI assistant goes off the rails

---

## The Moment Everything Falls Apart

You've been coding with your AI assistant for 2 hours. Progress feels good. Then you run the build.

```
ERROR: Cannot find module './UserService'
ERROR: Type 'string' is not assignable to type 'User'
ERROR: Property 'authenticate' does not exist on type 'AuthProvider'
47 errors found.
```

Your heart sinks. The AI was so confident. "All tests passing," it said. "Ready for deployment," it claimed.

Now you're staring at a codebase that's worse than when you started. The changes span 12 files. You can't remember which parts worked before. Rolling back means losing 2 hours of actual progress mixed with the broken parts.

**Most developers at this point do one of three things:**

1. Start over (losing all progress)
2. Spend 4+ hours debugging (often making it worse)
3. Give up and do it manually (defeating the AI purpose)

There's a fourth option: **Session Recovery.**

---

## Why AI Sessions Break

Understanding *why* sessions break helps you prevent—and recover from—failures.

### The Compound Error Problem

AI assistants don't just make one mistake. They make one mistake and then build on it.

```
Minute 10: "I'll rename this interface slightly for clarity"
Minute 20: "Now I'll update these 4 files to match"
Minute 30: "Let me add this helper to support the new pattern"
Minute 40: "I'll refactor the auth system to align with..."
Minute 60: 47 errors, 12 files changed, original goal forgotten
```

Each step seemed reasonable. The AI didn't know minute 10's "clarity improvement" violated a contract that 15 other services depend on.

### The Confidence Illusion

AI assistants report success based on *local* checks:
- "The function compiles" ✓
- "The test I wrote passes" ✓
- "The syntax is valid" ✓

They don't verify *global* constraints:
- Does the build still pass?
- Do the existing tests still work?
- Is the API contract unchanged?

This creates a dangerous gap between reported progress and actual progress.

### The Memory Fade

After 45 minutes, the AI forgets what state things were in at the start. It can't diff against the original—it only knows the current (broken) state.

When you ask "what changed?", the AI reconstructs from memory, often missing critical details.

---

## The Recovery System

The AI Control Framework includes a session recovery system built on three principles:

1. **Capture state continuously** (not just at session end)
2. **Make recovery granular** (restore pieces, not everything)
3. **Verify before continuing** (don't rebuild on broken foundation)

### Automatic State Snapshots

Every 15 minutes, the framework captures a recovery point:

```bash
$ ls .ai-framework/snapshots/
2026-01-10-1400.snapshot  # Session start
2026-01-10-1415.snapshot  # Minute 15
2026-01-10-1430.snapshot  # Minute 30
2026-01-10-1445.snapshot  # Minute 45 (where things broke)
```

Each snapshot contains:

```yaml
# .ai-framework/snapshots/2026-01-10-1430.snapshot
timestamp: "2026-01-10T14:30:00Z"
drs_score: 72
contracts:
  api/openapi.yaml: "sha256:a1b2c3..."
  db/schema.sql: "sha256:d4e5f6..."
files_changed: 3
lines_added: 87
tests_passing: 14/14
notes: "Auth endpoint complete, starting payment flow"
git_ref: "abc123"
```

When things break, you can restore to any snapshot—not just "before the session."

### The Recovery Command

```bash
$ ./ai-framework/recover.sh

Session Recovery Tool
=====================

Current State:
  DRS: 34 (CRITICAL - was 72)
  Build: FAILING (47 errors)
  Tests: 8/14 passing

Available Recovery Points:
  [1] 14:45 - DRS 72, build passing, 4 files changed
      Note: "Payment mock added, auth complete"
  [2] 14:30 - DRS 72, build passing, 3 files changed
      Note: "Auth endpoint complete"
  [3] 14:15 - DRS 68, build passing, 1 file changed
      Note: "Started auth implementation"
  [4] 14:00 - DRS 65, build passing, session start

Select recovery point [1-4, or 'analyze' for details]:
```

### Selective Recovery

The real power is **selective recovery**—restoring only the broken parts.

```bash
$ ./ai-framework/recover.sh --analyze

Analyzing divergence from last good state (14:30)...

Files with errors originating after 14:30:
  src/services/PaymentService.ts (3 errors)
  src/api/payment.ts (2 errors)
  src/types/Payment.ts (1 error)

Files changed but working:
  src/services/AuthService.ts ✓
  src/api/auth.ts ✓
  src/middleware/authenticate.ts ✓

Recommendation:
  KEEP: Auth changes (working, 142 lines of good code)
  REVERT: Payment changes (broken, 89 lines)

Apply recommendation? [y/n]
```

This preserves your working code while reverting only what broke.

---

## The Recovery Protocol

When a session breaks, follow this protocol:

### Step 1: Stop Immediately

Don't let the AI "fix" the errors. More changes = harder recovery.

```
STOP SIGNAL TRIGGERED
======================
DRS dropped from 72 to 34
Build status changed from PASSING to FAILING

Do not make additional changes.
Run: ./ai-framework/recover.sh
```

### Step 2: Assess the Damage

Before recovering, understand what happened:

```bash
$ ./ai-framework/diagnose.sh

Session Diagnosis
=================

Timeline of DRS:
  14:00  65  ████████████████▓▓▓▓
  14:15  68  █████████████████▓▓▓
  14:30  72  ██████████████████▓▓
  14:45  72  ██████████████████▓▓
  15:00  34  ████████▓▓▓▓▓▓▓▓▓▓▓▓  ← Break point

Critical Changes at 15:00:
  - Payment.ts: Added 'status' field to interface
  - PaymentService.ts: Changed return type
  - 4 downstream files not updated

Root Cause: Interface change without updating dependents

Recovery Difficulty: LOW
  - Clean break point available (14:45)
  - No data migrations involved
  - Contract violations are type-only
```

### Step 3: Choose Recovery Strategy

Three strategies based on situation:

**Strategy A: Full Rollback**
When: Everything after a point is broken
Command: `./ai-framework/recover.sh --to 14:45`
Result: Return to snapshot state completely

**Strategy B: Selective Revert**
When: Some changes work, some don't
Command: `./ai-framework/recover.sh --revert-files Payment*.ts`
Result: Keep working changes, revert specific files

**Strategy C: Surgical Fix**
When: Small, isolated issue
Command: Continue manually with AI guidance
Result: Fix the specific problem without losing work

### Step 4: Verify Before Continuing

After recovery, verify the foundation is solid:

```bash
$ ./ai-framework/drs-calculate.sh

DRS: 72/100 ✓
Build: PASSING ✓
Tests: 14/14 ✓
Contracts: FROZEN ✓

Ready to continue session.
Note: Payment implementation reset to pre-mock state.
```

### Step 5: Resume with Context

The recovery system generates a handoff for the AI:

```markdown
## Session Recovery Handoff

### What Was Completed (KEEP):
- AuthService implementation (src/services/AuthService.ts)
- Auth API endpoint (src/api/auth.ts)
- JWT middleware (src/middleware/authenticate.ts)
- Tests: 14 passing

### What Was Reverted (REDO):
- PaymentService (interface change caused cascade failure)
- Payment types (reverted to stable version)

### Root Cause of Failure:
Changed Payment interface at line 23 without updating:
- PaymentController (expected old interface)
- CheckoutService (used old type)
- PaymentValidator (checked old fields)

### How to Proceed:
1. DO NOT change Payment interface
2. Implement PaymentService using existing interface
3. If interface change is needed, use Contract Change Request

### Current DRS: 72 (was 34 before recovery)
```

This gives the AI (and you) clear context for resuming.

---

## Prevention: The Checkpoint Habit

The best recovery is one you never need. Build checkpoints into your workflow:

### Every 15 Minutes: Quick Check

```bash
$ ./ai-framework/checkpoint.sh

✓ Build passing
✓ Tests passing
✓ DRS: 74 (stable)
✓ Contracts frozen
✓ Scope: 2/5 files

Snapshot saved: 2026-01-10-1515.snapshot
```

Takes 10 seconds. Saves hours.

### Before Risky Changes: Manual Checkpoint

When the AI suggests something risky:

```bash
$ ./ai-framework/checkpoint.sh --note "Before interface refactor"

Checkpoint created: 2026-01-10-1520-before-refactor.snapshot
DRS: 74
Recovery command: ./ai-framework/recover.sh --to 2026-01-10-1520-before-refactor
```

Now you have a guaranteed rollback point.

### After Significant Progress: Commit

When a logical chunk is complete:

```bash
$ git add -A && git commit -m "feat(auth): Complete authentication flow - DRS 74"
```

Git commits are the ultimate recovery points. Snapshot system complements—doesn't replace—version control.

---

## Real Recovery Example

Here's an actual recovery from my logs:

**The Situation:**
- 90 minutes into a session
- Adding Stripe integration
- AI "completed" the feature
- Build had 23 errors

**The Recovery:**

```bash
$ ./ai-framework/recover.sh --analyze

Last good state: 75 minutes (DRS 78)
Current state: 90 minutes (DRS 41)

Changes in broken window (75-90 min):
  + src/services/StripeService.ts (89 lines)
  + src/api/checkout.ts (45 lines)
  ~ src/types/Order.ts (modified - BROKE)
  ~ src/services/OrderService.ts (modified - BROKE)

The Order.ts modification cascaded to 6 files.

Recommendation: Revert Order.ts, OrderService.ts
                Keep StripeService.ts, checkout.ts
```

I applied the selective recovery:

```bash
$ ./ai-framework/recover.sh --revert-files src/types/Order.ts src/services/OrderService.ts

Reverting 2 files to state at 75:00...
Running build...
✓ Build passing
Running tests...
✓ Tests: 18/18

DRS: 76 (recovered from 41)

Preserved: 134 lines of Stripe integration code
Reverted: 23 lines of interface changes
```

**Time saved:** Instead of 2+ hours debugging or starting over, recovery took 3 minutes. I kept 85% of my work.

---

## The Recovery Mindset

Session recovery changes how you approach AI coding:

### Old Mindset:
- "I hope this works"
- "Let's see where this goes"
- "We'll fix it later"

### Recovery Mindset:
- "I can always roll back"
- "Let's checkpoint before trying this"
- "If it breaks, I know exactly where"

This isn't pessimism—it's confidence through preparation.

When you know recovery is easy, you're free to:
- Try riskier approaches
- Let the AI explore
- Move faster without fear

The safety net makes you more productive, not less.

---

## Getting Started

```bash
# Install the framework
git clone https://github.com/sgharlow/ai-control-framework.git
./ai-control-framework/install.sh /path/to/project

# Enable automatic snapshots (every 15 minutes)
./ai-framework/config.sh --auto-snapshot 15

# Check current recovery points
./ai-framework/snapshots.sh --list

# Practice a recovery (dry run)
./ai-framework/recover.sh --dry-run --to latest
```

The recovery system works with any AI assistant: Claude Code, Cursor, Copilot, Aider.

---

## The Bottom Line

Every AI coding session is one bad suggestion away from disaster. The question isn't *if* a session will break—it's *when*.

With session recovery:
- 2-hour disasters become 3-minute recoveries
- You keep working code while reverting broken parts
- The AI gets clear context for resuming

**Stop fearing session failures. Start recovering from them in minutes.**

[Try the AI Control Framework →](https://github.com/sgharlow/ai-control-framework)

---

## Related Articles

1. [Why Most AI Coding Sessions Fail](link-to-article-1) - The problem this solves
2. [The 30-Minute Mock Rule](link-to-article-2) - Prevention through discipline

---

*Have a session recovery story? Share your worst AI session disaster in the comments—and how (or if) you recovered.*

---

## Tags for Dev.to

```
#ai #productivity #devops #programming
```

## Cover Image Suggestion

Terminal showing:
- Left side: `DRS: 34 ❌ BUILD FAILING`
- Arrow with "3 minutes"
- Right side: `DRS: 76 ✓ BUILD PASSING`
- Caption: "Session Recovery: From Disaster to Deployable"
