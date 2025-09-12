/**
 * Unit tests for FrameworkStateReader
 */

import { FrameworkStateReader } from '../framework-state-reader';
import { tmpdir } from 'os';
import { join } from 'path';

describe('FrameworkStateReader', () => {
  let reader: FrameworkStateReader;
  let testProjectPath: string;

  beforeEach(() => {
    reader = new FrameworkStateReader();
    testProjectPath = join(tmpdir(), 'test-project');
  });

  describe('readFrameworkState', () => {
    it('should return default state when no framework files exist', async () => {
      const state = await reader.readFrameworkState(testProjectPath);

      expect(state.orchestration.sessionMode).toBe('DEVELOPMENT');
      expect(state.tasks.completionPercentage).toBe(0);
      expect(state.drsScore).toBeGreaterThanOrEqual(0);
      expect(state.evidence).toEqual([]);
      expect(state.confidence).toBeOneOf(['HIGH', 'MEDIUM', 'LOW']);
      expect(state.projectPath).toBe(testProjectPath);
    });
  });

  describe('hasFrameworkFiles', () => {
    it('should return false when no framework files exist', async () => {
      const hasFiles = await reader.hasFrameworkFiles(testProjectPath);
      expect(hasFiles).toBe(false);
    });
  });

  describe('getFrameworkStateSummary', () => {
    it('should return summary with no framework files', async () => {
      const summary = await reader.getFrameworkStateSummary(testProjectPath);

      expect(summary.hasFrameworkFiles).toBe(false);
      expect(summary.drsScore).toBe(0);
      expect(summary.timeRemaining).toBe(0);
      expect(summary.violations).toBeGreaterThan(0);
      expect(summary.confidence).toBe('LOW');
    });
  });
});