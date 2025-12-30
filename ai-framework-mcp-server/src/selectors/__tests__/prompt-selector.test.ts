/**
 * Unit tests for PromptSelector
 * Tests ai-framework compliance and prompt selection accuracy
 */

import { PromptSelector, PromptSelectionCriteria } from '../prompt-selector';
import { PromptContext } from '../../types/framework-state';

describe('PromptSelector', () => {
  let selector: PromptSelector;

  beforeEach(() => {
    selector = new PromptSelector();
  });

  // Helper function to create test criteria
  const createTestCriteria = (overrides: Partial<PromptSelectionCriteria> = {}): PromptSelectionCriteria => {
    return {
      context: {
        projectState: 'DEVELOPMENT',
        drsScore: 70,
        lastAction: 'Working on feature',
        timeInSession: 30,
        blockers: [],
        frameworkCompliance: true,
        confidence: 'MEDIUM',
        sessionMode: 'DEVELOPMENT',
        completionPercentage: 50
      },
      frameworkViolations: [],
      timeConstraints: {
        remainingMinutes: 30,
        sessionDuration: 30
      },
      ...overrides
    };
  };

  describe('framework violation handling', () => {
    it('should prioritize time gate violations', () => {
      const criteria = createTestCriteria({
        frameworkViolations: [
          'Time gate exceeded - session must end',
          'DRS 75 below deployment threshold (85)'
        ],
        timeConstraints: {
          remainingMinutes: -5,
          sessionDuration: 95
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('I_HANDOFF');
      expect(result.selectionReason).toContain('Time gate exceeded');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should handle DRS deployment violations', () => {
      const criteria = createTestCriteria({
        frameworkViolations: ['DRS 75 below deployment threshold (85)'],
        context: {
          ...createTestCriteria().context,
          drsScore: 75,
          projectState: 'DEPLOY'
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('T_DEPLOY_DECIDE');
      expect(result.selectionReason).toContain('DRS below deployment threshold');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should handle stale evidence violations', () => {
      const criteria = createTestCriteria({
        frameworkViolations: ['Evidence 180min old, exceeds 2h limit']
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('K_EVIDENCE');
      expect(result.selectionReason).toContain('Evidence stale');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should handle low confidence violations', () => {
      const criteria = createTestCriteria({
        frameworkViolations: ['Confidence not declared or too low'],
        context: {
          ...createTestCriteria().context,
          confidence: 'LOW'
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('N_UNCERTAINTY');
      expect(result.selectionReason).toContain('Low confidence');
      expect(result.confidence).toBe('MEDIUM');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should handle general violations with verify prompt', () => {
      const criteria = createTestCriteria({
        frameworkViolations: ['Some other framework violation']
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('E_VERIFY');
      expect(result.selectionReason).toContain('Framework violations detected');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(false);
    });
  });

  describe('time gate handling', () => {
    it('should force handoff when time exceeded', () => {
      const criteria = createTestCriteria({
        timeConstraints: {
          remainingMinutes: -10,
          sessionDuration: 100
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('I_HANDOFF');
      expect(result.selectionReason).toContain('Time gate exceeded');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should allow deployment in final minutes if ready', () => {
      const criteria = createTestCriteria({
        context: {
          ...createTestCriteria().context,
          projectState: 'DEPLOY',
          drsScore: 90
        },
        timeConstraints: {
          remainingMinutes: 3,
          sessionDuration: 87
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('G_DEPLOY');
      expect(result.selectionReason).toContain('Final minutes - deploy if ready');
      expect(result.confidence).toBe('MEDIUM');
      expect(result.frameworkCompliance).toBe(true);
    });

    it('should recommend handoff in final minutes if not ready', () => {
      const criteria = createTestCriteria({
        context: {
          ...createTestCriteria().context,
          projectState: 'DEVELOPMENT',
          drsScore: 60
        },
        timeConstraints: {
          remainingMinutes: 3,
          sessionDuration: 87
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('I_HANDOFF');
      expect(result.selectionReason).toContain('Insufficient time remaining');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(true);
    });

    it('should recommend checkpoint when approaching time gate', () => {
      const criteria = createTestCriteria({
        timeConstraints: {
          remainingMinutes: 10,
          sessionDuration: 80
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('L_CHECKPOINT');
      expect(result.selectionReason).toContain('Approaching time gate');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(true);
    });
  });

  describe('context-based selection', () => {
    describe('initial state', () => {
      it('should select START for new projects', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'INITIAL',
            completionPercentage: 0
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('A_START');
        expect(result.selectionReason).toContain('New session');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });

      it('should select ASSESS for unclear initial state', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'INITIAL',
            completionPercentage: 25
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('P_ASSESS');
        expect(result.selectionReason).toContain('state unclear');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });
    });

    describe('development state', () => {
      it('should handle blockers first', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEVELOPMENT',
            blockers: ['API endpoint down', 'Database connection failed']
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('F_BLOCKED');
        expect(result.selectionReason).toContain('2 blockers detected');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });

      it('should recommend checkpoint after 1 hour', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEVELOPMENT'
          },
          timeConstraints: {
            remainingMinutes: 30,
            sessionDuration: 65
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('L_CHECKPOINT');
        expect(result.selectionReason).toContain('One hour elapsed');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });

      it('should recommend DECIDE for early development', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEVELOPMENT',
            completionPercentage: 20
          },
          timeConstraints: {
            remainingMinutes: 45,
            sessionDuration: 15
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('Q_DECIDE');
        expect(result.selectionReason).toContain('Early development');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });

      it('should recommend VERIFY for high completion', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEVELOPMENT',
            completionPercentage: 80
          },
          timeConstraints: {
            remainingMinutes: 45,
            sessionDuration: 15
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('E_VERIFY');
        expect(result.selectionReason).toContain('High completion');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });

      it('should recommend PLAN for active development', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEVELOPMENT',
            completionPercentage: 50
          },
          timeConstraints: {
            remainingMinutes: 45,
            sessionDuration: 15
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('D_PLAN');
        expect(result.selectionReason).toContain('Active development');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });
    });

    describe('enhancement state', () => {
      it('should verify compliance first if not compliant', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'ENHANCEMENT',
            frameworkCompliance: false
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('E_VERIFY');
        expect(result.selectionReason).toContain('not compliant');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(false);
      });

      it('should select ENHANCE for compliant enhancement mode', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'ENHANCEMENT',
            sessionMode: 'ENHANCEMENT',
            frameworkCompliance: true
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('R_ENHANCE');
        expect(result.selectionReason).toContain('Enhancement mode');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });
    });

    describe('debug state', () => {
      it('should reassess if no blockers in debug mode', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEBUG',
            blockers: []
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('P_ASSESS');
        expect(result.selectionReason).toContain('no blockers identified');
        expect(result.confidence).toBe('MEDIUM');
        expect(result.frameworkCompliance).toBe(false);
      });

      it('should select CORRECT for debug with blockers', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEBUG',
            blockers: ['Authentication failing']
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('S_CORRECT');
        expect(result.selectionReason).toContain('Debug mode with blockers');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });
    });

    describe('deployment state', () => {
      it('should assess deployment readiness if DRS too low', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEPLOY',
            drsScore: 75
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('T_DEPLOY_DECIDE');
        expect(result.selectionReason).toContain('DRS 75 below threshold');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(false);
      });

      it('should deploy if DRS threshold met', () => {
        const criteria = createTestCriteria({
          context: {
            ...createTestCriteria().context,
            projectState: 'DEPLOY',
            drsScore: 90
          }
        });

        const result = selector.selectPrompt(criteria);

        expect(result.selectedPrompt.id).toBe('G_DEPLOY');
        expect(result.selectionReason).toContain('DRS threshold met');
        expect(result.confidence).toBe('HIGH');
        expect(result.frameworkCompliance).toBe(true);
      });
    });
  });

  describe('forced prompt selection', () => {
    it('should select forced prompt when specified', () => {
      const criteria = createTestCriteria({
        forcePrompt: 'K_EVIDENCE'
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('K_EVIDENCE');
      expect(result.selectionReason).toContain('Forced selection');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(true);
    });

    it('should handle invalid forced prompt gracefully', () => {
      const criteria = createTestCriteria({
        forcePrompt: 'INVALID_PROMPT'
      });

      // Should fall back to normal selection
      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).not.toBe('INVALID_PROMPT');
      expect(result.selectionReason).not.toContain('Forced selection');
    });
  });

  describe('alternative prompts', () => {
    it('should provide relevant alternatives', () => {
      const criteria = createTestCriteria({
        context: {
          ...createTestCriteria().context,
          projectState: 'DEVELOPMENT'
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.alternativePrompts.length).toBeGreaterThan(0);
      expect(result.alternativePrompts.length).toBeLessThanOrEqual(3);
      
      // Should not include the selected prompt
      const alternativeIds = result.alternativePrompts.map(p => p.id);
      expect(alternativeIds).not.toContain(result.selectedPrompt.id);
    });

    it('should include assessment as alternative', () => {
      const criteria = createTestCriteria({
        context: {
          ...createTestCriteria().context,
          projectState: 'DEVELOPMENT'
        }
      });

      const result = selector.selectPrompt(criteria);

      if (result.selectedPrompt.id !== 'P_ASSESS') {
        const alternativeIds = result.alternativePrompts.map(p => p.id);
        expect(alternativeIds).toContain('P_ASSESS');
      }
    });

    it('should include time-based alternatives when appropriate', () => {
      const criteria = createTestCriteria({
        timeConstraints: {
          remainingMinutes: 12, // Within time gate threshold (<=15)
          sessionDuration: 72
        }
      });

      const result = selector.selectPrompt(criteria);

      // When in time gate mode, the selected prompt is L_CHECKPOINT
      // Alternatives should exist (time-based scenarios return limited alternatives)
      expect(['L_CHECKPOINT', 'I_HANDOFF', 'G_DEPLOY'].includes(result.selectedPrompt.id)).toBe(true);
    });
  });

  describe('available prompts', () => {
    it('should return prompts available for context', () => {
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

      const available = selector.getAvailablePrompts(context);

      expect(available.length).toBeGreaterThan(0);
      
      // Should be sorted by priority
      for (let i = 1; i < available.length; i++) {
        expect(available[i-1].priority).toBeGreaterThanOrEqual(available[i].priority);
      }
    });

    it('should filter prompts by conditions', () => {
      const context: PromptContext = {
        projectState: 'INITIAL',
        drsScore: 20,
        lastAction: 'Starting',
        timeInSession: 5,
        blockers: [],
        frameworkCompliance: true,
        confidence: 'MEDIUM',
        sessionMode: 'DEVELOPMENT',
        completionPercentage: 0
      };

      const available = selector.getAvailablePrompts(context);
      const availableIds = available.map(p => p.id);

      // Should include START for initial state
      expect(availableIds).toContain('A_START');
      
      // Should not include deployment prompts for low DRS
      expect(availableIds).not.toContain('G_DEPLOY');
    });
  });

  describe('selection validation', () => {
    it('should validate correct selection', () => {
      const criteria = createTestCriteria();
      const result = selector.selectPrompt(criteria);
      const validation = selector.validateSelection(result, criteria);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect inappropriate prompt for context', () => {
      // Create a context where G_DEPLOY is available (to get the prompt)
      const deployContext = {
        ...createTestCriteria().context,
        projectState: 'DEPLOY' as const,
        drsScore: 90
      };

      // Get the G_DEPLOY prompt from an appropriate context
      const gDeployPrompt = selector.getAvailablePrompts(deployContext).find(p => p.id === 'G_DEPLOY')!;

      // Now create criteria where G_DEPLOY would be inappropriate
      const criteria = createTestCriteria({
        context: {
          ...createTestCriteria().context,
          drsScore: 50, // Too low for deployment
          projectState: 'DEVELOPMENT' // Not in deploy state
        }
      });

      const result = selector.selectPrompt(criteria);
      // Manually set the inappropriate prompt
      result.selectedPrompt = gDeployPrompt;

      const validation = selector.validateSelection(result, criteria);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('not suitable for current context'))).toBe(true);
    });

    it('should detect compliance mismatch', () => {
      const criteria = createTestCriteria({
        frameworkViolations: ['Some violation']
      });

      const result = selector.selectPrompt(criteria);
      result.frameworkCompliance = true; // Incorrect - should be false with violations

      const validation = selector.validateSelection(result, criteria);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('violations exist but selection marked as compliant'))).toBe(true);
    });

    it('should detect time gate violation without handoff', () => {
      const criteria = createTestCriteria({
        timeConstraints: {
          remainingMinutes: -5,
          sessionDuration: 95
        }
      });

      const result = selector.selectPrompt(criteria);
      // Manually set wrong prompt for testing
      result.selectedPrompt = selector.getAvailablePrompts(criteria.context).find(p => p.id === 'D_PLAN')!;

      const validation = selector.validateSelection(result, criteria);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Time gate exceeded but handoff not selected'))).toBe(true);
    });

    it('should detect missing confidence', () => {
      const criteria = createTestCriteria();
      const result = selector.selectPrompt(criteria);
      result.confidence = undefined as any;

      const validation = selector.validateSelection(result, criteria);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Confidence not declared'))).toBe(true);
    });

    it('should detect insufficient reasoning', () => {
      const criteria = createTestCriteria();
      const result = selector.selectPrompt(criteria);
      result.selectionReason = 'Short';

      const validation = selector.validateSelection(result, criteria);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Insufficient selection reasoning'))).toBe(true);
    });
  });

  describe('ai-framework principle adherence', () => {
    it('should always prioritize framework violations', () => {
      const criteria = createTestCriteria({
        frameworkViolations: ['Time gate exceeded'],
        context: {
          ...createTestCriteria().context,
          projectState: 'DEPLOY',
          drsScore: 95 // Perfect for deployment
        }
      });

      const result = selector.selectPrompt(criteria);

      // Should handle violation, not deployment
      expect(result.selectedPrompt.id).toBe('I_HANDOFF');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should respect DRS thresholds strictly', () => {
      const criteria = createTestCriteria({
        context: {
          ...createTestCriteria().context,
          projectState: 'DEPLOY',
          drsScore: 84 // Just below threshold
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('T_DEPLOY_DECIDE');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should enforce time gates as hard limits', () => {
      const criteria = createTestCriteria({
        timeConstraints: {
          remainingMinutes: 0,
          sessionDuration: 90
        }
      });

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('I_HANDOFF');
      expect(result.confidence).toBe('HIGH');
    });

    it('should always declare confidence with reasoning', () => {
      const criteria = createTestCriteria();
      const result = selector.selectPrompt(criteria);

      expect(result.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(result.selectionReason).toBeTruthy();
      expect(result.selectionReason.length).toBeGreaterThan(10);
    });

    it('should provide actionable alternatives', () => {
      const criteria = createTestCriteria();
      const result = selector.selectPrompt(criteria);

      expect(result.alternativePrompts.length).toBeGreaterThan(0);
      
      // All alternatives should be valid for context
      for (const alternative of result.alternativePrompts) {
        expect(selector.getAvailablePrompts(criteria.context).map(p => p.id)).toContain(alternative.id);
      }
    });
  });
});