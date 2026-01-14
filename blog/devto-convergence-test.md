# The Convergence Test: Know When AI Coding Is Actually Making Progress

*How to distinguish real momentum from circular motion in AI-assisted development*

---

**TL;DR:** Most developers can't answer a simple question: "Is this AI coding session converging toward done, or spinning in circles?" The Convergence Test provides three concrete checks you can run at any point to know whether you're making real progress.

---

## The Problem: Motion Without Progress

You've been working with Claude (or GPT, or Copilot) for two hours. The terminal shows activity. Files are changing. The AI seems confident.

But here's the uncomfortable question: **Are you closer to done than you were an hour ago?**

Many developers can't answer this. They feel busy. They see changes. But they're experiencing what I call **circular development**—the code changes, but the actual distance to "done" doesn't shrink.

### Signs of Circular Development

- The same error message appears after multiple "fixes"
- You're adding code faster than you're removing problems
- Each solution introduces a new problem to solve
- The AI keeps saying "let me try a different approach"
- You've touched 15 files but can't point to measurable progress

If any of these sound familiar, you need the Convergence Test.

---

## The Three Convergence Checks

At any point in an AI coding session, run these three checks. If you pass all three, you're converging. If you fail any, stop and recalibrate.

### Check 1: The Count Goes Down

**Question:** "Is the number of remaining blockers smaller than it was 30 minutes ago?"

This is the most fundamental convergence signal. If you started with 5 failing tests and now have 3, you're converging. If you started with 5 and now have 7, you're diverging—even if the new failures are "different."

**How to measure:**
```bash
# Run at session start, note the count
npm test 2>&1 | grep -c "FAIL"

# Run every 30 minutes
# Count should decrease or stay stable
```

**What it catches:**
- "Whack-a-mole" debugging where fixing one thing breaks another
- Scope creep disguised as progress
- The AI introducing new issues faster than solving existing ones

**The rule:** If your problem count hasn't decreased in 30 minutes, stop coding and start investigating root cause.

### Check 2: The Core Path Works

**Question:** "Can I demonstrate the happy path of what I'm building?"

Progress means the essential functionality moves toward working. At any checkpoint, you should be able to demonstrate some version of the core feature—even if edge cases aren't handled yet.

**How to measure:**

1. Define your core path in one sentence: "User logs in and sees their dashboard"
2. Every 30 minutes, manually test this exact path
3. The path should either work or get closer to working

**What it catches:**
- Getting lost in yak-shaving (fixing tangential issues)
- Perfectionism on non-essential features
- AI going down rabbit holes on edge cases before core works

**The rule:** If you can't demo your core path working better than 30 minutes ago, you're not converging.

### Check 3: The Diff Makes Sense

**Question:** "Can I explain why each changed file brings us closer to done?"

Review your git diff (or unstaged changes). For every file that changed, you should be able to articulate: "This file changed because X, and that moves us toward Y."

**How to measure:**
```bash
# Review what changed
git diff --stat

# For each file, complete this sentence:
# "[filename] changed because _____, moving us toward _____"
```

**What it catches:**
- Spray-and-pray debugging (changing things hoping something works)
- AI-generated cruft (helper files, utilities that aren't actually needed)
- Scope expansion hidden in "necessary refactoring"

**The rule:** If you can't justify a change's contribution to the goal, revert it.

---

## Putting It Together: The 30-Minute Convergence Checkpoint

Every 30 minutes, pause and run all three checks:

```markdown
## Convergence Checkpoint [TIME]

### Check 1: Count Goes Down
- Problems at last check: ___
- Problems now: ___
- Status: [CONVERGING / STABLE / DIVERGING]

### Check 2: Core Path Works
- Can demo core path: [YES / PARTIAL / NO]
- Progress since last check: [BETTER / SAME / WORSE]

### Check 3: Diff Makes Sense
- Files changed: ___
- All changes justified: [YES / NO]
- Unjustified changes: ___

### Verdict: [CONTINUE / INVESTIGATE / STOP]
```

### Decision Rules

**All three pass → CONTINUE**
You're converging. Keep going.

**One or two pass → INVESTIGATE**
Something's off. Spend 10 minutes understanding why before proceeding.

**All three fail → STOP**
You're in circular development. Stop coding. Start over with a clearer plan.

---

## Example: Real Convergence vs. Circular Development

### Circular Development Session

```
10:00 - Start: 5 failing tests
10:30 - Fixed auth test, but now 6 tests fail (broke database test)
11:00 - Fixed database test, but now 7 tests fail (broke validation)
11:30 - "Let me try a different approach to validation"
12:00 - Back to 5 failing tests, but different ones
```

**At each checkpoint, Check 1 fails. Session should have stopped at 10:30.**

### Converging Session

```
10:00 - Start: 5 failing tests
10:30 - 4 failing tests (auth fixed, nothing new broken)
11:00 - 3 failing tests (database fixed)
11:30 - 2 failing tests (validation partially fixed)
12:00 - 1 failing test (almost there)
```

**Check 1 passes at every checkpoint. Real progress.**

---

## Why AI Makes This Worse

AI coding assistants are optimized to provide answers, not to converge on solutions. They'll happily try approach after approach, generating plausible-looking code that doesn't actually close the gap to done.

The AI doesn't know:
- How many problems existed before it started
- Whether its fix introduced new issues elsewhere
- If the changes it's making are justified by the goal

**You** have to provide this convergence awareness. The AI provides capability; you provide direction.

---

## Implementation Tips

### Tip 1: Log Your Checkpoints

Keep a simple log file:

```markdown
# Session Log - 2026-01-13

## 10:00 - Start
- Goal: Fix authentication flow
- Starting failures: 5

## 10:30 - Checkpoint 1
- Failures: 4 ✓
- Core path: Partial ✓
- Diff justified: Yes ✓
- Verdict: CONTINUE

## 11:00 - Checkpoint 2
- Failures: 6 ✗
- Core path: Worse ✗
- Diff justified: No ✗
- Verdict: STOP - investigate regression
```

### Tip 2: Use the AI for Convergence Checks

Ask the AI to help you assess convergence:

> "Before we continue, let's check convergence. We started with 5 failing tests. How many do we have now? Have we introduced any new problems? Can you explain how each file we changed contributes to the goal?"

A good AI will help you diagnose. A stuck session will become obvious.

### Tip 3: Set a Hard Divergence Limit

If you fail three consecutive convergence checks (90 minutes of non-convergence), end the session. Start fresh with better context. Continuing a divergent session rarely produces convergent results.

---

## The Meta Point

The Convergence Test isn't about being slow or cautious. It's about being **aware**.

Most developers in AI coding sessions are heads-down, watching code scroll by, trusting that activity equals progress. The Convergence Test forces you to lift your head every 30 minutes and ask: "Am I actually getting closer?"

That awareness is the difference between a productive session and a frustrating one.

---

## Try It Today

Next AI coding session:
1. Note your starting problem count
2. Set a 30-minute timer
3. Run the three checks at each alarm
4. Log your verdicts

Within a few sessions, you'll develop an intuition for when things are converging versus circling. That intuition is worth more than any AI feature.

---

*This is Part 6 of the AI Control Framework series. The framework provides systematic methods for maintaining human control over AI-assisted development. [View the full framework on GitHub](https://github.com/sgharlow/ai-control-framework)*

**Previous articles:**
1. Why 95% of AI Coding Sessions Fail
2. The 30-Minute Mock Rule
3. Session Recovery Guide
4. The Contract Freeze Protocol
5. Scope Control: The 5-File Rule

---

*What convergence signals do you watch for in your AI coding sessions? Share in the comments.*

#programming #ai #productivity #devjournal
