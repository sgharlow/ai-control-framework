#!/usr/bin/env node

/**
 * Test key AI Framework tools that would be commonly used in Kiro
 */

const { spawn } = require('child_process');
const path = require('path');

class KiroIntegrationTester {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  }

  async runIntegrationTest() {
    console.log('🎯 Testing Kiro Integration - Key AI Framework Tools\n');

    const keyTests = [
      {
        name: 'assess',
        description: 'Project health assessment',
        args: {}
      },
      {
        name: 'start',
        description: 'Session initialization',
        args: {}
      },
      {
        name: 'plan',
        description: 'Next action planning',
        args: {}
      },
      {
        name: 'enhance',
        description: 'Feature enhancement',
        args: { feature: 'user authentication system' }
      },
      {
        name: 'verify',
        description: 'Framework compliance check',
        args: {}
      },
      {
        name: 'evidence',
        description: 'Evidence generation',
        args: {}
      }
    ];

    let passed = 0;
    let total = keyTests.length;

    for (const test of keyTests) {
      console.log(`🔧 Testing ${test.name} (${test.description})...`);
      
      try {
        const result = await this.testTool(test.name, test.args);
        
        if (result.success) {
          console.log(`  ✅ ${test.name}: SUCCESS`);
          
          // Validate response structure
          if (result.output && result.output.includes('"content"')) {
            console.log(`  📊 Response contains valid MCP content structure`);
          }
          
          passed++;
        } else {
          console.log(`  ❌ ${test.name}: FAILED - ${result.error}`);
        }
      } catch (error) {
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
      }
      
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📋 KIRO INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Tests Passed: ${passed}/${total}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (passed === total) {
      console.log('\n🎉 ALL KEY TOOLS WORKING! Ready for Kiro integration.');
      console.log('\n📝 Next Steps:');
      console.log('  1. Update your .kiro/settings/mcp.json to use fixed-ai-framework-server.js');
      console.log('  2. Restart Kiro or reconnect MCP servers');
      console.log('  3. Test tools in Kiro using the MCP panel');
    } else {
      console.log('\n⚠️ Some key tools failed. Check the errors above.');
    }

    return passed === total;
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
      let stderr = '';
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill();
          resolve({ success: false, error: 'Timeout (8s)' });
        }
      }, 8000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          
          if (stdout.includes('"content"') || stdout.includes('"result"')) {
            resolve({ success: true, output: stdout });
          } else {
            resolve({ 
              success: false, 
              error: `No valid response. Code: ${code}, stderr: ${stderr.slice(0, 100)}` 
            });
          }
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          resolve({ success: false, error: error.message });
        }
      });

      // Send the MCP request
      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
  }
}

// Run the integration test
const tester = new KiroIntegrationTester();
tester.runIntegrationTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});