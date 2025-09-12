# Context Preservation Specification

## Purpose
Maintain consistency of decisions, patterns, and architectural choices across development sessions to prevent AI agents from losing context and making contradictory or redundant changes.

## Why This Matters
- **Prevents Decision Drift**: AI agents forget previous architectural decisions and make contradictory choices
- **Maintains Code Consistency**: Ensures naming conventions, patterns, and styles remain consistent
- **Reduces Redundant Work**: Prevents reimplementing the same functionality differently
- **Preserves Rationale**: Keeps track of why decisions were made for future reference

## The Problem This Solves

### Common Context Loss Scenarios
```javascript
// SESSION 1: AI creates user service
class UserService {
  async getUserById(userId) {
    return this.userRepository.findById(userId);
  }
}

// SESSION 2: AI forgets previous pattern and creates inconsistent service
class OrderService {
  async getOrder(id) { // Different naming: getOrder vs getUserById
    return this.orderRepo.find(id); // Different naming: orderRepo vs userRepository
  }
}

// SESSION 3: AI reimplements user lookup differently
const fetchUser = (id) => { // Function instead of class method
  return database.query(`SELECT * FROM users WHERE id = ${id}`); // Direct SQL instead of repository
};
```

### Architectural Decision Drift
```javascript
// DECISION 1: Use repository pattern for data access
class UserRepository {
  async findById(id) { /* implementation */ }
}

// LATER: AI bypasses repository pattern (forgot the decision)
const getUser = (id) => {
  return db.query('SELECT * FROM users WHERE id = ?', [id]); // Direct database access
};

// RESULT: Inconsistent data access patterns throughout codebase
```

## Context Preservation Categories

### 1. Architectural Decision Records (ADRs)
**What to Track:**
- Major architectural decisions and their rationale
- Technology choices and alternatives considered
- Design patterns adopted and why
- Trade-offs made and their implications

**ADR Format:**
```markdown
# ADR-001: Use Repository Pattern for Data Access

## Status
Accepted

## Context
We need a consistent way to access data across different entities while maintaining testability and separation of concerns.

## Decision
We will use the Repository pattern for all data access operations.

## Consequences
### Positive
- Consistent data access patterns
- Easy to mock for testing
- Clear separation between business logic and data access

### Negative
- Additional abstraction layer
- More files to maintain

## Implementation Guidelines
- All entities must have a corresponding repository
- Repositories should implement a common interface
- Direct database access outside repositories is prohibited
```

### 2. Naming Convention Registry
**What to Track:**
- Variable and function naming patterns
- Class and module naming conventions
- File and directory naming standards
- API endpoint naming patterns

**Convention Examples:**
```yaml
naming_conventions:
  classes:
    pattern: "PascalCase"
    suffix_by_type:
      service: "Service"
      repository: "Repository"
      controller: "Controller"
  
  functions:
    pattern: "camelCase"
    prefix_by_action:
      get: "get", "fetch", "retrieve"
      create: "create", "add", "insert"
      update: "update", "modify", "edit"
      delete: "delete", "remove", "destroy"
  
  files:
    pattern: "kebab-case"
    suffix_by_type:
      service: ".service.js"
      repository: ".repository.js"
      test: ".test.js"
  
  api_endpoints:
    pattern: "REST conventions"
    examples:
      - "GET /api/users/{id}"
      - "POST /api/users"
      - "PUT /api/users/{id}"
      - "DELETE /api/users/{id}"
```

### 3. Pattern Consistency Tracking
**What to Track:**
- Design patterns in use (Repository, Factory, Observer, etc.)
- Implementation approaches for common tasks
- Error handling patterns
- Logging and monitoring patterns

**Pattern Registry:**
```yaml
established_patterns:
  data_access:
    pattern: "Repository Pattern"
    implementation: "Interface + Concrete class"
    example: "UserRepository implements IUserRepository"
  
  error_handling:
    pattern: "Custom Error Classes"
    implementation: "Extend base Error class"
    example: "ValidationError extends AppError"
  
  validation:
    pattern: "Schema-based validation"
    implementation: "Joi schemas"
    example: "userSchema.validate(userData)"
  
  logging:
    pattern: "Structured logging"
    implementation: "Winston with JSON format"
    example: "logger.info('User created', {userId, email})"
```

### 4. Cross-Session State Tracking
**What to Track:**
- Work completed in previous sessions
- Decisions made and their current status
- Incomplete work and next steps
- Dependencies between components

**Session State Format:**
```json
{
  "sessionId": "2024-12-19-001",
  "previousSession": "2024-12-18-003",
  "workCompleted": [
    {
      "component": "UserService",
      "status": "completed",
      "decisions": ["Use repository pattern", "Implement async/await"],
      "files": ["user.service.js", "user.repository.js"]
    }
  ],
  "workInProgress": [
    {
      "component": "OrderService",
      "status": "in_progress",
      "nextSteps": ["Implement order validation", "Add error handling"],
      "dependencies": ["UserService", "PaymentService"]
    }
  ],
  "pendingDecisions": [
    {
      "decision": "Choose caching strategy",
      "options": ["Redis", "In-memory", "Database"],
      "context": "Performance optimization for user lookups"
    }
  ]
}
```

## Implementation Requirements

### Core Algorithm
1. **Load Previous Context**
   - Read architectural decision records
   - Load naming convention registry
   - Review established patterns
   - Check previous session state

2. **Validate Consistency**
   - Check new code against established patterns
   - Validate naming conventions
   - Ensure architectural decisions are followed
   - Detect contradictory implementations

3. **Update Context**
   - Record new decisions made
   - Update pattern usage
   - Track naming convention adherence
   - Save session state for next time

4. **Report Inconsistencies**
   - Identify pattern violations
   - Flag naming inconsistencies
   - Highlight architectural drift
   - Suggest corrections

## Expected Behavior

### Context Loading
```
Loading development context...

Architectural Decisions: 12 ADRs loaded
- ADR-001: Repository pattern for data access
- ADR-002: JWT for authentication
- ADR-003: Event-driven architecture for notifications
- ... (9 more)

Naming Conventions: Established patterns loaded
- Classes: PascalCase with type suffixes
- Functions: camelCase with action prefixes
- Files: kebab-case with type suffixes
- APIs: RESTful conventions

Established Patterns: 8 patterns identified
- Data Access: Repository pattern
- Error Handling: Custom error classes
- Validation: Joi schema validation
- ... (5 more)

Previous Session State: 2024-12-18-003
- UserService: Completed
- OrderService: In progress (60% complete)
- PaymentService: Not started

✓ Context loaded successfully
Ready to maintain consistency
```

### Consistency Validation
```
Validating code consistency...

Naming Convention Check:
✓ Class names follow PascalCase pattern
✓ Function names follow camelCase pattern
✓ File names follow kebab-case pattern
✗ API endpoint inconsistency: GET /users vs GET /api/orders

Pattern Adherence Check:
✓ Repository pattern used for data access
✓ Custom error classes for error handling
✗ Direct database query bypasses repository pattern (order.service.js:45)

Architectural Decision Check:
✓ JWT authentication implemented as per ADR-002
✓ Event-driven notifications as per ADR-003
✗ Caching implementation contradicts ADR-005 (Redis required)

Session Continuity Check:
✓ OrderService implementation continues from previous session
✓ Established patterns maintained
✗ UserService modified without updating ADR-001

INCONSISTENCIES DETECTED: 4 issues require attention
```

### Context Update
```
Updating development context...

New Decisions Recorded:
+ ADR-006: Use Redis for session storage
+ Pattern: Circuit breaker for external API calls
+ Convention: Use 'handle' prefix for event handlers

Pattern Usage Updated:
+ Repository pattern: +2 implementations
+ Error handling: +3 custom error classes
+ Validation: +1 schema definition

Session State Saved:
- OrderService: Completed (was in progress)
- PaymentService: In progress (30% complete)
- NotificationService: Started

Next Session Recommendations:
1. Complete PaymentService implementation
2. Resolve caching inconsistency in UserService
3. Standardize API endpoint naming

✓ Context preserved for next session
```

## Context Preservation Rules

### Decision Tracking Rules
```yaml
context_preservation:
  adr_requirements:
    trigger_conditions:
      - "New technology introduced"
      - "Architecture pattern changed"
      - "Major design decision made"
    
    required_sections:
      - "Status" # Proposed, Accepted, Deprecated, Superseded
      - "Context" # Situation and problem
      - "Decision" # What was decided
      - "Consequences" # Positive and negative outcomes
    
    update_triggers:
      - "Decision implementation completed"
      - "Decision proven incorrect"
      - "New information changes context"
```

### Consistency Validation Rules
```yaml
context_preservation:
  consistency_checks:
    naming_conventions:
      enforce: true
      auto_fix: false # Suggest fixes but don't auto-apply
      exceptions: ["test files", "third-party integrations"]
    
    pattern_adherence:
      enforce: true
      allow_evolution: true # Patterns can evolve with proper ADR
      require_justification: true
    
    architectural_decisions:
      enforce: true
      allow_exceptions: false # Must update ADR to change
      track_violations: true
```

### Session Continuity Rules
```yaml
context_preservation:
  session_continuity:
    state_preservation:
      - "Work in progress status"
      - "Pending decisions"
      - "Component dependencies"
      - "Next steps identified"
    
    handoff_requirements:
      - "Clear status of all components"
      - "Documented next actions"
      - "Updated context files"
      - "Consistency validation passed"
```

## Integration with Framework

### DRS Integration
Add context preservation to DRS calculation:

```
Context Preservation (10 points):
- All consistency checks pass: +10 points
- Minor inconsistencies: +7 points
- Major inconsistencies: +3 points
- Context violations: 0 points
```

### Evidence Requirements
Context preservation becomes required evidence:

```
evidence/
├── adr-compliance-report.json         # ADR adherence validation
├── naming-consistency-check.json      # Naming convention validation
├── pattern-adherence-report.json      # Design pattern consistency
├── session-continuity-state.json      # Cross-session state tracking
└── context-preservation-summary.json  # Overall consistency status
```

### Framework Integration
Enhanced prompts check context preservation:

```
B. SET CONTEXT — Rules of Engagement (enhanced)
- Load previous context (ADRs, patterns, naming conventions)
- Validate consistency with established decisions
- **Check context preservation** before implementing changes
- Update context state for next session
```

## Reference Implementations

### Bash
See: `reference/bash/validate-context-preservation.sh`

### PowerShell
See: `reference/powershell/Validate-ContextPreservation.ps1`

### Python
See: `reference/python/validate_context_preservation.py`

### Manual Checklist
See: `reference/checklists/context-preservation.md`

## Context Files Structure

### ADR Directory Structure
```
docs/adr/
├── 0001-record-architecture-decisions.md
├── 0002-use-repository-pattern.md
├── 0003-implement-jwt-authentication.md
├── 0004-adopt-event-driven-architecture.md
└── template.md
```

### Context Registry Files
```
.ai-framework/context/
├── naming-conventions.yaml
├── established-patterns.yaml
├── session-state.json
└── consistency-rules.yaml
```

## Success Metrics
- Naming consistency score >95%
- Pattern adherence rate >90%
- ADR compliance rate >95%
- Context preservation across sessions >90%
- Reduced redundant implementations

## Common Issues

### Issue: "Too Many ADRs Created"
**Solution**: Set thresholds for decision significance, focus on architectural decisions

### Issue: "Naming Conventions Too Strict"
**Solution**: Allow reasonable variations, focus on major inconsistencies

### Issue: "Context Files Become Stale"
**Solution**: Regular context file reviews, automated staleness detection

## Best Practices

1. **Start Simple**: Begin with major patterns and decisions, expand gradually
2. **Focus on Impact**: Track decisions that affect multiple components
3. **Regular Reviews**: Periodically review and update context files
4. **Team Alignment**: Ensure team agrees on conventions and patterns
5. **Evolution Support**: Allow patterns to evolve with proper documentation

---

**Remember**: Consistency is key to maintainable code. Context preservation prevents the gradual decay that makes systems unmaintainable over time.