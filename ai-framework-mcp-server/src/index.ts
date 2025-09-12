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

class AIFrameworkMCPServer {
  private server: Server;
  private frameworkStateReader: FrameworkStateReader;
  private contextAnalyzer: ContextAnalyzer;
  private promptSelector: PromptSelector;

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

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_framework_state',
            description: 'Read and analyze current ai-framework project state',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the project directory (optional, defaults to current directory)',
                },
              },
            },
          },
          {
            name: 'select_optimal_prompt',
            description: 'Select the optimal ai-framework prompt based on current context',
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
            description: 'Generate a prompt with current project context injected',
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
                customVariables: {
                  type: 'object',
                  description: 'Additional variables to inject into the prompt (optional)',
                },
              },
              required: ['promptId'],
            },
          },
        ],
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

          default:
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
    const projectPath = args.projectPath || process.cwd();

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
    const { scenario, projectPath = process.cwd(), userIntent } = args;

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
    const { promptId, projectPath = process.cwd(), customVariables = {} } = args;

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
    for (const [key, value] of Object.entries(customVariables)) {
      const placeholder = `{{${key}}}`;
      contextualizedPrompt = contextualizedPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return contextualizedPrompt;
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