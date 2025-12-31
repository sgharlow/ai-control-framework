#!/usr/bin/env node

/**
 * Focused test for the AI Framework MCP 'resume' tool
 */

const { spawn } = require('child_process');
const path = require('path');

class ResumeToolTester {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  }

  async testResumeTool() {
    console.log('🔄 Testing AI Framework MCP "resume" Tool\n');

    // Test 1: Basic resume call
    console.log('📊 Test 1: Basic resume call (no arguments)...');
    const basicResult = await this.callResume({});
    this.printResult('Basic resume', basicResult);

    // Test 2: Resume with project path
    console.log('\n📊 Test 2: Resume with project path...');
    const pathResult = await this.callResume({ projectPath: process.cwd() });
    this.printResult('Resume with path', pathResult);

    // Test 3: Resume with non-existent path (error handling)
    console.log('\n📊 Test 3: Resume with non-existent path (error handling)...');
    const errorResult = await this.callResume({ projectPath: '/non/existent/path' });
    this.printResult('Resume error handling', errorResult);

    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUME TOOL TEST SUMMARY');
    console.log('='.repeat(60));
    
    const allTests = [basicResult, pathResult, errorResult];
    const successfulTests = allTests.filter(r => r.success).length;
    
    console.log(`✅ Successful calls: ${successfulTests}/${allTests.length}`);
    
    if (successfulTests >= 2) {
      console.log('🎉 Resume tool is working correctly!');
      console.log('\n📝 You can now use this tool in Kiro:');
      console.log('   • Open MCP panel in Kiro');
      console.log('   • Look for "resume" tool under ai-framework server');
      console.log('   • Call it to safely resume work on your project');
      console.log('\n🎯 What resume does:');
      console.log('   • Checks DRS score and project state');
      console.log('   • Verifies framework contracts');
      console.log('   • Identifies implementation patterns');
      console.log('   • Provides safe resumption guidance');
    } else {
      console.log('⚠️ Resume tool has issues that need investigation');
    }

    return successfulTests >= 2;
  }

  async callResume(args) {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000),
        method: 'tools/call',
        params: {
          name: 'resume',
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
          
          console.log(`     🎯 Prompt: ${content.promptName || 'N/A'}`);
          console.log(`     ✅ Executed: ${content.executed ? 'Yes' : 'No'}`);
          console.log(`     🎯 Confidence: ${content.confidence || 'N/A'}`);
          
          if (content.context) {
            console.log(`     📊 DRS Score: ${content.context.drsScore || 'N/A'}`);
            console.log(`     📁 Project State: ${content.context.projectState || 'N/A'}`);
            console.log(`     📈 Completion: ${content.context.completionPercentage || 0}%`);
            console.log(`     🔒 Framework Compliance: ${content.context.frameworkCompliance ? 'Yes' : 'No'}`);
          }
          
          if (content.recommendations && content.recommendations.length > 0) {
            console.log(`     💡 Top Recommendation: ${content.recommendations[0]}`);
          }
          
          if (content.nextActions && content.nextActions.length > 0) {
            console.log(`     🎯 Next Action: ${content.nextActions[0]}`);
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
const tester = new ResumeToolTester();
tester.testResumeTool().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});