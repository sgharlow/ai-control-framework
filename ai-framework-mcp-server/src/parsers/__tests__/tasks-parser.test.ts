/**
 * Unit tests for TasksParser
 */

import { TasksParser } from '../tasks-parser';
import { TaskData, Task } from '../../types/framework-state';

describe('TasksParser', () => {
  let parser: TasksParser;

  beforeEach(() => {
    parser = new TasksParser();
  });

  describe('parseTasksContent', () => {
    it('should parse basic task list', () => {
      const content = `
# Implementation Plan

- [ ] 1. Set up project structure
- [x] 2. Implement authentication
- [-] 3. Create user interface
- [!] 4. Deploy to production
      `;

      const result = parser.parseTasksContent(content);

      expect(result.tasks).toHaveLength(4);
      expect(result.tasks[0].id).toBe('task-1'); // "1." format doesn't extract ID (only "1.1" format does)
      expect(result.tasks[0].description).toBe('1. Set up project structure'); // Full description when ID not extracted
      expect(result.tasks[0].status).toBe('not_started');
      
      expect(result.tasks[1].status).toBe('completed');
      expect(result.tasks[2].status).toBe('in_progress');
      expect(result.tasks[3].status).toBe('blocked');
    });

    it('should parse tasks with subtasks', () => {
      const content = `
# Implementation Plan

- [ ] 1. Set up project structure
  - [x] 1.1 Create directory structure
  - [ ] 1.2 Initialize configuration
- [ ] 2. Implement features
  - [-] 2.1 User authentication
  - [ ] 2.2 Data validation
      `;

      const result = parser.parseTasksContent(content);

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].subtasks).toHaveLength(2);
      expect(result.tasks[0].subtasks![0].id).toBe('1.1');
      expect(result.tasks[0].subtasks![0].status).toBe('completed');
      expect(result.tasks[0].subtasks![1].status).toBe('not_started');
      
      expect(result.tasks[1].subtasks).toHaveLength(2);
      expect(result.tasks[1].subtasks![0].status).toBe('in_progress');
    });

    it('should parse task requirements and time estimates', () => {
      const content = `
# Implementation Plan

- [ ] 1. Implement authentication module
  - Time: 120 minutes
  _Requirements: 1.1, 2.3, 4.2_
  - Actual: 90 minutes

- [ ] 2. Create user interface (45m)
  _Requirements: 3.1_
      `;

      const result = parser.parseTasksContent(content);

      expect(result.tasks).toHaveLength(2);
      
      const task1 = result.tasks[0];
      expect(task1.estimatedTime).toBe(120);
      expect(task1.actualTime).toBe(90);
      expect(task1.requirements).toEqual(['1.1', '2.3', '4.2']);
      
      const task2 = result.tasks[1];
      expect(task2.estimatedTime).toBe(45);
      expect(task2.requirements).toEqual(['3.1']);
    });

    it('should parse blockers', () => {
      const content = `
# Implementation Plan

- [ ] 1. Some task

BLOCKED: API endpoint not available (2024-01-01T10:00:00Z)
BLOCKER: Database connection issues - tried restarting service - need DBA assistance
      `;

      const result = parser.parseTasksContent(content);

      expect(result.blockers).toHaveLength(2);
      
      const blocker1 = result.blockers[0];
      expect(blocker1.description).toBe('API endpoint not available');
      expect(blocker1.timestamp).toEqual(new Date('2024-01-01T10:00:00Z'));
      
      const blocker2 = result.blockers[1];
      expect(blocker2.description).toBe('Database connection issues');
      expect(blocker2.attemptedFixes).toEqual(['tried restarting service']);
      expect(blocker2.requiredAction).toBe('need DBA assistance');
    });

    it('should parse partial progress', () => {
      const content = `
# Implementation Plan

- [ ] 1. Some task

Progress: Authentication module - 75%
Partial: User interface - 60%
Progress: Database setup - 90%
      `;

      const result = parser.parseTasksContent(content);

      expect(result.partialProgress).toEqual({
        'Authentication module': 75,
        'User interface': 60,
        'Database setup': 90
      });
    });

    it('should calculate completion percentage correctly', () => {
      const content = `
# Implementation Plan

- [x] 1. Completed task
- [-] 2. In progress task
- [ ] 3. Not started task
- [x] 4. Another completed task
      `;

      const result = parser.parseTasksContent(content);

      // 2 completed (100%) + 1 in progress (50%) + 1 not started (0%) = 2.5/4 = 62.5% -> 63%
      expect(result.completionPercentage).toBe(63);
    });

    it('should handle empty or malformed content', () => {
      const content = `
# Some document without tasks

Just some text content.
No tasks here.
      `;

      const result = parser.parseTasksContent(content);

      expect(result.tasks).toHaveLength(0);
      expect(result.completionPercentage).toBe(0);
      expect(result.blockers).toHaveLength(0);
      expect(result.partialProgress).toEqual({});
    });

    it('should handle various checkbox formats', () => {
      const content = `
- [ ] Standard format
* [x] Asterisk format
- [X] Uppercase X
* [-] Asterisk in progress
- [!] Blocked format
      `;

      const result = parser.parseTasksContent(content);

      expect(result.tasks).toHaveLength(5);
      expect(result.tasks[0].status).toBe('not_started');
      expect(result.tasks[1].status).toBe('completed');
      expect(result.tasks[2].status).toBe('completed');
      expect(result.tasks[3].status).toBe('in_progress');
      expect(result.tasks[4].status).toBe('blocked');
    });
  });

  describe('getTasksByStatus', () => {
    it('should filter tasks by status', () => {
      const tasks: Task[] = [
        { id: '1', description: 'Task 1', status: 'completed', requirements: [], estimatedTime: 0 },
        { id: '2', description: 'Task 2', status: 'in_progress', requirements: [], estimatedTime: 0 },
        { id: '3', description: 'Task 3', status: 'not_started', requirements: [], estimatedTime: 0 }
      ];

      const completed = parser.getTasksByStatus(tasks, 'completed');
      const inProgress = parser.getTasksByStatus(tasks, 'in_progress');
      const notStarted = parser.getTasksByStatus(tasks, 'not_started');

      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe('1');
      
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].id).toBe('2');
      
      expect(notStarted).toHaveLength(1);
      expect(notStarted[0].id).toBe('3');
    });

    it('should include subtasks in status filtering', () => {
      const tasks: Task[] = [
        {
          id: '1',
          description: 'Parent task',
          status: 'in_progress',
          requirements: [],
          estimatedTime: 0,
          subtasks: [
            { id: '1.1', description: 'Subtask 1', status: 'completed', requirements: [], estimatedTime: 0 },
            { id: '1.2', description: 'Subtask 2', status: 'completed', requirements: [], estimatedTime: 0 }
          ]
        }
      ];

      const completed = parser.getTasksByStatus(tasks, 'completed');
      expect(completed).toHaveLength(2);
      expect(completed.map(t => t.id)).toEqual(['1.1', '1.2']);
    });
  });

  describe('getNextTask', () => {
    it('should return in-progress task first', () => {
      const tasks: Task[] = [
        { id: '1', description: 'Task 1', status: 'not_started', requirements: [], estimatedTime: 0 },
        { id: '2', description: 'Task 2', status: 'in_progress', requirements: [], estimatedTime: 0 },
        { id: '3', description: 'Task 3', status: 'not_started', requirements: [], estimatedTime: 0 }
      ];

      const nextTask = parser.getNextTask(tasks);
      expect(nextTask?.id).toBe('2');
    });

    it('should return first not-started task if no in-progress', () => {
      const tasks: Task[] = [
        { id: '1', description: 'Task 1', status: 'completed', requirements: [], estimatedTime: 0 },
        { id: '2', description: 'Task 2', status: 'not_started', requirements: [], estimatedTime: 0 },
        { id: '3', description: 'Task 3', status: 'not_started', requirements: [], estimatedTime: 0 }
      ];

      const nextTask = parser.getNextTask(tasks);
      expect(nextTask?.id).toBe('2');
    });

    it('should return null if all tasks are completed or blocked', () => {
      const tasks: Task[] = [
        { id: '1', description: 'Task 1', status: 'completed', requirements: [], estimatedTime: 0 },
        { id: '2', description: 'Task 2', status: 'blocked', requirements: [], estimatedTime: 0 }
      ];

      const nextTask = parser.getNextTask(tasks);
      expect(nextTask).toBeNull();
    });
  });

  describe('validateTaskData', () => {
    it('should validate correct task data', () => {
      const data: TaskData = {
        tasks: [
          { id: '1', description: 'Valid task', status: 'completed', requirements: [], estimatedTime: 30 }
        ],
        completionPercentage: 50,
        blockers: [],
        partialProgress: {}
      };

      const result = parser.validateTaskData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid completion percentage', () => {
      const data: TaskData = {
        tasks: [],
        completionPercentage: 150,
        blockers: [],
        partialProgress: {}
      };

      const result = parser.validateTaskData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid completion percentage: 150');
    });

    it('should detect invalid task status', () => {
      const data: TaskData = {
        tasks: [
          { id: '1', description: 'Task', status: 'invalid' as any, requirements: [], estimatedTime: 0 }
        ],
        completionPercentage: 0,
        blockers: [],
        partialProgress: {}
      };

      const result = parser.validateTaskData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid task status: invalid');
    });

    it('should detect negative time values', () => {
      const data: TaskData = {
        tasks: [
          { id: '1', description: 'Task', status: 'completed', requirements: [], estimatedTime: -10, actualTime: -5 }
        ],
        completionPercentage: 0,
        blockers: [],
        partialProgress: {}
      };

      const result = parser.validateTaskData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Negative estimated time for task: 1');
      expect(result.errors).toContain('Negative actual time for task: 1');
    });
  });
});