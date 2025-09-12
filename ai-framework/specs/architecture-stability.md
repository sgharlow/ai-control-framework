# Architecture Stability Specification

## Purpose
Detect and prevent architectural drift that can occur when AI assistants maintain interface contracts while fundamentally restructuring internal system architecture.

## Why This Matters
- **Prevents Hidden Complexity**: AI can add layers/patterns without changing interfaces
- **Maintains System Coherence**: Architecture should evolve intentionally, not accidentally
- **Preserves Performance**: Architectural changes can have significant performance impacts
- **Enables Maintainability**: Consistent architecture is easier to understand and modify

## The Problem This Solves

### Architectural Drift Examples
```javascript
// BEFORE: Simple direct call
function getUser(id) {
  return database.query('SELECT * FROM users WHERE id = ?', [id]);
}

// AFTER: AI adds unnecessary complexity (interface unchanged)
function getUser(id) {
  const cacheManager = new CacheManager();
  const queryBuilder = new QueryBuilder();
  const resultProcessor = new ResultProcessor();
  const validator = new InputValidator();
  
  validator.validate(id);
  const query = queryBuilder.buildUserQuery(id);
  const cached = cacheManager.get(query.hash);
  if (cached) return resultProcessor.process(cached);
  
  const result = database.query(query.sql, query.params);
  cacheManager.set(query.hash, result);
  return resultProcessor.process(result);
}
```

## Architecture Stability Checks

### 1. Dependency Graph Stability
**What to Monitor:**
- Module dependency relationships
- Import/require statements
- Service injection patterns
- Component hierarchies

**Violation Examples:**
- New dependencies introduced without justification
- Circular dependencies created
- Deep dependency chains added
- Unnecessary abstraction layers

### 2. Layer Violation Detection
**What to Monitor:**
- Presentation layer calling data layer directly
- Business logic in presentation components
- Data access in UI components
- Cross-cutting concerns mixed with business logic

**Expected Architecture:**
```
Presentation Layer → Business Layer → Data Layer
     ↓                    ↓              ↓
   UI Logic         Business Rules   Data Access
```

### 3. Pattern Consistency
**What to Monitor:**
- Consistent use of established patterns
- Introduction of new patterns without approval
- Mixing of incompatible patterns
- Pattern implementation quality

**Common Patterns to Track:**
- Repository pattern usage
- Factory pattern implementation
- Observer/Event patterns
- Dependency injection patterns

### 4. Complexity Metrics
**What to Monitor:**
- Cyclomatic complexity per function
- Class coupling metrics
- Inheritance depth
- Method parameter counts

**Thresholds:**
- Cyclomatic complexity: ≤10 per function
- Class coupling: ≤7 dependencies
- Inheritance depth: ≤4 levels
- Method parameters: ≤5 parameters

## Implementation Requirements

### Core Algorithm
1. **Baseline Architecture**
   - Analyze current dependency graph
   - Identify architectural layers
   - Document established patterns
   - Calculate complexity metrics

2. **Monitor Changes**
   - Track new dependencies
   - Detect layer violations
   - Identify pattern deviations
   - Calculate metric changes

3. **Validate Stability**
   - Compare current vs baseline
   - Check against architectural rules
   - Validate pattern consistency
   - Assess complexity trends

4. **Report Violations**
   - Identify architectural drift
   - Quantify complexity increases
   - Suggest remediation actions
   - Block deployment if critical

## Expected Behavior

### Baseline Creation
```
Analyzing architecture baseline...

Dependency Analysis:
✓ 47 modules analyzed
✓ 156 dependencies mapped
✓ 3 architectural layers identified
✓ 0 circular dependencies found

Pattern Analysis:
✓ Repository pattern: 12 implementations
✓ Factory pattern: 5 implementations  
✓ Observer pattern: 8 implementations
✓ Dependency injection: 23 implementations

Complexity Metrics:
✓ Average cyclomatic complexity: 4.2
✓ Average class coupling: 3.1
✓ Maximum inheritance depth: 3
✓ Average method parameters: 2.8

Architecture baseline established
```

### Clean Validation
```
Architecture stability check...

Dependency Graph: STABLE ✓
- No new dependencies added
- No circular dependencies introduced
- Layer boundaries respected

Pattern Consistency: MAINTAINED ✓
- Repository pattern: consistent usage
- Factory pattern: proper implementation
- No unauthorized pattern mixing

Complexity Metrics: WITHIN LIMITS ✓
- Cyclomatic complexity: 4.3 (↑0.1)
- Class coupling: 3.2 (↑0.1)
- Inheritance depth: 3 (unchanged)
- Method parameters: 2.9 (↑0.1)

✓ Architecture stability maintained
```

### Violation Detection
```
ARCHITECTURE STABILITY VIOLATION DETECTED!

Dependency Violations:
✗ New dependency: UserService → PaymentService (cross-domain)
✗ Circular dependency: OrderService ↔ InventoryService

Layer Violations:
✗ UI component directly accessing database
✗ Business logic mixed in presentation layer

Pattern Violations:
✗ Repository pattern bypassed in OrderController
✗ Factory pattern inconsistently implemented

Complexity Violations:
✗ Function complexity: 15 (limit: 10)
✗ Class coupling: 9 (limit: 7)

IMPACT ASSESSMENT:
- Maintainability: DEGRADED
- Testability: REDUCED  
- Performance: AT RISK

ACTION REQUIRED:
1. Refactor to remove violations OR
2. File Architecture Change Request (ACR)
```

## Architecture Rules Configuration

### Dependency Rules
```yaml
architecture:
  dependencies:
    allowed_patterns:
      - "presentation → business"
      - "business → data"
      - "shared ← *"
    forbidden_patterns:
      - "data → business"
      - "data → presentation"
      - "* → legacy (except adapters)"
    max_depth: 5
    circular_dependencies: forbidden
```

### Layer Rules
```yaml
architecture:
  layers:
    presentation:
      allowed_dependencies: ["business", "shared"]
      forbidden_dependencies: ["data"]
    business:
      allowed_dependencies: ["data", "shared"]
      forbidden_dependencies: ["presentation"]
    data:
      allowed_dependencies: ["shared"]
      forbidden_dependencies: ["business", "presentation"]
```

### Pattern Rules
```yaml
architecture:
  patterns:
    repository:
      required_for: ["data access"]
      implementation: "interface + concrete"
    factory:
      required_for: ["complex object creation"]
      max_parameters: 3
    observer:
      required_for: ["event handling"]
      max_observers: 10
```

### Complexity Limits
```yaml
architecture:
  complexity:
    cyclomatic_complexity: 10
    class_coupling: 7
    inheritance_depth: 4
    method_parameters: 5
    class_size_lines: 300
    method_size_lines: 50
```

## Integration with Framework

### DRS Integration
Add architecture stability to DRS calculation:

```
Architecture Stability (10 points):
- All rules pass: +10 points
- Minor violations: +5 points
- Major violations: 0 points
```

### Evidence Requirements
Architecture analysis becomes required evidence:

```
evidence/
├── dependency-graph.json          # Current dependency structure
├── layer-analysis.json           # Layer violation report
├── pattern-compliance.json       # Pattern usage analysis
├── complexity-metrics.json       # Code complexity measurements
└── architecture-diff.json        # Changes from baseline
```

### Prompt Integration
Enhanced prompts check architecture stability:

```
R. ENHANCE — Context-Aware Enhancement Handler
...
### Pre-Enhancement Assessment:
1. **Architecture Impact Analysis**
   - Dependency changes required
   - Layer boundary implications  
   - Pattern consistency maintenance
   - Complexity impact assessment
...
```

## Reference Implementations

### Bash
See: `reference/bash/check-architecture-stability.sh`

### PowerShell
See: `reference/powershell/Check-ArchitectureStability.ps1`

### Python
See: `reference/python/check_architecture_stability.py`

### Manual Checklist
See: `reference/checklists/architecture-stability.md`

## Architecture Change Request (ACR)

When architectural changes are necessary:

### 1. Justify the Change
- Why current architecture is insufficient
- What specific problem the change solves
- Alternative approaches considered
- Long-term architectural vision

### 2. Impact Analysis
- Performance implications
- Maintainability effects
- Testing complexity changes
- Team knowledge requirements

### 3. Implementation Plan
- Phased rollout strategy
- Risk mitigation approaches
- Rollback procedures
- Success metrics

### 4. Approval Process
- Architecture review board
- Technical lead approval
- Team consensus building
- Documentation updates

## Tool Integration

### Static Analysis Tools
```yaml
tools:
  dependency_analysis:
    - "madge" # JavaScript dependency analysis
    - "pydeps" # Python dependency analysis  
    - "jdeps" # Java dependency analysis
  complexity_analysis:
    - "eslint-complexity" # JavaScript complexity
    - "radon" # Python complexity
    - "checkstyle" # Java complexity
  architecture_analysis:
    - "dependency-cruiser" # Architecture rules
    - "arch-unit" # Java architecture testing
```

### IDE Integration
```yaml
ide_integration:
  warnings:
    - "New dependency added"
    - "Layer boundary crossed"
    - "Complexity threshold exceeded"
  blocking:
    - "Circular dependency created"
    - "Critical pattern violated"
    - "Architecture rule broken"
```

## Success Metrics
- Architecture violations per sprint: <2
- Average complexity growth per session: <5%
- Pattern consistency score: >90%
- Dependency graph stability: >95%

## Common Issues

### Issue: "Too Many False Positives"
**Solution**: Tune rules to project context, focus on critical violations

### Issue: "Rules Too Restrictive"
**Solution**: Start with loose rules, tighten based on team maturity

### Issue: "Performance Impact"
**Solution**: Run analysis incrementally, cache results, optimize tooling

## Best Practices

1. **Start Simple**: Begin with basic dependency and layer rules
2. **Evolve Gradually**: Add complexity rules as team matures
3. **Focus on Critical Paths**: Prioritize stability in core business logic
4. **Educate Team**: Ensure everyone understands architectural principles
5. **Regular Reviews**: Periodically assess and update architectural rules

---

**Remember**: Architecture stability prevents the gradual decay that makes systems unmaintainable over time.