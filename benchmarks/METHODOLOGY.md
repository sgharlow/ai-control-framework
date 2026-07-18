# Benchmark methodology (Sprint 9 — the evidence layer)

**Purpose.** The README historically asserted failure frequencies ("mock data never replaced —
68% of sessions") and outcome deltas ("rework 67% → 12%") without a dataset behind them. This
directory replaces assertion with measurement: a reproducible harness, a stated sample, raw
outputs committed, limitations named. Where a historical claim cannot be backed, it is retired,
not defended.

## What is measured (claims → measurable proxies)

The framework claims AI-assisted repos accumulate specific, detectable failure patterns unless
gated. The harness measures the *statically detectable* subset, per repo:

| # | Metric | Proxy for | Exact check |
|---|---|---|---|
| M1 | Mock/placeholder residue in production paths | "mock data never replaced" | framework `detect-mocks` patterns over `src`-equivalent trees (test/fixture dirs excluded) |
| M2 | Unverifiable README claims | "demos assert, production proves" | static status badges (shields `badge/…passing/…%`) or numeric test-count claims with no workflow behind them |
| M3 | CI presence and reality | "tests that actually run" | `.github/workflows` exists AND latest run on default branch concluded `success` (API) |
| M4 | Buildability | "it compiles" — the floor | ecosystem-appropriate build/typecheck (`tsc`, `npm run build`, `python -m compileall`, `bash -n`) exits 0 |
| M5 | DRS score | the framework's own composite | `ai-framework/reference/bash/drs-calculate.sh` run at repo root, total /100 |
| M6 | License + provenance hygiene | shippability basics | LICENSE present; lockfile present where a manifest exists |

## Sample (no cherry-picking)

Two cohorts of the author's own public GitHub repos — the selection RULES are the sample,
chosen before results were seen:

- **Cohort A — pre-discipline era:** every repo archived in the 2026-07 cleanup that has code
  (banner-only stubs excluded): AI-matcher-AWS-hackathon, AutoSpecAI-Hackathon,
  kiro-living-docs-devpost, gemma-health, trivia60-aws-game-builder, gamejam26, scrum-web-app,
  dragon-haven, AICIN, kiro-rails, info-worker-demo, ticket-quality — plus ai-pr-bot at its
  pre-repair tip (the repo that never compiled).
- **Cohort B — verification-discipline era (built under explicit gates, 2026-05+):**
  skillcrossroads, relay, orbis-exchange, mdlink-check, orchestra-lite, mr-sentinel.

Both cohorts are the same single developer using AI assistance throughout. **This is the point
of the comparison and also its biggest confound** (see Limitations).

## Method

`benchmarks/run-benchmark.sh <repos-file>` clones each repo at a pinned commit (recorded in
`benchmarks/data/repos.lock`), runs M1–M6, and writes one JSON line per repo to
`benchmarks/data/results.jsonl` plus a rendered `benchmarks/RESULTS.md`. No network calls
during measurement except the M3 workflow-conclusion lookup (recorded verbatim). Anyone can
re-run against the same lock file, or point it at their own repos.

## Limitations (read before quoting any number)

1. **Observational, not causal.** Cohort A vs B entangles discipline with time, developer
   experience, project type, and project duration. The honest claim is "here is what my own
   repos look like, measured," not "the framework caused the delta."
2. **N is small** (≈13 + 6 repos, one developer). This is a practitioner's audit, not a study.
3. **Static proxies only.** M1 patterns produce false positives (legitimate fixtures) and
   misses; per-repo M1 hits are listed in the raw data so anyone can re-classify them.
4. **DRS measures session artifacts too** — repos at rest score low on evidence-freshness
   components by design; DRS is reported for both cohorts under identical conditions, so the
   comparison is like-for-like even though absolute values run low (the framework's own repo
   scores 27/100 — published in its README).
5. Historical claims that this dataset cannot support ("68% of sessions", "4.2x per feature",
   time-to-deploy deltas) are **retired from the README** and marked as such, not re-derived.
