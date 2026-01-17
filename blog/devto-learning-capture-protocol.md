# The Learning Capture Protocol: How I Stopped Making the Same AI Coding Mistakes

**Subtitle:** Your AI sessions are full of insights. You're probably throwing them away.

---

## The Groundhog Day Problem

I noticed something disturbing after six months of AI-assisted development.

Every few weeks, I'd encounter the same problem. React component re-renders causing performance issues. I'd spend 20 minutes debugging with Claude, find the solution (useMemo or useCallback), and move on.

Then three weeks later: same problem, same debugging session, same 20 minutes wasted.

I was making the same discoveries over and over. Each session ended, the context disappeared, and the lessons vanished with it. I was living AI Groundhog Day.

The fix? Systematic learning capture. Now every session that solves a non-trivial problem adds to a growing knowledge base that makes future sessions smarter.

---

## Why AI Sessions Create (and Lose) So Much Knowledge

Every productive AI coding session generates insights:
- **Pattern discoveries**: "Oh, that's why the API was failing"
- **Workflow optimizations**: "Starting with tests first saved 30 minutes"
- **Codebase specifics**: "This legacy module requires X before Y"
- **Tool configurations**: "This flag makes the build 3x faster"

These insights are gold. But they're also ephemeral.

**The Context Evaporation Problem**

AI sessions have no memory by default. Each new session starts blank. That brilliant debugging approach you discovered yesterday? Gone. That codebase quirk Claude helped you navigate? Forgotten.

You become the only repository of session knowledge. And human memory is unreliable, especially for technical details under time pressure.

**The "I'll Remember That" Lie**

We tell ourselves we'll remember. We won't.

Studies show we forget 50% of new information within an hour. By next week, 90% is gone. That elegant pattern you discovered? You might remember it exists, but not the specific implementation. You'll spend time rediscovering it.

---

## The Learning Capture Protocol

The protocol has three rules:

1. **Capture immediately**: Document learnings during or right after the session, not later
2. **Classify by confidence**: New observations aren't trusted knowledge until validated
3. **Apply automatically**: High-confidence learnings must appear in future relevant sessions

### Rule 1: Capture Immediately

When you solve a non-trivial problem, pause for 60 seconds.

Write down:
- **What you learned** (one sentence)
- **The context** (when does this apply?)
- **The evidence** (what proved this works?)

Example:

```
LEARNING: API pagination must use cursor, not offset, for datasets >10K rows
CONTEXT: Backend API queries, data export features
EVIDENCE: Session 2026-01-12 - offset pagination caused 30s timeouts, cursor reduced to 200ms
```

This takes under a minute. The return is hours saved over the next year.

### Rule 2: Classify by Confidence

Not all learnings are equal. A pattern that worked once might have been coincidence.

**Confidence Levels:**

| Level | Criteria | Application |
|-------|----------|-------------|
| LOW | Observed once, single context | Show in relevant sessions, don't auto-apply |
| MEDIUM | Validated 2-3 times, multiple contexts | Suggest but confirm before applying |
| HIGH | Validated 4+ times, never contradicted | Auto-apply in all matching contexts |

A learning starts at LOW. Each successful application increases confidence. Each contradiction decreases it.

```
LEARNING L047: React forms should use controlled components for validation
CONFIDENCE: HIGH (validated 6 times, 0 contradictions)
LAST VALIDATED: 2026-01-15
AUTO-APPLY: Yes, when creating form components
```

This prevents over-indexing on a single observation while building trust in proven patterns.

### Rule 3: Apply Automatically

Learnings that sit in a document you never read are useless.

For each session, before starting:
1. Identify the domain (frontend, API, database, etc.)
2. Load HIGH confidence learnings for that domain
3. Present MEDIUM confidence learnings for review
4. Reference LOW confidence learnings if relevant problems arise

The goal: relevant knowledge appears at the moment of need, not after you've already wasted time rediscovering it.

---

## What to Capture (And What to Skip)

**Capture:**

1. **Non-obvious solutions**: If it took >10 minutes to figure out, capture it
2. **Performance discoveries**: Specific numbers, configurations, approaches that improved speed
3. **Codebase quirks**: Undocumented behaviors, legacy patterns, integration gotchas
4. **Tool configurations**: Flags, settings, environment variables that matter
5. **Process improvements**: Workflow changes that saved time

**Skip:**

1. **Documentation facts**: If it's in official docs, don't duplicate it
2. **One-time fixes**: Typos, syntax errors, obvious bugs
3. **Context-specific hacks**: Solutions so specific they'll never apply again
4. **Opinions without evidence**: "I think X is better" without proof

The filter: **Would this save me 5+ minutes in a future session?** If yes, capture it.

---

## The Learning Template

Use this format for consistency:

```markdown
## L{NUMBER}: {One-line summary}

**Captured:** {date}
**Confidence:** {LOW/MEDIUM/HIGH}
**Validations:** {count}
**Last Validated:** {date}

### Context
When does this apply? Be specific.

### Learning
What did you discover? Include concrete details.

### Evidence
What proved this works? Session references, metrics, outcomes.

### Application
How should this be applied in future sessions?
```

Example:

```markdown
## L023: Database migrations must run in transactions on PostgreSQL

**Captured:** 2026-01-10
**Confidence:** HIGH
**Validations:** 4
**Last Validated:** 2026-01-14

### Context
Database schema changes in any PostgreSQL project

### Learning
PostgreSQL supports transactional DDL. Migrations that fail mid-way can leave
the database in an inconsistent state if not wrapped in transactions. Always
use `BEGIN;` and `COMMIT;` or the ORM's transaction support.

### Evidence
- Session 2026-01-10: Failed migration left orphaned column, required manual fix
- Session 2026-01-12: Transactional migration rolled back cleanly on error
- Session 2026-01-14: Confirmed pattern works with Prisma and raw SQL

### Application
At session start for database work, remind: "Ensure migrations are transactional"
```

---

## Building the Feedback Loop

Capture is only half the system. The other half is validation.

**After each session, review:**

1. **Did any HIGH confidence learnings apply?** If yes and it worked, increment validation count
2. **Did any learnings get contradicted?** If yes, add note and consider downgrade
3. **Were there problems where existing learnings SHOULD have helped?** If yes, improve the context tags

**Monthly review:**

1. Archive learnings with no validations in 90 days
2. Promote MEDIUM learnings with 3+ validations to HIGH
3. Deprecate learnings that have been contradicted
4. Look for patterns—are certain domains generating more learnings?

This creates a living knowledge base that improves with use.

---

## Measuring Learning Capture ROI

Track these metrics:

**Session Efficiency:**
- Average time to solve recurring problems (should decrease)
- Number of "rediscovery" events (should approach zero)

**Learning Quality:**
- LOW → MEDIUM → HIGH progression rate
- Contradiction rate (should be <10%)
- Application rate (% of sessions where learnings were relevant)

**Knowledge Growth:**
- Total learnings by confidence level
- Learnings per domain
- Most-applied learnings (your highest-ROI insights)

If you're capturing learnings but session efficiency isn't improving, you're either capturing the wrong things or not applying them at the right moment.

---

## Integration With AI Sessions

The power multiplies when learnings feed directly into AI sessions.

**Session Start Prompt:**
```
Before we begin, here are relevant learnings from previous sessions:

HIGH CONFIDENCE (apply automatically):
- L023: Database migrations must run in transactions on PostgreSQL
- L045: Use cursor pagination for datasets >10K rows

MEDIUM CONFIDENCE (consider applying):
- L067: React Query's staleTime should be 5min for this API

Today's task: Implement the user export feature
```

The AI now starts with your accumulated wisdom instead of starting blank.

**Session End Prompt:**
```
Before we close, what did we learn that should be captured for future sessions?

Consider:
- Non-obvious solutions we discovered
- Performance improvements we identified
- Codebase patterns we should remember
```

This makes learning capture part of the natural workflow, not an afterthought.

---

## The Compound Effect

Here's what happens after six months of disciplined learning capture:

**Month 1:** 10 learnings, mostly LOW confidence. Feels like overhead.

**Month 3:** 35 learnings, 8 at HIGH confidence. Starting to see patterns apply.

**Month 6:** 80 learnings, 25 at HIGH confidence. Sessions start with context. Problems get solved faster. The AI feels like it "knows" your codebase.

The compound effect is real. Each captured learning is a deposit that pays dividends in every future session.

One developer I worked with tracked time-to-resolution for common problems. After implementing learning capture:
- Week 1: 25 minutes average
- Week 12: 8 minutes average

That's not AI getting smarter. That's accumulated knowledge applied systematically.

---

## Start Today

You don't need a complex system. Start with a single file:

```markdown
# Session Learnings

## L001: [Your first learning]
Captured: [today]
Confidence: LOW
Context: [when it applies]
Evidence: [what proved it]
```

Capture one learning from your next AI coding session. Then another. Build the habit before building the infrastructure.

The goal isn't perfect knowledge management. It's breaking the Groundhog Day cycle of rediscovering the same insights.

Your future self—the one not wasting 20 minutes on a problem you've already solved—will thank you.

---

## The Challenge

This week:
1. Capture 3 learnings from your AI coding sessions
2. Apply at least one to a future session
3. Track whether it saved time

If it does, you've validated the protocol. If it doesn't, you've learned something about what's worth capturing.

Either way, you're building knowledge instead of losing it.

---

*This is part of a series on AI coding control frameworks. Previous article: [The Iteration Budget Protocol: Why Setting Hard Limits Made My AI Coding 3x More Productive]*

*What's your best captured learning? I'm collecting examples of high-ROI insights—share in the comments.*
