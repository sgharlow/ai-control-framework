# Deployability Rating Score (DRS) Specification

## Purpose
Provide an objective, quantifiable measure of code readiness for production deployment.

## Why This Matters
- **Removes Guesswork**: "Is it ready?" becomes a number
- **Enforces Standards**: Can't deploy below threshold
- **Tracks Progress**: See improvement over time
- **Prevents Premature Deployment**: Code ships only when truly ready
- **Creates Accountability**: Objective measure everyone agrees on

## DRS Scale

| Score Range | Status | Meaning | Action |
|------------|--------|---------|--------|
| 0-40 | Early Development | Foundation being built | Focus on contracts and structure |
| 40-70 | In Progress | Core functionality working | Connect real services, add tests |
| 70-85 | Nearly Ready | Most requirements met | Polish, error handling, documentation |
| 85-100 | **DEPLOYABLE** | Production ready | Ship it! |

## Scoring Components

### Standard Weights (Total = 100)

| Component | Points | What It Measures |
|-----------|--------|------------------|
| Contract Integrity | 20 | Interfaces defined and frozen |
| No Mocks | 20 | Using real services |
| Tests Passing | 15 | Automated validation |
| Error Handling | 10 | Graceful failure management |
| Scope Compliance | 10 | Within defined limits |
| API Evidence | 15 | Real endpoints connected |
| Documentation | 10 | Code is maintainable |

## Calculation Algorithm

### Step 1: Check Each Component

#### Contract Integrity (20 points)
```
if contracts_defined AND contracts_unchanged:
    score += 20
else if contracts_defined:
    score += 10  # Partial credit
else:
    score += 0
```

#### No Mocks (20 points)
```
if no_mocks_detected:
    score += 20
else if mocks_in_tests_only:
    score += 10  # Partial credit
else:
    score += 0
```

#### Tests Passing (15 points)
```
if all_tests_pass:
    score += 15
else if most_tests_pass (>80%):
    score += 10
else if some_tests_pass (>50%):
    score += 5
else:
    score += 0
```

#### Error Handling (10 points)
```
if comprehensive_error_handling:
    score += 10
else if basic_error_handling:
    score += 5
else:
    score += 0
```

#### Scope Compliance (10 points)
```
if within_all_limits:
    score += 10
else if minor_violation (<20% over):
    score += 5
else:
    score += 0
```

#### API Evidence (15 points)
```
if real_api_calls_verified:
    score += 15
else if api_configured:
    score += 7
else:
    score += 0
```

#### Documentation (10 points)
```
if comprehensive_docs:
    score += 10
else if basic_docs:
    score += 5
else:
    score += 0
```

## Expected Output

### Detailed Report
```
═══════════════════════════════════════
DEPLOYABILITY RATING SCORE (DRS)
Time: 2024-01-15 14:30:00
═══════════════════════════════════════

Component Scores:
✓ Contract Integrity........ 20/20
✓ No Mocks.................. 20/20
✓ Tests Passing............. 15/15
⚠ Error Handling............ 5/10
✓ Scope Compliance.......... 10/10
✗ API Evidence.............. 0/15
⚠ Documentation............. 5/10

TOTAL DRS: 75/100

Status: NEARLY READY
Next Actions:
- Connect and verify API endpoints (+15)
- Improve error handling (+5)
- Complete documentation (+5)

Estimated time to deployment: 2-3 hours
═══════════════════════════════════════
```

### Minimal Output
```
DRS: 75/100 (NEARLY READY)
Missing: API evidence, error handling
```

## Component Details

### Contract Integrity
**What to Check:**
- Contract files exist
- Contracts have been hashed
- No unauthorized changes

**Evidence:**
- `.contract-hashes` file exists
- Hash comparison passes

### No Mocks
**What to Check:**
- Code scan for mock patterns
- No hardcoded test data
- Real service configurations

**Evidence:**
- Mock detection passes
- Configuration points to real services

### Tests Passing
**What to Check:**
- Test suite exists
- Tests execute successfully
- Coverage is adequate

**Evidence:**
- Test runner output
- Coverage reports
- CI/CD status

### Error Handling
**What to Check:**
- Try-catch blocks present
- Validation on inputs
- Graceful degradation
- Logging of errors

**Evidence:**
- Error handling patterns in code
- Logging configuration
- Fallback mechanisms

### Scope Compliance
**What to Check:**
- Files changed within limit
- Lines changed within limit
- No scope creep

**Evidence:**
- Git diff statistics
- File count under threshold

### API Evidence
**What to Check:**
- Real endpoints configured
- Successful API calls logged
- Authentication working

**Evidence:**
- `evidence/` directory with captures
- Network logs
- API response samples

### Documentation
**What to Check:**
- README exists and current
- Code comments present
- API documentation
- Deployment instructions

**Evidence:**
- Documentation files present
- Comments in complex code
- Setup instructions clear

## Reference Implementations

### Bash
See: `reference/bash/drs-calculate.sh`

### PowerShell
See: `reference/powershell/Calculate-DRS.ps1`

### Python
See: `reference/python/calculate_drs.py`

### Manual Calculation
See: `reference/checklists/drs-calculation.md`

## Custom Scoring

### For API-Heavy Projects
```yaml
drs:
  weights:
    contracts: 15
    mocks: 15
    tests: 15
    errors: 10
    scope: 5
    api: 25      # Increased
    docs: 15
```

### For Internal Tools
```yaml
drs:
  weights:
    contracts: 25    # More important
    mocks: 25       # Critical
    tests: 20
    errors: 10
    scope: 10
    api: 5          # Less important
    docs: 5
```

### For Libraries
```yaml
drs:
  weights:
    contracts: 30    # API stability crucial
    mocks: 10
    tests: 25       # Extensive testing needed
    errors: 10
    scope: 5
    api: 5
    docs: 15        # Documentation critical
```

## Improving Your DRS

### Quick Wins (+5-10 points each)
1. Add error handling to main functions
2. Write basic tests for happy path
3. Add README with setup instructions
4. Define contracts if missing

### Medium Effort (+10-15 points)
1. Replace all mocks with real services
2. Achieve 80% test coverage
3. Connect to real APIs
4. Add comprehensive error handling

### Final Push (+5 points each)
1. Complete documentation
2. Add integration tests
3. Implement logging
4. Add monitoring hooks

## DRS History Tracking

### Storage Format
```
2024-01-15 09:00:00 45
2024-01-15 10:30:00 60
2024-01-15 12:00:00 75
2024-01-15 14:00:00 85
```

### Visualization
```
100 |                    
 85 |                  * ← Deployable!
 70 |            *
 55 |      *
 40 |  *
 25 |*
  0 +--------------------
    0    2    4    6  hours
```

## Automation

### Git Hooks
```bash
# pre-commit hook
DRS=$(calculate-drs)
if [ $DRS -lt 70 ]; then
  echo "DRS too low: $DRS/100"
  exit 1
fi
```

### CI/CD Gates
```yaml
deploy:
  stage: deploy
  script:
    - drs=$(calculate-drs)
    - if [ $drs -lt 85 ]; then exit 1; fi
    - deploy-to-production
```

## Common Issues

### Issue: "DRS Won't Go Above 60"
**Check**: Usually missing API evidence or no tests

### Issue: "DRS Dropped Suddenly"
**Check**: Contract change or mocks introduced

### Issue: "DRS Different on Different Machines"
**Check**: Ensure same test data and environment

## Success Metrics
- Average DRS at deployment: >90
- Time from DRS 0 to 85: <4 hours
- Deployment failure rate: <5%
- Rollback frequency: <2%

---

**Remember**: DRS is not about perfection, it's about deployability. 85 is good enough to ship!