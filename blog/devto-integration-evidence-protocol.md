# The Integration Evidence Protocol: Why Your Passing Tests Mean Nothing in Production

**Subtitle:** Stop shipping code that works in isolation but fails when assembled.

---

## The Green Wall of Lies

Your test suite is a masterpiece. 347 unit tests, all green. 100% coverage on the critical modules. The CI pipeline glows with approval. You ship to production with confidence.

Two hours later, production is on fire.

The user service works. The order service works. But when users try to actually place orders? The data format the user service sends isn't what the order service expects. Both modules tested perfectly in isolation. Together, they crash.

This is the integration gap. And it's responsible for more production incidents than any individual bug.

---

## What Integration Evidence Actually Means

Integration evidence isn't about whether modules work individually. It's proof that they work together.

**Unit tests verify:** "This function returns the expected output for this input."

**Integration evidence verifies:** "When a user clicks 'Buy Now', data flows correctly from the frontend through the API to the order service to the payment processor to the email service, and the user receives their confirmation."

The difference matters because:
- Data formats drift between modules
- API contracts evolve independently
- Error handling assumptions don't align
- Performance degrades when systems interact

---

## Four Types of Integration Evidence

### 1. End-to-End Workflow Evidence

These trace complete user journeys through your system:

```
User Registration → Email Verification → Profile Setup → First Purchase
├─ Frontend validates input
├─ API creates user record
├─ Email service sends verification
├─ Database stores user data
├─ Payment service processes transaction
└─ Order system creates first order
```

Each arrow is a potential failure point. Integration evidence proves each transition works.

### 2. Cross-Module Integration Evidence

When Module A calls Module B, what actually happens?

```
UserService returns: {id: 123, name: "John", email: "john@example.com"}
OrderService expects: {userId: 123, customerName: "John", customerEmail: "john@example.com"}
```

These field name mismatches are invisible to unit tests. Both modules have perfect tests that validate their own formats. Integration evidence catches the gap.

### 3. Data Consistency Evidence

In distributed systems, data lives in multiple places. Integration evidence proves it stays synchronized:

```
Order Creation Process:
├─ Inventory decremented ✓
├─ Payment processed ✓
├─ Order record created ✓
├─ Customer notified ✓
└─ Analytics updated ✓

Rollback Scenario (payment fails):
├─ Inventory restored ✓
├─ Order cancelled ✓
└─ Customer notified ✓
```

If any of these steps drift out of sync, you have data inconsistency bugs that are nearly impossible to debug from unit tests alone.

### 4. Performance Integration Evidence

Individual modules might be fast. Together, they might be slow:

```
User Login Workflow:
├─ Authentication: 150ms ✓
├─ Profile loading: 200ms ✓
├─ Permissions check: 50ms ✓
├─ Dashboard data: 300ms ✓
└─ Total workflow: 700ms ✓ (target: <1000ms)
```

700ms for a login is fine. But this evidence comes from measuring the actual workflow, not summing theoretical module times.

---

## The Integration Evidence Workflow

### Step 1: Define Critical Paths

Not every user flow needs integration evidence. Start with the paths that matter:

1. User registration and authentication
2. Core business transactions (purchases, subscriptions, bookings)
3. Payment flows
4. Data-sensitive operations (profile updates, deletions)

### Step 2: Map Integration Points

For each critical path, identify where modules connect:

```
Purchase Flow Integration Map:
Frontend → API Gateway → Auth Service → User Service → Product Service → Inventory Service → Order Service → Payment Service → Notification Service → Analytics Service
```

Each `→` is an integration point that needs evidence.

### Step 3: Execute and Capture

Run the actual workflow. Not mocks. Not stubs. Real data flowing through real services.

Capture:
- Request/response at each integration point
- Data transformations between modules
- Timing for each step
- Error handling behavior

### Step 4: Validate Evidence

Evidence without validation is just logging. Check:
- Did all steps complete successfully?
- Is data consistent across services?
- Are response times within acceptable limits?
- Do error scenarios recover correctly?

---

## What Integration Evidence Looks Like

### Passing Evidence

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

Data Consistency:
✓ User profile consistency: VALIDATED
✓ Order inventory consistency: VALIDATED
✓ Payment transaction consistency: VALIDATED

Performance:
✓ All workflows within acceptable limits

Integration evidence captured: 16 scenarios
All validations passed.
```

### Failing Evidence

```
INTEGRATION EVIDENCE FAILURE DETECTED!

Failed Scenarios:
✗ Purchase workflow: TIMEOUT after 5.2s (limit: 3s)
✗ User → Order integration: DATA MISMATCH
  Expected: {userId: number, email: string}
  Received: {id: number, userEmail: string}

Missing Evidence:
✗ Password reset flow: NO EVIDENCE (last run: >4h ago)
✗ Payment error handling: NOT TESTED

Performance Violations:
✗ Database queries: 2.1s average (limit: 1s)

ACTION REQUIRED: Fix integration failures before deployment.
```

The second output tells you exactly what's broken. Not "tests failed" but "User → Order sends `id` but Order expects `userId`."

---

## Evidence Freshness Matters

Integration evidence expires. Your system evolves constantly. Evidence from last week doesn't prove your system works today.

**Freshness rules:**
- Critical paths: Evidence must be < 30 minutes old before deployment
- Standard paths: Evidence must be < 2 hours old
- Non-critical paths: Evidence must be < 24 hours old

Stale evidence is dangerous because it gives false confidence. You think you know the system works, but it changed since you last checked.

---

## Common Objections

### "Integration tests are slow"

True. But production incidents are slower. A 5-minute integration test suite that catches a mismatch is faster than a 3-hour production debugging session.

**Mitigation strategies:**
- Parallelize tests across modules
- Use realistic test data, not exhaustive test data
- Cache results for unchanged integration points
- Run critical paths frequently, comprehensive suites less often

### "Mocks are good enough"

Mocks validate that you correctly anticipated what the other module does. They don't validate what the other module actually does.

```javascript
// This mock passes
mock(OrderService).expects({userId: 123, email: 'test@example.com'});
UserService.createUser().andCallThrough(OrderService);

// But OrderService was updated last week to expect {customerId, customerEmail}
// Your mock is testing old behavior
```

Mocks are useful for unit tests. Integration evidence requires real interactions.

### "We have contract tests"

Contract tests verify agreed interfaces. Integration evidence verifies actual behavior.

Contract tests catch: "OrderService changed its API without telling UserService."

Integration evidence catches: "OrderService and UserService both follow the contract, but their interpretations differ."

Both are valuable. Neither replaces the other.

---

## Implementing Integration Evidence

### Practical Approach

1. **Start small.** Pick your most critical user flow. Build integration evidence for that one path.

2. **Automate capture.** Evidence generation should happen automatically when integration tests run.

3. **Make evidence visible.** Dashboard showing integration health across all critical paths.

4. **Gate deployments.** No deployment without fresh integration evidence for affected paths.

### Evidence Storage

Integration evidence should be:
- Timestamped (when was this captured?)
- Versioned (what code version was tested?)
- Searchable (find evidence for specific integration points)
- Retained (historical evidence helps diagnose regressions)

### Team Workflow

Before merge:
- Integration evidence for modified integration points
- All affected workflows must pass

Before deployment:
- All critical path evidence < 30 minutes old
- No blocking integration failures
- Performance within acceptable limits

---

## The Real Benefit

Integration evidence isn't just about preventing bugs. It's about confidence.

When you have fresh integration evidence:
- You know the system works as a whole
- You can deploy without fear
- You can diagnose problems faster (check which integration point failed)
- You can evolve modules independently (evidence validates they still work together)

When you don't:
- Every deployment is a gamble
- Production incidents require cross-team debugging
- Module changes break things in unexpected ways
- "It works on my machine" becomes "It works in my module"

---

## Next Steps

1. **Audit your current state.** How many of your critical user flows have integration evidence? Probably fewer than you think.

2. **Pick one flow.** Your most important user journey. Build integration evidence for it this week.

3. **Automate.** Make evidence generation part of your CI pipeline. Manual evidence gets stale.

4. **Set freshness rules.** Decide how old evidence can be before it's considered invalid.

5. **Gate deployments.** Don't ship without integration evidence for critical paths.

Your tests pass. That's a start. Integration evidence proves your system actually works.

---

*This is part of the AI Control Framework series on building reliable software systems. The framework treats integration evidence as one of 13 components in the Deployability Rating Score (DRS).*

Previous: [The Context Preservation Protocol](#)
Next: Coming Soon

---

*Stop trusting unit tests alone. Start demanding integration evidence. Your production environment will thank you.*
