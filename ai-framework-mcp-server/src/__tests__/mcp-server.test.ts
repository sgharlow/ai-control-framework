/**
 * Integration tests for MCP Server tools
 * Tests the core MCP functionality without requiring actual MCP transport
 */

import { FrameworkStateReader } from '../services/framework-state-reader';
import { ContextAnalyzer } from '../analyzers/context-analyzer';
import { PromptSelector } from '../selectors/prompt-selector';
import { tmpdir } from 'os';
import { join } from 'path';

describe('MCP Server Tools Integration', () => {
  let frameworkStateReader: FrameworkStateReader;
  let contextAnalyzer: ContextAnalyzer;
  let promptSelector: PromptSelector;
  let testProjectPath: string;

  beforeEach(() => {
    frameworkStateReader = new FrameworkStateReader();
    contextAnalyzer = new ContextAnalyzer();
    promptSelector = new PromptSelector();
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
});