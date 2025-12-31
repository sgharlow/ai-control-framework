#!/usr/bin/env node

/**
 * Comprehensive test for all 28 AI Framework MCP tools
 */

const { spawn } = require('child_process');
const path = require('path');

class MCPTestClient {
  constructor() {
    this.server = null;
    this.buffer = '';
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  async start() {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, '..', 'ai-framework-mcp-server', 'dist', 'index.js');
      
      this.server = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      this.server.stdout.on('data', (data) => {
        this.buffer += data.toString();
        this.processBuffer();
      });

      this.server.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('AI Framework MCP Server running')) {
          resolve();
        }
      });

      this.server.on('error', reject);
      
      setTimeout(() => {
        reject(new Error('Server failed to start within timeout'));
      }, 5000);
    });
  }

  processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          if (message.id !== undefined && this.pendingRequests.has(message.id)) {
            const { resolve } = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            resolve(message);
          }
        } catch (e) {
          // Ignore non-JSON lines
        }
      }
    }
  }

  async sendRequest(method, params = {}) {
    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      this.server.stdin.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 10000);
    });
  }

  async listTools() {
    return this.sendRequest('tools/list');
  }

  async callTool(name, args = {}) {
    return this.sendRequest('tools/call', {
      name,
      arguments: args
    });
  }

  async stop() {
    if (this.server) {
      this.server.kill();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

async function testAll28Tools() {
  console.log('🧪 Comprehensive Test of All 28 AI Framework MCP Tools\n');
  console.log('=' .repeat(70) + '\n');
  
  const client = new MCPTestClient();
  
  try {
    await client.start();
    console.log('✅ Server started successfully\n');
    
    // First, get the list of all tools
    const toolsResponse = await client.listTools();
    const allTools = toolsResponse.result?.tools || [];
    console.log(`📋 Total tools found: ${allTools.length}\n`);
    
    // Define all 28 expected tools with their test parameters
    const allExpectedTools = [
      // Core tool
      { name: 'mcp_ai_framework_get_framework_state', args: {}, description: 'Get Framework State' },
      
      // 25 numbered prompt tools
      { name: 'mcp_ai_framework_1_Assess_Project', args: {}, description: '1. Assess Project' },
      { name: 'mcp_ai_framework_2_Resume_Work', args: {}, description: '2. Resume Work' },
      { name: 'mcp_ai_framework_3_Plan_Next_Action', args: {}, description: '3. Plan Next Action' },
      { name: 'mcp_ai_framework_4_Decide_Next_Step', args: {}, description: '4. Decide Next Step' },
      { name: 'mcp_ai_framework_5_Start_Session', args: {}, description: '5. Start Session' },
      { name: 'mcp_ai_framework_6_Enhance_Feature', args: { feature: 'Test feature' }, description: '6. Enhance Feature' },
      { name: 'mcp_ai_framework_7_Debug_Issue', args: { issue: 'Test issue' }, description: '7. Debug Issue' },
      { name: 'mcp_ai_framework_8_Verify_Compliance', args: {}, description: '8. Verify Compliance' },
      { name: 'mcp_ai_framework_9_Generate_Evidence', args: {}, description: '9. Generate Evidence' },
      { name: 'mcp_ai_framework_10_Correct_Bug', args: { issue: 'Test bug' }, description: '10. Correct Bug' },
      { name: 'mcp_ai_framework_11_Set_Context', args: {}, description: '11. Set Context' },
      { name: 'mcp_ai_framework_12_Handoff_Session', args: {}, description: '12. Handoff Session' },
      { name: 'mcp_ai_framework_13_Check_Milestone', args: {}, description: '13. Check Milestone' },
      { name: 'mcp_ai_framework_14_Select_Pattern', args: { task: 'Test task' }, description: '14. Select Pattern' },
      { name: 'mcp_ai_framework_15_Decide_Deployment', args: {}, description: '15. Decide Deployment' },
      { name: 'mcp_ai_framework_16_Deploy_Project', args: {}, description: '16. Deploy Project' },
      { name: 'mcp_ai_framework_17_Create_Pull_Request', args: { pr_title: 'Test PR' }, description: '17. Create Pull Request' },
      { name: 'mcp_ai_framework_18_Handle_Blocker', args: {}, description: '18. Handle Blocker' },
      { name: 'mcp_ai_framework_19_Recovery_Mode', args: {}, description: '19. Recovery Mode' },
      { name: 'mcp_ai_framework_20_Request_Guidance', args: { uncertainty: 'Test uncertainty' }, description: '20. Request Guidance' },
      { name: 'mcp_ai_framework_21_Setup_Framework', args: { projectName: 'TestProject' }, description: '21. Setup Framework' },
      { name: 'mcp_ai_framework_22_Init_Requirements', args: { userStory: 'Test story' }, description: '22. Init Requirements' },
      { name: 'mcp_ai_framework_23_Init_Design', args: { architecture: 'Test architecture' }, description: '23. Init Design' },
      { name: 'mcp_ai_framework_24_Init_Tasks', args: { feature: 'Test feature' }, description: '24. Init Tasks' },
      { name: 'mcp_ai_framework_25_Emergency_Reset', args: { reason: 'Test reason' }, description: '25. Emergency Reset' },
      
      // 2 advanced analysis tools
      { name: 'mcp_ai_framework_26_Select_Optimal_Prompt', args: { scenario: 'assess' }, description: '26. Select Optimal Prompt' },
      { name: 'mcp_ai_framework_27_Generate_Contextualized_Prompt', args: { promptId: 'P_ASSESS' }, description: '27. Generate Contextualized Prompt' }
    ];
    
    console.log(`🎯 Testing all ${allExpectedTools.length} expected tools...\n`);
    
    let passed = 0;
    let failed = 0;
    const errors = [];
    
    // Test each tool
    for (const tool of allExpectedTools) {
      process.stdout.write(`Testing ${tool.description}... `);
      
      try {
        const result = await client.callTool(tool.name, tool.args);
        
        if (result.error) {
          console.log(`❌ FAILED`);
          console.log(`   Error: ${result.error.message}`);
          failed++;
          errors.push({ tool: tool.description, error: result.error.message });
        } else if (result.result && result.result.content) {
          // Verify the response structure
          const content = result.result.content[0];
          if (content && content.type === 'text') {
            try {
              const response = JSON.parse(content.text);
              
              // Check for expected fields based on tool type
              let valid = true;
              let missingFields = [];
              
              if (tool.name.includes('Select_Optimal_Prompt')) {
                // Check for prompt selection response
                if (!response.selectedPrompt) missingFields.push('selectedPrompt');
                if (!response.selection) missingFields.push('selection');
              } else if (tool.name.includes('Generate_Contextualized_Prompt')) {
                // Check for contextualized prompt response
                if (!response.prompt) missingFields.push('prompt');
                if (!response.context) missingFields.push('context');
              } else if (tool.name === 'mcp_ai_framework_get_framework_state') {
                // Check for framework state response
                if (!response.frameworkState) missingFields.push('frameworkState');
                if (!response.analysis) missingFields.push('analysis');
              } else {
                // Check for standard prompt execution response
                if (!response.promptId && !response.promptName) missingFields.push('promptId/promptName');
                if (!response.output) missingFields.push('output');
                if (!response.context) missingFields.push('context');
              }
              
              if (missingFields.length > 0) {
                console.log(`⚠️ WARNING`);
                console.log(`   Missing fields: ${missingFields.join(', ')}`);
                failed++;
                errors.push({ tool: tool.description, error: `Missing fields: ${missingFields.join(', ')}` });
              } else {
                console.log(`✅ PASSED`);
                passed++;
              }
            } catch (parseError) {
              console.log(`❌ FAILED`);
              console.log(`   Error: Invalid JSON response`);
              failed++;
              errors.push({ tool: tool.description, error: 'Invalid JSON response' });
            }
          } else {
            console.log(`❌ FAILED`);
            console.log(`   Error: Unexpected response format`);
            failed++;
            errors.push({ tool: tool.description, error: 'Unexpected response format' });
          }
        } else {
          console.log(`❌ FAILED`);
          console.log(`   Error: No response received`);
          failed++;
          errors.push({ tool: tool.description, error: 'No response received' });
        }
      } catch (error) {
        console.log(`❌ ERROR`);
        console.log(`   Error: ${error.message}`);
        failed++;
        errors.push({ tool: tool.description, error: error.message });
      }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log(`✅ Passed: ${passed}/${allExpectedTools.length} (${((passed/allExpectedTools.length) * 100).toFixed(1)}%)`);
    
    if (failed > 0) {
      console.log(`❌ Failed: ${failed}/${allExpectedTools.length}\n`);
      console.log('Failed tools:');
      errors.forEach(e => {
        console.log(`  • ${e.tool}: ${e.error}`);
      });
    }
    
    console.log('\n' + '=' .repeat(70));
    
    if (failed === 0) {
      console.log('🎉 ALL 28 TOOLS PASSED! Everything is working correctly!');
    } else {
      console.log('⚠️ Some tools failed. Please review the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    await client.stop();
  }
}

// Run the comprehensive test
testAll28Tools().catch(console.error);