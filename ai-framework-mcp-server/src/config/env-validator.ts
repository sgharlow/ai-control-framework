/**
 * Environment Variable Validator
 * Validates required and optional environment variables before server initialization
 */

import { existsSync } from 'fs';
import { resolve } from 'path';

export interface EnvConfig {
  // Required
  aiFrameworkPath: string;

  // Optional with defaults
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  debug: boolean;
  stateReadTimeout: number;
  evidenceDir: string;
  evidenceMaxAge: number;
  nodeEnv: string;
}

export interface ValidationResult {
  valid: boolean;
  config: EnvConfig | null;
  errors: string[];
  warnings: string[];
}

/**
 * Default configuration values
 */
const DEFAULTS: Omit<EnvConfig, 'aiFrameworkPath'> = {
  logLevel: 'info',
  debug: false,
  stateReadTimeout: 8000,
  evidenceDir: 'evidence',
  evidenceMaxAge: 120,
  nodeEnv: 'development'
};

/**
 * Validate log level value
 */
function isValidLogLevel(value: string): value is EnvConfig['logLevel'] {
  return ['debug', 'info', 'warn', 'error'].includes(value.toLowerCase());
}

/**
 * Parse boolean from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  const lower = value.toLowerCase();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

/**
 * Parse integer from environment variable
 */
function parseInteger(value: string | undefined, defaultValue: number, min?: number, max?: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

/**
 * Validate and load environment configuration
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get AI_FRAMEWORK_PATH - required but with fallback
  let aiFrameworkPath = process.env.AI_FRAMEWORK_PATH;

  if (!aiFrameworkPath) {
    // Try common default locations
    const defaultPaths = [
      './ai-framework',
      '../ai-framework',
      './.ai-framework'
    ];

    for (const defaultPath of defaultPaths) {
      const resolved = resolve(process.cwd(), defaultPath);
      if (existsSync(resolved)) {
        aiFrameworkPath = defaultPath;
        warnings.push(`AI_FRAMEWORK_PATH not set, using detected path: ${resolved}`);
        break;
      }
    }

    if (!aiFrameworkPath) {
      // Use default without validation - will be validated when actually needed
      aiFrameworkPath = './ai-framework';
      warnings.push('AI_FRAMEWORK_PATH not set and no framework directory detected. Using default: ./ai-framework');
    }
  } else {
    // Validate the provided path exists
    const resolved = resolve(process.cwd(), aiFrameworkPath);
    if (!existsSync(resolved)) {
      warnings.push(`AI_FRAMEWORK_PATH directory does not exist: ${resolved}`);
    }
  }

  // Validate LOG_LEVEL
  let logLevel: EnvConfig['logLevel'] = DEFAULTS.logLevel;
  if (process.env.LOG_LEVEL) {
    if (isValidLogLevel(process.env.LOG_LEVEL)) {
      logLevel = process.env.LOG_LEVEL.toLowerCase() as EnvConfig['logLevel'];
    } else {
      warnings.push(`Invalid LOG_LEVEL "${process.env.LOG_LEVEL}". Using default: ${DEFAULTS.logLevel}`);
    }
  }

  // Parse DEBUG
  const debug = parseBoolean(process.env.DEBUG, DEFAULTS.debug);

  // Parse STATE_READ_TIMEOUT (min 1000ms, max 30000ms)
  const stateReadTimeout = parseInteger(
    process.env.STATE_READ_TIMEOUT,
    DEFAULTS.stateReadTimeout,
    1000,
    30000
  );
  if (process.env.STATE_READ_TIMEOUT) {
    const parsed = parseInt(process.env.STATE_READ_TIMEOUT, 10);
    if (isNaN(parsed)) {
      warnings.push(`Invalid STATE_READ_TIMEOUT "${process.env.STATE_READ_TIMEOUT}". Using default: ${DEFAULTS.stateReadTimeout}`);
    } else if (parsed < 1000 || parsed > 30000) {
      warnings.push(`STATE_READ_TIMEOUT ${parsed} out of range (1000-30000). Using: ${stateReadTimeout}`);
    }
  }

  // Get EVIDENCE_DIR
  const evidenceDir = process.env.EVIDENCE_DIR || DEFAULTS.evidenceDir;

  // Parse EVIDENCE_MAX_AGE (min 1 minute, max 1440 minutes / 24 hours)
  const evidenceMaxAge = parseInteger(
    process.env.EVIDENCE_MAX_AGE,
    DEFAULTS.evidenceMaxAge,
    1,
    1440
  );
  if (process.env.EVIDENCE_MAX_AGE) {
    const parsed = parseInt(process.env.EVIDENCE_MAX_AGE, 10);
    if (isNaN(parsed)) {
      warnings.push(`Invalid EVIDENCE_MAX_AGE "${process.env.EVIDENCE_MAX_AGE}". Using default: ${DEFAULTS.evidenceMaxAge}`);
    } else if (parsed < 1 || parsed > 1440) {
      warnings.push(`EVIDENCE_MAX_AGE ${parsed} out of range (1-1440). Using: ${evidenceMaxAge}`);
    }
  }

  // Get NODE_ENV
  const nodeEnv = process.env.NODE_ENV || DEFAULTS.nodeEnv;

  const config: EnvConfig = {
    aiFrameworkPath,
    logLevel,
    debug,
    stateReadTimeout,
    evidenceDir,
    evidenceMaxAge,
    nodeEnv
  };

  return {
    valid: errors.length === 0,
    config: errors.length === 0 ? config : null,
    errors,
    warnings
  };
}

/**
 * Validate environment and exit with helpful message if invalid
 */
export function validateEnvOrExit(): EnvConfig {
  const result = validateEnv();

  // Log warnings to stderr (MCP servers use stderr for logging)
  for (const warning of result.warnings) {
    console.error(`[ENV WARNING] ${warning}`);
  }

  if (!result.valid) {
    console.error('\n[ENV ERROR] Environment validation failed:');
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
    console.error('\nPlease check your environment variables or create a .env file.');
    console.error('See .env.example for required configuration.\n');
    process.exit(1);
  }

  if (result.config!.debug) {
    console.error('[ENV] Configuration loaded:');
    console.error(`  AI_FRAMEWORK_PATH: ${result.config!.aiFrameworkPath}`);
    console.error(`  LOG_LEVEL: ${result.config!.logLevel}`);
    console.error(`  DEBUG: ${result.config!.debug}`);
    console.error(`  STATE_READ_TIMEOUT: ${result.config!.stateReadTimeout}ms`);
    console.error(`  EVIDENCE_DIR: ${result.config!.evidenceDir}`);
    console.error(`  EVIDENCE_MAX_AGE: ${result.config!.evidenceMaxAge} minutes`);
    console.error(`  NODE_ENV: ${result.config!.nodeEnv}`);
  }

  return result.config!;
}

/**
 * Get environment configuration (singleton pattern)
 */
let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvOrExit();
  }
  return cachedConfig;
}
