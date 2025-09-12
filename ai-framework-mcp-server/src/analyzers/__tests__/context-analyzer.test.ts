/**
 * Unit tests for ContextAnalyzer
 * Tests ai-framework compliance and context analysis accuracy
 */

import { ContextAnalyzer } from '../context-analyzer';
import { FrameworkState, OrchestrationData, TaskData, EvidenceFile } from '../../types/framework-state';

describe('ContextAnalyzer', () => {
  let analyzer: ContextAnalyzer;

  beforeEach(() => {
    analyzer = new ContextAnalyzer();
  });

  // Helper function to create test framework state
  const createTestState = (overrides: Partial<FrameworkState> = {}): FrameworkState => {
    const now = new Date();
    
    return {
      orchestration: {
        sessionMode: 'DEVELOPMENT',
        currentGate: '30m',
        gateDeadline: new Date(now.getTime() + 30 * 60 * 1000),
        confidence: 'MEDIUM',
        lastEvidence: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
        contractHash: 'abc123',
        sessionStartTime: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
        timeRemaining: 15
      },
      tasks: {
        tasks: [],
        completionPercentage: 50,
        blockers: [],
        partialProgress: {}
      },
      drsScore: 70,
      evidence: [
        {
          type: 'connection',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
          path: 'evidence/api-test.log',
          valid: true,
          description: 'API connection test'
        }
      ],
      lastUpdate: now,
      confidence: 'MEDIUM',
      projectPath: '/test/project',
      ...overrides
    };
  };

  describe('analyzeContext', () => {
    it('should analyze basic development context correctly', () => {
      const state = createTestState();
      const result = analyzer.analyzeContext(state);

      expect(result.context.projectState).toBe('DEVELOPMENT');
      expect(result.context.drsScore).toBe(70);
      expect(result.context.frameworkCompliance).toBe(true);
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkViolations).toHaveLength(0);
    });

    it('should identify deployment context when DRS >= 85 and high completion', () => {
      const state = createTestState({
        drsScore: 90,
        tasks: {
          tasks: [],
          completionPercentage: 95,
          blockers: [],
          partialProgress: {}
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.context.projectState).toBe('DEPLOY');
      expect(result.recommendations).toContain('Use T. DEPLOY-DECIDE for deployment assessment');
    });

    it('should identify initial context for new projects', () => {
      const state = createTestState({
        drsScore: 25,
        tasks: {
          tasks: [],
          completionPercentage: 0,
          blockers: [],
          partialProgress: {}
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.context.projectState).toBe('INITIAL');
      expect(result.recommendations).toContain('Use A. START to initialize session properly');
    });

    it('should respect session mode for context determination', () => {
      const debugState = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          sessionMode: 'DEBUG'
        }
      });

      const result = analyzer.analyzeContext(debugState);

      expect(result.context.projectState).toBe('DEBUG');
      // Check that debug recommendations are present (may be after violation warnings)
      const hasDebugRecommendation = result.recommendations.some(r => 
        r.includes('S. CORRECT') || r.includes('H. DEBUG')
      );
      expect(hasDebugRecommendation).toBe(true);
    });
  });

  describe('framework violation detection', () => {
    it('should detect DRS below deployment threshold', () => {
      const state = createTestState({
        drsScore: 75, // Below 85
        tasks: {
          tasks: [],
          completionPercentage: 95, // High completion suggests deployment intent
          blockers: [],
          partialProgress: {}
        }
      });

      const violations = analyzer.identifyFrameworkViolations(state);

      expect(violations).toContain('DRS 75 below deployment threshold (85)');
    });

    it('should detect stale evidence', () => {
      const now = new Date();
      const state = createTestState({
        evidence: [
          {
            type: 'connection',
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
            path: 'evidence/old-test.log',
            valid: true,
            description: 'Old API test'
          }
        ]
      });

      const violations = analyzer.identifyFrameworkViolations(state);

      expect(violations.some(v => v.includes('Evidence') && v.includes('exceeds 2h limit'))).toBe(true);
    });

    it('should detect time gate violations', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          timeRemaining: -5 // Exceeded
        }
      });

      const violations = analyzer.identifyFrameworkViolations(state);

      expect(violations).toContain('Time gate exceeded - session must end');
    });

    it('should detect low confidence', () => {
      const state = createTestState({
        confidence: 'LOW'
      });

      const violations = analyzer.identifyFrameworkViolations(state);

      expect(violations).toContain('Confidence not declared or too low');
    });

    it('should detect inappropriate session mode', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          sessionMode: 'DEBUG'
        },
        tasks: {
          tasks: [],
          completionPercentage: 50,
          blockers: [], // No blockers but in DEBUG mode
          partialProgress: {}
        }
      });

      const violations = analyzer.identifyFrameworkViolations(state);

      expect(violations).toContain('DEBUG mode but no blockers identified');
    });
  });

  describe('recommendation generation', () => {
    it('should prioritize framework violations', () => {
      const state = createTestState({
        drsScore: 60, // Below deployment threshold
        tasks: {
          tasks: [],
          completionPercentage: 95, // High completion suggests deployment
          blockers: [],
          partialProgress: {}
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.recommendations[0]).toBe('Address framework violations before continuing');
      expect(result.recommendations).toContain('Use T. DEPLOY-DECIDE to assess deployment readiness');
    });

    it('should provide context-appropriate recommendations', () => {
      const enhancementState = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          sessionMode: 'ENHANCEMENT'
        }
      });

      const result = analyzer.analyzeContext(enhancementState);

      expect(result.recommendations).toContain('Use R. ENHANCE to plan enhancement safely');
      expect(result.recommendations).toContain('Use E. VERIFY to maintain compliance');
    });

    it('should recommend time-based actions', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          sessionStartTime: new Date(Date.now() - 95 * 60 * 1000), // 95 minutes ago
          timeRemaining: 5
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.recommendations).toContain('Consider I. HANDOFF - approaching session limits');
    });

    it('should recommend DRS-focused actions', () => {
      const lowDRSState = createTestState({
        drsScore: 45
      });

      const result = analyzer.analyzeContext(lowDRSState);

      expect(result.recommendations).toContain('Focus on DRS improvement before new features');
    });
  });

  describe('confidence calculation', () => {
    it('should return HIGH confidence for compliant state', () => {
      const state = createTestState({
        drsScore: 85,
        confidence: 'HIGH',
        evidence: [
          {
            type: 'connection',
            timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
            path: 'evidence/recent-test.log',
            valid: true,
            description: 'Recent API test'
          }
        ]
      });

      const result = analyzer.analyzeContext(state);

      expect(result.confidence).toBe('HIGH');
    });

    it('should return LOW confidence for problematic state', () => {
      const state = createTestState({
        drsScore: 30, // Very low
        tasks: {
          tasks: [],
          completionPercentage: 10,
          blockers: [
            {
              id: 'blocker-1',
              description: 'API endpoint down',
              timestamp: new Date(),
              attemptedFixes: [],
              requiredAction: 'Contact ops team'
            }
          ],
          partialProgress: {}
        },
        evidence: [
          {
            type: 'connection',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            path: 'evidence/stale-test.log',
            valid: false,
            description: 'Stale test'
          }
        ],
        orchestration: {
          ...createTestState().orchestration,
          timeRemaining: 5 // Almost out of time
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.confidence).toBe('LOW');
    });
  });

  describe('critical path identification', () => {
    it('should identify violations as critical path', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          timeRemaining: -10 // Exceeded
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.criticalPath).toContain('Resolve framework violations');
    });

    it('should identify DRS improvement as critical for deployment', () => {
      const state = createTestState({
        drsScore: 75,
        tasks: {
          tasks: [],
          completionPercentage: 90, // High completion
          blockers: [],
          partialProgress: {}
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.criticalPath).toContain('Improve DRS to deployment threshold');
    });

    it('should identify blocked tasks as critical', () => {
      const state = createTestState({
        tasks: {
          tasks: [],
          completionPercentage: 50,
          blockers: [
            {
              id: 'blocker-1',
              description: 'Database connection failed',
              timestamp: new Date(),
              attemptedFixes: ['Restarted service'],
              requiredAction: 'Check network configuration'
            }
          ],
          partialProgress: {}
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.criticalPath).toContain('Unblock critical tasks');
    });
  });

  describe('prompt recommendation', () => {
    it('should recommend violation-handling prompts first', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          timeRemaining: -5
        }
      });

      const result = analyzer.analyzeContext(state);
      const recommendedPrompt = analyzer.getRecommendedPrompt(result.context, result.frameworkViolations);

      expect(recommendedPrompt).toBe('I. HANDOFF');
    });

    it('should recommend context-appropriate prompts', () => {
      const initialState = createTestState({
        drsScore: 20,
        tasks: {
          tasks: [],
          completionPercentage: 0,
          blockers: [],
          partialProgress: {}
        }
      });

      const result = analyzer.analyzeContext(initialState);
      const recommendedPrompt = analyzer.getRecommendedPrompt(result.context, result.frameworkViolations);

      expect(recommendedPrompt).toBe('A. START');
    });

    it('should recommend deployment prompts for ready projects', () => {
      const deployReadyState = createTestState({
        drsScore: 90,
        tasks: {
          tasks: [],
          completionPercentage: 95,
          blockers: [],
          partialProgress: {}
        }
      });

      const result = analyzer.analyzeContext(deployReadyState);
      const recommendedPrompt = analyzer.getRecommendedPrompt(result.context, result.frameworkViolations);

      expect(recommendedPrompt).toBe('G. DEPLOY');
    });
  });

  describe('analysis validation', () => {
    it('should validate complete analysis', () => {
      const state = createTestState();
      const result = analyzer.analyzeContext(state);
      const validation = analyzer.validateAnalysis(result);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing confidence', () => {
      const state = createTestState();
      const result = analyzer.analyzeContext(state);
      result.confidence = undefined as any;

      const validation = analyzer.validateAnalysis(result);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Confidence not declared');
    });

    it('should detect insufficient reasoning', () => {
      const state = createTestState();
      const result = analyzer.analyzeContext(state);
      result.reasoning = 'Short';

      const validation = analyzer.validateAnalysis(result);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Insufficient reasoning provided');
    });

    it('should detect unaddressed violations', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          timeRemaining: -10
        }
      });

      const result = analyzer.analyzeContext(state);
      result.recommendations = ['Some other recommendation']; // Doesn't address violations

      const validation = analyzer.validateAnalysis(result);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Framework violations not addressed in recommendations');
    });

    it('should detect missing handoff for exceeded time gate', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          gateDeadline: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          timeRemaining: -10
        }
      });

      const result = analyzer.analyzeContext(state);
      result.recommendations = ['Continue working']; // Wrong recommendation

      const validation = analyzer.validateAnalysis(result);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Time gate exceeded but no handoff recommended');
    });
  });

  describe('ai-framework principle adherence', () => {
    it('should always be DRS-focused', () => {
      const state = createTestState({ drsScore: 45 });
      const result = analyzer.analyzeContext(state);

      // Should mention DRS in reasoning
      expect(result.reasoning).toContain('DRS: 45');
      
      // Should recommend DRS improvement for low scores
      expect(result.recommendations.some(r => r.includes('DRS'))).toBe(true);
    });

    it('should enforce time gates strictly', () => {
      const state = createTestState({
        orchestration: {
          ...createTestState().orchestration,
          timeRemaining: 0
        }
      });

      const result = analyzer.analyzeContext(state);

      expect(result.frameworkViolations).toContain('Time gate exceeded - session must end');
      expect(result.recommendations).toContain('Address framework violations before continuing');
    });

    it('should require evidence freshness', () => {
      const state = createTestState({
        evidence: [
          {
            type: 'connection',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours old
            path: 'evidence/stale.log',
            valid: true,
            description: 'Stale evidence'
          }
        ]
      });

      const result = analyzer.analyzeContext(state);

      expect(result.frameworkViolations.some(v => v.includes('Evidence') && v.includes('2h limit'))).toBe(true);
    });

    it('should always declare confidence with reasoning', () => {
      const state = createTestState();
      const result = analyzer.analyzeContext(state);

      expect(result.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(result.reasoning).toBeTruthy();
      expect(result.reasoning.length).toBeGreaterThan(20);
    });

    it('should provide actionable recommendations', () => {
      const state = createTestState();
      const result = analyzer.analyzeContext(state);

      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // All recommendations should reference specific prompts
      for (const recommendation of result.recommendations) {
        expect(recommendation).toMatch(/[A-T]\.\s+[A-Z]/); // Pattern like "A. START" or "P. ASSESS"
      }
    });
  });
});