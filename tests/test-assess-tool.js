#!/usr/bin/env node

/**
 * Focused test for the AI Framework MCP 'assess' tool
 */

const { spawn } = require('child_process');
const path = require('path');

class AssessToolTester {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  }

  async testAssessTool() {
    console.log('🎯 Testing AI Framework MCP "assess" Tool\n');

    // Test 1: Basic assess call
    console.log('📊 Test 1: Basic assess call (no arguments)...');
    const basicResult = await this.callAssess({});
    this.printResult('Basic assess', basicResult);

    // Test 2: Assess with project path
    console.log('\n📊 Test 2: Assess with project path...');
    const pathResult = await this.callAssess({ projectPath: process.cwd() });
    this.printResult('Assess with path', pathResult);

    // Test 3: Assess with non-existent path (error handling)
    console.log('\n📊 Test 3: Assess with non-existent path (error handling)...');
    const errorResult = await this.callAssess({ projectPath: '/non/existent/path' });
    this.printResult('Assess error handling', errorResult);

    console.log('\n' + '='.repeat(60));
    console.log('📋 ASSESS TOOL TEST SUMMARY');
    console.log('='.repeat(60));
    
    const allTests = [basicResult, pathResult, errorResult];
    const successfulTests = allTests.filter(r => r.success).length;
    
    console.log(`✅ Successful calls: ${successfulTests}/${allTests.length}`);
    
    if (successfulTests >= 2) {
      console.log('🎉 Assess tool is working correctly!');
      console.log('\n📝 You can now use this tool in Kiro:');
      console.log('   • Open MCP panel in Kiro');
      console.log('   • Look for "assess" tool under ai-framework server');
      console.log('   • Call it to get project health assessment');
    } else {
      console.log('⚠️ Assess tool has issues that need investigation');
    }

    return successfulTests >= 2;
  }

  async callAssess(args) {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000),
        method: 'tools/call',
        params: {
          name: 'assess',
          arguments: args
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
          resolve({ 
            success: false, 
            error: 'Timeout (no response within 8 seconds)',
            args 
          });
        }
      }, 8000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        // Look for complete JSON response
        try {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              const parsed = JSON.parse(line);
              if (parsed.result || parsed.error) {
                clearTimeout(timeout);
                if (!responseReceived) {
                  responseReceived = true;
                  child.kill();
                  
                  if (parsed.result) {
                    resolve({ 
                      success: true, 
                      response: parsed.result,
                      args,
                      rawResponse: line
                    });
                  } else {
                    resolve({ 
                      success: false, 
                      error: parsed.error.message || 'Unknown error',
                      args 
                    });
                  }
                }
                return;
              }
            }
          }
        } catch (e) {
          // Continue waiting for complete response
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          resolve({ 
            success: false, 
            error: `Process error: ${error.message}`,
            args 
          });
        }
      });

      // Send request
      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
  }

  printResult(testName, result) {
    if (result.success) {
      console.log(`  ✅ ${testName}: SUCCESS`);
      
      // Parse and display key information from the response
      try {
        if (result.response && result.response.content && result.response.content[0]) {
          const content = JSON.parse(result.response.content[0].text);
          
          console.log(`     📊 DRS Score: ${content.drsScore || 'N/A'}`);
          console.log(`     🎯 Confidence: ${content.confidence || 'N/A'}`);
          console.log(`     📁 Project Path: ${content.projectPath || 'N/A'}`);
          
          if (content.summary) {
            console.log(`     🏥 Health: ${content.summary.health || 'N/A'}`);
            console.log(`     🚀 Can Deploy: ${content.summary.canDeploy || 'N/A'}`);
          }
          
          if (content.message) {
            console.log(`     💬 Message: ${content.message}`);
          }
        }
      } catch (e) {
        console.log(`     📄 Raw response length: ${result.rawResponse?.length || 0} chars`);
      }
    } else {
      console.log(`  ❌ ${testName}: FAILED`);
      console.log(`     Error: ${result.error}`);
      if (result.args && Object.keys(result.args).length > 0) {
        console.log(`     Args: ${JSON.stringify(result.args)}`);
      }
    }
  }
}

// Run the test
const tester = new AssessToolTester();
tester.testAssessTool().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});