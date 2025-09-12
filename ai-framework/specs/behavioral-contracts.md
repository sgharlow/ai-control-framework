# Behavioral Contract Specification

## Purpose
Validate that module behaviors and data flows remain consistent even when interface signatures are preserved, preventing silent breaking changes in system integration.

## Why This Matters
- **Prevents Silent Behavioral Changes**: Interface unchanged but behavior modified
- **Validates Data Flow Integrity**: Ensures modules communicate correctly
- **Catches Integration Failures**: Problems surface during development, not production
- **Maintains System Reliability**: Behavioral contracts are as important as interface contracts

## The Problem This Solves

### Interface vs. Behavioral Contracts
**Interface Contract**: API signature, data types, method names
**Behavioral Contract**: Response formats, data semantics, business logic, error conditions

### Common Behavioral Violations
```javascript
// INTERFACE UNCHANGED (passes traditional contract check)
function getUser(id) { ... }

// BEHAVIORAL CHANGE (breaks system integration)
// BEFORE: Returns {id, name, email}
// AFTER:  Returns {userId, fullName, emailAddress}
```

## Behavioral Contract Types

### 1. API Response Format Contracts
**What to Validate:**
- JSON structure and field names
- Data types and formats
- Required vs optional fields
- Error response formats

**Example Validation:**
```json
{
  "endpoint": "/api/users/{id}",
  "expectedResponse": {
    "id": "number",
    "name": "string", 
    "email": "string",
    "created": "ISO8601"
  },
  "errorFormats": {
    "404": {"error": "string", "code": "number"}
  }
}
```

### 2. Database Query Result Contracts
**What to Validate:**
- Column names and types
- Row count expectations
- Join result structures
- Aggregation formats

**Example Validation:**
```sql
-- Contract: getUserOrders query
-- Expected columns: order_id, user_id, total, status, created_at
-- Expected types: int, int, decimal, varchar, timestamp
SELECT order_id, user_id, total, status, created_at 
FROM orders WHERE user_id = ?
```

### 3. Cross-Module Data Flow Contracts
**What to Validate:**
- Data passed between modules
- Event payload structures
- Message queue formats
- Shared state consistency

**Example Validation:**
```javascript
// Contract: UserService -> OrderService
// Event: user.updated
// Payload: {userId: number, email: string, status: string}
```

### 4. Business Logic Contracts
**What to Validate:**
- Calculation results
- Validation rules
- State transitions
- Side effects

## Implementation Requirements

### Core Algorithm
1. **Define Behavioral Contracts**
   - Create contract definitions for critical integrations
   - Specify expected data formats and behaviors
   - Include error conditions and edge cases

2. **Generate Contract Tests**
   - Create automated tests that validate behaviors
   - Test actual API responses against contracts
   - Validate database query results
   - Check cross-module data flows

3. **Execute Validation**
   - Run contract tests during development
   - Compare actual vs expected behaviors
   - Report violations with specific details

4. **Handle Violations**
   - Block deployment if behavioral contracts fail
   - Require explicit approval for behavioral changes
   - Document impact of behavioral modifications

## Expected Behavior

### Contract Definition Phase
```
Defining behavioral contracts...
Found API endpoints: 12
Found database queries: 8
Found cross-module events: 5

Creating contract tests:
✓ API response format tests: 12 created
✓ Database result tests: 8 created  
✓ Event payload tests: 5 created
✓ Integration flow tests: 3 created

Behavioral contracts established: 28 total
```

### Validation Phase
```
Running behavioral contract validation...

API Contracts: 12/12 PASSED ✓
Database Contracts: 8/8 PASSED ✓
Event Contracts: 5/5 PASSED ✓
Integration Contracts: 3/3 PASSED ✓

✓ All behavioral contracts validated
System integration integrity maintained
```

### Violation Detection
```
BEHAVIORAL CONTRACT VIOLATION DETECTED!

Contract: getUserProfile API
Expected: {id, name, email, preferences}
Actual:   {userId, fullName, emailAddr, settings}

Impact Analysis:
- Frontend expects 'name' field (now 'fullName')
- Mobile app expects 'email' field (now 'emailAddr')  
- Analytics expects 'preferences' (now 'settings')

ACTION REQUIRED:
1. Revert behavioral change OR
2. File Behavioral Contract Change Request (BCCR)
3. Update all consuming systems
```

## Contract Definition Format

### API Response Contract
```yaml
api_contracts:
  - endpoint: "/api/users/{id}"
    method: "GET"
    success_response:
      status: 200
      schema:
        type: "object"
        required: ["id", "name", "email"]
        properties:
          id: {type: "integer"}
          name: {type: "string"}
          email: {type: "string", format: "email"}
    error_responses:
      404:
        schema:
          type: "object"
          properties:
            error: {type: "string"}
            code: {type: "integer"}
```

### Database Contract
```yaml
database_contracts:
  - query_name: "getUserOrders"
    sql: "SELECT order_id, user_id, total, status FROM orders WHERE user_id = ?"
    expected_columns:
      - {name: "order_id", type: "integer"}
      - {name: "user_id", type: "integer"}
      - {name: "total", type: "decimal"}
      - {name: "status", type: "string"}
    constraints:
      - "total >= 0"
      - "status IN ('pending', 'completed', 'cancelled')"
```

### Event Contract
```yaml
event_contracts:
  - event_name: "user.updated"
    payload_schema:
      type: "object"
      required: ["userId", "email", "timestamp"]
      properties:
        userId: {type: "integer"}
        email: {type: "string", format: "email"}
        timestamp: {type: "string", format: "date-time"}
```

## Integration with Existing Framework

### DRS Integration
Add behavioral contract validation to DRS calculation:

```
Behavioral Contracts (15 points):
- All API contracts pass: +15 points
- Most API contracts pass (>80%): +10 points  
- Some contracts pass (>50%): +5 points
- Contracts failing: 0 points
```

### Evidence Requirements
Behavioral contract validation becomes required evidence:

```
evidence/
├── api-contract-results.json      # API response validations
├── db-contract-results.json       # Database query validations
├── event-contract-results.json    # Event payload validations
└── integration-flow-results.json  # End-to-end flow validations
```

### Time Gate Integration
- **30 minutes**: Basic behavioral contracts defined
- **60 minutes**: Contract tests passing
- **90 minutes**: Integration flows validated
- **120 minutes**: All behavioral evidence captured

## Reference Implementations

### Bash
See: `reference/bash/validate-behavioral-contracts.sh`

### PowerShell
See: `reference/powershell/Validate-BehavioralContracts.ps1`

### Python
See: `reference/python/validate_behavioral_contracts.py`

### Manual Checklist
See: `reference/checklists/behavioral-contracts.md`

## Configuration

### Contract Discovery
```yaml
behavioral_contracts:
  discovery:
    api_endpoints:
      - "src/api/**/*.js"
      - "controllers/**/*.py"
      - "routes/**/*.ts"
    database_queries:
      - "models/**/*.sql"
      - "repositories/**/*.js"
      - "dao/**/*.java"
    events:
      - "events/**/*.json"
      - "schemas/**/*.yaml"
```

### Validation Rules
```yaml
behavioral_contracts:
  validation:
    api_timeout: 30s
    database_timeout: 10s
    required_coverage: 80%
    critical_endpoints:
      - "/api/users/*"
      - "/api/orders/*"
      - "/api/payments/*"
```

## Behavioral Contract Change Request (BCCR)

When behavioral changes are necessary:

### 1. Document the Change
- What behavior is changing
- Why the change is needed
- Impact on consuming systems
- Migration strategy

### 2. Impact Analysis
- Identify all consumers
- Assess breaking change severity
- Plan rollout strategy
- Prepare rollback plan

### 3. Approval Process
- Technical review
- Consumer team approval
- Staged rollout plan
- Monitoring strategy

### 4. Implementation
- Update behavioral contracts
- Implement changes
- Validate new contracts
- Monitor consumer health

## Success Metrics
- Zero unplanned behavioral changes
- All behavioral changes have BCCR documentation
- No production integration failures due to behavioral drift
- Contract test coverage >80% for critical paths

## Common Issues

### Issue: "Too Many Contract Failures"
**Solution**: Start with critical paths, expand coverage gradually

### Issue: "Contracts Too Brittle"
**Solution**: Focus on essential behaviors, allow flexibility in non-critical areas

### Issue: "Performance Impact"
**Solution**: Run contract tests in parallel, cache results, optimize critical paths

## Best Practices

1. **Start Small**: Begin with most critical integrations
2. **Focus on Stability**: Contract the behaviors that must not change
3. **Version Contracts**: Allow evolution while maintaining compatibility
4. **Monitor Continuously**: Run contract tests in CI/CD pipeline
5. **Document Impact**: Always assess consumer impact before changes

---

**Remember**: Behavioral contracts protect the promises your code makes, not just the signatures it exposes.