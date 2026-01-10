# The 5-File Rule: How Scope Limits Prevent AI Session Disasters

**Subtitle:** Why artificial constraints are your best friend when coding with AI

---

## The Refactoring That Ate My Weekend

It started as a simple task: "Let's improve the error handling."

Four hours later, my AI assistant had touched 23 files, introduced a new logging abstraction, refactored the database layer, and was halfway through redesigning the authentication system.

Each change was "related" to error handling. Each change made sense in isolation. Together, they created a monster.

The diff was 2,400 lines. The mental model required to review it? Gone. The ability to pinpoint which change broke the tests? Lost in the noise.

This is **scope explosion**—and it's how AI assistants turn productive sessions into debugging nightmares.

---

## Why AI Assistants Love to Sprawl

AI doesn't sprawl maliciously. It sprawls *logically*.

**The Sprawl Pattern:**

1. You ask for X
2. AI notices X would be better with improvement Y
3. Y requires touching Z
4. Z is connected to W
5. "While I'm here, V could use cleanup..."
6. Hours pass. You now have VWXYZ problems.

Each step makes local sense. The global picture? Chaos.

**The Psychology:**

AI assistants are trained to be helpful. "I fixed it" feels better than "I stopped myself." Every additional fix feels like added value.

But engineering isn't about maximizing changes. It's about delivering **working, shippable improvements** with **minimal risk**.

Scope discipline isn't about doing less. It's about *shipping* more.

---

## The 5-File Rule

Here's the constraint that changed my AI coding sessions:

```
SCOPE LIMIT: Maximum 5 files changed per session
```

That's it. No exceptions.

### Why 5?

**5 files means:**
- One human can review the entire change
- You can hold the full context in working memory
- Integration risks are containable
- Rollback is straightforward
- Debugging has a bounded search space

**5 is not arbitrary:**
- Research shows 5±2 is human working memory capacity
- Code review studies show quality drops after 5 files
- Incident analysis shows most bugs come from large changesets

### How It Works

Before starting any AI session:

```markdown
## SESSION CONTRACT

Files allowed:
1. src/services/userService.ts
2. src/services/userService.test.ts
3. src/types/user.ts
4. [reserved]
5. [reserved]

OUT OF SCOPE:
- Database layer (even if related)
- Authentication (even if discovered bug)
- Logging infrastructure (even if "quick improvement")
```

When the AI suggests touching file #6:

```
AI: "I also notice the database connection pool could use..."

You: "STOP. That's out of scope. Note it for a future session."
```

The AI will often try to convince you. Hold the line.

---

## The 200-Line Companion Rule

Files are one dimension. Lines are another.

```
SCOPE LIMIT: Maximum 200 lines of code added per session
```

### Why 200?

**200 lines means:**
- Roughly 30 minutes of careful review
- A single logical change, well-implemented
- Enough room for tests + implementation + docs
- Not enough room for scope creep

**The math:**
- Average code review speed: 500 LOC/hour
- Quality attention: degrades after 200 LOC
- Most features: can be shipped in 100-200 LOC chunks

### How to Count

```bash
# Simple check
git diff --stat | tail -1

# Example output
5 files changed, 147 insertions(+), 23 deletions(-)
```

If insertions approach 200, stop adding features. Focus on:
- Removing unnecessary code
- Simplifying implementations
- Shipping what you have

---

## The Psychological Trick: Pre-Authorized Reserves

The hardest part of scope discipline is saying no when you're excited.

**Solution: Pre-authorize your slots wisely.**

Instead of:
```
Files: 1, 2, 3, 4, 5
```

Use:
```
Files:
1. Target file (required)
2. Test file (required)
3. Type definitions (likely)
4. [reserve for emergencies]
5. [reserve for emergencies]
```

Now when the AI says "let's also update the config," you have to actively *spend* a reserve slot. That friction is the point.

Most sessions, you'll end with reserves unused. That's success.

---

## Handling "But This Is Related"

The hardest AI argument to counter:

> "While we're in this file, it would be more efficient to also fix the related issue in the helper function, since we'll need to touch it anyway when we do the next feature."

**The Fallacy:**

Efficiency of touching vs. efficiency of shipping.

Yes, you're "already here." Yes, it's "related." But:

- You're optimizing for a future that may not happen
- You're adding risk to the current change
- You're making review harder
- You're extending the session without extending value

**The Counter:**

"Note it. Commit what we have. Start fresh if it's truly important."

Fresh sessions have fresh contexts. Fresh contexts have clearer thinking. Clearer thinking ships better code.

---

## Implementation: Session Start Protocol

At the beginning of every AI coding session:

```markdown
## SESSION SCOPE

**Mission:** [One sentence, one verb]

**Files (5 max):**
1. [Primary file]
2. [Test file]
3. [Types/interfaces]
4. [Reserve]
5. [Reserve]

**Lines (200 max):** Currently at 0/200

**Hard Stops:**
- More than 5 files touched → STOP
- More than 200 lines added → STOP
- Unrelated improvement suggested → NOTE for later
- Refactoring urge → ASK "Does this ship the mission?"
```

### The 10-Minute Check

Every 10 minutes, verify:

```bash
# Check file count
git diff --name-only | wc -l

# Check line count
git diff --stat | tail -1 | awk '{print $4}'
```

If approaching limits, shift to:
- Removing unnecessary changes
- Simplifying solutions
- Committing checkpoints

---

## The "One More Thing" Trap

Watch for these phrases:

- "While I'm here..."
- "It would be better if..."
- "I noticed that..."
- "A small improvement..."
- "Just a quick cleanup..."

Each one is scope creep in disguise.

**The Response:**

```
"Good observation. Add it to FUTURE-TASKS.md with context.
For now, we ship what we have."
```

Then actually add it. Don't lose the insight. Just don't act on it *now*.

---

## Case Study: The Authentication Fix

**Before Scope Discipline:**

Mission: "Fix the token refresh bug"

Actual changes:
- Fixed the bug (2 files, 40 lines) ✓
- Improved error messages (4 files, 80 lines)
- Refactored token storage (3 files, 120 lines)
- Updated logging (2 files, 45 lines)
- Cleaned up old code (5 files, 60 lines)

Total: 16 files, 345 lines

Result: Merged after 3-day review. Two regressions found. Hotfix required.

**After Scope Discipline:**

Mission: "Fix the token refresh bug"

Actual changes:
- Fixed the bug (2 files, 40 lines) ✓

Total: 2 files, 40 lines

Result: Merged same day. No regressions. Ship notes documented 4 follow-up improvements.

Time saved: 3 days of review + debugging.

---

## The Compound Effect

Small changes compound safely.

**Math of shipping:**

- 5 focused commits per week
- Each: 2-3 files, 50-100 lines
- Risk per commit: Low
- Velocity: Consistently high
- Codebase quality: Steadily improving

**Math of sprawling:**

- 1 large commit per week
- Each: 15-20 files, 400+ lines
- Risk per commit: High
- Velocity: Spiky (fast, then debugging)
- Codebase quality: Chaotic

The team that ships 5 small changes outperforms the team that ships 1 large change. Every time.

---

## Making It Automatic

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

FILES_CHANGED=$(git diff --cached --name-only | wc -l)
LINES_ADDED=$(git diff --cached --stat | tail -1 | awk '{print $4}' | tr -d '+')

if [ "$FILES_CHANGED" -gt 5 ]; then
    echo "ERROR: More than 5 files changed ($FILES_CHANGED)"
    echo "Break this into smaller commits."
    exit 1
fi

if [ "$LINES_ADDED" -gt 200 ]; then
    echo "ERROR: More than 200 lines added ($LINES_ADDED)"
    echo "This change is too large. Simplify or split."
    exit 1
fi

echo "Scope check: $FILES_CHANGED files, $LINES_ADDED lines - OK"
```

Now scope discipline is enforced, not optional.

---

## The Takeaway

AI assistants are incredibly capable. Too capable, sometimes.

Without constraints, that capability becomes chaos. With constraints, it becomes shipping.

**The 5-File Rule:**
- Maximum 5 files changed
- Maximum 200 lines added
- No exceptions without explicit trade-off discussion

**The result:**
- Sessions that end in commits, not cleanup
- Changes that get reviewed and merged
- Code that stays shippable

**Start today:** Before your next AI session, write down your 5 files. Hold to it. See what ships.

---

## Try It Yourself

The AI Control Framework includes built-in scope tracking with automatic warnings when you approach limits.

```bash
# Install
curl -sSL https://raw.githubusercontent.com/yourusername/ai-control-framework/main/install.sh | bash

# Check scope during session
./ai-framework.sh scope-check
```

[GitHub Repository](https://github.com/yourusername/ai-control-framework) | [Full Documentation](https://yourusername.github.io/ai-control-framework/)

---

*This is part 5 of the AI Control Framework series. Previous: [The Contract Freeze Protocol](link)*

---

**Tags:** #ai #programming #productivity #softwareengineering #codereview

**Series:** AI Control Framework

**Publish Date:** Scheduled for January 18, 2026
