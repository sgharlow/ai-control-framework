# Troubleshooting Guide

## Common Issues and Solutions

### 1. Contract Violation on First Run

**Error:**
```
✗ CONTRACT VIOLATION DETECTED!
Changed contracts: api/openapi.yaml
```

**Cause:** Contract file changed after initialization

**Solution:**
```bash
# Option 1: Revert the change
git checkout -- api/openapi.yaml

# Option 2: If change is necessary, approve it
./approve-contract-change.sh
# Provide justification when prompted
```

### 2. Mock Timeout Violation

**Error:**
```
✗ VIOLATION: Mocks detected after 30-minute mark!
Files with mocks:
- src/service.js: line 5 (mockData)
```

**Cause:** Session exceeded 30 minutes with mocks still present

**Solution:**
1. Replace mock with real service call immediately:
```javascript
// REMOVE THIS:
const mockData = [{id: 1, name: 'Test'}];

// REPLACE WITH:
const data = await fetch('https://real-api.com/users');
```

2. If real service unavailable, end session and document blocker:
```
Use framework prompt F (BLOCKED) to document the issue
```

### 3. Scope Exceeded

**Error:**
```
✗ SCOPE VIOLATION DETECTED!
Too many files: 7 > 5
```

**Cause:** Trying to change more than 5 files in one session

**Solution:**
1. Identify essential changes for current goal
2. Revert non-essential files:
```bash
git status  # See all changed files
git checkout -- non-essential-file.js
```
3. Complete current session, then start new one for additional changes

### 4. DRS Not Improving

**Symptom:** DRS stuck below 50 after multiple sessions

**Common Causes:**
- No real services connected
- Missing tests
- No error handling
- Stale evidence

**Diagnostic:**
```bash
./drs-calculate.sh
# Review breakdown to identify weak areas
```

**Solutions by Component:**

**Contracts (0/20):**
```bash
# Define your contracts
echo "CREATE TABLE users (id INT);" > db/schema.sql
./check-contracts.sh  # Initialize hashes
```

**Real Services (0/20):**
```javascript
// Connect to real endpoint
const response = await fetch('https://real-api.com');
./capture-evidence.sh api https://real-api.com GET
```

**Tests (0/15):**
```javascript
// Add real integration tests
test('connects to database', async () => {
  const conn = await db.connect();
  expect(conn).toBeDefined();
});
```

### 5. Claude Not Following Framework

**Symptom:** Claude ignores framework rules

**Solution:**
Always start sessions with:
```
I'm using the AI Development Control Framework.
MANDATORY: Read CLAUDE.md and Claude-template/code.md
Run ./run-check.sh continue
```

If Claude still doesn't comply:
```
STOP. You must follow the AI Development Control Framework.
Read CLAUDE.md again. The framework is MANDATORY.
Show me the current DRS and pattern selection.
```

### 6. Evidence Capture Failing

**Error:**
```
Failed to capture evidence
```

**Common Causes:**
- Endpoint unreachable
- Invalid URL format
- Network issues

**Solution:**
```bash
# Test endpoint manually first
curl https://your-api.com/endpoint

# Then capture evidence
./capture-evidence.sh api https://your-api.com/endpoint GET

# For authentication:
export AUTH_TOKEN="your-token"
curl -H "Authorization: Bearer $AUTH_TOKEN" https://your-api.com
```

### 7. Scripts Not Running (Windows)

**Error:**
```
'./scripts/check-contracts.sh' is not recognized
```

**Solution for Windows:**

**Option 1: Use Git Bash**
```bash
# Install Git for Windows (includes Git Bash)
# Run all commands in Git Bash terminal
```

**Option 2: Use WSL**
```powershell
# Install WSL
wsl --install

# Run framework in WSL
wsl
cd /mnt/c/your-project
./scripts/check-contracts.sh
```

**Option 3: Use wrapper script**
```bash
# Use the cross-platform wrapper
./run-check.sh contracts
./run-check.sh drs
./run-check.sh continue
```

### 8. Git Hooks Not Triggering

**Symptom:** Commits succeed despite violations

**Solution:**
```bash
# Verify hook exists and is executable
ls -la .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Test hook manually
./.git/hooks/pre-commit

# If using Windows, ensure line endings are correct
dos2unix .git/hooks/pre-commit
```

### 9. Session State Lost

**Symptom:** Claude doesn't remember previous session

**Solution:**
1. Ensure handoff was created:
```bash
ls handoff*.md
cat handoff.txt
```

2. Start new session with:
```
Resume work following the AI Development Control Framework.
Read handoff.txt and Claude-template/code.md
Continue from where we left off.
```

### 10. Confidence Level Issues

**Claude says:** "Confidence: LOW, need human guidance"

**Solution:**
Use framework prompt I (UNCERTAINTY):
```
I need human guidance per the framework.
[Claude will present specific options]

Choose option A: [describe your choice]
```

## Performance Issues

### Scripts Running Slowly

**Optimize with caching:**
```bash
# Create cache directory
mkdir -p .framework-cache

# Modify scripts to use cache
# Example in check-contracts.sh:
CACHE_FILE=".framework-cache/contracts-$(date +%Y%m%d)"
if [ -f "$CACHE_FILE" ] && [ $(find "$CACHE_FILE" -mmin -10) ]; then
    cat "$CACHE_FILE"
else
    # Run check and cache result
    check_contracts > "$CACHE_FILE"
    cat "$CACHE_FILE"
fi
```

### Large Repository Performance

**For repos with many files:**
```bash
# Create .frameworkignore
cat > .frameworkignore << EOF
node_modules/
dist/
build/
*.log
*.tmp
EOF

# Modify detect-mocks.sh to respect ignore file
grep -r "mock" --exclude-dir={node_modules,dist,build} src/
```

## Emergency Procedures

### Complete Framework Reset

**When everything is broken:**
```bash
# Backup current state
cp -r Claude-template Claude-template.backup
cp .drs-* backup/

# Reset framework
rm -f .contract-hashes
rm -f .drs-score
rm -f .drs-history
echo "0" > .drs-score

# Reinitialize
./scripts/check-contracts.sh
echo "Framework reset complete"
```

### Rollback After Bad Deploy

**If production breaks after deploying at DRS 85:**
```bash
# Immediate rollback
git revert HEAD
./deploy-rollback.sh

# Analyze what went wrong
./scripts/drs-calculate.sh --verbose > drs-analysis.txt
./scripts/can-i-continue.sh > safety-check.txt

# Document lessons learned
echo "Deployment failed despite DRS 85 because..." >> lessons-learned.md
```

## Debug Mode

### Enable Verbose Output

**Create debug wrapper:**
```bash
#!/bin/bash
# debug-framework.sh
set -x  # Enable debug output
export FRAMEWORK_DEBUG=1

echo "=== CONTRACT CHECK ==="
./scripts/check-contracts.sh

echo "=== MOCK DETECTION ==="
./scripts/detect-mocks.sh

echo "=== SCOPE CHECK ==="
./scripts/check-scope.sh

echo "=== DRS CALCULATION ==="
./scripts/drs-calculate.sh

echo "=== SAFETY CHECK ==="
./scripts/can-i-continue.sh

set +x
```

## Getting Help

### Quick Diagnosis
```bash
# Run full validation suite
./validate-framework.sh

# Check everything at once
./run-check.sh all > framework-diagnosis.txt 2>&1
```

### Community Support
- GitHub Issues: [Report bugs](https://github.com/ai-control-framework/issues)
- Discord: [Get real-time help](https://discord.gg/ai-control)
- Stack Overflow: Tag with `ai-control-framework`

### Providing Debug Information

When reporting issues, include:
```bash
# Generate debug report
cat > debug-report.txt << EOF
Framework Version: $(cat VERSION)
OS: $(uname -a)
Git Version: $(git --version)
Current DRS: $(cat .drs-score)
Session Duration: $(stat -c %Y Claude-template/code.md)

Recent Commands:
$(history | tail -20)

Error Output:
$(./run-check.sh all 2>&1)

Directory Structure:
$(ls -la)
$(ls -la scripts/)
$(ls -la Claude-template/)
EOF
```

## Prevention Tips

### Before Starting Any Session
1. Run `./validate-framework.sh` weekly
2. Ensure real services are accessible
3. Clear old evidence: `rm -f evidence/*.json`
4. Check git status is clean

### During Sessions
1. Run `./run-check.sh continue` every 15 minutes
2. Commit working code frequently
3. Update progress.md regularly
4. Capture evidence proactively

### After Sessions
1. Always create handoff: `./run-check.sh handoff`
2. Commit session state
3. Document any blockers
4. Plan next session's goal

---

*Remember: The framework is designed to fail fast and fail loud. Errors are good - they prevent bad code from reaching production.*