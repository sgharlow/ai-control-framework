/**
 * Enhanced Prompt Executor Service for Claude AI
 * Generates comprehensive, context-rich prompts optimized for Claude models
 */

import { FrameworkStateReader } from './framework-state-reader.js';
import { ContextAnalyzer } from '../analyzers/context-analyzer.js';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface PromptExecutionResult {
  promptId: string;
  promptName: string;
  executed: boolean;
  output: string;
  context: {
    drsScore: number;
    projectState: string;
    completionPercentage: number;
    frameworkCompliance: boolean;
    blockers: string[];
    violations: string[];
  };
  recommendations: string[];
  nextActions: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class EnhancedPromptExecutor {
  private frameworkStateReader: FrameworkStateReader;
  private contextAnalyzer: ContextAnalyzer;

  constructor() {
    this.frameworkStateReader = new FrameworkStateReader();
    this.contextAnalyzer = new ContextAnalyzer();
  }

  /**
   * Execute a specific prompt with enhanced Claude-optimized output
   */
  async executePrompt(promptId: string, projectPath?: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const workingPath = projectPath || process.cwd();
    
    // Read current framework state
    const state = await this.frameworkStateReader.readFrameworkState(workingPath);
    const analysis = this.contextAnalyzer.analyzeContext(state);

    // Map prompt ID to execution logic
    switch (promptId.toUpperCase()) {
      case 'START':
      case 'A':
      case 'A_START':
        return this.executeStartPrompt(state, analysis, workingPath);
      
      case 'ASSESS':
      case 'P':
      case 'P_ASSESS':
        return this.executeAssessPrompt(state, analysis, workingPath);
      
      case 'DECIDE':
      case 'Q':
      case 'Q_DECIDE':
        return this.executeDecidePrompt(state, analysis, workingPath);
      
      case 'ENHANCE':
      case 'R':
      case 'R_ENHANCE':
        return this.executeEnhancePrompt(state, analysis, workingPath, additionalContext);
      
      case 'CORRECT':
      case 'S':
      case 'S_CORRECT':
        return this.executeCorrectPrompt(state, analysis, workingPath, additionalContext);
      
      case 'VERIFY':
      case 'E':
      case 'E_VERIFY':
        return this.executeVerifyPrompt(state, analysis, workingPath);
      
      case 'EVIDENCE':
      case 'K':
      case 'K_EVIDENCE':
        return this.executeEvidencePrompt(state, analysis, workingPath);
      
      case 'DEPLOY_DECIDE':
      case 'T':
      case 'T_DEPLOY_DECIDE':
        return this.executeDeployDecidePrompt(state, analysis, workingPath);
      
      case 'DEPLOY':
      case 'G':
      case 'G_DEPLOY':
        return this.executeDeployPrompt(state, analysis, workingPath);
      
      case 'HANDOFF':
      case 'I':
      case 'I_HANDOFF':
        return this.executeHandoffPrompt(state, analysis, workingPath);
      
      // Additional prompts
      case 'SET_CONTEXT':
      case 'B':
      case 'B_SET_CONTEXT':
        return this.executeSetContextPrompt(state, analysis, workingPath);
      
      case 'RESUME':
      case 'C':
      case 'C_RESUME':
        return this.executeResumePrompt(state, analysis, workingPath);
      
      case 'PLAN':
      case 'D':
      case 'D_PLAN':
        return this.executePlanPrompt(state, analysis, workingPath);
      
      case 'BLOCKED':
      case 'F':
      case 'F_BLOCKED':
        return this.executeBlockedPrompt(state, analysis, workingPath, additionalContext);
      
      case 'DEBUG':
      case 'H':
      case 'H_DEBUG':
        return this.executeDebugPrompt(state, analysis, workingPath, additionalContext);
      
      case 'CHECKPOINT':
      case 'L':
      case 'L_CHECKPOINT':
        return this.executeCheckpointPrompt(state, analysis, workingPath);
      
      case 'DECLINE':
      case 'M':
      case 'M_DECLINE':
        return this.executeDeclinePrompt(state, analysis, workingPath);
      
      case 'UNCERTAINTY':
      case 'N':
      case 'N_UNCERTAINTY':
        return this.executeUncertaintyPrompt(state, analysis, workingPath, additionalContext);
      
      case 'PR':
      case 'PR_READY':
      case 'O':
      case 'O_PR_READY':
        return this.executePRPrompt(state, analysis, workingPath, additionalContext);
      
      // Setup prompts (for non-Kiro environments)
      case 'SETUP':
        return this.executeSetupPrompt(state, analysis, workingPath, additionalContext);
      
      case 'INIT_REQUIREMENTS':
        return this.executeInitRequirementsPrompt(state, analysis, workingPath, additionalContext);
      
      case 'INIT_DESIGN':
        return this.executeInitDesignPrompt(state, analysis, workingPath, additionalContext);
      
      case 'INIT_TASKS':
        return this.executeInitTasksPrompt(state, analysis, workingPath, additionalContext);
      
      // Pattern selection
      case 'SELECT_PATTERN':
        return this.executeSelectPatternPrompt(state, analysis, workingPath, additionalContext);
      
      // Emergency (last resort)
      case 'EMERGENCY':
      case 'J':
      case 'J_EMERGENCY':
        return this.executeEmergencyPrompt(state, analysis, workingPath, additionalContext);
      
      default:
        throw new Error(`Unknown prompt ID: ${promptId}`);
    }
  }

  // START - Initialize Session (Enhanced for Claude)
  private async executeStartPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const output = `
## 🚀 AI FRAMEWORK SESSION INITIALIZATION

You are now entering an AI Framework development session. This framework enforces disciplined, convergent development through strict time gates, scope limits, and evidence requirements.

### SESSION CONTEXT
- **Working Directory**: ${workingPath}
- **Session Start Time**: ${new Date().toISOString()}
- **Framework Version**: 2.0
- **Mode**: ${state.orchestration.sessionMode || 'INITIAL'}

### IMMEDIATE ACTIONS REQUIRED

1. **Load Framework Files** (MANDATORY)
   \`\`\`bash
   # Read these files in order:
   cat ai-framework/templates/orchestration.md  # Control rules
   cat ai-framework/templates/code.md           # Session state
   cat ai-framework/templates/patterns.md       # Implementation patterns
   cat ai-framework/IMPLEMENTATION-GUIDE.md     # How to run checks
   \`\`\`

2. **Verify Contract Hash**
   - Current Hash: ${state.orchestration.contractHash || 'NOT SET - MUST FREEZE'}
   - Status: ${state.orchestration.contractHash ? '✅ FROZEN' : '❌ NEEDS FREEZING'}
   ${!state.orchestration.contractHash ? `
   ACTION REQUIRED:
   \`\`\`bash
   # Freeze contracts immediately:
   find . -name "*.contract.*" -exec sha256sum {} \\; > contract-hashes.txt
   git add contract-hashes.txt
   git commit -m "FREEZE: Contract hashes locked"
   \`\`\`` : ''}

3. **Set First Time Gate (30 minutes)**
   - Timer Started: NOW
   - First Gate at: ${new Date(Date.now() + 30 * 60000).toLocaleTimeString()}
   - Required by 30min:
     * Real services connected (NO MOCKS)
     * Contract hashes frozen
     * First evidence captured
     * Pattern selected from PATTERNS.md

4. **Declare Initial Confidence**
   - Current Confidence: ${analysis.confidence}
   - Framework Compliance: ${analysis.context.frameworkCompliance ? 'YES' : 'NO'}
   - Blockers: ${analysis.frameworkViolations.length || 0}

### CRITICAL RULES FOR THIS SESSION

1. **Contracts are FROZEN** - Zero changes without CCR approval
2. **Real Services ONLY** - Mocks expire at 30 minutes sharp
3. **Scope is LIMITED** - Maximum 5 files, 200 LOC per session
4. **Evidence is REQUIRED** - Capture every 30 minutes
5. **Pattern Selection MANDATORY** - Choose before any code

### YOUR MISSION

${state.requirements?.mission || 'Define a specific, testable goal for this session'}

### NEXT STEPS (In Order)

1. Run \`assess\` to understand current state
2. Select a pattern from PATTERNS.md
3. Document mission in templates/code.md
4. Begin implementation with smallest possible change
5. Set 30-minute timer for evidence capture

### CONFIDENCE DECLARATION

Confidence Level: ${analysis.confidence}
Reason: ${analysis.confidence === 'HIGH' ? 'Framework files loaded, contracts frozen, ready to begin' : 
         analysis.confidence === 'MEDIUM' ? 'Some setup required but path is clear' :
         'Multiple issues need resolution before starting'}

${analysis.frameworkViolations.length > 0 ? `
### ⚠️ VIOLATIONS TO ADDRESS FIRST
${analysis.frameworkViolations.map((v: string) => `- ${v}`).join('\n')}

STOP: Address these violations before any development work.
` : ''}

### SUCCESS CRITERIA FOR THIS SESSION

- [ ] DRS Score ≥ 85 by session end
- [ ] All time gates passed (30/60/90/120 min)
- [ ] Real services connected and tested
- [ ] Evidence captured every 30 minutes
- [ ] Pattern correctly applied
- [ ] Scope within limits (≤5 files, ≤200 LOC)

Remember: The framework prevents false progress. Every action must increase deployability.
`;

    return {
      promptId: 'START',
      promptName: 'Initialize Session',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [
        'Read all framework files immediately',
        'Freeze contract hashes if not done',
        'Select pattern from PATTERNS.md',
        'Set 30-minute evidence timer'
      ],
      nextActions: ['assess', 'set_context', 'plan'],
      confidence: analysis.confidence
    };
  }

  // ASSESS - Comprehensive Project Assessment (Enhanced for Claude)
  private async executeAssessPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const healthStatus = this.calculateHealthStatus(state, analysis);
    const sessionDuration = Math.round((Date.now() - state.orchestration.sessionStartTime.getTime()) / (1000 * 60));
    
    const output = `
## 📊 COMPREHENSIVE PROJECT STATE ANALYSIS

### EXECUTIVE SUMMARY
**Project Health**: ${healthStatus}
**DRS Score**: ${state.drsScore}/100 (threshold: 85)
**Can Deploy**: ${state.drsScore >= 85 ? '✅ YES' : '❌ NO'}
**Session Time**: ${sessionDuration} minutes elapsed, ${state.orchestration.timeRemaining} remaining
**Immediate Action**: ${this.getRecommendedAction(state, analysis)}

### DETAILED FRAMEWORK COMPLIANCE REPORT

#### 1. Contract Integrity (7 points)
- Hash Status: ${state.orchestration.contractHash ? '✅ Frozen' : '❌ Not frozen'}
- Changes Detected: ${state.contractChanges || 'None'}
- Compliance: ${state.contractCompliance ? 'PASS' : 'FAIL'}

#### 2. Real Service Connections (Critical)
- Status: ${state.tasks.realServicesConnected ? '✅ Connected' : '❌ Not connected'}
- Mock Count: ${state.todos?.mockCount || 0}
- Mock Age: ${state.todos?.oldestMockAge || 0} minutes
${(state.todos?.mockCount || 0) > 0 && (state.todos?.oldestMockAge || 0) > 30 ? '⚠️ CRITICAL: Mocks expired! Replace immediately.' : ''}

#### 3. Evidence Freshness (9 points)
- Last Capture: ${state.evidence.length > 0 ? 
    Math.round((Date.now() - Math.max(...state.evidence.map((e: any) => e.timestamp.getTime()))) / (1000 * 60)) + ' minutes ago' : 
    'Never captured'}
- Evidence Count: ${state.evidence.length}
- Status: ${state.evidence.length > 0 && 
    Math.round((Date.now() - Math.max(...state.evidence.map((e: any) => e.timestamp.getTime()))) / (1000 * 60)) < 120 ? 
    '✅ Current' : '❌ Stale or missing'}

#### 4. Scope Compliance (4 points)
- Files Changed: ${state.scopeMetrics?.filesChanged || 0}/5
- Lines Added: ${state.scopeMetrics?.linesAdded || 0}/200
- Status: ${(state.scopeMetrics?.filesChanged || 0) <= 5 && (state.scopeMetrics?.linesAdded || 0) <= 200 ? '✅ Within limits' : '❌ Exceeded'}

#### 5. Time Gate Status
\`\`\`
30min  gate: ${sessionDuration >= 30 ? (state.tasks.realServicesConnected ? '✅ PASSED' : '❌ FAILED') : '⏳ Pending'}
60min  gate: ${sessionDuration >= 60 ? (state.tasks.completionPercentage >= 25 ? '✅ PASSED' : '❌ FAILED') : '⏳ Pending'}
90min  gate: ${sessionDuration >= 90 ? (state.drsScore >= 70 ? '✅ PASSED' : '❌ FAILED') : '⏳ Pending'}
120min gate: ${sessionDuration >= 120 ? (state.drsScore >= 85 ? '✅ PASSED' : '❌ FAILED') : '⏳ Pending'}
\`\`\`

### DRS COMPONENT BREAKDOWN

\`\`\`
Component                Score  Max  Status
-----------------------------------------
Contract Integrity       ${state.drsComponents?.contractIntegrity || 0}     7    ${state.drsComponents?.contractIntegrity >= 7 ? '✅' : '⚠️'}
Behavioral Contracts     ${state.drsComponents?.behavioralContracts || 0}     7    ${state.drsComponents?.behavioralContracts >= 7 ? '✅' : '⚠️'}
Security Validation      ${state.drsComponents?.securityValidation || 0}    16    ${state.drsComponents?.securityValidation >= 14 ? '✅' : '⚠️'}
Data Integrity          ${state.drsComponents?.dataIntegrity || 0}     9    ${state.drsComponents?.dataIntegrity >= 8 ? '✅' : '⚠️'}
No Mocks               ${state.drsComponents?.noMocks || 0}     7    ${state.drsComponents?.noMocks >= 7 ? '✅' : '❌'}
Tests Passing          ${state.drsComponents?.testsPassing || 0}     7    ${state.drsComponents?.testsPassing >= 7 ? '✅' : '⚠️'}
Integration Evidence   ${state.drsComponents?.integrationEvidence || 0}     9    ${state.drsComponents?.integrationEvidence >= 8 ? '✅' : '⚠️'}
Architecture Stable    ${state.drsComponents?.architectureStable || 0}     7    ${state.drsComponents?.architectureStable >= 7 ? '✅' : '⚠️'}
Production Ready       ${state.drsComponents?.productionReady || 0}    14    ${state.drsComponents?.productionReady >= 12 ? '✅' : '⚠️'}
Context Preserved      ${state.drsComponents?.contextPreserved || 0}     7    ${state.drsComponents?.contextPreserved >= 7 ? '✅' : '⚠️'}
Error Handling         ${state.drsComponents?.errorHandling || 0}     4    ${state.drsComponents?.errorHandling >= 4 ? '✅' : '⚠️'}
Scope Compliance       ${state.drsComponents?.scopeCompliance || 0}     4    ${state.drsComponents?.scopeCompliance >= 4 ? '✅' : '⚠️'}
Documentation          ${state.drsComponents?.documentation || 0}     2    ${state.drsComponents?.documentation >= 2 ? '✅' : '⚠️'}
-----------------------------------------
TOTAL DRS SCORE        ${state.drsScore}   100   ${state.drsScore >= 85 ? '✅ DEPLOYABLE' : '❌ NOT READY'}
\`\`\`

### CRITICAL PATH TO DEPLOYMENT

${this.generateCriticalPath(state, analysis)}

### RECOMMENDED ACTIONS (Prioritized)

1. **IMMEDIATE (Next 5 minutes)**
   ${this.getImmediateActions(state, analysis).map((a: string) => `   - ${a}`).join('\n')}

2. **SHORT TERM (Next 30 minutes)**
   ${this.getShortTermActions(state, analysis).map((a: string) => `   - ${a}`).join('\n')}

3. **SESSION GOALS (Before timeout)**
   ${this.getSessionGoals(state, analysis).map((a: string) => `   - ${a}`).join('\n')}

### CONFIDENCE ASSESSMENT

**Overall Confidence**: ${analysis.confidence}
**Reasoning**: ${this.getConfidenceReasoning(state, analysis)}
**Primary Risk**: ${this.getPrimaryRisk(state, analysis)}
**Mitigation**: ${this.getRiskMitigation(state, analysis)}

${analysis.frameworkViolations.length > 0 ? `
### ⚠️ FRAMEWORK VIOLATIONS DETECTED

These violations MUST be addressed before continuing:

${analysis.frameworkViolations.map((v: string, i: number) => `
${i + 1}. **${v}**
   Impact: ${this.getViolationImpact(v)}
   Fix: ${this.getViolationFix(v)}
`).join('\n')}

**Action Required**: Run \`verify\` after addressing each violation.
` : '### ✅ No Framework Violations'}

### DECISION MATRIX

Based on current state, recommended next prompt:

${this.getDecisionMatrix(state, analysis)}

### PATTERN RECOMMENDATION

Current Situation Best Matches: **${this.recommendPattern(state, analysis)}**

Apply this pattern by:
1. Review pattern details in PATTERNS.md
2. Document pattern choice in orchestration.md
3. Follow pattern implementation steps exactly

Remember: The framework is your guardrail against false progress. Trust the metrics, not feelings.
`;

    return {
      promptId: 'ASSESS',
      promptName: 'Comprehensive Project Assessment',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: this.getImmediateActions(state, analysis),
      nextActions: this.getNextPrompts(state, analysis),
      confidence: analysis.confidence
    };
  }

  // DECIDE - Automatic Next Action Selection (Enhanced for Claude)
  private async executeDecidePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const decision = this.makeActionDecision(state, analysis);
    const sessionDuration = Math.round((Date.now() - state.orchestration.sessionStartTime.getTime()) / (1000 * 60));
    
    const output = `
## 🎯 INTELLIGENT NEXT ACTION DECISION

### CURRENT SITUATION ANALYSIS

**Project State**: ${analysis.context.projectState}
**DRS Score**: ${state.drsScore}/100
**Time in Session**: ${sessionDuration} minutes
**Next Time Gate**: ${this.getNextTimeGate(sessionDuration)}
**Confidence Level**: ${analysis.confidence}

### DECISION LOGIC APPLIED

${decision.logic}

### RECOMMENDED ACTION

**Mode**: ${decision.mode}
**Action**: ${decision.action}
**Priority**: CRITICAL

### DETAILED IMPLEMENTATION PLAN

${this.generateImplementationPlan(decision, state, analysis)}

### EXPECTED OUTCOMES

- **DRS Impact**: ${decision.drsImpact}
- **Time Required**: ${decision.timeEstimate} minutes
- **Scope**: ${decision.scopeEstimate}
- **Risk Level**: ${decision.riskLevel || 'MEDIUM'}
- **Success Probability**: ${decision.successProbability || '75%'}

### SPECIFIC NEXT STEPS

1. **Immediate (0-5 min)**
   ${this.getImmediateSteps(decision, state).map((s: string) => `   - ${s}`).join('\n')}

2. **Execution (5-${decision.timeEstimate} min)**
   ${this.getExecutionSteps(decision, state).map((s: string) => `   - ${s}`).join('\n')}

3. **Validation (Final 5 min)**
   ${this.getValidationSteps(decision, state).map((s: string) => `   - ${s}`).join('\n')}

### PATTERN TO APPLY

**Recommended Pattern**: ${decision.pattern || 'Review PATTERNS.md'}

Implementation approach:
${this.getPatternImplementation(decision.pattern)}

### SUCCESS CRITERIA

For this action to be considered successful:
${this.getSuccessCriteria(decision, state).map((c: string) => `- [ ] ${c}`).join('\n')}

### CONFIDENCE DECLARATION

**Level**: ${decision.confidence}
**Reason**: ${decision.reason}
${decision.confidence === 'LOW' ? `
**Question for Human**: ${decision.question || 'Should I proceed with this action?'}
**Default if no response in 5 min**: ${decision.defaultAction || 'Run assess for more information'}
` : ''}

### ALTERNATIVE APPROACHES

If primary action is blocked:
${decision.alternatives ? decision.alternatives.map((alt: any, i: number) => `
${i + 1}. **${alt.action}**
   - Time: ${alt.time} min
   - DRS Impact: ${alt.impact}
   - Risk: ${alt.risk}
`).join('\n') : 'No alternatives - this is the critical path'}

### FRAMEWORK COMPLIANCE CHECK

Before proceeding, ensure:
- [ ] Contracts remain frozen (no changes)
- [ ] No new mocks introduced (real services only)
- [ ] Scope within limits (≤5 files, ≤200 LOC)
- [ ] Evidence capture scheduled
- [ ] Pattern documented in orchestration.md

### EXECUTION COMMAND

To execute this decision:
\`\`\`bash
# Document decision
echo "Decision: ${decision.action}" >> ai-framework/templates/orchestration.md
echo "Pattern: ${decision.pattern}" >> ai-framework/templates/orchestration.md
echo "Started: $(date)" >> ai-framework/templates/orchestration.md

# Execute next prompt
mcp.execute("${this.getExecutionPrompt(decision)}", {
  context: "${decision.mode}",
  target: "${decision.target || 'current task'}"
})
\`\`\`

Remember: Every action must increase deployability. If DRS won't improve, don't do it.
`;

    return {
      promptId: 'DECIDE',
      promptName: 'Automatic Next Action Selection',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [decision.action, ...this.getImmediateSteps(decision, state)],
      nextActions: [this.getExecutionPrompt(decision)],
      confidence: decision.confidence as 'HIGH' | 'MEDIUM' | 'LOW'
    };
  }

  // ENHANCE - Context-Aware Enhancement (Enhanced for Claude)
  private async executeEnhancePrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const feature = additionalContext?.feature || 'unspecified enhancement';
    const scopeEstimate = additionalContext?.scope_estimate || { files: 0, loc: 0 };
    
    const output = `
## 🚀 ENHANCEMENT PLANNING & VALIDATION

### ENHANCEMENT REQUEST
**Feature**: ${feature}
**Requested By**: User
**Session Time Remaining**: ${state.orchestration.timeRemaining} minutes

### SCOPE ANALYSIS

#### Estimated Scope
- **Files to Modify**: ${scopeEstimate.files} (limit: 5)
- **Lines of Code**: ${scopeEstimate.loc} (limit: 200)
- **Complexity**: ${this.assessComplexity(scopeEstimate)}
- **Feasibility**: ${scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 ? '✅ APPROVED' : '❌ TOO LARGE'}

${scopeEstimate.files > 5 || scopeEstimate.loc > 200 ? `
### ⚠️ SCOPE EXCEEDS LIMITS

This enhancement is too large for a single session. Break it down:

${this.generateScopeBreakdown(feature, scopeEstimate)}
` : `
### ✅ SCOPE APPROVED - IMPLEMENTATION PLAN

#### Pre-Implementation Checklist
- [ ] Current DRS ≥ 70 (actual: ${state.drsScore})
- [ ] No existing violations (actual: ${analysis.frameworkViolations.length})
- [ ] Pattern selected from PATTERNS.md
- [ ] Contracts frozen (no changes allowed)
- [ ] Real service endpoints identified

#### Implementation Phases

**Phase 1: Foundation (${Math.ceil(scopeEstimate.loc * 0.3 / 10)} min)**
${this.getEnhancementPhase1(feature, scopeEstimate)}

**Phase 2: Core Logic (${Math.ceil(scopeEstimate.loc * 0.5 / 10)} min)**
${this.getEnhancementPhase2(feature, scopeEstimate)}

**Phase 3: Integration (${Math.ceil(scopeEstimate.loc * 0.2 / 10)} min)**
${this.getEnhancementPhase3(feature, scopeEstimate)}

#### Framework Compliance Strategy

1. **Contract Preservation**
   - No modifications to existing contracts
   - New functionality must be additive only
   - Use adapter pattern if interface changes needed

2. **Real Service Integration**
   ${this.getRealServiceStrategy(feature)}

3. **Evidence Capture Points**
   - After Phase 1: Capture foundation evidence
   - After Phase 2: Capture functionality evidence
   - After Phase 3: Capture integration evidence

4. **Testing Requirements**
   ${this.getTestingRequirements(feature)}
`}

### RISK ASSESSMENT

${this.getEnhancementRisks(feature, scopeEstimate, state)}

### PATTERN SELECTION

**Recommended Pattern**: ${this.selectEnhancementPattern(feature)}

Pattern implementation:
${this.getEnhancementPatternSteps(feature)}

### SUCCESS CRITERIA

Enhancement is complete when:
- [ ] Feature works with real services (no mocks)
- [ ] All existing tests still pass
- [ ] New tests added for enhancement
- [ ] Evidence captured at each phase
- [ ] DRS maintained or improved
- [ ] Documentation updated
- [ ] No contract changes made

### ROLLBACK PLAN

If enhancement fails or violates framework:
1. Git reset to pre-enhancement commit
2. Document lessons learned
3. Re-assess with smaller scope
4. Consider alternative approach

### EXECUTION COMMANDS

\`\`\`bash
# Start enhancement
echo "Enhancement: ${feature}" >> ai-framework/templates/tasks.md
echo "Scope: ${scopeEstimate.files} files, ${scopeEstimate.loc} LOC" >> ai-framework/templates/tasks.md
echo "Pattern: ${this.selectEnhancementPattern(feature)}" >> ai-framework/templates/orchestration.md

# Set evidence timer
(sleep 1800 && echo "⏰ 30-minute evidence capture required") &

# Begin implementation
${this.getEnhancementStartCommand(feature)}
\`\`\`

### CONFIDENCE DECLARATION

**Confidence Level**: ${scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 && state.drsScore >= 70 ? 'HIGH' : 'MEDIUM'}
**Reasoning**: ${this.getEnhancementConfidenceReason(scopeEstimate, state)}
${analysis.confidence === 'LOW' ? `
**Concern**: ${this.getEnhancementConcern(scopeEstimate, state)}
**Question**: Should I proceed with this enhancement given current state?
` : ''}

Remember: Enhancements must be ADDITIVE ONLY. No breaking changes to existing functionality.
`;

    return {
      promptId: 'ENHANCE',
      promptName: 'Context-Aware Enhancement Handler',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 ?
        ['Begin enhancement implementation', 'Set 30-minute timer', 'Document pattern choice'] :
        ['Break enhancement into smaller chunks', 'Each chunk ≤5 files, ≤200 LOC'],
      nextActions: scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 ?
        ['plan', 'evidence'] : ['assess', 'decide'],
      confidence: analysis.confidence
    };
  }

  // CORRECT - Debug with Minimal Scope (Enhanced for Claude)
  private async executeCorrectPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const issue = additionalContext?.issue || 'unspecified issue';
    const severity = additionalContext?.severity || 'medium';
    
    const output = `
## 🔧 MINIMAL SCOPE DEBUGGING CONTEXT

### ISSUE DETAILS
**Description**: ${issue}
**Severity**: ${severity.toUpperCase()}
**Impact**: ${this.assessImpactScope(severity)}
**Fix Priority**: ${severity === 'critical' ? 'IMMEDIATE' : severity === 'high' ? 'URGENT' : 'NORMAL'}

### ROOT CAUSE ANALYSIS

${this.performRootCauseAnalysis(issue, state)}

### MINIMAL FIX STRATEGY

**Approach**: ${this.getMinimalFixApproach(issue, severity)}
**Estimated Files**: ${this.estimateFixFiles(issue, severity)} (max: 3)
**Estimated LOC**: ${this.estimateFixLOC(issue, severity)} (max: 50)
**Time Required**: ${severity === 'critical' ? '15-30' : '10-20'} minutes

### IMPLEMENTATION PLAN

#### Step 1: Isolate the Problem
\`\`\`bash
${this.getIsolationCommands(issue)}
\`\`\`

#### Step 2: Implement Minimal Fix
${this.getMinimalFixSteps(issue, severity)}

#### Step 3: Add Regression Test
\`\`\`javascript
${this.generateRegressionTest(issue)}
\`\`\`

#### Step 4: Verify Fix
${this.getVerificationSteps(issue)}

### SCOPE CONTROL RULES

**STRICT BOUNDARIES**:
1. **DO NOT** refactor unrelated code
2. **DO NOT** add new features
3. **DO NOT** change contracts
4. **DO NOT** modify more than 3 files
5. **DO NOT** exceed 50 lines of changes

**FOCUS ONLY ON**:
- The specific issue reported
- Minimal code change to fix
- Regression test to prevent recurrence
- Evidence of fix working

### ROLLBACK TRIGGER

Immediately rollback if:
- Fix requires >3 files
- Fix requires contract changes
- Fix breaks existing tests
- Fix introduces new issues
- DRS score decreases

### TESTING REQUIREMENTS

1. **Regression Test** (MANDATORY)
   - Reproduces the original issue
   - Verifies the fix works
   - Prevents future regression

2. **Existing Tests** (MUST PASS)
   - All current tests must still pass
   - No test modifications allowed
   - Document any test warnings

3. **Integration Test** (IF APPLICABLE)
   - Test with real services
   - Capture correlation IDs
   - Document response times

### EVIDENCE REQUIREMENTS

Capture these proofs after fix:
1. Screenshot/log of issue before fix
2. Screenshot/log of issue after fix
3. Test results showing fix works
4. DRS score comparison (before/after)

### EXECUTION COMMANDS

\`\`\`bash
# Document the issue
echo "Issue: ${issue}" >> ai-framework/templates/todos.md
echo "Severity: ${severity}" >> ai-framework/templates/todos.md
echo "Started: $(date)" >> ai-framework/templates/todos.md

# Create fix branch (optional)
git checkout -b fix/${issue.replace(/\s+/g, '-').toLowerCase()}

# Run existing tests first
${this.getTestCommand(state)}

# After fix, run tests again
${this.getTestCommand(state)}

# Capture evidence
${this.getEvidenceCaptureCommand(issue)}
\`\`\`

### CONFIDENCE ASSESSMENT

**Confidence Level**: ${this.getFixConfidence(issue, severity, state)}
**Reasoning**: ${this.getFixConfidenceReason(issue, severity, state)}
${this.getFixConfidence(issue, severity, state) === 'LOW' ? `
**Concern**: ${this.getFixConcern(issue, severity)}
**Question**: Is this the right approach for fixing ${issue}?
**Alternative**: ${this.getFixAlternative(issue)}
` : ''}

### SUCCESS CRITERIA

Fix is complete when:
- [ ] Issue no longer reproduces
- [ ] Regression test added and passing
- [ ] All existing tests still pass
- [ ] Evidence captured (before/after)
- [ ] DRS maintained or improved
- [ ] Changes ≤3 files, ≤50 LOC

Remember: MINIMAL changes only. If the fix grows beyond scope, STOP and reassess.
`;

    return {
      promptId: 'CORRECT',
      promptName: 'Debugging and Correction Context',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [
        'Implement minimal fix only',
        'Add regression test',
        'Capture before/after evidence',
        'Verify DRS maintained'
      ],
      nextActions: ['debug', 'evidence', 'verify'],
      confidence: this.getFixConfidence(issue, severity, state) as 'HIGH' | 'MEDIUM' | 'LOW'
    };
  }

  // VERIFY - Compliance Audit (Enhanced for Claude)
  private async executeVerifyPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const violations = analysis.frameworkViolations;
    
    const output = `
## 🔍 COMPREHENSIVE FRAMEWORK COMPLIANCE AUDIT

### AUDIT SUMMARY
**Overall Compliance**: ${violations.length === 0 ? '✅ FULLY COMPLIANT' : `❌ ${violations.length} VIOLATIONS FOUND`}
**DRS Score**: ${state.drsScore}/100
**Deployment Ready**: ${state.drsScore >= 85 && violations.length === 0 ? 'YES' : 'NO'}
**Immediate Action Required**: ${violations.length > 0 ? 'YES - Fix violations' : 'NO - Continue development'}

### DETAILED COMPLIANCE REPORT

#### 1. ORCHESTRATION.MD COMPLIANCE
\`\`\`
Requirement                          Status   Details
---------------------------------------------------------
Session mode declared                ${state.orchestration.sessionMode ? '✅' : '❌'}      ${state.orchestration.sessionMode || 'NOT SET'}
Time gates tracked                   ${state.orchestration.timeGates ? '✅' : '❌'}      ${this.getTimeGateStatus(state)}
Evidence cadence (30min)             ${this.checkEvidenceCadence(state) ? '✅' : '❌'}      ${this.getEvidenceCadenceDetails(state)}
Confidence declared                  ${analysis.confidence !== 'UNKNOWN' ? '✅' : '❌'}      ${analysis.confidence}
Pattern selected                     ${state.orchestration.patternUsed ? '✅' : '❌'}      ${state.orchestration.patternUsed || 'NONE'}
Contract hash frozen                 ${state.orchestration.contractHash ? '✅' : '❌'}      ${state.orchestration.contractHash ? 'Frozen' : 'NOT FROZEN'}
\`\`\`

#### 2. TASKS.MD COMPLIANCE
\`\`\`
Requirement                          Status   Details
---------------------------------------------------------
Real service connections             ${state.tasks.realServicesConnected ? '✅' : '❌'}      ${this.getServiceConnectionDetails(state)}
Definition of Done met               ${state.tasks.dodMet ? '✅' : '❌'}      ${state.tasks.completionPercentage}% complete
Partial progress tracked             ${state.tasks.partialProgress ? '✅' : '❌'}      ${this.getPartialProgressDetails(state)}
Confidence ≥ MEDIUM                  ${analysis.confidence !== 'LOW' ? '✅' : '❌'}      ${analysis.confidence}
Acceptance criteria defined          ${state.tasks.acceptanceCriteria ? '✅' : '❌'}      ${state.tasks.acceptanceCriteria ? 'Yes' : 'No'}
\`\`\`

#### 3. TODOS.MD COMPLIANCE
\`\`\`
Requirement                          Status   Details
---------------------------------------------------------
No expired mocks (>30min)           ${this.checkMockExpiry(state) ? '✅' : '❌'}      ${this.getMockDetails(state)}
All TODOs have expiry               ${this.checkTodoExpiry(state) ? '✅' : '❌'}      ${this.getTodoDetails(state)}
Blockers documented                 ${state.todos?.blockersDocumented ? '✅' : '❌'}      ${state.todos?.blockers?.length || 0} blockers
Critical items prioritized          ${state.todos?.prioritized ? '✅' : '❌'}      ${this.getPriorityDetails(state)}
\`\`\`

#### 4. DEPLOY.MD COMPLIANCE
\`\`\`
Requirement                          Status   Details
---------------------------------------------------------
All gates green                     ${this.checkAllGatesGreen(state) ? '✅' : '❌'}      ${this.getGateDetails(state)}
DRS ≥ 85                           ${state.drsScore >= 85 ? '✅' : '❌'}      Current: ${state.drsScore}/100
Production checklist complete       ${state.deploy?.checklistComplete ? '✅' : '❌'}      ${this.getChecklistDetails(state)}
Rollback plan documented           ${state.deploy?.rollbackPlan ? '✅' : '❌'}      ${state.deploy?.rollbackPlan ? 'Yes' : 'No'}
\`\`\`

${violations.length > 0 ? `
### ⚠️ CRITICAL VIOLATIONS REQUIRING IMMEDIATE ACTION

${violations.map((v: string, i: number) => `
#### Violation ${i + 1}: ${v}

**Severity**: ${this.getViolationSeverity(v)}
**Impact on DRS**: ${this.getViolationDRSImpact(v)} points
**Time to Fix**: ${this.getViolationFixTime(v)} minutes

**Root Cause**:
${this.getViolationRootCause(v)}

**Fix Instructions**:
\`\`\`bash
${this.getViolationFixCommands(v)}
\`\`\`

**Verification**:
After fixing, verify with:
\`\`\`bash
${this.getViolationVerificationCommands(v)}
\`\`\`
`).join('\n')}

### RECOVERY PLAN

1. **Stop all development work immediately**
2. **Fix violations in order of severity**
3. **Run \`verify\` after each fix**
4. **Only resume when fully compliant**
` : `
### ✅ FULL COMPLIANCE ACHIEVED

All framework requirements are met. You may continue development.

**Maintain compliance by**:
- Capturing evidence every 30 minutes
- Keeping mocks under 30 minutes old
- Staying within scope limits
- Maintaining or improving DRS
`}

### COMPLIANCE TRENDS

\`\`\`
Metric              Start    Now     Trend
-------------------------------------------
DRS Score           ${state.drsHistory?.[0] || 0}      ${state.drsScore}     ${this.getTrend(state.drsHistory?.[0] || 0, state.drsScore)}
Violations          ${state.violationHistory?.[0] || 0}      ${violations.length}     ${this.getTrend(state.violationHistory?.[0] || 0, violations.length, true)}
Evidence Age        ${state.evidenceAgeHistory?.[0] || 999}min   ${this.getCurrentEvidenceAge(state)}min  ${this.getTrend(state.evidenceAgeHistory?.[0] || 999, this.getCurrentEvidenceAge(state), true)}
Mock Count          ${state.mockCountHistory?.[0] || 0}      ${state.todos?.mockCount || 0}     ${this.getTrend(state.mockCountHistory?.[0] || 0, state.todos?.mockCount || 0, true)}
\`\`\`

### NEXT ACTIONS

${violations.length > 0 ? `
**REQUIRED (Fix violations first)**:
1. Address each violation using fix instructions above
2. Run \`verify\` after each fix
3. Do not proceed with development until compliant
` : `
**RECOMMENDED (Maintain compliance)**:
1. Continue with current development plan
2. Set timer for next evidence capture
3. Monitor DRS score progression
4. Check for new mocks regularly
`}

### AUDIT TIMESTAMP

Audit completed at: ${new Date().toISOString()}
Next audit required: ${new Date(Date.now() + 30 * 60000).toISOString()}

Remember: Compliance is not optional. The framework protects you from false progress.
`;

    return {
      promptId: 'VERIFY',
      promptName: 'Compliance Audit',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: violations.length > 0 ? 
        ['Fix violations immediately', 'Stop development work', 'Re-run verify after fixes'] :
        ['Continue development', 'Capture evidence in 30 min', 'Monitor DRS progression'],
      nextActions: violations.length > 0 ? ['blocked', 'uncertainty'] : ['plan', 'evidence'],
      confidence: violations.length > 0 ? 'LOW' : analysis.confidence
    };
  }

  // Additional helper methods for enhanced prompts...
  
  private extractContext(state: any, analysis: any): any {
    return {
      drsScore: state.drsScore,
      projectState: analysis.context.projectState,
      completionPercentage: state.tasks.completionPercentage,
      frameworkCompliance: analysis.context.frameworkCompliance,
      blockers: analysis.frameworkViolations,
      violations: analysis.frameworkViolations
    };
  }

  private calculateHealthStatus(state: any, analysis: any): string {
    if (state.drsScore >= 85 && analysis.frameworkViolations.length === 0) return 'EXCELLENT';
    if (state.drsScore >= 70 && analysis.frameworkViolations.length <= 2) return 'GOOD';
    if (state.drsScore >= 50 || analysis.frameworkViolations.length <= 5) return 'CONCERNING';
    return 'BLOCKED';
  }

  private getRecommendedAction(state: any, analysis: any): string {
    if (analysis.frameworkViolations.length > 0) return 'FIX VIOLATIONS IMMEDIATELY';
    if (state.drsScore < 70) return 'ENTER CRITICAL PATH RECOVERY';
    if (state.drsScore < 85) return 'FOCUS ON DRS IMPROVEMENT';
    if (state.tasks.completionPercentage < 100) return 'CONTINUE DEVELOPMENT';
    return 'READY TO DEPLOY';
  }

  private generateCriticalPath(state: any, analysis: any): string {
    const steps = [];
    
    if (analysis.frameworkViolations.length > 0) {
      steps.push('1. Fix all framework violations');
    }
    if (!state.tasks.realServicesConnected) {
      steps.push(`${steps.length + 1}. Connect real services (remove mocks)`);
    }
    if (state.drsScore < 85) {
      steps.push(`${steps.length + 1}. Improve DRS to 85+ (current: ${state.drsScore})`);
    }
    if (state.evidence.length === 0 || this.getCurrentEvidenceAge(state) > 120) {
      steps.push(`${steps.length + 1}. Capture fresh evidence`);
    }
    if (state.tasks.completionPercentage < 100) {
      steps.push(`${steps.length + 1}. Complete remaining tasks (${100 - state.tasks.completionPercentage}%)`);
    }
    
    return steps.length > 0 ? steps.join('\n') : 'Ready for deployment - no blockers';
  }

  private getImmediateActions(state: any, analysis: any): string[] {
    const actions = [];
    
    if (analysis.frameworkViolations.length > 0) {
      actions.push('Run blocked prompt to address violations');
    }
    if (this.getCurrentEvidenceAge(state) > 30) {
      actions.push('Capture evidence immediately');
    }
    if (!state.orchestration.patternUsed) {
      actions.push('Select pattern from PATTERNS.md');
    }
    if ((state.todos?.mockCount || 0) > 0 && (state.todos?.oldestMockAge || 0) > 25) {
      actions.push('Replace expiring mocks with real services');
    }
    
    return actions.length > 0 ? actions : ['Continue with current plan'];
  }

  private getShortTermActions(state: any, analysis: any): string[] {
    const actions = [];
    
    if (state.drsScore < 85) {
      actions.push(`Improve DRS by ${85 - state.drsScore} points`);
    }
    if (state.tasks.completionPercentage < 50) {
      actions.push('Complete at least 50% of current task');
    }
    if (!state.tasks.realServicesConnected) {
      actions.push('Establish real service connections');
    }
    
    return actions.length > 0 ? actions : ['Maintain current progress'];
  }

  private getSessionGoals(state: any, analysis: any): string[] {
    return [
      `Achieve DRS ≥ 85 (current: ${state.drsScore})`,
      'Pass all time gates',
      'Complete current feature/fix',
      'Maintain framework compliance'
    ];
  }

  private getConfidenceReasoning(state: any, analysis: any): string {
    if (analysis.confidence === 'HIGH') {
      return 'Clear path forward, no blockers, framework compliant';
    }
    if (analysis.confidence === 'MEDIUM') {
      return 'Some challenges present but manageable within session';
    }
    return 'Multiple issues requiring resolution, unclear path';
  }

  private getPrimaryRisk(state: any, analysis: any): string {
    if (analysis.frameworkViolations.length > 0) return 'Framework violations blocking progress';
    if (state.drsScore < 70) return 'DRS too low for meaningful progress';
    if (state.orchestration.timeRemaining < 30) return 'Insufficient time remaining';
    if (!state.tasks.realServicesConnected) return 'No real service connections';
    return 'No critical risks identified';
  }

  private getRiskMitigation(state: any, analysis: any): string {
    const risk = this.getPrimaryRisk(state, analysis);
    
    if (risk.includes('violations')) return 'Fix violations before any other work';
    if (risk.includes('DRS')) return 'Focus exclusively on DRS improvement';
    if (risk.includes('time')) return 'Prepare for session handoff';
    if (risk.includes('service')) return 'Connect real services immediately';
    return 'Continue with caution, monitor metrics';
  }

  private getViolationImpact(violation: string): string {
    if (violation.includes('contract')) return 'CRITICAL - Blocks all development';
    if (violation.includes('mock') && violation.includes('expired')) return 'HIGH - Invalid test results';
    if (violation.includes('evidence')) return 'MEDIUM - Cannot prove progress';
    if (violation.includes('scope')) return 'MEDIUM - Risk of scope creep';
    return 'LOW - Should still be fixed';
  }

  private getViolationFix(violation: string): string {
    if (violation.includes('contract')) return 'Freeze contracts immediately with sha256sum';
    if (violation.includes('mock')) return 'Replace with real service connection';
    if (violation.includes('evidence')) return 'Run evidence prompt now';
    if (violation.includes('scope')) return 'Revert changes exceeding limits';
    return 'Review framework requirements and fix';
  }

  private recommendPattern(state: any, analysis: any): string {
    if (!state.tasks.realServicesConnected) return 'PATTERN-001: Real Service First';
    if (state.drsScore < 70) return 'PATTERN-002: DRS Recovery';
    if (analysis.context.projectState === 'DEBUG') return 'PATTERN-003: Minimal Debug';
    if (analysis.context.projectState === 'ENHANCEMENT') return 'PATTERN-004: Additive Enhancement';
    return 'PATTERN-005: Incremental Progress';
  }

  private getDecisionMatrix(state: any, analysis: any): string {
    if (analysis.frameworkViolations.length > 0) {
      return '🔴 **BLOCKED** → Run `verify` then `blocked` to fix violations';
    }
    if (state.drsScore >= 85 && state.tasks.completionPercentage >= 90) {
      return '🟢 **DEPLOY** → Run `deploy_decide` for deployment assessment';
    }
    if (state.drsScore < 70) {
      return '🟡 **RECOVER** → Run `decline` for recovery mode';
    }
    if (!state.tasks.realServicesConnected) {
      return '🟡 **CONNECT** → Connect real services before continuing';
    }
    return '🟢 **CONTINUE** → Run `plan` for next development step';
  }

  private getNextPrompts(state: any, analysis: any): string[] {
    if (analysis.frameworkViolations.length > 0) return ['verify', 'blocked'];
    if (state.drsScore >= 85) return ['deploy_decide', 'pr'];
    if (state.drsScore < 70) return ['decline', 'assess'];
    return ['decide', 'plan', 'evidence'];
  }

  private makeActionDecision(state: any, analysis: any): any {
    // Complex decision logic based on current state
    if (state.drsScore < 85 && analysis.context.projectState === 'DEPLOY') {
      return {
        situation: 'Deployment requested but DRS below threshold',
        mode: 'CRITICAL_PATH',
        action: 'Focus on highest-impact DRS improvements',
        pattern: 'PATTERN-DRS-RECOVERY',
        timeEstimate: 30,
        drsImpact: `+${Math.min(15, 85 - state.drsScore)} points`,
        scopeEstimate: '2-3 files, 50-100 LOC',
        confidence: 'HIGH',
        reason: 'Clear path to deployment readiness',
        logic: `DRS ${state.drsScore} < 85 threshold. Must improve before deployment.`,
        riskLevel: 'LOW',
        successProbability: '85%',
        target: 'DRS improvement',
        alternatives: [
          { action: 'Postpone deployment', time: 0, impact: '0', risk: 'LOW' },
          { action: 'Emergency fixes only', time: 15, impact: '+5', risk: 'MEDIUM' }
        ]
      };
    }
    
    // Add more decision branches...
    return {
      situation: 'Standard development',
      mode: 'DEVELOPMENT',
      action: 'Continue with next task',
      pattern: 'PATTERN-INCREMENTAL',
      timeEstimate: 30,
      drsImpact: '+5-10 points',
      scopeEstimate: '2-3 files, 100 LOC',
      confidence: 'MEDIUM',
      reason: 'Normal progression',
      logic: 'No special conditions detected',
      riskLevel: 'MEDIUM',
      successProbability: '75%',
      target: 'next task'
    };
  }

  private getNextTimeGate(sessionDuration: number): string {
    if (sessionDuration < 30) return '30-minute gate in ' + (30 - sessionDuration) + ' minutes';
    if (sessionDuration < 60) return '60-minute gate in ' + (60 - sessionDuration) + ' minutes';
    if (sessionDuration < 90) return '90-minute gate in ' + (90 - sessionDuration) + ' minutes';
    if (sessionDuration < 120) return '120-minute gate in ' + (120 - sessionDuration) + ' minutes';
    return 'All gates passed or expired';
  }

  private generateImplementationPlan(decision: any, state: any, analysis: any): string {
    return `
1. **Preparation** (2 minutes)
   - Review current state with \`assess\`
   - Confirm pattern selection
   - Set evidence timer

2. **Implementation** (${decision.timeEstimate - 7} minutes)
   - Apply ${decision.pattern || 'selected pattern'}
   - Make minimal changes for maximum impact
   - Focus on ${decision.target}
   - Stay within scope limits

3. **Validation** (5 minutes)
   - Run tests
   - Capture evidence
   - Check DRS impact
   - Verify framework compliance
`;
  }

  private getImmediateSteps(decision: any, state: any): string[] {
    return [
      `Set ${decision.timeEstimate}-minute timer`,
      `Document decision in orchestration.md`,
      `Open required files (max ${decision.scopeEstimate.split(',')[0].match(/\d+/)?.[0] || 3})`,
      'Begin with smallest possible change'
    ];
  }

  private getExecutionSteps(decision: any, state: any): string[] {
    return [
      `Apply ${decision.pattern} pattern exactly`,
      'Make changes incrementally with frequent saves',
      'Test after each significant change',
      'Monitor scope (files and LOC)'
    ];
  }

  private getValidationSteps(decision: any, state: any): string[] {
    return [
      'Run all tests',
      'Capture evidence of success',
      'Calculate new DRS score',
      'Update progress in tasks.md'
    ];
  }

  private getPatternImplementation(pattern: string | undefined): string {
    if (!pattern) return 'Review PATTERNS.md and select appropriate pattern';
    
    // Pattern-specific implementation guidance
    const implementations: Record<string, string> = {
      'PATTERN-DRS-RECOVERY': `
1. Identify lowest-scoring DRS components
2. Focus on quick wins (evidence, mocks, tests)
3. Fix one component completely before moving to next
4. Verify DRS improvement after each fix`,
      'PATTERN-INCREMENTAL': `
1. Make smallest possible working change
2. Test immediately
3. Commit if successful
4. Repeat until goal achieved`,
      'PATTERN-REAL-SERVICE': `
1. Identify all mock dependencies
2. Replace with real service one at a time
3. Test after each replacement
4. Document real endpoints used`
    };
    
    return implementations[pattern] || 'Follow pattern documentation exactly';
  }

  private getSuccessCriteria(decision: any, state: any): string[] {
    return [
      `DRS improved by at least ${decision.drsImpact}`,
      'No new framework violations introduced',
      'All tests passing',
      'Evidence captured',
      `Completed within ${decision.timeEstimate} minutes`,
      'Scope within limits'
    ];
  }

  private getExecutionPrompt(decision: any): string {
    const modeToPrompt: Record<string, string> = {
      'CRITICAL_PATH': 'decline',
      'ENHANCEMENT': 'enhance',
      'DEBUG': 'correct',
      'DEVELOPMENT': 'plan',
      'DEPLOY': 'deploy_decide'
    };
    
    return modeToPrompt[decision.mode] || 'assess';
  }

  private getCurrentEvidenceAge(state: any): number {
    if (state.evidence.length === 0) return 999;
    return Math.round((Date.now() - Math.max(...state.evidence.map((e: any) => e.timestamp.getTime()))) / (1000 * 60));
  }

  private assessComplexity(scopeEstimate: any): string {
    const { files, loc } = scopeEstimate;
    if (files <= 2 && loc <= 50) return 'SIMPLE';
    if (files <= 5 && loc <= 200) return 'MODERATE';
    return 'COMPLEX';
  }

  private generateScopeBreakdown(feature: string, scopeEstimate: any): string {
    const chunks = Math.ceil(scopeEstimate.files / 5);
    return `
Break into ${chunks} sessions:
${Array.from({ length: chunks }, (_, i) => `
Session ${i + 1}:
- Files: ${Math.min(5, scopeEstimate.files - i * 5)}
- LOC: ${Math.min(200, Math.ceil(scopeEstimate.loc / chunks))}
- Focus: ${this.getChunkFocus(feature, i)}
`).join('\n')}`;
  }

  private getChunkFocus(feature: string, index: number): string {
    const focuses = ['Core data model', 'Business logic', 'API integration', 'UI components', 'Tests and docs'];
    return focuses[index] || `Part ${index + 1}`;
  }

  // ... Continue with more helper methods for other prompts

  // Stub implementations for remaining prompts (to be enhanced similarly)
  private async executeSetContextPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    // Enhanced implementation similar to above
    return this.createEnhancedPromptResult('SET_CONTEXT', 'Set Context', state, analysis);
  }

  private async executeResumePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('RESUME', 'Resume Work', state, analysis);
  }

  private async executePlanPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('PLAN', 'Plan Next Win', state, analysis);
  }

  private async executeBlockedPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('BLOCKED', 'Handle Blockers', state, analysis);
  }

  private async executeDeployPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('DEPLOY', 'Deploy to Production', state, analysis);
  }

  private async executeDebugPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('DEBUG', 'Debug Issues', state, analysis);
  }

  private async executeHandoffPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('HANDOFF', 'End Session', state, analysis);
  }

  private async executeEvidencePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('EVIDENCE', 'Generate Evidence', state, analysis);
  }

  private async executeCheckpointPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('CHECKPOINT', 'Time Gate Validation', state, analysis);
  }

  private async executeDeclinePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('DECLINE', 'DRS Degradation Response', state, analysis);
  }

  private async executeUncertaintyPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('UNCERTAINTY', 'Request Human Guidance', state, analysis);
  }

  private async executePRPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('PR', 'Generate Pull Request', state, analysis);
  }

  private async executeDeployDecidePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return this.createEnhancedPromptResult('DEPLOY_DECIDE', 'Deployment Decision', state, analysis);
  }

  private createEnhancedPromptResult(id: string, name: string, state: any, analysis: any): PromptExecutionResult {
    return {
      promptId: id,
      promptName: name,
      executed: true,
      output: `Enhanced ${name} prompt (full implementation pending)`,
      context: this.extractContext(state, analysis),
      recommendations: [],
      nextActions: [],
      confidence: analysis.confidence
    };
  }

  // Additional helper methods for enhanced functionality
  private getEnhancementPhase1(feature: string, scope: any): string {
    return `
- Set up data structures
- Define interfaces/contracts (additive only)
- Create placeholder functions
- Add configuration entries`;
  }

  private getEnhancementPhase2(feature: string, scope: any): string {
    return `
- Implement core business logic
- Connect to real services
- Add error handling
- Write unit tests`;
  }

  private getEnhancementPhase3(feature: string, scope: any): string {
    return `
- Integrate with existing code
- Add integration tests
- Update documentation
- Capture final evidence`;
  }

  private getRealServiceStrategy(feature: string): string {
    return `
   - Identify required endpoints
   - Use existing service clients
   - Add retry logic for resilience
   - Log all service interactions`;
  }

  private getTestingRequirements(feature: string): string {
    return `
   - Unit tests for all new functions
   - Integration tests with real services
   - Negative test cases
   - Performance benchmarks if applicable`;
  }

  private getEnhancementRisks(feature: string, scope: any, state: any): string {
    const risks = [];
    
    if (scope.files > 3) risks.push('**MEDIUM**: Scope approaching limits');
    if (state.drsScore < 75) risks.push('**HIGH**: Low DRS may degrade further');
    if (!state.tasks.realServicesConnected) risks.push('**CRITICAL**: No real services to integrate with');
    if (state.orchestration.timeRemaining < scope.loc / 5) risks.push('**HIGH**: May not complete in time');
    
    return risks.length > 0 ? 
      `### Identified Risks\n${risks.map(r => `- ${r}`).join('\n')}` :
      '### Risk Assessment: LOW\nNo significant risks identified.';
  }

  private selectEnhancementPattern(feature: string): string {
    if (feature.includes('auth')) return 'PATTERN-AUTH-ENHANCEMENT';
    if (feature.includes('api')) return 'PATTERN-API-INTEGRATION';
    if (feature.includes('ui')) return 'PATTERN-UI-COMPONENT';
    return 'PATTERN-GENERIC-ENHANCEMENT';
  }

  private getEnhancementPatternSteps(feature: string): string {
    return `
1. Review pattern documentation in PATTERNS.md
2. Create feature branch (optional)
3. Apply pattern structure exactly
4. Test at each pattern checkpoint
5. Document pattern application in orchestration.md`;
  }

  private getEnhancementStartCommand(feature: string): string {
    return `# Start implementing ${feature}
# First, verify current state
git status
npm test

# Then begin implementation
# Remember: additive changes only!`;
  }

  private getEnhancementConfidenceReason(scope: any, state: any): string {
    if (scope.files > 5 || scope.loc > 200) return 'Scope exceeds framework limits';
    if (state.drsScore < 70) return 'DRS too low for safe enhancement';
    if (state.drsScore >= 70 && scope.files <= 3) return 'Good DRS and manageable scope';
    return 'Moderate scope with acceptable risk';
  }

  private getEnhancementConcern(scope: any, state: any): string {
    if (scope.files > 5) return 'Too many files will violate framework';
    if (state.drsScore < 70) return 'Low DRS indicates existing issues';
    return 'Enhancement may introduce unexpected complexity';
  }

  private performRootCauseAnalysis(issue: string, state: any): string {
    return `
**Symptom**: ${issue}
**Category**: ${this.categorizeIssue(issue)}
**Likely Cause**: ${this.identifyLikelyCause(issue, state)}
**Evidence**: ${this.gatherIssueEvidence(issue, state)}
**Hypothesis**: ${this.formHypothesis(issue, state)}`;
  }

  private categorizeIssue(issue: string): string {
    if (issue.includes('timeout') || issue.includes('slow')) return 'Performance';
    if (issue.includes('error') || issue.includes('exception')) return 'Error Handling';
    if (issue.includes('fail') || issue.includes('test')) return 'Test Failure';
    if (issue.includes('connect') || issue.includes('network')) return 'Connectivity';
    return 'General Bug';
  }

  private identifyLikelyCause(issue: string, state: any): string {
    const category = this.categorizeIssue(issue);
    const causes: Record<string, string> = {
      'Performance': 'Inefficient algorithm or resource contention',
      'Error Handling': 'Unhandled edge case or invalid input',
      'Test Failure': 'Changed behavior or environment difference',
      'Connectivity': 'Network issue or service unavailable',
      'General Bug': 'Logic error or state inconsistency'
    };
    return causes[category] || 'Unknown - requires investigation';
  }

  private gatherIssueEvidence(issue: string, state: any): string {
    return `
- Error logs available: ${state.logs?.errors ? 'Yes' : 'No'}
- Test results: ${state.tests?.failing || 0} failing
- Last working commit: ${state.git?.lastGoodCommit || 'Unknown'}
- Related files: ${this.identifyRelatedFiles(issue)}`;
  }

  private identifyRelatedFiles(issue: string): string {
    // Simplified - would need actual analysis
    return 'To be determined through investigation';
  }

  private formHypothesis(issue: string, state: any): string {
    return `Based on the symptom "${issue}" and current state, the most likely cause is ${this.identifyLikelyCause(issue, state).toLowerCase()}. This should be verified by examining the specific error location and testing the fix.`;
  }

  private getMinimalFixApproach(issue: string, severity: string): string {
    if (severity === 'critical') return 'Emergency patch - absolute minimum change';
    if (severity === 'high') return 'Targeted fix - address root cause only';
    return 'Standard fix - clean solution without refactoring';
  }

  private estimateFixFiles(issue: string, severity: string): number {
    if (severity === 'critical') return 1;
    if (severity === 'high') return 2;
    return 2;
  }

  private estimateFixLOC(issue: string, severity: string): number {
    if (severity === 'critical') return 10;
    if (severity === 'high') return 25;
    return 30;
  }

  private getIsolationCommands(issue: string): string {
    return `# Reproduce the issue
npm test -- --grep "${issue}"

# Check recent changes
git diff HEAD~1

# Find error location
grep -r "${issue}" --include="*.js" --include="*.ts"`;
  }

  private getMinimalFixSteps(issue: string, severity: string): string {
    return `
1. Locate exact error point
2. Identify minimal change needed
3. Apply fix (${this.estimateFixLOC(issue, severity)} LOC max)
4. Test immediately
5. Revert if scope grows`;
  }

  private generateRegressionTest(issue: string): string {
    return `// Regression test for: ${issue}
describe('Regression: ${issue}', () => {
  it('should not ${issue}', () => {
    // Setup
    const testCase = setupTestCase();
    
    // Execute
    const result = performAction(testCase);
    
    // Verify
    expect(result).not.toThrow();
    expect(result).toBeDefined();
  });
});`;
  }

  private getVerificationSteps(issue: string): string {
    return `
1. Run regression test
2. Run related test suite
3. Manual verification if applicable
4. Check error logs cleared
5. Confirm no new issues introduced`;
  }

  private getTestCommand(state: any): string {
    if (state.package?.scripts?.test) return 'npm test';
    if (state.package?.scripts?.test) return 'yarn test';
    return '# Configure test command in package.json';
  }

  private getEvidenceCaptureCommand(issue: string): string {
    return `# Capture evidence
mkdir -p evidence/$(date +%Y%m%d_%H%M%S)
echo "Issue: ${issue}" > evidence/$(date +%Y%m%d_%H%M%S)/fix.md
npm test 2>&1 | tee evidence/$(date +%Y%m%d_%H%M%S)/test-results.txt`;
  }

  private getFixConfidence(issue: string, severity: string, state: any): string {
    if (severity === 'critical' && state.drsScore < 70) return 'LOW';
    if (severity === 'high' && !state.tests?.passing) return 'LOW';
    if (this.categorizeIssue(issue) === 'General Bug') return 'MEDIUM';
    return 'HIGH';
  }

  private getFixConfidenceReason(issue: string, severity: string, state: any): string {
    const confidence = this.getFixConfidence(issue, severity, state);
    if (confidence === 'HIGH') return 'Clear issue with known fix approach';
    if (confidence === 'MEDIUM') return 'Standard issue but needs investigation';
    return 'Complex issue or poor system state';
  }

  private getFixConcern(issue: string, severity: string): string {
    if (severity === 'critical') return 'May require emergency measures beyond normal scope';
    return 'Root cause may be deeper than initially apparent';
  }

  private getFixAlternative(issue: string): string {
    return 'Investigate further with debugging tools before attempting fix';
  }

  private getTimeGateStatus(state: any): string {
    const duration = Math.round((Date.now() - state.orchestration.sessionStartTime.getTime()) / (1000 * 60));
    if (duration < 30) return 'Not yet at first gate';
    if (duration < 60) return '30min gate passed';
    if (duration < 90) return '60min gate passed';
    if (duration < 120) return '90min gate passed';
    return 'All gates passed';
  }

  private checkEvidenceCadence(state: any): boolean {
    if (state.evidence.length === 0) return false;
    const age = this.getCurrentEvidenceAge(state);
    return age <= 35; // 5-minute grace period
  }

  private getEvidenceCadenceDetails(state: any): string {
    if (state.evidence.length === 0) return 'No evidence captured yet';
    const age = this.getCurrentEvidenceAge(state);
    if (age <= 30) return 'On schedule';
    if (age <= 35) return 'Due soon';
    return `Overdue by ${age - 30} minutes`;
  }

  private getServiceConnectionDetails(state: any): string {
    if (state.tasks.realServicesConnected) {
      return `Connected to ${state.tasks.connectedServices?.length || 0} services`;
    }
    return 'No real services connected';
  }

  private getPartialProgressDetails(state: any): string {
    return `${state.tasks.completionPercentage}% complete, ${state.tasks.remainingTasks || 0} tasks remaining`;
  }

  private checkMockExpiry(state: any): boolean {
    if ((state.todos?.mockCount || 0) === 0) return true;
    return (state.todos?.oldestMockAge || 0) < 30;
  }

  private getMockDetails(state: any): string {
    if ((state.todos?.mockCount || 0) === 0) return 'No mocks in use';
    return `${state.todos?.mockCount || 0} mocks, oldest: ${state.todos?.oldestMockAge || 0} min`;
  }

  private checkTodoExpiry(state: any): boolean {
    return (state.todos?.allHaveExpiry ?? true) !== false;
  }

  private getTodoDetails(state: any): string {
    return `${state.todos?.count || 0} TODOs, ${state.todos?.withoutExpiry || 0} without expiry`;
  }

  private getPriorityDetails(state: any): string {
    return `${state.todos?.critical || 0} critical, ${state.todos?.high || 0} high priority`;
  }

  private checkAllGatesGreen(state: any): boolean {
    return state.deploy?.allGatesGreen === true;
  }

  private getGateDetails(state: any): string {
    if (state.deploy?.allGatesGreen) return 'All deployment gates passed';
    return `${state.deploy?.failedGates?.length || 0} gates failing`;
  }

  private getChecklistDetails(state: any): string {
    if (state.deploy?.checklistComplete) return 'All items checked';
    return `${state.deploy?.checklistRemaining || 'Unknown'} items remaining`;
  }

  private getViolationSeverity(violation: string): string {
    if (violation.includes('contract') || violation.includes('Contract')) return 'CRITICAL';
    if (violation.includes('mock') || violation.includes('Mock')) return 'HIGH';
    if (violation.includes('evidence') || violation.includes('Evidence')) return 'MEDIUM';
    return 'LOW';
  }

  private getViolationDRSImpact(violation: string): number {
    const severity = this.getViolationSeverity(violation);
    const impacts: Record<string, number> = {
      'CRITICAL': -20,
      'HIGH': -10,
      'MEDIUM': -5,
      'LOW': -2
    };
    return impacts[severity] || -5;
  }

  private getViolationFixTime(violation: string): number {
    const severity = this.getViolationSeverity(violation);
    const times: Record<string, number> = {
      'CRITICAL': 10,
      'HIGH': 15,
      'MEDIUM': 10,
      'LOW': 5
    };
    return times[severity] || 10;
  }

  private getViolationRootCause(violation: string): string {
    if (violation.includes('contract')) return 'Contracts were not frozen at session start';
    if (violation.includes('mock')) return 'Mocks were not replaced with real services in time';
    if (violation.includes('evidence')) return 'Evidence capture was missed or delayed';
    if (violation.includes('scope')) return 'Changes exceeded session limits';
    return 'Framework requirement was not followed';
  }

  private getViolationFixCommands(violation: string): string {
    if (violation.includes('contract')) {
      return `# Freeze contracts immediately
find . -name "*.contract.*" -exec sha256sum {} \\; > contract-hashes.txt
git add contract-hashes.txt
git commit -m "FREEZE: Contract hashes locked"`;
    }
    if (violation.includes('mock')) {
      return `# Replace mocks with real services
# 1. Identify all mocks
grep -r "mock" --include="*.js" --include="*.ts"
# 2. Replace with real service calls
# 3. Test with real endpoints`;
    }
    if (violation.includes('evidence')) {
      return `# Capture evidence now
mkdir -p evidence/$(date +%Y%m%d_%H%M%S)
# Capture API responses, test results, metrics
npm test 2>&1 | tee evidence/$(date +%Y%m%d_%H%M%S)/test-results.txt`;
    }
    return '# Review framework requirements and fix accordingly';
  }

  private getViolationVerificationCommands(violation: string): string {
    return `# Verify fix
npm test
./ai-framework/reference/bash/drs-calculate.sh
mcp.execute("verify")`;
  }

  private getTrend(start: number, current: number, inverse: boolean = false): string {
    const diff = current - start;
    if (inverse) {
      if (diff < 0) return '📈 Improving';
      if (diff > 0) return '📉 Degrading';
    } else {
      if (diff > 0) return '📈 Improving';
      if (diff < 0) return '📉 Degrading';
    }
    return '➡️ Stable';
  }

  private assessImpactScope(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return 'System-wide impact';
      case 'high': return 'Module-level impact';
      case 'medium': return 'Function-level impact';
      case 'low': return 'Isolated impact';
      default: return 'Unknown scope';
    }
  }

  // SETUP - Complete Framework Initialization (Non-Kiro)
  private async executeSetupPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const projectType = additionalContext?.projectType || 'general';
    const projectName = additionalContext?.projectName || 'unnamed-project';
    const description = additionalContext?.description || 'Project description not provided';
    
    const output = `
## 🏗️ COMPLETE AI FRAMEWORK INITIALIZATION

**⚠️ CRITICAL**: This is for Claude Code/VSCode users. Kiro users have built-in workflow.

### INITIALIZATION OVERVIEW
- **Project**: ${projectName}
- **Type**: ${projectType}
- **Description**: ${description}
- **Environment**: Non-Kiro (requires manual setup)

### PHASE 1: CREATE ALL FRAMEWORK FILES

Run this complete initialization script:

\`\`\`bash
#!/bin/bash
# AI Framework Complete Setup Script

echo "🚀 Initializing AI Framework..."

# Create directory structure
mkdir -p ai-framework/templates
mkdir -p ai-framework/evidence
mkdir -p ai-framework/reference

# 1. Create requirements.md
cat > ai-framework/templates/requirements.md << 'EOF'
# Requirements

## Mission
${description}

## Success Criteria (The ONE Test)
- [ ] Primary functionality works end-to-end with real services
- [ ] Error cases handled appropriately
- [ ] Can be deployed to production (DRS ≥ 85)

## Acceptance Test
\`\`\`bash
# This test proves completion
npm test -- --grep "primary feature works"
\`\`\`

## Out of Scope
- Performance optimization (unless critical)
- UI polish beyond functional
- Features not in mission statement
- Premature abstractions

## Technical Constraints
- Max 5 files per session
- Max 200 LOC per session
- Real services only after 30 min
- Contracts frozen after init
EOF

# 2. Create design.md
cat > ai-framework/templates/design.md << 'EOF'
# Design

## Architecture Decision
${this.getArchitectureForType(projectType)}

## Interface Contracts (FROZEN)
\`\`\`typescript
// These CANNOT change without CCR
${this.getInterfaceForType(projectType)}
\`\`\`

## Data Flow
1. Input validation
2. Business logic processing
3. Service integration
4. Response generation
5. Error handling

## Integration Points
- External services identified
- Authentication method chosen
- Data persistence strategy set

## Security
- Input validation required
- Authentication enforced
- Rate limiting implemented
- No sensitive data in logs
EOF

# 3. Create tasks.md
cat > ai-framework/templates/tasks.md << 'EOF'
# Tasks

## Current Sprint
Implement ${description}

## Progress
- Overall: 0%
- Current Task: 0%
- Confidence: MEDIUM

## Task Breakdown
1. [ ] Set up project structure (0%)
2. [ ] Implement core logic (0%)
3. [ ] Add service integration (0%)
4. [ ] Error handling (0%)
5. [ ] Testing & validation (0%)

## Definition of Done
- [ ] Tests passing
- [ ] Real services connected
- [ ] Error handling complete
- [ ] Evidence captured
- [ ] DRS ≥ 85
EOF

# 4. Create orchestration.md
cat > ai-framework/templates/orchestration.md << 'EOF'
# Orchestration

## Session State
- Mode: INITIAL
- Start: $(date -Iseconds)
- Time Remaining: 120 minutes
- Contract Hash: PENDING
- Pattern: NOT_SELECTED

## Time Gates
- [ ] 30min: Real services connected
- [ ] 60min: Working demo
- [ ] 90min: DRS ≥ 70
- [ ] 120min: Deploy ready

## Rules
- Contracts FROZEN
- Real services ONLY after 30min
- Evidence EVERY 30min
- Scope ≤5 files, ≤200 LOC
EOF

# 5. Create other required templates
echo "# TODOs

## Blockers
- [ ] Select pattern (Expires: 30min)
- [ ] Connect real service (Expires: 30min)

## Mocks
- Count: 0
- Oldest: N/A" > ai-framework/templates/todos.md

echo "# Progress

## Completion: 0%

### Components
- Requirements: 100% ✅
- Design: 100% ✅
- Implementation: 0% ⏳
- Testing: 0% ⏳
- Deployment: 0% ⏳" > ai-framework/templates/progress.md

echo "# Code

## Implementation
Not started

## Key Files
None yet

## Services
- Real: NOT_CONNECTED
- Mocks: NONE" > ai-framework/templates/code.md

echo "# Deploy

## Status
- Ready: NO
- DRS: 0/100
- Gates: 0/4

## Checklist
- [ ] DRS ≥ 85
- [ ] Tests pass
- [ ] Real services
- [ ] Evidence fresh
- [ ] Contracts unchanged" > ai-framework/templates/deploy.md

# 6. Freeze contracts
find . -name "*.contract.*" -o -name "*.interface.*" | xargs sha256sum > contract-hashes.txt
echo "Contracts frozen at: $(date)" >> contract-hashes.txt

# 7. Git commit
git add ai-framework/templates/*.md contract-hashes.txt
git commit -m "INIT: AI Framework initialized with frozen contracts"

echo "✅ Framework initialization complete!"
echo ""
echo "Next steps:"
echo "1. Run 'start' to begin session"
echo "2. Run 'select_pattern' to choose implementation pattern"
echo "3. Run 'assess' to verify setup"
\`\`\`

### VERIFICATION

After running the script above, verify:

\`\`\`bash
# Check all files exist
ls -la ai-framework/templates/*.md | wc -l
# Should output: 10

# Check contracts frozen
cat contract-hashes.txt
# Should show hash values

# Verify git tracking
git status
# Should show clean working tree
\`\`\`

### NEXT ACTIONS

1. **Run \`start\`** - Begin your first session
2. **Run \`select_pattern\`** - Choose implementation approach
3. **Run \`assess\`** - Verify everything is ready

### ⚠️ CRITICAL REMINDERS

- Contracts are NOW FROZEN - no changes!
- 30-minute timer starts with \`start\`
- Must connect real services by 30 minutes
- Evidence required every 30 minutes

You're now protected by the framework. Trust the process.
`;

    return {
      promptId: 'SETUP',
      promptName: 'Complete Framework Setup',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [
        'Run the setup script completely',
        'Verify all files created',
        'Commit with contracts frozen',
        'Run start to begin'
      ],
      nextActions: ['start', 'select_pattern', 'assess'],
      confidence: 'HIGH' as 'HIGH' | 'MEDIUM' | 'LOW'
    };
  }

  // SELECT_PATTERN - Pattern Selection and Enforcement
  private async executeSelectPatternPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const task = additionalContext?.task || 'current implementation';
    const context = additionalContext?.context || analysis.context.projectState;
    
    const output = `
## 🎯 PATTERN SELECTION AND APPLICATION

### TASK CONTEXT
- **Task**: ${task}
- **Context**: ${context}
- **Current State**: ${analysis.context.projectState}
- **DRS Score**: ${state.drsScore}/100

### PATTERN ANALYSIS

Based on your context, here are applicable patterns:

${this.analyzePatterns(task, context, state, analysis)}

### RECOMMENDED PATTERN

**Pattern**: ${this.selectBestPattern(task, context, state, analysis)}

${this.getPatternDetails(this.selectBestPattern(task, context, state, analysis))}

### IMPLEMENTATION STEPS

${this.getPatternImplementationSteps(this.selectBestPattern(task, context, state, analysis), task)}

### PATTERN ENFORCEMENT

To apply this pattern:

\`\`\`bash
# 1. Document pattern selection
echo "Pattern: ${this.selectBestPattern(task, context, state, analysis)}" >> ai-framework/templates/orchestration.md
echo "Selected at: $(date)" >> ai-framework/templates/orchestration.md
echo "For task: ${task}" >> ai-framework/templates/orchestration.md

# 2. Create pattern checklist
cat >> ai-framework/templates/tasks.md << 'EOF'

## Pattern Checklist: ${this.selectBestPattern(task, context, state, analysis)}
- [ ] Pattern structure followed
- [ ] Key principles applied
- [ ] Anti-patterns avoided
- [ ] Success criteria met
EOF

# 3. Commit pattern selection
git add ai-framework/templates/orchestration.md ai-framework/templates/tasks.md
git commit -m "PATTERN: Selected ${this.selectBestPattern(task, context, state, analysis)} for ${task}"
\`\`\`

### PATTERN RULES

1. **Once selected, follow completely** - No mixing patterns
2. **Document deviations** - If you must deviate, document why
3. **Validate at checkpoints** - Ensure pattern is working
4. **Switch only between tasks** - Never mid-implementation

### SUCCESS CRITERIA

This pattern succeeds when:
${this.getPatternSuccessCriteria(this.selectBestPattern(task, context, state, analysis))}

### ANTI-PATTERNS TO AVOID

${this.getAntiPatterns(this.selectBestPattern(task, context, state, analysis))}

### CONFIDENCE ASSESSMENT

**Pattern Match Confidence**: ${this.getPatternConfidence(task, context, state, analysis)}
**Success Probability**: ${this.getPatternSuccessProbability(task, context, state, analysis)}
**Risk Level**: ${this.getPatternRisk(task, context, state, analysis)}

Remember: Patterns prevent chaos. Trust the pattern.
`;

    return {
      promptId: 'SELECT_PATTERN',
      promptName: 'Pattern Selection',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [
        `Apply ${this.selectBestPattern(task, context, state, analysis)} pattern`,
        'Document in orchestration.md',
        'Follow pattern completely',
        'Validate at checkpoints'
      ],
      nextActions: ['plan', 'enhance', 'correct'],
      confidence: this.getPatternConfidence(task, context, state, analysis) as 'HIGH' | 'MEDIUM' | 'LOW'
    };
  }

  // EMERGENCY - Contract Change Required (LAST RESORT)
  private async executeEmergencyPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const reason = additionalContext?.reason || 'Not specified';
    const justification = additionalContext?.justification || 'Not provided';
    
    const output = `
## 🚨🚨🚨 EMERGENCY: CONTRACT CHANGE REQUEST 🚨🚨🚨

### ⛔ WARNING: LAST RESORT ONLY ⛔

**This action breaks the fundamental framework rule. Proceed ONLY if:**
- Security vulnerability requires interface change
- Legal compliance mandates change
- Production system failure without alternative

### CURRENT SITUATION
- **Reason**: ${reason}
- **Justification**: ${justification}
- **Current DRS**: ${state.drsScore}/100
- **Contracts Frozen**: ${state.orchestration.contractHash ? 'YES' : 'NO'}

### IMPACT ANALYSIS

Changing contracts will:
1. **Reset DRS to 0** - Start over completely
2. **Invalidate all tests** - Must rewrite
3. **Break integrations** - Must reconnect
4. **Void evidence** - Must recapture
5. **Reset progress** - Back to 0%

### CCR (Contract Change Request) PROCESS

${state.orchestration.contractHash ? `
#### Step 1: Document Current State
\`\`\`bash
# Save current contract hashes
cp contract-hashes.txt contract-hashes.backup.$(date +%s).txt

# Document current DRS
echo "Pre-CCR DRS: ${state.drsScore}" > ccr-impact.md
echo "Pre-CCR Progress: ${state.tasks.completionPercentage}%" >> ccr-impact.md

# Backup current state
tar -czf pre-ccr-backup.$(date +%s).tar.gz ai-framework/
\`\`\`

#### Step 2: File CCR
\`\`\`bash
cat > CCR-$(date +%Y%m%d-%H%M%S).md << 'EOF'
# Contract Change Request

## Requester
- Date: $(date)
- Reason: ${reason}
- Justification: ${justification}

## Current State
- DRS: ${state.drsScore}/100
- Progress: ${state.tasks.completionPercentage}%
- Session Time: ${Math.round((Date.now() - state.orchestration.sessionStartTime.getTime()) / (1000 * 60))} minutes

## Proposed Changes
[Specify exact contract changes needed]

## Impact Assessment
- Tests affected: ALL
- Integration points: ALL
- Timeline impact: +2-4 hours minimum
- Risk: EXTREME

## Alternatives Considered
1. [Alternative 1 - why not viable]
2. [Alternative 2 - why not viable]
3. [Alternative 3 - why not viable]

## Approval
- [ ] Technical Lead
- [ ] Product Owner
- [ ] Security (if applicable)

## Rollback Plan
Restore from pre-ccr-backup if change fails
EOF
\`\`\`

#### Step 3: Make Contract Changes
\`\`\`bash
# ONLY after CCR approved
# Make minimal required changes to contracts

# Update interface files
# [Make your changes]

# Freeze new contracts
find . -name "*.contract.*" -o -name "*.interface.*" | xargs sha256sum > contract-hashes.txt
echo "Contracts re-frozen after CCR at: $(date)" >> contract-hashes.txt
\`\`\`

#### Step 4: Reset Framework State
\`\`\`bash
# Reset DRS
echo "DRS reset to 0 due to CCR" > ai-framework/templates/deploy.md

# Reset progress
echo "Progress reset to 0% due to CCR" > ai-framework/templates/progress.md

# Clear evidence
rm -rf ai-framework/evidence/*
echo "Evidence cleared due to CCR" > ai-framework/evidence/RESET.md

# Update orchestration
echo "CONTRACT_CHANGED: CCR applied at $(date)" >> ai-framework/templates/orchestration.md
\`\`\`

#### Step 5: Full Regression
\`\`\`bash
# Rerun ALL tests
npm test

# Reconnect ALL services
# [Reconnection steps]

# Recapture ALL evidence
# [Evidence capture]
\`\`\`
` : `
### ❌ CANNOT PROCEED

Contracts are not yet frozen. Run these first:
1. Complete initial setup
2. Freeze contracts with sha256sum
3. Then reassess if change truly needed
`}

### ALTERNATIVES TO CONSIDER

Before proceeding with CCR, have you tried:

1. **Adapter Pattern** - Wrap existing contract
2. **Extension Pattern** - Add new endpoints/methods
3. **Version Pattern** - New version alongside old
4. **Configuration Pattern** - Use config for flexibility
5. **Feature Flag** - Toggle between implementations

### RECOVERY IF CCR PROCEEDS

If you proceed with contract change:
1. Expect 2-4 hours additional work
2. All progress resets to zero
3. Must pass all gates again
4. Evidence must be recaptured
5. DRS must reach 85 again

### ABORT OPTION

**TO ABORT THIS EMERGENCY**:
\`\`\`bash
echo "CCR aborted - seeking alternative solution" >> ai-framework/templates/orchestration.md
# Then run:
mcp.execute("assess")  # Reassess situation
mcp.execute("uncertainty", { uncertainty: "Need alternative to contract change" })
\`\`\`

### FINAL WARNING

⚠️ **Contract changes are the #1 cause of project failure** ⚠️

Consider:
- Is this truly unavoidable?
- Have ALL alternatives been exhausted?
- Is the impact worth the reset?
- Can this wait until next major version?

**Default action if unsure: DON'T CHANGE CONTRACTS**
`;

    return {
      promptId: 'EMERGENCY',
      promptName: 'Emergency Contract Change',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [
        'AVOID if at all possible',
        'Try adapter pattern first',
        'Document everything if proceeding',
        'Expect full reset of progress'
      ],
      nextActions: ['assess', 'uncertainty', 'blocked'],
      confidence: 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW'
    };
  }

  // Helper methods for new prompts
  private getArchitectureForType(projectType: string): string {
    const architectures: Record<string, string> = {
      'api': 'RESTful API with stateless design',
      'web': 'Component-based frontend with service layer',
      'cli': 'Command pattern with plugin architecture',
      'microservice': 'Domain-driven microservice',
      'general': 'Modular monolith with clear boundaries'
    };
    return architectures[projectType] || architectures['general'];
  }

  private getInterfaceForType(projectType: string): string {
    const interfaces: Record<string, string> = {
      'api': `interface Request {
  method: string;
  path: string;
  body?: any;
  headers?: Record<string, string>;
}

interface Response {
  status: number;
  data?: any;
  error?: string;
}`,
      'web': `interface Props {
  // Component props
}

interface State {
  // Component state
}`,
      'general': `interface Input {
  // Define input structure
}

interface Output {
  // Define output structure
}`
    };
    return interfaces[projectType] || interfaces['general'];
  }

  private analyzePatterns(task: string, context: string, state: any, analysis: any): string {
    const patterns = [
      { name: 'PATTERN-001: Real Service First', score: 0, reason: '' },
      { name: 'PATTERN-002: Incremental Progress', score: 0, reason: '' },
      { name: 'PATTERN-003: Test-Driven', score: 0, reason: '' },
      { name: 'PATTERN-004: Minimal Change', score: 0, reason: '' },
      { name: 'PATTERN-005: Recovery Mode', score: 0, reason: '' }
    ];

    // Score patterns based on context
    if (!state.tasks.realServicesConnected) {
      patterns[0].score = 100;
      patterns[0].reason = 'No real services connected yet';
    }
    
    if (state.drsScore < 70) {
      patterns[4].score = 95;
      patterns[4].reason = 'DRS below 70 requires recovery';
    }
    
    if (context === 'DEBUG' || task.includes('fix')) {
      patterns[3].score = 90;
      patterns[3].reason = 'Bug fix requires minimal change';
    }
    
    // Default to incremental
    patterns[1].score = Math.max(80, patterns[1].score);
    patterns[1].reason = 'Safe default for most tasks';

    // Sort by score
    patterns.sort((a, b) => b.score - a.score);

    return patterns.slice(0, 3).map(p => 
      `- **${p.name}** (Match: ${p.score}%)\n  Reason: ${p.reason}`
    ).join('\n\n');
  }

  private selectBestPattern(task: string, context: string, state: any, analysis: any): string {
    if (!state.tasks.realServicesConnected) return 'PATTERN-001: Real Service First';
    if (state.drsScore < 70) return 'PATTERN-005: Recovery Mode';
    if (context === 'DEBUG') return 'PATTERN-004: Minimal Change';
    if (context === 'ENHANCEMENT') return 'PATTERN-002: Incremental Progress';
    return 'PATTERN-002: Incremental Progress';
  }

  private getPatternDetails(pattern: string): string {
    const details: Record<string, string> = {
      'PATTERN-001: Real Service First': `
**Purpose**: Establish real connections before any other work
**Key Rules**:
- No mocks allowed
- Connect simplest service first
- Validate with health check
- Capture connection evidence`,
      'PATTERN-002: Incremental Progress': `
**Purpose**: Small, validated steps toward goal
**Key Rules**:
- Change ≤50 LOC at a time
- Test after each change
- Commit working increments
- Maintain DRS at each step`,
      'PATTERN-004: Minimal Change': `
**Purpose**: Fix issues with smallest possible change
**Key Rules**:
- Change only what's broken
- No refactoring
- Add regression test
- Document fix reason`,
      'PATTERN-005: Recovery Mode': `
**Purpose**: Restore DRS to deployable level
**Key Rules**:
- Fix highest-impact issues first
- Remove all mocks
- Complete missing evidence
- No new features until DRS ≥ 85`
    };
    return details[pattern] || 'Pattern details not found';
  }

  private getPatternImplementationSteps(pattern: string, task: string): string {
    const steps: Record<string, string> = {
      'PATTERN-001: Real Service First': `
1. Identify simplest service to connect
2. Find/create real endpoint
3. Implement basic connection
4. Add health check
5. Capture evidence of connection
6. Remove any related mocks`,
      'PATTERN-002: Incremental Progress': `
1. Break ${task} into tiny steps
2. Implement first step (<50 LOC)
3. Test the step works
4. Commit if successful
5. Move to next step
6. Repeat until complete`,
      'PATTERN-004: Minimal Change': `
1. Locate exact problem area
2. Make smallest fix possible
3. Add test that catches issue
4. Verify fix works
5. Check nothing else broken
6. Document what was fixed`,
      'PATTERN-005: Recovery Mode': `
1. List all DRS issues
2. Sort by impact (highest first)
3. Fix #1 issue completely
4. Recalculate DRS
5. If < 85, fix next issue
6. Repeat until DRS ≥ 85`
    };
    return steps[pattern] || `1. Review pattern documentation\n2. Apply to ${task}\n3. Validate at checkpoints`;
  }

  private getPatternSuccessCriteria(pattern: string): string {
    const criteria: Record<string, string> = {
      'PATTERN-001: Real Service First': `- Real service responds successfully
- No mocks remain for this service
- Health check passes
- Evidence captured`,
      'PATTERN-002: Incremental Progress': `- Each increment works independently
- Tests pass after each step
- DRS maintained or improved
- Progress measurable`,
      'PATTERN-004: Minimal Change': `- Issue fixed with <50 LOC
- No unrelated changes
- Regression test prevents recurrence
- All existing tests still pass`,
      'PATTERN-005: Recovery Mode': `- DRS reaches 85+
- All mocks removed
- Evidence current (<2h)
- Can deploy`
    };
    return criteria[pattern] || '- Pattern applied successfully\n- Task completed\n- No violations';
  }

  private getAntiPatterns(pattern: string): string {
    const antiPatterns: Record<string, string> = {
      'PATTERN-001: Real Service First': `❌ Using mocks "temporarily"
❌ Simulating service responses
❌ Hardcoding test data
❌ Skipping health checks`,
      'PATTERN-002: Incremental Progress': `❌ Big bang changes
❌ "I'll test it all at the end"
❌ Mixing multiple features
❌ Skipping commits`,
      'PATTERN-004: Minimal Change': `❌ "While I'm here" refactoring
❌ Fixing multiple issues at once
❌ Improving code style
❌ Adding new features`,
      'PATTERN-005: Recovery Mode': `❌ Adding new features
❌ Ignoring DRS score
❌ Keeping "just one mock"
❌ Skipping evidence`
    };
    return antiPatterns[pattern] || '❌ Not following pattern\n❌ Mixing patterns\n❌ Skipping validation';
  }

  private getPatternConfidence(task: string, context: string, state: any, analysis: any): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (state.drsScore < 50) return 'LOW';
    if (!state.tasks.realServicesConnected && context !== 'INITIAL') return 'LOW';
    if (analysis.frameworkViolations.length > 2) return 'LOW';
    if (analysis.frameworkViolations.length > 0) return 'MEDIUM';
    return 'HIGH';
  }

  private getPatternSuccessProbability(task: string, context: string, state: any, analysis: any): string {
    const confidence = this.getPatternConfidence(task, context, state, analysis);
    if (confidence === 'HIGH') return '85-95%';
    if (confidence === 'MEDIUM') return '60-80%';
    return '30-50%';
  }

  private getPatternRisk(task: string, context: string, state: any, analysis: any): string {
    if (state.drsScore < 50) return 'HIGH - System unstable';
    if (analysis.frameworkViolations.length > 0) return 'MEDIUM - Violations present';
    return 'LOW - Clear path forward';
  }

  // Implementation stubs for init prompts (delegating to setup executor concepts)
  private async executeInitRequirementsPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    return {
      promptId: 'INIT_REQUIREMENTS',
      promptName: 'Initialize Requirements',
      executed: true,
      output: 'See SETUP prompt for complete initialization',
      context: this.extractContext(state, analysis),
      recommendations: ['Use SETUP for complete init'],
      nextActions: ['setup'],
      confidence: 'HIGH'
    };
  }

  private async executeInitDesignPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    return {
      promptId: 'INIT_DESIGN',
      promptName: 'Initialize Design',
      executed: true,
      output: 'See SETUP prompt for complete initialization',
      context: this.extractContext(state, analysis),
      recommendations: ['Use SETUP for complete init'],
      nextActions: ['setup'],
      confidence: 'HIGH'
    };
  }

  private async executeInitTasksPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    return {
      promptId: 'INIT_TASKS',
      promptName: 'Initialize Tasks',
      executed: true,
      output: 'See SETUP prompt for complete initialization',
      context: this.extractContext(state, analysis),
      recommendations: ['Use SETUP for complete init'],
      nextActions: ['setup'],
      confidence: 'HIGH'
    };
  }
}