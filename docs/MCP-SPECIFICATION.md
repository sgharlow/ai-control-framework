# MCP Server Specification: AI Development Control Framework

## Overview

This specification defines how the AI Development Control Framework will be implemented as a Model Context Protocol (MCP) server, enabling any MCP-compatible AI assistant to enforce disciplined, convergent development.

## MCP Server Architecture

```javascript
{
  "name": "ai-control-framework",
  "version": "2.0.0",
  "protocol": "mcp",
  "capabilities": {
    "tools": true,
    "resources": true,
    "notifications": true,
    "state": true
  }
}
```

## Tools API

### Core Enforcement Tools

#### 1. `checkContracts`
```typescript
interface CheckContractsRequest {
  projectPath: string;
  files?: string[];  // Optional: specific files to check
}

interface CheckContractsResponse {
  status: "locked" | "violated" | "uninitialized";
  hashes: Map<string, string>;
  violations?: {
    file: string;
    expectedHash: string;
    actualHash: string;
  }[];
}
```

#### 2. `calculateDRS`
```typescript
interface CalculateDRSRequest {
  projectPath: string;
  verbose?: boolean;
}

interface CalculateDRSResponse {
  score: number;  // 0-100
  breakdown: {
    contracts: number;
    mocks: number;
    tests: number;
    errorHandling: number;
    scope: number;
    evidence: number;
    documentation: number;
  };
  status: "not_deployable" | "progressing" | "nearly_ready" | "deploy_ready";
  blockers: string[];
  recommendations: string[];
}
```

#### 3. `detectMocks`
```typescript
interface DetectMocksRequest {
  projectPath: string;
  sessionStartTime: Date;
}

interface DetectMocksResponse {
  mocksFound: number;
  locations: {
    file: string;
    line: number;
    type: string;
    age: number;  // minutes
  }[];
  violated: boolean;  // true if > 30 minutes
  timeRemaining?: number;  // minutes until violation
}
```

#### 4. `checkScope`
```typescript
interface CheckScopeRequest {
  projectPath: string;
  maxFiles?: number;  // default: 5
  maxLines?: number;  // default: 200
}

interface CheckScopeResponse {
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  netLines: number;
  withinLimits: boolean;
  filesRemaining: number;
  linesRemaining: number;
  violations?: string[];
}
```

#### 5. `captureEvidence`
```typescript
interface CaptureEvidenceRequest {
  type: "api" | "database" | "test" | "performance";
  endpoint?: string;
  method?: string;
  data?: any;
}

interface CaptureEvidenceResponse {
  evidenceId: string;
  timestamp: Date;
  file: string;
  summary: {
    success: boolean;
    responseTime?: number;
    statusCode?: number;
    errorMessage?: string;
  };
}
```

### Session Management Tools

#### 6. `initializeProject`
```typescript
interface InitializeProjectRequest {
  projectPath: string;
  config: {
    name: string;
    goal: string;
    contracts: string[];
    services: {
      api?: string;
      database?: string;
      auth?: string;
    };
    acceptanceTest: string;
    constraints?: {
      maxFiles?: number;
      maxLines?: number;
      mockTimeout?: number;
      drsTarget?: number;
    };
  };
}

interface InitializeProjectResponse {
  success: boolean;
  filesCreated: string[];
  contractsLocked: string[];
  initialDRS: number;
  selectedPattern: string;
}
```

#### 7. `canContinue`
```typescript
interface CanContinueRequest {
  projectPath: string;
}

interface CanContinueResponse {
  canContinue: boolean;
  checks: {
    contracts: "pass" | "fail" | "warning";
    scope: "pass" | "fail" | "warning";
    mocks: "pass" | "fail" | "warning";
    drs: "pass" | "fail" | "warning";
    evidence: "pass" | "fail" | "warning";
  };
  errors: string[];
  warnings: string[];
  recommendations: string[];
}
```

## Resources API

### Available Resources

```typescript
interface FrameworkResource {
  id: string;
  type: "template" | "pattern" | "script" | "documentation";
  path: string;
  content?: string;
  metadata: {
    version: string;
    lastModified: Date;
    hash: string;
  };
}
```

#### Resource Types

1. **Templates**
   - `/templates/orchestration`
   - `/templates/patterns`
   - `/templates/requirements`
   - `/templates/design`
   - `/templates/tasks`
   - `/templates/todos`
   - `/templates/progress`
   - `/templates/deploy`

2. **Patterns**
   - `/patterns/real-service-first`
   - `/patterns/contract-testing`
   - `/patterns/scope-sentinel`

3. **Current State**
   - `/state/session`
   - `/state/drs`
   - `/state/contracts`
   - `/state/evidence`

## Notifications API

### Real-time Notifications

```typescript
interface FrameworkNotification {
  type: "violation" | "warning" | "checkpoint" | "achievement";
  severity: "info" | "warning" | "error" | "critical";
  timestamp: Date;
  message: string;
  details?: any;
  requiredAction?: string;
}
```

#### Notification Types

1. **Violations**
   - `contract.violated` - Contract hash mismatch
   - `scope.exceeded` - File/line limits exceeded
   - `mock.timeout` - Mocks present after 30 minutes
   - `evidence.stale` - No evidence in 2 hours

2. **Checkpoints**
   - `gate.30min` - 30-minute checkpoint
   - `gate.60min` - 60-minute checkpoint
   - `gate.90min` - 90-minute checkpoint
   - `gate.120min` - 120-minute checkpoint

3. **Achievements**
   - `drs.milestone` - DRS reaches 50, 70, 85
   - `deploy.ready` - DRS ≥ 85
   - `session.complete` - Clean session end

## State Management

### Session State

```typescript
interface SessionState {
  id: string;
  startTime: Date;
  projectPath: string;
  mission: {
    goal: string;
    pattern: string;
    scope: {
      maxFiles: number;
      maxLines: number;
    };
  };
  contracts: {
    files: string[];
    hashes: Map<string, string>;
    status: "locked" | "violated" | "uninitialized";
  };
  services: {
    api?: { url: string; lastCall?: Date; };
    database?: { url: string; lastCall?: Date; };
    auth?: { url: string; lastCall?: Date; };
  };
  metrics: {
    drs: number;
    filesChanged: number;
    linesAdded: number;
    timeElapsed: number;
    evidenceCount: number;
  };
  confidence: "high" | "medium" | "low" | "blocked";
}
```

### Persistent State

```typescript
interface ProjectState {
  version: string;
  created: Date;
  lastModified: Date;
  sessions: SessionState[];
  drsHistory: { timestamp: Date; score: number; }[];
  patterns: {
    used: Map<string, number>;  // pattern -> usage count
    success: Map<string, number>;  // pattern -> success rate
  };
  statistics: {
    totalSessions: number;
    averageDRS: number;
    deployments: number;
    violations: number;
  };
}
```

## MCP Implementation Example

```javascript
// mcp-server.js
const { MCPServer } = require('@anthropic/mcp');
const FrameworkController = require('./framework-controller');

class AIControlMCPServer extends MCPServer {
  constructor() {
    super({
      name: 'ai-control-framework',
      version: '2.0.0'
    });
    
    this.controller = new FrameworkController();
    this.registerTools();
    this.registerResources();
    this.setupNotifications();
  }

  registerTools() {
    // Contract checking
    this.addTool('checkContracts', async (params) => {
      return await this.controller.checkContracts(params);
    });

    // DRS calculation
    this.addTool('calculateDRS', async (params) => {
      return await this.controller.calculateDRS(params);
    });

    // Mock detection
    this.addTool('detectMocks', async (params) => {
      return await this.controller.detectMocks(params);
    });

    // Scope checking
    this.addTool('checkScope', async (params) => {
      return await this.controller.checkScope(params);
    });

    // Evidence capture
    this.addTool('captureEvidence', async (params) => {
      return await this.controller.captureEvidence(params);
    });
  }

  registerResources() {
    // Templates
    this.addResource('/templates/orchestration', {
      type: 'template',
      content: this.controller.getTemplate('orchestration')
    });

    // Current state
    this.addResource('/state/session', {
      type: 'state',
      content: this.controller.getSessionState()
    });

    // Patterns
    this.addResource('/patterns/real-service-first', {
      type: 'pattern',
      content: this.controller.getPattern('real-service-first')
    });
  }

  setupNotifications() {
    // Contract violations
    this.controller.on('contract.violated', (data) => {
      this.notify({
        type: 'violation',
        severity: 'critical',
        message: 'Contract violation detected',
        details: data,
        requiredAction: 'Run approve-contract-change.sh or revert'
      });
    });

    // Mock timeout
    this.controller.on('mock.timeout', (data) => {
      this.notify({
        type: 'violation',
        severity: 'error',
        message: 'Mocks detected after 30 minutes',
        details: data,
        requiredAction: 'Replace mocks with real service calls'
      });
    });

    // DRS milestones
    this.controller.on('drs.milestone', (data) => {
      this.notify({
        type: 'achievement',
        severity: 'info',
        message: `DRS reached ${data.score}`,
        details: data
      });
    });
  }

  // Automatic behaviors (run periodically)
  startAutomaticBehaviors() {
    // 10-minute checks
    setInterval(() => {
      this.controller.runAutomaticChecks();
    }, 10 * 60 * 1000);

    // 30-minute evidence
    setInterval(() => {
      this.controller.captureAutomaticEvidence();
    }, 30 * 60 * 1000);

    // Time gate validation
    this.scheduleTimeGates();
  }
}

// Start server
const server = new AIControlMCPServer();
server.start({
  port: 3000,
  host: 'localhost'
});
```

## Client Integration

### Claude Integration
```javascript
// In Claude's configuration
{
  "mcp_servers": {
    "ai-control": {
      "url": "http://localhost:3000",
      "auto_connect": true,
      "required_tools": [
        "checkContracts",
        "calculateDRS",
        "detectMocks",
        "checkScope"
      ],
      "notification_handler": "strict"  // Stop on violations
    }
  }
}
```

### Usage in Claude
```javascript
// Claude automatically uses MCP tools
const contractStatus = await mcp.tools.checkContracts({
  projectPath: process.cwd()
});

if (contractStatus.status === 'violated') {
  // Framework automatically stops execution
  throw new Error('Contract violation - cannot proceed');
}

const drs = await mcp.tools.calculateDRS({
  projectPath: process.cwd(),
  verbose: true
});

if (drs.score >= 85) {
  console.log('Ready to deploy!');
}
```

## Benefits of MCP Implementation

### For Users
1. **Automatic Integration** - No manual prompt copying
2. **Real-time Feedback** - Instant violation notifications
3. **Cross-IDE Support** - Works with any MCP-compatible editor
4. **Team Synchronization** - Shared framework state

### For AI Assistants
1. **Native Tool Access** - Direct function calls vs. shell scripts
2. **State Awareness** - Persistent session tracking
3. **Pattern Learning** - Success rates improve over time
4. **Automatic Behaviors** - No need for manual checking

### For Organizations
1. **Centralized Control** - Single MCP server for all developers
2. **Audit Trail** - Complete history of all framework actions
3. **Metrics Dashboard** - Real-time team productivity
4. **Compliance** - Enforce organizational standards

## Migration Path

### Phase 1: Current (Shell Scripts)
- Manual prompt usage
- Local file-based state
- Shell script execution

### Phase 2: MCP Wrapper (v1.5)
- MCP server wraps shell scripts
- Backward compatible
- Optional MCP usage

### Phase 3: Native MCP (v2.0)
- Full MCP implementation
- Cloud-ready architecture
- Enterprise features

## Implementation Timeline

- **Q1 2024**: MCP specification finalized
- **Q2 2024**: Basic MCP server (wrapping scripts)
- **Q3 2024**: Native MCP implementation
- **Q4 2024**: Enterprise features (team sync, analytics)

---

*This specification enables the AI Development Control Framework to evolve from local scripts to a cloud-native MCP service while maintaining backward compatibility.*