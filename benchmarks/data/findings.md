## Findings

Written after reading every M1 hit, M2 flag, and M4 error in the raw data. Flattering and
unflattering observations both kept.

1. **The pre-repair `ai-pr-bot` tip exhibits the full claimed failure pattern in a single
   repo — the only repo in either cohort that does.** Its production queue processor posts
   hardcoded `mockFindings` as if they were real analysis output
   (`src/lib/queue-system/processors/pr-processor.ts:32-160`), the repo does not typecheck at
   the pinned commit (TS2554/TS2305 in `src/app.ts` / `src/app-simple.ts`), and git history
   shows it sat in that state from 2025-07 to the 2026-07 repair. This is the concrete case
   the framework's "mock data never replaced" claim generalizes from — one verified instance,
   not a frequency.

2. **Cohort B is not uniformly better, and the aggregates say so.** B loses on unverifiable
   README claims (33% vs 15% — `relay` claims "405 tests" and `orbis-exchange` "143 tests"
   with no workflow in-repo to back either) and on naive buildability (67% vs 73%). The
   discipline delta shows up where it is structural: real CI (67% vs 15%), LICENSE presence
   (100% vs 38%), and median DRS (32 vs 27).

3. **M1's pattern list is mostly false positives outside the one genuinely bad repo.**
   Reading all 29 hits: `dragon-haven`'s 6 are English words ("stubble", "stubborn", wing
   "stubs") in a pygame art file; `relay`'s 8 are documented dependency-injection test seams
   ("Test seam — inject a stub client"), which is an architecture choice, not residue. Genuine
   mock-in-production residue: 2/13 cohort A repos (`ai-pr-bot`, `kiro-living-docs-devpost`'s
   `mockAnalysis` in `src/server.ts:754`), 0/6 cohort B. The full hit lists are committed under
   `data/raw/` so anyone can re-classify.

4. **Build failures split into two distinct classes, and only one is a code-quality claim.**
   Real code errors: `ai-pr-bot` (does not typecheck, period). Fresh-clone reproducibility rot:
   `AutoSpecAI-Hackathon`'s `axe-cli@^4.6.0` no longer resolves in the npm registry (ETARGET —
   the dependency vanished); `AICIN`, `skillcrossroads`, and `orbis-exchange` are workspace
   monorepos whose typecheck requires internal packages to be built first, and the harness
   refuses to run repo build scripts (safety rule). All four are honestly "a fresh clone cannot
   be verified without extra steps," but the last three say more about harness scope than code
   health — `skillcrossroads`' own CI (which does run the build) is green.

5. **DRS separates the cohorts weakly.** Both cohorts land in a narrow 20-40 band of 100
   (median 27 vs 32); at rest the score is dominated by hygiene components (.env.example,
   docs, directory structure), not the session-time gates it was designed around — consistent
   with the METHODOLOGY note that the framework's own repo scores 27.

## Deviations from METHODOLOGY.md

Implemented as the closest honest version where the letter of the methodology conflicted with
the harness safety rule (never execute repo code) or produced vacuous/false measurements:

- **M5 safety shim.** `drs-calculate.sh` component 6 ("Tests Passing") shells out to
  `npm test` / `make test` — that executes repo code. During M5 a PATH shim blocks
  npm/make/yarn/pnpm/npx/bun, so repos *with* a test script score 0/7 on that component and
  repos with no test config score 3/7 (the script's own partial-credit branch). Applied
  identically to both cohorts, so the comparison stays like-for-like; absolute DRS values are
  therefore floors. DRS was run on the clean clone (before `npm install`).
- **M4 monorepo extension.** Repos without a root `tsconfig.json` but with sub-project
  tsconfigs (depth <= 3, first 10) get per-project `tsc --noEmit -p`. `npm install
  --ignore-scripts` runs only at the repo root, so workspace packages that need a build step
  fail typecheck; recorded as failures with error text (see Finding 4) rather than skipped.
- **M4 node --check scope.** Widened from "src-like dirs" to repo-wide `.js/.mjs/.cjs`
  (node_modules, build output, and test/fixture dirs excluded; `*.min.js` skipped) because
  several repos keep all code outside `src`-like dirs. Zero checkable files -> `n/a`, never a
  vacuous pass.
- **M2 badge rule.** Shields `badge/` URLs are hand-written by construction, so status-implying
  badges are flagged even when a workflows dir exists; numeric test-count claims are flagged
  only when no `.github/workflows` exists (per the methodology table). `%` counts as a status
  signal only as a numeric percentage after decoding `%20` — otherwise URL-encoding
  false-positives every badge.
- **M1 exclusions.** Patterns are verbatim from `detect-mocks.sh`; excluded directory names are
  the methodology's test/fixture/eval/mock set plus `node_modules`, and `detect-mocks.sh`'s own
  `*.test.* / *.spec.* / *.mock.*` file exclusion is kept.
- **M3 note.** Archived repos cannot receive new workflow runs; their recorded conclusion is
  the last run before archival (verbatim in `m3_raw`). `no-workflows-dir` = no CI at all.
