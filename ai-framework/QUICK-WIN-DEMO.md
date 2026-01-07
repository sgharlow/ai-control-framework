# 5-Minute Quick Win Demo

**See the AI Control Framework in action in under 5 minutes.**

This demo shows how the framework catches common AI coding mistakes that waste hours of developer time.

---

## The Problem (30 seconds)

AI coding assistants often produce code that **looks great but doesn't deploy**:

```
Developer: "Add user authentication to my API"
AI: "Done! I've created a complete auth system with JWT tokens,
     password hashing, and session management."

Reality: The AI created mock services, hardcoded secrets,
         and the code won't actually run in production.
```

**Result:** Hours wasted on code that can't ship.

---

## The Solution: DRS Score (1 minute)

The framework calculates a **Deployability Readiness Score (DRS)** from 0-100:

| Score | Status | Action |
|-------|--------|--------|
| 85-100 | Ship it | Deploy to production |
| 70-84 | Almost there | Minor fixes needed |
| 50-69 | Significant gaps | Major work required |
| 0-49 | Start over | Too many issues |

**Deployment requires DRS >= 85.**

---

## Live Demo: Catch a Fake Solution (3 minutes)

### Step 1: Clone the Example

```bash
git clone https://github.com/sgharlow/ai-control-framework.git
cd ai-control-framework/examples/user-api
```

### Step 2: Run the DRS Calculator

**On Windows (PowerShell):**
```powershell
..\..\ai-framework\reference\powershell\DRS-Calculate.ps1
```

**On Mac/Linux (Bash):**
```bash
../../ai-framework/reference/bash/drs-calculate.sh
```

### Step 3: See What It Catches

The demo project contains typical AI-generated code issues:

```
===========================================
 DRS CALCULATION RESULTS
===========================================

Component                    Score    Max
-----------------------------------------
Contract Integrity             7       8    (hash check failed)
Behavioral Contracts           6       8    (mock detected)
Security Validation            8      18    (hardcoded secret)
Data Integrity                 8      10    (no transaction)
No Mocks                       0       8    (mock service found)
Tests Passing                  7       7
Integration Evidence           3      10    (no real API test)
Architecture Stability         7       7
Production Readiness           5      15    (no env validation)
Context Preservation           8       8
Error Handling                 2       4    (missing recovery)
Scope Compliance               4       4
Documentation                  3       3
-----------------------------------------
TOTAL DRS SCORE:              68     100

STATUS: NOT DEPLOYABLE (DRS < 85)
```

### Step 4: See the Specific Problems

```
===========================================
 ISSUES DETECTED
===========================================

CRITICAL (blocks deployment):
  - [MOCK] Found mock service in auth/service.ts:23
  - [SECURITY] Hardcoded API key in config/secrets.ts:5

HIGH (must fix):
  - [CONTRACT] Hash mismatch in user.interface.ts
  - [EVIDENCE] No integration test evidence found
  - [PRODUCTION] Missing environment variable validation

MEDIUM (should fix):
  - [ERROR] No error recovery in auth/handler.ts
  - [DATA] Transaction not used in user/create.ts
```

---

## Before vs After (30 seconds)

### Without Framework
```
AI: "I've implemented the feature!"
Developer: "Great!"
[3 hours later, deploy fails]
Developer: "Why doesn't this work in production?!"
```

### With Framework
```
AI: "I've implemented the feature!"
Framework: "DRS: 52/100 - Not deployable"
Framework: "Issues: mock service, hardcoded secret, no integration test"
Developer: "Fix those before we proceed."
[30 minutes later, DRS: 87/100]
Developer: "Now ship it."
```

**Time saved: 2.5 hours per feature.**

---

## Next Steps

### Want to try it on your project?

1. **Copy the framework:**
   ```bash
   cp -r ai-framework/ your-project/
   ```

2. **Add to your CLAUDE.md:**
   ```markdown
   Read ai-framework/templates/orchestration.md every 10 minutes.
   DRS must be >= 85 before deployment.
   ```

3. **Run checks regularly:**
   ```bash
   ./ai-framework/reference/bash/drs-calculate.sh
   ```

### Want the full experience?

Install the MCP Server for IDE integration:
```bash
cd ai-framework-mcp-server
npm install
npm run build
```

Then use commands like:
- `mcp execute assess` - Full project analysis
- `mcp execute verify` - Check all 13 components
- `mcp execute deploy_decide` - Check deployment readiness

---

## Key Takeaways

1. **AI code often looks done but isn't deployable**
2. **The DRS score objectively measures deployability**
3. **Catching issues early saves hours of debugging**
4. **The framework enforces real progress, not activity**

---

**Ready for more?** Read the full [README](./README.md) or try the [Example Walkthrough](./docs/EXAMPLE-WALKTHROUGH.md).

---

*AI Control Framework v2.0 - Stop shipping code that doesn't work.*
