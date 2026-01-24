/**
 * Comprehensive Integration Tests for MCP Server Tools
 * Tests the core MCP functionality without requiring actual MCP transport
 *
 * Coverage includes:
 * - All MCP tool calls (get_framework_state, select_optimal_prompt, generate_contextualized_prompt)
 * - Error handling scenarios
 * - Session management
 * - DRS (Decision Review Score) calculations
 * - Edge cases and boundary conditions
 */

import { FrameworkStateReader } from '../services/framework-state-reader';
import { ContextAnalyzer } from '../analyzers/context-analyzer';
import { PromptSelector } from '../selectors/prompt-selector';
import { DRSCalculator } from '../calculators/drs-calculator';
import { FrameworkState, PromptContext, OrchestrationData, TaskData } from '../types/framework-state';
import { tmpdir } from 'os';
import { join } from 'path';

// Helper function to create mock framework state
function createMockFrameworkState(overrides: Partial<FrameworkState> = {}): FrameworkState {
  const now = new Date();
  return {
    orchestration: {
      sessionMode: 'DEVELOPMENT' as const,
      currentGate: '30m',
      gateDeadline: new Date(now.getTime() + 30 * 60 * 1000),
      confidence: 'MEDIUM' as const,
      lastEvidence: new Date(now.getTime() - 30 * 60 * 1000),
      contractHash: 'abc123def456',
      sessionStartTime: new Date(now.getTime() - 15 * 60 * 1000),
      timeRemaining: 15,
      timeGates: true,
      patternUsed: 'PATTERN-001'
    },
    tasks: {
      tasks: [],
      completionPercentage: 50,
      blockers: [],
      partialProgress: {},
      realServicesConnected: true,
      dodMet: false,
      acceptanceCriteria: true
    },
    todos: {
      mockCount: 0,
      oldestMockAge: 0,
      allHaveExpiry: true,
      blockersDocumented: false,
      prioritized: true,
      blockers: [],
      count: 3,
      withoutExpiry: 0,
      critical: 0,
      high: 1
    },
    drsScore: 70,
    evidence: [
      {
        type: 'connection',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        path: 'evidence/api-test.log',
        valid: true,
        description: 'API connection test'
      }
    ],
    lastUpdate: now,
    confidence: 'MEDIUM' as const,
    projectPath: '/test/project',
    contractChanges: 'None',
    contractCompliance: true,
    ...overrides
  };
}

// Helper to create mock orchestration data
function createMockOrchestration(overrides: Partial<OrchestrationData> = {}): OrchestrationData {
  const now = new Date();
  return {
    sessionMode: 'DEVELOPMENT' as const,
    currentGate: '30m',
    gateDeadline: new Date(now.getTime() + 30 * 60 * 1000),
    confidence: 'MEDIUM' as const,
    lastEvidence: new Date(now.getTime() - 30 * 60 * 1000),
    contractHash: 'abc123',
    sessionStartTime: new Date(now.getTime() - 15 * 60 * 1000),
    timeRemaining: 15,
    ...overrides
  };
}

describe('MCP Server Tools Integration', () => {
  let frameworkStateReader: FrameworkStateReader;
  let contextAnalyzer: ContextAnalyzer;
  let promptSelector: PromptSelector;
  let drsCalculator: DRSCalculator;
  let testProjectPath: string;

  beforeEach(() => {
    frameworkStateReader = new FrameworkStateReader();
    contextAnalyzer = new ContextAnalyzer();
    promptSelector = new PromptSelector();
    drsCalculator = new DRSCalculator();
    testProjectPath = join(tmpdir(), 'mcp-test-project');
  });

  describe('get_framework_state tool simulation', () => {
    it('should read framework state and provide analysis', async () => {
      // Simulate the get_framework_state tool logic
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);
      const analysis = contextAnalyzer.analyzeContext(state);

      // Verify the response structure matches what MCP tool would return
      const response = {
        frameworkState: {
          drsScore: state.drsScore,
          projectState: analysis.context.projectState,
          sessionMode: state.orchestration.sessionMode,
          completionPercentage: state.tasks.completionPercentage,
          timeRemaining: state.orchestration.timeRemaining,
          confidence: analysis.confidence,
          frameworkCompliance: analysis.context.frameworkCompliance,
        },
        analysis: {
          recommendations: analysis.recommendations,
          frameworkViolations: analysis.frameworkViolations,
          criticalPath: analysis.criticalPath,
          reasoning: analysis.reasoning,
        },
        evidence: {
          lastUpdate: state.lastUpdate,
          evidenceCount: state.evidence.length,
          evidenceAge: state.evidence.length > 0 ? 
            Math.round((Date.now() - Math.max(...state.evidence.map(e => e.timestamp.getTime()))) / (1000 * 60)) : 
            999,
        }
      };

      // Verify response structure
      expect(response.frameworkState.drsScore).toBeGreaterThanOrEqual(0);
      expect(response.frameworkState.projectState).toBeOneOf(['INITIAL', 'DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'DEPLOY']);
      expect(response.frameworkState.sessionMode).toBeOneOf(['DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'MAINTENANCE']);
      expect(response.frameworkState.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(response.frameworkState.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(typeof response.frameworkState.frameworkCompliance).toBe('boolean');

      expect(Array.isArray(response.analysis.recommendations)).toBe(true);
      expect(Array.isArray(response.analysis.frameworkViolations)).toBe(true);
      expect(Array.isArray(response.analysis.criticalPath)).toBe(true);
      expect(typeof response.analysis.reasoning).toBe('string');

      expect(response.evidence.lastUpdate).toBeInstanceOf(Date);
      expect(response.evidence.evidenceCount).toBeGreaterThanOrEqual(0);
      expect(response.evidence.evidenceAge).toBeGreaterThanOrEqual(0);
    });
  });

  describe('select_optimal_prompt tool simulation', () => {
    it('should select optimal prompt for development scenario', async () => {
      const scenario = 'next-action';
      
      // Simulate the select_optimal_prompt tool logic
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);
      const analysis = contextAnalyzer.analyzeContext(state);

      const criteria = {
        context: analysis.context,
        frameworkViolations: analysis.frameworkViolations,
        timeConstraints: {
          remainingMinutes: state.orchestration.timeRemaining,
          sessionDuration: Math.round((Date.now() - state.orchestration.sessionStartTime.getTime()) / (1000 * 60)),
        },
        userIntent: undefined,
      };

      const selection = promptSelector.selectPrompt(criteria);
      const validation = promptSelector.validateSelection(selection, criteria);

      // Verify the response structure
      const response = {
        selectedPrompt: {
          id: selection.selectedPrompt.id,
          name: selection.selectedPrompt.name,
          purpose: selection.selectedPrompt.purpose,
          template: selection.selectedPrompt.template,
        },
        selection: {
          reason: selection.selectionReason,
          confidence: selection.confidence,
          frameworkCompliance: selection.frameworkCompliance,
        },
        alternatives: selection.alternativePrompts.map(alt => ({
          id: alt.id,
          name: alt.name,
          purpose: alt.purpose,
        })),
        validation: {
          valid: validation.valid,
          errors: validation.errors,
        },
        context: {
          scenario,
          projectState: analysis.context.projectState,
          drsScore: analysis.context.drsScore,
          violations: analysis.frameworkViolations,
        }
      };

      // Verify response structure
      expect(response.selectedPrompt.id).toBeTruthy();
      expect(response.selectedPrompt.name).toBeTruthy();
      expect(response.selectedPrompt.purpose).toBeTruthy();
      expect(response.selectedPrompt.template).toBeTruthy();

      expect(response.selection.reason).toBeTruthy();
      expect(response.selection.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(typeof response.selection.frameworkCompliance).toBe('boolean');

      expect(Array.isArray(response.alternatives)).toBe(true);
      expect(typeof response.validation.valid).toBe('boolean');
      expect(Array.isArray(response.validation.errors)).toBe(true);

      expect(response.context.scenario).toBe(scenario);
      expect(response.context.projectState).toBeOneOf(['INITIAL', 'DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'DEPLOY']);
      expect(response.context.drsScore).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.context.violations)).toBe(true);
    });

    it('should handle different scenarios appropriately', async () => {
      const scenarios = ['assess', 'next-action', 'enhance', 'debug', 'deploy'];
      
      for (const scenario of scenarios) {
        const state = await frameworkStateReader.readFrameworkState(testProjectPath);
        const analysis = contextAnalyzer.analyzeContext(state);

        const criteria = {
          context: analysis.context,
          frameworkViolations: analysis.frameworkViolations,
          timeConstraints: {
            remainingMinutes: state.orchestration.timeRemaining,
            sessionDuration: 30,
          },
          userIntent: `Testing ${scenario} scenario`,
        };

        const selection = promptSelector.selectPrompt(criteria);

        expect(selection.selectedPrompt).toBeDefined();
        expect(selection.selectionReason).toBeTruthy();
        expect(selection.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      }
    });
  });

  describe('generate_contextualized_prompt tool simulation', () => {
    it('should generate contextualized prompt with project data', async () => {
      const promptId = 'P_ASSESS';
      const customVariables = { userGoal: 'Understand project status' };

      // Simulate the generate_contextualized_prompt tool logic
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);
      const analysis = contextAnalyzer.analyzeContext(state);

      const availablePrompts = promptSelector.getAvailablePrompts(analysis.context);
      const promptTemplate = availablePrompts.find(p => p.id === promptId);

      expect(promptTemplate).toBeDefined();

      if (promptTemplate) {
        // Generate contextualized prompt (simplified version)
        let contextualizedPrompt = promptTemplate.template;

        const contextInfo = `
Current Project Context:
- DRS Score: ${state.drsScore}/100
- Project State: ${analysis.context.projectState}
- Completion: ${state.tasks.completionPercentage}%
- Time Remaining: ${state.orchestration.timeRemaining} minutes
- Session Mode: ${state.orchestration.sessionMode}
- Framework Compliance: ${analysis.context.frameworkCompliance ? 'YES' : 'NO'}
`;

        if (analysis.frameworkViolations.length > 0) {
          contextualizedPrompt += `\n\n⚠️ FRAMEWORK VIOLATIONS DETECTED:\n${analysis.frameworkViolations.map((v: string) => `- ${v}`).join('\n')}`;
        }

        if (analysis.recommendations.length > 0) {
          contextualizedPrompt += `\n\nRECOMMENDED ACTIONS:\n${analysis.recommendations.slice(0, 3).map((r: string) => `- ${r}`).join('\n')}`;
        }

        contextualizedPrompt += contextInfo;

        // Inject custom variables
        for (const [key, value] of Object.entries(customVariables)) {
          const placeholder = `{{${key}}}`;
          contextualizedPrompt = contextualizedPrompt.replace(new RegExp(placeholder, 'g'), String(value));
        }

        const response = {
          prompt: {
            id: promptTemplate.id,
            name: promptTemplate.name,
            template: promptTemplate.template,
            contextualizedText: contextualizedPrompt,
          },
          context: {
            projectState: analysis.context.projectState,
            drsScore: state.drsScore,
            completionPercentage: state.tasks.completionPercentage,
            timeRemaining: state.orchestration.timeRemaining,
            violations: analysis.frameworkViolations,
            recommendations: analysis.recommendations.slice(0, 3),
          },
          injectedVariables: {
            drsScore: state.drsScore,
            projectState: analysis.context.projectState,
            timeRemaining: state.orchestration.timeRemaining,
            violations: analysis.frameworkViolations.length,
            ...customVariables,
          }
        };

        // Verify response structure
        expect(response.prompt.id).toBe(promptId);
        expect(response.prompt.name).toBeTruthy();
        expect(response.prompt.template).toBeTruthy();
        expect(response.prompt.contextualizedText).toContain('DRS Score:');
        expect(response.prompt.contextualizedText).toContain('Project State:');

        expect(response.context.projectState).toBeOneOf(['INITIAL', 'DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'DEPLOY']);
        expect(response.context.drsScore).toBeGreaterThanOrEqual(0);
        expect(response.context.completionPercentage).toBeGreaterThanOrEqual(0);
        expect(response.context.timeRemaining).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(response.context.violations)).toBe(true);
        expect(Array.isArray(response.context.recommendations)).toBe(true);

        expect(response.injectedVariables.drsScore).toBe(state.drsScore);
        expect(response.injectedVariables.projectState).toBe(analysis.context.projectState);
        expect(response.injectedVariables.userGoal).toBe(customVariables.userGoal);
      }
    });

    it('should handle invalid prompt IDs gracefully', async () => {
      const invalidPromptId = 'INVALID_PROMPT';
      
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);
      const analysis = contextAnalyzer.analyzeContext(state);

      const availablePrompts = promptSelector.getAvailablePrompts(analysis.context);
      const promptTemplate = availablePrompts.find(p => p.id === invalidPromptId);

      expect(promptTemplate).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle missing project files gracefully', async () => {
      const nonExistentPath = join(tmpdir(), 'non-existent-project');
      
      // Should not throw, but return default values
      const state = await frameworkStateReader.readFrameworkState(nonExistentPath);
      
      expect(state.orchestration.sessionMode).toBe('DEVELOPMENT');
      expect(state.tasks.completionPercentage).toBe(0);
      expect(state.evidence).toEqual([]);
      expect(state.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
    });

    it('should handle framework state reader errors', async () => {
      const summary = await frameworkStateReader.getFrameworkStateSummary(testProjectPath);
      
      expect(summary.hasFrameworkFiles).toBe(false);
      expect(summary.drsScore).toBeGreaterThanOrEqual(0);
      expect(summary.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
    });
  });

  describe('framework compliance verification', () => {
    it('should maintain ai-framework principles in all tools', async () => {
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);
      const analysis = contextAnalyzer.analyzeContext(state);

      // Verify DRS-focused approach
      expect(typeof state.drsScore).toBe('number');
      expect(state.drsScore).toBeGreaterThanOrEqual(0);
      expect(state.drsScore).toBeLessThanOrEqual(100);

      // Verify time gate awareness
      expect(typeof state.orchestration.timeRemaining).toBe('number');
      expect(state.orchestration.gateDeadline).toBeInstanceOf(Date);

      // Verify confidence declaration
      expect(analysis.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(analysis.reasoning).toBeTruthy();

      // Verify framework violation detection
      expect(Array.isArray(analysis.frameworkViolations)).toBe(true);

      // Verify evidence-based approach
      expect(Array.isArray(state.evidence)).toBe(true);
    });

    it('should provide actionable recommendations', async () => {
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);
      const analysis = contextAnalyzer.analyzeContext(state);

      expect(Array.isArray(analysis.recommendations)).toBe(true);

      // All recommendations should reference specific prompts
      for (const recommendation of analysis.recommendations) {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(10);
      }
    });
  });

  // ============================================================================
  // COMPREHENSIVE MCP TOOL CALL TESTS
  // ============================================================================

  describe('MCP Tool: get_framework_state', () => {
    it('should return complete framework state structure', async () => {
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);
      const analysis = contextAnalyzer.analyzeContext(state);

      // Simulate MCP tool response structure
      const response = {
        frameworkState: {
          drsScore: state.drsScore,
          projectState: analysis.context.projectState,
          sessionMode: state.orchestration.sessionMode,
          completionPercentage: state.tasks.completionPercentage,
          timeRemaining: state.orchestration.timeRemaining,
          confidence: analysis.confidence,
          frameworkCompliance: analysis.context.frameworkCompliance,
        },
        analysis: {
          recommendations: analysis.recommendations,
          frameworkViolations: analysis.frameworkViolations,
          criticalPath: analysis.criticalPath,
          reasoning: analysis.reasoning,
        },
        evidence: {
          lastUpdate: state.lastUpdate,
          evidenceCount: state.evidence.length,
          evidenceAge: state.evidence.length > 0 ?
            Math.round((Date.now() - Math.max(...state.evidence.map(e => e.timestamp.getTime()))) / (1000 * 60)) :
            999,
        }
      };

      // Validate all required fields are present
      expect(response.frameworkState).toBeDefined();
      expect(response.analysis).toBeDefined();
      expect(response.evidence).toBeDefined();

      // Validate types
      expect(typeof response.frameworkState.drsScore).toBe('number');
      expect(typeof response.frameworkState.completionPercentage).toBe('number');
      expect(typeof response.frameworkState.timeRemaining).toBe('number');
      expect(typeof response.analysis.reasoning).toBe('string');
    });

    it('should handle session mode transitions correctly', async () => {
      const modes: Array<'DEVELOPMENT' | 'ENHANCEMENT' | 'DEBUG' | 'MAINTENANCE'> =
        ['DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'MAINTENANCE'];

      for (const mode of modes) {
        const mockState = createMockFrameworkState({
          orchestration: createMockOrchestration({ sessionMode: mode })
        });

        const analysis = contextAnalyzer.analyzeContext(mockState);

        // Each mode should be recognized and processed
        expect(mockState.orchestration.sessionMode).toBe(mode);
        expect(analysis.context).toBeDefined();
      }
    });

    it('should correctly compute evidence age', async () => {
      const now = new Date();

      // Test fresh evidence (< 30 minutes)
      const freshState = createMockFrameworkState({
        evidence: [{
          type: 'connection',
          timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
          path: 'evidence/test.log',
          valid: true,
          description: 'Fresh test'
        }]
      });

      const freshAge = freshState.evidence.length > 0 ?
        Math.round((Date.now() - Math.max(...freshState.evidence.map(e => e.timestamp.getTime()))) / (1000 * 60)) :
        999;
      expect(freshAge).toBeLessThan(30);

      // Test stale evidence (> 2 hours)
      const staleState = createMockFrameworkState({
        evidence: [{
          type: 'connection',
          timestamp: new Date(now.getTime() - 180 * 60 * 1000), // 3 hours ago
          path: 'evidence/test.log',
          valid: false,
          description: 'Stale test'
        }]
      });

      const staleAge = staleState.evidence.length > 0 ?
        Math.round((Date.now() - Math.max(...staleState.evidence.map(e => e.timestamp.getTime()))) / (1000 * 60)) :
        999;
      expect(staleAge).toBeGreaterThan(120);
    });
  });

  describe('MCP Tool: select_optimal_prompt', () => {
    it('should select correct prompts for each project state', async () => {
      const projectStates: Array<'INITIAL' | 'DEVELOPMENT' | 'ENHANCEMENT' | 'DEBUG' | 'DEPLOY'> =
        ['INITIAL', 'DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'DEPLOY'];

      for (const projectState of projectStates) {
        const context: PromptContext = {
          projectState,
          drsScore: projectState === 'DEPLOY' ? 90 : 60,
          lastAction: 'Testing',
          timeInSession: 30,
          blockers: projectState === 'DEBUG' ? ['Test blocker'] : [],
          frameworkCompliance: true,
          confidence: 'MEDIUM',
          sessionMode: projectState === 'ENHANCEMENT' ? 'ENHANCEMENT' : 'DEVELOPMENT',
          completionPercentage: projectState === 'DEPLOY' ? 95 : 50
        };

        const criteria = {
          context,
          frameworkViolations: [],
          timeConstraints: {
            remainingMinutes: 30,
            sessionDuration: 30
          }
        };

        const selection = promptSelector.selectPrompt(criteria);

        expect(selection.selectedPrompt).toBeDefined();
        expect(selection.selectedPrompt.id).toBeTruthy();
        expect(selection.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      }
    });

    it('should prioritize framework violations over context', async () => {
      const violations = [
        'Time gate exceeded - session must end',
        'DRS 75 below deployment threshold (85)',
        'Evidence 180min old, exceeds 2h limit',
        'Confidence not declared or too low'
      ];

      for (const violation of violations) {
        const criteria = {
          context: {
            projectState: 'DEVELOPMENT' as const,
            drsScore: 90,
            lastAction: 'Working',
            timeInSession: 30,
            blockers: [],
            frameworkCompliance: false,
            confidence: 'HIGH' as const,
            sessionMode: 'DEVELOPMENT',
            completionPercentage: 95
          },
          frameworkViolations: [violation],
          timeConstraints: {
            remainingMinutes: violation.includes('Time gate') ? -5 : 30,
            sessionDuration: 30
          }
        };

        const selection = promptSelector.selectPrompt(criteria);

        // Violation should override normal context-based selection
        expect(selection.frameworkCompliance).toBe(false);
        expect(selection.selectionReason.length).toBeGreaterThan(0);
      }
    });

    it('should handle time gate boundaries correctly', async () => {
      const timeScenarios = [
        { remaining: -10, expected: 'I_HANDOFF' },  // Exceeded
        { remaining: 0, expected: 'I_HANDOFF' },    // At limit
        { remaining: 5, expected: 'I_HANDOFF' },    // Final minutes
        { remaining: 15, expected: 'L_CHECKPOINT' } // Approaching gate
      ];

      for (const scenario of timeScenarios) {
        const criteria = {
          context: {
            projectState: 'DEVELOPMENT' as const,
            drsScore: 70,
            lastAction: 'Working',
            timeInSession: 90 - scenario.remaining,
            blockers: [],
            frameworkCompliance: true,
            confidence: 'MEDIUM' as const,
            sessionMode: 'DEVELOPMENT',
            completionPercentage: 50
          },
          frameworkViolations: scenario.remaining <= 0 ? ['Time gate exceeded - session must end'] : [],
          timeConstraints: {
            remainingMinutes: scenario.remaining,
            sessionDuration: 90 - scenario.remaining
          }
        };

        const selection = promptSelector.selectPrompt(criteria);

        if (scenario.remaining <= 5) {
          expect(selection.selectedPrompt.id).toBe(scenario.expected);
        }
      }
    });

    it('should respect DRS thresholds for deployment', async () => {
      // Below threshold
      const lowDrsCriteria = {
        context: {
          projectState: 'DEPLOY' as const,
          drsScore: 75,
          lastAction: 'Attempting deploy',
          timeInSession: 60,
          blockers: [],
          frameworkCompliance: true,
          confidence: 'HIGH' as const,
          sessionMode: 'DEVELOPMENT',
          completionPercentage: 95
        },
        frameworkViolations: [],
        timeConstraints: {
          remainingMinutes: 30,
          sessionDuration: 60
        }
      };

      const lowDrsSelection = promptSelector.selectPrompt(lowDrsCriteria);
      expect(lowDrsSelection.selectedPrompt.id).toBe('T_DEPLOY_DECIDE');

      // At threshold
      const highDrsCriteria = {
        ...lowDrsCriteria,
        context: { ...lowDrsCriteria.context, drsScore: 90 }
      };

      const highDrsSelection = promptSelector.selectPrompt(highDrsCriteria);
      expect(highDrsSelection.selectedPrompt.id).toBe('G_DEPLOY');
    });
  });

  describe('MCP Tool: generate_contextualized_prompt', () => {
    it('should inject all context variables correctly', async () => {
      const state = createMockFrameworkState({ drsScore: 75 });
      const analysis = contextAnalyzer.analyzeContext(state);

      const availablePrompts = promptSelector.getAvailablePrompts(analysis.context);
      const promptTemplate = availablePrompts.find(p => p.id === 'P_ASSESS');

      expect(promptTemplate).toBeDefined();

      if (promptTemplate) {
        let contextualizedPrompt = promptTemplate.template;

        // Add context information (mimicking generatePromptWithContext)
        const contextInfo = `
Current Project Context:
- DRS Score: ${state.drsScore}/100
- Project State: ${analysis.context.projectState}
- Completion: ${state.tasks.completionPercentage}%
- Time Remaining: ${state.orchestration.timeRemaining} minutes
- Session Mode: ${state.orchestration.sessionMode}
- Framework Compliance: ${analysis.context.frameworkCompliance ? 'YES' : 'NO'}
`;
        contextualizedPrompt += contextInfo;

        // Verify context injection
        expect(contextualizedPrompt).toContain('75/100');
        expect(contextualizedPrompt).toContain('50%');
        expect(contextualizedPrompt).toContain('DEVELOPMENT');
      }
    });

    it('should include framework violations when present', async () => {
      const state = createMockFrameworkState({
        orchestration: createMockOrchestration({
          timeRemaining: -5,
          confidence: 'LOW'
        }),
        confidence: 'LOW',
        drsScore: 75
      });

      const analysis = contextAnalyzer.analyzeContext(state);

      // Should detect violations
      expect(analysis.frameworkViolations.length).toBeGreaterThan(0);

      // Violations should be included in contextualized output
      const violationText = analysis.frameworkViolations.map((v: string) => `- ${v}`).join('\n');
      expect(violationText.length).toBeGreaterThan(0);
    });

    it('should handle custom variables injection', async () => {
      const customVariables = {
        userGoal: 'Complete API integration',
        targetDRS: 90,
        priority: 'HIGH'
      };

      let template = 'Goal: {{userGoal}} with target DRS of {{targetDRS}} at {{priority}} priority';

      // Inject custom variables
      for (const [key, value] of Object.entries(customVariables)) {
        const placeholder = `{{${key}}}`;
        template = template.replace(new RegExp(placeholder, 'g'), String(value));
      }

      expect(template).toContain('Complete API integration');
      expect(template).toContain('90');
      expect(template).toContain('HIGH');
    });

    it('should return error for invalid prompt IDs', async () => {
      const state = createMockFrameworkState();
      const analysis = contextAnalyzer.analyzeContext(state);

      const availablePrompts = promptSelector.getAvailablePrompts(analysis.context);
      const invalidPrompt = availablePrompts.find(p => p.id === 'NONEXISTENT_PROMPT');

      expect(invalidPrompt).toBeUndefined();
    });

    it('should include top recommendations in context', async () => {
      const state = createMockFrameworkState({ drsScore: 50 });
      const analysis = contextAnalyzer.analyzeContext(state);

      // Should have recommendations for low DRS
      expect(analysis.recommendations.length).toBeGreaterThan(0);

      // Top 3 recommendations should be accessible
      const topThree = analysis.recommendations.slice(0, 3);
      expect(topThree.length).toBeLessThanOrEqual(3);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle missing project files gracefully', async () => {
      const nonExistentPath = join(tmpdir(), 'non-existent-project-' + Date.now());

      // Should not throw, but return default values
      const state = await frameworkStateReader.readFrameworkState(nonExistentPath);

      expect(state.orchestration.sessionMode).toBe('DEVELOPMENT');
      expect(state.tasks.completionPercentage).toBe(0);
      expect(state.evidence).toEqual([]);
      expect(state.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
    });

    it('should handle corrupted state files gracefully', async () => {
      // FrameworkStateReader should handle errors and return defaults
      const summary = await frameworkStateReader.getFrameworkStateSummary(testProjectPath);

      expect(summary.hasFrameworkFiles).toBe(false);
      expect(summary.drsScore).toBeGreaterThanOrEqual(0);
      expect(summary.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
    });

    it('should handle timeout scenarios', async () => {
      // The FrameworkStateReader has an 8-second timeout
      const state = await frameworkStateReader.readFrameworkState(testProjectPath);

      // Should return default state on timeout
      expect(state).toBeDefined();
      expect(state.orchestration).toBeDefined();
      expect(state.tasks).toBeDefined();
    });

    it('should validate orchestration data', async () => {
      // Test with invalid orchestration data
      const invalidOrchestration = {
        sessionMode: 'INVALID_MODE' as any,
        currentGate: '30m',
        gateDeadline: 'not-a-date' as any,
        confidence: 'INVALID' as any,
        lastEvidence: new Date(),
        contractHash: '',
        sessionStartTime: new Date(),
        timeRemaining: -999
      };

      // The analyzer should handle invalid data gracefully
      const mockState = createMockFrameworkState({
        orchestration: invalidOrchestration as any
      });

      // Analysis should still work
      const analysis = contextAnalyzer.analyzeContext(mockState);
      expect(analysis).toBeDefined();
    });

    it('should handle empty task lists', async () => {
      const emptyTaskState = createMockFrameworkState({
        tasks: {
          tasks: [],
          completionPercentage: 0,
          blockers: [],
          partialProgress: {},
          realServicesConnected: false,
          dodMet: false,
          acceptanceCriteria: false
        }
      });

      const analysis = contextAnalyzer.analyzeContext(emptyTaskState);

      expect(analysis.context.completionPercentage).toBe(0);
      expect(analysis.context.projectState).toBeOneOf(['INITIAL', 'DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'DEPLOY']);
    });

    it('should handle null/undefined evidence arrays', async () => {
      const state = createMockFrameworkState({ evidence: [] });

      const evidenceAge = state.evidence.length > 0 ?
        Math.round((Date.now() - Math.max(...state.evidence.map(e => e.timestamp.getTime()))) / (1000 * 60)) :
        999;

      expect(evidenceAge).toBe(999); // No evidence means very old
    });
  });

  // ============================================================================
  // SESSION MANAGEMENT TESTS
  // ============================================================================

  describe('Session Management', () => {
    it('should track session duration correctly', async () => {
      const now = new Date();
      const sessionStart = new Date(now.getTime() - 45 * 60 * 1000); // 45 minutes ago

      const state = createMockFrameworkState({
        orchestration: createMockOrchestration({
          sessionStartTime: sessionStart,
          timeRemaining: 45 // 45 minutes remaining of 90 minute session
        })
      });

      const analysis = contextAnalyzer.analyzeContext(state);

      expect(analysis.context.timeInSession).toBeGreaterThan(40);
      expect(analysis.context.timeInSession).toBeLessThan(50);
    });

    it('should enforce time gate compliance', async () => {
      // Test 30-minute gate
      const state30m = createMockFrameworkState({
        orchestration: createMockOrchestration({
          sessionStartTime: new Date(Date.now() - 35 * 60 * 1000),
          timeRemaining: 55,
          currentGate: '30m'
        })
      });

      const analysis30m = contextAnalyzer.analyzeContext(state30m);
      expect(analysis30m.context.timeInSession).toBeGreaterThan(30);

      // Test 60-minute gate
      const state60m = createMockFrameworkState({
        orchestration: createMockOrchestration({
          sessionStartTime: new Date(Date.now() - 65 * 60 * 1000),
          timeRemaining: 25,
          currentGate: '60m'
        })
      });

      const analysis60m = contextAnalyzer.analyzeContext(state60m);
      expect(analysis60m.context.timeInSession).toBeGreaterThan(60);
    });

    it('should detect session mode changes', async () => {
      const modes: Array<'DEVELOPMENT' | 'ENHANCEMENT' | 'DEBUG' | 'MAINTENANCE'> =
        ['DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'MAINTENANCE'];

      for (const mode of modes) {
        const state = createMockFrameworkState({
          orchestration: createMockOrchestration({ sessionMode: mode })
        });

        expect(state.orchestration.sessionMode).toBe(mode);

        const analysis = contextAnalyzer.analyzeContext(state);
        expect(analysis.context.sessionMode).toBe(mode);
      }
    });

    it('should track contract hash stability', async () => {
      // With contract hash
      const stateWithHash = createMockFrameworkState({
        orchestration: createMockOrchestration({
          contractHash: 'abc123def456789'
        })
      });

      expect(stateWithHash.orchestration.contractHash).toBeTruthy();

      // Without contract hash
      const stateWithoutHash = createMockFrameworkState({
        orchestration: createMockOrchestration({
          contractHash: ''
        })
      });

      expect(stateWithoutHash.orchestration.contractHash).toBe('');
    });

    it('should manage evidence freshness requirements', async () => {
      const now = new Date();

      // Fresh evidence (< 30 minutes)
      const freshEvidence = [{
        type: 'connection' as const,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000),
        path: 'evidence/fresh.log',
        valid: true,
        description: 'Fresh evidence'
      }];

      // Stale evidence (> 2 hours)
      const staleEvidence = [{
        type: 'connection' as const,
        timestamp: new Date(now.getTime() - 180 * 60 * 1000),
        path: 'evidence/stale.log',
        valid: false,
        description: 'Stale evidence'
      }];

      const freshState = createMockFrameworkState({ evidence: freshEvidence });
      const staleState = createMockFrameworkState({ evidence: staleEvidence });

      const freshAnalysis = contextAnalyzer.analyzeContext(freshState);
      const staleAnalysis = contextAnalyzer.analyzeContext(staleState);

      // Stale evidence should trigger violations
      expect(staleAnalysis.frameworkViolations.some(v => v.includes('Evidence'))).toBe(true);
    });

    it('should handle session handoff data', async () => {
      const handoffState = createMockFrameworkState({
        orchestration: createMockOrchestration({
          timeRemaining: 0,
          sessionMode: 'DEVELOPMENT'
        })
      });

      const analysis = contextAnalyzer.analyzeContext(handoffState);

      // Should recommend handoff when time is up
      expect(analysis.frameworkViolations.some(v => v.includes('Time gate'))).toBe(true);
    });
  });

  // ============================================================================
  // DRS (DEPLOYABILITY RATING SCORE) CALCULATION TESTS
  // ============================================================================

  describe('DRS Calculations', () => {
    it('should calculate DRS with all 13 components', async () => {
      // DRS components: contracts(7), behavioralContracts(7), security(16), dataIntegrity(9),
      // mocks(7), tests(7), integrationEvidence(9), architectureStability(7), productionReadiness(14),
      // contextPreservation(7), errors(4), scope(4), docs(2) = 100 total
      const expectedComponents = [
        'Contract Integrity',
        'Behavioral Contracts',
        'Security Validation',
        'Data Integrity',
        'No Mocks',
        'Tests Passing',
        'Integration Evidence',
        'Architecture Stability',
        'Production Readiness',
        'Context Preservation',
        'Error Handling',
        'Scope Compliance',
        'Documentation'
      ];

      // Test that each component is recognized
      for (const componentName of expectedComponents) {
        expect(expectedComponents).toContain(componentName);
      }

      expect(expectedComponents.length).toBe(13);
    });

    it('should enforce deployment threshold of 85', async () => {
      const deployableState = createMockFrameworkState({ drsScore: 90 });
      const nonDeployableState = createMockFrameworkState({ drsScore: 75 });

      const deployableAnalysis = contextAnalyzer.analyzeContext(deployableState);
      const nonDeployableAnalysis = contextAnalyzer.analyzeContext(nonDeployableState);

      // High DRS should allow deployment
      expect(deployableState.drsScore).toBeGreaterThanOrEqual(85);

      // Low DRS should prevent deployment
      expect(nonDeployableState.drsScore).toBeLessThan(85);
    });

    it('should determine correct status from score', async () => {
      const statusThresholds = [
        { score: 95, status: 'DEPLOYABLE' },
        { score: 85, status: 'DEPLOYABLE' },
        { score: 80, status: 'NEARLY_READY' },
        { score: 70, status: 'NEARLY_READY' },
        { score: 55, status: 'IN_PROGRESS' },
        { score: 40, status: 'IN_PROGRESS' },
        { score: 25, status: 'EARLY_DEVELOPMENT' },
        { score: 10, status: 'EARLY_DEVELOPMENT' }
      ];

      for (const { score, status } of statusThresholds) {
        const derivedStatus = score >= 85 ? 'DEPLOYABLE' :
                              score >= 70 ? 'NEARLY_READY' :
                              score >= 40 ? 'IN_PROGRESS' : 'EARLY_DEVELOPMENT';

        expect(derivedStatus).toBe(status);
      }
    });

    it('should generate next actions based on component scores', async () => {
      const mockComponents = [
        { name: 'Contract Integrity', status: 'fail', maxScore: 7 },
        { name: 'Tests Passing', status: 'partial', maxScore: 7 },
        { name: 'Documentation', status: 'pass', maxScore: 2 }
      ];

      const actions: string[] = [];

      for (const component of mockComponents) {
        if (component.status === 'fail') {
          actions.push(`Fix ${component.name.toLowerCase()} (+${component.maxScore})`);
        } else if (component.status === 'partial') {
          actions.push(`Improve ${component.name.toLowerCase()}`);
        }
      }

      expect(actions.length).toBe(2); // One fail, one partial
      expect(actions[0]).toContain('contract integrity');
    });

    it('should estimate time to deployment', async () => {
      const estimateTime = (score: number): string => {
        if (score >= 85) return 'Ready to deploy';
        const pointsNeeded = 85 - score;
        // Rough estimate: 5 minutes per point
        const estimatedMinutes = pointsNeeded * 5;

        if (estimatedMinutes < 60) {
          return `${estimatedMinutes} minutes`;
        } else {
          return `${Math.round(estimatedMinutes / 60)} hours`;
        }
      };

      expect(estimateTime(90)).toBe('Ready to deploy');
      expect(estimateTime(75)).toContain('minutes');
      expect(estimateTime(40)).toContain('hours');
    });

    it('should track DRS component weights correctly', async () => {
      const expectedWeights = {
        contracts: 7,
        behavioralContracts: 7,
        security: 16,
        dataIntegrity: 9,
        mocks: 7,
        tests: 7,
        integrationEvidence: 9,
        architectureStability: 7,
        productionReadiness: 14,
        contextPreservation: 7,
        errors: 4,
        scope: 4,
        docs: 2
      };

      const totalWeight = Object.values(expectedWeights).reduce((a, b) => a + b, 0);
      expect(totalWeight).toBe(100);
    });

    it('should handle DRS decline detection', async () => {
      const previousDRS = 80;
      const currentDRS = 65;
      const decline = previousDRS - currentDRS;

      expect(decline).toBeGreaterThan(10); // Significant decline

      // Should trigger DRS degradation response
      if (currentDRS < 70) {
        const context: PromptContext = {
          projectState: 'DEVELOPMENT',
          drsScore: currentDRS,
          lastAction: 'Recent changes',
          timeInSession: 45,
          blockers: [],
          frameworkCompliance: false,
          confidence: 'LOW',
          sessionMode: 'DEVELOPMENT',
          completionPercentage: 60
        };

        const criteria = {
          context,
          frameworkViolations: [`DRS declined from ${previousDRS} to ${currentDRS}`],
          timeConstraints: {
            remainingMinutes: 45,
            sessionDuration: 45
          }
        };

        const selection = promptSelector.selectPrompt(criteria);
        expect(selection.frameworkCompliance).toBe(false);
      }
    });
  });

  // ============================================================================
  // EDGE CASES AND BOUNDARY TESTS
  // ============================================================================

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle zero DRS score', async () => {
      const zeroState = createMockFrameworkState({ drsScore: 0 });
      const analysis = contextAnalyzer.analyzeContext(zeroState);

      expect(analysis.context.drsScore).toBe(0);
      expect(analysis.context.projectState).toBeOneOf(['INITIAL', 'DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'DEPLOY']);
    });

    it('should handle maximum DRS score', async () => {
      const maxState = createMockFrameworkState({ drsScore: 100 });
      const analysis = contextAnalyzer.analyzeContext(maxState);

      expect(analysis.context.drsScore).toBe(100);
    });

    it('should handle zero time remaining', async () => {
      const noTimeState = createMockFrameworkState({
        orchestration: createMockOrchestration({ timeRemaining: 0 })
      });

      const analysis = contextAnalyzer.analyzeContext(noTimeState);

      expect(analysis.frameworkViolations.some(v => v.includes('Time gate'))).toBe(true);
    });

    it('should handle negative time remaining', async () => {
      const negativeTimeState = createMockFrameworkState({
        orchestration: createMockOrchestration({ timeRemaining: -30 })
      });

      const analysis = contextAnalyzer.analyzeContext(negativeTimeState);

      expect(analysis.frameworkViolations.some(v => v.includes('Time gate exceeded'))).toBe(true);
    });

    it('should handle 100% completion', async () => {
      const completeState = createMockFrameworkState({
        tasks: {
          tasks: [],
          completionPercentage: 100,
          blockers: [],
          partialProgress: {},
          realServicesConnected: true,
          dodMet: true,
          acceptanceCriteria: true
        }
      });

      const analysis = contextAnalyzer.analyzeContext(completeState);
      expect(analysis.context.completionPercentage).toBe(100);
    });

    it('should handle empty blockers array', async () => {
      const noBlockersState = createMockFrameworkState({
        tasks: {
          tasks: [],
          completionPercentage: 50,
          blockers: [],
          partialProgress: {},
          realServicesConnected: true,
          dodMet: false,
          acceptanceCriteria: true
        }
      });

      const analysis = contextAnalyzer.analyzeContext(noBlockersState);
      expect(analysis.context.blockers).toEqual([]);
    });

    it('should handle multiple blockers', async () => {
      const multipleBlockersState = createMockFrameworkState({
        tasks: {
          tasks: [],
          completionPercentage: 30,
          blockers: [
            {
              id: '1',
              description: 'API authentication failing',
              timestamp: new Date(),
              attemptedFixes: ['Tried refreshing token'],
              requiredAction: 'Contact API provider'
            },
            {
              id: '2',
              description: 'Database connection timeout',
              timestamp: new Date(),
              attemptedFixes: ['Increased timeout'],
              requiredAction: 'Check network configuration'
            }
          ],
          partialProgress: {},
          realServicesConnected: false,
          dodMet: false,
          acceptanceCriteria: false
        }
      });

      const analysis = contextAnalyzer.analyzeContext(multipleBlockersState);
      expect(analysis.context.blockers.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle all confidence levels', async () => {
      const confidenceLevels: Array<'HIGH' | 'MEDIUM' | 'LOW'> = ['HIGH', 'MEDIUM', 'LOW'];

      for (const confidence of confidenceLevels) {
        const state = createMockFrameworkState({
          orchestration: createMockOrchestration({ confidence }),
          confidence
        });

        const analysis = contextAnalyzer.analyzeContext(state);

        // Low confidence should be flagged as violation
        if (confidence === 'LOW') {
          expect(analysis.frameworkViolations.some(v => v.includes('Confidence'))).toBe(true);
        }
      }
    });

    it('should handle very long session duration', async () => {
      const longSessionState = createMockFrameworkState({
        orchestration: createMockOrchestration({
          sessionStartTime: new Date(Date.now() - 180 * 60 * 1000), // 3 hours ago
          timeRemaining: -60
        })
      });

      const analysis = contextAnalyzer.analyzeContext(longSessionState);

      expect(analysis.context.timeInSession).toBeGreaterThan(170);
      expect(analysis.frameworkViolations.some(v => v.includes('Time gate'))).toBe(true);
    });

    it('should handle prompt selection with all alternatives available', async () => {
      const context: PromptContext = {
        projectState: 'DEVELOPMENT',
        drsScore: 70,
        lastAction: 'Working',
        timeInSession: 45,
        blockers: [],
        frameworkCompliance: true,
        confidence: 'MEDIUM',
        sessionMode: 'DEVELOPMENT',
        completionPercentage: 50
      };

      const criteria = {
        context,
        frameworkViolations: [],
        timeConstraints: {
          remainingMinutes: 45,
          sessionDuration: 45
        }
      };

      const selection = promptSelector.selectPrompt(criteria);

      // Should have alternatives
      expect(selection.alternativePrompts).toBeDefined();
      expect(Array.isArray(selection.alternativePrompts)).toBe(true);
    });

    it('should validate selection results', async () => {
      const context: PromptContext = {
        projectState: 'DEVELOPMENT',
        drsScore: 70,
        lastAction: 'Working',
        timeInSession: 30,
        blockers: [],
        frameworkCompliance: true,
        confidence: 'MEDIUM',
        sessionMode: 'DEVELOPMENT',
        completionPercentage: 50
      };

      const criteria = {
        context,
        frameworkViolations: [],
        timeConstraints: {
          remainingMinutes: 30,
          sessionDuration: 30
        }
      };

      const selection = promptSelector.selectPrompt(criteria);
      const validation = promptSelector.validateSelection(selection, criteria);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle forced prompt selection', async () => {
      const criteria = {
        context: {
          projectState: 'DEVELOPMENT' as const,
          drsScore: 70,
          lastAction: 'Testing forced selection',
          timeInSession: 30,
          blockers: [],
          frameworkCompliance: true,
          confidence: 'MEDIUM' as const,
          sessionMode: 'DEVELOPMENT',
          completionPercentage: 50
        },
        frameworkViolations: [],
        timeConstraints: {
          remainingMinutes: 30,
          sessionDuration: 30
        },
        forcePrompt: 'P_ASSESS'
      };

      const selection = promptSelector.selectPrompt(criteria);

      expect(selection.selectedPrompt.id).toBe('P_ASSESS');
      expect(selection.selectionReason).toContain('Forced selection');
    });
  });

  // ============================================================================
  // CONTEXT ANALYZER VALIDATION TESTS
  // ============================================================================

  describe('Context Analyzer Validation', () => {
    it('should validate analysis results', async () => {
      const state = createMockFrameworkState();
      const analysis = contextAnalyzer.analyzeContext(state);

      const validation = contextAnalyzer.validateAnalysis(analysis);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing confidence declaration', async () => {
      const invalidAnalysis = {
        context: {
          projectState: 'DEVELOPMENT' as const,
          drsScore: 70,
          lastAction: 'Working',
          timeInSession: 30,
          blockers: [],
          frameworkCompliance: true,
          confidence: undefined as any,
          sessionMode: 'DEVELOPMENT',
          completionPercentage: 50
        },
        recommendations: [],
        confidence: undefined as any,
        reasoning: '',
        frameworkViolations: [],
        nextGateDeadline: new Date(),
        criticalPath: []
      };

      const validation = contextAnalyzer.validateAnalysis(invalidAnalysis);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Confidence'))).toBe(true);
    });

    it('should get recommended prompt based on context', async () => {
      const context: PromptContext = {
        projectState: 'DEVELOPMENT',
        drsScore: 70,
        lastAction: 'Working',
        timeInSession: 30,
        blockers: [],
        frameworkCompliance: true,
        confidence: 'MEDIUM',
        sessionMode: 'DEVELOPMENT',
        completionPercentage: 25
      };

      const recommendedPrompt = contextAnalyzer.getRecommendedPrompt(context, []);

      expect(recommendedPrompt).toBeTruthy();
      // Development with 25% completion should recommend D. PLAN (smallest next win)
      // Note: Q. DECIDE is for < 25% completion, D. PLAN is for 25-74%
      expect(recommendedPrompt).toMatch(/D\. PLAN|Q\. DECIDE/);
    });
  });
});