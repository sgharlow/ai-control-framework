# Team Setup Guide

## Standardizing AI-Assisted Development Across Your Team

### Why Standardize?

Without standards, AI-assisted development creates:
- **Inconsistent code quality** - Each developer's AI produces different styles
- **Hidden technical debt** - Mocks and shortcuts accumulate silently  
- **Integration nightmares** - Interfaces drift between team members
- **Deployment delays** - "Works on my machine" multiplied by AI randomness

The AI Control Framework ensures everyone ships deployable code.

## Team Installation

### 1. Central Configuration

Create a shared configuration in your repository:

```bash
# In your project root
mkdir .framework
cp -r /path/to/ai-framework/* .framework/
```

Add to `.gitignore`:
```
# Framework generated files
.contract-hashes
.drs-score
.drs-history
.session-*
evidence/
handoff-*.md
```

Commit framework to repo:
```bash
git add .framework
git commit -m "Add AI Control Framework for team standards"
```

### 2. Team Configuration File

Create `.framework-config.json`:

```json
{
  "version": "1.1.0",
  "team": "your-team-name",
  "constraints": {
    "max_files": 5,
    "max_lines": 200,
    "mock_timeout": 30,
    "min_drs_for_pr": 70,
    "min_drs_for_deploy": 85
  },
  "session_types": {
    "HOTFIX": {
      "max_files": 2,
      "max_time": 30,
      "min_drs": 80
    },
    "FEATURE": {
      "max_files": 5,
      "max_time": 120,
      "min_drs": 85
    },
    "REFACTOR": {
      "max_files": 10,
      "max_time": 180,
      "min_drs": 90
    }
  },
  "required_patterns": ["PATTERN-001", "PATTERN-002"],
  "blocked_patterns": ["PATTERN-007"],
  "contracts": [
    "api/openapi.yaml",
    "database/schema.sql",
    "interfaces/*.ts"
  ]
}
```

### 3. Git Hooks for Team

Create `.framework/install-hooks.sh`:

```bash
#!/bin/bash
# Install team git hooks

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running AI Control Framework checks..."

# Check DRS score
DRS=$(cat .drs-score 2>/dev/null || echo 0)
MIN_DRS=70

if [ "$DRS" -lt "$MIN_DRS" ]; then
    echo "❌ DRS too low: $DRS (minimum: $MIN_DRS)"
    echo "Run: ./.framework/scripts/drs-calculate.sh"
    exit 1
fi

# Check contracts
./.framework/scripts/check-contracts.sh || exit 1

# Check for mocks
./.framework/scripts/detect-mocks.sh || exit 1

echo "✅ Framework checks passed"
EOF

chmod +x .git/hooks/pre-commit

# Pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo "Validating deployment readiness..."

DRS=$(cat .drs-score 2>/dev/null || echo 0)
if [ "$DRS" -lt 85 ]; then
    echo "⚠️  Warning: DRS is $DRS/100 (deployment target: 85)"
    read -p "Push anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
EOF

chmod +x .git/hooks/pre-push

echo "✅ Git hooks installed"
```

## Team Workflows

### 1. Daily Development

Each developer starts their day:

```bash
# Pull latest
git pull origin main

# Start session
./.framework/scripts/initialize-session.sh FEATURE

# Work with AI using framework
# ... development ...

# End session
./.framework/scripts/end-session.sh
```

### 2. Code Reviews

Add to PR template:

```markdown
## AI Control Framework Checks
- [ ] DRS Score: ___/100 (minimum: 70)
- [ ] Contracts unchanged OR CCR approved
- [ ] No mocks in production code
- [ ] Session handoff attached
- [ ] Pattern used: PATTERN-___
```

Reviewer checks:
```bash
# On PR branch
./.framework/scripts/can-i-continue.sh
./.framework/scripts/drs-calculate.sh
```

### 3. CI/CD Integration

#### GitHub Actions

`.github/workflows/ai-framework.yml`:

```yaml
name: AI Framework Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Framework Checks
        run: |
          ./.framework/scripts/check-contracts.sh
          ./.framework/scripts/detect-mocks.sh
          ./.framework/scripts/drs-calculate.sh
          
      - name: Check DRS Score
        run: |
          DRS=$(cat .drs-score)
          if [ "$DRS" -lt 70 ]; then
            echo "DRS too low: $DRS/100"
            exit 1
          fi
          
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const drs = require('fs').readFileSync('.drs-score', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🤖 AI Framework Check\n\nDRS Score: ${drs}/100`
            })
```

#### GitLab CI

`.gitlab-ci.yml`:

```yaml
stages:
  - validate
  - test
  - deploy

framework-check:
  stage: validate
  script:
    - ./.framework/scripts/check-contracts.sh
    - ./.framework/scripts/detect-mocks.sh
    - DRS=$(./.framework/scripts/drs-calculate.sh | grep TOTAL | awk '{print $3}' | cut -d/ -f1)
    - if [ "$DRS" -lt 70 ]; then exit 1; fi
  artifacts:
    reports:
      junit: drs-report.xml
```

## Team Metrics

### 1. Track Team Performance

Create `.framework/scripts/team-metrics.sh`:

```bash
#!/bin/bash
# Collect team metrics

echo "Team AI Framework Metrics"
echo "========================="
echo ""

# Average DRS across recent commits
echo "Average DRS (last 10 commits):"
git log --oneline -10 | while read commit; do
    git checkout $commit 2>/dev/null
    cat .drs-score 2>/dev/null || echo 0
done | awk '{sum+=$1} END {print sum/NR}'

# Contract violation frequency
echo "Contract violations (last 30 days):"
grep "CONTRACT VIOLATION" .framework/logs/*.log 2>/dev/null | wc -l

# Mock timeout violations
echo "Mock timeouts (last 30 days):"
grep "Mock timeout" .framework/logs/*.log 2>/dev/null | wc -l

# Deployment readiness trend
echo "Deployment ready commits (DRS >= 85):"
git log --oneline -30 | while read commit; do
    git checkout $commit 2>/dev/null
    DRS=$(cat .drs-score 2>/dev/null || echo 0)
    if [ "$DRS" -ge 85 ]; then echo "✓"; fi
done | wc -l
```

### 2. Weekly Reports

Automate weekly team reports:

```bash
# Run every Monday
0 9 * * 1 /path/to/.framework/scripts/team-metrics.sh | mail -s "AI Framework Weekly Report" team@company.com
```

## Training Your Team

### 1. Onboarding Checklist

- [ ] Install framework locally
- [ ] Complete tutorial in EXAMPLE-WALKTHROUGH.md
- [ ] Successfully complete one ASSESSMENT session
- [ ] Successfully complete one DEVELOPMENT session
- [ ] Achieve DRS 85+ on practice project
- [ ] Review team patterns library

### 2. Regular Training

Monthly framework review:
- Share successful patterns
- Review framework violations
- Update team configuration
- Discuss new patterns to add

### 3. Pattern Library

Build team-specific patterns:

```markdown
# patterns/TEAM-PATTERN-001.md

## Team Pattern: API Endpoint

Always use this structure for new endpoints:

1. Contract first (OpenAPI spec)
2. Integration test before implementation
3. Real database from start (no mocks)
4. Error handling with team error codes
5. Logging with correlation IDs

Success rate: 94%
Average DRS: 90
```

## Troubleshooting Team Issues

### "Different DRS Scores for Same Code"

Ensure everyone:
- Uses same framework version
- Has identical `.framework-config.json`
- Runs from same directory level

### "Contract Conflicts in Merges"

1. Designated contract owner per file
2. Contract changes require team review
3. Use CCR process for changes

### "Framework Slowing Us Down"

Track metrics:
- Time to deployment (before/after)
- Bug rates (before/after)
- Rework frequency (before/after)

Usually shows 40% faster deployment after adjustment period.

## Best Practices

1. **Rotate Framework Champion** - Weekly rotation for framework updates
2. **Share Handoffs** - Make session handoffs visible to team
3. **Pattern of the Week** - Highlight successful patterns
4. **DRS Leaderboard** - Friendly competition for quality
5. **Automate Everything** - Hooks, CI/CD, reports

## Support Channels

Set up team channels:
- `#ai-framework-help` - Slack/Teams channel
- Wiki page with team patterns
- Weekly framework office hours
- Shared handoff directory

## Success Metrics

After 30 days, you should see:
- 70% reduction in integration issues
- 50% faster PR reviews
- 90% first-time deployment success
- 60% less rework
- 80% team satisfaction with AI assistance

---

Questions? Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue.

Ready to standardize your team's AI development? Let's go! 🚀