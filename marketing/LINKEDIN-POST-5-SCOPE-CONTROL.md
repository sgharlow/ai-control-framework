# LinkedIn Post #5 — Scope Control: The 5-File Rule

**Target Date:** January 18, 2025
**Theme:** Hard limits that prevent AI scope creep
**Goal:** Address common pain point + drive adoption

---

## Post Content

```
"While I'm in here, let me also refactor this..."

Famous last words in AI coding sessions.

I call it "helpful destruction"—when the AI improves things you didn't ask for and breaks things that were working.

My worst case: Asked Claude to add a logout button.

It added the button.
Then "improved" the auth flow.
Then "cleaned up" the user model.
Then "optimized" the database queries.

4 hours later: 47 files changed. Tests failing. Auth completely broken.

The logout button worked great though.

Now I use hard limits:

THE 5-FILE RULE:
→ Maximum 5 files modified per session
→ File 6 triggers automatic hard stop
→ No exceptions without explicit approval

THE 200-LINE RULE:
→ Maximum 200 lines added per session
→ Line 201 triggers automatic hard stop
→ Deletions don't count (cleaning up is free)

"But my feature needs more than 5 files!"

Good. That means it needs multiple sessions.

Each session:
• 5 files max
• Deploy and verify
• Then continue

I'd rather deploy 4 times than debug 47 files.

The framework enforces this automatically:

→ Tracks file count in real-time
→ Warns at file 4
→ Hard stops at file 6
→ Logs every change for rollback

Results after 3 months:

WITHOUT limits:
→ Average files per session: 23
→ "Unexpected changes" rate: 71%
→ Rollback frequency: 34%

WITH limits:
→ Average files per session: 4.2
→ "Unexpected changes" rate: 8%
→ Rollback frequency: 3%

The AI isn't the problem. Unbounded AI is the problem.

Link in comments.

---

What's the most files an AI has "helpfully" modified in one of your sessions?
```

---

## First Comment (post immediately after)

```
Scope control scripts: https://github.com/sgharlow/ai-control-framework

The framework tracks:
• Files modified (with git diff)
• Lines added/removed
• Scope creep warnings
• Hard stop enforcement

Part of the Deployability Rating Score (DRS) system.

If you're new here: DRS is 0-100, 85+ = ship it. Scope violations drop your score.

Previous posts covered:
• Post 1: DRS concept
• Post 2: Contract freezing
• Post 3: Mock timeout
• Post 4: Convergence gates
```

---

## Hashtags

```
#AIcoding #ScopeCreep #DeveloperProductivity #SoftwareEngineering #TechnicalDebt #ClaudeAI #CursorAI #RefactoringGoneWrong
```

---

## Engagement Replies

**For "47 files from a logout button?!":**
> I wish I was exaggerating. The AI saw "related" code and kept "improving." Each improvement led to another. It was genuinely trying to help. That's what makes it dangerous.

**For "5 files seems really restrictive":**
> It's deliberately restrictive. You can always do another session. You can't un-break 47 files. The constraint forces focus: what's the MINIMUM change to ship this feature?

**For "What about large refactors?":**
> Break them into 5-file chunks. Refactor module A, deploy, verify. Refactor module B, deploy, verify. Slower? Yes. Safer? Absolutely. And honestly, faster overall because you catch issues early.

**For "How does the AI know to stop?":**
> The framework updates templates/code.md with current file count. The AI reads this and sees "4/5 files used, 1 remaining." When it hits 5, the hard stop instruction triggers. The AI literally can't continue without human approval.

**For "But sometimes you NEED to touch more files":**
> Then you document why and get explicit approval. The rule isn't "never exceed 5"—it's "never exceed 5 without thinking about it." The friction is intentional.

---

## Visual (optional)

```
┌─────────────────────────────────────┐
│  SCOPE CONTROL STATUS               │
│  ════════════════════════════════   │
│                                     │
│  Files Modified: 4/5  ⚠️ WARNING    │
│                                     │
│  ├── src/auth/logout.ts      (+23)  │
│  ├── src/components/Nav.tsx  (+15)  │
│  ├── src/hooks/useAuth.ts    (+8)   │
│  └── tests/auth.test.ts      (+31)  │
│                                     │
│  Lines Added: 77/200                │
│  Lines Removed: 12 (free)           │
│                                     │
│  ⚠️ 1 FILE REMAINING                │
│  Next file triggers HARD STOP       │
│                                     │
└─────────────────────────────────────┘
```

---

## Timing Strategy

- **Post:** Jan 18, 2025 (Saturday) between 9-11am EST
- **Why:** Weekend readers often engage more deeply with methodology content
- **Connection:** References all previous posts, establishes framework narrative

---

## Series Summary Reference

By Post 5, readers have seen:
1. DRS concept (the score)
2. Contract freezing (interface stability)
3. Mock timeout (real services fast)
4. Convergence gates (time-boxed milestones)
5. Scope control (bounded changes)

This covers the core framework philosophy. Future posts can go deeper on individual components or share case studies.

---

*Draft created December 24, 2025*
