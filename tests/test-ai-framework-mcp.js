#!/usr/bin/env node

/**
 * Automated Test Suite for AI Framework MCP Server
 * Tests all MCP tools to ensure they don't crash and return valid responses
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
    this.timeout = 10000; // 10 second timeout per test
  }

  async runTests() {
    console.log('🧪 Starting AI Framework MCP Server Test Suite\n');
    
    try {
      // Test 1: Server startup
      await this.testServerStartup();
      
      // Test 2: Basic MCP protocol
      await this.testMCPProtocol();
      
      // Test 3: All tools execution
      await this.testAllTools();
      
      // Test 4: Error handling
      await this.testErrorHandling();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    } finally {
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
    }
  }

  async testServerStartup() {
    console.log('📡 Testing server startup...');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.serverProcess) this.serverProcess.kill();
        reject(new Error('Server startup timeout'));
      }, 5000);

      this.serverProcess = spawn('node', ['ai-framework-mcp-server/dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('AI Framework MCP Server running on stdio')) {
          clearTimeout(timeout);
          this.addResult('Server Startup', 'PASS', 'Server started successfully');
          resolve();
        } else if (output.includes('Error') || output.includes('Failed')) {
          clearTimeout(timeout);
          this.addResult('Server Startup', 'FAIL', output.trim());
          reject(new Error(`Server startup failed: ${output}`));
        }
      });

      this.serverProcess.on('error', (error) => {
        clearTimeout(timeout);
        this.addResult('Server Startup', 'FAIL', error.message);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) {
          clearTimeout(timeout);
          this.addResult('Server Startup', 'FAIL', `Server exited with code ${code}`);
          reject(new Error(`Server exited with code ${code}`));
        }
      });
    });
  }

  async testMCPProtocol() {
    console.log('🔌 Testing MCP protocol...');
    
    try {
      // Test list_tools
      const toolsResponse = await this.sendMCPRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      });

      if (toolsResponse.result && toolsResponse.result.tools) {
        this.addResult('MCP Protocol - List Tools', 'PASS', 
          `Found ${toolsResponse.result.tools.length} tools`);
        return toolsResponse.result.tools;
      } else {
        throw new Error('Invalid tools list response');
      }
    } catch (error) {
      this.addResult('MCP Protocol - List Tools', 'FAIL', error.message);
      throw error;
    }
  }

  async testAllTools() {
    console.log('🛠️  Testing all MCP tools...');
    
    // Get list of tools first
    const toolsResponse = await this.sendMCPRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    });

    const tools = toolsResponse.result.tools;
    console.log(`Found ${tools.length} tools to test:`);
    tools.forEach(tool => console.log(`  - ${tool.name}: ${tool.description}`));
    console.log();

    // Test each tool
    for (const tool of tools) {
      await this.testTool(tool);
    }
  }

  async testTool(tool) {
    console.log(`  Testing ${tool.name}...`);
    
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: tool.name,
          arguments: this.getTestArguments(tool)
        }
      });

      if (response.error) {
        this.addResult(`Tool: ${tool.name}`, 'FAIL', 
          `MCP Error ${response.error.code}: ${response.error.message}`);
      } else if (response.result && response.result.content) {
        this.addResult(`Tool: ${tool.name}`, 'PASS', 
          `Returned ${response.result.content.length} content items`);
      } else {
        this.addResult(`Tool: ${tool.name}`, 'FAIL', 
          'Invalid response format');
      }
    } catch (error) {
      this.addResult(`Tool: ${tool.name}`, 'FAIL', error.message);
    }
  }

  async testErrorHandling() {
    console.log('⚠️  Testing error handling...');
    
    try {
      // Test invalid tool name
      const response = await this.sendMCPRequest({
        jsonrpc: '2.0',
        id: 999,
        method: 'tools/call',
        params: {
          name: 'nonexistent_tool',
          arguments: {}
        }
      });

      if (response.error && (response.error.code === -32603 || response.error.code === -32601)) {
        this.addResult('Error Handling - Invalid Tool', 'PASS', 
          'Correctly returned error for invalid tool');
      } else {
        this.addResult('Error Handling - Invalid Tool', 'FAIL', 
          'Did not handle invalid tool correctly');
      }
    } catch (error) {
      this.addResult('Error Handling - Invalid Tool', 'FAIL', error.message);
    }
  }

  getTestArguments(tool) {
    // Provide appropriate test arguments for each tool
    const args = {};
    
    if (tool.inputSchema && tool.inputSchema.properties) {
      for (const [propName, propSchema] of Object.entries(tool.inputSchema.properties)) {
        if (propName === 'projectPath') {
          args[propName] = process.cwd();
        } else if (propName === 'scenario') {
          args[propName] = 'assess';
        } else if (propName === 'feature') {
          args[propName] = 'test feature';
        } else if (propName === 'promptId') {
          args[propName] = 'ASSESS';
        } else if (propSchema.type === 'string') {
          args[propName] = 'test';
        } else if (propSchema.type === 'number') {
          args[propName] = 1;
        } else if (propSchema.type === 'boolean') {
          args[propName] = true;
        }
      }
    }
    
    return args;
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout: ${request.method}`));
      }, this.timeout);

      let responseData = '';
      
      const dataHandler = (data) => {
        responseData += data.toString();
        
        // Look for complete JSON response
        try {
          const lines = responseData.split('\n');
          for (const line of lines) {
            if (line.trim() && line.includes('"jsonrpc"')) {
              const response = JSON.parse(line.trim());
              if (response.id === request.id) {
                clearTimeout(timeout);
                this.serverProcess.stdout.removeListener('data', dataHandler);
                resolve(response);
                return;
              }
            }
          }
        } catch (e) {
          // Continue waiting for complete response
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);
      
      // Send request
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  addResult(testName, status, details) {
    this.testResults.push({ testName, status, details });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`    ${icon} ${testName}: ${details}`);
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.testName}: ${r.details}`));
    }
    
    console.log(`\n${failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed.'}`);
    
    // Exit with appropriate code
    process.exit(failed === 0 ? 0 : 1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new MCPTester();
  tester.runTests().catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = MCPTester;