# AI Framework MCP Server v2.0

**Complete MCP integration exposing all 24 AI Framework prompts with enhanced Claude-optimized outputs**

## 🎯 Overview

The AI Framework MCP Server provides:
- **24 Framework Prompts** accessible as MCP tools
- **Claude-Optimized Outputs** with rich context and implementation guidance
- **DRS Calculation** across 13 validation components
- **Setup Capability** for non-Kiro environments (Claude Code, etc.)
- **Smart Recommendations** based on project state

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- TypeScript 5.0+
- MCP-compatible IDE (Kiro, VSCode with MCP extension, Claude Code)

### Installation

```bash
# 1. Navigate to the MCP server directory
cd ai-framework-mcp-server

# 2. Install dependencies
npm install

# 3. Build the server
npm run build

# 4. Test the server
npm test

# Install dependencies
npm install

# Build the server
npm run build

# Verify installation (optional)
node verify-installation.js
```

### Configuration in Kiro

#### Workspace Configuration

### Configuration

#### For Kiro IDE

Create `.kiro/settings/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "ai-framework": {
      "command": "node",
      "args": ["./ai-framework-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

#### For Claude Code / Other MCP-Compatible Tools

Add to your MCP configuration:

```json
{
  "name": "ai-framework",
  "command": "node",
  "args": ["path/to/ai-framework-mcp-server/dist/index.js"]
}
```

## 📋 All 24 Framework Prompts

The MCP server exposes all 24 framework prompts as tools:

### Session Management
- **start** - Initialize NEW session (first time only)
- **resume** - Re-enter EXISTING session (use every return)
- **set_context** - Load framework rules into context
- **handoff** - Properly end session with state capture

### Planning & Decision
- **assess** - Full project analysis with DRS score
- **decide** - Get next optimal action based on state
- **plan** - Plan implementation approach
- **select_pattern** - Choose best implementation pattern

### Development Actions
- **enhance** - Add new features with scope control
- **correct** - Fix bugs with minimal changes
- **debug** - Enter debug mode for troubleshooting

### Validation & Compliance
- **verify** - Check all 13 validation components
- **evidence** - Capture functionality proof
- **checkpoint** - Validate time gate requirements

### Deployment
- **deploy_decide** - Check if ready (DRS≥85)
- **deploy** - Execute deployment procedures
- **pr** - Create pull request with context

### Problem Resolution
- **blocked** - Handle blockers systematically
- **decline** - DRS recovery procedures
- **uncertainty** - Request human guidance
- **emergency** - Contract change request (LAST RESORT)

### Setup (Non-Kiro Environments)
- **setup** - Create all framework files
- **init_requirements** - Create requirements.md
- **init_design** - Create design.md
- **init_tasks** - Create tasks.md

## 🔄 Common Workflows

### First Time Setup (Claude Code/Non-Kiro)
```javascript
// Create framework files
await execute("setup", { projectName: "my-app" });
// Start first session
await execute("start");
// Load rules
await execute("set_context");
```

### Returning to Work
```javascript
// ALWAYS use resume, not start
await execute("resume");
// Check current state
await execute("assess");
// Get next action
await execute("decide");
```

### Every 30 Minutes
```javascript
// Check time gates
await execute("checkpoint");
// Capture evidence
await execute("evidence");
// Verify compliance
await execute("verify");
```

### Before Deployment
```javascript
// Check readiness
const ready = await execute("deploy_decide");
if (ready.status === "GREEN") {
  await execute("deploy");
  await execute("pr");
}
```

## 📊 DRS Components (100 Points Total)

| Component | Points | What It Checks |
|-----------|--------|----------------|
| Security Validation | 16 | Vulnerabilities, secrets, compliance |
| Production Readiness | 14 | Deployment, monitoring, rollback |
| Data Integrity | 9 | Transactions, business rules, audit |
| Integration Evidence | 9 | E2E tests, real API calls |
| Contract Integrity | 7 | Interface stability, hashes |
| Behavioral Contracts | 7 | Module behaviors, invariants |
| No Mocks | 7 | Real service usage after 30min |
| Tests Passing | 7 | Automated test suites |
| Architecture Stability | 7 | Structure, dependencies |
| Context Preservation | 7 | ADRs, naming, patterns |
| Error Handling | 4 | Graceful failures, recovery |
| Scope Compliance | 4 | ≤5 files, ≤200 LOC |
| Documentation | 2 | Comments, README updates |

**Deployment Gate: DRS ≥ 85**

## 📦 Output Formats

All prompts return enhanced, Claude-optimized outputs with:

### Structured Sections
```markdown
## Current State
[Project analysis with DRS, violations, evidence]

## Recommended Action
[Specific next step with implementation guidance]

## Success Criteria
[Measurable outcomes to achieve]

## Validation Steps
[How to verify success]
```

### Example Response
```json
{
  "frameworkState": {
    "drsScore": 85,
    "projectState": "DEVELOPMENT",
    "sessionMode": "ENHANCEMENT", 
    "completionPercentage": 75,
    "timeRemaining": 45,
    "confidence": "HIGH",
    "frameworkCompliance": true
  },
  "analysis": {
    "recommendations": ["Use R. ENHANCE to plan enhancement safely"],
    "frameworkViolations": [],
    "criticalPath": ["Complete current enhancement"],
    "reasoning": "Project state: ENHANCEMENT (DRS: 85, Progress: 75%)"
  },
  "evidence": {
    "lastUpdate": "2024-12-19T16:30:00Z",
    "evidenceCount": 3,
    "evidenceAge": 45
  }
}
```

### Prompt Selection Response

```json
{
  "selectedPrompt": {
    "id": "R_ENHANCE",
    "name": "Context-Aware Enhancement Handler",
    "purpose": "Handle new enhancements while maintaining framework discipline",
    "template": "R. ENHANCE — Context-Aware Enhancement Handler..."
  },
  "selection": {
    "reason": "Enhancement mode - plan new features with framework discipline",
    "confidence": "HIGH",
    "frameworkCompliance": true
  },
  "alternatives": [
    {"id": "P_ASSESS", "name": "Comprehensive Project Assessment"},
    {"id": "E_VERIFY", "name": "Verify Work"}
  ],
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

## Error Handling

The MCP server provides robust error handling:

- **Missing Project Files**: Graceful fallback to defaults
- **Invalid Prompt IDs**: Clear error messages
- **Framework State Errors**: Safe default responses
- **Non-existent Paths**: Automatic path detection

## Development

### Running Tests

```bash
npm test                    # All tests
npm test -- --testPathPattern=integration  # Core functionality only
```

### Building

```bash
npm run build              # Compile TypeScript
npm run dev                # Watch mode for development
```

## Troubleshooting

### Common Issues

1. **"No framework files found"**
   - Ensure `orchestration.md` and `tasks.md` exist in your project
   - Check that files are in expected locations (root, `.ai-framework/`, or `docs/`)

2. **"DRS calculation failed"**
   - Verify project structure and file permissions
   - Check that git is available for scope analysis

3. **"Prompt template not found"**
   - Use valid prompt IDs: P_ASSESS, Q_DECIDE, R_ENHANCE, S_CORRECT, T_DEPLOY_DECIDE
   - Ensure prompt is available for current context

### Debug Mode

Set environment variable for detailed logging:
```bash
FASTMCP_LOG_LEVEL=DEBUG node dist/index.js
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the ai-framework documentation
3. Verify your project follows ai-framework structure

---

**Remember**: The MCP server enforces ai-framework discipline automatically. All recommendations maintain DRS focus, time gate awareness, and framework compliance.