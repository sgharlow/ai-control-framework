# Integration Evidence Specification

## Purpose
Require comprehensive proof that system components work together correctly in realistic scenarios, preventing integration failures that only surface in production.

## Why This Matters
- **Validates Real-World Usage**: Components work individually but fail together
- **Catches Integration Bugs Early**: Problems surface during development, not deployment
- **Ensures Data Consistency**: Information flows correctly between modules
- **Proves User Workflows**: End-to-end scenarios actually work

## The Problem This Solves

### Unit vs Integration Testing Gap
```javascript
// UNIT TESTS PASS ✓
test('UserService.getUser returns user', () => {
  expect(userService.getUser(1)).toEqual({id: 1, name: 'John'});
});

test('OrderService.createOrder creates order', () => {
  expect(orderService.createOrder(order)).toEqual({id: 123, status: 'created'});
});

// INTEGRATION FAILS ✗
// UserService returns {id, name, email}
// OrderService expects {userId, customerName, customerEmail}
// Data format mismatch causes runtime failure
```

## Integration Evidence Types

### 1. End-to-End User Workflow Evidence
**What to Capture:**
- Complete user journeys from start to finish
- Real data flowing through all system layers
- Actual UI interactions with backend services
- Cross-module data transformations

**Example Workflow:**
```
User Registration → Email Verification → Profile Setup → First Purchase
├─ Frontend validates input
├─ API creates user record  
├─ Email service sends verification
├─ Database stores user data
├─ Payment service processes transaction
└─ Order system creates first order
```

### 2. Cross-Module Integration Evidence
**What to Capture:**
- Data passed between different modules
- API calls between services
- Database transactions across tables
- Event propagation between components

**Example Integration:**
```
UserService.updateProfile()
├─ Updates user table
├─ Triggers user.updated event
├─ NotificationService receives event
├─ EmailService sends update confirmation
└─ AuditService logs profile change
```

### 3. Data Consistency Evidence
**What to Capture:**
- Data integrity across module boundaries
- Transaction consistency in distributed operations
- State synchronization between components
- Eventual consistency validation

**Example Consistency Check:**
```
Order Creation Process:
├─ Inventory decremented ✓
├─ Payment processed ✓
├─ Order record created ✓
├─ Customer notified ✓
└─ Analytics updated ✓

Rollback Scenario:
├─ Payment fails ✗
├─ Inventory restored ✓
├─ Order cancelled ✓
└─ Customer notified ✓
```

### 4. Performance Integration Evidence
**What to Capture:**
- Response times for complete workflows
- Resource usage under realistic load
- Database performance with actual queries
- Network latency in distributed calls

**Example Performance Evidence:**
```
User Login Workflow:
├─ Authentication: 150ms ✓
├─ Profile loading: 200ms ✓
├─ Permissions check: 50ms ✓
├─ Dashboard data: 300ms ✓
└─ Total workflow: 700ms ✓ (target: <1000ms)
```

## Implementation Requirements

### Core Algorithm
1. **Define Integration Scenarios**
   - Identify critical user workflows
   - Map cross-module interactions
   - Define data consistency requirements
   - Set performance expectations

2. **Execute Integration Tests**
   - Run end-to-end workflow tests
   - Validate cross-module data flow
   - Check data consistency points
   - Measure performance metrics

3. **Capture Evidence**
   - Record test execution results
   - Log data transformations
   - Document performance measurements
   - Save error scenarios and recoveries

4. **Validate Evidence**
   - Verify all scenarios pass
   - Check evidence freshness (<2h)
   - Validate performance within limits
   - Confirm error handling works

## Expected Behavior

### Evidence Generation
```
Generating integration evidence...

End-to-End Workflows:
✓ User registration flow: PASSED (1.2s)
✓ Purchase workflow: PASSED (2.1s)  
✓ Profile update flow: PASSED (0.8s)
✓ Password reset flow: PASSED (1.5s)

Cross-Module Integration:
✓ User → Order integration: PASSED
✓ Order → Payment integration: PASSED
✓ Payment → Notification integration: PASSED
✓ Notification → Audit integration: PASSED

Data Consistency:
✓ User profile consistency: VALIDATED
✓ Order inventory consistency: VALIDATED
✓ Payment transaction consistency: VALIDATED
✓ Audit trail consistency: VALIDATED

Performance Benchmarks:
✓ API response times: WITHIN LIMITS
✓ Database query performance: OPTIMAL
✓ Memory usage: ACCEPTABLE
✓ CPU utilization: NORMAL

Integration evidence captured: 16 scenarios
Evidence freshness: 15 minutes
```

### Evidence Validation
```
Validating integration evidence...

Evidence Files Found:
✓ end-to-end-workflows.json (16 scenarios)
✓ cross-module-integration.json (12 integrations)
✓ data-consistency-checks.json (8 validations)
✓ performance-benchmarks.json (24 metrics)

Evidence Freshness:
✓ All evidence < 2 hours old
✓ Critical workflows < 30 minutes old
✓ Performance data < 1 hour old

Evidence Quality:
✓ All scenarios have success criteria
✓ Error cases documented and tested
✓ Performance baselines established
✓ Data validation rules applied

✓ Integration evidence VALIDATED
System integration integrity confirmed
```

### Evidence Failure
```
INTEGRATION EVIDENCE FAILURE DETECTED!

Failed Scenarios:
✗ Purchase workflow: TIMEOUT after 5.2s (limit: 3s)
✗ User → Order integration: DATA MISMATCH
  Expected: {userId: number, email: string}
  Received: {id: number, userEmail: string}

Missing Evidence:
✗ Password reset flow: NO EVIDENCE (>4h old)
✗ Payment error handling: NOT TESTED

Performance Violations:
✗ Database queries: 2.1s average (limit: 1s)
✗ Memory usage: 512MB (limit: 256MB)

ACTION REQUIRED:
1. Fix integration failures
2. Regenerate missing evidence  
3. Optimize performance bottlenecks
4. Validate all scenarios pass
```

## Evidence File Formats

### End-to-End Workflow Evidence
```json
{
  "workflow": "user_registration",
  "timestamp": "2024-12-19T16:30:00Z",
  "duration_ms": 1200,
  "steps": [
    {
      "step": "validate_input",
      "duration_ms": 50,
      "status": "passed",
      "data": {"email": "test@example.com", "valid": true}
    },
    {
      "step": "create_user",
      "duration_ms": 200,
      "status": "passed", 
      "data": {"userId": 123, "created": true}
    },
    {
      "step": "send_verification",
      "duration_ms": 300,
      "status": "passed",
      "data": {"emailSent": true, "messageId": "msg_456"}
    }
  ],
  "success_criteria": {
    "total_duration": {"limit": 3000, "actual": 1200, "passed": true},
    "all_steps_passed": true,
    "data_consistency": true
  }
}
```

### Cross-Module Integration Evidence
```json
{
  "integration": "user_service_to_order_service",
  "timestamp": "2024-12-19T16:30:00Z",
  "source_module": "UserService",
  "target_module": "OrderService",
  "data_flow": {
    "input": {"userId": 123, "email": "test@example.com"},
    "transformation": "user_to_customer_mapping",
    "output": {"customerId": 123, "customerEmail": "test@example.com"}
  },
  "validation": {
    "data_format": "passed",
    "required_fields": "passed",
    "type_consistency": "passed"
  }
}
```

### Data Consistency Evidence
```json
{
  "consistency_check": "order_inventory_sync",
  "timestamp": "2024-12-19T16:30:00Z",
  "scenario": "product_purchase",
  "checks": [
    {
      "check": "inventory_decremented",
      "before": {"product_id": 456, "quantity": 100},
      "after": {"product_id": 456, "quantity": 99},
      "expected_change": -1,
      "actual_change": -1,
      "status": "passed"
    },
    {
      "check": "order_created",
      "order_id": 789,
      "product_id": 456,
      "quantity": 1,
      "status": "passed"
    }
  ]
}
```

### Performance Evidence
```json
{
  "performance_benchmark": "api_response_times",
  "timestamp": "2024-12-19T16:30:00Z",
  "measurements": [
    {
      "endpoint": "/api/users/{id}",
      "method": "GET",
      "response_time_ms": 150,
      "limit_ms": 500,
      "status": "passed"
    },
    {
      "endpoint": "/api/orders",
      "method": "POST", 
      "response_time_ms": 300,
      "limit_ms": 1000,
      "status": "passed"
    }
  ],
  "summary": {
    "average_response_time": 225,
    "p95_response_time": 280,
    "within_limits": true
  }
}
```

## Integration with Framework

### DRS Integration
Add integration evidence to DRS calculation:

```
Integration Evidence (15 points):
- All workflows pass + fresh evidence: +15 points
- Most workflows pass + recent evidence: +10 points
- Some workflows pass + stale evidence: +5 points
- Missing or failing evidence: 0 points
```

### Evidence Requirements by Session Type
```yaml
evidence_requirements:
  DEVELOPMENT:
    - end_to_end_workflows: 2 critical paths
    - cross_module_integration: all modified integrations
    - data_consistency: affected data flows
  ENHANCEMENT:
    - end_to_end_workflows: 1 new feature workflow
    - cross_module_integration: new integrations only
    - performance: baseline + new feature impact
  DEPLOYMENT:
    - end_to_end_workflows: all critical user journeys
    - cross_module_integration: all system integrations
    - data_consistency: all data flows
    - performance: full benchmark suite
```

### Time Gate Integration
- **30 minutes**: Basic integration tests defined and passing
- **60 minutes**: Cross-module integrations validated
- **90 minutes**: End-to-end workflows proven
- **120 minutes**: Performance evidence captured

## Reference Implementations

### Bash
See: `reference/bash/generate-integration-evidence.sh`

### PowerShell
See: `reference/powershell/Generate-IntegrationEvidence.ps1`

### Python
See: `reference/python/generate_integration_evidence.py`

### Manual Checklist
See: `reference/checklists/integration-evidence.md`

## Configuration

### Workflow Definitions
```yaml
integration_evidence:
  workflows:
    critical:
      - "user_registration"
      - "user_login"
      - "purchase_flow"
      - "password_reset"
    standard:
      - "profile_update"
      - "order_history"
      - "payment_methods"
  performance_limits:
    api_response: 1000ms
    database_query: 500ms
    workflow_total: 5000ms
```

### Integration Points
```yaml
integration_evidence:
  cross_module:
    - source: "UserService"
      target: "OrderService"
      data_contract: "user_to_customer"
    - source: "OrderService"
      target: "PaymentService"
      data_contract: "order_to_payment"
    - source: "PaymentService"
      target: "NotificationService"
      data_contract: "payment_to_notification"
```

## Success Metrics
- Integration test coverage: >90% of critical paths
- Evidence freshness: <30 minutes for critical workflows
- Integration failure rate: <5% in development
- Performance regression detection: 100% of degradations caught

## Common Issues

### Issue: "Integration Tests Too Slow"
**Solution**: Parallelize tests, use test doubles for external services, optimize test data

### Issue: "Evidence Generation Overhead"
**Solution**: Automate evidence capture, run in background, cache results

### Issue: "Flaky Integration Tests"
**Solution**: Improve test isolation, add retry logic, fix timing issues

## Best Practices

1. **Focus on Critical Paths**: Start with most important user workflows
2. **Automate Evidence Generation**: Integrate into CI/CD pipeline
3. **Keep Evidence Fresh**: Regenerate evidence frequently
4. **Test Error Scenarios**: Include failure cases and recovery
5. **Monitor Performance**: Track trends, not just pass/fail

---

**Remember**: Integration evidence proves your system works as a whole, not just as individual parts.