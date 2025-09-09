# Operationalization Guide for AI Development Control Framework

## Quick Start (For Users)

### 1. Install the Framework (One Time)
```bash
# Clone or download the framework templates
git clone [framework-repo] ai-control-framework
cd ai-control-framework

# Make scripts executable (Unix/Mac)
chmod +x *.sh

# For Windows users, install Git Bash or WSL
```

### 2. Initialize Your Project
```
Copy this prompt to Claude Code:

"Initialize the AI Development Control Framework for this project. 

Read all 9 template files in Claude-template/templates/ and help me populate them with project-specific values..."

[Full START prompt from CLAUDE-CODE-PROMPTS.md]
```

### 3. Begin Each Session
```
Copy this prompt to Claude Code:

"I'm using the AI Development Control Framework for disciplined, convergent development.

MANDATORY: Read these files in order..."

[Full SET CONTEXT prompt from CLAUDE-CODE-PROMPTS.md]
```

### 4. Use During Development
- **RESUME WORK** - Continue where you left off
- **NEW WORK** - Add a new feature/fix
- **VERIFY WORK** - Check framework compliance
- **BLOCKED** - Handle blockers properly
- **HANDOFF** - End session cleanly

## For Framework Publishers

### Package Structure
```
ai-control-framework/
├── README.md                          # User documentation
├── CLAUDE-CODE-PROMPTS.md           # User-facing prompts
├── FRAMEWORK-INTERNAL-BEHAVIORS.md   # AI agent behaviors
├── OPERATIONALIZATION-GUIDE.md      # This file
├── CLAUDE.md                         # Template for AI configuration
├── scripts/
│   ├── check-contracts.sh
│   ├── detect-mocks.sh
│   ├── check-scope.sh
│   ├── drs-calculate.sh
│   ├── can-i-continue.sh
│   ├── capture-evidence.sh
│   └── approve-contract-change.sh
└── Claude-template/
    ├── code.md                       # Session state template
    ├── prompts.md                    # Internal prompt reference
    └── templates/
        ├── orchestration.md
        ├── patterns.md
        ├── requirements.md
        ├── design.md
        ├── tasks.md
        ├── todos.md
        ├── progress.md
        └── deploy.md
```

### Publishing Steps

#### 1. Create GitHub Repository
```bash
# Create new repo: "ai-development-control-framework"
git init
git add .
git commit -m "Initial framework release v1.0.0"
git remote add origin [your-repo-url]
git push -u origin main
```

#### 2. Create Installation Script
```bash
#!/bin/bash
# install-framework.sh

echo "Installing AI Development Control Framework..."

# Create project structure
mkdir -p Claude-template/templates
mkdir -p scripts
mkdir -p evidence

# Copy templates
cp -r [framework-path]/Claude-template/* ./Claude-template/
cp [framework-path]/scripts/* ./scripts/
cp [framework-path]/CLAUDE.md ./

# Make scripts executable
chmod +x scripts/*.sh

# Initialize tracking files
touch .contract-hashes
touch .drs-score
touch .drs-history

echo "Framework installed successfully!"
echo "Next steps:"
echo "1. Open Claude Code"
echo "2. Use the START prompt from CLAUDE-CODE-PROMPTS.md"
```

#### 3. Create VS Code Extension (Optional)
```json
// package.json for VS Code extension
{
  "name": "ai-control-framework",
  "displayName": "AI Development Control Framework",
  "description": "Disciplined AI coding with Claude Code",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.74.0"
  },
  "contributes": {
    "commands": [
      {
        "command": "aiControl.initialize",
        "title": "AI Control: Initialize Project"
      },
      {
        "command": "aiControl.setContext",
        "title": "AI Control: Set Session Context"
      },
      {
        "command": "aiControl.verify",
        "title": "AI Control: Verify Compliance"
      }
    ],
    "configuration": {
      "title": "AI Control Framework",
      "properties": {
        "aiControl.maxFiles": {
          "type": "number",
          "default": 5,
          "description": "Maximum files per session"
        },
        "aiControl.maxLines": {
          "type": "number",
          "default": 200,
          "description": "Maximum lines per session"
        }
      }
    }
  }
}
```

### Integration with Claude Code

#### Method 1: CLAUDE.md File (Recommended)
Users place CLAUDE.md in project root. Claude Code reads it automatically on session start.

#### Method 2: Project Configuration
```json
// .claude-config.json
{
  "framework": "ai-control",
  "version": "1.0.0",
  "rules": {
    "enforceContracts": true,
    "maxFiles": 5,
    "maxLines": 200,
    "mockTimeout": 30,
    "drsTarget": 85
  },
  "scripts": {
    "preSession": "./scripts/can-i-continue.sh",
    "postChange": "./scripts/check-scope.sh",
    "preCommit": "./scripts/drs-calculate.sh"
  }
}
```

#### Method 3: Git Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Enforce framework rules before commit
./scripts/check-contracts.sh || exit 1
./scripts/detect-mocks.sh || exit 1
./scripts/check-scope.sh || exit 1

DRS=$(./scripts/drs-calculate.sh | grep "DEPLOYABILITY SCORE" | awk '{print $3}' | cut -d'/' -f1)
if [ "$DRS" -lt 70 ]; then
  echo "Error: DRS too low ($DRS/100). Must be ≥70 to commit."
  exit 1
fi
```

### Training Claude Code

#### Ideal Workflow
1. User initializes framework with START prompt
2. Claude Code reads CLAUDE.md every session
3. Internal behaviors execute automatically
4. User uses prompts for control points
5. Framework enforces discipline continuously

#### Key Messages for Users

**Pitch the Value:**
"This framework prevents 5 common AI coding failures:
- False progress through mocking (prevented by 30-min timeout)
- Architecture drift (prevented by contract freezing)  
- Scope creep (prevented by 5-file/200-line limits)
- Non-convergent work (prevented by DRS tracking)
- Breaking changes (prevented by interface locking)"

**Simple Adoption:**
"Three commands to disciplined AI development:
1. Install framework
2. Initialize with START prompt
3. Begin sessions with SET CONTEXT prompt"

**Measurable Results:**
"Know exactly when you can deploy:
- DRS < 50: Major issues
- DRS 50-70: Making progress
- DRS 70-85: Nearly ready
- DRS ≥ 85: Deploy with confidence"

### Metrics to Track

For framework improvement, track:
- Average DRS at session end
- Time to reach DRS 85
- Number of contract violations
- Mock timeout violations
- Scope exceedances
- Sessions abandoned vs completed

### Community Building

1. **Documentation Site**
   - Quick start guide
   - Video tutorials
   - Case studies
   - Pattern library expansion

2. **Discord/Slack Community**
   - #framework-help
   - #pattern-sharing
   - #success-stories
   - #feature-requests

3. **GitHub Discussions**
   - Q&A section
   - Show and tell
   - Ideas and feedback
   - Announcements

### Version Evolution

#### v1.0 (Current)
- Core framework
- 7 automation scripts
- 9 documentation templates
- 10 user prompts

#### v1.1 (Planned)
- Language-specific patterns
- Cloud deployment scripts
- CI/CD integration
- Performance benchmarks

#### v2.0 (Future)
- AI behavior learning
- Team collaboration mode
- Enterprise compliance
- Multi-agent orchestration

## Success Metrics

The framework succeeds when:
- ✅ Users reach DRS 85+ consistently
- ✅ Deploy-to-production time decreases
- ✅ Contract violations drop to near zero
- ✅ Scope creep eliminated
- ✅ Mock usage stays under 30 minutes

## Call to Action

1. **For Individual Developers:**
   "Stop wasting time on non-deployable code. Install the framework today."

2. **For Team Leads:**
   "Standardize your team's AI coding process. Measure real progress."

3. **For Organizations:**
   "Reduce AI coding waste by 70%. Track deployability, not activity."

---

*This framework transforms AI coding from hopeful iteration to disciplined engineering.*