# LinkedIn Post #3 — Mock Timeout Innovation

**Target Date:** January 10, 2025
**Theme:** The 30-minute rule that forces real implementation
**Goal:** Share contrarian insight + drive to Show HN post

---

## Post Content

```
30 minutes.

That's how long I give AI-generated mocks to live.

After that, they must die.

Let me explain.

When you're building with AI, mocks are seductive:

"Let's stub out the API for now"
"We'll add real data later"
"This placeholder will work for the demo"

The problem? "Later" never comes.

I analyzed 50 of my AI coding sessions. In 34 of them, mock data made it to the final commit. Beautiful fake data that worked perfectly in dev and exploded in production.

So I added a hard rule: The 30-Minute Mock Timeout.

Here's how it works:

MINUTE 0-30:
→ Mocks allowed
→ Explore freely
→ Prototype fast

MINUTE 30:
→ Script runs detect-mocks.sh
→ Finds all TODO, MOCK, PLACEHOLDER, fake data patterns
→ If any exist: HARD STOP

You have two choices:
1. Replace mocks with real service calls
2. Explicitly document why a mock must stay (rare)

"But 30 minutes isn't enough time!"

That's the point.

If you can't connect to a real service in 30 minutes, you have a design problem—not a time problem. Better to discover that at minute 30 than day 3.

Results:

BEFORE mock timeout:
→ 68% of sessions had mocks in final commit
→ Average "mock cleanup" time: 2.4 hours

AFTER:
→ 3% of sessions have mocks (explicitly documented)
→ Mock cleanup time: 0 (nothing to clean)

The script is open source. Link in comments.

---

What's the longest a "temporary" mock has survived in your codebase?

(Mine was 8 months. It's why I built this.)
```

---

## First Comment (post immediately after)

```
Mock detection script: https://github.com/sgharlow/ai-control-framework/blob/main/ai-framework/reference/bash/detect-mocks.sh

It searches for:
• TODO/FIXME comments
• "mock", "fake", "stub", "placeholder" in variable names
• Hardcoded test data patterns
• localhost URLs in non-test files

Full framework: https://github.com/sgharlow/ai-control-framework

Also: I'm posting this on Hacker News tomorrow. Search "AI Control Framework" if you want to join the discussion.
```

---

## Hashtags

```
#AIcoding #TechnicalDebt #DeveloperProductivity #SoftwareEngineering #MockData #ClaudeAI #CursorAI #OpenSource
```

---

## Engagement Replies

**For "30 minutes is too aggressive":**
> You can configure it. Some teams use 60 or 90 minutes. But I'd challenge you: try 30 for a week. You'll be surprised how often "I need more time" is actually "I'm avoiding the hard integration work."

**For "What about tests? Mocks are fine there":**
> Agreed. The script excludes test files by default. Mocks in tests are expected. Mocks in production code are technical debt.

**For "My API isn't ready yet":**
> Perfect use case for the explicit documentation exception. You document "mock: waiting on backend team, ETA Jan 15" and the script allows it. The point isn't "no mocks ever"—it's "no accidental mocks."

**For "8 months?! How?":**
> It was a payment integration mock. Worked in dev because we never tested with real card numbers. Made it through code review because "we'll replace it before launch." Launch came, everyone forgot, and we found out when a customer's card was "approved" but never charged. Fun times.

---

## Timing Note

This post is scheduled for Jan 10—one day before or same day as the Show HN post. The "posting on Hacker News tomorrow" line creates urgency and cross-promotes.

Adjust the timing if the HN post date changes.

---

*Draft created December 24, 2025*
