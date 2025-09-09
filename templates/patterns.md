# PATTERNS — Mandatory Pattern Selection

## RULE: Select Pattern BEFORE Coding

No implementation without pattern selection. If no pattern fits, document why and propose new pattern.

## Success Patterns (Proven Solutions)

### PATTERN-001: Real Service First
- **Mandatory for:** Any external integration
- **Implementation:** First 5 minutes - connect to real API, capture response, build from reality
- **Success Rate:** 94%
- **Time to Working:** 10-15 min

### PATTERN-002: Contract-First Testing
- **Mandatory for:** Any API work
- **Implementation:**
  1. Generate test from OpenAPI spec
  2. Test fails against real endpoint
  3. Implement until test passes
- **Success Rate:** 89%
- **Prevents:** Contract drift

### PATTERN-003: Scope Sentinel
- **Mandatory for:** Every session
- **Implementation:** Set MAX_FILES=5, MAX_LOC=200, check every commit
- **Success Rate:** 91%
- **Prevents:** Scope creep

## Anti-Patterns (MUST AVOID)

### ANTIPATTERN-001: Mock-First Trap
- **Detection:** No real API calls in first 30 min
- **Consequence:** -40 DRS, 2-hour recovery
- **Prevention:** Use PATTERN-001

### ANTIPATTERN-002: Contract Drift
- **Detection:** Contract files modified without CCR
- **Consequence:** Broken integrations
- **Prevention:** Automated hash checking

### ANTIPATTERN-003: Feature Creep
- **Detection:** More than 5 files changed, more than 200 LOC added
- **Consequence:** Unshippable complexity
- **Prevention:** Use PATTERN-003