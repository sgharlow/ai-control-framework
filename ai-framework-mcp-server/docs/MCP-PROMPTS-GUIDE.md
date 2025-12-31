# AI Framework MCP Server - Complete Prompt Guide

## Overview
The AI Framework MCP Server provides direct access to all framework prompts as intuitive, cleanly-named tools. Each prompt can be invoked with real-time context and parameters, enabling a complete development workflow through MCP.

## Essential Prompts Quick Reference

| Situation | Command | What It Does |
|-----------|---------|--------------|
| **Starting work** | `start` | Initialize session with framework |
| **Unsure of state** | `assess` | Get comprehensive project analysis |
| **Don't know what's next** | `decide` | Get recommended next action |
| **Adding features** | `enhance` | Plan enhancement safely |
| **Fixing bugs** | `correct` | Debug with minimal scope |
| **Check compliance** | `verify` | Audit framework compliance |
| **Generate proof** | `evidence` | Create evidence files |
| **Ready to deploy?** | `deploy_decide` | Assess deployment readiness |
| **Actually deploy** | `deploy` | Execute deployment |
| **End session** | `handoff` | Properly close session |

## Complete Prompt Reference

### Session Management

#### START - Initialize Session
```javascript
mcp.execute("start", {
  projectPath: "/path/to/project"  // optional
});
```
- Loads orchestration.md
- Verifies contract hash
- Sets first gate (30m)
- Declares initial confidence

#### SET_CONTEXT - Rules of Engagement
```javascript
mcp.execute("set_context", {
  projectPath: "/path/to/project"
});
```
- Reviews orchestration.md compliance
- Checks PATTERNS.md requirement
- Ensures contracts are frozen
- Declares confidence levels

#### RESUME - Re-enter Safely
```javascript
mcp.execute("resume", {
  projectPath: "/path/to/project"
});
```
- Runs can-i-continue check
- Calculates DRS score
- Verifies no contract changes
- Identifies applicable patterns
- Computes partial progress

#### HANDOFF - End Session
```javascript
mcp.execute("handoff", {
  projectPath: "/path/to/project"
});
```
- Generates session summary
- Updates orchestration.md
- Creates handoff document
- Lists next actions

### Assessment & Decision

#### ASSESS - Comprehensive Project Assessment
```javascript
mcp.execute("assess", {
  projectPath: "/path/to/project"
});
```
Returns:
- Project Health: [EXCELLENT/GOOD/CONCERNING/BLOCKED]
- DRS Score: X/100
- Completion: X%
- Recommended Action with time estimate
- Specific blockers list

#### DECIDE - Automatic Next Action Selection
```javascript
mcp.execute("decide", {
  projectPath: "/path/to/project"
});
```
Returns:
- Situation Analysis
- Recommended Mode
- Next Action with acceptance criteria
- Pattern to Apply
- Time/DRS Impact estimates

### Development Actions

#### PLAN - Smallest Next Win
```javascript
mcp.execute("plan", {
  projectPath: "/path/to/project"
});
```
- Identifies highest DRS impact action
- Estimates time and scope
- Recommends applicable pattern

#### ENHANCE - Context-Aware Enhancement
```javascript
mcp.execute("enhance", {
  projectPath: "/path/to/project",
  feature: "user authentication system",  // REQUIRED
  scope_estimate: {
    files: 3,
    loc: 150
  }
});
```
- Analyzes enhancement scope
- Checks framework compliance impact
- Plans evidence capture points
- Validates against limits (≤5 files, ≤200 LOC)

#### CORRECT - Debug with Minimal Scope
```javascript
mcp.execute("correct", {
  projectPath: "/path/to/project",
  issue: "login timeout error",  // REQUIRED
  severity: "high"  // critical/high/medium/low
});
```
- Analyzes root cause
- Plans minimal fix strategy
- Ensures no scope creep
- Adds regression test requirement

#### DEBUG - Fix Without Scope Creep
```javascript
mcp.execute("debug", {
  projectPath: "/path/to/project",
  issue: "database connection failure"  // optional
});
```
- Enters DEBUGGER mode
- Enforces minimum change rule
- Requires regression test

### Verification & Compliance

#### VERIFY - Compliance Audit
```javascript
mcp.execute("verify", {
  projectPath: "/path/to/project"
});
```
Checks:
- orchestration.md compliance
- tasks.md real service connections
- todos.md mock expiration
- deploy.md gate status
- DRS ≥ 85 requirement

#### EVIDENCE - Generate Proof
```javascript
mcp.execute("evidence", {
  projectPath: "/path/to/project"
});
```
Captures:
- Real service connection proof
- Integration correlation IDs
- Negative test evidence
- Performance metrics

#### CHECKPOINT - Time Gate Validation
```javascript
mcp.execute("checkpoint", {
  projectPath: "/path/to/project"
});
```
Validates:
- 30min: Real services connected?
- 60min: Working demo slice?
- 90min: DRS improving?
- 120min: Deploy-ready?

### Deployment

#### DEPLOY_DECIDE - Deployment Decision
```javascript
mcp.execute("deploy_decide", {
  projectPath: "/path/to/project"
});
```
Returns:
- Deployment Status: [GREEN/YELLOW/RED]
- Gate Status (Framework/Technical/Quality)
- Blockers list
- Recommended Action
- Risk Assessment

#### DEPLOY - Execute Deployment
```javascript
mcp.execute("deploy", {
  projectPath: "/path/to/project"
});
```
- Requires DRS ≥ 85
- Runs deploy-check
- Executes production deployment
- Provides rollback plan

#### PR - Generate Pull Request
```javascript
mcp.execute("pr", {
  projectPath: "/path/to/project",
  pr_title: "Feature: Add user authentication"  // optional
});
```
- Creates PR with framework compliance
- Includes evidence links
- Shows DRS score
- Adds review hints

### Recovery & Support

#### BLOCKED - Handle Hard Stops
```javascript
mcp.execute("blocked", {
  projectPath: "/path/to/project",
  blocker_description: "Contract hash mismatch detected"  // optional
});
```
- Diagnoses blockers
- Runs can-i-continue check
- Identifies required external actions
- Files CCR if needed

#### DECLINE - DRS Degradation Response
```javascript
mcp.execute("decline", {
  projectPath: "/path/to/project"
});
```
- Shows DRS trend
- Enters recovery mode
- Targets DRS ≥ 85 in 15 minutes
- Stops new work until recovery

#### UNCERTAINTY - Request Human Guidance
```javascript
mcp.execute("uncertainty", {
  projectPath: "/path/to/project",
  uncertainty: "Which pattern to apply for microservice integration?"  // optional
});
```
- Declares LOW confidence
- Presents specific question
- Provides options with estimates
- Sets 5-minute default action

## Complete Development Workflows

### 1. Starting New Work
```javascript
// Initialize session
const start = await mcp.execute("start");

// Assess current state
const assessment = await mcp.execute("assess");

// Decide next action
const decision = await mcp.execute("decide");
```

### 2. Resuming Existing Work
```javascript
// Resume safely
const resume = await mcp.execute("resume");

if (resume.canContinue) {
  // Plan next action
  const plan = await mcp.execute("plan");
} else {
  // Handle blockers
  const blocked = await mcp.execute("blocked");
}
```

### 3. Adding New Features
```javascript
// Enhance with scope check
const enhance = await mcp.execute("enhance", {
  feature: "payment processing",
  scope_estimate: { files: 4, loc: 180 }
});

// Generate evidence every 30 minutes
const evidence = await mcp.execute("evidence");

// Verify compliance
const verify = await mcp.execute("verify");
```

### 4. Debugging Issues
```javascript
// Correct with minimal scope
const correct = await mcp.execute("correct", {
  issue: "payment validation error",
  severity: "critical"
});

// Debug mode
const debug = await mcp.execute("debug");

// Update evidence
const evidence = await mcp.execute("evidence");
```

### 5. Deployment Process
```javascript
// Check deployment readiness
const deployDecision = await mcp.execute("deploy_decide");

if (deployDecision.status === "GREEN") {
  // Deploy to production
  const deploy = await mcp.execute("deploy");
  
  // Create PR
  const pr = await mcp.execute("pr", {
    pr_title: "Deploy: Feature complete with DRS 95"
  });
} else if (deployDecision.status === "YELLOW") {
  // Fix specific issues
  // Re-run deploy decision
} else {
  // Enter recovery mode
  const decline = await mcp.execute("decline");
}
```

### 6. Time-Based Checkpoints
```javascript
// Every 30 minutes
setInterval(async () => {
  // Validate time gates
  const checkpoint = await mcp.execute("checkpoint");
  
  // Generate evidence
  const evidence = await mcp.execute("evidence");
  
  // Check compliance
  const verify = await mcp.execute("verify");
}, 30 * 60 * 1000);
```

## Analysis Tools
The MCP server also provides three analysis tools:

### get_framework_state
```javascript
mcp.execute("get_framework_state", {
  projectPath: "/path/to/project"
});
```
Returns complete framework state analysis.

### select_optimal_prompt
```javascript
mcp.execute("select_optimal_prompt", {
  scenario: "enhance",  // assess/next-action/enhance/debug/deploy
  userIntent: "Add user authentication"
});
```
Recommends best prompt for current context.

### generate_contextualized_prompt
```javascript
mcp.execute("generate_contextualized_prompt", {
  promptId: "ASSESS",  // Use new naming without prefixes
  customVariables: {
    feature: "authentication"
  }
});
```
Generates prompt with injected context.

## Success Patterns

### Pattern 1: Confidence-Driven Development
```javascript
// Always check confidence
const assessment = await mcp.execute("assess");

if (assessment.confidence === "LOW") {
  // Request guidance
  const guidance = await mcp.execute("uncertainty", {
    uncertainty: assessment.primaryConcern
  });
} else {
  // Proceed with plan
  const plan = await mcp.execute("plan");
}
```

### Pattern 2: Evidence-Based Progress
```javascript
// Set 30-minute timer
setInterval(async () => {
  // Capture evidence
  await mcp.execute("evidence");
  
  // Validate gates
  await mcp.execute("checkpoint");
}, 30 * 60 * 1000);
```

### Pattern 3: Framework Compliance First
```javascript
// Before any action
const verify = await mcp.execute("verify");

if (verify.violations.length > 0) {
  // Fix violations first
  for (const violation of verify.violations) {
    await mcp.execute("blocked", {
      blocker_description: violation
    });
  }
}
```

## Critical Rules

1. **Time Gates Are Hard Limits**
   - 30min: Real services must be connected
   - 60min: Working demo slice required
   - 90min: DRS must be improving
   - 120min: Must be deploy-ready

2. **DRS ≥ 85 for Deployment**
   - Non-negotiable threshold
   - Use `decline` if dropping
   - Focus on recovery before new work

3. **Scope Limits Per Session**
   - Maximum 5 files changed
   - Maximum 200 lines of code
   - Use `enhance` to validate

4. **Evidence Every 30 Minutes**
   - Use `evidence` prompt
   - Must be < 2 hours old
   - Include real service proofs

5. **Contracts Are Frozen**
   - No changes without CCR
   - Check with `resume`
   - Stop if violated

## Installation & Setup

1. Install dependencies:
```bash
cd ai-framework-mcp-server
npm install
```

2. Build the server:
```bash
npm run build
```

3. Configure in Claude Desktop:
```json
{
  "mcpServers": {
    "ai-framework": {
      "command": "node",
      "args": ["path/to/ai-framework-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

## Command Mapping (Legacy Support)

The server maintains backward compatibility with alpha-prefixed commands:

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| A. START | `start` | Cleaner, more intuitive |
| P. ASSESS | `assess` | No confusion about sequence |
| Q. DECIDE | `decide` | Direct action word |
| R. ENHANCE | `enhance` | Clear purpose |
| S. CORRECT | `correct` | Obvious function |
| T. DEPLOY-DECIDE | `deploy_decide` | Descriptive |

All legacy commands (A, B, C... P, Q, R, S, T) still work for compatibility.

## Troubleshooting

### Common Issues

1. **"Prompt not found" error**
   - Use the new names (e.g., "start" not "prompt_a_start")
   - Check projectPath is valid

2. **"Framework state not readable"**
   - Verify ai-framework directory exists
   - Check file permissions

3. **"DRS calculation failed"**
   - Ensure framework scripts are executable
   - Check bash/PowerShell availability

4. **"Evidence too old"**
   - Run `evidence` immediately
   - Set up 30-minute timer

5. **"Confidence LOW"**
   - Use `uncertainty` for guidance
   - Review PATTERNS.md
   - Check framework compliance

## Support

For issues or questions:
- Check ai-framework/IMPLEMENTATION-GUIDE.md
- Review ai-framework/prompts.md
- Use `uncertainty` prompt for guidance