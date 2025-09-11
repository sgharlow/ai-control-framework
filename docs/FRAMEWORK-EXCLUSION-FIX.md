# Framework Self-Assessment Prevention Fix

## Critical Issue Identified

**Problem:** When the AI Control Framework is installed and initial prompts are run, the framework was assessing ITSELF instead of the user's actual project.

**Impact:** 
- False completion estimates (framework files counted as "project progress")
- Inflated file counts and test metrics
- Confusion between framework setup and actual project work
- Incorrect session type recommendations

## Root Cause

The framework files (Claude-template/, scripts/, documentation) were being included in all assessments, making it appear that projects were more complete than they actually were.

## Solution Implemented

### 1. Explicit Framework File Exclusion

**Files Modified:**
- `assess-project.sh` - Now excludes all framework files from analysis
- `check-scope.sh` - Now only counts USER files toward limits
- Both `orchestration.md` templates - Added FRAMEWORK EXCLUSION RULE
- Both `progress.md` templates - Added USER PROJECT ONLY validation
- `CLAUDE-CODE-PROMPTS.md` - Emphasizes user project focus

### 2. Framework Files Excluded

**Directories:**
- `Claude-template/` (all contents)
- `DO NOT TOUCH/` (all contents)

**Files:**
- `CLAUDE.md`
- All `*.sh` scripts (assess-project.sh, check-scope.sh, etc.)
- `.contract-hashes`, `.drs-*` tracking files
- Any file containing "FRAMEWORK", "OPERATIONALIZATION", "TROUBLESHOOTING"

### 3. Updated Guidance

**Before Fix:**
```bash
$ ./assess-project.sh
Code files: 25  # Included framework files!
Estimated completion: 85%  # False positive!
```

**After Fix:**
```bash
$ ./assess-project.sh
🔍 SCANNING USER PROJECT (excluding framework files)...
User code files: 12  # Only actual project files
Estimated completion: 45%  # Accurate assessment
```

## Implementation Details

### assess-project.sh Changes
- Added explicit grep filters to exclude framework paths
- Changed all output to specify "User code files", "User test files", etc.
- Added framework exclusion message in header

### check-scope.sh Changes  
- Modified file counting to exclude framework files from scope limits
- Updated output to clarify "User files changed"
- Framework files no longer count toward 5-file limit

### Template Changes
- Added "FRAMEWORK EXCLUSION RULE (CRITICAL)" section to orchestration.md
- Updated all session type boundaries to specify "USER files"
- Modified progress validation to focus on "USER PROJECT ONLY"

### Prompt Changes
- Added explicit framework exclusion warnings to ASSESS prompt
- Updated SET CONTEXT to emphasize user project focus
- All prompts now specify USER project vs framework distinction

## Risk Mitigation

**Minimal Risk Approach:**
- Used explicit exclusion lists rather than complex detection logic
- Maintained backward compatibility (existing projects unaffected)
- Simple grep-based filtering (reliable, no complex parsing)
- Clear documentation of what gets excluded

**No Breaking Changes:**
- Existing functionality preserved
- Default behavior improved (more accurate assessments)
- Framework still works for projects without user code

## Validation

**Test Case: Framework-Only Directory**
```bash
$ ./assess-project.sh
User code files: 0  # Correct - no user project files
User config files: 0  # Correct - no user configs  
User test files: 0  # Correct - no user tests
Estimated completion: 0%  # Correct - no user project exists
Recommended session type: DEVELOPMENT - Project needs significant work
```

**Test Case: Mixed Directory (Framework + User Project)**
- Framework files ignored ✓
- Only user project files counted ✓
- Accurate completion estimates ✓
- Appropriate session type recommendations ✓

## Benefits Achieved

1. **Accurate Assessments:** Framework no longer inflates project completion
2. **Clear Separation:** Distinct boundary between framework and user project
3. **Correct Scope Limits:** 5-file limit applies only to user code
4. **Honest Progress:** Progress tracking reflects actual user work
5. **Better Recommendations:** Session types based on real project state

## Critical Success Factor

This fix ensures the framework serves its intended purpose: **disciplined development of USER projects**, not assessment of the framework itself.

The framework now correctly distinguishes between:
- **Framework files** (tools, templates, scripts) - EXCLUDED from all assessments
- **User project files** (the actual application being built) - INCLUDED in assessments

This separation is fundamental to the framework's effectiveness and prevents the self-referential assessment problem that was identified.