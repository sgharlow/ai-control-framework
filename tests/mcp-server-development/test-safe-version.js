#!/usr/bin/env node

/**
 * Test the safe version of the AI Framework MCP server
 */

const { spawn } = require('child_process');
const path = require('path');

class SafeVersionTester {
  constructor() {
    this.safeServerPath = path.join(__dirname, 'ai-framework-mcp-server', 'dist', 'index-safe.js');
  }

  async testSafeVersion() {
    console.log('🛡️ Testing Safe AI Framework MCP Server\n');
    
    // Test 1: List tools
    console.log('📋 Test 1: Listing tools...');
    const listResult = await this.getToolsList();
    
    if (listResult.success) {
      console.log(`  ✅ Tools listed successfully: ${listResult.toolCount} tools`);
      
      // Find the assess tool
      const assessTool = listResult.tools.find(t => t.name === '01_assess_project');
      
      if (assessTool) {
        console.log(`  ✅ Found assess tool: ${assessTool.name}`);
        
        // Test 2: Call the assess tool
        console.log('\n🔧 Test 2: Calling 01_assess_project...');
        const callResult = await this.testTool('01_assess_project');
        
        if (callResult.success) {
          console.log('  ✅ 01_assess_project executed successfully');
          console.log('  📊 Response preview:', JSON.stringify(callResult.response, null, 2).substring(0, 300) + '...');
          
          // Test 3: Call multiple tools rapidly (stress test)
          console.log('\n⚡ Test 3: Rapid tool calls (stress test)...');
          const stressResults = await this.stressTest();
          console.log(`  ✅ Stress test completed: ${stressResults.successful}/${stressResults.total} calls successful`);
          
          if (stressResults.successful === stressResults.total) {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('✅ Safe version is ready for Kiro integration');
            return true;
          } else {
            console.log('\n⚠️ Some stress test calls failed');
            return false;
          }
        } else {
          console.log(`  ❌ 01_assess_project failed: ${callResult.error}`);
          return false;
        }
      } else {
        console.log('  ❌ 01_assess_project not found in tool list');
        return false;
      }
    } else {
      console.log(`  ❌ Failed to list tools: ${listResult.error}`);
      return false;
    }
  }

  async stressTest() {
    const tools = ['01_assess_project', '02_resume_work', '03_plan_next_action'];
    const promises = [];
    
    // Make 6 rapid calls (2 of each tool)
    for (let i = 0; i < 2; i++) {
      for (const tool of tools) {
        promises.push(this.testTool(tool));
      }
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    
    return {
      total: results.length,
      successful,
      failed: results.length - successful
    };
  }

  async getToolsList() {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };

      const child = spawn('node', [this.safeServerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let responseReceived = false;

      const timeout = setTimeout(() => {
        if (!responseReceived) {
          child.kill();
          resolve({ success: false, error: 'Timeout waiting for tools list' });
        }
      }, 10000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        try {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.trim() && line.includes('"result"')) {
              const parsed = JSON.parse(line);
              if (parsed.result && parsed.result.tools) {
                clearTimeout(timeout);
                if (!responseReceived) {
                  responseReceived = true;
                  child.kill();
                  resolve({ 
                    success: true, 
                    tools: parsed.result.tools,
                    toolCount: parsed.result.tools.length 
                  });
                }
                return;
              }
            }
          }
        } catch (e) {
          // Continue waiting
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          resolve({ success: false, error: `Process error: ${error.message}` });
        }
      });

      child.on('exit', (code) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          if (code !== 0) {
            resolve({ success: false, error: `Process exited with code ${code}. Stderr: ${stderr}` });
          } else {
            resolve({ success: false, error: 'Process exited without sending response' });
          }
        }
      });

      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
  }

  async testTool(toolName) {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: {}
        }
      };

      const child = spawn('node', [this.safeServerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let responseReceived = false;

      const timeout = setTimeout(() => {
        if (!responseReceived) {
          child.kill();
          resolve({ success: false, error: 'Timeout waiting for tool response' });
        }
      }, 5000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        try {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.trim() && (line.includes('"result"') || line.includes('"error"'))) {
              clearTimeout(timeout);
              if (!responseReceived) {
                responseReceived = true;
                child.kill();
                
                const parsed = JSON.parse(line);
                if (parsed.result) {
                  resolve({ success: true, response: parsed.result });
                } else if (parsed.error) {
                  resolve({ success: false, error: parsed.error.message || JSON.stringify(parsed.error) });
                } else {
                  resolve({ success: false, error: 'Invalid response format' });
                }
              }
              return;
            }
          }
        } catch (e) {
          // Continue waiting
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          resolve({ success: false, error: `Process error: ${error.message}` });
        }
      });

      child.on('exit', (code) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          if (code !== 0) {
            resolve({ success: false, error: `Process exited with code ${code}. Stderr: ${stderr}` });
          } else {
            resolve({ success: false, error: 'Process exited without sending response' });
          }
        }
      });

      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
  }
}

// Run the test
const tester = new SafeVersionTester();
tester.testSafeVersion().then(success => {
  if (success) {
    console.log('\n🎯 RECOMMENDATION: Update MCP config to use the safe version');
    console.log('   Change "index.js" to "index-safe.js" in .kiro/settings/mcp.json');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});