/**
 * Parser for orchestration.md files
 * Extracts session state, gates, confidence, and other framework metadata
 */

import { readFile } from 'fs/promises';
import { OrchestrationData } from '../types/framework-state.js';

export class OrchestrationParser {
  /**
   * Parse orchestration.md file and extract framework state
   */
  async parseOrchestration(filePath: string): Promise<OrchestrationData> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return this.parseOrchestrationContent(content);
    } catch (error) {
      throw new Error(`Failed to read orchestration file: ${error}`);
    }
  }

  /**
   * Parse orchestration content from string
   */
  parseOrchestrationContent(content: string): OrchestrationData {
    const lines = content.split('\n');
    
    // Default values
    let sessionMode: OrchestrationData['sessionMode'] = 'DEVELOPMENT';
    let currentGate = '30m';
    let gateDeadline = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    let confidence: OrchestrationData['confidence'] = 'MEDIUM';
    let lastEvidence = new Date(0); // epoch if not found
    let contractHash = '';
    let sessionStartTime = new Date();
    let timeRemaining = 30;

    // Parse session mode
    const modeMatch = content.match(/(?:Mode|SESSION_MODE):\s*(DEVELOPMENT|ENHANCEMENT|DEBUG|MAINTENANCE)/i);
    if (modeMatch) {
      sessionMode = modeMatch[1].toUpperCase() as OrchestrationData['sessionMode'];
    }

    // Parse current gate
    const gateMatch = content.match(/(?:Gate|Current Gate|TIME_GATE):\s*(\d+m|\d+h)/i);
    if (gateMatch) {
      currentGate = gateMatch[1];
      const minutes = this.parseTimeToMinutes(currentGate);
      gateDeadline = new Date(Date.now() + minutes * 60 * 1000);
      timeRemaining = minutes;
    }

    // Parse confidence level
    const confidenceMatch = content.match(/(?:Confidence|CONFIDENCE_LEVEL):\s*(HIGH|MEDIUM|LOW)/i);
    if (confidenceMatch) {
      confidence = confidenceMatch[1].toUpperCase() as OrchestrationData['confidence'];
    }

    // Parse last evidence timestamp
    const evidenceMatch = content.match(/(?:Last Evidence|LAST_EVIDENCE):\s*([^\n]+)/i);
    if (evidenceMatch) {
      const evidenceTime = this.parseTimestamp(evidenceMatch[1]);
      if (evidenceTime) {
        lastEvidence = evidenceTime;
      }
    }

    // Parse contract hash
    const hashMatch = content.match(/(?:Contract Hash|CONTRACT_HASH):\s*([a-fA-F0-9]+)/i);
    if (hashMatch) {
      contractHash = hashMatch[1];
    }

    // Parse session start time
    const startMatch = content.match(/(?:Session Start|SESSION_START):\s*([^\n]+)/i);
    if (startMatch) {
      const startTime = this.parseTimestamp(startMatch[1]);
      if (startTime) {
        sessionStartTime = startTime;
        // Recalculate time remaining based on actual start time
        const elapsed = (Date.now() - startTime.getTime()) / (1000 * 60); // minutes
        const gateMinutes = this.parseTimeToMinutes(currentGate);
        timeRemaining = Math.max(0, gateMinutes - elapsed);
      }
    }

    // Look for structured data blocks
    const structuredData = this.parseStructuredData(content);
    if (structuredData) {
      return {
        ...structuredData,
        sessionMode,
        currentGate,
        gateDeadline,
        confidence,
        lastEvidence,
        contractHash,
        sessionStartTime,
        timeRemaining
      };
    }

    return {
      sessionMode,
      currentGate,
      gateDeadline,
      confidence,
      lastEvidence,
      contractHash,
      sessionStartTime,
      timeRemaining
    };
  }

  /**
   * Parse time strings like "30m", "2h" to minutes
   */
  private parseTimeToMinutes(timeStr: string): number {
    const match = timeStr.match(/(\d+)([mh])/);
    if (!match) return 30; // default

    const value = parseInt(match[1]);
    const unit = match[2];

    return unit === 'h' ? value * 60 : value;
  }

  /**
   * Parse various timestamp formats
   */
  private parseTimestamp(timestampStr: string): Date | null {
    // Try ISO format first
    let date = new Date(timestampStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try relative formats like "2 hours ago", "30 minutes ago"
    const relativeMatch = timestampStr.match(/(\d+)\s*(minutes?|hours?|mins?|hrs?)\s*ago/i);
    if (relativeMatch) {
      const value = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2].toLowerCase();
      const minutes = unit.startsWith('h') ? value * 60 : value;
      return new Date(Date.now() - minutes * 60 * 1000);
    }

    // Try "X minutes/hours from now"
    const futureMatch = timestampStr.match(/(\d+)\s*(minutes?|hours?|mins?|hrs?)\s*from\s*now/i);
    if (futureMatch) {
      const value = parseInt(futureMatch[1]);
      const unit = futureMatch[2].toLowerCase();
      const minutes = unit.startsWith('h') ? value * 60 : value;
      return new Date(Date.now() + minutes * 60 * 1000);
    }

    return null;
  }

  /**
   * Parse structured data blocks (YAML-like or JSON-like)
   */
  private parseStructuredData(content: string): Partial<OrchestrationData> | null {
    // Look for YAML-like structure
    const yamlMatch = content.match(/```(?:yaml|yml)\n([\s\S]*?)\n```/);
    if (yamlMatch) {
      return this.parseYamlLikeData(yamlMatch[1]);
    }

    // Look for JSON structure
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        return this.mapJsonToOrchestration(data);
      } catch {
        // Ignore JSON parse errors
      }
    }

    return null;
  }

  /**
   * Parse simple YAML-like data
   */
  private parseYamlLikeData(yamlContent: string): Partial<OrchestrationData> {
    const result: Partial<OrchestrationData> = {};
    const lines = yamlContent.split('\n');

    for (const line of lines) {
      const match = line.match(/^\s*([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        const value = match[2].trim();

        switch (key) {
          case 'session_mode':
          case 'mode':
            if (['DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'MAINTENANCE'].includes(value.toUpperCase())) {
              result.sessionMode = value.toUpperCase() as OrchestrationData['sessionMode'];
            }
            break;
          case 'confidence':
            if (['HIGH', 'MEDIUM', 'LOW'].includes(value.toUpperCase())) {
              result.confidence = value.toUpperCase() as OrchestrationData['confidence'];
            }
            break;
          case 'current_gate':
          case 'gate':
            result.currentGate = value;
            break;
          case 'contract_hash':
            result.contractHash = value;
            break;
        }
      }
    }

    return result;
  }

  /**
   * Map JSON data to orchestration structure
   */
  private mapJsonToOrchestration(data: any): Partial<OrchestrationData> {
    const result: Partial<OrchestrationData> = {};

    if (data.sessionMode && ['DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'MAINTENANCE'].includes(data.sessionMode)) {
      result.sessionMode = data.sessionMode;
    }

    if (data.confidence && ['HIGH', 'MEDIUM', 'LOW'].includes(data.confidence)) {
      result.confidence = data.confidence;
    }

    if (data.currentGate) {
      result.currentGate = data.currentGate;
    }

    if (data.contractHash) {
      result.contractHash = data.contractHash;
    }

    return result;
  }

  /**
   * Validate orchestration data
   */
  validateOrchestrationData(data: OrchestrationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['DEVELOPMENT', 'ENHANCEMENT', 'DEBUG', 'MAINTENANCE'].includes(data.sessionMode)) {
      errors.push(`Invalid session mode: ${data.sessionMode}`);
    }

    if (!['HIGH', 'MEDIUM', 'LOW'].includes(data.confidence)) {
      errors.push(`Invalid confidence level: ${data.confidence}`);
    }

    if (data.timeRemaining < 0) {
      errors.push('Time remaining cannot be negative');
    }

    if (data.gateDeadline < new Date()) {
      errors.push('Gate deadline is in the past');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}