# Workshown

**Show your work.**

Most AI-coding advice comes from solo builders shipping greenfield demos. This toolchain comes
from running engineering for regulated, safety-critical enterprise systems — 100+ engineers,
multi-account infrastructure, auditors who read the commit history — and shipping AI-assisted
code there every day. The difference between those two worlds is verification: a demo can
assert, production has to prove. AI can write most of the code, but only a verification layer —
tests that actually run, claims that trace to evidence, gates that refuse to pass what they
can't prove — makes it shippable.

One rule ties everything below together: **no claim without a check you can run.**

## The system

| | What it is | Get it |
|---|---|---|
| **[ai-control-framework](https://github.com/sgharlow/ai-control-framework)** — the *how* | Deployment-readiness scoring, contract freezing, evidence-backed gates | `npx ai-control-framework` |
| **[orchestra-lite](https://github.com/sgharlow/orchestra-lite)** — the *scale* | Parallel Claude Code agents on a markdown task board with git branch isolation | `npx orchestra-lite` |
| **[ai-pr-bot](https://github.com/sgharlow/ai-pr-bot)** — the *enforcement* | The gates, run where code lands: at PR time (currently under verified repair — the README says so, because that's the rule) | GitHub App |
| **[skillcrossroads](https://github.com/sgharlow/skillcrossroads)** — the *grade* | Evidence-cited scorecards for Claude Code artifacts, every finding with a file:line citation | [skillcrossroads.com](https://skillcrossroads.com) · `npx skillcrossroads` |

## The front door

**[claude-code-recipes](https://github.com/sgharlow/claude-code-recipes)** — 100 field-tested
recipes for knowledge workers, with 6 installable skills graded by skillcrossroads. The recipes
are the *what*; the system above is how the same work ships with verification instead of vibes.

## The case study

**[distraction](https://github.com/sgharlow/distraction)** ([distractionindex.org](https://distractionindex.org)) —
a live civic-tech product built end-to-end with this method: 59+ weeks of immutable public data,
full algorithmic transparency.

## The book

**[The Foreign Mind: Ender's Reframe for AI Leadership](https://www.amazon.com/dp/B0GYN5CQ9Z)**
([foreign-mind.com](https://foreign-mind.com)) — the leadership layer of the same thesis: AI
effectiveness is a leadership capability, not a technical skill. The tools on this page are
that argument, implemented.

## The evidence

[benchmarks/](https://github.com/sgharlow/ai-control-framework/tree/main/benchmarks) — a
reproducible audit of the author's own repos: methodology, pinned commits, raw data, and the
unflattering numbers left in (the disciplined cohort scored *worse* on README claim hygiene;
the framework's own repo scores 27/100 on its own metric — both published as measured).

**Follow the work:** [get the free Claude Code Quick Wins Kit](https://learningai365.kit.com/f27ea7c05a) — one list across the recipes, the tools, and the book.

---

Built by [Steve Harlow](https://github.com/sgharlow). Everything here is open source; where a
claim appears, a check backs it — including the unflattering ones.
