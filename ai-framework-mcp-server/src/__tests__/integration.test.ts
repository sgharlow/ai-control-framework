/**
 * Integration tests for AI Framework MCP Server components
 * Tests core functionality without complex mocking
 */

import { OrchestrationParser } from '../parsers/orchestration-parser';
import { TasksParser } from '../parsers/tasks-parser';
import { ContextAnalyzer } from '../analyzers/context-analyzer';
import { PromptSelector } from '../selectors/prompt-selector';
import { FrameworkState } from '../types/framework-state';

describe('AI Framework MCP Server Integration', () => {
  describe('OrchestrationParser', () => {
    it('should parse basic orchestration content', () => {
      const parser = new OrchestrationParser();
      const content = `
# Project Orchestration

Mode: ENHANCEMENT
Confidence: HIGH
Gate: 60m
Contract Hash: abc123def456
Session Start: 2024-01-01T10:00:00Z
Last Evidence: 30 minutes ago
      `;

      const result = parser.parseOrchestrationContent(content);

      expect(result.sessionMode).toBe('ENHANCEMENT');
      expect(result.confidence).toBe('HIGH');
      expect(result.currentGate).toBe('60m');
      expect(result.contractHash).toBe('abc123def456');
    });

    it('should validate orchestration data', () => {
      const parser = new OrchestrationParser();
      const validData = {
        sessionMode: 'DEVELOPMENT' as const,
        currentGate: '30m',
        gateDeadline: new Date(Date.now() + 30 * 60 * 1000),
        confidence: 'HIGH' as const,
        lastEvidence: new Date(),
        contractHash: 'abc123',
        sessionStartTime: new Date(),
        timeRemaining: 30
      };

      const validation = parser.validateOrchestrationData(validData);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('TasksParser', () => {
    it('should parse task list with various statuses', () => {
      const parser = new TasksParser();
      const content = `
# Implementation Plan

- [ ] 1. Set up project structure
- [x] 2. Implement authentication
- [-] 3. Create user interface
- [!] 4. Deploy to production
      `;

      const result = parser.parseTasksContent(content);

      expect(result.tasks).toHaveLength(4);
      expect(result.tasks[0].status).toBe('not_started');
      expect(result.tasks[1].status).toBe('completed');
      expect(result.tasks[2].status).toBe('in_progress');
      expect(result.tasks[3].status).toBe('blocked');
    });

    it('should calculate completion percentage', () => {
      const parser = new TasksParser();
      const content = `
- [x] Completed task
- [-] In progress task
- [ ] Not started task
- [x] Another completed task
      `;

      const result = parser.parseTasksContent(content);
      // 2 completed + 0.5 in progress = 2.5/4 = 62.5% -> 63%
      expect(result.completionPercentage).toBe(63);
    });

    it('should get next actionable task', () => {
      const parser = new TasksParser();
      const tasks = [
        { id: '1', description: 'Completed', status: 'completed' as const, requirements: [], estimatedTime: 0 },
        { id: '2', description: 'In progress', status: 'in_progress' as const, requirements: [], estimatedTime: 0 },
        { id: '3', description: 'Not started', status: 'not_started' as const, requirements: [], estimatedTime: 0 }
      ];

      const nextTask = parser.getNextTask(tasks);
      expect(nextTask?.id).toBe('2'); // In progress takes priority
    });
  });

  describe('ContextAnalyzer', () => {
    it('should analyze framework state and provide recommendations', () => {
      const analyzer = new ContextAnalyzer();
      const now = new Date();
      
      const state: FrameworkState = {
        orchestration: {
          sessionMode: 'DEVELOPMENT',
          currentGate: '30m',
          gateDeadline: new Date(now.getTime() + 30 * 60 * 1000),
          confidence: 'MEDIUM',
          lastEvidence: new Date(now.getTime() - 30 * 60 * 1000),
          contractHash: 'abc123',
          sessionStartTime: new Date(now.getTime() - 15 * 60 * 1000),
          timeRemaining: 15
        },
        tasks: {
          tasks: [],
          completionPercentage: 50,
          blockers: [],
          partialProgress: {}
        },
        todos: {
          mockCount: 0,
          oldestMockAge: 0,
          allHaveExpiry: true
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
        confidence: 'MEDIUM',
        projectPath: '/test/project'
      };

      const result = analyzer.analyzeContext(state);

      expect(result.context.projectState).toBe('DEVELOPMENT');
      expect(result.context.drsScore).toBe(70);
      expect(result.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.frameworkViolations).toHaveLength(0);
    });

    it('should detect framework violations', () => {
      const analyzer = new ContextAnalyzer();
      const now = new Date();
      
      const state: FrameworkState = {
        orchestration: {
          sessionMode: 'DEVELOPMENT',
          currentGate: '30m',
          gateDeadline: new Date(now.getTime() - 10 * 60 * 1000), // Past deadline
          confidence: 'LOW',
          lastEvidence: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
          contractHash: 'abc123',
          sessionStartTime: new Date(now.getTime() - 40 * 60 * 1000),
          timeRemaining: -10 // Exceeded
        },
        tasks: {
          tasks: [],
          completionPercentage: 90,
          blockers: [],
          partialProgress: {}
        },
        todos: {
          mockCount: 0,
          oldestMockAge: 0,
          allHaveExpiry: true
        },
        drsScore: 75, // Below deployment threshold
        evidence: [
          {
            type: 'connection',
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // Stale
            path: 'evidence/old-test.log',
            valid: true,
            description: 'Old test'
          }
        ],
        lastUpdate: now,
        confidence: 'LOW',
        projectPath: '/test/project'
      };

      const violations = analyzer.identifyFrameworkViolations(state);

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.includes('Time gate exceeded'))).toBe(true);
      expect(violations.some(v => v.includes('Evidence') && v.includes('2h limit'))).toBe(true);
      expect(violations.some(v => v.includes('DRS') && v.includes('deployment threshold'))).toBe(true);
    });
  });

  describe('PromptSelector', () => {
    it('should select appropriate prompts based on context', () => {
      const selector = new PromptSelector();
      
      const criteria = {
        context: {
          projectState: 'DEVELOPMENT' as const,
          drsScore: 70,
          lastAction: 'Working on feature',
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
        }
      };

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt).toBeDefined();
      expect(result.selectedPrompt.id).toBeTruthy();
      expect(result.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(result.selectionReason).toBeTruthy();
      expect(result.alternativePrompts.length).toBeGreaterThanOrEqual(0);
    });

    it('should prioritize framework violations', () => {
      const selector = new PromptSelector();
      
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
        frameworkViolations: ['Time gate exceeded - session must end'],
        timeConstraints: {
          remainingMinutes: -5,
          sessionDuration: 95
        }
      };

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('I_HANDOFF');
      expect(result.selectionReason).toContain('Time gate exceeded');
      expect(result.frameworkCompliance).toBe(false);
    });

    it('should handle deployment scenarios', () => {
      const selector = new PromptSelector();
      
      const criteria = {
        context: {
          projectState: 'DEPLOY' as const,
          drsScore: 90,
          lastAction: 'Ready to deploy',
          timeInSession: 45,
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

      const result = selector.selectPrompt(criteria);

      expect(result.selectedPrompt.id).toBe('G_DEPLOY');
      expect(result.confidence).toBe('HIGH');
      expect(result.frameworkCompliance).toBe(true);
    });

    it('should validate prompt selections', () => {
      const selector = new PromptSelector();
      
      const criteria = {
        context: {
          projectState: 'DEVELOPMENT' as const,
          drsScore: 70,
          lastAction: 'Working',
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
        }
      };

      const result = selector.selectPrompt(criteria);
      const validation = selector.validateSelection(result, criteria);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('End-to-End Integration', () => {
    it('should process complete workflow from parsing to prompt selection', () => {
      // Parse orchestration
      const orchestrationParser = new OrchestrationParser();
      const orchestrationContent = `
Mode: DEVELOPMENT
Confidence: MEDIUM
Gate: 60m
Contract Hash: abc123
Session Start: ${new Date().toISOString()}
Last Evidence: 30 minutes ago
      `;
      const orchestration = orchestrationParser.parseOrchestrationContent(orchestrationContent);

      // Parse tasks
      const tasksParser = new TasksParser();
      const tasksContent = `
- [x] 1. Setup complete
- [-] 2. Working on feature
- [ ] 3. Add tests
- [ ] 4. Deploy
      `;
      const tasks = tasksParser.parseTasksContent(tasksContent);

      // Build framework state
      const state: FrameworkState = {
        orchestration,
        tasks,
        todos: {
          mockCount: 0,
          oldestMockAge: 0,
          allHaveExpiry: true
        },
        drsScore: 75,
        evidence: [
          {
            type: 'connection',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            path: 'evidence/api-test.log',
            valid: true,
            description: 'API test'
          }
        ],
        lastUpdate: new Date(),
        confidence: 'MEDIUM',
        projectPath: '/test/project'
      };

      // Analyze context
      const analyzer = new ContextAnalyzer();
      const analysis = analyzer.analyzeContext(state);

      // Select prompt
      const selector = new PromptSelector();
      const criteria = {
        context: analysis.context,
        frameworkViolations: analysis.frameworkViolations,
        timeConstraints: {
          remainingMinutes: orchestration.timeRemaining,
          sessionDuration: 30
        }
      };
      const selection = selector.selectPrompt(criteria);

      // Verify end-to-end flow
      expect(analysis.context.projectState).toBe('DEVELOPMENT');
      expect(analysis.context.completionPercentage).toBe(38); // 1 complete + 0.5 in progress = 1.5/4
      expect(selection.selectedPrompt).toBeDefined();
      expect(selection.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(selection.selectionReason).toBeTruthy();

      // Validate framework compliance
      const validation = selector.validateSelection(selection, criteria);
      expect(validation.valid).toBe(true);
    });
  });
});