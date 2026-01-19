# The Checkpoint Protocol: How Strategic Save Points Made My AI Coding Sessions Recoverable

**Subtitle:** Stop losing progress. Start creating restore points.

---

## The Lost Progress Problem

You're 45 minutes into a productive AI coding session. You've built a working authentication system, refactored the user service, and started on the permissions module. The session context is rich with decisions, patterns, and implicit understanding.

Then your laptop crashes. Or you close the wrong tab. Or the AI service has an outage.

You restart. And everything you built together—the shared understanding, the accumulated context, the momentum—is gone.

You can look at the code changes, but the "why" behind each decision has evaporated. The approach you were about to take? Lost. The edge cases you'd identified but not yet handled? Forgotten.

I used to lose hours to this. Not the code itself—Git preserved that—but the reasoning, the direction, the context.

Then I started creating checkpoints.

---

## What Is a Checkpoint?

A checkpoint is a snapshot of session state at a meaningful moment. Not just code changes, but the full context needed to resume as if nothing happened.

**A checkpoint captures:**

1. **What's accomplished** - Completed tasks and their outcomes
2. **What's working** - Code that's tested and stable
3. **Current direction** - What you're building toward
4. **Key decisions** - Choices made and rationale
5. **Open questions** - Unresolved issues and uncertainties
6. **Next actions** - Immediate next steps

Think of it like a save point in a video game. You can reload from any checkpoint and continue with full context, even if the original session is long gone.

---

## The Checkpoint Template

Use this format for consistency:

```markdown
## CHECKPOINT: [timestamp]

### Accomplished
- [What's been completed this session]
- [Include commit hashes for code changes]

### Working State
- [Components/features that are stable]
- [Tests passing/failing status]

### Current Direction
[Brief description of what you're building toward]

### Key Decisions
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

### Open Questions
- [Unresolved issue 1]
- [Uncertainty that needs investigation]

### Next Actions
1. [Immediate next step]
2. [Following step]
3. [After that]

### Context Files
- [File 1 - why it's relevant]
- [File 2 - why it's relevant]

### Session Notes
[Any other context that would help resume]
```

---

## When to Create Checkpoints

Not every moment deserves a checkpoint. Create them at **natural breakpoints**—moments where meaningful progress is complete and direction might shift.

**Checkpoint triggers:**

**1. Major Milestone Complete**

When you finish a significant piece of work:
- Feature is working end-to-end
- Test suite passes
- A coherent unit of functionality is done

**2. Direction Change**

When you're about to shift focus:
- Moving from backend to frontend
- Switching from implementation to testing
- Changing which file or module you're working on

**3. Complex Decision Made**

When you've resolved something non-obvious:
- Architectural choice between approaches
- Trade-off decision (performance vs. simplicity)
- Integration approach for external systems

**4. Time-Based**

Create checkpoints every 30-45 minutes regardless of state:
- Insurance against unexpected interruptions
- Forces you to articulate current position
- Provides restore points at regular intervals

**5. Before Risky Operations**

Before attempting something that might break things:
- Major refactoring
- Database migrations
- Dependency updates
- Experimental approaches

---

## The Checkpoint Discipline

Creating checkpoints requires discipline. Here's how to make it automatic:

**The 45-Minute Rule**

Set a timer for 45 minutes. When it rings:
1. Stop what you're doing
2. Create a checkpoint (2-3 minutes)
3. Reset the timer
4. Continue working

This guarantees you never lose more than 45 minutes of context, even in catastrophic failures.

**The Milestone Trigger**

After completing any task that took more than 15 minutes:
1. Commit your code
2. Create a checkpoint
3. Take a 5-minute break

The break reinforces the checkpoint habit and gives you mental reset before the next task.

**The Risk Checkpoint**

Before any operation that makes you nervous:
1. Create a checkpoint explicitly labeled "BEFORE [risky thing]"
2. Proceed with the risky operation
3. If it fails, you have a clear restore point

---

## Checkpoint Storage

Where you store checkpoints matters. You need them accessible when resuming, even in a new session.

**Options:**

**1. Session Log File**

Create a `session-log.md` in your project:

```markdown
# Session Log

## 2026-01-15 Session 2

### CHECKPOINT: 14:30
[checkpoint content]

### CHECKPOINT: 15:15
[checkpoint content]

## 2026-01-15 Session 1

### CHECKPOINT: 10:00
[checkpoint content]
```

Pros: Version controlled, project-specific, searchable
Cons: Requires file management

**2. Notes Application**

Store in Notion, Obsidian, or similar:
- Searchable across projects
- Easy to template
- Available everywhere

Cons: Not version controlled with code

**3. Git Commit Messages**

Embed checkpoints in commit messages for major commits:

```
feat: Add user authentication system

CHECKPOINT: Authentication complete, moving to permissions

Accomplished:
- JWT token generation and validation
- Login/logout endpoints
- Session middleware

Next: Build permission system using role-based approach

Key Decision: Chose JWT over sessions for stateless scalability
```

Pros: Travels with code, never lost
Cons: Only captures at commit points

**Recommended:** Use a session log file for frequent checkpoints, with major checkpoints also captured in commit messages.

---

## Resuming from Checkpoints

The value of checkpoints appears when you need to resume. Here's the protocol:

**Step 1: Find the Latest Checkpoint**

Open your session log or check recent commits. Identify the most recent checkpoint that represents stable, working state.

**Step 2: Restore Context**

In your new AI session, provide the checkpoint as opening context:

```
I'm resuming from a previous session. Here's my checkpoint:

[paste checkpoint content]

Before we continue, please confirm you understand:
1. What we've accomplished
2. Where we're headed
3. The key decisions we've made
```

**Step 3: Verify Understanding**

Ask the AI to summarize what it understands about the current state. This catches any misunderstandings before you build on false assumptions.

**Step 4: Continue from Next Actions**

Pick up exactly where the checkpoint's "Next Actions" left off. The checkpoint has already done the work of identifying what comes next.

---

## Checkpoint Anti-Patterns

**1. Too Vague**

Bad: "Working on the user system"
Good: "Completed user registration. Email verification endpoint works. Next: password reset flow using same email service pattern."

**2. Too Detailed**

Bad: [500 lines capturing every line of code changed]
Good: Enough detail to restore context, not reproduce the code.

**3. No Rationale**

Bad: "Chose approach A"
Good: "Chose approach A because it handles the concurrent access case we discovered in testing"

**4. Stale Checkpoints**

Don't reference outdated checkpoints. When you resume, verify the checkpoint still matches the code. If not, update it before continuing.

**5. Missing Files**

Always include which files are relevant. "Working on authentication" is less useful than "Working on src/auth/jwt.service.ts and src/middleware/auth.middleware.ts"

---

## Advanced: Checkpoint Branching

Sometimes you want to explore multiple approaches from the same checkpoint.

**The Technique:**

1. Create a checkpoint at a decision point
2. Explore Approach A
3. If A doesn't work, create a new session
4. Load the original checkpoint
5. Explore Approach B

The checkpoint becomes a branch point. You can return to it and try different paths without losing the context that got you there.

**Example:**

```
CHECKPOINT: Auth Architecture Decision Point

We need to add authentication. Two viable approaches:
A) JWT with refresh tokens - simpler, stateless
B) Session-based with Redis - more control, familiar pattern

Both integrate with our existing user model.
Current code supports either approach.

I'll explore A first. If issues arise, return here for B.
```

---

## Measuring Checkpoint ROI

Track these metrics to validate the practice:

**Time Lost to Context Loss:**
Before checkpoints, how many minutes/hours did you lose per week to session interruptions?

**Recovery Time:**
With checkpoints, how long does it take to get back to productive work after an interruption?

**Checkpoint Frequency:**
How often are you creating checkpoints? Too few risks lost progress; too many creates overhead.

**Checkpoint Quality:**
When you resume from checkpoints, do you have enough context? Are there consistent gaps?

My numbers after 3 months:
- Context loss time: 4+ hours/week → <30 minutes/week
- Recovery time: 15-20 minutes → 3-5 minutes
- Checkpoint frequency: Every 40-50 minutes average
- Quality: 95%+ of checkpoints sufficient for full recovery

---

## Integration With Other Protocols

Checkpoints work best as part of a broader system:

**With Learning Capture Protocol:**
After completing each checkpoint, ask: "Did we learn anything worth capturing?" Checkpoints are natural moments for learning extraction.

**With Iteration Budget Protocol:**
Create checkpoints at iteration boundaries. If you hit your iteration limit, the checkpoint captures where you stopped for potential continuation.

**With Evidence Capture Protocol:**
Checkpoints should include evidence references (commit hashes, test results). This creates an audit trail of session progress.

**With Session Recovery Guide:**
When sessions fail, the checkpoint protocol gives you something concrete to recover from. The recovery guide tells you how to use that checkpoint effectively.

---

## Start Today

You don't need a perfect system to start. Here's your first checkpoint:

```markdown
## CHECKPOINT: [right now]

### Accomplished
- Read article about checkpoint protocol

### Working State
- Current project: [your project]
- Known stable state: [last working commit]

### Current Direction
- [What you're trying to build]

### Next Actions
1. Create session-log.md in my project
2. Set 45-minute checkpoint timer
3. Create first real checkpoint after next milestone
```

Save this somewhere. You've just created your first checkpoint.

The goal isn't perfection—it's recoverability. Every checkpoint you create is insurance against lost progress and evaporated context.

Start checkpointing. Your future interrupted self will thank you.

---

*This is part of a series on AI coding control frameworks. Previous article: [The Learning Capture Protocol: How I Stopped Making the Same AI Coding Mistakes]*

*What's your checkpoint strategy? Share your approach in the comments.*
