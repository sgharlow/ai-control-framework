# Contract Integrity Specification

## Purpose
Prevent interface drift by ensuring API contracts, database schemas, and other interface definitions remain unchanged without explicit approval.

## Why This Matters
- **Prevents Silent Breaking Changes**: Interfaces can't change without notice
- **Forces Intentional Design**: Changes require Contract Change Request (CCR)
- **Maintains System Stability**: No surprise integration failures

## What Constitutes a Contract

### Always Contracts
- API specification files (OpenAPI/Swagger, GraphQL schemas)
- Database schemas (SQL DDL, migration files)
- Protocol definitions (Protobuf, Thrift, Avro)
- Message formats (JSON Schema, XML Schema)
- Configuration interfaces (environment variables, config schemas)

### Project-Specific Contracts
- Type definitions in strongly-typed languages
- Public class interfaces
- Shared data structures
- Event schemas
- RPC definitions

## Implementation Requirements

### Core Algorithm
1. **Identify Contract Files**
   - Scan for files matching contract patterns
   - Include user-defined contract paths
   - Exclude test and mock directories

2. **Generate Hashes**
   - Create SHA256 hash for each contract file
   - Store path + hash pairs
   - Include timestamp of hash generation

3. **Compare with Baseline**
   - Load previously stored hashes
   - Compare current vs. stored
   - Report any differences

4. **Handle Violations**
   - If mismatch found, STOP work immediately
   - Report which files changed
   - Require CCR approval to continue

## Expected Behavior

### First Run
```
No contract hashes found
Initializing contract baseline...
Found contracts:
  - api/openapi.yaml
  - database/schema.sql
  - events/user.schema.json
Baseline created: .contract-hashes
```

### Clean Check
```
Checking contract integrity...
Contracts verified: 3 files unchanged
✓ Contract integrity maintained
```

### Violation Detected
```
CONTRACT VIOLATION DETECTED!

Changed contracts:
  - api/openapi.yaml (modified 10 minutes ago)
  
STOP: Changes to contracts require approval
Run contract change request (CCR) process
```

## Contract Change Request (CCR) Process

When a contract must change:

1. **Document the Change**
   - What is changing
   - Why it must change
   - Impact analysis
   - Migration plan

2. **Get Approval**
   - Technical review
   - Affected teams notified
   - Approval documented

3. **Update Baseline**
   - Run CCR approval tool
   - New hashes stored
   - Change logged with justification

## Reference Implementations

### Bash
See: `reference/bash/check-contracts.sh`

### PowerShell  
See: `reference/powershell/Check-Contracts.ps1`

### Python
See: `reference/python/check_contracts.py`

### Manual Checklist
See: `reference/checklists/contract-integrity.md`

## Configuration

### Standard Patterns
```yaml
contracts:
  include:
    - "api/**/*.yaml"
    - "api/**/*.yml"
    - "database/*.sql"
    - "proto/**/*.proto"
    - "graphql/**/*.graphql"
    - "schemas/**/*.json"
  exclude:
    - "**/test/**"
    - "**/mock/**"
    - "**/example/**"
```

### Custom Patterns
Add project-specific patterns as needed:
```yaml
contracts:
  custom:
    - "src/interfaces/*.ts"  # TypeScript interfaces
    - "lib/public/*.rb"       # Ruby public APIs
    - "pkg/api/*.go"          # Go packages
```

## Success Metrics
- Zero unplanned contract changes
- All contract changes have CCR documentation
- No production integration failures due to contract drift

## Common Issues

### Issue: Too Many False Positives
**Solution**: Refine contract patterns to exclude generated or temporary files

### Issue: Contracts Not Detected
**Solution**: Add explicit paths to configuration

### Issue: Hash Mismatches on Different Platforms
**Solution**: Normalize line endings before hashing

## When to Check
- Before starting any development session
- Before committing code
- Before creating pull requests
- Before deployment
- Every 30 minutes during active development

## Automation Recommendations
- Git pre-commit hooks
- CI/CD pipeline checks
- IDE save actions
- Scheduled monitoring

---

**Remember**: The goal is not to prevent all changes, but to make changes intentional and documented.