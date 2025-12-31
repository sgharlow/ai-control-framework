/**
 * AI Framework MCP Server
 * Provides intelligent prompt selection and context analysis for ai-framework development
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { FrameworkStateReader } from './services/framework-state-reader.js';
import { ContextAnalyzer } from './analyzers/context-analyzer.js';
import { PromptSelector } from './selectors/prompt-selector.js';
import { EnhancedPromptExecutor } from './services/prompt-executor-enhanced.js';

class AIFrameworkMCPServer {
  private server: Server;
  private frameworkStateReader: FrameworkStateReader;
  private contextAnalyzer: ContextAnalyzer;
  private promptSelector: PromptSelector;
  private promptExecutor: EnhancedPromptExecutor;

  constructor() {
    this.server = new Server(
      {
        name: 'ai-framework-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.frameworkStateReader = new FrameworkStateReader();
    this.contextAnalyzer = new ContextAnalyzer();
    this.promptSelector = new PromptSelector();
    this.promptExecutor = new EnhancedPromptExecutor();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const promptTools = this.getPromptTools();
      const analysisTools = [
        {
          name: 'get_framework_state',
          description: '📊 Read and analyze current ai-framework project state',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to the project directory (optional)',
              },
            },
          },
        },
        {
          name: 'select_optimal_prompt',
          description: '🎯 Select the optimal ai-framework prompt based on current context',
          inputSchema: {
            type: 'object',
            properties: {
              scenario: {
                type: 'string',
                enum: ['assess', 'next-action', 'enhance', 'debug', 'deploy'],
                description: 'The development scenario you are facing',
              },
              projectPath: {
                type: 'string',
                description: 'Path to the project directory (optional)',
              },
              userIntent: {
                type: 'string',
                description: 'Additional context about what you want to accomplish (optional)',
              },
            },
            required: ['scenario'],
          },
        },
        {
          name: 'generate_contextualized_prompt',
          description: '📝 Generate a prompt with current project context injected',
          inputSchema: {
            type: 'object',
            properties: {
              promptId: {
                type: 'string',
                description: 'ID of the prompt to contextualize (e.g., P_ASSESS, Q_DECIDE)',
              },
              projectPath: {
                type: 'string',
                description: 'Path to the project directory (optional)',
              },
            },
            required: ['promptId'],
          },
        },
      ];

      return {
        tools: [...promptTools, ...analysisTools]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_framework_state':
            return await this.handleGetFrameworkState(args);

          case 'select_optimal_prompt':
            return await this.handleSelectOptimalPrompt(args);

          case 'generate_contextualized_prompt':
            return await this.handleGenerateContextualizedPrompt(args);

          // Handle all prompt executions
          case 'execute_prompt':
            return await this.handleExecutePrompt(args);

          default:
            // Check if it's a direct prompt execution
            const prompts = [
              { name: '01_assess_project', id: 'ASSESS' },
              { name: '02_resume_work', id: 'RESUME' },
              { name: '03_plan_next_action', id: 'PLAN' },
              { name: '04_decide_next_step', id: 'DECIDE' },
              { name: '05_start_session', id: 'START' },
              { name: '06_enhance_feature', id: 'ENHANCE' },
              { name: '07_debug_issue', id: 'DEBUG' },
              { name: '08_verify_compliance', id: 'VERIFY' },
              { name: '09_generate_evidence', id: 'EVIDENCE' },
              { name: '10_correct_bug', id: 'CORRECT' },
              { name: '11_set_context', id: 'SET_CONTEXT' },
              { name: '12_handoff_session', id: 'HANDOFF' },
              { name: '13_check_milestone', id: 'CHECKPOINT' },
              { name: '14_select_pattern', id: 'SELECT_PATTERN' },
              { name: '15_decide_deployment', id: 'DEPLOY_DECIDE' },
              { name: '16_deploy_project', id: 'DEPLOY' },
              { name: '17_create_pull_request', id: 'PR_READY' },
              { name: '18_handle_blocker', id: 'BLOCKED' },
              { name: '19_recovery_mode', id: 'DECLINE' },
              { name: '20_request_guidance', id: 'UNCERTAINTY' },
              { name: '21_setup_framework', id: 'SETUP' },
              { name: '22_init_requirements', id: 'INIT_REQUIREMENTS' },
              { name: '23_init_design', id: 'INIT_DESIGN' },
              { name: '24_init_tasks', id: 'INIT_TASKS' },
              { name: '25_emergency_reset', id: 'EMERGENCY' }
            ];

            const promptDef = prompts.find(p => p.name === name);
            if (promptDef) {
              return await this.handleExecutePrompt({
                promptId: promptDef.id,
                projectPath: args?.projectPath,
                ...(args || {})
              });
            }
            
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async handleGetFrameworkState(args: any) {
    const projectPath = args?.projectPath || process.cwd();

    try {
      // Read framework state
      const state = await this.frameworkStateReader.readFrameworkState(projectPath);

      // Analyze context
      const analysis = this.contextAnalyzer.analyzeContext(state);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              frameworkState: {
                drsScore: state.drsScore,
                projectState: analysis.context.projectState,
                sessionMode: state.orchestration.sessionMode,
                completionPercentage: state.tasks.completionPercentage,
                timeRemaining: state.orchestration.timeRemaining,
                confidence: analysis.confidence,
                frameworkCompliance: analysis.context.frameworkCompliance,
              },
              analysis: {
                recommendations: analysis.recommendations,
                frameworkViolations: analysis.frameworkViolations,
                criticalPath: analysis.criticalPath,
                reasoning: analysis.reasoning,
              },
              evidence: {
                lastUpdate: state.lastUpdate,
                evidenceCount: state.evidence.length,
                evidenceAge: state.evidence.length > 0 ?
                  Math.round((Date.now() - Math.max(...state.evidence.map(e => e.timestamp.getTime()))) / (1000 * 60)) :
                  999,
              }
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read framework state: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleSelectOptimalPrompt(args: any) {
    const { scenario, projectPath = process.cwd(), userIntent } = args || {};

    try {
      // Read framework state
      const state = await this.frameworkStateReader.readFrameworkState(projectPath);

      // Analyze context
      const analysis = this.contextAnalyzer.analyzeContext(state);

      // Build selection criteria
      const criteria = {
        context: analysis.context,
        frameworkViolations: analysis.frameworkViolations,
        timeConstraints: {
          remainingMinutes: state.orchestration.timeRemaining,
          sessionDuration: Math.round((Date.now() - state.orchestration.sessionStartTime.getTime()) / (1000 * 60)),
        },
        userIntent,
      };

      // Select optimal prompt
      const selection = this.promptSelector.selectPrompt(criteria);

      // Validate selection
      const validation = this.promptSelector.validateSelection(selection, criteria);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              selectedPrompt: {
                id: selection.selectedPrompt.id,
                name: selection.selectedPrompt.name,
                purpose: selection.selectedPrompt.purpose,
                template: selection.selectedPrompt.template,
              },
              selection: {
                reason: selection.selectionReason,
                confidence: selection.confidence,
                frameworkCompliance: selection.frameworkCompliance,
              },
              alternatives: selection.alternativePrompts.map(alt => ({
                id: alt.id,
                name: alt.name,
                purpose: alt.purpose,
              })),
              validation: {
                valid: validation.valid,
                errors: validation.errors,
              },
              context: {
                scenario,
                projectState: analysis.context.projectState,
                drsScore: analysis.context.drsScore,
                violations: analysis.frameworkViolations,
              }
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to select optimal prompt: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleGenerateContextualizedPrompt(args: any) {
    const { promptId, projectPath = process.cwd(), customVariables = {} } = args || {};

    try {
      // Read framework state
      const state = await this.frameworkStateReader.readFrameworkState(projectPath);

      // Analyze context
      const analysis = this.contextAnalyzer.analyzeContext(state);

      // Find the requested prompt template
      const availablePrompts = this.promptSelector.getAvailablePrompts(analysis.context);
      const promptTemplate = availablePrompts.find(p => p.id === promptId);

      if (!promptTemplate) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Prompt template not found: ${promptId}`
        );
      }

      // Generate contextualized prompt
      const contextualizedPrompt = this.generatePromptWithContext(
        promptTemplate,
        state,
        analysis,
        customVariables
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              prompt: {
                id: promptTemplate.id,
                name: promptTemplate.name,
                template: promptTemplate.template,
                contextualizedText: contextualizedPrompt,
              },
              context: {
                projectState: analysis.context.projectState,
                drsScore: state.drsScore,
                completionPercentage: state.tasks.completionPercentage,
                timeRemaining: state.orchestration.timeRemaining,
                violations: analysis.frameworkViolations,
                recommendations: analysis.recommendations.slice(0, 3), // Top 3
              },
              injectedVariables: {
                drsScore: state.drsScore,
                projectState: analysis.context.projectState,
                timeRemaining: state.orchestration.timeRemaining,
                violations: analysis.frameworkViolations.length,
                ...customVariables,
              }
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to generate contextualized prompt: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private generatePromptWithContext(
    template: any,
    state: any,
    analysis: any,
    customVariables: Record<string, any>
  ): string {
    let contextualizedPrompt = template.template;

    // Add context information
    const contextInfo = `
Current Project Context:
- DRS Score: ${state.drsScore}/100
- Project State: ${analysis.context.projectState}
- Completion: ${state.tasks.completionPercentage}%
- Time Remaining: ${state.orchestration.timeRemaining} minutes
- Session Mode: ${state.orchestration.sessionMode}
- Framework Compliance: ${analysis.context.frameworkCompliance ? 'YES' : 'NO'}
`;

    if (analysis.frameworkViolations.length > 0) {
      contextualizedPrompt += `\n\n⚠️ FRAMEWORK VIOLATIONS DETECTED:\n${analysis.frameworkViolations.map((v: string) => `- ${v}`).join('\n')}`;
    }

    if (analysis.recommendations.length > 0) {
      contextualizedPrompt += `\n\nRECOMMENDED ACTIONS:\n${analysis.recommendations.slice(0, 3).map((r: string) => `- ${r}`).join('\n')}`;
    }

    contextualizedPrompt += contextInfo;

    // Inject custom variables
    if (customVariables && typeof customVariables === 'object') {
      for (const [key, value] of Object.entries(customVariables)) {
        const placeholder = `{{${key}}}`;
        contextualizedPrompt = contextualizedPrompt.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    return contextualizedPrompt;
  }

  private async handleExecutePrompt(args: any) {
    const { promptId, projectPath, ...additionalContext } = args || {};

    try {
      const result = await this.promptExecutor.executePrompt(
        promptId,
        projectPath || process.cwd(),
        additionalContext
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to execute prompt: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private getPromptTools() {
    // Define all prompt tools with clean names
    const prompts = [
      {
        id: 'ASSESS',
        name: '01_assess_project',
        displayName: '1. Assess Project',
        description: '📊 Comprehensive project assessment - analyze health, DRS, completion, blockers',
        inputs: {}
      },
      {
        id: 'RESUME',
        name: '02_resume_work',
        displayName: '2. Resume Work',
        description: '🔄 Resume work safely - check DRS, verify contracts, identify patterns',
        inputs: {}
      },
      {
        id: 'PLAN',
        name: '03_plan_next_action',
        displayName: '3. Plan Next Action',
        description: '🎯 Plan smallest next win - choose highest DRS impact action',
        inputs: {}
      },
      {
        id: 'DECIDE',
        name: '04_decide_next_step',
        displayName: '4. Decide Next Step',
        description: '🤔 Automatic next action selection - determine optimal development step',
        inputs: {}
      },
      {
        id: 'START',
        name: '05_start_session',
        displayName: '5. Start Session',
        description: '🚀 Initialize new AI Framework session - loads orchestration.md, sets timer, declares confidence',
        inputs: {}
      },
      {
        id: 'ENHANCE',
        name: '06_enhance_feature',
        displayName: '6. Enhance Feature',
        description: '⚡ Handle new enhancements - assess scope and framework impact',
        inputs: {
          feature: {
            type: 'string',
            description: 'Feature to enhance',
            required: true
          }
        }
      },
      {
        id: 'DEBUG',
        name: '07_debug_issue',
        displayName: '7. Debug Issue',
        description: '🔧 Debug without scope creep - minimal changes with regression test',
        inputs: {
          issue: {
            type: 'string',
            description: 'Issue to debug',
            required: true
          }
        }
      },
      {
        id: 'VERIFY',
        name: '08_verify_compliance',
        displayName: '8. Verify Compliance',
        description: '✅ Run compliance audit - check all framework files for violations',
        inputs: {}
      },
      {
        id: 'EVIDENCE',
        name: '09_generate_evidence',
        displayName: '9. Generate Evidence',
        description: '📋 Generate required proof - capture real connections, correlation IDs, metrics',
        inputs: {}
      },
      {
        id: 'CORRECT',
        name: '10_correct_bug',
        displayName: '10. Correct Bug',
        description: '🛠️ Debug with minimal scope - fix bugs without expansion',
        inputs: {
          issue: {
            type: 'string',
            description: 'Issue to correct',
            required: true
          }
        }
      },
      {
        id: 'SET_CONTEXT',
        name: '11_set_context',
        displayName: '11. Set Context',
        description: '⚙️ Set rules of engagement - review orchestration.md compliance and framework rules',
        inputs: {}
      },
      {
        id: 'HANDOFF',
        name: '12_handoff_session',
        displayName: '12. Handoff Session',
        description: '📤 End session properly - generate handoff summary and next actions',
        inputs: {}
      },
      {
        id: 'CHECKPOINT',
        name: '13_check_milestone',
        displayName: '13. Check Milestone',
        description: '⏰ Validate time gates - check 30m/60m/90m/120m milestones',
        inputs: {}
      },
      {
        id: 'SELECT_PATTERN',
        name: '14_select_pattern',
        displayName: '14. Select Pattern',
        description: '🎨 Select and apply implementation pattern from PATTERNS.md',
        inputs: {
          task: {
            type: 'string',
            description: 'Task to find pattern for',
            required: true
          }
        }
      },
      {
        id: 'DEPLOY_DECIDE',
        name: '15_decide_deployment',
        displayName: '15. Decide Deployment',
        description: '🚦 Make deployment decision - assess readiness with GREEN/YELLOW/RED status',
        inputs: {}
      },
      {
        id: 'DEPLOY',
        name: '16_deploy_project',
        displayName: '16. Deploy Project',
        description: '🚀 Execute production deployment - requires DRS ≥ 85',
        inputs: {}
      },
      {
        id: 'PR_READY',
        name: '17_create_pull_request',
        displayName: '17. Create Pull Request',
        description: '📋 Generate pull request - create PR with evidence and DRS score',
        inputs: {
          pr_title: {
            type: 'string',
            description: 'Pull request title',
            required: true
          }
        }
      },
      {
        id: 'BLOCKED',
        name: '18_handle_blocker',
        displayName: '18. Handle Blocker',
        description: '🚫 Handle hard stops and blockers - diagnose and resolve',
        inputs: {
          blocker_description: {
            type: 'string',
            description: 'Description of the blocker (optional)'
          }
        }
      },
      {
        id: 'DECLINE',
        name: '19_recovery_mode',
        displayName: '19. Recovery Mode',
        description: '📉 Handle DRS degradation - recovery mode when DRS drops',
        inputs: {}
      },
      {
        id: 'UNCERTAINTY',
        name: '20_request_guidance',
        displayName: '20. Request Guidance',
        description: '❓ Request human guidance - when confidence is LOW',
        inputs: {
          uncertainty: {
            type: 'string',
            description: 'Description of uncertainty',
            required: true
          }
        }
      },
      {
        id: 'SETUP',
        name: '21_setup_framework',
        displayName: '21. Setup Framework',
        description: '🛠️ Complete framework initialization for Claude Code/VSCode (not needed for Kiro)',
        inputs: {
          projectName: {
            type: 'string',
            description: 'Name of the project',
            required: true
          }
        }
      },
      {
        id: 'INIT_REQUIREMENTS',
        name: '22_init_requirements',
        displayName: '22. Init Requirements',
        description: '📝 Initialize requirements.md only',
        inputs: {
          userStory: {
            type: 'string',
            description: 'Initial user story',
            required: true
          }
        }
      },
      {
        id: 'INIT_DESIGN',
        name: '23_init_design',
        displayName: '23. Init Design',
        description: '🎨 Initialize design.md only',
        inputs: {
          architecture: {
            type: 'string',
            description: 'Architecture approach',
            required: true
          }
        }
      },
      {
        id: 'INIT_TASKS',
        name: '24_init_tasks',
        displayName: '24. Init Tasks',
        description: '📋 Initialize tasks.md only',
        inputs: {
          feature: {
            type: 'string',
            description: 'Feature to implement',
            required: true
          }
        }
      },
      {
        id: 'EMERGENCY',
        name: '25_emergency_reset',
        displayName: '25. Emergency Reset',
        description: '⚠️ LAST RESORT: Request contract change (resets all progress)',
        inputs: {
          reason: {
            type: 'string',
            description: 'Reason for emergency contract change',
            required: true
          }
        }
      }
    ];

    // Convert to MCP tool format with clean names
    return prompts.map(prompt => ({
      name: prompt.name, // Use clean name like "01_assess_project"
      description: prompt.description, // Just use the description
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to the project directory (optional, defaults to current directory)'
          },
          ...prompt.inputs
        },
        required: prompt.inputs && Object.entries(prompt.inputs).filter(
          ([_, schema]: [string, any]) => schema.required
        ).map(([key]) => key)
      }
    }));
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AI Framework MCP Server running on stdio');
  }
}

// Start the server
const server = new AIFrameworkMCPServer();
server.run().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});