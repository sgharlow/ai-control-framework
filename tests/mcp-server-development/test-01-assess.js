#!/usr/bin/env node

/**
 * Isolated test for the 01_assess_project tool to identify crash root cause
 */

const { spawn } = require('child_process');
const path = require('path');

class IsolatedTester {
  constructor() {
    this.serverPath = path.join(__dirname, 'ai-framework-mcp-server', 'dist', 'index.js');
    this.minimalServerPath = path.join(__dirname, 'ai-framework-mcp-server', 'dist', 'index-minimal.js');
  }

  async testMinimalServer() {
    console.log('🧪 Testing Minimal Server Implementation...\n');
    
    // Test 1: List tools
    console.log('📋 Test 1: Listing tools...');
    const listResult = await this.getToolsList(this.minimalServerPath);
    
    if (listResult.success) {
      console.log(`  ✅ Tools listed successfully: ${listResult.toolCount} tools`);
      
      // Find the assess tool
      const assessTool = listResult.tools.find(t => 
        t.name.includes('1_Assess_Project') || t.name.includes('01_assess_project')
      );
      
      if (assessTool) {
        console.log(`  ✅ Found assess tool: ${assessTool.name}`);
        
        // Test 2: Call the assess tool
        console.log('\n🔧 Test 2: Calling assess tool...');
        const callResult = await this.testTool(this.minimalServerPath, assessTool.name);
        
        if (callResult.success) {
          console.log('  ✅ Assess tool executed successfully');
          console.log('  📊 Response preview:', JSON.stringify(callResult.response, null, 2).substring(0, 200) + '...');
        } else {
          console.log(`  ❌ Assess tool failed: ${callResult.error}`);
        }
      } else {
        console.log('  ❌ Assess tool not found in tool list');
        console.log('  Available tools:', listResult.tools.map(t => t.name).slice(0, 5));
      }
    } else {
      console.log(`  ❌ Failed to list tools: ${listResult.error}`);
    }
  }

  async testFullServer() {
    console.log('\n🧪 Testing Full Server Implementation...\n');
    
    // Test 1: List tools
    console.log('📋 Test 1: Listing tools...');
    const listResult = await this.getToolsList(this.serverPath);
    
    if (listResult.success) {
      console.log(`  ✅ Tools listed successfully: ${listResult.toolCount} tools`);
      
      // Find the assess tool
      const assessTool = listResult.tools.find(t => 
        t.name.includes('1_assess_project') || t.name.includes('01_assess_project')
      );
      
      if (assessTool) {
        console.log(`  ✅ Found assess tool: ${assessTool.name}`);
        
        // Test 2: Call the assess tool
        console.log('\n🔧 Test 2: Calling assess tool...');
        const callResult = await this.testTool(this.serverPath, assessTool.name);
        
        if (callResult.success) {
          console.log('  ✅ Assess tool executed successfully');
          console.log('  📊 Response preview:', JSON.stringify(callResult.response, null, 2).substring(0, 200) + '...');
        } else {
          console.log(`  ❌ Assess tool failed: ${callResult.error}`);
          console.log('  🔍 This is likely the root cause of the Kiro crashes');
        }
      } else {
        console.log('  ❌ Assess tool not found in tool list');
        console.log('  Available tools:', listResult.tools.map(t => t.name).slice(0, 5));
      }
    } else {
      console.log(`  ❌ Failed to list tools: ${listResult.error}`);
      console.log('  🔍 This could be the root cause of the Kiro crashes');
    }
  }

  async getToolsList(serverPath) {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };

      const child = spawn('node', [serverPath], {
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

  async testTool(serverPath, toolName) {
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

      const child = spawn('node', [serverPath], {
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
      }, 15000);

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

  async runDiagnostics() {
    console.log('🔍 AI Framework MCP Server Diagnostics\n');
    console.log('=' .repeat(60));
    
    // Test minimal server first
    await this.testMinimalServer();
    
    // Test full server
    await this.testFullServer();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60));
    console.log('If the minimal server works but the full server fails,');
    console.log('the issue is in the complex dependencies or file operations.');
    console.log('If both fail, the issue is in the basic MCP setup.');
  }
}

// Run diagnostics
const tester = new IsolatedTester();
tester.runDiagnostics().catch(error => {
  console.error('Diagnostics failed:', error);
  process.exit(1);
});