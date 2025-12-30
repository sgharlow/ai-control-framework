/**
 * Prompt Selector for AI Framework
 * Selects optimal prompts based on context analysis and framework state
 * Implements ai-framework principle: Context determines optimal action
 */

import { PromptContext, PromptTemplate, PromptCondition } from '../types/framework-state.js';

export interface PromptSelectionResult {
  selectedPrompt: PromptTemplate;
  alternativePrompts: PromptTemplate[];
  selectionReason: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  frameworkCompliance: boolean;
}

export interface PromptSelectionCriteria {
  context: PromptContext;
  frameworkViolations: string[];
  timeConstraints: {
    remainingMinutes: number;
    sessionDuration: number;
  };
  userIntent?: string;
  forcePrompt?: string;
}

export class PromptSelector {
  private promptTemplates: PromptTemplate[];

  constructor() {
    this.promptTemplates = this.initializePromptTemplates();
  }

  /**
   * Select optimal prompt based on context and criteria
   * ai-framework principle: Always choose the highest-value action
   */
  selectPrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    // Handle forced prompt selection (for testing or specific scenarios)
    if (criteria.forcePrompt) {
      const forcedPrompt = this.findPromptById(criteria.forcePrompt);
      if (forcedPrompt) {
        return {
          selectedPrompt: forcedPrompt,
          alternativePrompts: [],
          selectionReason: `Forced selection: ${criteria.forcePrompt}`,
          confidence: 'HIGH',
          frameworkCompliance: true
        };
      }
    }

    // ai-framework principle: Framework violations take absolute priority
    if (criteria.frameworkViolations.length > 0) {
      return this.selectViolationHandlingPrompt(criteria);
    }

    // ai-framework principle: Time gates must be respected
    // Check for time-critical scenarios (approaching gate, final minutes, or exceeded)
    if (criteria.timeConstraints.remainingMinutes <= 15) {
      return this.selectTimeGatePrompt(criteria);
    }

    // Context-based selection
    return this.selectContextBasedPrompt(criteria);
  }

  /**
   * Select prompt for handling framework violations
   * ai-framework principle: Violations must be addressed before any other work
   */
  private selectViolationHandlingPrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const violations = criteria.frameworkViolations;
    
    // Prioritize by severity and framework impact
    if (violations.some(v => v.includes('Time gate exceeded'))) {
      return this.createSelectionResult(
        'I_HANDOFF',
        criteria,
        'Time gate exceeded - session must end immediately',
        'HIGH',
        false // Not compliant due to violation
      );
    }

    if (violations.some(v => v.includes('DRS') && v.includes('deployment'))) {
      return this.createSelectionResult(
        'T_DEPLOY_DECIDE',
        criteria,
        'DRS below deployment threshold - assess readiness',
        'HIGH',
        false
      );
    }

    if (violations.some(v => v.includes('Evidence') && v.includes('2h'))) {
      return this.createSelectionResult(
        'K_EVIDENCE',
        criteria,
        'Evidence stale - refresh proof captures immediately',
        'HIGH',
        false
      );
    }

    if (violations.some(v => v.includes('Confidence'))) {
      return this.createSelectionResult(
        'N_UNCERTAINTY',
        criteria,
        'Low confidence - request human guidance',
        'MEDIUM',
        false
      );
    }

    // General violation handling
    return this.createSelectionResult(
      'E_VERIFY',
      criteria,
      'Framework violations detected - run compliance audit',
      'HIGH',
      false
    );
  }

  /**
   * Select prompt for time gate situations
   * ai-framework principle: Time gates are hard limits
   */
  private selectTimeGatePrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const remainingMinutes = criteria.timeConstraints.remainingMinutes;

    if (remainingMinutes <= 0) {
      return this.createSelectionResult(
        'I_HANDOFF',
        criteria,
        'Time gate exceeded - end session immediately',
        'HIGH',
        false
      );
    }

    if (remainingMinutes <= 5) {
      // Check if we can complete current work
      if (criteria.context.projectState === 'DEPLOY' && criteria.context.drsScore >= 85) {
        return this.createSelectionResult(
          'G_DEPLOY',
          criteria,
          'Final minutes - deploy if ready',
          'MEDIUM',
          true
        );
      } else {
        return this.createSelectionResult(
          'I_HANDOFF',
          criteria,
          'Insufficient time remaining - prepare handoff',
          'HIGH',
          true
        );
      }
    }

    if (remainingMinutes <= 15) {
      return this.createSelectionResult(
        'L_CHECKPOINT',
        criteria,
        'Approaching time gate - validate progress',
        'HIGH',
        true
      );
    }

    // Continue with normal selection
    return this.selectContextBasedPrompt(criteria);
  }

  /**
   * Select prompt based on project context
   * ai-framework principle: Context determines optimal action
   */
  private selectContextBasedPrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const { context } = criteria;

    // Handle specific project states
    switch (context.projectState) {
      case 'INITIAL':
        return this.selectInitialStatePrompt(criteria);
      
      case 'DEVELOPMENT':
        return this.selectDevelopmentPrompt(criteria);
      
      case 'ENHANCEMENT':
        return this.selectEnhancementPrompt(criteria);
      
      case 'DEBUG':
        return this.selectDebugPrompt(criteria);
      
      case 'DEPLOY':
        return this.selectDeploymentPrompt(criteria);
      
      default:
        return this.createSelectionResult(
          'P_ASSESS',
          criteria,
          'Unknown project state - assess current situation',
          'MEDIUM',
          true
        );
    }
  }

  /**
   * Select prompt for initial project state
   */
  private selectInitialStatePrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const { context } = criteria;

    if (context.completionPercentage === 0) {
      return this.createSelectionResult(
        'A_START',
        criteria,
        'New session - initialize framework properly',
        'HIGH',
        true
      );
    } else {
      return this.createSelectionResult(
        'P_ASSESS',
        criteria,
        'Project started but state unclear - comprehensive assessment needed',
        'HIGH',
        true
      );
    }
  }

  /**
   * Select prompt for development state
   */
  private selectDevelopmentPrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const { context, timeConstraints } = criteria;

    // Check for blockers first
    if (context.blockers.length > 0) {
      return this.createSelectionResult(
        'F_BLOCKED',
        criteria,
        `${context.blockers.length} blockers detected - handle hard stops`,
        'HIGH',
        true
      );
    }

    // Time-based decisions
    if (timeConstraints.sessionDuration >= 60) { // 1 hour
      return this.createSelectionResult(
        'L_CHECKPOINT',
        criteria,
        'One hour elapsed - validate 60m gate',
        'HIGH',
        true
      );
    }

    // Progress-based decisions
    if (context.completionPercentage < 25) {
      return this.createSelectionResult(
        'Q_DECIDE',
        criteria,
        'Early development - determine optimal next action',
        'HIGH',
        true
      );
    } else if (context.completionPercentage >= 75) {
      return this.createSelectionResult(
        'E_VERIFY',
        criteria,
        'High completion - verify framework compliance',
        'HIGH',
        true
      );
    } else {
      return this.createSelectionResult(
        'D_PLAN',
        criteria,
        'Active development - choose smallest next win',
        'HIGH',
        true
      );
    }
  }

  /**
   * Select prompt for enhancement state
   */
  private selectEnhancementPrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const { context } = criteria;

    // ai-framework principle: Enhancements must maintain compliance
    if (!context.frameworkCompliance) {
      return this.createSelectionResult(
        'E_VERIFY',
        criteria,
        'Enhancement mode but not compliant - audit first',
        'HIGH',
        false
      );
    }

    return this.createSelectionResult(
      'R_ENHANCE',
      criteria,
      'Enhancement mode - plan new features with framework discipline',
      'HIGH',
      true
    );
  }

  /**
   * Select prompt for debug state
   */
  private selectDebugPrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const { context } = criteria;

    if (context.blockers.length === 0) {
      return this.createSelectionResult(
        'P_ASSESS',
        criteria,
        'Debug mode but no blockers identified - reassess situation',
        'MEDIUM',
        false
      );
    }

    return this.createSelectionResult(
      'S_CORRECT',
      criteria,
      'Debug mode with blockers - apply minimal fixes',
      'HIGH',
      true
    );
  }

  /**
   * Select prompt for deployment state
   */
  private selectDeploymentPrompt(criteria: PromptSelectionCriteria): PromptSelectionResult {
    const { context } = criteria;

    // ai-framework principle: DRS >= 85 required for deployment
    if (context.drsScore < 85) {
      return this.createSelectionResult(
        'T_DEPLOY_DECIDE',
        criteria,
        `DRS ${context.drsScore} below threshold - assess deployment readiness`,
        'HIGH',
        false
      );
    }

    // Ready to deploy
    return this.createSelectionResult(
      'G_DEPLOY',
      criteria,
      'DRS threshold met - proceed with production deployment',
      'HIGH',
      true
    );
  }

  /**
   * Get alternative prompts for current context
   */
  getAlternativePrompts(criteria: PromptSelectionCriteria, excludeSelected: string): PromptTemplate[] {
    const alternatives: PromptTemplate[] = [];
    const { context } = criteria;

    // Always include assessment as alternative
    if (excludeSelected !== 'P_ASSESS') {
      const assessPrompt = this.findPromptById('P_ASSESS');
      if (assessPrompt) alternatives.push(assessPrompt);
    }

    // Context-specific alternatives
    switch (context.projectState) {
      case 'DEVELOPMENT':
        this.addIfNotExcluded(alternatives, ['Q_DECIDE', 'D_PLAN', 'E_VERIFY'], excludeSelected);
        break;
      
      case 'ENHANCEMENT':
        this.addIfNotExcluded(alternatives, ['R_ENHANCE', 'E_VERIFY', 'D_PLAN'], excludeSelected);
        break;
      
      case 'DEBUG':
        this.addIfNotExcluded(alternatives, ['S_CORRECT', 'H_DEBUG', 'F_BLOCKED'], excludeSelected);
        break;
      
      case 'DEPLOY':
        this.addIfNotExcluded(alternatives, ['T_DEPLOY_DECIDE', 'G_DEPLOY', 'E_VERIFY'], excludeSelected);
        break;
    }

    // Time-based alternatives
    if (criteria.timeConstraints.remainingMinutes <= 30) {
      this.addIfNotExcluded(alternatives, ['L_CHECKPOINT', 'I_HANDOFF'], excludeSelected);
    }

    return alternatives.slice(0, 3); // Top 3 alternatives
  }

  /**
   * Evaluate prompt conditions
   */
  private evaluateConditions(conditions: (context: PromptContext) => boolean, context: PromptContext): boolean {
    try {
      return conditions(context);
    } catch (error) {
      // If condition evaluation fails, assume false
      return false;
    }
  }

  /**
   * Create selection result
   */
  private createSelectionResult(
    promptId: string,
    criteria: PromptSelectionCriteria,
    reason: string,
    confidence: 'HIGH' | 'MEDIUM' | 'LOW',
    frameworkCompliant: boolean
  ): PromptSelectionResult {
    const selectedPrompt = this.findPromptById(promptId);
    if (!selectedPrompt) {
      throw new Error(`Prompt not found: ${promptId}`);
    }

    const alternatives = this.getAlternativePrompts(criteria, promptId);

    return {
      selectedPrompt,
      alternativePrompts: alternatives,
      selectionReason: reason,
      confidence,
      frameworkCompliance: frameworkCompliant
    };
  }

  /**
   * Find prompt by ID
   */
  private findPromptById(id: string): PromptTemplate | undefined {
    return this.promptTemplates.find(p => p.id === id);
  }

  /**
   * Add prompts to alternatives if not excluded
   */
  private addIfNotExcluded(alternatives: PromptTemplate[], promptIds: string[], excludeId: string): void {
    for (const id of promptIds) {
      if (id !== excludeId) {
        const prompt = this.findPromptById(id);
        if (prompt) {
          alternatives.push(prompt);
        }
      }
    }
  }

  /**
   * Initialize prompt templates
   * Maps ai-framework prompts to selectable templates
   */
  private initializePromptTemplates(): PromptTemplate[] {
    return [
      // Core Framework Prompts (A-O)
      {
        id: 'A_START',
        name: 'Initialize Session',
        purpose: 'Start new development session with framework setup',
        conditions: (ctx) => ctx.projectState === 'INITIAL' && ctx.completionPercentage === 0,
        template: 'A. START — Initialize Session',
        variables: {},
        priority: 100
      },
      {
        id: 'B_SET_CONTEXT',
        name: 'Set Context',
        purpose: 'Establish rules of engagement',
        conditions: (ctx) => true, // Always available
        template: 'B. SET CONTEXT — Rules of Engagement',
        variables: {},
        priority: 90
      },
      {
        id: 'C_RESUME',
        name: 'Resume Work',
        purpose: 'Re-enter session safely',
        conditions: (ctx) => ctx.projectState !== 'INITIAL',
        template: 'C. RESUME WORK — Re-enter Safely',
        variables: {},
        priority: 95
      },
      {
        id: 'D_PLAN',
        name: 'Plan Next Win',
        purpose: 'Choose smallest next development step',
        conditions: (ctx) => ctx.projectState === 'DEVELOPMENT' && ctx.completionPercentage > 0,
        template: 'D. PLAN — Smallest Next Win',
        variables: {},
        priority: 85
      },
      {
        id: 'E_VERIFY',
        name: 'Verify Work',
        purpose: 'Run compliance audit',
        conditions: (ctx) => true, // Always available
        template: 'E. VERIFY WORK — Compliance Audit',
        variables: {},
        priority: 80
      },
      {
        id: 'F_BLOCKED',
        name: 'Handle Blockers',
        purpose: 'Handle hard stops and blockers',
        conditions: (ctx) => ctx.blockers.length > 0,
        template: 'F. BLOCKED — Handle Hard Stops',
        variables: {},
        priority: 95
      },
      {
        id: 'G_DEPLOY',
        name: 'Deploy to Production',
        purpose: 'Execute production deployment',
        conditions: (ctx) => ctx.drsScore >= 85 && ctx.projectState === 'DEPLOY',
        template: 'G. DEPLOY — Ready for Production',
        variables: {},
        priority: 100
      },
      {
        id: 'H_DEBUG',
        name: 'Debug Issues',
        purpose: 'Fix without scope creep',
        conditions: (ctx) => ctx.projectState === 'DEBUG',
        template: 'H. DEBUG — Fix Without Scope Creep',
        variables: {},
        priority: 90
      },
      {
        id: 'I_HANDOFF',
        name: 'End Session',
        purpose: 'Properly end development session',
        conditions: (ctx) => true, // Always available
        template: 'I. HANDOFF — End of Session',
        variables: {},
        priority: 100
      },
      {
        id: 'K_EVIDENCE',
        name: 'Generate Evidence',
        purpose: 'Capture required proof',
        conditions: (ctx) => true, // Always available
        template: 'K. EVIDENCE — Generate Proof Now',
        variables: {},
        priority: 85
      },
      {
        id: 'L_CHECKPOINT',
        name: 'Time Gate Validation',
        purpose: 'Validate time gate progress',
        conditions: (ctx) => ctx.timeInSession >= 30,
        template: 'L. CHECKPOINT — Time Gate Validation',
        variables: {},
        priority: 90
      },
      {
        id: 'M_DECLINE',
        name: 'DRS Degradation Response',
        purpose: 'Handle DRS decline',
        conditions: (ctx) => ctx.drsScore < 70,
        template: 'M. DECLINE — DRS Degradation Response',
        variables: {},
        priority: 95
      },
      {
        id: 'N_UNCERTAINTY',
        name: 'Request Human Guidance',
        purpose: 'Get help when uncertain',
        conditions: (ctx) => ctx.confidence === 'LOW',
        template: 'N. UNCERTAINTY — Request Human Guidance',
        variables: {},
        priority: 90
      },
      {
        id: 'O_PR_READY',
        name: 'Generate Pull Request',
        purpose: 'Create PR for completed work',
        conditions: (ctx) => ctx.completionPercentage >= 90,
        template: 'O. PR-READY — Generate Pull Request',
        variables: {},
        priority: 85
      },

      // Enhanced Prompts (P-T)
      {
        id: 'P_ASSESS',
        name: 'Comprehensive Project Assessment',
        purpose: 'Analyze current project state and health',
        conditions: (ctx) => true, // Always available
        template: 'P. ASSESS — Comprehensive Project State Analysis',
        variables: {},
        priority: 95
      },
      {
        id: 'Q_DECIDE',
        name: 'Automatic Next Action Selection',
        purpose: 'Determine optimal next development step',
        conditions: (ctx) => ctx.projectState === 'DEVELOPMENT' || ctx.projectState === 'INITIAL',
        template: 'Q. DECIDE — Automatic Next Action Selection',
        variables: {},
        priority: 90
      },
      {
        id: 'R_ENHANCE',
        name: 'Context-Aware Enhancement Handler',
        purpose: 'Handle enhancements with framework discipline',
        conditions: (ctx) => ctx.sessionMode === 'ENHANCEMENT' || ctx.projectState === 'ENHANCEMENT',
        template: 'R. ENHANCE — Context-Aware Enhancement Handler',
        variables: {},
        priority: 90
      },
      {
        id: 'S_CORRECT',
        name: 'Debugging and Correction Context',
        purpose: 'Debug issues with minimal scope creep',
        conditions: (ctx) => ctx.projectState === 'DEBUG' || ctx.blockers.length > 0,
        template: 'S. CORRECT — Debugging and Correction Context',
        variables: {},
        priority: 95
      },
      {
        id: 'T_DEPLOY_DECIDE',
        name: 'Intelligent Deployment Decision',
        purpose: 'Make informed deployment decisions',
        conditions: (ctx) => ctx.drsScore >= 70 || ctx.projectState === 'DEPLOY',
        template: 'T. DEPLOY-DECIDE — Intelligent Deployment Decision',
        variables: {},
        priority: 95
      }
    ];
  }

  /**
   * Get all available prompts for current context
   */
  getAvailablePrompts(context: PromptContext): PromptTemplate[] {
    return this.promptTemplates.filter(template => 
      this.evaluateConditions(template.conditions, context)
    ).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Validate prompt selection
   */
  validateSelection(result: PromptSelectionResult, criteria: PromptSelectionCriteria): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if selected prompt is appropriate for context
    if (!this.evaluateConditions(result.selectedPrompt.conditions, criteria.context)) {
      errors.push(`Selected prompt ${result.selectedPrompt.id} not suitable for current context`);
    }

    // Check framework compliance
    if (criteria.frameworkViolations.length > 0 && result.frameworkCompliance) {
      errors.push('Framework violations exist but selection marked as compliant');
    }

    // Check time gate respect
    if (criteria.timeConstraints.remainingMinutes <= 0 && result.selectedPrompt.id !== 'I_HANDOFF') {
      errors.push('Time gate exceeded but handoff not selected');
    }

    // Check confidence declaration
    if (!result.confidence) {
      errors.push('Confidence not declared in selection');
    }

    // Check reasoning provided
    if (!result.selectionReason || result.selectionReason.length < 10) {
      errors.push('Insufficient selection reasoning provided');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}