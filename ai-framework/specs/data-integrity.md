# Data Integrity Specification

## Purpose
Ensure data consistency, transaction safety, and business rule compliance to prevent data corruption, race conditions, and business logic violations that AI agents commonly introduce.

## Why This Matters
- **Prevents Data Corruption**: Ensures data modifications maintain consistency and integrity
- **Enforces Business Rules**: Validates that business constraints are respected
- **Prevents Race Conditions**: Ensures proper transaction boundaries and concurrency control
- **Maintains Audit Trails**: Tracks all data changes for compliance and debugging
- **Protects Financial Integrity**: Prevents incorrect calculations and business outcomes

## The Problem This Solves

### Common Data Integrity Violations by AI Agents
```javascript
// VIOLATION 1: Race conditions in data updates
async function updateInventory(productId, quantity) {
  const current = await getInventory(productId);
  // PROBLEM: Another process could modify inventory between read and write
  await setInventory(productId, current - quantity);
  // RESULT: Inventory corruption, overselling
}

// VIOLATION 2: Missing business constraint validation
async function processRefund(orderId, amount) {
  // PROBLEM: No validation of business rules
  await creditAccount(customerId, amount);
  // MISSING: Check refund doesn't exceed original payment
  // MISSING: Check for duplicate refunds
  // MISSING: Audit trail of refund
}

// VIOLATION 3: Inconsistent state updates
async function cancelOrder(orderId) {
  await updateOrderStatus(orderId, 'cancelled');
  // PROBLEM: Partial state update
  // MISSING: Release reserved inventory
  // MISSING: Process refund if payment captured
  // MISSING: Notify customer and fulfillment
  // RESULT: Inconsistent system state
}

// VIOLATION 4: Missing transaction boundaries
async function transferFunds(fromAccount, toAccount, amount) {
  await debitAccount(fromAccount, amount);  // Could fail here
  await creditAccount(toAccount, amount);   // Leaving system inconsistent
  // PROBLEM: No transaction wrapping, money could disappear
}
```

## Data Integrity Categories

### 1. Transaction Safety and ACID Properties
**What to Validate:**
- All data modifications use proper transactions
- Atomic operations for related data changes
- Consistent state maintained across operations
- Isolation levels appropriate for operations
- Durability ensured for critical operations

**Transaction Patterns:**
```javascript
// GOOD: Proper transaction usage
async function transferFunds(fromAccount, toAccount, amount) {
  const transaction = await db.beginTransaction();
  try {
    await debitAccount(fromAccount, amount, { transaction });
    await creditAccount(toAccount, amount, { transaction });
    await logTransfer(fromAccount, toAccount, amount, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// GOOD: Optimistic locking for race condition prevention
async function updateInventory(productId, quantity) {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const product = await getProductWithVersion(productId);
      if (product.inventory < quantity) {
        throw new InsufficientInventoryError();
      }
      
      const updated = await updateProductInventory(
        productId, 
        product.inventory - quantity,
        product.version // Optimistic lock
      );
      
      if (updated) {
        return updated;
      }
      // Version conflict, retry
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await sleep(100 * Math.pow(2, attempt)); // Exponential backoff
    }
  }
}
```

### 2. Business Constraint Validation
**What to Validate:**
- Business rules enforced at data layer
- Constraint violations prevented
- Domain-specific validations implemented
- Regulatory compliance maintained

**Business Rule Examples:**
```javascript
// GOOD: Business constraint validation
async function processRefund(orderId, amount) {
  const order = await getOrder(orderId);
  
  // Validate business constraints
  if (order.status !== 'completed') {
    throw new InvalidRefundError('Can only refund completed orders');
  }
  
  const existingRefunds = await getRefunds(orderId);
  const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);
  
  if (totalRefunded + amount > order.totalAmount) {
    throw new InvalidRefundError('Refund exceeds order total');
  }
  
  if (amount <= 0) {
    throw new InvalidRefundError('Refund amount must be positive');
  }
  
  // Process with audit trail
  const transaction = await db.beginTransaction();
  try {
    const refund = await createRefund({
      orderId,
      amount,
      reason,
      processedBy: userId,
      timestamp: new Date()
    }, { transaction });
    
    await creditCustomerAccount(order.customerId, amount, { transaction });
    await logRefundActivity(orderId, refund.id, userId, { transaction });
    await transaction.commit();
    
    return refund;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 3. Consistency and State Management
**What to Validate:**
- Related data updates are atomic
- State transitions follow business rules
- Cascading updates handled properly
- Data relationships maintained

**Consistency Patterns:**
```javascript
// GOOD: Consistent state management
async function cancelOrder(orderId) {
  const transaction = await db.beginTransaction();
  try {
    const order = await getOrder(orderId, { transaction });
    
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new InvalidStateTransitionError('Cannot cancel order in current state');
    }
    
    // Atomic state update with all related changes
    await updateOrderStatus(orderId, 'cancelled', { transaction });
    await releaseInventoryReservation(order.items, { transaction });
    
    if (order.paymentCaptured) {
      await initiateRefund(orderId, order.totalAmount, { transaction });
    }
    
    await createOrderEvent(orderId, 'cancelled', userId, { transaction });
    await scheduleCustomerNotification(orderId, 'order_cancelled', { transaction });
    
    await transaction.commit();
    
    // Async operations outside transaction
    await notifyFulfillmentCenter(orderId, 'cancel');
    await updateAnalytics('order_cancelled', { orderId });
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 4. Audit Trail and Compliance
**What to Validate:**
- All data changes logged with context
- User attribution for all modifications
- Timestamp accuracy and timezone handling
- Immutable audit records

**Audit Trail Implementation:**
```javascript
// GOOD: Comprehensive audit trail
class AuditLogger {
  static async logDataChange(entity, action, changes, context) {
    await createAuditRecord({
      entityType: entity.constructor.name,
      entityId: entity.id,
      action, // 'create', 'update', 'delete'
      changes: {
        before: changes.before,
        after: changes.after,
        fields: Object.keys(changes.after || changes.before)
      },
      userId: context.userId,
      sessionId: context.sessionId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: new Date(),
      correlationId: context.correlationId
    });
  }
}

// Usage in data operations
async function updateUserProfile(userId, updates, context) {
  const transaction = await db.beginTransaction();
  try {
    const before = await getUser(userId, { transaction });
    const after = await updateUser(userId, updates, { transaction });
    
    await AuditLogger.logDataChange(
      before,
      'update',
      { before: before.toJSON(), after: after.toJSON() },
      context
    );
    
    await transaction.commit();
    return after;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 5. Concurrency Control and Race Condition Prevention
**What to Validate:**
- Proper locking mechanisms used
- Race conditions identified and prevented
- Deadlock prevention strategies
- Performance impact of locking considered

**Concurrency Control Patterns:**
```javascript
// GOOD: Distributed locking for critical sections
class DistributedLock {
  static async withLock(key, ttl, operation) {
    const lockId = uuidv4();
    const acquired = await redis.set(
      `lock:${key}`, 
      lockId, 
      'PX', ttl, 
      'NX'
    );
    
    if (!acquired) {
      throw new LockAcquisitionError(`Could not acquire lock for ${key}`);
    }
    
    try {
      return await operation();
    } finally {
      // Ensure we only release our own lock
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(script, 1, `lock:${key}`, lockId);
    }
  }
}

// Usage for preventing race conditions
async function processPayment(orderId, paymentDetails) {
  return await DistributedLock.withLock(
    `payment:${orderId}`,
    30000, // 30 second TTL
    async () => {
      const order = await getOrder(orderId);
      
      if (order.paymentStatus !== 'pending') {
        throw new InvalidPaymentStateError('Payment already processed');
      }
      
      // Process payment safely within lock
      const result = await paymentGateway.charge(paymentDetails);
      await updateOrderPaymentStatus(orderId, 'completed', result.transactionId);
      
      return result;
    }
  );
}
```

## Implementation Requirements

### Core Algorithm
1. **Analyze Data Operations**
   - Identify all data modification operations
   - Check for transaction boundaries
   - Validate business constraint enforcement
   - Verify audit trail implementation

2. **Validate Transaction Safety**
   - Ensure ACID properties maintained
   - Check for proper error handling and rollback
   - Validate isolation levels and locking
   - Identify potential race conditions

3. **Check Business Rule Compliance**
   - Validate constraint enforcement
   - Check domain-specific validations
   - Verify regulatory compliance
   - Ensure data consistency rules

4. **Verify Audit and Compliance**
   - Check audit trail completeness
   - Validate user attribution
   - Verify timestamp accuracy
   - Ensure immutable audit records

## Expected Behavior

### Data Integrity Validation
```
Data integrity check...

Transaction Safety: SECURE ✓
- All data modifications use transactions
- Proper error handling and rollback implemented
- ACID properties maintained
- Race conditions prevented with locking

Business Constraints: ENFORCED ✓
- Domain validations implemented
- Business rules enforced at data layer
- Constraint violations prevented
- Regulatory compliance maintained

State Consistency: MAINTAINED ✓
- Related data updates are atomic
- State transitions follow business rules
- Cascading updates handled properly
- Data relationships preserved

Audit Trail: COMPLETE ✓
- All data changes logged with context
- User attribution for all modifications
- Immutable audit records maintained
- Compliance requirements met

Concurrency Control: IMPLEMENTED ✓
- Proper locking mechanisms used
- Race conditions identified and prevented
- Deadlock prevention strategies in place
- Performance impact considered

✓ Data integrity validation PASSED
System maintains data consistency and business rule compliance
```

### Data Integrity Violations
```
DATA INTEGRITY VIOLATIONS DETECTED!

Transaction Safety Issues (3):
✗ Data modification without transaction (user-service.js:45)
✗ Missing rollback on error (order-service.js:78)
✗ Race condition in inventory update (inventory.js:23)

Business Constraint Violations (2):
✗ Missing refund amount validation (refund-service.js:34)
✗ No duplicate prevention for critical operations (payment.js:67)

State Consistency Issues (1):
✗ Partial state update in order cancellation (order.js:123)

Audit Trail Gaps (2):
✗ Data changes not logged (user-profile.js:56)
✗ Missing user attribution (admin-actions.js:89)

DEPLOYMENT BLOCKED: Critical data integrity issues must be resolved

Remediation Actions:
1. Wrap data modifications in transactions
2. Implement proper error handling and rollback
3. Add business constraint validation
4. Implement comprehensive audit logging
5. Add concurrency control for race conditions
```

## Data Integrity Rules

### Transaction Requirements
```yaml
data_integrity:
  transactions:
    required_for:
      - "Multi-table updates"
      - "Financial operations"
      - "State transitions"
      - "Critical business operations"
    
    patterns:
      - "Begin transaction before modifications"
      - "Commit on success, rollback on error"
      - "Use appropriate isolation levels"
      - "Handle deadlocks gracefully"
    
    exceptions:
      - "Read-only operations"
      - "Single atomic operations"
      - "Idempotent operations"
```

### Business Constraint Rules
```yaml
data_integrity:
  business_constraints:
    validation_points:
      - "Before data modification"
      - "At API boundaries"
      - "In database constraints"
      - "In business logic layer"
    
    required_validations:
      - "Domain-specific rules"
      - "Regulatory compliance"
      - "Data relationship integrity"
      - "Business process compliance"
```

### Audit Requirements
```yaml
data_integrity:
  audit_trail:
    required_fields:
      - "Entity type and ID"
      - "Action performed"
      - "Before/after values"
      - "User ID and session"
      - "Timestamp and correlation ID"
    
    retention:
      - "Financial data: 7 years"
      - "User data: Per privacy policy"
      - "System data: 1 year minimum"
```

## Integration with Framework

### DRS Integration
Add data integrity to DRS calculation:

```
Data Integrity (10 points):
- All integrity checks pass: +10 points
- Minor integrity issues: +7 points
- Major integrity issues: +3 points
- Critical integrity violations: 0 points (BLOCKS DEPLOYMENT)
```

### Evidence Requirements
Data integrity becomes required evidence:

```
evidence/
├── transaction-safety-report.json     # Transaction usage validation
├── business-constraint-check.json     # Business rule compliance
├── audit-trail-validation.json       # Audit logging verification
├── concurrency-control-report.json   # Race condition prevention
└── data-consistency-check.json       # State consistency validation
```

### Deployment Blocking
Critical data integrity issues block deployment:

```yaml
deployment_gates:
  data_integrity:
    block_on:
      - "Missing transactions for critical operations"
      - "Race conditions in data updates"
      - "Business constraint violations"
      - "Missing audit trails for regulated data"
    warn_on:
      - "Incomplete business validations"
      - "Performance impact of locking"
```

## Reference Implementations

### Bash
See: `reference/bash/validate-data-integrity.sh`

### PowerShell
See: `reference/powershell/Validate-DataIntegrity.ps1`

### Python
See: `reference/python/validate_data_integrity.py`

### Manual Checklist
See: `reference/checklists/data-integrity.md`

## Success Metrics
- Zero data corruption incidents
- 100% transaction coverage for critical operations
- Business constraint violation rate <0.1%
- Audit trail completeness >99.9%
- Race condition incidents: 0

## Common Issues

### Issue: "Transactions Too Slow"
**Solution**: Optimize transaction scope, use appropriate isolation levels, consider read replicas

### Issue: "Too Many Business Rules"
**Solution**: Prioritize critical constraints, implement in layers (database, application, API)

### Issue: "Audit Trail Too Verbose"
**Solution**: Configure appropriate detail levels, implement log rotation, focus on critical data

## Best Practices

1. **Transaction Boundaries**: Keep transactions as short as possible while maintaining consistency
2. **Business Rules**: Implement constraints at multiple layers for defense in depth
3. **Audit Trails**: Log what changed, who changed it, when, and why
4. **Concurrency**: Use optimistic locking where possible, pessimistic only when necessary
5. **Testing**: Include data integrity tests in your test suite

---

**Remember**: Data integrity is not negotiable. A single data corruption incident can destroy user trust and business value.