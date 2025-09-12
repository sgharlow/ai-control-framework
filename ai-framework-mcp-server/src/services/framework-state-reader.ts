/**
 * Framework State Reader Service
 * Integrates all parsers to provide complete framework state
 */

import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { OrchestrationParser } from '../parsers/orchestration-parser';
import { TasksParser } from '../parsers/tasks-parser';
import { DRSCalculator } from '../calculators/drs-calculator';
import { FrameworkState, EvidenceFile } from '../types/framework-state';

export class FrameworkStateReader {
  private orchestrationParser: OrchestrationParser;
  private tasksParser: TasksParser;
  private drsCalculator: DRSCalculator;

  constructor() {
    this.orchestrationParser = new OrchestrationParser();
    this.tasksParser = new TasksParser();
    this.drsCalculator = new DRSCalculator();
  }

  /**
   * Read complete framework state from project directory
   */
  async readFrameworkState(projectPath: string): Promise<FrameworkState> {
    try {
      // Read orchestration data
      const orchestration = await this.readOrchestrationData(projectPath);
      
      // Read task data
      const tasks = await this.readTaskData(projectPath);
      
      // Calculate DRS score
      const drsScore = await this.calculateDRS(projectPath);
      
      // Read evidence files
      const evidence = await this.readEvidenceFiles(projectPath);
      
      // Determine overall confidence
      const confidence = this.calculateOverallConfidence(orchestration, tasks, drsScore, evidence);

      // Read enhanced framework components
      const behavioralContracts = await this.readBehavioralContracts(projectPath);
      const architectureStability = await this.readArchitectureStability(projectPath);
      const integrationEvidence = await this.readIntegrationEvidence(projectPath);
      const securityValidation = await this.readSecurityValidation(projectPath);
      const productionReadiness = await this.readProductionReadiness(projectPath);
      const contextPreservation = await this.readContextPreservation(projectPath);
      const dataIntegrity = await this.readDataIntegrity(projectPath);

      return {
        orchestration,
        tasks,
        drsScore,
        evidence,
        lastUpdate: new Date(),
        confidence,
        projectPath,
        behavioralContracts,
        architectureStability,
        integrationEvidence,
        securityValidation,
        productionReadiness,
        contextPreservation,
        dataIntegrity
      };
    } catch (error) {
      throw new Error(`Failed to read framework state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Read orchestration.md file
   */
  private async readOrchestrationData(projectPath: string) {
    const orchestrationPaths = [
      join(projectPath, 'orchestration.md'),
      join(projectPath, '.ai-framework', 'orchestration.md'),
      join(projectPath, 'docs', 'orchestration.md')
    ];

    for (const path of orchestrationPaths) {
      try {
        await access(path);
        return await this.orchestrationParser.parseOrchestration(path);
      } catch {
        // Continue to next path
      }
    }

    // Return default orchestration data if no file found
    return {
      sessionMode: 'DEVELOPMENT' as const,
      currentGate: '30m',
      gateDeadline: new Date(Date.now() + 30 * 60 * 1000),
      confidence: 'MEDIUM' as const,
      lastEvidence: new Date(0),
      contractHash: '',
      sessionStartTime: new Date(),
      timeRemaining: 30
    };
  }

  /**
   * Read tasks.md file
   */
  private async readTaskData(projectPath: string) {
    const taskPaths = [
      join(projectPath, 'tasks.md'),
      join(projectPath, '.ai-framework', 'tasks.md'),
      join(projectPath, 'docs', 'tasks.md'),
      join(projectPath, 'TODO.md'),
      join(projectPath, 'TASKS.md')
    ];

    for (const path of taskPaths) {
      try {
        await access(path);
        return await this.tasksParser.parseTasks(path);
      } catch {
        // Continue to next path
      }
    }

    // Return default task data if no file found
    return {
      tasks: [],
      completionPercentage: 0,
      blockers: [],
      partialProgress: {}
    };
  }

  /**
   * Calculate DRS score for project
   */
  private async calculateDRS(projectPath: string): Promise<number> {
    try {
      const result = await this.drsCalculator.calculateDRS(projectPath);
      return result.percentage;
    } catch (error) {
      // Return default DRS if calculation fails
      console.error('DRS calculation failed:', error);
      return 50; // Default middle score
    }
  }

  /**
   * Read evidence files
   */
  private async readEvidenceFiles(projectPath: string): Promise<EvidenceFile[]> {
    const evidencePaths = [
      join(projectPath, 'evidence'),
      join(projectPath, '.ai-framework', 'evidence'),
      join(projectPath, 'docs', 'evidence')
    ];

    const evidence: EvidenceFile[] = [];

    for (const evidenceDir of evidencePaths) {
      try {
        await access(evidenceDir);
        const files = await this.scanEvidenceDirectory(evidenceDir);
        evidence.push(...files);
      } catch {
        // Continue to next path
      }
    }

    return evidence;
  }

  /**
   * Scan evidence directory for files
   */
  private async scanEvidenceDirectory(evidenceDir: string): Promise<EvidenceFile[]> {
    try {
      const { readdir, stat } = await import('fs/promises');
      const files = await readdir(evidenceDir);
      const evidence: EvidenceFile[] = [];

      for (const file of files) {
        try {
          const filePath = join(evidenceDir, file);
          const stats = await stat(filePath);
          
          if (stats.isFile()) {
            const evidenceFile = this.parseEvidenceFile(file, filePath, stats.mtime);
            if (evidenceFile) {
              evidence.push(evidenceFile);
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }

      return evidence;
    } catch {
      return [];
    }
  }

  /**
   * Parse evidence file metadata
   */
  private parseEvidenceFile(filename: string, path: string, timestamp: Date): EvidenceFile | null {
    // Determine evidence type from filename
    let type: EvidenceFile['type'] = 'connection';
    
    if (filename.includes('api') || filename.includes('connection')) {
      type = 'connection';
    } else if (filename.includes('integration') || filename.includes('corr-id')) {
      type = 'integration';
    } else if (filename.includes('performance') || filename.includes('perf')) {
      type = 'performance';
    } else if (filename.includes('negative') || filename.includes('error')) {
      type = 'negative';
    }

    // Check if evidence is still valid (< 2 hours old)
    const ageMinutes = (Date.now() - timestamp.getTime()) / (1000 * 60);
    const valid = ageMinutes < 120; // 2 hours

    return {
      type,
      timestamp,
      path,
      valid,
      description: this.generateEvidenceDescription(filename, type)
    };
  }

  /**
   * Generate description for evidence file
   */
  private generateEvidenceDescription(filename: string, type: EvidenceFile['type']): string {
    const base = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    
    switch (type) {
      case 'connection':
        return `API connection test: ${base}`;
      case 'integration':
        return `Integration test: ${base}`;
      case 'performance':
        return `Performance benchmark: ${base}`;
      case 'negative':
        return `Negative test case: ${base}`;
      default:
        return `Evidence: ${base}`;
    }
  }

  /**
   * Calculate overall confidence based on framework state
   */
  private calculateOverallConfidence(
    orchestration: any,
    tasks: any,
    drsScore: number,
    evidence: EvidenceFile[]
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    let confidenceScore = 100;

    // Factor in orchestration confidence
    if (orchestration.confidence === 'LOW') {
      confidenceScore -= 30;
    } else if (orchestration.confidence === 'MEDIUM') {
      confidenceScore -= 10;
    }

    // Factor in DRS score
    if (drsScore < 50) {
      confidenceScore -= 25;
    } else if (drsScore < 70) {
      confidenceScore -= 15;
    }

    // Factor in blockers
    confidenceScore -= tasks.blockers.length * 10;

    // Factor in evidence freshness
    const staleEvidence = evidence.filter(e => !e.valid).length;
    confidenceScore -= staleEvidence * 5;

    // Factor in time remaining
    if (orchestration.timeRemaining <= 0) {
      confidenceScore -= 20;
    } else if (orchestration.timeRemaining <= 10) {
      confidenceScore -= 10;
    }

    if (confidenceScore >= 80) return 'HIGH';
    if (confidenceScore >= 60) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Read behavioral contract status
   */
  private async readBehavioralContracts(projectPath: string) {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      const { readdir, readFile, stat } = await import('fs/promises');
      
      try {
        const files = await readdir(evidenceDir);
        const contractFiles = files.filter(f => 
          f.includes('contract') || f.includes('api-contract') || 
          f.includes('db-contract') || f.includes('event-contract')
        );

        let totalPassing = 0;
        let totalDefined = 0;
        let apiContracts = 0;
        let dbContracts = 0;
        let eventContracts = 0;
        let integrationContracts = 0;
        const violations = [];
        let lastValidated = new Date(0).toISOString();

        for (const file of contractFiles) {
          try {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Update last validated time
            if (stats.mtime > new Date(lastValidated)) {
              lastValidated = stats.mtime.toISOString();
            }

            // Count by type
            if (file.includes('api')) apiContracts++;
            else if (file.includes('db')) dbContracts++;
            else if (file.includes('event')) eventContracts++;
            else integrationContracts++;

            // Count passing/failing
            if (data.status === 'passed' || data.passed === true) {
              totalPassing++;
            }
            totalDefined++;

            // Collect violations
            if (data.violations && Array.isArray(data.violations)) {
              violations.push(...data.violations);
            }
          } catch {
            // Skip invalid files
            totalDefined++;
          }
        }

        return {
          apiContracts,
          dbContracts,
          eventContracts,
          integrationContracts,
          totalPassing,
          totalDefined,
          lastValidated,
          violations
        };
      } catch {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Read architecture stability status
   */
  private async readArchitectureStability(projectPath: string) {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      const { readdir, readFile, stat } = await import('fs/promises');
      
      try {
        const files = await readdir(evidenceDir);
        const architectureFiles = files.filter(f => 
          f.includes('dependency') || f.includes('layer') || 
          f.includes('pattern') || f.includes('complexity') ||
          f.includes('architecture')
        );

        let dependencyViolations = 0;
        let layerViolations = 0;
        let patternViolations = 0;
        let complexityViolations = 0;
        let stabilityScore = 100;
        const violations = [];
        let lastAnalyzed = new Date(0).toISOString();

        for (const file of architectureFiles) {
          try {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Update last analyzed time
            if (stats.mtime > new Date(lastAnalyzed)) {
              lastAnalyzed = stats.mtime.toISOString();
            }

            // Count violations by type
            if (data.violations && Array.isArray(data.violations)) {
              for (const violation of data.violations) {
                switch (violation.type) {
                  case 'dependency':
                    dependencyViolations++;
                    break;
                  case 'layer':
                    layerViolations++;
                    break;
                  case 'pattern':
                    patternViolations++;
                    break;
                  case 'complexity':
                    complexityViolations++;
                    break;
                }
                violations.push(violation);
              }
            }

            // Update stability score
            if (data.stabilityScore !== undefined) {
              stabilityScore = Math.min(stabilityScore, data.stabilityScore);
            }
          } catch {
            // Skip invalid files
          }
        }

        return {
          dependencyViolations,
          layerViolations,
          patternViolations,
          complexityViolations,
          stabilityScore,
          lastAnalyzed,
          violations
        };
      } catch {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Read integration evidence status
   */
  private async readIntegrationEvidence(projectPath: string) {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      const { readdir, readFile, stat } = await import('fs/promises');
      
      try {
        const files = await readdir(evidenceDir);
        const integrationFiles = files.filter(f => 
          f.includes('workflow') || f.includes('integration') || 
          f.includes('end-to-end') || f.includes('performance') ||
          f.includes('consistency')
        );

        let workflowsPassing = 0;
        let workflowsTotal = 0;
        let integrationsPassing = 0;
        let integrationsTotal = 0;
        let evidenceFreshness = Infinity;
        let performanceWithinLimits = true;
        const criticalWorkflows = [];

        for (const file of integrationFiles) {
          try {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Calculate evidence freshness
            const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
            evidenceFreshness = Math.min(evidenceFreshness, ageMinutes);

            // Count workflows and integrations
            if (file.includes('workflow') || file.includes('end-to-end')) {
              workflowsTotal++;
              if (data.status === 'passed' || data.passed === true) {
                workflowsPassing++;
              }

              // Track critical workflows
              criticalWorkflows.push({
                name: data.workflow || file.replace(/\.[^/.]+$/, ''),
                status: data.status === 'passed' ? 'passed' as const : 
                       data.status === 'failed' ? 'failed' as const : 'missing' as const,
                duration: data.duration_ms || data.duration || 0,
                lastRun: stats.mtime.toISOString(),
                errorMessage: data.error || data.errorMessage
              });
            } else {
              integrationsTotal++;
              if (data.status === 'passed' || data.passed === true) {
                integrationsPassing++;
              }
            }

            // Check performance limits
            if (data.performance && data.performance.within_limits === false) {
              performanceWithinLimits = false;
            }
          } catch {
            // Skip invalid files
            if (file.includes('workflow')) workflowsTotal++;
            else integrationsTotal++;
          }
        }

        return {
          workflowsPassing,
          workflowsTotal,
          integrationsPassing,
          integrationsTotal,
          evidenceFreshness: evidenceFreshness === Infinity ? 0 : evidenceFreshness,
          performanceWithinLimits,
          criticalWorkflows
        };
      } catch {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Read security validation status
   */
  private async readSecurityValidation(projectPath: string) {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      const { readdir, readFile, stat } = await import('fs/promises');
      
      try {
        const files = await readdir(evidenceDir);
        const securityFiles = files.filter(f => 
          f.includes('security') || f.includes('vulnerability') || 
          f.includes('audit') || f.includes('compliance')
        );

        let criticalIssues = 0;
        let highIssues = 0;
        let mediumIssues = 0;
        let lowIssues = 0;
        const vulnerabilities = [];
        let lastScanned = new Date(0).toISOString();
        const complianceStatus = {
          gdpr: false,
          sox: false,
          pci: false,
          lastAudit: new Date(0).toISOString()
        };

        for (const file of securityFiles) {
          try {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Update last scanned time
            if (stats.mtime > new Date(lastScanned)) {
              lastScanned = stats.mtime.toISOString();
            }

            // Count issues by severity
            if (data.issues && Array.isArray(data.issues)) {
              for (const issue of data.issues) {
                switch (issue.severity) {
                  case 'critical':
                    criticalIssues++;
                    break;
                  case 'high':
                    highIssues++;
                    break;
                  case 'medium':
                    mediumIssues++;
                    break;
                  case 'low':
                    lowIssues++;
                    break;
                }
                vulnerabilities.push(issue);
              }
            }

            // Check compliance status
            if (data.compliance) {
              if (data.compliance.gdpr) complianceStatus.gdpr = true;
              if (data.compliance.sox) complianceStatus.sox = true;
              if (data.compliance.pci) complianceStatus.pci = true;
              if (data.compliance.lastAudit) {
                complianceStatus.lastAudit = data.compliance.lastAudit;
              }
            }
          } catch {
            // Skip invalid files
          }
        }

        return {
          criticalIssues,
          highIssues,
          mediumIssues,
          lowIssues,
          lastScanned,
          vulnerabilities,
          complianceStatus
        };
      } catch {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Read production readiness status
   */
  private async readProductionReadiness(projectPath: string) {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      const { readdir, readFile, stat } = await import('fs/promises');
      
      try {
        const files = await readdir(evidenceDir);
        const productionFiles = files.filter(f => 
          f.includes('production') || f.includes('environment') || 
          f.includes('health') || f.includes('deployment') ||
          f.includes('observability')
        );

        let environmentConfig = false;
        let healthChecks = false;
        let observability = false;
        let errorHandling = false;
        let gracefulShutdown = false;
        let security = false;
        let readinessScore = 0;
        let lastValidated = new Date(0).toISOString();
        const issues = [];

        for (const file of productionFiles) {
          try {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Update last validated time
            if (stats.mtime > new Date(lastValidated)) {
              lastValidated = stats.mtime.toISOString();
            }

            // Check readiness categories
            if (data.environmentConfig === true) environmentConfig = true;
            if (data.healthChecks === true) healthChecks = true;
            if (data.observability === true) observability = true;
            if (data.errorHandling === true) errorHandling = true;
            if (data.gracefulShutdown === true) gracefulShutdown = true;
            if (data.security === true) security = true;

            // Update readiness score
            if (data.readinessScore !== undefined) {
              readinessScore = Math.max(readinessScore, data.readinessScore);
            }

            // Collect issues
            if (data.issues && Array.isArray(data.issues)) {
              issues.push(...data.issues);
            }
          } catch {
            // Skip invalid files
          }
        }

        return {
          environmentConfig,
          healthChecks,
          observability,
          errorHandling,
          gracefulShutdown,
          security,
          readinessScore,
          lastValidated,
          issues
        };
      } catch {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Read context preservation status
   */
  private async readContextPreservation(projectPath: string) {
    try {
      const { readdir, readFile, stat } = await import('fs/promises');
      
      // Check for ADR files
      const adrPaths = [
        join(projectPath, 'docs', 'adr'),
        join(projectPath, 'adr'),
        join(projectPath, '.ai-framework', 'adr')
      ];

      let adrCount = 0;
      for (const adrPath of adrPaths) {
        try {
          const adrFiles = await readdir(adrPath);
          adrCount = adrFiles.filter(f => f.endsWith('.md')).length;
          if (adrCount > 0) break;
        } catch {
          // Continue to next path
        }
      }

      // Check for context files
      const contextPaths = [
        join(projectPath, '.ai-framework', 'context'),
        join(projectPath, 'docs', 'context')
      ];

      let contextFiles = 0;
      let lastUpdated = new Date(0).toISOString();
      const inconsistencies = [];

      for (const contextPath of contextPaths) {
        try {
          const files = await readdir(contextPath);
          const contextFileList = files.filter(f => 
            f.includes('naming') || f.includes('pattern') || 
            f.includes('session') || f.includes('convention')
          );
          
          contextFiles = contextFileList.length;
          
          // Check for inconsistency reports
          for (const file of contextFileList) {
            try {
              const filePath = join(contextPath, file);
              const stats = await stat(filePath);
              const content = await readFile(filePath, 'utf-8');
              
              if (stats.mtime > new Date(lastUpdated)) {
                lastUpdated = stats.mtime.toISOString();
              }

              // Try to parse as JSON for inconsistency data
              try {
                const data = JSON.parse(content);
                if (data.inconsistencies && Array.isArray(data.inconsistencies)) {
                  inconsistencies.push(...data.inconsistencies);
                }
              } catch {
                // Not JSON, skip
              }
            } catch {
              // Skip invalid files
            }
          }
          
          if (contextFiles > 0) break;
        } catch {
          // Continue to next path
        }
      }

      // Calculate metrics (simplified)
      const namingConsistency = Math.max(0, 100 - (inconsistencies.filter(i => i.type === 'naming').length * 10));
      const patternAdherence = Math.max(0, 100 - (inconsistencies.filter(i => i.type === 'pattern').length * 15));
      const sessionContinuity = contextFiles > 0 && adrCount > 0;

      return {
        adrCount,
        contextFiles,
        namingConsistency,
        patternAdherence,
        sessionContinuity,
        lastUpdated,
        inconsistencies
      };
    } catch {
      return undefined;
    }
  }

  /**
   * Read data integrity status
   */
  private async readDataIntegrity(projectPath: string) {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      const { readdir, readFile, stat } = await import('fs/promises');
      
      try {
        const files = await readdir(evidenceDir);
        const dataIntegrityFiles = files.filter(f => 
          f.includes('data-integrity') || f.includes('transaction') || 
          f.includes('audit') || f.includes('consistency') ||
          f.includes('business-constraint')
        );

        let transactionSafety = false;
        let businessConstraints = false;
        let auditTrails = false;
        let consistencyChecks = false;
        let integrityScore = 0;
        let lastValidated = new Date(0).toISOString();
        const violations = [];

        for (const file of dataIntegrityFiles) {
          try {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Update last validated time
            if (stats.mtime > new Date(lastValidated)) {
              lastValidated = stats.mtime.toISOString();
            }

            // Check integrity categories
            if (data.transactionSafety === true) transactionSafety = true;
            if (data.businessConstraints === true) businessConstraints = true;
            if (data.auditTrails === true) auditTrails = true;
            if (data.consistencyChecks === true) consistencyChecks = true;

            // Update integrity score
            if (data.integrityScore !== undefined) {
              integrityScore = Math.max(integrityScore, data.integrityScore);
            }

            // Collect violations
            if (data.violations && Array.isArray(data.violations)) {
              violations.push(...data.violations);
            }
          } catch {
            // Skip invalid files
          }
        }

        return {
          transactionSafety,
          businessConstraints,
          auditTrails,
          consistencyChecks,
          integrityScore,
          lastValidated,
          violations
        };
      } catch {
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Check if framework files exist in project
   */
  async hasFrameworkFiles(projectPath: string): Promise<boolean> {
    const requiredFiles = [
      'orchestration.md',
      'tasks.md'
    ];

    const possiblePaths = [
      projectPath,
      join(projectPath, '.ai-framework'),
      join(projectPath, 'docs')
    ];

    for (const file of requiredFiles) {
      let found = false;
      for (const basePath of possiblePaths) {
        try {
          await access(join(basePath, file));
          found = true;
          break;
        } catch {
          // Continue checking
        }
      }
      if (!found) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get framework state summary for quick checks
   */
  async getFrameworkStateSummary(projectPath: string): Promise<{
    hasFrameworkFiles: boolean;
    drsScore: number;
    timeRemaining: number;
    violations: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    try {
      const hasFiles = await this.hasFrameworkFiles(projectPath);
      
      if (!hasFiles) {
        return {
          hasFrameworkFiles: false,
          drsScore: 0,
          timeRemaining: 0,
          violations: 1, // Missing files is a violation
          confidence: 'LOW'
        };
      }

      const state = await this.readFrameworkState(projectPath);
      const contextAnalyzer = new (await import('../analyzers/context-analyzer')).ContextAnalyzer();
      const analysis = contextAnalyzer.analyzeContext(state);

      return {
        hasFrameworkFiles: true,
        drsScore: state.drsScore,
        timeRemaining: state.orchestration.timeRemaining,
        violations: analysis.frameworkViolations.length,
        confidence: analysis.confidence
      };
    } catch (error) {
      return {
        hasFrameworkFiles: false,
        drsScore: 0,
        timeRemaining: 0,
        violations: 1,
        confidence: 'LOW'
      };
    }
  }
}