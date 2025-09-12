# AI Framework MCP Server Integration Guide

**Intelligent prompt selection for ai-framework development**

## Overview

The AI Framework MCP Server provides context-aware prompt recommendations that automatically maintain ai-framework discipline. It analyzes your project state and recommends optimal prompts with real-time context injection.

## Key Benefits

### 🎯 Intelligent Guidance
- **Context-Aware**: Prompts adapt to your current project state
- **Framework Compliant**: All recommendations maintain ai-framework discipline  
- **Evidence-Based**: Decisions based on actual project data
- **Time-Aware**: Respects session time gates and deadlines

### 🔒 Framework Discipline Maintained
- **DRS-Focused**: Every decision considers deployability score
- **Violation Detection**: Automatically identifies framework violations
- **Scope Enforcement**: Ensures compliance with session limits
- **Confidence Declaration**: Every analysis includes confidence + reasoning

## Integration with AI Framework Prompts

### Enhanced Prompt Selection

The MCP server intelligently selects from the enhanced prompt set (A-T):

**Original Prompts (A-O)**: Core framework operations
- A. START, B. SET CONTEXT, C. RESUME, etc.

**Enhanced Prompts (P-T)**: Context-aware scenario handling
- **P. ASSESS** - Comprehensive project state analysis
- **Q. DECIDE** - Automatic next action selection
- **R. ENHANCE** - Context-aware enhancement handler
- **S. CORRECT** - Debugging and correction context
- **T. DEPLOY-DECIDE** - Intelligent deployment decision

### Automatic Context Injection

When you use the MCP server, prompts automatically include:

```
Current Project Context:
- DRS Score: 85/100
- Project State: ENHANCEMENT
- Completion: 75%
- Time Remaining: 45 minutes
- Session Mode: ENHANCEMENT
- Framework Compliance: YES

⚠️ FRAMEWORK VIOLATIONS DETECTED:
- Evidence 90min old, exceeds 2h limit

RECOMMENDED ACTIONS:
- Use K. EVIDENCE to refresh proof captures
- Use R. ENHANCE to plan enhancement safely
- Use E. VERIFY to maintain compliance
```

## Usage Scenarios

### 1. Starting a Development Session

**Without MCP Server:**
```
1. Manually check orchestration.md
2. Calculate DRS score
3. Assess project state
4. Choose appropriate prompt
5. Manually inject context
```

**With MCP Server:**
```
1. select_optimal_prompt(scenario: "assess")
2. Automatically get P. ASSESS with full context
3. Follow contextualized recommendations
```

### 2. During Enhancement Work

**Traditional Approach:**
- Manually determine if enhancement is safe
- Check scope limits and framework compliance
- Choose between multiple prompts

**MCP Server Approach:**
```
select_optimal_prompt(scenario: "enhance", userIntent: "Add batch processing")
→ Returns R. ENHANCE with:
  - Current scope analysis
  - Framework compliance status
  - Specific enhancement guidance
  - Risk assessment
```

### 3. Deployment Decisions

**Manual Process:**
- Check DRS score
- Verify all gates
- Assess deployment readiness
- Choose deployment prompt

**Automated Process:**
```
select_optimal_prompt(scenario: "deploy")
→ Returns T. DEPLOY-DECIDE with:
  - Complete gate analysis
  - Deployment readiness assessment
  - Specific blockers identified
  - Risk evaluation
```

## Framework Compliance Verification

### Automatic Checks

The MCP server automatically verifies:

1. **DRS Threshold**: Deployment blocked below 85
2. **Time Gates**: Session limits respected
3. **Evidence Freshness**: < 2 hour requirement
4. **Scope Compliance**: File and LOC limits
5. **Contract Integrity**: No unauthorized changes

### Violation Handling

When violations are detected:

```json
{
  "frameworkViolations": [
    "Time gate exceeded - session must end",
    "Evidence 180min old, exceeds 2h limit"
  ],
  "recommendations": [
    "Address framework violations before continuing",
    "Use I. HANDOFF to end session properly",
    "Use K. EVIDENCE to refresh proof captures"
  ],
  "criticalPath": [
    "Resolve framework violations",
    "Refresh evidence captures"
  ]
}
```

## Decision Tree Integration

The MCP server implements the ai-framework decision tree:

```mermaid
flowchart TD
    Start([MCP Tool Called]) --> Violations{Framework Violations?}
    
    Violations -->|Yes| Priority[Violation Handling Prompts]
    Violations -->|No| TimeGate{Time Gate Status?}
    
    TimeGate -->|Exceeded| Handoff[I. HANDOFF]
    TimeGate -->|OK| Context{Project Context}
    
    Context -->|INITIAL| Assess[P. ASSESS]
    Context -->|DEVELOPMENT| Decide[Q. DECIDE]
    Context -->|ENHANCEMENT| Enhance[R. ENHANCE]
    Context -->|DEBUG| Correct[S. CORRECT]
    Context -->|DEPLOY| DeployDecide[T. DEPLOY-DECIDE]
    
    Priority --> ViolationPrompts[I. HANDOFF / K. EVIDENCE / E. VERIFY]
```

## Best Practices

### 1. Use Scenario-Based Selection

Instead of guessing which prompt to use:

```
# Good: Let MCP server decide
select_optimal_prompt(scenario: "next-action")

# Less optimal: Manual prompt selection
"I think I should use D. PLAN"
```

### 2. Leverage Context Injection

Instead of manually gathering context:

```
# Good: Automatic context injection
generate_contextualized_prompt(promptId: "P_ASSESS")

# Less optimal: Manual context gathering
"Let me check the DRS score and orchestration.md..."
```

### 3. Trust Framework Discipline

The MCP server enforces ai-framework rules automatically:

- **Violation Priority**: Framework violations always take precedence
- **Time Gate Respect**: Automatic handoff when limits exceeded
- **DRS Focus**: All decisions consider deployability
- **Evidence Requirements**: Freshness automatically checked

### 4. Use Appropriate Scenarios

Match your intent to the right scenario:

- **"assess"** - When unsure about project state
- **"next-action"** - When ready to work but unsure what to do
- **"enhance"** - When adding new features
- **"debug"** - When fixing issues
- **"deploy"** - When considering deployment

## Migration Guide

### From Manual Prompts

**Before:**
1. Read orchestration.md manually
2. Check DRS score
3. Choose prompt based on intuition
4. Manually add context

**After:**
1. Call `select_optimal_prompt(scenario: "assess")`
2. Use recommended prompt with injected context
3. Follow framework-compliant recommendations

### Integration Steps

1. **Install MCP Server**
   ```bash
   cd ai-framework-mcp-server
   npm install && npm run build
   ```

2. **Configure Kiro**
   ```json
   {
     "mcpServers": {
       "ai-framework": {
         "command": "node",
         "args": ["path/to/ai-framework-mcp-server/dist/index.js"]
       }
     }
   }
   ```

3. **Start Using**
   - Use MCP tools instead of manual prompt selection
   - Trust the framework discipline enforcement
   - Follow contextualized recommendations

## Troubleshooting

### Common Issues

1. **"No framework files found"**
   - Ensure `orchestration.md` and `tasks.md` exist
   - Check file locations (root, `.ai-framework/`, `docs/`)

2. **Unexpected prompt recommendations**
   - Check for framework violations (they take priority)
   - Verify project state matches expectations
   - Review time gate status

3. **Context seems wrong**
   - Verify framework files are up to date
   - Check DRS calculation accuracy
   - Ensure evidence files are current

### Debug Information

Use `get_framework_state` to see what the MCP server detects:

```json
{
  "frameworkState": {
    "drsScore": 75,
    "projectState": "DEVELOPMENT",
    "frameworkCompliance": false
  },
  "analysis": {
    "frameworkViolations": ["Evidence stale"],
    "recommendations": ["Use K. EVIDENCE"]
  }
}
```

## Summary

The AI Framework MCP Server transforms manual prompt selection into intelligent, context-aware guidance that automatically maintains ai-framework discipline. It eliminates guesswork while ensuring all recommendations are framework-compliant and evidence-based.

**Key Value:**
- **Reduced Cognitive Load**: No more manual context gathering
- **Framework Compliance**: Automatic discipline enforcement
- **Better Decisions**: Context-aware recommendations
- **Faster Development**: Optimal prompt selection

Start using the MCP server to experience ai-framework development with intelligent guidance that keeps you in the flow while maintaining strict framework discipline.