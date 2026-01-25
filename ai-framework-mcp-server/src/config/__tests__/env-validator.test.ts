/**
 * Tests for Environment Variable Validator
 */

import { validateEnv, ValidationResult } from '../env-validator';

describe('Environment Variable Validator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should return valid config with default values when no env vars set', () => {
      // Clear relevant env vars
      delete process.env.AI_FRAMEWORK_PATH;
      delete process.env.LOG_LEVEL;
      delete process.env.DEBUG;
      delete process.env.STATE_READ_TIMEOUT;
      delete process.env.EVIDENCE_DIR;
      delete process.env.EVIDENCE_MAX_AGE;
      delete process.env.NODE_ENV;

      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.config).not.toBeNull();
      expect(result.config!.logLevel).toBe('info');
      expect(result.config!.debug).toBe(false);
      expect(result.config!.stateReadTimeout).toBe(8000);
      expect(result.config!.evidenceDir).toBe('evidence');
      expect(result.config!.evidenceMaxAge).toBe(120);
      expect(result.config!.nodeEnv).toBe('development');
    });

    it('should use provided environment variable values', () => {
      process.env.AI_FRAMEWORK_PATH = '/custom/path';
      process.env.LOG_LEVEL = 'debug';
      process.env.DEBUG = 'true';
      process.env.STATE_READ_TIMEOUT = '5000';
      process.env.EVIDENCE_DIR = 'custom-evidence';
      process.env.EVIDENCE_MAX_AGE = '60';
      process.env.NODE_ENV = 'production';

      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.config!.aiFrameworkPath).toBe('/custom/path');
      expect(result.config!.logLevel).toBe('debug');
      expect(result.config!.debug).toBe(true);
      expect(result.config!.stateReadTimeout).toBe(5000);
      expect(result.config!.evidenceDir).toBe('custom-evidence');
      expect(result.config!.evidenceMaxAge).toBe(60);
      expect(result.config!.nodeEnv).toBe('production');
    });

    it('should warn on invalid LOG_LEVEL and use default', () => {
      process.env.LOG_LEVEL = 'invalid';

      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.config!.logLevel).toBe('info');
      expect(result.warnings.some(w => w.includes('Invalid LOG_LEVEL'))).toBe(true);
    });

    it('should clamp STATE_READ_TIMEOUT to valid range', () => {
      // Test too low
      process.env.STATE_READ_TIMEOUT = '100';
      let result = validateEnv();
      expect(result.config!.stateReadTimeout).toBe(1000);
      expect(result.warnings.some(w => w.includes('STATE_READ_TIMEOUT'))).toBe(true);

      // Test too high
      process.env.STATE_READ_TIMEOUT = '60000';
      result = validateEnv();
      expect(result.config!.stateReadTimeout).toBe(30000);
    });

    it('should clamp EVIDENCE_MAX_AGE to valid range', () => {
      // Test too low
      process.env.EVIDENCE_MAX_AGE = '0';
      let result = validateEnv();
      expect(result.config!.evidenceMaxAge).toBe(1);

      // Test too high
      process.env.EVIDENCE_MAX_AGE = '2000';
      result = validateEnv();
      expect(result.config!.evidenceMaxAge).toBe(1440);
    });

    it('should handle various boolean formats for DEBUG', () => {
      const trueValues = ['true', 'TRUE', 'True', '1', 'yes', 'YES'];
      const falseValues = ['false', 'FALSE', 'False', '0', 'no', 'NO', 'anything'];

      for (const val of trueValues) {
        process.env.DEBUG = val;
        const result = validateEnv();
        expect(result.config!.debug).toBe(true);
      }

      for (const val of falseValues) {
        process.env.DEBUG = val;
        const result = validateEnv();
        expect(result.config!.debug).toBe(false);
      }
    });

    it('should warn when AI_FRAMEWORK_PATH directory does not exist', () => {
      process.env.AI_FRAMEWORK_PATH = '/nonexistent/path/that/does/not/exist';

      const result = validateEnv();

      expect(result.valid).toBe(true); // Still valid, just warns
      expect(result.warnings.some(w => w.includes('does not exist'))).toBe(true);
    });

    it('should handle invalid numeric values gracefully', () => {
      process.env.STATE_READ_TIMEOUT = 'not-a-number';
      process.env.EVIDENCE_MAX_AGE = 'also-not-a-number';

      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.config!.stateReadTimeout).toBe(8000); // Default
      expect(result.config!.evidenceMaxAge).toBe(120); // Default
    });

    it('should accept all valid log levels', () => {
      const validLevels: Array<'debug' | 'info' | 'warn' | 'error'> = ['debug', 'info', 'warn', 'error'];

      for (const level of validLevels) {
        process.env.LOG_LEVEL = level;
        const result = validateEnv();
        expect(result.config!.logLevel).toBe(level);
      }
    });
  });
});
