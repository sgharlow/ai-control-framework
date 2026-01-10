# The Contract Freeze Protocol: Stop AI from Breaking Your Working Code

**Subtitle:** Why immutable interfaces are your best defense against AI-induced regressions

---

## The 4pm Disaster

It happened on a Friday afternoon.

My AI assistant had been "improving" the codebase for 3 hours. Refactoring here. Cleaning up there. Making things "more consistent."

I ran the integration tests.

```
FAILED: 23 tests
ERROR: UserService.authenticate() expects 2 arguments, received 3
ERROR: PaymentProcessor interface mismatch
ERROR: API endpoint /users returns 404
```

Three hours of "improvements" had broken everything that was working.

The AI had done exactly what I asked: make things better. The problem? It changed the contracts—the interfaces that other parts of the system depend on.

One small interface change cascaded through 47 files.

This is **contract drift**, and it's the #1 way AI assistants destroy working codebases.

---

## What Are Contracts?

Contracts are the agreements between parts of your system:

**API Contracts:**
```yaml
# openapi.yaml - This is a contract
/users/{id}:
  get:
    parameters:
      - name: id
        type: integer
    responses:
      200:
        schema:
          type: object
          properties:
            id: integer
            email: string
            name: string
```

**Interface Contracts:**
```typescript
// This is a contract
interface UserRepository {
  findById(id: number): Promise<User>;
  create(user: CreateUserDTO): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
}
```

**Database Contracts:**
```sql
-- This is a contract
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

When you change a contract, everything that depends on it must also change. This is where AI assistants create havoc.

---

## How AI Breaks Contracts

AI assistants have a dangerous habit: they "improve" interfaces without understanding the impact.

### The Innocent Improvement

You: "Add a created_at timestamp to the User response"

AI's thought process:
1. Add `createdAt` to User interface ✓
2. Update UserService to include it ✓
3. Add to API response ✓
4. Done!

What AI missed:
- Mobile app expects exactly 3 fields
- Partner integration parses the JSON strictly
- 14 frontend components destructure User
- 6 tests mock the old interface

**One "simple" addition broke 20+ touchpoints.**

### The Helpful Refactor

You: "Make the auth flow more consistent"

AI's thought process:
1. Rename `authenticate` to `signIn` (more modern!)
2. Change return type from `boolean` to `AuthResult` (more useful!)
3. Add required `rememberMe` parameter (good practice!)
4. Done!

What AI missed:
- `authenticate` is called in 15 places
- Other services expect boolean return
- No callers pass `rememberMe`
- Three microservices use this interface

**One "consistency improvement" broke the entire auth system.**

---

## The Contract Freeze Protocol

The AI Control Framework solves this with **frozen contracts**.

### Principle: Contracts Are Immutable

Once a contract is established, it cannot change without explicit approval through a formal process.

```yaml
# ai-framework/frozen-contracts.yaml
contracts:
  - path: api/openapi.yaml
    hash: sha256:a1b2c3d4e5f6...
    frozen_at: 2026-01-10T14:00:00Z
    owner: backend-team

  - path: src/types/User.ts
    hash: sha256:f6e5d4c3b2a1...
    frozen_at: 2026-01-10T14:00:00Z
    owner: platform-team

  - path: prisma/schema.prisma
    hash: sha256:9a8b7c6d5e4f...
    frozen_at: 2026-01-10T14:00:00Z
    owner: database-team
```

### The Framework Check

Every 10 minutes, the framework verifies contracts haven't changed:

```bash
$ ./ai-framework/check-contracts.sh

Checking frozen contracts...

[✓] api/openapi.yaml - UNCHANGED
[✓] src/types/User.ts - UNCHANGED
[✓] prisma/schema.prisma - UNCHANGED

All 3 contracts verified.
```

When AI attempts to modify a contract:

```bash
$ ./ai-framework/check-contracts.sh

Checking frozen contracts...

[✓] api/openapi.yaml - UNCHANGED
[✗] src/types/User.ts - MODIFIED
    Expected: sha256:f6e5d4c3b2a1...
    Actual:   sha256:1a2b3c4d5e6f...
[✓] prisma/schema.prisma - UNCHANGED

CONTRACT VIOLATION DETECTED!
1 of 3 contracts modified without CCR.

HARD STOP: Revert changes before continuing.
```

The session halts. The AI cannot proceed until the contract is restored.

---

## The Contract Change Request (CCR)

Sometimes contracts genuinely need to change. The CCR process makes this explicit and controlled.

### CCR Format

```markdown
# Contract Change Request

## ID: CCR-2026-0110-001

## Contract Being Changed
- File: src/types/User.ts
- Current Hash: sha256:f6e5d4c3b2a1...
- Owner: platform-team

## Proposed Change
Add `createdAt: Date` field to User interface

## Justification
New compliance requirement requires audit trail of user creation dates.

## Impact Analysis
### Direct Dependents (must update):
- UserService.ts (1 file, ~5 lines)
- user.controller.ts (1 file, ~3 lines)
- UserDTO.ts (1 file, ~1 line)

### Downstream Consumers (must notify):
- Mobile app (v2.3+)
- Partner API integration
- Analytics dashboard

### Breaking Changes:
- API response adds new field (backward compatible)
- No breaking changes for existing consumers

## Migration Plan
1. Add field with optional typing first
2. Backfill existing records with estimated dates
3. Make field required after migration
4. Update API documentation

## Rollback Plan
1. Revert to previous User.ts
2. Remove createdAt from responses
3. No database changes to revert

## Approval Required From
- [ ] platform-team lead
- [ ] api-consumers team
- [ ] database-team

## Status: PENDING
```

### CCR Process

1. **AI identifies need for contract change**
2. **AI creates CCR document (does not modify code)**
3. **Human reviews impact analysis**
4. **Human approves or rejects**
5. **If approved: AI updates contract + hash**
6. **If rejected: AI finds alternative approach**

```bash
$ ./ai-framework/ccr.sh create

Creating Contract Change Request...

Which contract needs to change?
1. api/openapi.yaml
2. src/types/User.ts
3. prisma/schema.prisma

Selection: 2

Describe the proposed change:
> Add createdAt timestamp to User interface

Analyzing impact...

Direct dependents found: 7 files
Downstream consumers found: 3 external systems
Breaking change risk: LOW (additive change)

CCR created: ai-framework/ccrs/CCR-2026-0110-001.md

IMPORTANT: This change requires human approval.
Contract remains frozen until CCR is approved.
```

---

## Implementing Contract Freeze

### Step 1: Identify Your Contracts

Start by listing everything that other code depends on:

```bash
$ ./ai-framework/identify-contracts.sh

Scanning for contracts...

Found 12 potential contracts:

API Definitions:
  api/openapi.yaml (23 endpoints)
  api/graphql.schema (15 types)

Type Definitions:
  src/types/User.ts (1 interface)
  src/types/Order.ts (3 interfaces)
  src/types/Payment.ts (2 interfaces)

Database Schemas:
  prisma/schema.prisma (8 models)

Configuration:
  src/config/permissions.ts (role definitions)

External Contracts:
  integrations/stripe.types.ts (Stripe SDK wrapper)
  integrations/sendgrid.types.ts (Email SDK wrapper)

Review each and mark as frozen? [y/n]
```

### Step 2: Generate Hashes

```bash
$ ./ai-framework/freeze-contracts.sh

Freezing contracts...

[1/12] api/openapi.yaml
  Hash: sha256:a1b2c3d4e5f6789...
  Lines: 847
  Status: FROZEN

[2/12] src/types/User.ts
  Hash: sha256:f6e5d4c3b2a1098...
  Lines: 45
  Status: FROZEN

...

All 12 contracts frozen.
Hashes stored in: ai-framework/frozen-contracts.yaml
```

### Step 3: Add to Framework Checks

```yaml
# ai-framework/config.yaml
checks:
  contracts:
    enabled: true
    frequency: every_10_minutes
    on_violation: hard_stop
    require_ccr: true
```

### Step 4: Communicate to AI

Add to your session context:

```markdown
## FROZEN CONTRACTS - DO NOT MODIFY

These files are frozen. Any change requires a CCR:

1. api/openapi.yaml - API contract
2. src/types/User.ts - User domain model
3. src/types/Order.ts - Order domain model
4. prisma/schema.prisma - Database schema

If you need to change these:
1. STOP implementation
2. Create CCR document
3. Wait for human approval
4. Only then modify the contract
```

---

## What To Freeze (And What Not To)

### Always Freeze

**Public Interfaces:**
- API schemas (OpenAPI, GraphQL)
- SDK type definitions
- Database schemas
- Configuration contracts

**Shared Internal Interfaces:**
- Domain models used by multiple modules
- Service interfaces with multiple implementations
- Event schemas

**External Integrations:**
- Third-party API wrappers
- SDK type definitions

### Don't Freeze

**Implementation Details:**
- Private functions
- Internal helper classes
- Module-local types

**Work in Progress:**
- New features under development
- Experimental APIs
- Draft interfaces

**Generated Code:**
- Auto-generated types
- Build artifacts

---

## Handling Contract Dependencies

Some contracts depend on others. Map these relationships:

```yaml
# ai-framework/contract-dependencies.yaml
contracts:
  api/openapi.yaml:
    depends_on:
      - src/types/User.ts
      - src/types/Order.ts
    consumed_by:
      - mobile-app
      - partner-integration
      - admin-dashboard

  src/types/User.ts:
    depends_on:
      - prisma/schema.prisma
    consumed_by:
      - api/openapi.yaml
      - src/services/UserService.ts
      - src/services/AuthService.ts

  prisma/schema.prisma:
    depends_on: []
    consumed_by:
      - src/types/User.ts
      - src/types/Order.ts
      - migrations/*
```

When a CCR is created, the framework shows the full impact:

```
Impact Analysis for: prisma/schema.prisma

Direct dependents (must update if this changes):
├─ src/types/User.ts
│  └─ api/openapi.yaml
│     ├─ mobile-app
│     ├─ partner-integration
│     └─ admin-dashboard
└─ src/types/Order.ts
   └─ api/openapi.yaml

Total affected: 3 contracts, 3 external consumers
Risk Level: HIGH
```

---

## The DRS Impact

Contract violations significantly impact your Deployability Rating Score:

| Component | Points | Description |
|-----------|--------|-------------|
| Contract Integrity | 7/100 | Frozen contracts unchanged |
| Behavioral Contracts | 7/100 | Contract tests passing |

A single contract violation can drop your DRS by 14 points—often the difference between "deployable" (85+) and "not ready" (70).

```bash
$ ./ai-framework/drs-calculate.sh

Deployability Rating Score: 71/100

Component Breakdown:
- Contract Integrity: 0/7 [VIOLATION: User.ts modified]
- Behavioral Contracts: 0/7 [FAILING: 3 contract tests]
- Security Validation: 16/16
- No Mocks: 7/7
- Tests Passing: 7/7
...

Status: NOT DEPLOYABLE
Reason: Contract violations must be resolved
```

---

## Real Example: Saving a Friday Afternoon

Back to my 4pm disaster. Here's how the Contract Freeze Protocol would have prevented it:

**Without Protocol:**
```
14:00 - "Make the codebase more consistent"
14:30 - AI renames authenticate() to signIn()
14:45 - AI changes return type for "clarity"
15:00 - AI adds required parameter for "best practice"
15:30 - AI updates 5 files to use new interface
16:00 - I run tests: 23 failures
16:30 - Debugging begins
18:00 - Still debugging, Friday ruined
```

**With Protocol:**
```
14:00 - "Make the codebase more consistent"
14:05 - AI attempts to modify AuthService interface
14:05 - HARD STOP: Contract violation detected
14:06 - AI: "I need to change AuthService. Should I create a CCR?"
14:07 - Me: "No, work within the existing interface"
14:08 - AI continues with existing contract
16:00 - Session complete, tests passing, DRS 87
16:05 - Home for dinner
```

The contract freeze caught the problem in 5 minutes instead of 4 hours.

---

## Quick Start

```bash
# Install the framework
git clone https://github.com/sgharlow/ai-control-framework.git
./ai-control-framework/install.sh /path/to/project

# Identify and freeze contracts
./ai-framework/identify-contracts.sh
./ai-framework/freeze-contracts.sh

# Verify contracts (run regularly)
./ai-framework/check-contracts.sh

# Create a CCR when needed
./ai-framework/ccr.sh create
```

---

## The Mindset Shift

Before Contract Freeze:
- "The AI can improve anything"
- "Let's see what happens"
- "We can fix it later"

After Contract Freeze:
- "Contracts are immutable"
- "Changes require explicit approval"
- "We catch drift before it cascades"

This isn't about slowing down the AI. It's about channeling its energy into safe areas while protecting the foundations that everything depends on.

**The best change is one that works within existing contracts.**

---

## The Bottom Line

Contract drift is how AI assistants turn "quick improvements" into multi-hour debugging sessions.

The Contract Freeze Protocol:
- Makes contracts explicitly immutable
- Catches violations before they cascade
- Requires formal approval for changes
- Maps dependencies for impact analysis

**Stop letting AI "improve" your interfaces. Freeze your contracts and keep your codebase stable.**

[Try the AI Control Framework →](https://github.com/sgharlow/ai-control-framework)

---

## Related Articles

1. [Why Most AI Coding Sessions Fail](link-to-article-1) - The problem this solves
2. [The 30-Minute Mock Rule](link-to-article-2) - Another prevention technique
3. [How to Recover a Broken AI Session](link-to-article-3) - When prevention fails

---

*What's your worst contract drift story? Share in the comments—I'll feature the best cautionary tales.*

---

## Tags for Dev.to

```
#ai #programming #architecture #bestpractices
```

## Cover Image Suggestion

Split image:
- Left side: "Before" with tangled arrows between boxes, red X marks
- Right side: "After" with clean boxes, "FROZEN" stamps, green checkmarks
- Center divider: Lock icon
- Caption: "Contract Freeze: Your Defense Against AI Drift"
