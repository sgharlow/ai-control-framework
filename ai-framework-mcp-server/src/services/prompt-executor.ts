/**
 * Prompt Executor Service
 * Executes specific ai-framework prompts with context injection
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

export class PromptExecutor {
  private frameworkStateReader: FrameworkStateReader;
  private contextAnalyzer: ContextAnalyzer;

  constructor() {
    this.frameworkStateReader = new FrameworkStateReader();
    this.contextAnalyzer = new ContextAnalyzer();
  }

  /**
   * Execute a specific prompt based on its ID
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
      
      case 'VERIFY':
      case 'E':
      case 'E_VERIFY':
        return this.executeVerifyPrompt(state, analysis, workingPath);
      
      case 'BLOCKED':
      case 'F':
      case 'F_BLOCKED':
        return this.executeBlockedPrompt(state, analysis, workingPath);
      
      case 'DEPLOY':
      case 'G':
      case 'G_DEPLOY':
        return this.executeDeployPrompt(state, analysis, workingPath);
      
      case 'DEBUG':
      case 'H':
      case 'H_DEBUG':
        return this.executeDebugPrompt(state, analysis, workingPath);
      
      case 'HANDOFF':
      case 'I':
      case 'I_HANDOFF':
        return this.executeHandoffPrompt(state, analysis, workingPath);
      
      case 'EVIDENCE':
      case 'K':
      case 'K_EVIDENCE':
        return this.executeEvidencePrompt(state, analysis, workingPath);
      
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
        return this.executeUncertaintyPrompt(state, analysis, workingPath);
      
      case 'PR':
      case 'PR_READY':
      case 'O':
      case 'O_PR_READY':
        return this.executePRPrompt(state, analysis, workingPath);
      
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
      
      case 'DEPLOY_DECIDE':
      case 'T':
      case 'T_DEPLOY_DECIDE':
        return this.executeDeployDecidePrompt(state, analysis, workingPath);
      
      default:
        throw new Error(`Unknown prompt ID: ${promptId}`);
    }
  }

  // A. START - Initialize Session
  private async executeStartPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const output = [
      '📋 INITIALIZING AI FRAMEWORK SESSION',
      '',
      '1. Loading orchestration.md...',
      `   - Session Mode: ${state.orchestration.sessionMode}`,
      `   - Contract Hash: ${state.orchestration.contractHash || 'NOT SET'}`,
      '',
      '2. Setting first gate (30 minutes)...',
      `   - Time Remaining: ${state.orchestration.timeRemaining} minutes`,
      '',
      '3. Declaring initial confidence...',
      `   - Confidence: ${analysis.confidence}`,
      `   - Framework Compliance: ${analysis.context.frameworkCompliance ? 'YES' : 'NO'}`,
      '',
      '✅ Session initialized. Ready to begin development.'
    ].join('\n');

    return {
      promptId: 'START',
      promptName: 'Initialize Session',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [
        'Review PATTERNS.md and select applicable pattern',
        'Verify contract hashes are frozen',
        'Check for any existing mocks that need replacement'
      ],
      nextActions: ['B_SET_CONTEXT', 'P_ASSESS', 'Q_DECIDE'],
      confidence: analysis.confidence
    };
  }

  // B. SET CONTEXT - Rules of Engagement
  private async executeSetContextPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const output = [
      '📚 FRAMEWORK RULES OF ENGAGEMENT',
      '',
      '1. orchestration.md governs ALL actions - check every 10-15 minutes',
      '2. Declare confidence with each decision (level + reason + question)',
      '3. Check PATTERNS.md before implementing anything',
      '4. Contracts are FROZEN - any changes require CCR',
      '',
      'CURRENT CONTEXT:',
      `- DRS Score: ${state.drsScore}/100`,
      `- Project State: ${analysis.context.projectState}`,
      `- Completion: ${state.tasks.completionPercentage}%`,
      `- Framework Compliance: ${analysis.context.frameworkCompliance ? 'YES' : 'NO'}`,
      '',
      `Violations: ${analysis.frameworkViolations.length > 0 ? analysis.frameworkViolations.join(', ') : 'None'}`
    ].join('\n');

    return {
      promptId: 'SET_CONTEXT',
      promptName: 'Set Context',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: analysis.recommendations,
      nextActions: ['P_ASSESS', 'Q_DECIDE', 'D_PLAN'],
      confidence: analysis.confidence
    };
  }

  // C. RESUME - Re-enter Safely
  private async executeResumePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    let scriptResults = {
      canContinue: 'UNKNOWN',
      drsScore: state.drsScore,
      gitDiff: 'No changes detected'
    };

    // Try to run framework scripts if available
    try {
      const canContinuePath = path.join(workingPath, 'ai-framework', 'reference', 'bash', 'can-i-continue.sh');
      if (fs.existsSync(canContinuePath)) {
        const result = execSync(`bash "${canContinuePath}"`, { cwd: workingPath, encoding: 'utf8' });
        scriptResults.canContinue = result.includes('CONTINUE') ? 'YES' : 'NO';
      }
    } catch (error) {
      // Script failed, use fallback analysis
      scriptResults.canContinue = analysis.context.frameworkCompliance ? 'YES' : 'NO';
    }

    const output = [
      '🔄 RESUMING WORK - SAFETY CHECK',
      '',
      '1. Can I Continue Check:',
      `   - Result: ${scriptResults.canContinue}`,
      `   - Framework Compliance: ${analysis.context.frameworkCompliance ? 'YES' : 'NO'}`,
      '',
      '2. DRS Score:',
      `   - Current: ${state.drsScore}/100`,
      `   - Target: 85+`,
      `   - Status: ${state.drsScore >= 85 ? '✅ READY' : '⚠️ NEEDS WORK'}`,
      '',
      '3. Contract Verification:',
      `   - Hash: ${state.orchestration.contractHash || 'NOT SET'}`,
      `   - Changes: ${scriptResults.gitDiff}`,
      '',
      '4. Applicable Patterns:',
      `   - Based on ${analysis.context.projectState} state`,
      `   - Confidence: ${analysis.confidence}`,
      '',
      '5. Partial Progress:',
      `   - Completion: ${state.tasks.completionPercentage}%`,
      `   - Can add ≥10% this session: ${state.orchestration.timeRemaining >= 30 ? 'YES' : 'NO'}`,
      '',
      scriptResults.canContinue === 'YES' && state.drsScore >= 70 && analysis.confidence !== 'LOW' ?
        '✅ SAFE TO CONTINUE' : '⚠️ REVIEW REQUIRED BEFORE CONTINUING'
    ].join('\n');

    return {
      promptId: 'RESUME',
      promptName: 'Resume Work',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: analysis.recommendations,
      nextActions: scriptResults.canContinue === 'YES' ? ['D_PLAN', 'Q_DECIDE'] : ['P_ASSESS', 'E_VERIFY'],
      confidence: analysis.confidence
    };
  }

  // D. PLAN - Smallest Next Win
  private async executePlanPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const output = [
      '📋 PLANNING SMALLEST NEXT WIN',
      '',
      'CURRENT STATE:',
      `- DRS Score: ${state.drsScore}/100`,
      `- Completion: ${state.tasks.completionPercentage}%`,
      `- Time Remaining: ${state.orchestration.timeRemaining} minutes`,
      '',
      'HIGHEST IMPACT ACTIONS (by DRS improvement):',
      ...analysis.criticalPath.map((action: string, index: number) => 
        `${index + 1}. ${action}`
      ),
      '',
      'RECOMMENDED NEXT WIN:',
      `- Action: ${analysis.criticalPath[0] || 'Complete current task'}`,
      `- Estimated Impact: +${Math.min(10, 100 - state.drsScore)} DRS points`,
      `- Time Required: ~15 minutes`,
      `- Pattern to Apply: Check PATTERNS.md for applicable pattern`,
      '',
      `Confidence: ${analysis.confidence}`
    ].join('\n');

    return {
      promptId: 'PLAN',
      promptName: 'Plan Next Win',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: analysis.recommendations,
      nextActions: ['Execute planned action', 'K_EVIDENCE', 'E_VERIFY'],
      confidence: analysis.confidence
    };
  }

  // E. VERIFY - Compliance Audit
  private async executeVerifyPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const violations = analysis.frameworkViolations;
    const output = [
      '🔍 FRAMEWORK COMPLIANCE AUDIT',
      '',
      '1. orchestration.md Compliance:',
      `   - Mode Rules Followed: ${state.orchestration.sessionMode ? 'YES' : 'NO'}`,
      `   - Time Gates Met: ${state.orchestration.timeRemaining > 0 ? 'YES' : 'NO'}`,
      `   - Evidence Cadence: ${state.evidence.length > 0 ? 'YES' : 'NO'}`,
      `   - Confidence Declared: ${analysis.confidence !== 'UNKNOWN' ? 'YES' : 'NO'}`,
      `   - Patterns Checked: ${state.orchestration.patternUsed ? 'YES' : 'NO'}`,
      '',
      '2. tasks.md Compliance:',
      `   - Real Service Connections: ${state.tasks.realServicesConnected ? 'YES' : 'NO'}`,
      `   - DoD Met: ${state.tasks.completionPercentage >= 100 ? 'YES' : 'NO'}`,
      `   - Partial Progress Tracked: YES`,
      `   - Confidence ≥ MEDIUM: ${analysis.confidence !== 'LOW' ? 'YES' : 'NO'}`,
      '',
      '3. todos.md Compliance:',
      `   - Mocks < 72h: ${(state.todos?.mockCount || 0) === 0 ? 'YES' : 'CHECK'}`,
      '',
      '4. deploy.md Compliance:',
      `   - All Gates Green: ${state.drsScore >= 85 ? 'YES' : 'NO'}`,
      `   - DRS ≥ 85: ${state.drsScore >= 85 ? 'YES' : 'NO'}`,
      '',
      violations.length > 0 ? 
        `⚠️ VIOLATIONS DETECTED:\n${violations.map((v: string) => `   - ${v}`).join('\n')}` :
        '✅ FULLY COMPLIANT',
      '',
      `Overall Compliance: ${violations.length === 0 ? '✅ PASS' : '❌ FAIL'}`
    ].join('\n');

    return {
      promptId: 'VERIFY',
      promptName: 'Verify Work',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: violations.length > 0 ? 
        ['Address violations before continuing', ...analysis.recommendations] : 
        analysis.recommendations,
      nextActions: violations.length > 0 ? ['F_BLOCKED', 'N_UNCERTAINTY'] : ['D_PLAN', 'K_EVIDENCE'],
      confidence: analysis.confidence
    };
  }

  // P. ASSESS - Comprehensive Project State Analysis
  private async executeAssessPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const healthStatus = this.calculateHealthStatus(state, analysis);
    
    const output = [
      '📊 COMPREHENSIVE PROJECT STATE ANALYSIS',
      '',
      '=== FRAMEWORK COMPLIANCE ===',
      `Session State: ${state.orchestration.sessionMode || 'UNKNOWN'}`,
      `DRS Score: ${state.drsScore}/100 (target: ≥85)`,
      `Completion: ${state.tasks.completionPercentage}%`,
      `Evidence Age: ${state.evidence.length > 0 ? 
        Math.round((Date.now() - Math.max(...state.evidence.map((e: any) => e.timestamp.getTime()))) / (1000 * 60)) + ' minutes' : 
        'No evidence'}`,
      '',
      '=== TECHNICAL HEALTH ===',
      `Real Services: ${state.tasks.realServicesConnected ? '✅' : '❌'}`,
      `Contract Integrity: ${state.orchestration.contractHash ? '✅' : '⚠️'}`,
      `Security Status: ${analysis.context.securityValidation ? '✅' : '⚠️'}`,
      `Architecture Stable: ${analysis.context.architectureStable ? '✅' : '⚠️'}`,
      `Production Ready: ${state.drsScore >= 85 ? '✅' : '❌'}`,
      `Scope Compliance: ${analysis.context.scopeCompliance ? '✅' : '❌'}`,
      '',
      '=== PROGRESS ANALYSIS ===',
      `Next Milestone: ${this.getNextMilestone(state.tasks.completionPercentage)}`,
      `Session Time Remaining: ${state.orchestration.timeRemaining} minutes`,
      `Confidence Level: ${analysis.confidence}`,
      '',
      '=== DECISION MATRIX OUTPUT ===',
      `Project Health: ${healthStatus}`,
      `DRS Score: ${state.drsScore}/100 (threshold: 85)`,
      `Completion: ${state.tasks.completionPercentage}%`,
      `Session Time: ${state.orchestration.timeRemaining} min remaining`,
      `Confidence: ${analysis.confidence}`,
      `Recommended Action: ${this.getRecommendedAction(state, analysis)}`,
      `Next Session Type: ${this.getNextSessionType(state, analysis)}`,
      `Time Estimate: ${this.getTimeEstimate(state, analysis)} minutes`,
      '',
      analysis.frameworkViolations.length > 0 ?
        `Blockers:\n${analysis.frameworkViolations.map((v: string) => `  - ${v}`).join('\n')}` :
        'Blockers: None'
    ].join('\n');

    return {
      promptId: 'ASSESS',
      promptName: 'Comprehensive Project Assessment',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: analysis.recommendations,
      nextActions: this.getNextActionsFromAssessment(state, analysis),
      confidence: analysis.confidence
    };
  }

  // Q. DECIDE - Automatic Next Action Selection
  private async executeDecidePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const decision = this.makeActionDecision(state, analysis);
    
    const output = [
      '🎯 AUTOMATIC NEXT ACTION SELECTION',
      '',
      `Situation Analysis: ${decision.situation}`,
      `Recommended Mode: ${decision.mode}`,
      `Next Action: ${decision.action}`,
      decision.pattern ? `Pattern to Apply: ${decision.pattern}` : '',
      `Time Estimate: ${decision.timeEstimate} minutes`,
      `Expected DRS Impact: ${decision.drsImpact}`,
      `Scope Estimate: ${decision.scopeEstimate}`,
      `Confidence: ${decision.confidence} - ${decision.reason}`,
      '',
      '=== DECISION LOGIC ===',
      decision.logic,
      '',
      decision.alternative ? `Alternative: ${decision.alternative}` : ''
    ].join('\n').replace(/\n\n+/g, '\n\n');

    return {
      promptId: 'DECIDE',
      promptName: 'Automatic Next Action Selection',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [decision.action, ...analysis.recommendations],
      nextActions: decision.nextPrompts,
      confidence: decision.confidence as 'HIGH' | 'MEDIUM' | 'LOW'
    };
  }

  // R. ENHANCE - Context-Aware Enhancement Handler
  private async executeEnhancePrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const feature = additionalContext?.feature || 'unspecified enhancement';
    const scopeEstimate = additionalContext?.scope_estimate || { files: 0, loc: 0 };
    
    const output = [
      '🚀 CONTEXT-AWARE ENHANCEMENT HANDLER',
      '',
      `Enhancement Request: ${feature}`,
      '',
      '=== PRE-ENHANCEMENT ASSESSMENT ===',
      '',
      '1. Scope Analysis:',
      `   - Feature Complexity: ${this.assessComplexity(scopeEstimate)}`,
      `   - Files Affected: ${scopeEstimate.files} (limit: 5)`,
      `   - LOC Estimate: ${scopeEstimate.loc} (limit: 200)`,
      `   - Scope Valid: ${scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 ? '✅' : '❌'}`,
      '',
      '2. Framework Impact:',
      `   - Contract Changes: NONE (frozen)`,
      `   - DRS Impact: Neutral/Positive expected`,
      `   - Real Services Required: YES`,
      '',
      '3. Session Planning:',
      `   - Time Required: ~${Math.ceil(scopeEstimate.loc / 10)} minutes`,
      `   - Evidence Points: Every 30 minutes`,
      `   - Pattern: Review PATTERNS.md for enhancement patterns`,
      '',
      '=== ENHANCEMENT RULES ===',
      '- ADDITIVE ONLY: New functionality, minimal existing changes',
      '- REAL SERVICES: No mocks beyond 30 minutes',
      '- SCOPE LIMITS: Max 5 files, 200 LOC per session',
      '- EVIDENCE REQUIRED: Capture proof every 30 minutes',
      '- DRS MAINTAINED: Must not degrade deployability',
      '',
      scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 ?
        '✅ READY TO PROCEED WITH ENHANCEMENT' :
        '⚠️ SCOPE TOO LARGE - BREAK INTO SMALLER CHUNKS',
      '',
      `Confidence: ${analysis.confidence}`
    ].join('\n');

    return {
      promptId: 'ENHANCE',
      promptName: 'Context-Aware Enhancement Handler',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 ?
        ['Begin enhancement implementation', 'Select pattern from PATTERNS.md', 'Set 30-minute evidence timer'] :
        ['Break enhancement into smaller chunks', 'Each chunk ≤5 files, ≤200 LOC'],
      nextActions: scopeEstimate.files <= 5 && scopeEstimate.loc <= 200 ?
        ['D_PLAN', 'K_EVIDENCE'] : ['P_ASSESS', 'Q_DECIDE'],
      confidence: analysis.confidence
    };
  }

  // S. CORRECT - Debugging and Correction Context
  private async executeCorrectPrompt(state: any, analysis: any, workingPath: string, additionalContext?: any): Promise<PromptExecutionResult> {
    const issue = additionalContext?.issue || 'unspecified issue';
    const severity = additionalContext?.severity || 'medium';
    
    const output = [
      '🔧 DEBUGGING AND CORRECTION CONTEXT',
      '',
      `Issue: ${issue}`,
      `Severity: ${severity.toUpperCase()}`,
      '',
      '=== ISSUE ANALYSIS ===',
      `Root Cause: ${this.analyzeRootCause(issue)}`,
      `Scope of Impact: ${this.assessImpactScope(severity)}`,
      `Framework Compliance: ${analysis.context.frameworkCompliance ? 'Maintained' : 'At Risk'}`,
      '',
      '=== MINIMAL CHANGE STRATEGY ===',
      '1. Identify smallest possible fix',
      '2. Ensure no scope expansion',
      '3. Verify no contract changes',
      '4. Add regression test',
      '',
      '=== CORRECTION EXECUTION ===',
      '- Mode: DEBUGGER (strict scope limits)',
      '- Change Rule: Minimum viable fix only',
      '- Test Requirement: Add regression test',
      '- Scope Limit: ≤3 files for bug fixes',
      '',
      `Files Affected: TBD (max 3)`,
      `Test Plan: Regression test for ${issue}`,
      `DRS Impact: Neutral or positive expected`,
      `Time Estimate: ${severity === 'critical' ? '30' : '15'} minutes`,
      '',
      `Confidence: ${analysis.confidence}`
    ].join('\n');

    return {
      promptId: 'CORRECT',
      promptName: 'Debugging and Correction Context',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: [
        'Implement minimal fix',
        'Add regression test',
        'Update evidence',
        'Verify DRS maintained'
      ],
      nextActions: ['H_DEBUG', 'K_EVIDENCE', 'E_VERIFY'],
      confidence: analysis.confidence
    };
  }

  // T. DEPLOY-DECIDE - Intelligent Deployment Decision
  private async executeDeployDecidePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const deploymentStatus = this.assessDeploymentReadiness(state, analysis);
    
    const output = [
      '🚀 INTELLIGENT DEPLOYMENT DECISION',
      '',
      `Deployment Status: ${deploymentStatus.status}`,
      `DRS Score: ${state.drsScore}/100`,
      '',
      '=== GATE STATUS ===',
      `- Framework Compliance: ${deploymentStatus.frameworkGate}`,
      `- Technical Validation: ${deploymentStatus.technicalGate}`,
      `- Quality Assurance: ${deploymentStatus.qualityGate}`,
      '',
      deploymentStatus.blockers.length > 0 ?
        `Blockers:\n${deploymentStatus.blockers.map((b: string) => `  - ${b}`).join('\n')}` :
        'Blockers: None',
      '',
      `Recommended Action: ${deploymentStatus.action}`,
      deploymentStatus.timeToReady ? `Time to Ready: ${deploymentStatus.timeToReady} minutes` : '',
      `Risk Assessment: ${deploymentStatus.risk}`,
      '',
      '=== DEPLOYMENT SCENARIOS ===',
      deploymentStatus.status === 'GREEN' ?
        '✅ GREEN LIGHT: Ready to deploy\n   - Execute: G_DEPLOY prompt' :
      deploymentStatus.status === 'YELLOW' ?
        '⚠️ YELLOW LIGHT: Minor fixes needed\n   - Address blockers (15-30 min)\n   - Re-run T_DEPLOY_DECIDE' :
        '❌ RED LIGHT: Significant work required\n   - Enter CRITICAL_PATH mode\n   - Focus on framework compliance',
      '',
      `Confidence: ${analysis.confidence}`
    ].join('\n').replace(/\n\n+/g, '\n\n');

    return {
      promptId: 'DEPLOY_DECIDE',
      promptName: 'Intelligent Deployment Decision',
      executed: true,
      output,
      context: this.extractContext(state, analysis),
      recommendations: deploymentStatus.recommendations,
      nextActions: deploymentStatus.nextActions,
      confidence: analysis.confidence
    };
  }

  // Helper methods for remaining prompts (F, G, H, I, K, L, M, N, O)
  private async executeBlockedPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const blockers = analysis.frameworkViolations.concat(state.todos.blockers || []);
    
    return {
      promptId: 'BLOCKED',
      promptName: 'Handle Blockers',
      executed: true,
      output: `🚫 HANDLING BLOCKERS\n\nBlockers Found:\n${blockers.map((b: string) => `- ${b}`).join('\n')}\n\nDiagnosis in progress...`,
      context: this.extractContext(state, analysis),
      recommendations: ['Resolve blockers', 'Run can-i-continue.sh', 'Check deploy.md gates'],
      nextActions: ['E_VERIFY', 'N_UNCERTAINTY'],
      confidence: 'LOW'
    };
  }

  private async executeDeployPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return {
      promptId: 'DEPLOY',
      promptName: 'Deploy to Production',
      executed: true,
      output: `🚀 DEPLOYING TO PRODUCTION\n\nDRS: ${state.drsScore}/100\nAll gates: ${state.drsScore >= 85 ? 'GREEN' : 'RED'}\n\n${state.drsScore >= 85 ? '✅ Proceeding with deployment' : '❌ Cannot deploy - DRS < 85'}`,
      context: this.extractContext(state, analysis),
      recommendations: state.drsScore >= 85 ? ['Execute deployment', 'Monitor metrics'] : ['Improve DRS first'],
      nextActions: state.drsScore >= 85 ? ['I_HANDOFF'] : ['P_ASSESS', 'M_DECLINE'],
      confidence: state.drsScore >= 85 ? 'HIGH' : 'LOW'
    };
  }

  private async executeDebugPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return {
      promptId: 'DEBUG',
      promptName: 'Debug Issues',
      executed: true,
      output: '🔍 DEBUG MODE\n\nMode: DEBUGGER\nScope: Minimum change only\nRequirement: Add regression test\n\nReady to debug with framework discipline.',
      context: this.extractContext(state, analysis),
      recommendations: ['Implement minimal fix', 'Add regression test', 'Update evidence'],
      nextActions: ['K_EVIDENCE', 'E_VERIFY'],
      confidence: 'MEDIUM'
    };
  }

  private async executeHandoffPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return {
      promptId: 'HANDOFF',
      promptName: 'End Session',
      executed: true,
      output: `📝 SESSION HANDOFF\n\nDRS: ${state.drsScore}/100\nCompletion: ${state.tasks.completionPercentage}%\nNext Action: ${analysis.recommendations[0] || 'Continue development'}\n\nSession ended. Handoff prepared.`,
      context: this.extractContext(state, analysis),
      recommendations: ['Commit with SESSION-END message', 'Update orchestration.md', 'Document next steps'],
      nextActions: [],
      confidence: 'HIGH'
    };
  }

  private async executeEvidencePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return {
      promptId: 'EVIDENCE',
      promptName: 'Generate Evidence',
      executed: true,
      output: '📸 GENERATING EVIDENCE\n\nRequired proofs:\n- Real connection\n- Integration correlation ID\n- Negative evidence\n- Performance metrics\n\nCapturing evidence now...',
      context: this.extractContext(state, analysis),
      recommendations: ['Capture API responses', 'Document test results', 'Save performance metrics'],
      nextActions: ['E_VERIFY', 'L_CHECKPOINT'],
      confidence: 'HIGH'
    };
  }

  private async executeCheckpointPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    const sessionDuration = Math.round((Date.now() - state.orchestration.sessionStartTime.getTime()) / (1000 * 60));
    const gates = {
      '30m': sessionDuration >= 30 ? (state.tasks.realServicesConnected ? '✅' : '❌') : '⏳',
      '60m': sessionDuration >= 60 ? (state.tasks.completionPercentage >= 25 ? '✅' : '❌') : '⏳',
      '90m': sessionDuration >= 90 ? (state.drsScore >= 70 ? '✅' : '❌') : '⏳',
      '120m': sessionDuration >= 120 ? (state.drsScore >= 85 ? '✅' : '❌') : '⏳'
    };

    return {
      promptId: 'CHECKPOINT',
      promptName: 'Time Gate Validation',
      executed: true,
      output: `⏱️ TIME GATE VALIDATION\n\nSession Duration: ${sessionDuration} minutes\n\nGates:\n- 30m: Real services connected? ${gates['30m']}\n- 60m: Working demo slice? ${gates['60m']}\n- 90m: DRS improving? ${gates['90m']}\n- 120m: Deploy-ready? ${gates['120m']}`,
      context: this.extractContext(state, analysis),
      recommendations: ['Continue if gates passed', 'Address failures immediately'],
      nextActions: Object.values(gates).includes('❌') ? ['F_BLOCKED', 'M_DECLINE'] : ['D_PLAN', 'K_EVIDENCE'],
      confidence: Object.values(gates).includes('❌') ? 'LOW' : 'HIGH'
    };
  }

  private async executeDeclinePrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return {
      promptId: 'DECLINE',
      promptName: 'DRS Degradation Response',
      executed: true,
      output: `📉 DRS DEGRADATION RESPONSE\n\nDRS Trend: ${state.drsScore}/100\nProgress: ${state.tasks.completionPercentage}%\nConfidence: ${analysis.confidence}\n\nRecovery Mode: No new work until trend reverses\nTarget: DRS ≥ 85 in 15 minutes or STOP`,
      context: this.extractContext(state, analysis),
      recommendations: ['Focus on DRS recovery', 'Remove mocks', 'Complete evidence'],
      nextActions: ['P_ASSESS', 'E_VERIFY'],
      confidence: 'LOW'
    };
  }

  private async executeUncertaintyPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return {
      promptId: 'UNCERTAINTY',
      promptName: 'Request Human Guidance',
      executed: true,
      output: `❓ REQUESTING HUMAN GUIDANCE\n\nConfidence: LOW/UNCERTAIN\nCompletion: ${state.tasks.completionPercentage}%\n\nSpecific uncertainty: Framework compliance unclear\nBest pattern match: Review PATTERNS.md\n\nNeed human input on:\n- How to proceed with current blockers\n- Which pattern to apply\n\nDefault in 5 min: Safe mode - run P_ASSESS`,
      context: this.extractContext(state, analysis),
      recommendations: ['Wait for human input', 'Review PATTERNS.md', 'Run assessment if no response'],
      nextActions: ['P_ASSESS'],
      confidence: 'LOW'
    };
  }

  private async executePRPrompt(state: any, analysis: any, workingPath: string): Promise<PromptExecutionResult> {
    return {
      promptId: 'PR',
      promptName: 'Generate Pull Request',
      executed: true,
      output: `📋 PULL REQUEST READY\n\nDRS: ${state.drsScore}/100\nCompletion: ${state.tasks.completionPercentage}%\n\nPR Checklist:\n- [ ] Contracts unchanged\n- [ ] Real services tested\n- [ ] Evidence attached\n- [ ] No TODOs without expiry\n\n${state.drsScore >= 85 ? '✅ Ready for PR' : '⚠️ Complete DRS requirements first'}`,
      context: this.extractContext(state, analysis),
      recommendations: state.drsScore >= 85 ? ['Create PR', 'Add evidence links'] : ['Improve DRS to 85+'],
      nextActions: state.drsScore >= 85 ? ['G_DEPLOY'] : ['P_ASSESS', 'E_VERIFY'],
      confidence: state.drsScore >= 85 ? 'HIGH' : 'MEDIUM'
    };
  }

  // Helper methods
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

  private getNextMilestone(completion: number): string {
    if (completion < 25) return 'Initial implementation (25%)';
    if (completion < 50) return 'Core functionality (50%)';
    if (completion < 75) return 'Feature complete (75%)';
    if (completion < 90) return 'Testing & polish (90%)';
    if (completion < 100) return 'Final validation (100%)';
    return 'Deployment ready';
  }

  private getRecommendedAction(state: any, analysis: any): string {
    if (analysis.frameworkViolations.length > 0) return 'ADDRESS_VIOLATIONS';
    if (state.drsScore < 70) return 'CRITICAL_PATH_RECOVERY';
    if (state.drsScore < 85) return 'IMPROVE_DRS';
    if (state.tasks.completionPercentage < 100) return 'CONTINUE_DEVELOPMENT';
    return 'DEPLOY';
  }

  private getNextSessionType(state: any, analysis: any): string {
    if (analysis.frameworkViolations.length > 0) return 'MAINTENANCE';
    if (state.drsScore < 85) return 'ENHANCEMENT';
    if (analysis.context.projectState === 'DEBUG') return 'DEBUG';
    return 'DEVELOPMENT';
  }

  private getTimeEstimate(state: any, analysis: any): number {
    if (analysis.frameworkViolations.length > 5) return 60;
    if (state.drsScore < 70) return 45;
    if (state.drsScore < 85) return 30;
    return 15;
  }

  private getNextActionsFromAssessment(state: any, analysis: any): string[] {
    if (analysis.frameworkViolations.length > 0) return ['E_VERIFY', 'F_BLOCKED', 'N_UNCERTAINTY'];
    if (state.drsScore >= 85) return ['T_DEPLOY_DECIDE', 'G_DEPLOY'];
    if (state.drsScore >= 70) return ['Q_DECIDE', 'D_PLAN', 'R_ENHANCE'];
    return ['P_ASSESS', 'M_DECLINE', 'N_UNCERTAINTY'];
  }

  private makeActionDecision(state: any, analysis: any): any {
    // DRS < 85 and deployment requested
    if (state.drsScore < 85 && analysis.context.projectState === 'DEPLOY') {
      return {
        situation: 'Deployment requested but DRS below threshold',
        mode: 'CRITICAL_PATH',
        action: 'Focus on highest-impact DRS improvements',
        pattern: 'PATTERN-RECOVERY',
        timeEstimate: 30,
        drsImpact: `+${Math.min(15, 85 - state.drsScore)} points`,
        scopeEstimate: '2-3 files, 50-100 LOC',
        confidence: 'HIGH',
        reason: 'Clear path to deployment readiness',
        logic: `DRS ${state.drsScore} < 85 threshold. Must improve before deployment.`,
        nextPrompts: ['M_DECLINE', 'E_VERIFY', 'K_EVIDENCE'],
        alternative: 'Postpone deployment, continue development'
      };
    }

    // New enhancement requested
    if (analysis.context.projectState === 'ENHANCEMENT') {
      return {
        situation: 'New enhancement requested',
        mode: 'ENHANCEMENT',
        action: 'Assess scope and plan enhancement with framework discipline',
        pattern: 'PATTERN-ENHANCEMENT',
        timeEstimate: 45,
        drsImpact: 'Neutral (maintain current)',
        scopeEstimate: '≤5 files, ≤200 LOC',
        confidence: 'MEDIUM',
        reason: 'Enhancement feasible within constraints',
        logic: 'Enhancement mode selected. Applying framework limits.',
        nextPrompts: ['R_ENHANCE', 'D_PLAN', 'K_EVIDENCE'],
        alternative: 'Complete current work first'
      };
    }

    // Bug/issue reported
    if (analysis.context.projectState === 'DEBUG' || analysis.frameworkViolations.length > 0) {
      return {
        situation: 'Issues detected requiring correction',
        mode: 'DEBUG',
        action: 'Apply minimal fixes with regression tests',
        pattern: 'PATTERN-DEBUG',
        timeEstimate: 20,
        drsImpact: '+5-10 points',
        scopeEstimate: '≤3 files, ≤50 LOC',
        confidence: 'HIGH',
        reason: 'Clear issues to resolve',
        logic: 'Debug mode activated. Minimal scope changes only.',
        nextPrompts: ['S_CORRECT', 'H_DEBUG', 'E_VERIFY'],
        alternative: null
      };
    }

    // System working well (DRS ≥ 85)
    if (state.drsScore >= 85) {
      return {
        situation: 'System deployment-ready',
        mode: 'OPTIMIZATION',
        action: 'Prepare for deployment or add strategic enhancements',
        pattern: 'PATTERN-DEPLOY',
        timeEstimate: 15,
        drsImpact: 'Maintain ≥85',
        scopeEstimate: 'Documentation and final checks',
        confidence: 'HIGH',
        reason: 'All gates green for deployment',
        logic: 'DRS ≥ 85. System ready for production.',
        nextPrompts: ['T_DEPLOY_DECIDE', 'G_DEPLOY', 'O_PR_READY'],
        alternative: 'Continue with enhancements'
      };
    }

    // Default: Continue development
    return {
      situation: 'Active development in progress',
      mode: 'DEVELOPMENT',
      action: 'Continue with next highest-value task',
      pattern: 'Review PATTERNS.md',
      timeEstimate: 30,
      drsImpact: '+5-15 points',
      scopeEstimate: '2-4 files, 100-150 LOC',
      confidence: 'MEDIUM',
      reason: 'Standard development progression',
      logic: 'No special conditions. Continue normal flow.',
      nextPrompts: ['D_PLAN', 'K_EVIDENCE', 'L_CHECKPOINT'],
      alternative: 'Run full assessment first'
    };
  }

  private assessComplexity(scopeEstimate: any): string {
    const { files, loc } = scopeEstimate;
    if (files <= 2 && loc <= 50) return 'SIMPLE';
    if (files <= 5 && loc <= 200) return 'MODERATE';
    return 'COMPLEX';
  }

  private analyzeRootCause(issue: string): string {
    // Simplified root cause analysis
    if (issue.toLowerCase().includes('timeout')) return 'Likely network or performance issue';
    if (issue.toLowerCase().includes('error')) return 'Exception in code logic';
    if (issue.toLowerCase().includes('fail')) return 'Test or validation failure';
    return 'Requires investigation';
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

  private assessDeploymentReadiness(state: any, analysis: any): any {
    const frameworkGate = state.drsScore >= 85 && 
                         analysis.context.frameworkCompliance && 
                         analysis.frameworkViolations.length === 0;
    
    const technicalGate = state.tasks.realServicesConnected && 
                          state.evidence.length > 0;
    
    const qualityGate = state.tasks.completionPercentage >= 90;

    const allGatesPass = frameworkGate && technicalGate && qualityGate;
    
    let status: string;
    let action: string;
    let risk: string;
    let timeToReady: number | undefined;
    const blockers: string[] = [];
    const recommendations: string[] = [];
    const nextActions: string[] = [];

    if (state.drsScore >= 85 && allGatesPass) {
      status = 'GREEN';
      action = 'DEPLOY';
      risk = 'LOW';
      recommendations.push('Proceed with deployment', 'Final health check', 'Monitor post-deployment');
      nextActions.push('G_DEPLOY', 'I_HANDOFF');
    } else if (state.drsScore >= 70) {
      status = 'YELLOW';
      action = 'FIX_AND_DEPLOY';
      risk = 'MEDIUM';
      timeToReady = 30;
      if (!frameworkGate) blockers.push('Framework compliance issues');
      if (!technicalGate) blockers.push('Technical validation incomplete');
      if (!qualityGate) blockers.push('Quality assurance pending');
      recommendations.push('Address specific gaps', 'Quick wins to reach DRS 85', 'Re-run deployment check');
      nextActions.push('E_VERIFY', 'K_EVIDENCE', 'T_DEPLOY_DECIDE');
    } else {
      status = 'RED';
      action = 'STOP';
      risk = 'HIGH';
      timeToReady = 60;
      blockers.push(`DRS too low: ${state.drsScore}/100`);
      if (!frameworkGate) blockers.push('Major framework violations');
      if (!technicalGate) blockers.push('No real service connections');
      recommendations.push('Enter CRITICAL_PATH mode', 'Focus on framework compliance', 'Rebuild confidence');
      nextActions.push('M_DECLINE', 'P_ASSESS', 'N_UNCERTAINTY');
    }

    return {
      status,
      action,
      risk,
      timeToReady,
      frameworkGate: frameworkGate ? 'PASS' : 'FAIL',
      technicalGate: technicalGate ? 'PASS' : 'FAIL',
      qualityGate: qualityGate ? 'PASS' : 'FAIL',
      blockers,
      recommendations,
      nextActions
    };
  }
}