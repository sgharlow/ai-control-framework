/**
 * Context Analyzer for AI Framework
 * Analyzes framework state to determine project context and recommend optimal actions
 * Stays true to ai-framework principles: DRS-focused, evidence-based, time-gated
 */

import { FrameworkState, PromptContext, OrchestrationData, TaskData } from '../types/framework-state.js';

export interface ContextAnalysisResult {
  context: PromptContext;
  recommendations: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  frameworkViolations: string[];
  nextGateDeadline: Date;
  criticalPath: string[];
}

export class ContextAnalyzer {
  /**
   * Analyze framework state and determine current context
   * Core ai-framework principle: Everything is DRS-focused and evidence-based
   */
  analyzeContext(state: FrameworkState): ContextAnalysisResult {
    const context = this.buildPromptContext(state);
    const violations = this.identifyFrameworkViolations(state);
    const recommendations = this.generateRecommendations(context, violations);
    const confidence = this.calculateConfidence(state, violations);
    const reasoning = this.buildReasoning(context, state, violations);
    const criticalPath = this.identifyCriticalPath(state, violations);

    return {
      context,
      recommendations,
      confidence,
      reasoning,
      frameworkViolations: violations,
      nextGateDeadline: state.orchestration.gateDeadline,
      criticalPath
    };
  }

  /**
   * Build PromptContext from FrameworkState
   * Maps framework state to context needed for prompt selection
   */
  private buildPromptContext(state: FrameworkState): PromptContext {
    const projectState = this.determineProjectState(state);
    const blockers = this.extractBlockers(state);
    const frameworkCompliance = this.checkFrameworkCompliance(state);
    const timeInSession = this.calculateTimeInSession(state.orchestration);
    const lastAction = this.determineLastAction(state);

    return {
      projectState,
      drsScore: state.drsScore,
      lastAction,
      timeInSession,
      blockers,
      frameworkCompliance,
      confidence: state.confidence,
      sessionMode: state.orchestration.sessionMode,
      completionPercentage: state.tasks.completionPercentage
    };
  }

  /**
   * Determine current project state based on DRS and task progress
   * ai-framework principle: DRS is the primary indicator of project health
   */
  private determineProjectState(state: FrameworkState): PromptContext['projectState'] {
    const { drsScore, tasks, orchestration } = state;

    // Check if we're in deployment phase (DRS >= 85)
    if (drsScore >= 85 && tasks.completionPercentage >= 90) {
      return 'DEPLOY';
    }

    // Check session mode for specific contexts
    if (orchestration.sessionMode === 'DEBUG') {
      return 'DEBUG';
    }

    if (orchestration.sessionMode === 'ENHANCEMENT') {
      return 'ENHANCEMENT';
    }

    // Determine based on progress and DRS
    if (tasks.completionPercentage === 0 && drsScore < 40) {
      return 'INITIAL';
    }

    if (tasks.completionPercentage > 0 || drsScore >= 40) {
      return 'DEVELOPMENT';
    }

    return 'INITIAL';
  }

  /**
   * Extract blockers from framework state
   * ai-framework principle: Blockers must be explicitly tracked and addressed
   */
  private extractBlockers(state: FrameworkState): string[] {
    const blockers: string[] = [];

    // Add explicit blockers from tasks
    for (const blocker of state.tasks.blockers) {
      blockers.push(blocker.description);
    }

    // Add framework-level blockers
    if (state.drsScore < 85 && this.isDeploymentRequested(state)) {
      blockers.push('DRS below deployment threshold (85)');
    }

    // Check for time gate violations
    const timeRemaining = state.orchestration.timeRemaining;
    if (timeRemaining <= 0) {
      blockers.push('Time gate exceeded - session should end');
    } else if (timeRemaining <= 5) {
      blockers.push('Approaching time gate deadline');
    }

    // Check for evidence staleness (ai-framework requires evidence < 2h)
    const evidenceAge = this.getEvidenceAge(state);
    if (evidenceAge > 120) { // 2 hours in minutes
      blockers.push('Evidence older than 2 hours - refresh required');
    }

    return blockers;
  }

  /**
   * Check framework compliance
   * ai-framework principle: Compliance is binary - you're either compliant or not
   */
  private checkFrameworkCompliance(state: FrameworkState): boolean {
    const violations = this.identifyFrameworkViolations(state);
    return violations.length === 0;
  }

  /**
   * Identify framework violations
   * Core ai-framework rules that must be enforced
   */
  identifyFrameworkViolations(state: FrameworkState): string[] {
    const violations: string[] = [];

    // Rule 1: DRS must be >= 85 for deployment
    if (this.isDeploymentRequested(state) && state.drsScore < 85) {
      violations.push(`DRS ${state.drsScore} below deployment threshold (85)`);
    }

    // Rule 2: Evidence must be fresh (< 2 hours)
    const evidenceAge = this.getEvidenceAge(state);
    if (evidenceAge > 120) {
      violations.push(`Evidence ${evidenceAge}min old, exceeds 2h limit`);
    }

    // Rule 3: Time gates must be respected
    if (state.orchestration.timeRemaining <= 0) {
      violations.push('Time gate exceeded - session must end');
    }

    // Rule 4: Confidence must be declared
    if (!state.confidence || state.confidence === 'LOW') {
      violations.push('Confidence not declared or too low');
    }

    // Rule 5: Session mode must be appropriate for work
    if (state.orchestration.sessionMode === 'DEBUG' && state.tasks.blockers.length === 0) {
      violations.push('DEBUG mode but no blockers identified');
    }

    // Rule 6: No mocks in production path (checked via DRS)
    // This is implicitly checked through DRS score

    return violations;
  }

  /**
   * Generate context-aware recommendations
   * ai-framework principle: Always provide actionable next steps
   */
  private generateRecommendations(context: PromptContext, violations: string[]): string[] {
    const recommendations: string[] = [];

    // Handle violations first (ai-framework principle: fix violations before new work)
    if (violations.length > 0) {
      recommendations.push('Address framework violations before continuing');
      
      for (const violation of violations.slice(0, 3)) { // Top 3 violations
        if (violation.includes('DRS')) {
          recommendations.push('Use T. DEPLOY-DECIDE to assess deployment readiness');
        } else if (violation.includes('Evidence')) {
          recommendations.push('Use K. EVIDENCE to refresh proof captures');
        } else if (violation.includes('Time gate')) {
          recommendations.push('Use I. HANDOFF to end session properly');
        } else if (violation.includes('Confidence')) {
          recommendations.push('Use N. UNCERTAINTY to request human guidance');
        }
      }
      
      return recommendations;
    }

    // Context-based recommendations
    switch (context.projectState) {
      case 'INITIAL':
        recommendations.push('Use A. START to initialize session properly');
        recommendations.push('Use P. ASSESS to understand project state');
        break;

      case 'DEVELOPMENT':
        if (context.completionPercentage < 50) {
          recommendations.push('Use Q. DECIDE to determine next development step');
          recommendations.push('Use D. PLAN to choose smallest next win');
        } else {
          recommendations.push('Use E. VERIFY to check compliance');
          recommendations.push('Use L. CHECKPOINT to validate progress');
        }
        break;

      case 'ENHANCEMENT':
        recommendations.push('Use R. ENHANCE to plan enhancement safely');
        recommendations.push('Use E. VERIFY to maintain compliance');
        break;

      case 'DEBUG':
        recommendations.push('Use S. CORRECT to debug with minimal scope');
        recommendations.push('Use H. DEBUG to apply minimal fixes');
        break;

      case 'DEPLOY':
        recommendations.push('Use T. DEPLOY-DECIDE for deployment assessment');
        recommendations.push('Use G. DEPLOY if all gates are green');
        break;
    }

    // Time-based recommendations (ai-framework principle: time gates matter)
    if (context.timeInSession > 90) { // 1.5 hours
      recommendations.push('Consider I. HANDOFF - approaching session limits');
    } else if (context.timeInSession > 60) { // 1 hour
      recommendations.push('Use L. CHECKPOINT to validate 60m gate');
    }

    // DRS-based recommendations (ai-framework principle: DRS drives decisions)
    if (context.drsScore < 70) {
      recommendations.push('Focus on DRS improvement before new features');
    } else if (context.drsScore >= 85) {
      recommendations.push('Consider deployment - DRS threshold met');
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Calculate confidence in current analysis
   * ai-framework principle: Always declare confidence with reasoning
   */
  private calculateConfidence(state: FrameworkState, violations: string[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    let confidenceScore = 100;

    // Reduce confidence for violations
    confidenceScore -= violations.length * 20;

    // Reduce confidence for low DRS
    if (state.drsScore < 50) {
      confidenceScore -= 20;
    }

    // Reduce confidence for stale evidence
    const evidenceAge = this.getEvidenceAge(state);
    if (evidenceAge > 60) { // 1 hour
      confidenceScore -= 15;
    }

    // Reduce confidence for blocked tasks
    if (state.tasks.blockers.length > 0) {
      confidenceScore -= 10;
    }

    // Reduce confidence for time pressure
    if (state.orchestration.timeRemaining < 15) {
      confidenceScore -= 15;
    }

    if (confidenceScore >= 80) return 'HIGH';
    if (confidenceScore >= 60) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Build reasoning for analysis
   * ai-framework principle: Decisions must be explainable
   */
  private buildReasoning(context: PromptContext, state: FrameworkState, violations: string[]): string {
    const reasons: string[] = [];

    // Project state reasoning
    reasons.push(`Project state: ${context.projectState} (DRS: ${context.drsScore}, Progress: ${context.completionPercentage}%)`);

    // Session context
    reasons.push(`Session: ${context.sessionMode}, ${context.timeInSession}min elapsed, ${state.orchestration.timeRemaining}min remaining`);

    // Framework compliance
    if (violations.length > 0) {
      reasons.push(`Framework violations: ${violations.length} found`);
    } else {
      reasons.push('Framework compliant');
    }

    // Evidence status
    const evidenceAge = this.getEvidenceAge(state);
    reasons.push(`Evidence: ${evidenceAge}min old (limit: 120min)`);

    // Blockers
    if (context.blockers.length > 0) {
      reasons.push(`Blockers: ${context.blockers.length} active`);
    }

    return reasons.join('; ');
  }

  /**
   * Identify critical path items
   * ai-framework principle: Focus on highest-impact work
   */
  private identifyCriticalPath(state: FrameworkState, violations: string[]): string[] {
    const criticalPath: string[] = [];

    // Violations are always critical path
    if (violations.length > 0) {
      criticalPath.push('Resolve framework violations');
    }

    // DRS improvements for deployment
    if (state.drsScore < 85 && this.isDeploymentRequested(state)) {
      criticalPath.push('Improve DRS to deployment threshold');
    }

    // Blocked tasks
    if (state.tasks.blockers.length > 0) {
      criticalPath.push('Unblock critical tasks');
    }

    // Time gate pressure
    if (state.orchestration.timeRemaining < 30) {
      criticalPath.push('Complete current work before time gate');
    }

    // Evidence refresh
    const evidenceAge = this.getEvidenceAge(state);
    if (evidenceAge > 90) { // 1.5 hours
      criticalPath.push('Refresh evidence captures');
    }

    return criticalPath;
  }

  // Helper methods

  private calculateTimeInSession(orchestration: OrchestrationData): number {
    const elapsed = Date.now() - orchestration.sessionStartTime.getTime();
    return Math.round(elapsed / (1000 * 60)); // minutes
  }

  private determineLastAction(state: FrameworkState): string {
    // Simple heuristic based on recent task activity
    const inProgressTasks = state.tasks.tasks.filter(t => t.status === 'in_progress');
    if (inProgressTasks.length > 0) {
      return `Working on: ${inProgressTasks[0].description}`;
    }

    const completedTasks = state.tasks.tasks.filter(t => t.status === 'completed');
    if (completedTasks.length > 0) {
      return `Completed: ${completedTasks[completedTasks.length - 1].description}`;
    }

    return 'Session started';
  }

  private isDeploymentRequested(state: FrameworkState): boolean {
    // Check if deployment is being considered
    return state.tasks.completionPercentage >= 90 ||
           state.drsScore >= 80; // Close to deployment threshold
  }

  private getEvidenceAge(state: FrameworkState): number {
    if (state.evidence.length === 0) {
      return 999; // No evidence = very old
    }

    // Find most recent evidence
    const mostRecent = state.evidence.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );

    const ageMs = Date.now() - mostRecent.timestamp.getTime();
    return Math.round(ageMs / (1000 * 60)); // minutes
  }

  /**
   * Get recommended prompt based on context
   * ai-framework principle: Context determines optimal action
   */
  getRecommendedPrompt(context: PromptContext, violations: string[]): string {
    // Handle violations first
    if (violations.length > 0) {
      if (violations.some(v => v.includes('Time gate'))) {
        return 'I. HANDOFF';
      }
      if (violations.some(v => v.includes('DRS'))) {
        return 'T. DEPLOY-DECIDE';
      }
      if (violations.some(v => v.includes('Evidence'))) {
        return 'K. EVIDENCE';
      }
      if (violations.some(v => v.includes('Confidence'))) {
        return 'N. UNCERTAINTY';
      }
      return 'E. VERIFY'; // General compliance check
    }

    // Context-based prompt selection
    switch (context.projectState) {
      case 'INITIAL':
        return context.completionPercentage === 0 ? 'A. START' : 'P. ASSESS';
      
      case 'DEVELOPMENT':
        if (context.completionPercentage < 25) {
          return 'Q. DECIDE';
        } else if (context.timeInSession > 60) {
          return 'L. CHECKPOINT';
        } else {
          return 'D. PLAN';
        }
      
      case 'ENHANCEMENT':
        return 'R. ENHANCE';
      
      case 'DEBUG':
        return 'S. CORRECT';
      
      case 'DEPLOY':
        return context.drsScore >= 85 ? 'G. DEPLOY' : 'T. DEPLOY-DECIDE';
      
      default:
        return 'P. ASSESS';
    }
  }

  /**
   * Validate context analysis
   * ai-framework principle: Self-validation prevents errors
   */
  validateAnalysis(result: ContextAnalysisResult): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check confidence declaration
    if (!result.confidence) {
      errors.push('Confidence not declared');
    }

    // Check reasoning provided
    if (!result.reasoning || result.reasoning.length < 10) {
      errors.push('Insufficient reasoning provided');
    }

    // Check recommendations are actionable
    if (result.recommendations.length === 0) {
      errors.push('No recommendations provided');
    }

    // Check framework violations are addressed
    if (result.frameworkViolations.length > 0 && 
        !result.recommendations.some(r => r.includes('violations'))) {
      errors.push('Framework violations not addressed in recommendations');
    }

    // Check time gate awareness
    const timeRemaining = (result.nextGateDeadline.getTime() - Date.now()) / (1000 * 60);
    if (timeRemaining <= 0 && !result.recommendations.some(r => r.includes('HANDOFF'))) {
      errors.push('Time gate exceeded but no handoff recommended');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}