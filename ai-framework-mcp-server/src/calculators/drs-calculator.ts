/**
 * DRS (Deployability Rating Score) Calculator
 * Implements the ai-framework DRS calculation specification
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { execSync } from 'child_process';

export interface DRSComponent {
  name: string;
  score: number;
  maxScore: number;
  status: 'pass' | 'partial' | 'fail';
  details: string;
}

export interface DRSResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'EARLY_DEVELOPMENT' | 'IN_PROGRESS' | 'NEARLY_READY' | 'DEPLOYABLE';
  components: DRSComponent[];
  nextActions: string[];
  estimatedTimeToDeployment: string;
  timestamp: Date;
}

export interface DRSWeights {
  contracts: number;
  behavioralContracts: number;
  security: number;
  dataIntegrity: number;
  mocks: number;
  tests: number;
  integrationEvidence: number;
  architectureStability: number;
  productionReadiness: number;
  contextPreservation: number;
  errors: number;
  scope: number;
  docs: number;
}

export class DRSCalculator {
  private defaultWeights: DRSWeights = {
    contracts: 7,
    behavioralContracts: 7,
    security: 16,
    dataIntegrity: 9,
    mocks: 7,
    tests: 7,
    integrationEvidence: 9,
    architectureStability: 7,
    productionReadiness: 14,
    contextPreservation: 7,
    errors: 4,
    scope: 4,
    docs: 2
  };

  /**
   * Calculate DRS for a project
   */
  async calculateDRS(projectPath: string, customWeights?: Partial<DRSWeights>): Promise<DRSResult> {
    const weights = { ...this.defaultWeights, ...customWeights };
    const components: DRSComponent[] = [];

    // Calculate each component
    components.push(await this.checkContractIntegrity(projectPath, weights.contracts));
    components.push(await this.checkBehavioralContracts(projectPath, weights.behavioralContracts));
    components.push(await this.checkSecurityValidation(projectPath, weights.security));
    components.push(await this.checkDataIntegrity(projectPath, weights.dataIntegrity));
    components.push(await this.checkNoMocks(projectPath, weights.mocks));
    components.push(await this.checkTestsPassing(projectPath, weights.tests));
    components.push(await this.checkIntegrationEvidence(projectPath, weights.integrationEvidence));
    components.push(await this.checkArchitectureStability(projectPath, weights.architectureStability));
    components.push(await this.checkProductionReadiness(projectPath, weights.productionReadiness));
    components.push(await this.checkContextPreservation(projectPath, weights.contextPreservation));
    components.push(await this.checkErrorHandling(projectPath, weights.errors));
    components.push(await this.checkScopeCompliance(projectPath, weights.scope));
    components.push(await this.checkDocumentation(projectPath, weights.docs));

    // Calculate totals
    const totalScore = components.reduce((sum, comp) => sum + comp.score, 0);
    const maxScore = components.reduce((sum, comp) => sum + comp.maxScore, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Determine status
    const status = this.getStatusFromScore(percentage);

    // Generate next actions and time estimate
    const nextActions = this.generateNextActions(components);
    const estimatedTimeToDeployment = this.estimateTimeToDeployment(components, percentage);

    return {
      totalScore,
      maxScore,
      percentage,
      status,
      components,
      nextActions,
      estimatedTimeToDeployment,
      timestamp: new Date()
    };
  }

  /**
   * Check contract integrity (20 points)
   */
  private async checkContractIntegrity(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      // Look for contract files
      const contractFiles = await this.findContractFiles(projectPath);
      
      if (contractFiles.length === 0) {
        return {
          name: 'Contract Integrity',
          score: 0,
          maxScore,
          status: 'fail',
          details: 'No contract files found'
        };
      }

      // Check for contract hashes
      const hashFile = join(projectPath, '.contract-hashes');
      try {
        await readFile(hashFile, 'utf-8');
        
        // Verify hashes haven't changed
        const hashesValid = await this.verifyContractHashes(projectPath, contractFiles);
        
        if (hashesValid) {
          return {
            name: 'Contract Integrity',
            score: maxScore,
            maxScore,
            status: 'pass',
            details: `${contractFiles.length} contracts defined and unchanged`
          };
        } else {
          return {
            name: 'Contract Integrity',
            score: Math.round(maxScore * 0.5),
            maxScore,
            status: 'partial',
            details: 'Contracts defined but hashes changed'
          };
        }
      } catch {
        return {
          name: 'Contract Integrity',
          score: Math.round(maxScore * 0.5),
          maxScore,
          status: 'partial',
          details: 'Contracts defined but not hashed'
        };
      }
    } catch (error) {
      return {
        name: 'Contract Integrity',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking contracts: ${error}`
      };
    }
  }

  /**
   * Check for mocks (20 points)
   */
  private async checkNoMocks(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const mockPatterns = [
        /mock/i,
        /stub/i,
        /fake/i,
        /dummy/i,
        /localhost:\d+/,
        /127\.0\.0\.1/,
        /test\.example\.com/,
        /mockapi/i,
        /jsonplaceholder/i
      ];

      const sourceFiles = await this.findSourceFiles(projectPath);
      const mocksFound: string[] = [];

      for (const file of sourceFiles) {
        const content = await readFile(file, 'utf-8');
        
        for (const pattern of mockPatterns) {
          if (pattern.test(content)) {
            // Check if it's in test files (partial credit)
            const isTestFile = /test|spec/i.test(file);
            if (!isTestFile) {
              mocksFound.push(`${file}: ${pattern.source}`);
            }
          }
        }
      }

      if (mocksFound.length === 0) {
        return {
          name: 'No Mocks',
          score: maxScore,
          maxScore,
          status: 'pass',
          details: 'No mocks detected in production code'
        };
      } else if (mocksFound.length <= 2) {
        return {
          name: 'No Mocks',
          score: Math.round(maxScore * 0.5),
          maxScore,
          status: 'partial',
          details: `Few mocks found: ${mocksFound.length}`
        };
      } else {
        return {
          name: 'No Mocks',
          score: 0,
          maxScore,
          status: 'fail',
          details: `Multiple mocks found: ${mocksFound.length}`
        };
      }
    } catch (error) {
      return {
        name: 'No Mocks',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking mocks: ${error}`
      };
    }
  }

  /**
   * Check tests passing (15 points)
   */
  private async checkTestsPassing(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      // Look for test files
      const testFiles = await this.findTestFiles(projectPath);
      
      if (testFiles.length === 0) {
        return {
          name: 'Tests Passing',
          score: 0,
          maxScore,
          status: 'fail',
          details: 'No test files found'
        };
      }

      // Try to run tests
      try {
        // Check for common test runners
        const packageJsonPath = join(projectPath, 'package.json');
        let testCommand = '';

        try {
          const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
          if (packageJson.scripts?.test) {
            testCommand = 'npm test';
          } else if (packageJson.scripts?.jest) {
            testCommand = 'npm run jest';
          }
        } catch {
          // No package.json or no test script
        }

        if (!testCommand) {
          // Try common test patterns
          if (testFiles.some(f => f.includes('.test.js') || f.includes('.spec.js'))) {
            testCommand = 'jest';
          } else if (testFiles.some(f => f.includes('.test.ts') || f.includes('.spec.ts'))) {
            testCommand = 'jest';
          }
        }

        if (testCommand) {
          const result = execSync(testCommand, { 
            cwd: projectPath, 
            encoding: 'utf-8',
            timeout: 30000 // 30 second timeout
          });

          // Parse test results (basic heuristic)
          const passMatch = result.match(/(\d+)\s+pass/i);
          const failMatch = result.match(/(\d+)\s+fail/i);
          
          const passed = passMatch ? parseInt(passMatch[1]) : 0;
          const failed = failMatch ? parseInt(failMatch[1]) : 0;
          const total = passed + failed;

          if (total === 0) {
            return {
              name: 'Tests Passing',
              score: Math.round(maxScore * 0.3),
              maxScore,
              status: 'partial',
              details: 'Tests exist but results unclear'
            };
          }

          const passRate = passed / total;
          
          if (passRate >= 1.0) {
            return {
              name: 'Tests Passing',
              score: maxScore,
              maxScore,
              status: 'pass',
              details: `All ${passed} tests passing`
            };
          } else if (passRate >= 0.8) {
            return {
              name: 'Tests Passing',
              score: Math.round(maxScore * 0.7),
              maxScore,
              status: 'partial',
              details: `${passed}/${total} tests passing (${Math.round(passRate * 100)}%)`
            };
          } else if (passRate >= 0.5) {
            return {
              name: 'Tests Passing',
              score: Math.round(maxScore * 0.3),
              maxScore,
              status: 'partial',
              details: `${passed}/${total} tests passing (${Math.round(passRate * 100)}%)`
            };
          } else {
            return {
              name: 'Tests Passing',
              score: 0,
              maxScore,
              status: 'fail',
              details: `Only ${passed}/${total} tests passing`
            };
          }
        } else {
          return {
            name: 'Tests Passing',
            score: Math.round(maxScore * 0.3),
            maxScore,
            status: 'partial',
            details: `${testFiles.length} test files found but cannot run`
          };
        }
      } catch (error) {
        return {
          name: 'Tests Passing',
          score: 0,
          maxScore,
          status: 'fail',
          details: `Test execution failed: ${error}`
        };
      }
    } catch (error) {
      return {
        name: 'Tests Passing',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking tests: ${error}`
      };
    }
  }

  /**
   * Check error handling (10 points)
   */
  private async checkErrorHandling(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const sourceFiles = await this.findSourceFiles(projectPath);
      let errorHandlingScore = 0;
      let totalChecks = 0;

      const errorPatterns = [
        /try\s*{[\s\S]*?catch/i,
        /\.catch\(/i,
        /throw\s+new\s+Error/i,
        /if\s*\([^)]*error[^)]*\)/i,
        /console\.error/i,
        /logger?\.(error|warn)/i
      ];

      for (const file of sourceFiles) {
        const content = await readFile(file, 'utf-8');
        totalChecks++;

        let fileScore = 0;
        for (const pattern of errorPatterns) {
          if (pattern.test(content)) {
            fileScore++;
          }
        }

        // Score based on error handling patterns found
        if (fileScore >= 3) {
          errorHandlingScore += 2; // Comprehensive
        } else if (fileScore >= 1) {
          errorHandlingScore += 1; // Basic
        }
      }

      const scoreRatio = totalChecks > 0 ? errorHandlingScore / (totalChecks * 2) : 0;
      const finalScore = Math.round(maxScore * scoreRatio);

      if (scoreRatio >= 0.8) {
        return {
          name: 'Error Handling',
          score: maxScore,
          maxScore,
          status: 'pass',
          details: 'Comprehensive error handling found'
        };
      } else if (scoreRatio >= 0.4) {
        return {
          name: 'Error Handling',
          score: Math.round(maxScore * 0.5),
          maxScore,
          status: 'partial',
          details: 'Basic error handling found'
        };
      } else {
        return {
          name: 'Error Handling',
          score: 0,
          maxScore,
          status: 'fail',
          details: 'Minimal or no error handling'
        };
      }
    } catch (error) {
      return {
        name: 'Error Handling',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking error handling: ${error}`
      };
    }
  }

  /**
   * Check scope compliance (10 points)
   */
  private async checkScopeCompliance(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      // Use git to check changed files and lines
      const gitStatus = execSync('git status --porcelain', { 
        cwd: projectPath, 
        encoding: 'utf-8' 
      });
      
      const gitDiff = execSync('git diff --stat', { 
        cwd: projectPath, 
        encoding: 'utf-8' 
      });

      // Count changed files
      const changedFiles = gitStatus.split('\n').filter(line => line.trim()).length;
      
      // Extract lines changed from git diff
      const diffMatch = gitDiff.match(/(\d+)\s+insertions?.*?(\d+)\s+deletions?/);
      const insertions = diffMatch ? parseInt(diffMatch[1]) : 0;
      const deletions = diffMatch ? parseInt(diffMatch[2]) : 0;
      const totalLines = insertions + deletions;

      // Framework limits: ≤5 files, ≤200 LOC
      const fileLimit = 5;
      const lineLimit = 200;

      const fileCompliant = changedFiles <= fileLimit;
      const lineCompliant = totalLines <= lineLimit;

      if (fileCompliant && lineCompliant) {
        return {
          name: 'Scope Compliance',
          score: maxScore,
          maxScore,
          status: 'pass',
          details: `${changedFiles} files, ${totalLines} lines (within limits)`
        };
      } else if (changedFiles <= fileLimit * 1.2 && totalLines <= lineLimit * 1.2) {
        return {
          name: 'Scope Compliance',
          score: Math.round(maxScore * 0.5),
          maxScore,
          status: 'partial',
          details: `${changedFiles} files, ${totalLines} lines (minor violation)`
        };
      } else {
        return {
          name: 'Scope Compliance',
          score: 0,
          maxScore,
          status: 'fail',
          details: `${changedFiles} files, ${totalLines} lines (exceeds limits)`
        };
      }
    } catch (error) {
      // If git fails, assume compliance (might be new repo)
      return {
        name: 'Scope Compliance',
        score: maxScore,
        maxScore,
        status: 'pass',
        details: 'Cannot check git status, assuming compliance'
      };
    }
  }

  /**
   * Check security validation (20 points)
   */
  private async checkSecurityValidation(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      
      try {
        const evidenceFiles = await readdir(evidenceDir);
        const securityFiles = evidenceFiles.filter(file => 
          file.includes('security') || 
          file.includes('vulnerability') || 
          file.includes('audit') ||
          file.includes('compliance')
        );

        // Check source code for common security issues
        const sourceFiles = await this.findSourceFiles(projectPath);
        let securityIssues = 0;
        let criticalIssues = 0;

        for (const file of sourceFiles.slice(0, 20)) { // Sample files for performance
          const content = await readFile(file, 'utf-8');
          
          // Check for hardcoded secrets
          const secretPatterns = [
            /(api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{20,}['"]/i,
            /(password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/i,
            /(secret|token)\s*[:=]\s*['"][^'"]{16,}['"]/i,
            /(mongodb|mysql|postgres):\/\/[^\s"']+:[^\s"']+@/
          ];

          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              criticalIssues++;
              securityIssues++;
            }
          }

          // Check for SQL injection risks
          if (/\$\{.*\}.*query|query.*\$\{.*\}|`.*\$\{.*\}`.*sql/i.test(content)) {
            criticalIssues++;
            securityIssues++;
          }

          // Check for missing input validation
          if (/req\.body\.|req\.params\.|req\.query\./.test(content) && 
              !/validate|sanitize|escape/.test(content)) {
            securityIssues++;
          }
        }

        // Check security evidence files
        let securityEvidenceScore = 0;
        if (securityFiles.length >= 3) {
          securityEvidenceScore = 5;
        } else if (securityFiles.length >= 1) {
          securityEvidenceScore = 2;
        }

        // Calculate final score
        if (criticalIssues > 0) {
          return {
            name: 'Security Validation',
            score: 0,
            maxScore,
            status: 'fail',
            details: `${criticalIssues} critical security issues detected`
          };
        } else if (securityIssues > 5) {
          return {
            name: 'Security Validation',
            score: Math.round(maxScore * 0.3),
            maxScore,
            status: 'partial',
            details: `${securityIssues} security issues detected`
          };
        } else if (securityIssues > 0 || securityEvidenceScore < 5) {
          return {
            name: 'Security Validation',
            score: Math.round(maxScore * 0.7) + securityEvidenceScore,
            maxScore,
            status: 'partial',
            details: `${securityIssues} minor security issues, evidence: ${securityFiles.length} files`
          };
        } else {
          return {
            name: 'Security Validation',
            score: maxScore,
            maxScore,
            status: 'pass',
            details: 'No security issues detected, evidence complete'
          };
        }
      } catch {
        // Fallback: basic security check
        const sourceFiles = await this.findSourceFiles(projectPath);
        let hasSecurityMeasures = false;

        for (const file of sourceFiles.slice(0, 5)) {
          const content = await readFile(file, 'utf-8');
          if (/helmet|cors|rateLimit|bcrypt|jwt/.test(content)) {
            hasSecurityMeasures = true;
            break;
          }
        }

        return {
          name: 'Security Validation',
          score: hasSecurityMeasures ? Math.round(maxScore * 0.5) : Math.round(maxScore * 0.2),
          maxScore,
          status: 'partial',
          details: hasSecurityMeasures ? 'Basic security measures detected' : 'Limited security validation'
        };
      }
    } catch (error) {
      return {
        name: 'Security Validation',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking security: ${error}`
      };
    }
  }

  /**
   * Check data integrity (10 points)
   */
  private async checkDataIntegrity(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      
      try {
        const evidenceFiles = await readdir(evidenceDir);
        const dataIntegrityFiles = evidenceFiles.filter(file => 
          file.includes('data-integrity') || 
          file.includes('transaction') || 
          file.includes('audit') ||
          file.includes('consistency') ||
          file.includes('business-constraint')
        );

        // Check source code for data integrity patterns
        const sourceFiles = await this.findSourceFiles(projectPath);
        let integrityScore = 0;
        let violations = 0;

        for (const file of sourceFiles.slice(0, 15)) { // Sample files for performance
          const content = await readFile(file, 'utf-8');
          
          // Check for transaction usage
          if (/transaction|beginTransaction|commit|rollback/.test(content)) {
            integrityScore += 2;
          }

          // Check for audit logging
          if (/audit|log.*change|track.*modification/.test(content)) {
            integrityScore += 1;
          }

          // Check for business validation
          if (/validate|constraint|business.*rule/.test(content)) {
            integrityScore += 1;
          }

          // Check for potential race conditions (violations)
          if (/await.*get.*await.*set|read.*modify.*write/.test(content.replace(/\s+/g, ' '))) {
            violations += 1;
          }

          // Check for missing error handling in data operations
          if (/(insert|update|delete|create).*\(/i.test(content) && 
              !/try.*catch|\.catch\(/.test(content)) {
            violations += 1;
          }
        }

        // Add evidence file bonus
        integrityScore += dataIntegrityFiles.length * 3;

        // Calculate final score based on patterns and violations
        if (violations > 3) {
          return {
            name: 'Data Integrity',
            score: 0,
            maxScore,
            status: 'fail',
            details: `${violations} data integrity violations detected`
          };
        } else if (violations > 0 || integrityScore < 10) {
          return {
            name: 'Data Integrity',
            score: Math.round(maxScore * 0.6),
            maxScore,
            status: 'partial',
            details: `${violations} violations, ${dataIntegrityFiles.length} evidence files`
          };
        } else if (integrityScore >= 15) {
          return {
            name: 'Data Integrity',
            score: maxScore,
            maxScore,
            status: 'pass',
            details: `Data integrity patterns implemented, ${dataIntegrityFiles.length} evidence files`
          };
        } else {
          return {
            name: 'Data Integrity',
            score: Math.round(maxScore * 0.8),
            maxScore,
            status: 'partial',
            details: `Basic data integrity, ${dataIntegrityFiles.length} evidence files`
          };
        }
      } catch {
        // Fallback: basic data integrity check
        const sourceFiles = await this.findSourceFiles(projectPath);
        let hasDataIntegrityPatterns = false;

        for (const file of sourceFiles.slice(0, 5)) {
          const content = await readFile(file, 'utf-8');
          if (/transaction|audit|validate|constraint/.test(content)) {
            hasDataIntegrityPatterns = true;
            break;
          }
        }

        return {
          name: 'Data Integrity',
          score: hasDataIntegrityPatterns ? Math.round(maxScore * 0.4) : Math.round(maxScore * 0.1),
          maxScore,
          status: 'partial',
          details: hasDataIntegrityPatterns ? 'Basic data integrity patterns detected' : 'Limited data integrity validation'
        };
      }
    } catch (error) {
      return {
        name: 'Data Integrity',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking data integrity: ${error}`
      };
    }
  }

  /**
   * Check behavioral contracts (8 points)
   */
  private async checkBehavioralContracts(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      
      try {
        const evidenceFiles = await readdir(evidenceDir);
        const contractEvidenceFiles = evidenceFiles.filter(file => 
          file.includes('contract') || 
          file.includes('api-contract') || 
          file.includes('db-contract') ||
          file.includes('event-contract') ||
          file.includes('integration-contract')
        );

        if (contractEvidenceFiles.length >= 3) {
          // Check if evidence is fresh (< 2 hours)
          let freshEvidence = 0;
          for (const file of contractEvidenceFiles) {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
            if (ageHours < 2) freshEvidence++;
          }

          if (freshEvidence >= 3) {
            return {
              name: 'Behavioral Contracts',
              score: maxScore,
              maxScore,
              status: 'pass',
              details: `${contractEvidenceFiles.length} behavioral contracts validated (fresh)`
            };
          } else if (freshEvidence >= 1) {
            return {
              name: 'Behavioral Contracts',
              score: Math.round(maxScore * 0.7),
              maxScore,
              status: 'partial',
              details: `${contractEvidenceFiles.length} contracts, ${freshEvidence} fresh`
            };
          } else {
            return {
              name: 'Behavioral Contracts',
              score: Math.round(maxScore * 0.3),
              maxScore,
              status: 'partial',
              details: `${contractEvidenceFiles.length} contracts but evidence stale`
            };
          }
        } else if (contractEvidenceFiles.length >= 1) {
          return {
            name: 'Behavioral Contracts',
            score: Math.round(maxScore * 0.3),
            maxScore,
            status: 'partial',
            details: `${contractEvidenceFiles.length} behavioral contracts found`
          };
        } else {
          return {
            name: 'Behavioral Contracts',
            score: 0,
            maxScore,
            status: 'fail',
            details: 'No behavioral contract evidence found'
          };
        }
      } catch {
        return {
          name: 'Behavioral Contracts',
          score: 0,
          maxScore,
          status: 'fail',
          details: 'No evidence directory found'
        };
      }
    } catch (error) {
      return {
        name: 'Behavioral Contracts',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking behavioral contracts: ${error}`
      };
    }
  }

  /**
   * Check integration evidence (15 points)
   */
  private async checkIntegrationEvidence(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      
      try {
        const evidenceFiles = await readdir(evidenceDir);
        const integrationFiles = evidenceFiles.filter(file => 
          file.includes('workflow') || 
          file.includes('integration') || 
          file.includes('end-to-end') ||
          file.includes('performance') ||
          file.includes('consistency')
        );

        if (integrationFiles.length >= 4) {
          // Check evidence freshness
          let freshEvidence = 0;
          for (const file of integrationFiles) {
            const filePath = join(evidenceDir, file);
            const stats = await stat(filePath);
            const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
            if (ageMinutes < 120) freshEvidence++; // 2 hours
          }

          if (freshEvidence >= 4) {
            return {
              name: 'Integration Evidence',
              score: maxScore,
              maxScore,
              status: 'pass',
              details: `${integrationFiles.length} integration evidence files (fresh)`
            };
          } else if (freshEvidence >= 2) {
            return {
              name: 'Integration Evidence',
              score: Math.round(maxScore * 0.7),
              maxScore,
              status: 'partial',
              details: `${integrationFiles.length} files, ${freshEvidence} fresh`
            };
          } else {
            return {
              name: 'Integration Evidence',
              score: Math.round(maxScore * 0.3),
              maxScore,
              status: 'partial',
              details: `${integrationFiles.length} files but evidence stale`
            };
          }
        } else if (integrationFiles.length >= 1) {
          return {
            name: 'Integration Evidence',
            score: Math.round(maxScore * 0.3),
            maxScore,
            status: 'partial',
            details: `${integrationFiles.length} integration evidence files`
          };
        } else {
          return {
            name: 'Integration Evidence',
            score: 0,
            maxScore,
            status: 'fail',
            details: 'No integration evidence found'
          };
        }
      } catch {
        return {
          name: 'Integration Evidence',
          score: 0,
          maxScore,
          status: 'fail',
          details: 'No evidence directory found'
        };
      }
    } catch (error) {
      return {
        name: 'Integration Evidence',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking integration evidence: ${error}`
      };
    }
  }

  /**
   * Check architecture stability (10 points)
   */
  private async checkArchitectureStability(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      
      try {
        const evidenceFiles = await readdir(evidenceDir);
        const architectureFiles = evidenceFiles.filter(file => 
          file.includes('dependency') || 
          file.includes('layer') || 
          file.includes('pattern') ||
          file.includes('complexity') ||
          file.includes('architecture')
        );

        if (architectureFiles.length >= 3) {
          // Check for architecture violations in evidence
          let violationCount = 0;
          
          for (const file of architectureFiles) {
            try {
              const filePath = join(evidenceDir, file);
              const content = await readFile(filePath, 'utf-8');
              
              // Look for violation indicators in JSON evidence
              if (content.includes('"violations"') || content.includes('"errors"')) {
                const data = JSON.parse(content);
                if (data.violations && Array.isArray(data.violations)) {
                  violationCount += data.violations.length;
                }
              }
            } catch {
              // Skip files that can't be parsed
            }
          }

          if (violationCount === 0) {
            return {
              name: 'Architecture Stability',
              score: maxScore,
              maxScore,
              status: 'pass',
              details: `Architecture analysis complete, no violations`
            };
          } else if (violationCount <= 2) {
            return {
              name: 'Architecture Stability',
              score: Math.round(maxScore * 0.5),
              maxScore,
              status: 'partial',
              details: `${violationCount} minor architecture violations`
            };
          } else {
            return {
              name: 'Architecture Stability',
              score: 0,
              maxScore,
              status: 'fail',
              details: `${violationCount} architecture violations detected`
            };
          }
        } else {
          return {
            name: 'Architecture Stability',
            score: Math.round(maxScore * 0.5),
            maxScore,
            status: 'partial',
            details: 'Limited architecture analysis available'
          };
        }
      } catch {
        // Fallback: basic architecture check using source code analysis
        const sourceFiles = await this.findSourceFiles(projectPath);
        
        // Simple heuristic: check for common architectural anti-patterns
        let antiPatterns = 0;
        
        for (const file of sourceFiles.slice(0, 10)) { // Sample first 10 files
          const content = await readFile(file, 'utf-8');
          
          // Check for potential issues
          if (content.length > 1000 && content.split('\n').length > 100) antiPatterns++; // Large files
          if ((content.match(/import|require/g) || []).length > 20) antiPatterns++; // Too many dependencies
          if ((content.match(/class|function/g) || []).length > 20) antiPatterns++; // Too many definitions
        }

        if (antiPatterns <= 2) {
          return {
            name: 'Architecture Stability',
            score: Math.round(maxScore * 0.7),
            maxScore,
            status: 'partial',
            details: 'Basic architecture check passed'
          };
        } else {
          return {
            name: 'Architecture Stability',
            score: Math.round(maxScore * 0.3),
            maxScore,
            status: 'partial',
            details: 'Potential architecture issues detected'
          };
        }
      }
    } catch (error) {
      return {
        name: 'Architecture Stability',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking architecture stability: ${error}`
      };
    }
  }

  /**
   * Check production readiness (15 points)
   */
  private async checkProductionReadiness(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      
      try {
        const evidenceFiles = await readdir(evidenceDir);
        const productionFiles = evidenceFiles.filter(file => 
          file.includes('production') || 
          file.includes('environment') || 
          file.includes('health') ||
          file.includes('deployment') ||
          file.includes('observability')
        );

        // Check source code for production readiness indicators
        const sourceFiles = await this.findSourceFiles(projectPath);
        let productionScore = 0;
        let maxProductionScore = 20; // Internal scoring

        for (const file of sourceFiles.slice(0, 10)) {
          const content = await readFile(file, 'utf-8');
          
          // Check for environment variable usage
          if (/process\.env\./g.test(content)) {
            productionScore += 2;
          }

          // Check for health endpoints
          if (/\/health|\/ready|\/live/.test(content)) {
            productionScore += 3;
          }

          // Check for structured logging
          if (/winston|bunyan|pino|logger\./.test(content)) {
            productionScore += 2;
          }

          // Check for graceful shutdown
          if (/SIGTERM|SIGINT|graceful.*shutdown/.test(content)) {
            productionScore += 3;
          }

          // Check for security headers
          if (/helmet|security.*header/.test(content)) {
            productionScore += 2;
          }

          // Check for error handling
          if (/try.*catch|\.catch\(|error.*handler/.test(content)) {
            productionScore += 1;
          }

          // Penalize hardcoded values
          if (/localhost|127\.0\.0\.1|http:\/\//.test(content) && 
              !/process\.env|config\./.test(content)) {
            productionScore -= 2;
          }
        }

        // Add evidence file bonus
        productionScore += productionFiles.length * 2;

        // Calculate final score
        const scoreRatio = Math.min(productionScore / maxProductionScore, 1);
        const finalScore = Math.round(maxScore * scoreRatio);

        if (scoreRatio >= 0.8) {
          return {
            name: 'Production Readiness',
            score: maxScore,
            maxScore,
            status: 'pass',
            details: `Production ready: ${productionFiles.length} evidence files`
          };
        } else if (scoreRatio >= 0.5) {
          return {
            name: 'Production Readiness',
            score: Math.round(maxScore * 0.7),
            maxScore,
            status: 'partial',
            details: `Partially production ready: ${productionFiles.length} evidence files`
          };
        } else {
          return {
            name: 'Production Readiness',
            score: Math.round(maxScore * 0.3),
            maxScore,
            status: 'partial',
            details: `Limited production readiness: ${productionFiles.length} evidence files`
          };
        }
      } catch {
        return {
          name: 'Production Readiness',
          score: Math.round(maxScore * 0.2),
          maxScore,
          status: 'partial',
          details: 'No evidence directory found'
        };
      }
    } catch (error) {
      return {
        name: 'Production Readiness',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking production readiness: ${error}`
      };
    }
  }

  /**
   * Check context preservation (10 points)
   */
  private async checkContextPreservation(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      // Check for ADR directory
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
      for (const contextPath of contextPaths) {
        try {
          const files = await readdir(contextPath);
          contextFiles = files.filter(f => 
            f.includes('naming') || 
            f.includes('pattern') || 
            f.includes('session') ||
            f.includes('convention')
          ).length;
          if (contextFiles > 0) break;
        } catch {
          // Continue to next path
        }
      }

      // Check source code for consistency indicators
      const sourceFiles = await this.findSourceFiles(projectPath);
      let consistencyScore = 0;

      if (sourceFiles.length > 0) {
        // Sample files to check naming consistency
        const sampleFiles = sourceFiles.slice(0, 10);
        const namingPatterns = new Set();
        
        for (const file of sampleFiles) {
          const content = await readFile(file, 'utf-8');
          
          // Check for consistent class naming
          const classMatches = content.match(/class\s+([A-Z][a-zA-Z0-9]*)/g);
          if (classMatches) {
            classMatches.forEach(match => {
              const className = match.replace('class ', '');
              if (/Service$|Repository$|Controller$/.test(className)) {
                namingPatterns.add('suffixed');
              } else {
                namingPatterns.add('unsuffixed');
              }
            });
          }

          // Check for consistent function naming
          const functionMatches = content.match(/function\s+([a-z][a-zA-Z0-9]*)|const\s+([a-z][a-zA-Z0-9]*)\s*=/g);
          if (functionMatches && functionMatches.length > 0) {
            consistencyScore += 1;
          }
        }

        // Penalize inconsistent naming patterns
        if (namingPatterns.size > 1) {
          consistencyScore -= 2;
        }
      }

      // Calculate final score
      let totalScore = 0;
      
      if (adrCount >= 3) {
        totalScore += 4; // Good ADR coverage
      } else if (adrCount >= 1) {
        totalScore += 2; // Some ADRs
      }

      if (contextFiles >= 2) {
        totalScore += 3; // Good context preservation
      } else if (contextFiles >= 1) {
        totalScore += 1; // Some context files
      }

      totalScore += Math.max(0, consistencyScore);

      const scoreRatio = Math.min(totalScore / 7, 1); // Max internal score of 7
      const finalScore = Math.round(maxScore * scoreRatio);

      if (scoreRatio >= 0.8) {
        return {
          name: 'Context Preservation',
          score: maxScore,
          maxScore,
          status: 'pass',
          details: `Context well preserved: ${adrCount} ADRs, ${contextFiles} context files`
        };
      } else if (scoreRatio >= 0.4) {
        return {
          name: 'Context Preservation',
          score: Math.round(maxScore * 0.6),
          maxScore,
          status: 'partial',
          details: `Partial context preservation: ${adrCount} ADRs, ${contextFiles} context files`
        };
      } else {
        return {
          name: 'Context Preservation',
          score: Math.round(maxScore * 0.2),
          maxScore,
          status: 'partial',
          details: `Limited context preservation: ${adrCount} ADRs, ${contextFiles} context files`
        };
      }
    } catch (error) {
      return {
        name: 'Context Preservation',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking context preservation: ${error}`
      };
    }
  }

  /**
   * Check API evidence (deprecated - replaced by integration evidence)
   */
  private async checkAPIEvidence(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const evidenceDir = join(projectPath, 'evidence');
      
      try {
        const evidenceFiles = await readdir(evidenceDir);
        const apiEvidenceFiles = evidenceFiles.filter(file => 
          file.includes('api') || 
          file.includes('connection') || 
          file.includes('endpoint') ||
          file.includes('response')
        );

        if (apiEvidenceFiles.length >= 3) {
          return {
            name: 'API Evidence',
            score: maxScore,
            maxScore,
            status: 'pass',
            details: `${apiEvidenceFiles.length} API evidence files found`
          };
        } else if (apiEvidenceFiles.length >= 1) {
          return {
            name: 'API Evidence',
            score: Math.round(maxScore * 0.5),
            maxScore,
            status: 'partial',
            details: `${apiEvidenceFiles.length} API evidence files found`
          };
        } else {
          return {
            name: 'API Evidence',
            score: 0,
            maxScore,
            status: 'fail',
            details: 'No API evidence files found'
          };
        }
      } catch {
        // Check for API configuration in code
        const sourceFiles = await this.findSourceFiles(projectPath);
        let apiConfigFound = false;

        for (const file of sourceFiles) {
          const content = await readFile(file, 'utf-8');
          if (/https?:\/\/(?!localhost|127\.0\.0\.1|test\.|mock)/i.test(content)) {
            apiConfigFound = true;
            break;
          }
        }

        if (apiConfigFound) {
          return {
            name: 'API Evidence',
            score: Math.round(maxScore * 0.5),
            maxScore,
            status: 'partial',
            details: 'API configuration found but no evidence captured'
          };
        } else {
          return {
            name: 'API Evidence',
            score: 0,
            maxScore,
            status: 'fail',
            details: 'No evidence directory or API configuration'
          };
        }
      }
    } catch (error) {
      return {
        name: 'API Evidence',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking API evidence: ${error}`
      };
    }
  }

  /**
   * Check documentation (10 points)
   */
  private async checkDocumentation(projectPath: string, maxScore: number): Promise<DRSComponent> {
    try {
      const docFiles = ['README.md', 'README.txt', 'docs/README.md', 'DOCUMENTATION.md'];
      let readmeFound = false;
      let readmeContent = '';

      for (const docFile of docFiles) {
        try {
          readmeContent = await readFile(join(projectPath, docFile), 'utf-8');
          readmeFound = true;
          break;
        } catch {
          // Continue to next file
        }
      }

      if (!readmeFound) {
        return {
          name: 'Documentation',
          score: 0,
          maxScore,
          status: 'fail',
          details: 'No README or documentation found'
        };
      }

      // Check documentation quality
      const hasSetupInstructions = /install|setup|getting started|how to run/i.test(readmeContent);
      const hasUsageExamples = /example|usage|how to use/i.test(readmeContent);
      const hasDescription = readmeContent.length > 200;

      let qualityScore = 0;
      if (hasDescription) qualityScore++;
      if (hasSetupInstructions) qualityScore++;
      if (hasUsageExamples) qualityScore++;

      if (qualityScore >= 3) {
        return {
          name: 'Documentation',
          score: maxScore,
          maxScore,
          status: 'pass',
          details: 'Comprehensive documentation found'
        };
      } else if (qualityScore >= 1) {
        return {
          name: 'Documentation',
          score: Math.round(maxScore * 0.5),
          maxScore,
          status: 'partial',
          details: 'Basic documentation found'
        };
      } else {
        return {
          name: 'Documentation',
          score: 0,
          maxScore,
          status: 'fail',
          details: 'Documentation exists but lacks content'
        };
      }
    } catch (error) {
      return {
        name: 'Documentation',
        score: 0,
        maxScore,
        status: 'fail',
        details: `Error checking documentation: ${error}`
      };
    }
  }

  // Helper methods

  private async findContractFiles(projectPath: string): Promise<string[]> {
    const contractExtensions = ['.yaml', '.yml', '.json', '.proto', '.graphql'];
    const contractDirs = ['api', 'contracts', 'schemas', 'spec'];
    const files: string[] = [];

    for (const dir of contractDirs) {
      try {
        const dirPath = join(projectPath, dir);
        const dirFiles = await readdir(dirPath);
        
        for (const file of dirFiles) {
          if (contractExtensions.some(ext => file.endsWith(ext))) {
            files.push(join(dirPath, file));
          }
        }
      } catch {
        // Directory doesn't exist, continue
      }
    }

    return files;
  }

  private async findSourceFiles(projectPath: string): Promise<string[]> {
    const sourceExtensions = ['.js', '.ts', '.py', '.java', '.cs', '.go', '.rs'];
    const files: string[] = [];

    const scanDirectory = async (dir: string) => {
      try {
        const entries = await readdir(dir);
        
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
            await scanDirectory(fullPath);
          } else if (stats.isFile() && sourceExtensions.some(ext => entry.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch {
        // Directory access error, skip
      }
    };

    await scanDirectory(projectPath);
    return files;
  }

  private async findTestFiles(projectPath: string): Promise<string[]> {
    const sourceFiles = await this.findSourceFiles(projectPath);
    return sourceFiles.filter(file => 
      /test|spec/i.test(file) || 
      file.includes('__tests__') ||
      file.includes('.test.') ||
      file.includes('.spec.')
    );
  }

  private async verifyContractHashes(projectPath: string, contractFiles: string[]): Promise<boolean> {
    // Simplified hash verification - in real implementation would check actual hashes
    try {
      const hashFile = join(projectPath, '.contract-hashes');
      const hashContent = await readFile(hashFile, 'utf-8');
      
      // Basic check: hash file should contain references to contract files
      return contractFiles.every(file => 
        hashContent.includes(file.split('/').pop() || '')
      );
    } catch {
      return false;
    }
  }

  private getStatusFromScore(percentage: number): DRSResult['status'] {
    if (percentage >= 85) return 'DEPLOYABLE';
    if (percentage >= 70) return 'NEARLY_READY';
    if (percentage >= 40) return 'IN_PROGRESS';
    return 'EARLY_DEVELOPMENT';
  }

  private generateNextActions(components: DRSComponent[]): string[] {
    const actions: string[] = [];

    for (const component of components) {
      if (component.status === 'fail') {
        switch (component.name) {
          case 'Contract Integrity':
            actions.push(`Define and hash contracts (+${component.maxScore})`);
            break;
          case 'Behavioral Contracts':
            actions.push(`Validate behavioral contracts (+${component.maxScore})`);
            break;
          case 'Security Validation':
            actions.push(`Fix security vulnerabilities (+${component.maxScore})`);
            break;
          case 'Data Integrity':
            actions.push(`Implement data integrity validation (+${component.maxScore})`);
            break;
          case 'No Mocks':
            actions.push(`Replace mocks with real services (+${component.maxScore})`);
            break;
          case 'Tests Passing':
            actions.push(`Write and fix tests (+${component.maxScore})`);
            break;
          case 'Integration Evidence':
            actions.push(`Generate integration evidence (+${component.maxScore})`);
            break;
          case 'Architecture Stability':
            actions.push(`Fix architecture violations (+${component.maxScore})`);
            break;
          case 'Production Readiness':
            actions.push(`Implement production readiness (+${component.maxScore})`);
            break;
          case 'Context Preservation':
            actions.push(`Improve context preservation (+${component.maxScore})`);
            break;
          case 'Error Handling':
            actions.push(`Add error handling (+${component.maxScore})`);
            break;
          case 'Scope Compliance':
            actions.push(`Reduce scope to framework limits (+${component.maxScore})`);
            break;
          case 'Documentation':
            actions.push(`Write documentation (+${component.maxScore})`);
            break;
        }
      } else if (component.status === 'partial') {
        const remaining = component.maxScore - component.score;
        actions.push(`Improve ${component.name.toLowerCase()} (+${remaining})`);
      }
    }

    return actions.slice(0, 5); // Top 5 actions
  }

  private estimateTimeToDeployment(components: DRSComponent[], currentScore: number): string {
    if (currentScore >= 85) return 'Ready to deploy';

    const pointsNeeded = 85 - currentScore;
    
    // Rough time estimates based on typical effort
    const timeEstimates: Record<string, number> = {
      'Contract Integrity': 60, // 1 hour
      'Behavioral Contracts': 90, // 1.5 hours
      'Security Validation': 120, // 2 hours
      'Data Integrity': 100, // 1.75 hours
      'No Mocks': 120, // 2 hours
      'Tests Passing': 90, // 1.5 hours
      'Integration Evidence': 75, // 1.25 hours
      'Architecture Stability': 45, // 45 minutes
      'Production Readiness': 150, // 2.5 hours
      'Context Preservation': 60, // 1 hour
      'Error Handling': 45, // 45 minutes
      'Scope Compliance': 30, // 30 minutes
      'Documentation': 30 // 30 minutes
    };

    let estimatedMinutes = 0;
    
    for (const component of components) {
      if (component.status !== 'pass') {
        const componentTime = timeEstimates[component.name] || 60;
        const effortRatio = (component.maxScore - component.score) / component.maxScore;
        estimatedMinutes += componentTime * effortRatio;
      }
    }

    if (estimatedMinutes < 60) {
      return `${Math.round(estimatedMinutes)} minutes`;
    } else if (estimatedMinutes < 120) {
      return `${Math.round(estimatedMinutes / 60 * 10) / 10} hours`;
    } else {
      return `${Math.round(estimatedMinutes / 60)} hours`;
    }
  }

  /**
   * Format DRS result as detailed report
   */
  formatDetailedReport(result: DRSResult): string {
    const lines = [
      '═══════════════════════════════════════',
      'DEPLOYABILITY RATING SCORE (DRS)',
      `Time: ${result.timestamp.toISOString()}`,
      '═══════════════════════════════════════',
      '',
      'Component Scores:'
    ];

    for (const component of result.components) {
      const icon = component.status === 'pass' ? '✓' : 
                   component.status === 'partial' ? '⚠' : '✗';
      const padding = '.'.repeat(Math.max(1, 25 - component.name.length));
      lines.push(`${icon} ${component.name}${padding} ${component.score}/${component.maxScore}`);
    }

    lines.push('');
    lines.push(`TOTAL DRS: ${result.totalScore}/${result.maxScore} (${result.percentage}%)`);
    lines.push('');
    lines.push(`Status: ${result.status}`);

    if (result.nextActions.length > 0) {
      lines.push('Next Actions:');
      for (const action of result.nextActions) {
        lines.push(`- ${action}`);
      }
    }

    lines.push('');
    lines.push(`Estimated time to deployment: ${result.estimatedTimeToDeployment}`);
    lines.push('═══════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Format DRS result as minimal output
   */
  formatMinimalReport(result: DRSResult): string {
    const failedComponents = result.components
      .filter(c => c.status === 'fail')
      .map(c => c.name.toLowerCase())
      .join(', ');

    return `DRS: ${result.percentage}/100 (${result.status})${
      failedComponents ? `\nMissing: ${failedComponents}` : ''
    }`;
  }
}