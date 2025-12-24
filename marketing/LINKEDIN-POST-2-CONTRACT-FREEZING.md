# LinkedIn Post #2 — Contract Freezing

**Target Date:** January 6, 2025
**Theme:** Why interfaces break and how to stop it
**Goal:** Demonstrate a specific technique + drive repo visits

---

## Post Content

```
"It was working yesterday."

The most frustrating sentence in AI-assisted coding.

Here's what happens:

1. You build a feature with Claude/Cursor
2. It works perfectly
3. Next session, you ask for "a small fix"
4. The AI silently changes an interface
5. Everything that depended on it breaks

I call this "architecture drift." It's the #2 cause of non-deployable AI code.

The fix is embarrassingly simple: Contract Freezing.

Here's how it works:

STEP 1: Define your contracts
→ API schemas (OpenAPI/Swagger)
→ Database schemas
→ Component interfaces

STEP 2: Hash them
→ SHA256 hash of each contract file
→ Store in .contracts.lock

STEP 3: Check before every session
→ Script compares current hashes to locked hashes
→ Any mismatch = STOP

If you need to change a contract, you file a "Contract Change Request" (CCR):
→ Document why the change is needed
→ Update the hash
→ Reset your Deployability Score

Sounds bureaucratic? It takes 30 seconds.

And it eliminated 93% of my "it was working yesterday" moments.

The script is 47 lines of bash. Open source.

---

Before contract freezing:
→ 4.2 breaking changes per feature

After:
→ 0.3 breaking changes per feature

That's a 14x improvement.

Link in comments.

What's the worst "it was working yesterday" story you have?
```

---

## First Comment (post immediately after)

```
The contract checking script: https://github.com/sgharlow/ai-control-framework/blob/main/ai-framework/reference/bash/check-contracts.sh

Full framework: https://github.com/sgharlow/ai-control-framework

The key insight: AI assistants optimize for "does this work NOW?" not "will this still work tomorrow?" Contract freezing adds that constraint.
```

---

## Hashtags

```
#AIcoding #SoftwareArchitecture #DeveloperTools #APIdesign #ClaudeAI #OpenSource #TechDebt
```

---

## Engagement Replies

**For "We use TypeScript/types for this":**
> Types help but they don't prevent drift—they just catch it at compile time. Contract freezing catches it BEFORE the AI writes incompatible code. Different layer of protection.

**For "This seems like overkill":**
> Felt that way to me too, until I tracked my rework hours. 4.2 breaking changes per feature × 2 hours each = 8+ hours of preventable rework. The 30-second hash check pays for itself fast.

**For "How do you handle legitimate changes?":**
> CCR (Contract Change Request). Document why, update the hash, reset DRS. Takes 2 minutes. The friction is intentional—it forces you to ask "do I really need to change this interface?"

---

*Draft created December 24, 2025*
