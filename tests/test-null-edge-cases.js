#!/usr/bin/env node

/**
 * Test MCP tools with null, undefined, and edge case parameters
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

  async callTool(name, args) {
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

async function testNullEdgeCases() {
  console.log('🧪 Testing MCP Tools with NULL/UNDEFINED/EDGE CASES\n');
  console.log('=' .repeat(70) + '\n');
  
  const client = new MCPTestClient();
  
  try {
    await client.start();
    console.log('✅ Server started successfully\n');
    
    const testCases = [
      {
        name: 'Test 1: Tool with null arguments',
        toolName: 'mcp_ai_framework_1_Assess_Project',
        args: null,
        expectSuccess: true,
        description: 'Should handle null args gracefully'
      },
      {
        name: 'Test 2: Tool with undefined arguments',
        toolName: 'mcp_ai_framework_2_Resume_Work',
        args: undefined,
        expectSuccess: true,
        description: 'Should handle undefined args gracefully'
      },
      {
        name: 'Test 3: Tool with empty object',
        toolName: 'mcp_ai_framework_3_Plan_Next_Action',
        args: {},
        expectSuccess: true,
        description: 'Should handle empty object args'
      },
      {
        name: 'Test 4: Tool with null in required field',
        toolName: 'mcp_ai_framework_6_Enhance_Feature',
        args: { feature: null },
        expectSuccess: true,
        description: 'Should handle null in required field'
      },
      {
        name: 'Test 5: Tool with undefined in required field',
        toolName: 'mcp_ai_framework_7_Debug_Issue',
        args: { issue: undefined },
        expectSuccess: true,
        description: 'Should handle undefined in required field'
      },
      {
        name: 'Test 6: Tool with empty string in required field',
        toolName: 'mcp_ai_framework_14_Select_Pattern',
        args: { task: '' },
        expectSuccess: true,
        description: 'Should handle empty string in required field'
      },
      {
        name: 'Test 7: Tool with projectPath as null',
        toolName: 'mcp_ai_framework_get_framework_state',
        args: { projectPath: null },
        expectSuccess: true,
        description: 'Should fallback to process.cwd() when projectPath is null'
      },
      {
        name: 'Test 8: Tool with all nulls',
        toolName: 'mcp_ai_framework_21_Setup_Framework',
        args: { projectName: null, projectPath: null },
        expectSuccess: true,
        description: 'Should handle all null parameters'
      },
      {
        name: 'Test 9: Tool with mixed null/valid values',
        toolName: 'mcp_ai_framework_27_Generate_Contextualized_Prompt',
        args: { promptId: 'P_ASSESS', projectPath: null, customVariables: null },
        expectSuccess: true,
        description: 'Should handle mixed null and valid values'
      },
      {
        name: 'Test 10: Tool with array instead of object',
        toolName: 'mcp_ai_framework_5_Start_Session',
        args: [],
        expectSuccess: true,
        description: 'Should handle array passed as args'
      },
      {
        name: 'Test 11: Tool with string instead of object',
        toolName: 'mcp_ai_framework_8_Verify_Compliance',
        args: 'invalid',
        expectSuccess: true,
        description: 'Should handle string passed as args'
      },
      {
        name: 'Test 12: Tool with number instead of object',
        toolName: 'mcp_ai_framework_9_Generate_Evidence',
        args: 123,
        expectSuccess: true,
        description: 'Should handle number passed as args'
      },
      {
        name: 'Test 13: Tool with boolean instead of object',
        toolName: 'mcp_ai_framework_10_Correct_Bug',
        args: true,
        expectSuccess: true,
        description: 'Should handle boolean passed as args'
      },
      {
        name: 'Test 14: Select Optimal Prompt with null scenario',
        toolName: 'mcp_ai_framework_26_Select_Optimal_Prompt',
        args: { scenario: null },
        expectSuccess: true,
        description: 'Should handle null scenario'
      },
      {
        name: 'Test 15: Very long string in parameter',
        toolName: 'mcp_ai_framework_20_Request_Guidance',
        args: { uncertainty: 'x'.repeat(10000) },
        expectSuccess: true,
        description: 'Should handle very long strings'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    const failures = [];
    
    for (const test of testCases) {
      console.log(`🔧 ${test.name}`);
      console.log(`   Tool: ${test.toolName}`);
      console.log(`   Args: ${JSON.stringify(test.args)}`);
      console.log(`   Expected: ${test.expectSuccess ? 'Should work' : 'Should fail gracefully'}`);
      
      try {
        const result = await client.callTool(test.toolName, test.args);
        
        if (result.error) {
          if (!test.expectSuccess) {
            console.log(`   ✅ PASSED: Failed as expected - ${result.error.message}`);
            passed++;
          } else {
            console.log(`   ❌ FAILED: Unexpected error - ${result.error.message}`);
            failed++;
            failures.push({ test: test.name, error: result.error.message });
          }
        } else if (result.result && result.result.content) {
          if (test.expectSuccess) {
            // Verify response is valid JSON
            try {
              const content = result.result.content[0];
              if (content && content.type === 'text') {
                JSON.parse(content.text);
                console.log(`   ✅ PASSED: Handled edge case gracefully`);
                passed++;
              } else {
                console.log(`   ❌ FAILED: Invalid response format`);
                failed++;
                failures.push({ test: test.name, error: 'Invalid response format' });
              }
            } catch (e) {
              console.log(`   ❌ FAILED: Invalid JSON in response`);
              failed++;
              failures.push({ test: test.name, error: 'Invalid JSON in response' });
            }
          } else {
            console.log(`   ❌ FAILED: Should have failed but succeeded`);
            failed++;
            failures.push({ test: test.name, error: 'Should have failed but succeeded' });
          }
        } else {
          console.log(`   ❌ FAILED: No response received`);
          failed++;
          failures.push({ test: test.name, error: 'No response received' });
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failed++;
        failures.push({ test: test.name, error: error.message });
      }
      
      console.log();
    }
    
    // Summary
    console.log('=' .repeat(70));
    console.log('📊 NULL/EDGE CASES TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log(`✅ Passed: ${passed}/${testCases.length} (${((passed/testCases.length) * 100).toFixed(1)}%)`);
    
    if (failed > 0) {
      console.log(`❌ Failed: ${failed}/${testCases.length}\n`);
      console.log('Failed tests:');
      failures.forEach(f => {
        console.log(`  • ${f.test}`);
        console.log(`    Error: ${f.error}`);
      });
    }
    
    console.log('\n' + '=' .repeat(70));
    
    if (failed === 0) {
      console.log('🎉 ALL NULL/EDGE CASE TESTS PASSED!');
      console.log('✅ Tools handle null, undefined, and edge cases gracefully');
    } else {
      console.log('⚠️ Some edge cases are not handled properly.');
      console.log('   Please review and add more defensive programming.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    await client.stop();
  }
}

// Run the test
testNullEdgeCases().catch(console.error);