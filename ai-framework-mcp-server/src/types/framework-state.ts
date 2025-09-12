/**
 * Core types for AI Framework state management
 */

export interface OrchestrationData {
  sessionMode: 'DEVELOPMENT' | 'ENHANCEMENT' | 'DEBUG' | 'MAINTENANCE';
  currentGate: string;
  gateDeadline: Date;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  lastEvidence: Date;
  contractHash: string;
  sessionStartTime: Date;
  timeRemaining: number; // minutes
}

export interface TaskData {
  tasks: Task[];
  completionPercentage: number;
  blockers: Blocker[];
  partialProgress: Record<string, number>;
}

export interface Task {
  id: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  requirements: string[];
  estimatedTime: number;
  actualTime?: number;
  subtasks?: Task[];
}

export interface Blocker {
  id: string;
  description: string;
  timestamp: Date;
  attemptedFixes: string[];
  requiredAction: string;
  eta?: Date;
}

export interface EvidenceFile {
  type: 'connection' | 'integration' | 'performance' | 'negative';
  timestamp: Date;
  path: string;
  valid: boolean;
  description: string;
}

export interface FrameworkState {
  orchestration: OrchestrationData;
  tasks: TaskData;
  drsScore: number;
  evidence: EvidenceFile[];
  lastUpdate: Date;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  projectPath: string;
  behavioralContracts?: BehavioralContractStatus;
  architectureStability?: ArchitectureStabilityStatus;
  integrationEvidence?: IntegrationEvidenceStatus;
  securityValidation?: SecurityValidationStatus;
  productionReadiness?: ProductionReadinessStatus;
  contextPreservation?: ContextPreservationStatus;
  dataIntegrity?: DataIntegrityStatus;
}

export interface BehavioralContractStatus {
  apiContracts: number;
  dbContracts: number;
  eventContracts: number;
  integrationContracts: number;
  totalPassing: number;
  totalDefined: number;
  lastValidated: string;
  violations: ContractViolation[];
}

export interface ContractViolation {
  type: 'api' | 'database' | 'event' | 'integration';
  contract: string;
  expected: any;
  actual: any;
  impact: string;
}

export interface ArchitectureStabilityStatus {
  dependencyViolations: number;
  layerViolations: number;
  patternViolations: number;
  complexityViolations: number;
  stabilityScore: number;
  lastAnalyzed: string;
  violations: ArchitectureViolation[];
}

export interface ArchitectureViolation {
  type: 'dependency' | 'layer' | 'pattern' | 'complexity';
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  suggestion: string;
}

export interface IntegrationEvidenceStatus {
  workflowsPassing: number;
  workflowsTotal: number;
  integrationsPassing: number;
  integrationsTotal: number;
  evidenceFreshness: number; // minutes since last update
  performanceWithinLimits: boolean;
  criticalWorkflows: WorkflowStatus[];
}

export interface WorkflowStatus {
  name: string;
  status: 'passed' | 'failed' | 'missing';
  duration: number;
  lastRun: string;
  errorMessage?: string;
}

export interface SecurityValidationStatus {
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  lastScanned: string;
  vulnerabilities: SecurityVulnerability[];
  complianceStatus: ComplianceStatus;
}

export interface SecurityVulnerability {
  type: 'secret' | 'injection' | 'validation' | 'authentication' | 'authorization' | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  remediation: string;
}

export interface ComplianceStatus {
  gdpr: boolean;
  sox: boolean;
  pci: boolean;
  lastAudit: string;
}

export interface ProductionReadinessStatus {
  environmentConfig: boolean;
  healthChecks: boolean;
  observability: boolean;
  errorHandling: boolean;
  gracefulShutdown: boolean;
  security: boolean;
  readinessScore: number;
  lastValidated: string;
  issues: ProductionIssue[];
}

export interface ProductionIssue {
  category: 'environment' | 'health' | 'observability' | 'error' | 'shutdown' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
}

export interface ContextPreservationStatus {
  adrCount: number;
  contextFiles: number;
  namingConsistency: number;
  patternAdherence: number;
  sessionContinuity: boolean;
  lastUpdated: string;
  inconsistencies: ContextInconsistency[];
}

export interface ContextInconsistency {
  type: 'naming' | 'pattern' | 'decision' | 'architecture';
  description: string;
  location: string;
  suggestion: string;
}

export interface DataIntegrityStatus {
  transactionSafety: boolean;
  businessConstraints: boolean;
  auditTrails: boolean;
  consistencyChecks: boolean;
  integrityScore: number;
  lastValidated: string;
  violations: DataIntegrityViolation[];
}

export interface DataIntegrityViolation {
  type: 'transaction' | 'constraint' | 'audit' | 'consistency' | 'race_condition';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  remediation: string;
}

export interface PromptContext {
  projectState: 'INITIAL' | 'DEVELOPMENT' | 'ENHANCEMENT' | 'DEBUG' | 'DEPLOY';
  drsScore: number;
  lastAction: string;
  timeInSession: number;
  blockers: string[];
  frameworkCompliance: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sessionMode: string;
  completionPercentage: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  purpose: string;
  conditions: (context: PromptContext) => boolean;
  template: string;
  variables: Record<string, any>;
  priority: number;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  source: 'framework_state' | 'user_input' | 'calculated';
  defaultValue?: any;
}

export interface PromptCondition {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'contains' | 'exists';
  value: any;
}