# Scope Control Specification

## Purpose
Limit the number of files and lines changed per session to ensure manageable, reviewable, and incremental progress.

## Why This Matters
- **Prevents Scope Creep**: "Quick fixes" don't become massive rewrites
- **Ensures Reviewability**: Changes stay within cognitive limits
- **Forces Incremental Progress**: Ship small, working increments
- **Maintains Focus**: Can't drift into unrelated "improvements"
- **Enables Quick Rollback**: Smaller changes are easier to revert

## Scope Limits

### Default Limits
- **Files**: Maximum 5 files changed per session
- **Lines**: Maximum 200 lines added/modified per session

### Session Type Variations
| Session Type | Max Files | Max Lines | Rationale |
|-------------|-----------|-----------|-----------|
| ASSESSMENT | 0 | 0 | Read-only discovery |
| DEVELOPMENT | 5 | 200 | Standard development |
| HOTFIX | 2 | 50 | Focused emergency fixes |
| REFACTOR | 10 | 400 | Structural improvements |
| DEPLOYMENT | 3 | 100 | Deployment adjustments only |

## What Counts Toward Limits

### Files That Count
- Any file with actual code changes
- Configuration files
- Documentation files (if modified)
- New files created
- Files deleted (counts as 1)

### Files That DON'T Count
- Generated files (if in .gitignore)
- Package lock files (package-lock.json, yarn.lock)
- Framework's own files (ai-framework/*)
- Binary files
- Files only touched by formatters (no logic change)

### Lines That Count
- Added lines of code
- Modified lines (counts as 1 per line)
- Deleted lines (counts as 0.5 per line)
- Documentation/comments (counts as 0.5)

### Lines That DON'T Count
- Blank lines
- Import/require statements (unless logic change)
- Pure formatting changes
- Auto-generated code

## Implementation Requirements

### Scope Calculation Algorithm
1. **Identify Changed Files**
   - Use git diff against session start
   - Or track file modification times
   - Exclude framework and generated files

2. **Count Changes**
   - Parse diff output
   - Sum additions and modifications
   - Apply weights for different change types

3. **Check Against Limits**
   - Compare to session type limits
   - Account for exceptions
   - Provide clear feedback

4. **Report Status**
   - Show current usage
   - Warn when approaching limits
   - Block when exceeded

## Expected Behavior

### Within Limits
```
Scope check...
Session type: DEVELOPMENT

Files changed: 3/5 ✓
  - src/api/users.js
  - src/db/schema.sql
  - tests/users.test.js

Lines changed: 147/200 ✓
  - Added: 89 lines
  - Modified: 43 lines
  - Deleted: 15 lines

Status: Within limits - continue working
```

### Approaching Limits
```
Scope check...
Session type: DEVELOPMENT

Files changed: 4/5 ⚠
Lines changed: 180/200 ⚠

WARNING: Approaching limits
- 1 file remaining
- 20 lines remaining
Consider wrapping up current work
```

### Exceeded Limits
```
SCOPE VIOLATION DETECTED!

Session type: DEVELOPMENT
Files changed: 7/5 ✗
Lines changed: 234/200 ✗

Exceeded by:
- 2 files over limit
- 34 lines over limit

ACTION REQUIRED:
1. Revert recent changes OR
2. Complete session and start new one OR
3. Justify with scope expansion request
```

## Scope Calculation Examples

### Example 1: Simple Feature
```diff
# File 1: src/feature.js
+ function newFeature() {      // +1 line
+   return processData();      // +1 line
+ }                            // +1 line

# File 2: tests/feature.test.js
+ test('feature works', () => {  // +1 line
+   expect(newFeature()).toBe(); // +1 line
+ });                            // +1 line

Total: 2 files, 6 lines ✓
```

### Example 2: Refactor
```diff
# File 1: src/old.js
- function oldWay() {          // 0.5 line (deletion)
-   // complex logic           // 0.5 line
- }                            // 0.5 line
+ function newWay() {          // +1 line
+   // simplified              // +1 line
+ }                            // +1 line

Total: 1 file, 4.5 lines ✓
```

## Reference Implementations

### Bash
See: `reference/bash/check-scope.sh`

### PowerShell
See: `reference/powershell/Check-Scope.ps1`

### Python
See: `reference/python/check_scope.py`

### Manual Checklist
See: `reference/checklists/scope-control.md`

## Configuration

### Customizing Limits
```yaml
scope:
  defaults:
    max_files: 5
    max_lines: 200
  
  session_types:
    HOTFIX:
      max_files: 2
      max_lines: 50
    FEATURE:
      max_files: 5
      max_lines: 200
    REFACTOR:
      max_files: 10
      max_lines: 400
      
  exclude:
    - "ai-framework/**"
    - "node_modules/**"
    - "*.lock"
    - "dist/**"
    - "build/**"
```

### Line Counting Weights
```yaml
scope:
  weights:
    added: 1.0
    modified: 1.0
    deleted: 0.5
    comment: 0.5
    blank: 0.0
    import: 0.0
```

## Why These Limits Work

### 5 Files Maximum
- **Cognitive Load**: Humans can hold 5-7 items in working memory
- **Review Time**: 5 files = ~15 minute review
- **Conflict Risk**: More files = higher merge conflict chance
- **Testing Scope**: 5 files can be thoroughly tested

### 200 Lines Maximum
- **Review Fatigue**: Studies show quality drops after 200 lines
- **Bug Rate**: Increases significantly after 200 lines
- **Commit Size**: Ideal for atomic, revertable commits
- **CI/CD Time**: Keeps build/test cycles fast

## Handling Limit Violations

### Option 1: Complete Current Session
1. Commit current work
2. End session properly
3. Start new session
4. Continue with next 5 files

### Option 2: Reduce Scope
1. Identify non-essential changes
2. Revert improvements/nice-to-haves
3. Focus on core requirement
4. Save other changes for next session

### Option 3: Scope Expansion Request
1. Document why more files needed
2. Get approval from team/lead
3. Temporarily increase limits
4. Track as exception

## Common Issues

### Issue: "Feature Requires 10 Files"
**Solution**: Break into logical phases, ship incrementally

### Issue: "Refactoring Touches Everything"
**Solution**: Refactor in passes, each within limits

### Issue: "Generated Files Counted"
**Solution**: Add to exclusion patterns

### Issue: "Formatting Changes Eat My Quota"
**Solution**: Separate formatting commits, or exclude from counts

## Success Metrics
- Average files per commit: 3-4
- Average lines per commit: 100-150  
- Review time per PR: < 30 minutes
- Merge conflicts: < 5%
- Rollback success rate: > 95%

## Best Practices

1. **Plan Before Coding**
   - List files you'll need to touch
   - Ensure within limits
   - Defer non-essential changes

2. **Work in Layers**
   - Backend first (session 1)
   - Frontend next (session 2)
   - Tests last (session 3)

3. **Use Scope Strategically**
   - Critical path: 3 files
   - Tests: 1 file
   - Documentation: 1 file

---

**Remember**: Constraints drive creativity. Working within limits forces better design and cleaner implementation.