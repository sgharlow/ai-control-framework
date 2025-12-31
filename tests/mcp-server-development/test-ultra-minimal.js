#!/usr/bin/env node

/**
 * Test the ultra minimal version
 */

const { spawn } = require('child_process');
const path = require('path');

class UltraMinimalTester {
  constructor() {
    this.serverPath = path.join(__dirname, 'ai-framework-mcp-server', 'dist', 'index-ultra-minimal.js');
  }

  async testUltraMinimal() {
    console.log('🔬 Testing Ultra Minimal AI Framework MCP Server\n');
    
    // Test 1: List tools
    console.log('📋 Test 1: Listing tools...');
    const listResult = await this.getToolsList();
    
    if (listResult.success) {
      console.log(`  ✅ Tools listed successfully: ${listResult.toolCount} tools`);
      console.log(`  📊 Tools: ${listResult.tools.map(t => t.name).join(', ')}`);
      
      // Test 2: Call the assess tool
      console.log('\n🔧 Test 2: Calling 01_assess_project...');
      const callResult = await this.testTool('01_assess_project');
      
      if (callResult.success) {
        console.log('  ✅ 01_assess_project executed successfully');
        console.log('  📊 Response:', JSON.stringify(callResult.response, null, 2));
        
        console.log('\n🎉 ULTRA MINIMAL VERSION WORKS!');
        console.log('✅ Ready for Kiro integration testing');
        return true;
      } else {
        console.log(`  ❌ 01_assess_project failed: ${callResult.error}`);
        return false;
      }
    } else {
      console.log(`  ❌ Failed to list tools: ${listResult.error}`);
      return false;
    }
  }

  async getToolsList() {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };

      const child = spawn('node', [this.serverPath], {
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
      }, 5000);

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

      const child = spawn('node', [this.serverPath], {
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
      });

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
const tester = new UltraMinimalTester();
tester.testUltraMinimal().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});