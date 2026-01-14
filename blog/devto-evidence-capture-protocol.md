# The Evidence Capture Protocol: Proving AI-Generated Code Actually Works

*Confidence isn't evidence. Screenshots aren't proof. Build a system that proves your code works.*

---

**TL;DR:** AI says "it works." Tests say "passed." But without captured evidence, you're trusting memory over proof. The Evidence Capture Protocol creates timestamped, verifiable records that your code actually does what it claims—protecting you when things go wrong (and they will).

---

## The Problem: "It Worked Earlier"

Every developer has said it: "It was working an hour ago."

The problem? You can't prove it. You have no evidence of what "working" looked like. When production breaks, you're reconstructing from memory.

AI coding makes this exponentially worse. You're iterating rapidly. The AI suggests changes. You apply them. Something breaks. Now you're asking:

- "When exactly did this break?"
- "What was the last working state?"
- "Did the AI introduce this bug or did I?"

Without evidence, these questions are unanswerable. You're debugging in the dark.

---

## What Is Evidence?

Evidence isn't "I saw it work." Evidence is **timestamped, verifiable proof** that something functioned correctly at a specific moment.

**Not evidence:**
- "Tests passed" (which tests? when?)
- "It worked on my machine" (which version? what state?)
- "The AI said it was done" (AI has no concept of done)

**Real evidence:**
- Test output with timestamps
- API response payloads captured to files
- Performance metrics from actual requests
- Screenshot of working UI at known commit
- Database state snapshots before/after operations

The difference: real evidence can be independently verified. Claims cannot.

---

## The Evidence Capture Protocol

Capture evidence at three critical points: **start of session**, **every 30 minutes**, and **end of session**.

### Point 1: Session Start Evidence

Before changing anything, capture the current state:

```bash
# Create evidence directory
mkdir -p evidence/$(date +%Y%m%d)

# Capture starting state
git rev-parse HEAD > evidence/$(date +%Y%m%d)/start-commit.txt
npm test 2>&1 | tee evidence/$(date +%Y%m%d)/start-tests.log
curl -s https://api.example.com/health > evidence/$(date +%Y%m%d)/start-health.json
```

Why: When something breaks, you need to know what "before" looked like. This is your baseline.

### Point 2: Interval Evidence (Every 30 Minutes)

Every 30 minutes, capture:

1. **Test State**: Which tests pass? Which fail?
2. **API State**: Are real endpoints responding?
3. **Build State**: Does it compile? Any warnings?
4. **Metrics State**: Performance, error rates, logs

```bash
# 30-minute evidence capture
TIMESTAMP=$(date +%H%M)
npm test 2>&1 | tee evidence/$(date +%Y%m%d)/${TIMESTAMP}-tests.log
curl -s https://api.example.com/endpoint > evidence/$(date +%Y%m%d)/${TIMESTAMP}-response.json
npm run build 2>&1 | tee evidence/$(date +%Y%m%d)/${TIMESTAMP}-build.log
```

Why: 30 minutes is the maximum gap you can debug from memory. Longer gaps mean lost context.

### Point 3: Session End Evidence

Before ending any session:

```bash
# End-of-session evidence
git rev-parse HEAD > evidence/$(date +%Y%m%d)/end-commit.txt
git diff --stat > evidence/$(date +%Y%m%d)/changes-summary.txt
npm test 2>&1 | tee evidence/$(date +%Y%m%d)/end-tests.log
echo "DRS: 85" > evidence/$(date +%Y%m%d)/final-drs.txt
```

Why: This is your handoff to future you (or the next developer). Without it, they inherit your debt with no documentation.

---

## The Evidence Directory Structure

Organize evidence for retrieval, not storage:

```
evidence/
├── 20260113/
│   ├── start-commit.txt        # Starting point
│   ├── start-tests.log         # Initial test state
│   ├── 0930-tests.log          # 9:30 AM capture
│   ├── 0930-response.json      # API response at 9:30
│   ├── 1000-tests.log          # 10:00 AM capture
│   ├── 1000-response.json      # API response at 10:00
│   ├── end-commit.txt          # Ending point
│   ├── end-tests.log           # Final test state
│   ├── final-drs.txt           # Final score
│   └── changes-summary.txt     # What changed
├── 20260114/
│   └── ...
```

Naming convention: `{timestamp}-{type}.{ext}`

This structure lets you answer: "What was the state at 10:00 AM on January 13th?" in seconds.

---

## What Evidence to Capture

### Tier 1: Always Capture (Critical)

| Evidence Type | File Format | Why It Matters |
|--------------|-------------|----------------|
| Test results | `.log` | Proves tests passed at time X |
| API responses | `.json` | Proves endpoint returned data Y |
| Build output | `.log` | Proves code compiled without errors |
| Git commit | `.txt` | Links evidence to exact code version |

### Tier 2: Capture When Relevant

| Evidence Type | File Format | When |
|--------------|-------------|------|
| Performance metrics | `.json` | Performance-sensitive work |
| Database snapshots | `.sql` | Data migration work |
| UI screenshots | `.png` | Frontend changes |
| Error logs | `.log` | Debugging sessions |

### Tier 3: Capture For Major Milestones

| Evidence Type | File Format | When |
|--------------|-------------|------|
| Architecture diagram | `.md` | System design changes |
| Benchmark results | `.json` | Optimization work |
| Security scan output | `.log` | Security-related changes |

---

## Evidence Quality Standards

Not all evidence is equal. Apply these standards:

### 1. Timestamped

Every piece of evidence must include when it was captured. Evidence without timestamps is useless for debugging.

```bash
# Good: timestamp in filename
curl -s api.example.com/data > evidence/20260113-1430-response.json

# Bad: no timestamp
curl -s api.example.com/data > evidence/response.json
```

### 2. Reproducible

Can someone else reproduce this evidence given the same inputs? Document the commands used.

```bash
# Good: command is captured
echo "curl -s https://api.example.com/users/123" > evidence/20260113/command-user-fetch.txt
curl -s https://api.example.com/users/123 > evidence/20260113/user-fetch-response.json

# Bad: just the output, no way to reproduce
```

### 3. Complete

Partial evidence is misleading. Capture full context, not cherry-picked successes.

```bash
# Good: all test output
npm test 2>&1 | tee evidence/tests.log  # Includes failures

# Bad: only successful tests
npm test --grep "passing" > evidence/tests.log  # Hides failures
```

### 4. Linked to Code

Evidence must link to the exact code version. Without this link, evidence is circumstantial.

```bash
# Start of evidence capture
echo "Commit: $(git rev-parse HEAD)" > evidence/20260113/session-start.txt
echo "Branch: $(git branch --show-current)" >> evidence/20260113/session-start.txt
echo "Timestamp: $(date -u)" >> evidence/20260113/session-start.txt
```

---

## Using Evidence in AI Sessions

When working with AI, evidence serves three purposes:

### 1. Grounding AI Claims

AI says "the implementation is complete." Evidence says:
- Tests: 14/17 passing (evidence/1430-tests.log)
- API: Returning 500 errors (evidence/1430-response.json)
- Build: 3 TypeScript errors (evidence/1430-build.log)

The evidence contradicts the AI. Trust the evidence.

### 2. Preventing Regression

AI suggests a "small refactor." Before accepting:

1. Capture current evidence
2. Apply the change
3. Capture new evidence
4. Compare

If test count drops or API behavior changes, you have proof to reject the change.

### 3. Debugging AI Mistakes

Something broke. When did it break?

1. Find last green evidence (all tests passing)
2. Find first red evidence (tests failing)
3. Check commits between those timestamps
4. Root cause identified

Without evidence, you're guessing which change broke it.

---

## The Evidence Retention Policy

Evidence has storage costs. Apply this retention policy:

| Evidence Age | Action |
|--------------|--------|
| < 7 days | Keep all evidence |
| 7-30 days | Keep session start/end only |
| > 30 days | Archive to compressed storage |
| > 90 days | Delete unless marked permanent |

Exception: Evidence related to production incidents keeps indefinitely.

---

## Automating Evidence Capture

Manual evidence capture fails. People forget. Automate it:

```bash
#!/bin/bash
# evidence-capture.sh - Run every 30 minutes via cron or git hook

DATE_DIR="evidence/$(date +%Y%m%d)"
TIMESTAMP=$(date +%H%M)
mkdir -p $DATE_DIR

# Core captures
git rev-parse HEAD > $DATE_DIR/${TIMESTAMP}-commit.txt
npm test 2>&1 | tee $DATE_DIR/${TIMESTAMP}-tests.log

# API health (customize endpoints)
curl -s http://localhost:3000/health > $DATE_DIR/${TIMESTAMP}-health.json 2>&1

# Build check
npm run build --if-present 2>&1 | tee $DATE_DIR/${TIMESTAMP}-build.log

# Summary
echo "Evidence captured at $(date)" >> $DATE_DIR/capture-log.txt
echo "  Tests: $(grep -c 'passing' $DATE_DIR/${TIMESTAMP}-tests.log) passing" >> $DATE_DIR/capture-log.txt
```

Add to git hooks or CI to run automatically.

---

## Evidence and the DRS

Evidence feeds directly into the Deployability Rating Score:

| DRS Component | Required Evidence |
|---------------|-------------------|
| Tests Passing (7 pts) | Test log showing all green |
| Integration Evidence (9 pts) | API response JSONs |
| Production Readiness (14 pts) | Build logs, health checks |
| Context Preservation (7 pts) | Session documentation |

No evidence = no points. The DRS forces evidence capture by design.

---

## Common Evidence Mistakes

### Mistake 1: Capturing Only Success

You capture passing tests but not failing ones. When tests start failing, you can't compare.

**Fix:** Capture all output, always. Failures are data.

### Mistake 2: Evidence Without Context

A JSON file with no indication of what it's from.

**Fix:** Include metadata—endpoint, timestamp, commit, purpose.

### Mistake 3: Overwriting Evidence

New capture overwrites the old file. History is lost.

**Fix:** Timestamp in filename. Never overwrite.

### Mistake 4: Evidence in Memory Only

"I saw the tests pass." But no log file.

**Fix:** If it's not written down, it didn't happen.

---

## The Protocol Checklist

Before ending any coding session:

- [ ] Session start evidence captured
- [ ] Evidence captured every 30 minutes
- [ ] All evidence includes timestamps
- [ ] All evidence linked to commit hashes
- [ ] Final DRS calculated with evidence citations
- [ ] Evidence directory organized by date

---

## Try It Today

1. Create an `evidence/` directory in your project
2. Run `mkdir -p evidence/$(date +%Y%m%d)`
3. Capture current test state: `npm test 2>&1 | tee evidence/$(date +%Y%m%d)/start-tests.log`
4. Work for 30 minutes
5. Capture again and compare

The first time you debug using your evidence, you'll never go back to "it was working earlier."

---

## What's Next

Evidence capture is one component of the AI Control Framework. The full framework includes:

- **Contract Freeze Protocol**: Lock interfaces before implementation
- **The 30-Minute Mock Rule**: Prevent false progress
- **Convergence Testing**: Prove code quality mathematically
- **DRS Scoring**: Quantify "done" objectively

Together, these tools transform AI coding from chaotic iteration to controlled engineering.

---

*This article is part of the AI Control Framework series. The framework is open source at [github link]. For questions or contributions, reach out in the comments.*

---

**Tags:** #ai #coding #productivity #testing #devops
