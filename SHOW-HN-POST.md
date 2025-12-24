# Show HN Post Draft — AI Control Framework

**Target Date:** January 8-10, 2025
**Best posting times:** Tuesday-Thursday, 9-11am EST

---

## Title Options (pick one)

**Option A (Problem-focused):**
> Show HN: AI Control Framework – Stop AI coding assistants from producing non-deployable code

**Option B (Solution-focused):**
> Show HN: A framework that forces AI to ship real code, not beautiful demos

**Option C (Metric-focused):**
> Show HN: I built a "Deployability Score" for AI-generated code (DRS 0-100)

**Option D (Pain-point):**
> Show HN: 73% of my AI coding sessions produced non-deployable code. I fixed it.

**Recommended: Option A or D** — they lead with the problem HN readers will recognize.

---

## Post Body

```
I've been using Claude Code and Cursor heavily for the past year, and I kept hitting the same problems:

- Code that "looks done" but breaks when you try to deploy it
- Interfaces changing mid-session, breaking things that worked
- Beautiful mock data that never gets replaced with real API calls
- No objective way to know if the code is actually ready to ship

After analyzing ~50 failed sessions, I identified 13 specific failure patterns. Then I built a framework to prevent them.

**The AI Control Framework enforces discipline through:**

1. **Contract Freezing** — Interfaces get SHA256-hashed. Any change requires explicit approval (CCR). This stops architecture drift.

2. **30-Minute Mock Timeout** — Mocks are allowed for exploration, but the framework forces you to connect real services within 30 minutes. No more "I'll add real data later."

3. **Scope Limits** — Hard stops at 5 files changed, 200 lines added per session. Forces incremental, deployable progress.

4. **Deployability Rating Score (DRS)** — A 0-100 score based on 13 components: contract integrity, test coverage, real service connections, error handling, etc. When DRS hits 85+, you know you can ship.

**Results from my projects:**

| Metric | Before | After |
|--------|--------|-------|
| Time to deploy | 3-5 days | 4-6 hours |
| Rework rate | 67% | 12% |
| Breaking changes | 4.2/feature | 0.3/feature |

The framework works with any AI assistant (Claude Code, Cursor, Copilot, etc.) — it's just scripts and templates that the AI reads at session start.

**What's included:**
- Bash + PowerShell scripts for all checks
- 13 specification documents
- 9 tracking templates
- 20 ready-to-use prompts
- MCP server for Claude Code integration

It's MIT licensed. I've been using v2.0 in production for a month with 100% test pass rate (33/33 tests).

GitHub: https://github.com/sgharlow/ai-control-framework

Would love feedback, especially from others who've struggled with AI coding assistant reliability.
```

---

## Anticipated Questions & Answers

### Q: "Isn't this just prompt engineering?"

> Not quite. Prompt engineering tells the AI what to do. This framework *enforces* constraints through external scripts that validate actual project state. The AI can't just claim "mocks removed" — the `detect-mocks.sh` script actually checks the codebase. The DRS score is calculated from real file contents, not AI claims.

### Q: "Why 30 minutes for mocks?"

> From my data, 30 minutes is enough time to explore an approach with fake data, but not so long that you build an entire fake system. The timeout forces the "connect to real services" conversation early, when it's still cheap to pivot.

### Q: "5 files / 200 lines seems restrictive"

> That's intentional. The limits force incremental progress. When you hit the limit, you ship what you have (if DRS 85+), then start a fresh session. This prevents the "I'll just fix one more thing" spiral that leads to massive, undeployable changes.

### Q: "Does this work with [X] AI assistant?"

> Yes, if it can read files. The framework is just markdown specs and shell scripts. You load CLAUDE.md at session start, which tells the AI to run the validation scripts periodically. Works with Claude Code, Cursor, Copilot Chat, Aider, etc.

### Q: "What's the learning curve?"

> About 2 minutes to install, one session to internalize. Run `initialize-project.sh`, paste the session-start prompt, and follow the DRS score. The AI handles most of the framework interaction.

### Q: "Can I customize the limits?"

> Yes, everything is configurable. Edit the script variables (`MAX_FILES`, `MAX_LINES`, `MOCK_TIMEOUT`). The DRS weights are also adjustable if your domain values different things (e.g., more weight on security for fintech).

---

## Follow-up Comments to Post

**Comment 1 (post ~1 hour after):**
> For those asking about the DRS score breakdown, here's what the 13 components measure:
>
> - Contract Integrity (7 pts) — API/DB contracts unchanged
> - Security Validation (16 pts) — No secrets in code, HTTPS, etc.
> - No Mocks (7 pts) — All services are real
> - Tests Passing (7 pts) — Green test suite
> - Integration Evidence (9 pts) — Captured API responses
> - Error Handling (4 pts) — Graceful failures
> - [etc.]
>
> The weights came from analyzing what actually caused deployment failures in my projects.

**Comment 2 (post if gaining traction):**
> Quick demo of a session:
>
> ```
> $ ./ai-framework/scripts/drs-calculate.sh
> ═══════════════════════════════════════
> DEPLOYABILITY SCORE: 72/100
> ═══════════════════════════════════════
> ✓ Contract Integrity (7/7)
> ✓ No Mocks (7/7)
> ✗ Tests Passing (3/7) — 2 tests failing
> ⚠ Error Handling (2/4) — Missing try/catch in api.js
> ```
>
> When it hits 85+, I deploy. Simple as that.

---

## Engagement Strategy

1. **First hour:** Monitor for questions, respond quickly
2. **If top 10:** Post the DRS breakdown comment
3. **If top 5:** Post the demo comment
4. **Cross-post to:**
   - Twitter/X with link
   - LinkedIn (separate post, not just link)
   - r/ClaudeAI, r/ChatGPTCoding, r/cursor

---

## Pre-Launch Checklist

Before posting:
- [ ] README has install instructions that work
- [ ] `install.sh` tested on fresh machine
- [ ] GitHub Discussions enabled
- [ ] CONTRIBUTING.md exists
- [ ] At least 1 GitHub star (looks less empty)
- [ ] No broken links in README
- [ ] Demo GIF or video in README

---

*Draft created December 24, 2025*
