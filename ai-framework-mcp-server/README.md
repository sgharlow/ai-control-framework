# AI Framework MCP Server v2.0

**Intelligent prompt selection and comprehensive validation for ai-framework development**

## Overview

The AI Framework MCP Server provides intelligent, context-aware prompt recommendations with comprehensive framework coverage. It analyzes your project state across **13 validation components**, detects framework violations, and recommends optimal actions with real-time project context and comprehensive security, data integrity, and production readiness assessment.

## Features

### 🎯 Core MCP Tools

1. **get_framework_state** - Complete project analysis with DRS, violations, and recommendations
2. **select_optimal_prompt** - Context-aware prompt selection for 5 development scenarios  
3. **generate_contextualized_prompt** - Dynamic prompt generation with project context

### 🔒 Comprehensive AI-Framework Compliance

- **13-Component DRS**: Complete deployability assessment across all validation areas
- **Security Validation**: Vulnerability scanning, compliance checking, secret detection
- **Data Integrity**: Transaction safety, business rule validation, audit trails
- **Production Readiness**: Environment validation, resource management, operational readiness
- **Context Preservation**: ADR tracking, naming consistency, pattern adherence
- **Time Gate Enforcement**: Hard limits respected and reported
- **Framework Violations**: Detected, prioritized, and addressed across all 13 problem areas
- **Confidence Declaration**: Every analysis includes confidence + reasoning
- **Evidence-Based**: Real service connections, evidence freshness tracking

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- TypeScript 5.0+
- An ai-framework project with `orchestration.md` and `tasks.md`

### Installation

```bash
cd ai-framework-mcp-server
npm install
npm run build
```

### Configuration in Kiro

Add to your `mcp.json` configuration:

```json
{
  "mcpServers": {
    "ai-framework": {
      "command": "node",
      "args": ["path/to/ai-framework-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false,
      "autoApprove": [
        "get_framework_state",
        "select_optimal_prompt", 
        "generate_contextualized_prompt"
      ]
    }
  }
}
```

## Usage Guide

### 1. Project State Analysis

Get comprehensive analysis of your ai-framework project:

```
Tool: get_framework_state
Parameters: 
  - projectPath: "/path/to/your/project" (optional)
```

**Returns:**
- Current DRS score and project state
- Framework violations and recommendations
- Evidence freshness and compliance status
- Critical path items and next actions

### 2. Optimal Prompt Selection

Get context-aware prompt recommendations:

```
Tool: select_optimal_prompt
Parameters:
  - scenario: "assess" | "next-action" | "enhance" | "debug" | "deploy"
  - projectPath: "/path/to/your/project" (optional)
  - userIntent: "What you want to accomplish" (optional)
```

**Scenarios:**
- **assess** - Project state assessment (uses P. ASSESS)
- **next-action** - Next development step (uses Q. DECIDE)
- **enhance** - Feature enhancement (uses R. ENHANCE)
- **debug** - Issue debugging (uses S. CORRECT)
- **deploy** - Deployment readiness (uses T. DEPLOY-DECIDE)

### 3. Contextualized Prompt Generation

Generate prompts with your project context:

```
Tool: generate_contextualized_prompt
Parameters:
  - promptId: "P_ASSESS" | "Q_DECIDE" | "R_ENHANCE" | "S_CORRECT" | "T_DEPLOY_DECIDE"
  - projectPath: "/path/to/your/project" (optional)
  - customVariables: { "key": "value" } (optional)
```

**Available Prompts:**
- **P_ASSESS** - Comprehensive project state analysis
- **Q_DECIDE** - Automatic next action selection
- **R_ENHANCE** - Context-aware enhancement handler
- **S_CORRECT** - Debugging and correction context
- **T_DEPLOY_DECIDE** - Intelligent deployment decision

## Example Workflows

### Starting a Development Session

1. **Assess Current State**
   ```
   select_optimal_prompt(scenario: "assess")
   ```
   → Recommends P. ASSESS for project analysis

2. **Get Contextualized Guidance**
   ```
   generate_contextualized_prompt(promptId: "P_ASSESS")
   ```
   → Returns P. ASSESS with current DRS, violations, and recommendations

### During Development

1. **Determine Next Action**
   ```
   select_optimal_prompt(scenario: "next-action", userIntent: "Add new feature")
   ```
   → Recommends appropriate prompt based on project state

2. **Handle Issues**
   ```
   select_optimal_prompt(scenario: "debug", userIntent: "Fix validation error")
   ```
   → Recommends S. CORRECT with debugging context

### Before Deployment

1. **Check Deployment Readiness**
   ```
   select_optimal_prompt(scenario: "deploy")
   ```
   → Recommends T. DEPLOY-DECIDE with readiness assessment

## Framework Integration

### Project Structure Expected

```
your-project/
├── orchestration.md          # Session control and framework state
├── tasks.md                  # Task list and completion tracking
├── evidence/                 # Evidence files (< 2h old)
│   ├── api-connection.log
│   └── integration-test.json
└── .drs-score               # Current deployability rating
```

### Framework Files Detected

The MCP server automatically detects framework files in these locations:
- `orchestration.md`, `tasks.md` in project root
- `.ai-framework/orchestration.md`, `.ai-framework/tasks.md`
- `docs/orchestration.md`, `docs/tasks.md`
- `evidence/` directory for proof files

## Response Formats

### Framework State Response

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