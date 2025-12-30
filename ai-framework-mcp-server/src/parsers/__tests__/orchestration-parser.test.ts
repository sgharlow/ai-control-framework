/**
 * Unit tests for OrchestrationParser
 */

import { OrchestrationParser } from '../orchestration-parser';
import { OrchestrationData } from '../../types/framework-state';

describe('OrchestrationParser', () => {
  let parser: OrchestrationParser;

  beforeEach(() => {
    parser = new OrchestrationParser();
  });

  describe('parseOrchestrationContent', () => {
    it('should parse basic orchestration data', () => {
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

    it('should handle YAML-like structured data', () => {
      const content = `
# Project Orchestration

\`\`\`yaml
session_mode: DEBUG
confidence: LOW
current_gate: 90m
contract_hash: abc789def123
\`\`\`
      `;

      const result = parser.parseOrchestrationContent(content);

      expect(result.sessionMode).toBe('DEBUG');
      expect(result.confidence).toBe('LOW');
      expect(result.currentGate).toBe('90m');
      expect(result.contractHash).toBe('abc789def123');
    });

    it('should handle JSON structured data', () => {
      const content = `
# Project Orchestration

\`\`\`json
{
  "sessionMode": "MAINTENANCE",
  "confidence": "MEDIUM",
  "currentGate": "120m",
  "contractHash": "def456abc789"
}
\`\`\`
      `;

      const result = parser.parseOrchestrationContent(content);

      expect(result.sessionMode).toBe('MAINTENANCE');
      expect(result.confidence).toBe('MEDIUM');
      expect(result.currentGate).toBe('120m');
      expect(result.contractHash).toBe('def456abc789');
    });

    it('should use default values for missing data', () => {
      const content = `
# Minimal Orchestration File
Some other content without structured data.
      `;

      const result = parser.parseOrchestrationContent(content);

      expect(result.sessionMode).toBe('DEVELOPMENT');
      expect(result.confidence).toBe('MEDIUM');
      expect(result.currentGate).toBe('30m');
      expect(result.contractHash).toBe('');
    });

    it('should parse various time formats', () => {
      const testCases = [
        { input: 'Gate: 30m', expected: 30 },
        { input: 'Gate: 2h', expected: 120 },
        { input: 'Gate: 90m', expected: 90 }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parseOrchestrationContent(input);
        expect(result.timeRemaining).toBeCloseTo(expected, 0);
      });
    });

    it('should parse relative timestamps', () => {
      const now = Date.now();
      const content = `
Last Evidence: 15 minutes ago
      `;

      const result = parser.parseOrchestrationContent(content);
      const expectedTime = now - (15 * 60 * 1000);
      
      // Allow 1 second tolerance for test execution time
      expect(Math.abs(result.lastEvidence.getTime() - expectedTime)).toBeLessThan(1000);
    });

    it('should handle case-insensitive parsing', () => {
      const content = `
mode: enhancement
CONFIDENCE: high
Gate: 45M
      `;

      const result = parser.parseOrchestrationContent(content);

      expect(result.sessionMode).toBe('ENHANCEMENT');
      expect(result.confidence).toBe('HIGH');
      expect(result.currentGate).toBe('45M');
    });

    it('should ignore invalid values and use defaults', () => {
      const content = `
Mode: INVALID_MODE
Confidence: INVALID_CONFIDENCE
Gate: invalid_time
      `;

      const result = parser.parseOrchestrationContent(content);

      expect(result.sessionMode).toBe('DEVELOPMENT'); // default
      expect(result.confidence).toBe('MEDIUM'); // default
      expect(result.currentGate).toBe('30m'); // defaults when invalid
    });
  });

  describe('validateOrchestrationData', () => {
    it('should validate correct orchestration data', () => {
      const data: OrchestrationData = {
        sessionMode: 'DEVELOPMENT',
        currentGate: '30m',
        gateDeadline: new Date(Date.now() + 30 * 60 * 1000),
        confidence: 'HIGH',
        lastEvidence: new Date(),
        contractHash: 'abc123',
        sessionStartTime: new Date(),
        timeRemaining: 30
      };

      const result = parser.validateOrchestrationData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid session mode', () => {
      const data: OrchestrationData = {
        sessionMode: 'INVALID' as any,
        currentGate: '30m',
        gateDeadline: new Date(Date.now() + 30 * 60 * 1000),
        confidence: 'HIGH',
        lastEvidence: new Date(),
        contractHash: 'abc123',
        sessionStartTime: new Date(),
        timeRemaining: 30
      };

      const result = parser.validateOrchestrationData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid session mode: INVALID');
    });

    it('should detect negative time remaining', () => {
      const data: OrchestrationData = {
        sessionMode: 'DEVELOPMENT',
        currentGate: '30m',
        gateDeadline: new Date(Date.now() + 30 * 60 * 1000),
        confidence: 'HIGH',
        lastEvidence: new Date(),
        contractHash: 'abc123',
        sessionStartTime: new Date(),
        timeRemaining: -10
      };

      const result = parser.validateOrchestrationData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Time remaining cannot be negative');
    });

    it('should detect past gate deadline', () => {
      const data: OrchestrationData = {
        sessionMode: 'DEVELOPMENT',
        currentGate: '30m',
        gateDeadline: new Date(Date.now() - 60 * 1000), // 1 minute ago
        confidence: 'HIGH',
        lastEvidence: new Date(),
        contractHash: 'abc123',
        sessionStartTime: new Date(),
        timeRemaining: 30
      };

      const result = parser.validateOrchestrationData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Gate deadline is in the past');
    });
  });
});