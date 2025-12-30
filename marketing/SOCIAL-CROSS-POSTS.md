# Social Media Cross-Posts for Show HN Launch

**Timing:** Post at T+4 hours after Show HN goes live
**Replace [link] with actual HN discussion URL**

---

## Twitter/X Options

### Option 1: Single Tweet (280 chars)

```
Just hit Hacker News:

I built a framework that stops AI coding assistants from shipping fake code.

• Contract freezing (SHA256 hashes)
• 30-min mock timeout
• Deployability score (0-100)

Rework rate: 67% → 12%

HN: [link]
GitHub: github.com/sgharlow/ai-control-framework
```

### Option 2: Thread (higher engagement)

**Tweet 1/5:**
```
🧵 1/5
Just posted to Hacker News: I built a framework that forces AI coding assistants to ship real code.

After 50+ sessions with Claude Code and Cursor, I found 68% of "working" code broke on deploy.

Here's how I fixed it 👇
```

**Tweet 2/5:**
```
2/5
Problem #1: Mock data never gets replaced

Solution: 30-minute mock timeout

The framework detects mocks and starts warning you. After 30 mins, it's a hard stop.

Result: No more "I'll add real data later" that never happens.
```

**Tweet 3/5:**
```
3/5
Problem #2: Interfaces change mid-session, breaking working code

Solution: Contract freezing

APIs and DB schemas get SHA256-hashed. Any change requires explicit approval.

Result: Breaking changes dropped from 4.2/feature to 0.3
```

**Tweet 4/5:**
```
4/5
Problem #3: No way to know if code is actually ready

Solution: Deployability Rating Score (DRS)

13 components, 0-100 scale. When DRS ≥ 85, ship it.

No more "is it ready?" → "maybe?"
Now it's "DRS 87. Ship it."
```

**Tweet 5/5:**
```
5/5
Results after using this for a month:

• Time to deploy: 3-5 days → 4-6 hours
• Rework rate: 67% → 12%
• 136 tests, 100% passing

MIT licensed. Works with Claude, Cursor, Copilot.

HN discussion: [link]
GitHub: github.com/sgharlow/ai-control-framework
```

---

## LinkedIn Post

### Main Post:

```
I've been using AI coding assistants (Claude Code, Cursor) heavily for 18 months.

After tracking 50+ sessions, I discovered a painful truth:

68% of my "working" code broke on deploy.

The patterns were always the same:
→ Beautiful mock data that never got replaced
→ Interfaces changing mid-session, breaking working features
→ "Almost done" sessions that needed 3 more days of rework
→ No objective way to know if code was actually ready

So I built something to fix it.

The AI Control Framework enforces discipline through external scripts—not just prompts the AI can ignore:

𝟭. 𝗖𝗼𝗻𝘁𝗿𝗮𝗰𝘁 𝗙𝗿𝗲𝗲𝘇𝗶𝗻𝗴
Interfaces get SHA256-hashed. Any change requires explicit approval. Stops architecture drift.

𝟮. 𝟯𝟬-𝗠𝗶𝗻𝘂𝘁𝗲 𝗠𝗼𝗰𝗸 𝗧𝗶𝗺𝗲𝗼𝘂𝘁
Mocks allowed for exploration, then the script forces real service connections.

𝟯. 𝗗𝗲𝗽𝗹𝗼𝘆𝗮𝗯𝗶𝗹𝗶𝘁𝘆 𝗦𝗰𝗼𝗿𝗲 (𝟬-𝟭𝟬𝟬)
13 components measuring real readiness. When DRS ≥ 85, ship it.

My results:
• Time to deploy: 3-5 days → 4-6 hours
• Rework rate: 67% → 12%
• Breaking changes: 4.2/feature → 0.3/feature

Currently on Hacker News. Would love feedback from others who've struggled with AI coding reliability.

Link in comments 👇

#AItools #SoftwareEngineering #DeveloperProductivity #ClaudeAI #Cursor #GitHub #OpenSource
```

### LinkedIn Comment (post immediately after main post):

```
🔗 Links:

Hacker News discussion: [HN link]

GitHub repo: https://github.com/sgharlow/ai-control-framework

MIT licensed, works with any AI assistant that can read files.
```

---

## Reddit Posts (T+8 hours)

### r/ClaudeAI

**Title:** `I built a framework to stop Claude Code from shipping non-deployable code`

**Body:**
```
After 18 months of heavy Claude Code usage, I tracked why 68% of my sessions produced code that broke on deploy.

Built a framework to fix the 3 biggest issues:

1. **Mock data never replaced** → 30-minute mock timeout forces real connections
2. **Interfaces changing mid-session** → Contract freezing with SHA256 hashes
3. **No deploy confidence** → Deployability Score (0-100) tells you when it's ready

Results: Rework rate dropped from 67% to 12%.

Just launched on Hacker News: [link]

GitHub: https://github.com/sgharlow/ai-control-framework

Works with Claude Code, Cursor, Copilot - anything that can read project files. MIT licensed.

Would love feedback from other Claude Code users!
```

### r/cursor

**Title:** `Framework for forcing Cursor to ship deployable code (not just beautiful demos)`

**Body:**
```
Been using Cursor heavily and kept hitting the same problems - code looks done but breaks on deploy.

Built a framework that enforces discipline through external scripts:

- **Contract freezing**: SHA256 hashes on interfaces, any change needs approval
- **30-min mock timeout**: Mocks allowed for exploration, then must connect real services
- **DRS score (0-100)**: Objective deployability metric. 85+ = ship it.

My deploy time went from 3-5 days to 4-6 hours.

Currently on HN: [link]
GitHub: https://github.com/sgharlow/ai-control-framework

Works with any AI assistant. Curious if others have tried similar approaches.
```

---

*Created: December 29, 2025*
