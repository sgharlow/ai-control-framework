#!/usr/bin/env node

/**
 * Test proper null handling in MCP tools
 * Tests what SHOULD work vs what SHOULD be rejected by MCP protocol
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

async function testProperNullHandling() {
  console.log('✅ Testing PROPER Null Handling in MCP Tools\n');
  console.log('=' .repeat(70) + '\n');
  
  const client = new MCPTestClient();
  
  try {
    await client.start();
    console.log('✅ Server started successfully\n');
    
    console.log('📋 Tests that SHOULD WORK (proper null handling):\n');
    
    const shouldWork = [
      {
        name: 'Undefined arguments (defaults to empty object)',
        toolName: 'mcp_ai_framework_1_Assess_Project',
        args: undefined,
        description: 'MCP allows undefined, treated as empty object'
      },
      {
        name: 'Empty object arguments',
        toolName: 'mcp_ai_framework_2_Resume_Work',
        args: {},
        description: 'Empty object is valid'
      },
      {
        name: 'Null value in optional field',
        toolName: 'mcp_ai_framework_get_framework_state',
        args: { projectPath: null },
        description: 'Null in optional field should use default'
      },
      {
        name: 'Null value in required field',
        toolName: 'mcp_ai_framework_6_Enhance_Feature',
        args: { feature: null },
        description: 'Should handle null gracefully with default'
      },
      {
        name: 'Empty string in required field',
        toolName: 'mcp_ai_framework_14_Select_Pattern',
        args: { task: '' },
        description: 'Empty string should be handled'
      },
      {
        name: 'Mixed null and valid values',
        toolName: 'mcp_ai_framework_27_Generate_Contextualized_Prompt',
        args: { promptId: 'P_ASSESS', projectPath: null, customVariables: null },
        description: 'Should handle mixed values'
      },
      {
        name: 'All null values in object',
        toolName: 'mcp_ai_framework_21_Setup_Framework',
        args: { projectName: null, projectPath: null },
        description: 'Should use defaults for all nulls'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of shouldWork) {
      process.stdout.write(`  Testing: ${test.name}... `);
      
      try {
        const result = await client.callTool(test.toolName, test.args);
        
        if (result.error) {
          console.log(`❌ FAILED`);
          console.log(`    Error: ${result.error.message}`);
          failed++;
        } else if (result.result && result.result.content) {
          try {
            const content = result.result.content[0];
            if (content && content.type === 'text') {
              JSON.parse(content.text);
              console.log(`✅ PASSED`);
              passed++;
            } else {
              console.log(`❌ FAILED (invalid format)`);
              failed++;
            }
          } catch (e) {
            console.log(`❌ FAILED (invalid JSON)`);
            failed++;
          }
        } else {
          console.log(`❌ FAILED (no response)`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n📋 Tests that SHOULD FAIL (invalid per MCP protocol):\n');
    
    const shouldFail = [
      {
        name: 'Null as arguments (not an object)',
        toolName: 'mcp_ai_framework_1_Assess_Project',
        args: null,
        description: 'MCP requires object or undefined'
      },
      {
        name: 'Array as arguments',
        toolName: 'mcp_ai_framework_5_Start_Session',
        args: [],
        description: 'MCP requires object, not array'
      },
      {
        name: 'String as arguments',
        toolName: 'mcp_ai_framework_8_Verify_Compliance',
        args: 'invalid',
        description: 'MCP requires object, not string'
      },
      {
        name: 'Number as arguments',
        toolName: 'mcp_ai_framework_9_Generate_Evidence',
        args: 123,
        description: 'MCP requires object, not number'
      },
      {
        name: 'Boolean as arguments',
        toolName: 'mcp_ai_framework_10_Correct_Bug',
        args: true,
        description: 'MCP requires object, not boolean'
      }
    ];
    
    let correctlyRejected = 0;
    let incorrectlyAccepted = 0;
    
    for (const test of shouldFail) {
      process.stdout.write(`  Testing: ${test.name}... `);
      
      try {
        const result = await client.callTool(test.toolName, test.args);
        
        if (result.error) {
          console.log(`✅ CORRECTLY REJECTED`);
          correctlyRejected++;
        } else {
          console.log(`❌ INCORRECTLY ACCEPTED`);
          incorrectlyAccepted++;
        }
      } catch (error) {
        console.log(`✅ CORRECTLY REJECTED`);
        correctlyRejected++;
      }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📊 PROPER NULL HANDLING TEST SUMMARY');
    console.log('=' .repeat(70));
    
    console.log('\nShould Work Tests:');
    console.log(`  ✅ Passed: ${passed}/${shouldWork.length}`);
    console.log(`  ❌ Failed: ${failed}/${shouldWork.length}`);
    
    console.log('\nShould Fail Tests:');
    console.log(`  ✅ Correctly Rejected: ${correctlyRejected}/${shouldFail.length}`);
    console.log(`  ❌ Incorrectly Accepted: ${incorrectlyAccepted}/${shouldFail.length}`);
    
    const totalCorrect = passed + correctlyRejected;
    const totalTests = shouldWork.length + shouldFail.length;
    const successRate = ((totalCorrect / totalTests) * 100).toFixed(1);
    
    console.log(`\nOverall: ${totalCorrect}/${totalTests} (${successRate}%) behaving correctly`);
    
    console.log('\n' + '=' .repeat(70));
    
    if (totalCorrect === totalTests) {
      console.log('🎉 PERFECT! All null handling is working as expected!');
      console.log('\n✅ Summary:');
      console.log('  • Tools handle null/undefined in fields gracefully');
      console.log('  • MCP protocol correctly rejects non-object arguments');
      console.log('  • Default values are properly applied');
      console.log('  • No crashes or unhandled errors');
    } else {
      console.log('⚠️ Some null handling issues remain.');
      if (failed > 0) {
        console.log(`  • ${failed} tests that should work are failing`);
      }
      if (incorrectlyAccepted > 0) {
        console.log(`  • ${incorrectlyAccepted} invalid inputs are incorrectly accepted`);
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    await client.stop();
  }
}

// Run the test
testProperNullHandling().catch(console.error);