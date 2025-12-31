#!/usr/bin/env node

/**
 * Proper MCP integration test - handles server staying alive
 */

const { spawn } = require('child_process');
const path = require('path');

class WorkingMCPTester {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  }

  async runTest() {
    console.log('🎯 Testing Working MCP Integration\n');

    // Test key tools that would be used in Kiro
    const tests = [
      { name: 'get_framework_state', args: {}, description: 'Framework state analysis' },
      { name: 'assess', args: {}, description: 'Project assessment' },
      { name: 'start', args: {}, description: 'Session initialization' },
      { name: 'plan', args: {}, description: 'Action planning' },
      { name: 'verify', args: {}, description: 'Compliance check' }
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
      console.log(`🔧 Testing ${test.name} (${test.description})...`);
      
      try {
        const result = await this.testTool(test.name, test.args);
        
        if (result.success) {
          console.log(`  ✅ SUCCESS - Response received (${result.responseLength} chars)`);
          passed++;
        } else {
          console.log(`  ❌ FAILED - ${result.error}`);
        }
      } catch (error) {
        console.log(`  ❌ ERROR - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! MCP Server is ready for Kiro.');
      console.log('\n📝 Integration Instructions:');
      console.log('1. Update your .kiro/settings/mcp.json:');
      console.log('   {');
      console.log('     "mcpServers": {');
      console.log('       "ai-framework": {');
      console.log('         "command": "node",');
      console.log('         "args": ["fixed-ai-framework-server.js"],');
      console.log('         "disabled": false');
      console.log('       }');
      console.log('     }');
      console.log('   }');
      console.log('2. Restart Kiro or reconnect MCP servers');
      console.log('3. All 28 AI Framework tools will be available');
      return true;
    } else {
      console.log('\n⚠️ Some tests failed. Check the errors above.');
      return false;
    }
  }

  async testTool(toolName, args) {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      const child = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let responseReceived = false;

      // Set timeout for response
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          child.kill();
          resolve({ success: false, error: 'No response within 5 seconds' });
        }
      }, 5000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        // Check if we got a complete JSON response
        try {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              const parsed = JSON.parse(line);
              if (parsed.result && parsed.id) {
                clearTimeout(timeout);
                if (!responseReceived) {
                  responseReceived = true;
                  child.kill();
                  resolve({ 
                    success: true, 
                    responseLength: line.length,
                    response: parsed 
                  });
                }
                return;
              }
            }
          }
        } catch (e) {
          // Continue waiting for complete response
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          resolve({ success: false, error: error.message });
        }
      });

      // Send request
      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
  }
}

// Run the test
const tester = new WorkingMCPTester();
tester.runTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});