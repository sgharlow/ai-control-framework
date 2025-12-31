#!/usr/bin/env node

/**
 * Test MCP tools that require parameters
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

async function testParametrizedTools() {
  console.log('🧪 Testing MCP Tools with Required Parameters\n');
  
  const client = new MCPTestClient();
  
  try {
    await client.start();
    console.log('✅ Server started successfully\n');
    
    // Test tools that require parameters
    const testCases = [
      {
        name: 'mcp_ai_framework_6_Enhance_Feature',
        args: { feature: 'Dark mode toggle' },
        description: 'Enhance Feature (with required parameter)'
      },
      {
        name: 'mcp_ai_framework_7_Debug_Issue',
        args: { issue: 'Memory leak in component' },
        description: 'Debug Issue (with required parameter)'
      },
      {
        name: 'mcp_ai_framework_14_Select_Pattern',
        args: { task: 'Implement authentication' },
        description: 'Select Pattern (with required parameter)'
      },
      {
        name: 'mcp_ai_framework_17_Create_Pull_Request',
        args: { pr_title: 'Add new feature: User profile' },
        description: 'Create Pull Request (with required parameter)'
      },
      {
        name: 'mcp_ai_framework_20_Request_Guidance',
        args: { uncertainty: 'Which database to choose for high-volume data' },
        description: 'Request Guidance (with required parameter)'
      },
      {
        name: 'mcp_ai_framework_21_Setup_Framework',
        args: { projectName: 'MyAwesomeProject' },
        description: 'Setup Framework (with required parameter)'
      },
      {
        name: 'mcp_ai_framework_22_Init_Requirements',
        args: { userStory: 'As a user, I want to login securely' },
        description: 'Init Requirements (with required parameter)'
      },
      {
        name: 'mcp_ai_framework_25_Emergency_Reset',
        args: { reason: 'Critical architecture change needed' },
        description: 'Emergency Reset (with required parameter)'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of testCases) {
      console.log(`🔧 Testing: ${test.description}`);
      console.log(`   Tool: ${test.name}`);
      console.log(`   Args: ${JSON.stringify(test.args)}`);
      
      try {
        const result = await client.callTool(test.name, test.args);
        
        if (result.error) {
          console.log(`   ❌ FAILED: ${result.error.message}`);
          failed++;
        } else if (result.result && result.result.content) {
          console.log(`   ✅ PASSED: Tool executed successfully`);
          
          // Parse and check the response
          const content = result.result.content[0];
          if (content && content.type === 'text') {
            const response = JSON.parse(content.text);
            console.log(`   📊 Response includes:`);
            if (response.promptId) console.log(`      • Prompt ID: ${response.promptId}`);
            if (response.context) console.log(`      • Context data: ✓`);
            if (response.output) console.log(`      • Output generated: ✓`);
            if (response.recommendations) console.log(`      • Recommendations: ${response.recommendations.length} items`);
          }
          passed++;
        } else {
          console.log(`   ⚠️ WARNING: Unexpected response format`);
          failed++;
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failed++;
      }
      
      console.log();
    }
    
    // Test tool without required parameter (should fail gracefully)
    console.log('🔧 Testing: Tool with missing required parameter');
    console.log('   Tool: mcp_ai_framework_6_Enhance_Feature');
    console.log('   Args: {} (missing required "feature" parameter)');
    
    try {
      const result = await client.callTool('mcp_ai_framework_6_Enhance_Feature', {});
      
      if (result.error) {
        console.log(`   ✅ EXPECTED: Tool correctly rejected missing parameter`);
        console.log(`   Error: ${result.error.message}`);
        passed++;
      } else {
        console.log(`   ❌ UNEXPECTED: Tool should have rejected missing parameter`);
        failed++;
      }
    } catch (error) {
      console.log(`   ✅ EXPECTED: ${error.message}`);
      passed++;
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 PARAMETRIZED TOOLS TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passed}/${passed + failed} (${((passed/(passed + failed)) * 100).toFixed(1)}%)`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed}/${passed + failed}`);
    }
    console.log();
    
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Tools with parameters work correctly!');
    } else {
      console.log('⚠️ Some tests failed. Please review the output above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await client.stop();
  }
}

// Run the test
testParametrizedTools().catch(console.error);