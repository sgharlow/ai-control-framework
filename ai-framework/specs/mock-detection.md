# Mock Detection Specification

## Purpose
Enforce time-boxed use of mock data to ensure real service integration happens early in development.

## Why This Matters
- **Prevents "Mock Theater"**: Beautiful demos with fake data that never work in production
- **Forces Real Integration**: Can't hide behind mocks indefinitely  
- **Reveals Issues Early**: Integration problems surface during development, not deployment
- **Ensures Production Readiness**: Code that passes is actually deployable

## Mock Detection Rules

### 30-Minute Grace Period
- Mocks are ALLOWED for first 30 minutes of any session
- Enables rapid prototyping and exploration
- Lets you understand the problem space

### After 30 Minutes
- Mocks MUST be replaced with real services
- Session is BLOCKED if mocks remain
- Must connect to actual databases, APIs, services

## What Constitutes a Mock

### Obvious Mocks
- Variables named `mock`, `fake`, `stub`, `dummy`, `test`, `sample`, `example`
- Hardcoded data arrays in code
- Commented-out real service calls
- Test data files being imported
- In-memory databases (unless that's production config)

### Subtle Mocks
- Hardcoded JSON responses
- Static return values for dynamic operations
- Simplified logic that doesn't match production
- Disabled authentication/authorization
- Bypassed validation

### NOT Mocks (Acceptable)
- Localhost services that match production
- Docker containers with real services
- Test databases with same schema as production
- Staging/dev environment APIs
- Proper service stubs with realistic behavior

## Implementation Requirements

### Detection Algorithm
1. **Scan Code Files**
   - Search for mock patterns
   - Check for hardcoded data
   - Look for bypassed service calls

2. **Check Session Duration**
   - Read session start time
   - Calculate elapsed minutes
   - Determine if in grace period

3. **Apply Rules**
   - If < 30 minutes: Warning only
   - If >= 30 minutes: Violation
   - If no session: Assume violation

4. **Report Results**
   - List all detected mocks
   - Show time remaining in grace period
   - Provide clear action items

## Expected Behavior

### Within Grace Period
```
Mock detection check...
Session time: 15 minutes

Mocks detected (2):
  - src/api/users.js: mockUsers array
  - src/db/connection.js: Using mock database

⚠ WARNING: Mocks allowed for 15 more minutes
Plan to replace with real services soon
```

### After Grace Period
```
Mock detection check...
Session time: 45 minutes

VIOLATION: Mocks detected after 30-minute limit!

Found mocks:
  - src/api/users.js: mockUsers array
  - src/db/connection.js: Using mock database

ACTION REQUIRED:
1. Replace mocks with real service calls
2. Or end session and start fresh (resets timer)
```

### Clean Check
```
Mock detection check...
✓ No mocks detected
Using real services - good job!
```

## Mock Patterns to Detect

### JavaScript/TypeScript
```javascript
// These should be detected:
const mockUsers = [{id: 1, name: "Test"}];
const fakeData = generateFakeData();
// return mockResponse;  // Commented real call
if (process.env.USE_MOCK) { }
```

### Python
```python
# These should be detected:
mock_data = [{"id": 1, "name": "Test"}]
FAKE_USERS = load_fake_users()
# response = api.call()  # TODO: uncomment
if settings.USE_MOCK:
```

### Java
```java
// These should be detected:
List<User> mockUsers = Arrays.asList(...);
private static final FAKE_DATA = ...;
// return service.call(); // FIXME
if (config.useMock()) { }
```

## Session Time Tracking

### Session Start
- Created when session initializes
- Stored as timestamp file
- Reset on session end

### Time Calculation
```
current_time - session_start_time = elapsed_minutes
if elapsed_minutes >= 30: mocks_forbidden
```

### Session Types
- ASSESSMENT: Read-only, mocks irrelevant
- DEVELOPMENT: Standard 30-minute rule
- DEPLOYMENT: Zero tolerance for mocks

## Reference Implementations

### Bash
See: `reference/bash/detect-mocks.sh`

### PowerShell
See: `reference/powershell/Detect-Mocks.ps1`

### Python
See: `reference/python/detect_mocks.py`

### Manual Checklist
See: `reference/checklists/mock-detection.md`

## Configuration

### Patterns to Detect
```yaml
mocks:
  patterns:
    - "mock"
    - "fake" 
    - "stub"
    - "dummy"
    - "test[A-Z]"  # testData, testUser
    - "sample"
    - "example"
    - "TODO.*uncomment"
    - "FIXME.*real"
  files:
    - "**/mocks/**"
    - "**/fakes/**"
    - "**/__mocks__/**"
  timeout_minutes: 30
```

### Exceptions
```yaml
mocks:
  ignore:
    - "**/test/**"      # Test files
    - "**/*.test.js"    # Test files
    - "**/*.spec.ts"    # Test files
    - "**/migrations/**" # Database migrations
```

## Replacing Mocks

### Step 1: Identify the Mock
```javascript
// BEFORE: Mock
const users = [
  {id: 1, name: "Alice"},
  {id: 2, name: "Bob"}
];
```

### Step 2: Connect Real Service
```javascript
// AFTER: Real service
const users = await db.query('SELECT * FROM users');
```

### Step 3: Handle Real-World Issues
```javascript
// AFTER: With error handling
try {
  const users = await db.query('SELECT * FROM users');
} catch (error) {
  logger.error('Database connection failed:', error);
  throw new ServiceUnavailableError();
}
```

## Common Issues

### Issue: "I Need More Time to Explore"
**Solution**: End session, start new one, get another 30 minutes

### Issue: "Real Service Isn't Available"
**Solution**: Use Docker, local services, or staging environment

### Issue: "Real Data Is Too Complex"
**Solution**: Create minimal test data in real service

### Issue: "But It's Just a Prototype"
**Solution**: Prototypes with real services become products faster

## Success Metrics
- Zero mocks in committed code
- Average mock replacement time < 20 minutes
- No production failures due to mock/real differences

---

**Remember**: The 30-minute limit is a feature, not a bug. It forces you to build real, deployable code from the start.