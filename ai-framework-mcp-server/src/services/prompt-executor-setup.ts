/**
 * Setup Prompts for Non-Kiro Environments
 * Critical for Claude Code and other AI tools that need to initialize the framework
 */

export class SetupPromptExecutor {
  
  /**
   * SETUP - Initialize Framework Files (For Non-Kiro Environments)
   * This is CRITICAL for Claude Code users who don't have Kiro's built-in workflow
   */
  async executeSetupPrompt(state: any, analysis: any, workingPath: string, context?: any): Promise<string> {
    const projectType = context?.projectType || 'general';
    const projectName = context?.projectName || 'unnamed-project';
    const description = context?.description || 'Project description not provided';
    
    return `
## 🏗️ AI FRAMEWORK PROJECT INITIALIZATION

**CRITICAL**: This prompt is for non-Kiro environments (Claude Code, VSCode, etc.)
Kiro users should use the built-in workflow instead.

### PROJECT CONTEXT
- **Project Name**: ${projectName}
- **Type**: ${projectType}
- **Description**: ${description}
- **Working Directory**: ${workingPath}

### PHASE 1: CREATE REQUIREMENTS.MD

Create \`ai-framework/templates/requirements.md\` with:

\`\`\`markdown
# Requirements

## Mission
${description}

## Success Criteria (ONE Specific Test)
- [ ] ${this.generateSuccessCriteria(projectType)}

## Out of Scope
- Performance optimization (unless specified)
- UI/UX improvements (unless specified)
- Refactoring beyond minimum needed

## Technical Constraints
- Maximum 5 files changed per session
- Maximum 200 lines of code per session
- Real services only (no mocks after 30 minutes)
- Contracts must remain frozen

## Acceptance Test
\`\`\`bash
# The ONE test that proves success
${this.generateAcceptanceTest(projectType)}
\`\`\`
\`\`\`

**COMMAND**:
\`\`\`bash
cat > ai-framework/templates/requirements.md << 'EOF'
[Insert content above]
EOF
\`\`\`

### PHASE 2: CREATE DESIGN.MD

Create \`ai-framework/templates/design.md\` with:

\`\`\`markdown
# Design

## Architecture Decision
${this.generateArchitectureDecision(projectType)}

## Interface Contracts
\`\`\`typescript
${this.generateInterfaceContract(projectType)}
\`\`\`

## Data Flow
1. ${this.generateDataFlow(projectType, 1)}
2. ${this.generateDataFlow(projectType, 2)}
3. ${this.generateDataFlow(projectType, 3)}

## Error Handling Strategy
- Invalid input: Return 400 with clear message
- Service unavailable: Retry with exponential backoff
- Unexpected error: Log and return 500

## Integration Points
- ${this.generateIntegrationPoints(projectType)}
\`\`\`

**COMMAND**:
\`\`\`bash
cat > ai-framework/templates/design.md << 'EOF'
[Insert content above]
EOF
\`\`\`

### PHASE 3: CREATE TASKS.MD

Create \`ai-framework/templates/tasks.md\` with:

\`\`\`markdown
# Tasks

## Current Task
${this.generateFirstTask(projectType)}

## Completion Status
- Overall: 0%
- Current Task: 0%

## Task Breakdown
1. [ ] ${this.generateTaskBreakdown(projectType, 1)} (0%)
2. [ ] ${this.generateTaskBreakdown(projectType, 2)} (0%)
3. [ ] ${this.generateTaskBreakdown(projectType, 3)} (0%)
4. [ ] ${this.generateTaskBreakdown(projectType, 4)} (0%)
5. [ ] ${this.generateTaskBreakdown(projectType, 5)} (0%)

## Definition of Done
- [ ] All tests pass
- [ ] Real service connected
- [ ] Error handling complete
- [ ] Evidence captured
- [ ] DRS ≥ 85

## Confidence Level
- Current: MEDIUM
- Reason: Framework initialized, path clear
\`\`\`

**COMMAND**:
\`\`\`bash
cat > ai-framework/templates/tasks.md << 'EOF'
[Insert content above]
EOF
\`\`\`

### PHASE 4: INITIALIZE OTHER TEMPLATES

\`\`\`bash
# Create orchestration.md
cat > ai-framework/templates/orchestration.md << 'EOF'
# Orchestration

## Session State
- Mode: INITIAL
- Start Time: $(date -Iseconds)
- Time Remaining: 120 minutes
- Contract Hash: NOT_SET (will freeze on first run)
- Pattern Selected: NONE

## Time Gates
- 30min: Real services connected [ ]
- 60min: Working demo slice [ ]
- 90min: DRS improving [ ]
- 120min: Deploy-ready [ ]

## Confidence Declaration
- Level: MEDIUM
- Reason: Fresh start with clear requirements
EOF

# Create todos.md
cat > ai-framework/templates/todos.md << 'EOF'
# TODOs

## Critical Blockers
- [ ] Select pattern from PATTERNS.md (Expires: +30min)
- [ ] Connect real service (Expires: +30min)
- [ ] Freeze contract hashes (Expires: +10min)

## Technical Debt
None yet - fresh project

## Mocks Status
- Count: 0
- Oldest: N/A
EOF

# Create progress.md
cat > ai-framework/templates/progress.md << 'EOF'
# Progress

## Overall Completion: 0%

### Component Breakdown
- Requirements Definition: 100% ✅
- Design Specification: 100% ✅
- Implementation: 0% ⏳
- Testing: 0% ⏳
- Documentation: 0% ⏳

## Next Milestone
First working integration (25% target)

## Session Progress
- This Session: 0% completed
- Time Used: 0 minutes
- Efficiency: N/A
EOF

# Create code.md
cat > ai-framework/templates/code.md << 'EOF'
# Code

## Current Implementation
No code yet - starting fresh

## Key Files
- None created yet

## Integration Status
- Real Services: NOT_CONNECTED
- Mocks: NONE
- Tests: NOT_STARTED
EOF

# Create deploy.md
cat > ai-framework/templates/deploy.md << 'EOF'
# Deploy

## Deployment Readiness
- Status: NOT_READY
- DRS Score: 0/100
- Gates Passed: 0/4

## Checklist
- [ ] DRS ≥ 85
- [ ] All tests pass
- [ ] Real services verified
- [ ] Evidence < 2 hours old
- [ ] No unexpired TODOs
- [ ] Contract hashes unchanged
- [ ] Rollback plan documented

## Rollback Plan
Not yet defined - will create before first deployment
EOF
\`\`\`

### PHASE 5: VERIFY INITIALIZATION

\`\`\`bash
# Verify all files created
ls -la ai-framework/templates/*.md | wc -l
# Should show: 10

# Freeze initial contract state
find . -name "*.contract.*" -o -name "*.interface.*" -o -name "*.api.*" | xargs sha256sum > contract-hashes.txt
echo "Contracts frozen at: $(date)" >> contract-hashes.txt

# Initialize git tracking
git add ai-framework/templates/*.md contract-hashes.txt
git commit -m "INIT: AI Framework templates created and contracts frozen"
\`\`\`

### ✅ INITIALIZATION COMPLETE

You can now run:
1. \`start\` - To begin the session
2. \`assess\` - To verify everything is set up
3. \`decide\` - To get your first action

### ⚠️ CRITICAL REMINDERS

1. **Contracts are NOW FROZEN** - No changes without CCR
2. **30-minute timer starts NOW** - Must connect real services
3. **Pattern selection REQUIRED** - Check PATTERNS.md immediately
4. **Evidence every 30 minutes** - Set a timer

The framework is now protecting you from false progress. Trust the process.
`;
  }

  /**
   * INIT_REQUIREMENTS - Create requirements.md only
   */
  async executeInitRequirementsPrompt(context?: any): Promise<string> {
    const userStory = context?.userStory || 'As a user, I want to...';
    const acceptanceCriteria = context?.acceptanceCriteria || [];
    
    return `
## 📝 INITIALIZE REQUIREMENTS

Create comprehensive requirements.md for AI Framework:

\`\`\`bash
cat > ai-framework/templates/requirements.md << 'EOF'
# Requirements

## User Story
${userStory}

## Mission
Deliver a working implementation that satisfies the user story with minimal scope.

## Success Criteria (The ONE Test That Matters)
${acceptanceCriteria.length > 0 ? 
  acceptanceCriteria.map((c: string) => `- [ ] ${c}`).join('\n') :
  `- [ ] Primary feature works end-to-end with real services
- [ ] Error cases handled gracefully
- [ ] Can be deployed to production`}

## Acceptance Test
\`\`\`bash
# This ONE test proves we're done
npm test -- --grep "accepts valid input and returns expected output"
\`\`\`

## Out of Scope (DO NOT IMPLEMENT)
- Performance optimizations (unless specified above)
- Additional features not in user story
- UI polish beyond functional
- Refactoring beyond minimum needed
- Nice-to-haves and future enhancements

## Technical Constraints
- Max 5 files changed per session
- Max 200 LOC per session  
- Real services only (no mocks after 30min)
- Contracts frozen after initialization
- Must maintain DRS ≥ 85 for deployment

## Definition of Done
- [ ] Acceptance test passes
- [ ] Real services integrated
- [ ] Error handling complete
- [ ] DRS score ≥ 85
- [ ] Evidence captured
- [ ] Can deploy to production
EOF

echo "✅ Requirements created. Next: Run 'init_design' to create design.md"
\`\`\`
`;
  }

  /**
   * INIT_DESIGN - Create design.md only
   */
  async executeInitDesignPrompt(context?: any): Promise<string> {
    const architecture = context?.architecture || 'Not specified';
    const apiDesign = context?.apiDesign || {};
    
    return `
## 🏛️ INITIALIZE DESIGN

Create design.md with architectural decisions:

\`\`\`bash
cat > ai-framework/templates/design.md << 'EOF'
# Design

## Architecture Decision
${architecture}

## Core Principles
1. Minimal viable solution first
2. Real services from the start
3. Additive changes only
4. No premature optimization

## Interface Contracts (FROZEN after init)
\`\`\`typescript
// These interfaces are FROZEN - no changes without CCR
${this.generateInterfaceFromContext(apiDesign)}
\`\`\`

## Data Flow
1. Request arrives at entry point
2. Validation against contract
3. Business logic processing
4. Real service integration
5. Response per contract

## Error Handling Strategy
- Contract violations: 400 Bad Request
- Service errors: 503 with retry guidance  
- Unexpected: 500 with correlation ID

## Integration Points
${this.generateIntegrationPointsFromContext(context)}

## Security Considerations
- Input validation on all endpoints
- Authentication required (if applicable)
- Rate limiting implemented
- Sensitive data not logged

## Performance Targets
- Response time: <1000ms (p95)
- Availability: 99.9%
- Real service timeout: 5000ms

## Rollback Strategy
- Feature flags for new functionality
- Database migrations reversible
- Previous version kept available
EOF

echo "✅ Design created. Next: Run 'init_tasks' to create tasks.md"
\`\`\`
`;
  }

  /**
   * INIT_TASKS - Create tasks.md only
   */
  async executeInitTasksPrompt(context?: any): Promise<string> {
    const feature = context?.feature || 'core functionality';
    const estimatedTasks = context?.tasks || 5;
    
    return `
## ✅ INITIALIZE TASKS

Create tasks.md with breakdown:

\`\`\`bash
cat > ai-framework/templates/tasks.md << 'EOF'
# Tasks

## Current Sprint
Implement ${feature}

## Overall Progress
- Completion: 0%
- Confidence: MEDIUM
- Blockers: None

## Task Breakdown
${this.generateTaskList(feature, estimatedTasks)}

## Current Task
Task 1: ${this.getFirstTask(feature)}
- Status: NOT_STARTED
- Completion: 0%
- Estimated Time: 30 minutes
- Pattern: TBD (select from PATTERNS.md)

## Definition of Done (Per Task)
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Real service integrated
- [ ] Error handling added
- [ ] Evidence captured

## Session Goals
- Complete at least 2 tasks
- Achieve DRS ≥ 70
- Pass 30-minute time gate
- Establish real service connection

## Confidence Declaration
- Level: MEDIUM
- Reason: Clear requirements, design complete
- Risk: Integration complexity unknown
- Mitigation: Start with simplest integration
EOF

echo "✅ Tasks created. Next: Run 'start' to begin implementation"
\`\`\`

### READY TO START

All three critical files are initialized:
✅ requirements.md - What to build
✅ design.md - How to build it  
✅ tasks.md - Steps to build it

You can now run \`start\` to begin the development session.
`;
  }

  // Helper methods for generating context-aware content
  private generateSuccessCriteria(projectType: string): string {
    const criteria: Record<string, string> = {
      'api': 'API endpoint responds with correct data format',
      'web': 'Web page loads and primary interaction works',
      'cli': 'CLI command executes and produces expected output',
      'library': 'Core function returns correct results',
      'general': 'Primary feature works end-to-end'
    };
    return criteria[projectType] || criteria['general'];
  }

  private generateAcceptanceTest(projectType: string): string {
    const tests: Record<string, string> = {
      'api': 'curl -X GET http://localhost:3000/api/endpoint | grep "expected_field"',
      'web': 'npm test -- --grep "user can complete primary action"',
      'cli': './mycli --action test | grep "Success"',
      'library': 'npm test -- --grep "core functionality"',
      'general': 'npm test -- --grep "integration"'
    };
    return tests[projectType] || tests['general'];
  }

  private generateArchitectureDecision(projectType: string): string {
    const decisions: Record<string, string> = {
      'api': 'RESTful API with JSON responses, stateless design',
      'web': 'Client-side SPA with API backend',
      'cli': 'Command-line interface with modular commands',
      'library': 'Functional core with minimal dependencies',
      'general': 'Modular design with clear separation of concerns'
    };
    return decisions[projectType] || decisions['general'];
  }

  private generateInterfaceContract(projectType: string): string {
    const contracts: Record<string, string> = {
      'api': `interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}`,
      'web': `interface UserAction {
  type: string;
  payload: any;
  timestamp: number;
}`,
      'cli': `interface CommandResult {
  exitCode: number;
  output: string;
  error?: string;
}`,
      'library': `interface ProcessResult<T> {
  result: T;
  success: boolean;
  metadata?: any;
}`,
      'general': `interface Response {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}`
    };
    return contracts[projectType] || contracts['general'];
  }

  private generateDataFlow(projectType: string, step: number): string {
    const flows: Record<string, string[]> = {
      'api': ['Client sends request', 'Server validates input', 'Business logic processes'],
      'web': ['User triggers action', 'Frontend validates', 'Backend processes'],
      'cli': ['User enters command', 'Parse arguments', 'Execute action'],
      'library': ['Function called', 'Input validated', 'Result computed'],
      'general': ['Input received', 'Processing occurs', 'Output returned']
    };
    const typeFlows = flows[projectType] || flows['general'];
    return typeFlows[step - 1] || `Step ${step}`;
  }

  private generateIntegrationPoints(projectType: string): string {
    const integrations: Record<string, string> = {
      'api': 'Database, External APIs, Authentication service',
      'web': 'API backend, Authentication, Storage',
      'cli': 'File system, Network services, System commands',
      'library': 'Host application, External dependencies',
      'general': 'External services, Data storage, Third-party APIs'
    };
    return integrations[projectType] || integrations['general'];
  }

  private generateFirstTask(projectType: string): string {
    const tasks: Record<string, string> = {
      'api': 'Set up basic endpoint with contract validation',
      'web': 'Create initial page with core component',
      'cli': 'Implement command parsing and help',
      'library': 'Implement core function with tests',
      'general': 'Create foundation with basic structure'
    };
    return tasks[projectType] || tasks['general'];
  }

  private generateTaskBreakdown(projectType: string, taskNum: number): string {
    const breakdowns: Record<string, string[]> = {
      'api': [
        'Set up endpoint structure',
        'Add input validation',
        'Implement business logic',
        'Connect to real service',
        'Add error handling'
      ],
      'web': [
        'Create component structure',
        'Add user interaction',
        'Connect to backend',
        'Handle errors',
        'Add loading states'
      ],
      'cli': [
        'Parse command arguments',
        'Validate inputs',
        'Execute core logic',
        'Format output',
        'Handle errors'
      ],
      'library': [
        'Define public API',
        'Implement core logic',
        'Add validation',
        'Write tests',
        'Document usage'
      ],
      'general': [
        'Create structure',
        'Implement core',
        'Add integration',
        'Handle errors',
        'Write tests'
      ]
    };
    const tasks = breakdowns[projectType] || breakdowns['general'];
    return tasks[taskNum - 1] || `Task ${taskNum}`;
  }

  private generateInterfaceFromContext(apiDesign: any): string {
    if (!apiDesign || Object.keys(apiDesign).length === 0) {
      return `interface Request {
  // Define your request structure
}

interface Response {
  // Define your response structure
}`;
    }
    
    // Generate from provided API design
    return JSON.stringify(apiDesign, null, 2);
  }

  private generateIntegrationPointsFromContext(context: any): string {
    if (!context?.integrations) {
      return '- Define your integration points based on requirements';
    }
    
    return context.integrations.map((i: string) => `- ${i}`).join('\n');
  }

  private generateTaskList(feature: string, count: number): string {
    const tasks = [];
    for (let i = 1; i <= count; i++) {
      tasks.push(`${i}. [ ] ${this.generateTaskName(feature, i)} (0%)`);
    }
    return tasks.join('\n');
  }

  private generateTaskName(feature: string, taskNum: number): string {
    const taskTemplates = [
      'Set up initial structure for',
      'Implement core logic for',
      'Add validation to',
      'Connect real services for',
      'Add error handling to',
      'Write tests for',
      'Document'
    ];
    
    const template = taskTemplates[taskNum - 1] || 'Continue work on';
    return `${template} ${feature}`;
  }

  private getFirstTask(feature: string): string {
    return `Set up initial structure for ${feature}`;
  }
}

// Export for use in main executor
export const setupPrompts = new SetupPromptExecutor();