# Example: Building a REST API with AI Control Framework

This walkthrough demonstrates building a user management API using the framework, showing exactly how it prevents common AI coding failures.

## Project Setup (5 minutes)

### Human Developer Actions:
```bash
# Install framework
./install.sh ~/projects/user-api
cd ~/projects/user-api
```

### Claude Code Session 1: Initialize
**Human Prompt:**
```
Initialize the AI Development Control Framework for this project.

Project: User Management REST API
- Create, read, update, delete users
- PostgreSQL database
- Express.js API
- JWT authentication
- OpenAPI specification
- Deploy to AWS Lambda
```

**Claude's Response (Following Framework):**
```
Reading framework templates...
Populating with project-specific values...

✓ Created api/openapi.yaml (contract)
✓ Created db/schema.sql (contract)  
✓ Set pattern: PATTERN-001 (Real Service First)
✓ Initialized DRS: 15/100

Next: Connect to real PostgreSQL instance
```

**What the Framework Prevented:**
❌ Starting with mock database (enforced by PATTERN-001)
❌ Skipping contract definition (required by orchestration.md)

## Session 2: Real Database Connection (30 minutes)

### Human: Start Session
```
I'm using the AI Development Control Framework.
Read CLAUDE.md and run ./run-check.sh continue
```

### Claude: Loads Framework State
```
./run-check.sh continue
✓ Contracts locked
✓ No scope violations
✓ Session safe to continue

Current state:
- DRS: 15/100
- Pattern: PATTERN-001
- Goal: Connect real PostgreSQL
```

### Human: Work Request
```
Connect to my PostgreSQL database at postgres://localhost:5432/userdb
Create the tables from our schema
```

### Claude: Implementation
```javascript
// db/connection.js (File 1/5, 45 lines)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/userdb'
});

// Test real connection
async function testConnection() {
  const client = await pool.connect();
  const result = await client.query('SELECT NOW()');
  client.release();
  return result.rows[0];
}

// Create tables from schema
async function initializeTables() {
  const schema = fs.readFileSync('./db/schema.sql', 'utf8');
  await pool.query(schema);
}
```

### Framework Automatic Checks (Every 10 min):
```bash
./check-contracts.sh
✓ Contracts unchanged

./detect-mocks.sh  
✓ No mocks detected

./capture-evidence.sh db postgres://localhost:5432/userdb
✓ Evidence captured: 2024-01-15_103000_db_state.sql
```

### Session 2 Result:
```
./drs-calculate.sh
DRS: 35/100 (+20)
✓ Real database connected
✓ Schema deployed
✓ Evidence captured
```

**What the Framework Prevented:**
❌ Using mock database (detect-mocks.sh would fail)
❌ Changing schema without approval (check-contracts.sh would fail)
❌ Working without evidence (30-min evidence requirement)

## Session 3: API Implementation (45 minutes)

### The 25-Minute Mock Incident

**Human:** "Create user CRUD endpoints"

**Claude Implementation:**
```javascript
// Initial implementation with mock (for testing shape)
// api/users.js (File 2/5, 89 lines)

// Temporary mock for shape validation
const mockUsers = [
  { id: 1, name: 'Test User', email: 'test@example.com' }
];

router.get('/users', (req, res) => {
  res.json(mockUsers); // MOCK - will replace
});
```

### Framework Intervention at 30 Minutes:
```bash
./detect-mocks.sh
✗ VIOLATION: Mocks detected after 30-minute mark!
Files with mocks:
- api/users.js: line 5 (mockUsers)

Required: Replace with real database calls
Use PATTERN-001: Real Service First
```

### Claude Automatic Recovery:
```javascript
// Replaced mock with real database
// api/users.js (89 → 112 lines)

const db = require('../db/connection');

router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows); // REAL DATA
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Evidence Captured:
```bash
./capture-evidence.sh api http://localhost:3000/users GET
✓ Response: 200 OK
✓ Real data returned
✓ Evidence: evidence/2024-01-15_104500_api_response.json
```

**What the Framework Prevented:**
❌ Shipping mock data (30-minute timeout)
❌ Missing error handling (DRS calculation requires it)
❌ No tests (DRS won't reach 85 without tests)

## Session 4: Scope Creep Prevention (20 minutes)

### Human Makes Expansive Request:
```
Also add:
- Email notifications
- User profiles  
- Admin dashboard
- Audit logging
- Rate limiting
```

### Claude with Framework:
```
./check-scope.sh
Current usage: 3/5 files, 156/200 lines

Analyzing request impact:
- Email notifications: +3 files, +200 lines
- User profiles: +2 files, +150 lines
- Admin dashboard: +5 files, +400 lines

✗ Would exceed scope limits

Following PATTERN-003 (Scope Sentinel):
Can add ONE feature within limits.

Recommendation: Complete current user CRUD first
DRS must reach 85 before new features
```

### What Actually Gets Built:
```javascript
// Added only rate limiting (fits in scope)
// middleware/rateLimit.js (File 4/5, 28 lines)

const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Applied to routes (File 3/5 modified, +3 lines)
router.use('/users', rateLimitMiddleware);
```

**What the Framework Prevented:**
❌ 500+ line scope explosion
❌ 8+ file changes
❌ Feature creep before core is ready

## Session 5: Achieving Deploy-Ready (30 minutes)

### Current State:
```bash
./drs-calculate.sh
DRS: 68/100
✓ Contracts unchanged (20/20)
✓ No mocks (20/20)
⚠ Tests partial (8/15)
✓ Error handling (10/10)
✓ Within scope (10/10)
```

### Human: "Make it deployable"

### Claude Following Framework:
```javascript
// tests/users.test.js (File 5/5, 44 lines)
describe('User API', () => {
  it('connects to real database', async () => {
    const conn = await testConnection();
    expect(conn).toBeDefined();
  });

  it('creates real user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Real User', email: 'real@example.com' });
    expect(res.status).toBe(201);
    
    // Verify in database
    const dbUser = await db.query('SELECT * FROM users WHERE email = $1', ['real@example.com']);
    expect(dbUser.rows[0]).toBeDefined();
  });
});
```

### Final Checks:
```bash
./drs-calculate.sh
═══════════════════════════════════════
DEPLOYABILITY SCORE: 85/100
═══════════════════════════════════════
✓ Contracts unchanged (20/20)
✓ No mocks detected (20/20)
✓ All tests passing (15/15)
✓ Error handling complete (10/10)
✓ Within scope (10/10)
✓ Recent API evidence (10/15)

★ READY TO DEPLOY ★
```

## Deployment (10 minutes)

### Human: "Deploy to production"

### Claude Executes Framework Prompt G:
```bash
# Pre-deployment verification
./scripts/deploy-check.sh --verbose
✓ DRS ≥ 85
✓ Contract hashes unchanged
✓ Zero mocks in production path
✓ All tests passing

# Create deployment package
zip -r user-api.zip . \
  --exclude=node_modules/* \
  --exclude=evidence/* \
  --exclude=.git/*

# Deploy to AWS Lambda
aws lambda update-function-code \
  --function-name user-api \
  --zip-file fileb://user-api.zip

# Smoke test production
curl https://api.example.com/users
✓ Production endpoint responding
```

## Results Summary

### What We Built:
- ✅ User CRUD API
- ✅ Real PostgreSQL integration
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Full test coverage
- ✅ Production deployed

### What the Framework Prevented:
- ❌ 3 days of mock data cleanup
- ❌ 500+ lines of scope creep
- ❌ Contract-breaking changes
- ❌ Untested code deployment
- ❌ "Works on my machine" syndrome

### Metrics:
- **Time to Deploy:** 2.5 hours (5 sessions)
- **Rework Required:** 0 lines
- **Breaking Changes:** 0
- **Files Changed:** 5 (at limit)
- **Lines Added:** 184/200
- **Final DRS:** 85/100

## Key Learnings

1. **Mock Timeout Works:** The 30-minute limit forced real implementation early
2. **Scope Control Matters:** Prevented 3x scope explosion
3. **DRS Provides Clarity:** Objective "ready to deploy" metric
4. **Evidence Prevents Lies:** Real API calls captured and verified
5. **Contracts Prevent Drift:** Zero breaking changes throughout

## Try It Yourself

1. Install the framework:
```bash
git clone https://github.com/ai-control-framework/framework.git
./framework/install.sh your-project
```

2. Start with this prompt:
```
Initialize the AI Development Control Framework.
My project: [describe your project]
```

3. Watch as the framework keeps your AI coding disciplined and convergent!

---

*This example is based on real usage. Times and metrics are typical results.*