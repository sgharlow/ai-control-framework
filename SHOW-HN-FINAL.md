# Show HN Final Copy — AI Control Framework

**Target Date:** January 8-10, 2025 (Wednesday ideal)
**Best posting time:** 9-10am EST (6-7am PST)
**Backup window:** Tuesday Jan 7 or Thursday Jan 9

---

## FINAL TITLE

> **Show HN: AI Control Framework – Stop AI coding assistants from shipping fake code**

*Rationale: "fake code" is more visceral than "non-deployable" and HN readers will immediately recognize the problem.*

---

## POST BODY (Copy/Paste Ready)

```
I've been using Claude Code and Cursor heavily for 18 months. After tracking 50+ sessions, I found the same patterns killing productivity:

- Beautiful code that breaks on deploy (mocks never replaced)
- Interfaces changing mid-session, breaking working features
- "Almost done" sessions that need 3 more days of rework
- No way to objectively know if code is actually ready

I built a framework that enforces discipline through external scripts—not just prompts the AI can ignore.

**How it works:**

1. **Contract Freezing** — Interfaces get SHA256-hashed. Any change requires explicit approval. Stops architecture drift.

2. **30-Min Mock Timeout** — Mocks allowed for exploration, then the script forces real service connections. No more "I'll add real data later."

3. **Scope Limits** — Hard stops at 5 files / 200 lines per session. Forces incremental, deployable chunks.

4. **DRS Score (0-100)** — Deployability Rating calculated from 13 components. When DRS ≥ 85, ship it.

**My results:**

| Before | After |
|--------|-------|
| 3-5 days to deploy | 4-6 hours |
| 67% rework rate | 12% |
| 4.2 breaking changes/feature | 0.3 |

**What's included:**
- Bash + PowerShell scripts
- 13 specification docs
- MCP server for Claude Code
- 136 tests (100% passing)

Works with any AI that can read files (Claude, Cursor, Copilot, Aider).

MIT licensed.

GitHub: https://github.com/sgharlow/ai-control-framework

Curious if others have tried similar approaches to AI coding discipline.
```

---

## PREPARED COMMENTS

### Comment 1: DRS Breakdown (post at ~30 upvotes)

```
For those asking about the DRS score, here's the 13-component breakdown:

| Component | Points | What It Checks |
|-----------|--------|----------------|
| Contract Integrity | 7 | API/DB schemas unchanged |
| Behavioral Contracts | 7 | Function signatures stable |
| Security Validation | 16 | No secrets, HTTPS, input validation |
| Data Integrity | 9 | No mock data in prod paths |
| No Mocks | 7 | All services connected |
| Tests Passing | 7 | Suite passing |
| Integration Evidence | 9 | Captured real API responses |
| Architecture Stability | 7 | No structural changes |
| Production Readiness | 14 | Logging, monitoring, rollback |
| Context Preservation | 7 | Session state preserved |
| Error Handling | 4 | Graceful failures |
| Scope Compliance | 4 | Within file/line limits |
| Documentation | 2 | README, comments |

The weights came from analyzing what actually caused my deployment failures.
```

### Comment 2: Quick Demo (post if top 20)

```
Quick session example:

$ ./drs-calculate.sh
═══════════════════════════════════════
DEPLOYABILITY SCORE: 34/100
═══════════════════════════════════════
✗ No Mocks (0/8) — 7 mocks detected
✗ Tests (3/7) — 2 failing
⚠ Scope (2/4) — 9 files changed
✓ Contracts (8/8)

45 minutes later, after replacing mocks and fixing tests:

$ ./drs-calculate.sh
DEPLOYABILITY SCORE: 87/100
✅ READY TO DEPLOY

That's the entire workflow. No guessing.
```

### Comment 3: Why 30 Minutes (post if asked)

```
The 30-minute mock timeout came from data.

In my logs, sessions where mocks survived past 30 mins had an 84% chance of shipping with fake data still in place.

30 mins is enough to:
- Explore an approach
- Validate the API shape works
- Not enough to build an elaborate fake system

When the timer expires, the script starts warning you. Forces the "connect to real services" conversation while it's still cheap to pivot.
```

### Comment 4: Scope Limits Defense (post if challenged)

```
"5 files / 200 lines is too restrictive"

That's the point. Here's what happens without limits:

Session 1: "Just add this feature" → 15 files, 800 lines
Session 2: "It broke something" → 8 more files to fix
Session 3: "Now the tests fail" → Rewrite half of it

With limits:
Session 1: 5 files, 180 lines → DRS 85 → Deploy
Session 2: Next increment → DRS 87 → Deploy
Session 3: Next increment → DRS 89 → Deploy

Smaller deploys = faster feedback = less rework.

The limits feel restrictive until you see the rework rate drop from 67% to 12%.
```

### Comment 5: Comparison to Alternatives (if asked)

```
How is this different from Cursor Rules / .cursorrules?

Cursor Rules tell the AI what to do. This framework verifies what the AI actually did.

The AI can claim "I removed all mocks" in its response. The detect-mocks.sh script actually greps the codebase to check. The DRS score is calculated from real file contents, not AI claims.

Think of it as:
- Cursor Rules = instructions
- AI Control Framework = enforcement + measurement
```

---

## TIMING STRATEGY

| Time | Action |
|------|--------|
| T+0 | Post (9am EST) |
| T+15m | First check, respond to early comments |
| T+1h | Post DRS breakdown if 20+ upvotes |
| T+2h | Post demo if top 20 |
| T+4h | Cross-post to Twitter, LinkedIn |
| T+8h | Reddit posts (r/ClaudeAI, r/cursor) |

---

## CROSS-POSTING

### Twitter/X (post at T+4h)

```
Just posted to Hacker News:

I built a framework that forces AI coding assistants to ship real code.

- Contract freezing (SHA256 hashes)
- 30-min mock timeout
- Deployability score (0-100)

Results: 67% rework → 12%

HN discussion: [link]
GitHub: https://github.com/sgharlow/ai-control-framework
```

### LinkedIn (separate post, T+4h)

```
I built something for developers struggling with AI coding assistants.

The problem: AI writes beautiful code that breaks on deploy.

The solution: A framework that enforces discipline through:
→ Contract freezing (no silent interface changes)
→ 30-minute mock timeout (real services required)
→ Deployability score (objective 0-100 metric)

My rework rate dropped from 67% to 12%.

Currently #X on Hacker News. Would love your feedback.

Link in comments.
```

---

## PRE-LAUNCH CHECKLIST

- [x] README polished with install instructions
- [x] GitHub Discussions enabled
- [x] v2.0.0 release tagged
- [x] `install.sh` tested on fresh machine
- [x] Demo GIF in README
- [x] At least 1 GitHub star
- [x] QUICK-WIN-DEMO.md created
- [x] CONTRIBUTING.md exists
- [x] No broken links in README

---

## BACKUP PLAN

If post doesn't gain traction in first 2 hours:
1. Don't delete (looks bad)
2. Re-post next week with different title (Option D: "73% of my AI coding sessions...")
3. Consider posting on Show HN on a different day

---

*Final copy prepared December 24, 2025*
*Last updated: December 29, 2025 — Ready for Jan 8-10 launch*
