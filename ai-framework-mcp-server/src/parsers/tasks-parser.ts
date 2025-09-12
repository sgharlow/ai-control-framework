/**
 * Parser for tasks.md files
 * Extracts task status, completion percentage, blockers, and progress tracking
 */

import { readFile } from 'fs/promises';
import { TaskData, Task, Blocker } from '../types/framework-state.js';

export class TasksParser {
  /**
   * Parse tasks.md file and extract task data
   */
  async parseTasks(filePath: string): Promise<TaskData> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return this.parseTasksContent(content);
    } catch (error) {
      throw new Error(`Failed to read tasks file: ${error}`);
    }
  }

  /**
   * Parse tasks content from string
   */
  parseTasksContent(content: string): TaskData {
    const lines = content.split('\n');
    const tasks: Task[] = [];
    const blockers: Blocker[] = [];
    const partialProgress: Record<string, number> = {};

    let currentTask: Task | null = null;
    let taskIdCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Parse task items (checkbox format)
      const taskMatch = this.parseTaskLine(line);
      if (taskMatch) {
        // Save previous task if exists
        if (currentTask) {
          tasks.push(currentTask);
        }

        // Create new task
        currentTask = {
          id: taskMatch.id || `task-${taskIdCounter++}`,
          description: taskMatch.description,
          status: taskMatch.status,
          requirements: [],
          estimatedTime: taskMatch.estimatedTime || 0,
          subtasks: []
        };

        // Check if this is a subtask (indented)
        if (taskMatch.isSubtask && tasks.length > 0) {
          const parentTask = tasks[tasks.length - 1];
          if (!parentTask.subtasks) {
            parentTask.subtasks = [];
          }
          parentTask.subtasks.push(currentTask);
          currentTask = null; // Don't add to main tasks array
        }
      }
      
      // Parse task details (requirements, time estimates, etc.)
      else if (currentTask && line.trim()) {
        this.parseTaskDetails(line, currentTask);
      }

      // Parse blockers
      const blocker = this.parseBlocker(line);
      if (blocker) {
        blockers.push(blocker);
      }

      // Parse partial progress
      const progress = this.parsePartialProgress(line);
      if (progress) {
        Object.assign(partialProgress, progress);
      }
    }

    // Add the last task if exists
    if (currentTask) {
      tasks.push(currentTask);
    }

    const completionPercentage = this.calculateCompletionPercentage(tasks);

    return {
      tasks,
      completionPercentage,
      blockers,
      partialProgress
    };
  }

  /**
   * Parse a task line (checkbox format)
   */
  private parseTaskLine(line: string): {
    id?: string;
    description: string;
    status: Task['status'];
    estimatedTime?: number;
    isSubtask: boolean;
  } | null {
    // Match various checkbox formats:
    // - [ ] Task description
    // - [x] Completed task
    // - [-] In progress task
    // - [!] Blocked task
    const checkboxMatch = line.match(/^(\s*)[-*]\s*\[([x\-!\s])\]\s*(.+)$/i);
    if (!checkboxMatch) {
      return null;
    }

    const indent = checkboxMatch[1];
    const statusChar = checkboxMatch[2].toLowerCase();
    const description = checkboxMatch[3].trim();

    // Determine status from checkbox character
    let status: Task['status'];
    switch (statusChar) {
      case 'x':
        status = 'completed';
        break;
      case '-':
        status = 'in_progress';
        break;
      case '!':
        status = 'blocked';
        break;
      default:
        status = 'not_started';
    }

    // Extract task ID if present (e.g., "1.2 Task description")
    const idMatch = description.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
    let taskId: string | undefined;
    let cleanDescription = description;

    if (idMatch) {
      taskId = idMatch[1];
      cleanDescription = idMatch[2];
    }

    // Extract time estimate if present (e.g., "Task description (30m)")
    const timeMatch = cleanDescription.match(/^(.+?)\s*\((\d+)([mh])\)$/);
    let estimatedTime: number | undefined;

    if (timeMatch) {
      cleanDescription = timeMatch[1].trim();
      const timeValue = parseInt(timeMatch[2]);
      const timeUnit = timeMatch[3];
      estimatedTime = timeUnit === 'h' ? timeValue * 60 : timeValue;
    }

    return {
      id: taskId,
      description: cleanDescription,
      status,
      estimatedTime,
      isSubtask: indent.length > 0
    };
  }

  /**
   * Parse task details from subsequent lines
   */
  private parseTaskDetails(line: string, task: Task): void {
    const trimmed = line.trim();

    // Parse requirements (e.g., "_Requirements: 1.1, 2.3, 4.2_")
    const reqMatch = trimmed.match(/^_Requirements?:\s*(.+)_$/i);
    if (reqMatch) {
      const requirements = reqMatch[1]
        .split(',')
        .map(req => req.trim())
        .filter(req => req.length > 0);
      task.requirements = requirements;
      return;
    }

    // Parse time estimate (e.g., "- Time: 45 minutes")
    const timeMatch = trimmed.match(/^[-*]\s*Time:\s*(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      task.estimatedTime = unit.startsWith('h') ? value * 60 : value;
      return;
    }

    // Parse actual time (e.g., "- Actual: 60 minutes")
    const actualMatch = trimmed.match(/^[-*]\s*Actual:\s*(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
    if (actualMatch) {
      const value = parseInt(actualMatch[1]);
      const unit = actualMatch[2].toLowerCase();
      task.actualTime = unit.startsWith('h') ? value * 60 : value;
      return;
    }
  }

  /**
   * Parse blocker information
   */
  private parseBlocker(line: string): Blocker | null {
    // Look for blocker patterns:
    // BLOCKED: Description (timestamp)
    // BLOCKER: Description - attempted fixes - required action
    const blockerMatch = line.match(/^(?:BLOCKED?|BLOCKER):\s*(.+)$/i);
    if (!blockerMatch) {
      return null;
    }

    const content = blockerMatch[1];
    
    // Try to extract timestamp
    const timestampMatch = content.match(/^(.+?)\s*\(([^)]+)\)$/);
    let description = content;
    let timestamp = new Date();

    if (timestampMatch) {
      description = timestampMatch[1].trim();
      const timestampStr = timestampMatch[2];
      const parsedTime = this.parseTimestamp(timestampStr);
      if (parsedTime) {
        timestamp = parsedTime;
      }
    }

    // Try to extract structured blocker info
    const parts = description.split(' - ');
    const mainDescription = parts[0];
    const attemptedFixes = parts.length > 1 ? [parts[1]] : [];
    const requiredAction = parts.length > 2 ? parts[2] : 'Investigation required';

    return {
      id: `blocker-${Date.now()}`,
      description: mainDescription,
      timestamp,
      attemptedFixes,
      requiredAction
    };
  }

  /**
   * Parse partial progress information
   */
  private parsePartialProgress(line: string): Record<string, number> | null {
    // Look for progress patterns:
    // Progress: Task 1.2 - 75%
    // Partial: Authentication module - 60%
    const progressMatch = line.match(/^(?:Progress|Partial):\s*(.+?)\s*-\s*(\d+)%/i);
    if (!progressMatch) {
      return null;
    }

    const taskName = progressMatch[1].trim();
    const percentage = parseInt(progressMatch[2]);

    return { [taskName]: percentage };
  }

  /**
   * Calculate overall completion percentage
   */
  private calculateCompletionPercentage(tasks: Task[]): number {
    if (tasks.length === 0) {
      return 0;
    }

    let totalTasks = 0;
    let completedTasks = 0;

    const countTasks = (taskList: Task[]) => {
      for (const task of taskList) {
        totalTasks++;
        if (task.status === 'completed') {
          completedTasks++;
        } else if (task.status === 'in_progress') {
          completedTasks += 0.5; // Count in-progress as 50%
        }

        // Count subtasks
        if (task.subtasks && task.subtasks.length > 0) {
          countTasks(task.subtasks);
        }
      }
    };

    countTasks(tasks);

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  /**
   * Parse timestamp from various formats
   */
  private parseTimestamp(timestampStr: string): Date | null {
    // Try ISO format first
    let date = new Date(timestampStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try relative formats
    const relativeMatch = timestampStr.match(/(\d+)\s*(minutes?|hours?|days?|mins?|hrs?)\s*ago/i);
    if (relativeMatch) {
      const value = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2].toLowerCase();
      
      let minutes = 0;
      if (unit.startsWith('m')) minutes = value;
      else if (unit.startsWith('h')) minutes = value * 60;
      else if (unit.startsWith('d')) minutes = value * 24 * 60;

      return new Date(Date.now() - minutes * 60 * 1000);
    }

    return null;
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(tasks: Task[], status: Task['status']): Task[] {
    const result: Task[] = [];

    const collectTasks = (taskList: Task[]) => {
      for (const task of taskList) {
        if (task.status === status) {
          result.push(task);
        }
        if (task.subtasks) {
          collectTasks(task.subtasks);
        }
      }
    };

    collectTasks(tasks);
    return result;
  }

  /**
   * Get next actionable task
   */
  getNextTask(tasks: Task[]): Task | null {
    // First, look for in-progress tasks
    const inProgress = this.getTasksByStatus(tasks, 'in_progress');
    if (inProgress.length > 0) {
      return inProgress[0];
    }

    // Then, look for not-started tasks
    const notStarted = this.getTasksByStatus(tasks, 'not_started');
    if (notStarted.length > 0) {
      return notStarted[0];
    }

    return null;
  }

  /**
   * Validate task data
   */
  validateTaskData(data: TaskData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.completionPercentage < 0 || data.completionPercentage > 100) {
      errors.push(`Invalid completion percentage: ${data.completionPercentage}`);
    }

    // Validate tasks
    for (const task of data.tasks) {
      if (!task.id || !task.description) {
        errors.push(`Task missing required fields: ${JSON.stringify(task)}`);
      }

      if (!['not_started', 'in_progress', 'completed', 'blocked'].includes(task.status)) {
        errors.push(`Invalid task status: ${task.status}`);
      }

      if (task.estimatedTime < 0) {
        errors.push(`Negative estimated time for task: ${task.id}`);
      }

      if (task.actualTime && task.actualTime < 0) {
        errors.push(`Negative actual time for task: ${task.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}