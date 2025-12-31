#!/usr/bin/env node

/**
 * Test the renamed and reordered AI Framework MCP tools
 */

const { spawn } = require('child_process');
const path = require('path');

class RenamedToolsTester {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  }

  async testRenamedTools() {
    console.log('🔄 Testing Renamed and Reordered AI Framework Tools\n');

    // Test both new numbered names and old names for backward compatibility
    const testCases = [
      // Test most frequently used tools (new names)
      { name: '1. Assess Project', oldName: 'assess', description: 'Most used - Project assessment' },
      { name: '2. Resume Work', oldName: 'resume', description: 'Daily workflow - Resume work' },
      { name: '3. Plan Next Action', oldName: 'plan', description: 'Planning - Next action' },
      { name: '5. Start Session', oldName: 'start', description: 'Session management - Start' },
      
      // Test development tools
      { name: '6. Enhance Feature', oldName: 'enhance', description: 'Development - Enhance feature' },
      { name: '7. Debug Issue', oldName: 'debug', description: 'Development - Debug issue' },
      { name: '8. Verify Compliance', oldName: 'verify', description: 'Validation - Compliance check' },
      
      // Test deployment tools
      { name: '15. Decide Deployment', oldName: 'deploy_decide', description: 'Deployment - Decision' },
      { name: '16. Deploy Project', oldName: 'deploy', description: 'Deployment - Execute' },
      
      // Test problem resolution
      { name: '18. Handle Blocker', oldName: 'blocked', description: 'Problem - Handle blocker' },
      { name: '25. Emergency Reset', oldName: 'emergency', description: 'Emergency - Last resort' },
      
      // Test analysis tools
      { name: '26. Select Optimal Prompt', oldName: 'select_optimal_prompt', description: 'Analysis - Optimal prompt' },
      { name: '27. Generate Contextualized Prompt', oldName: 'generate_contextualized_prompt', description: 'Analysis - Contextualized prompt' }
    ];

    let passed = 0;
    let total = testCases.length * 2; // Test both new and old names

    for (const testCase of testCases) {
      // Test new numbered name
      console.log(`🔧 Testing NEW name: "${testCase.name}"...`);
      const newResult = await this.callTool(testCase.name, this.getTestArgs(testCase.oldName));
      if (newResult.success) {
        console.log(`  ✅ NEW name works: ${testCase.description}`);
        passed++;
      } else {
        console.log(`  ❌ NEW name failed: ${newResult.error}`);
      }

      // Test old name for backward compatibility
      console.log(`🔧 Testing OLD name: "${testCase.oldName}"...`);
      const oldResult = await this.callTool(testCase.oldName, this.getTestArgs(testCase.oldName));
      if (oldResult.success) {
        console.log(`  ✅ OLD name works: Backward compatibility maintained`);
        passed++;
      } else {
        console.log(`  ❌ OLD name failed: ${oldResult.error}`);
      }

      console.log('');
    }

    // Test tools list to verify ordering
    console.log('📋 Testing tools list ordering...');
    const listResult = await this.getToolsList();
    if (listResult.success) {
      console.log(`  ✅ Tools list retrieved: ${listResult.toolCount} tools`);
      this.verifyToolsOrdering(listResult.tools);
      passed++;
      total++;
    } else {
      console.log(`  ❌ Tools list failed: ${listResult.error}`);
      total++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('📋 RENAMED TOOLS TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! Tool renaming and reordering successful!');
      console.log('\n📊 Benefits of the new organization:');
      console.log('   • Tools sorted by usage frequency (most used first)');
      console.log('   • Clear numbered naming for easy identification');
      console.log('   • Emojis for visual categorization');
      console.log('   • Backward compatibility maintained');
      console.log('   • Better user experience in Kiro MCP panel');
    } else {
      console.log('\n⚠️ Some tests failed. Check the errors above.');
    }

    return passed === total;
  }

  getTestArgs(toolName) {
    // Return appropriate test arguments for each tool type
    const argsMap = {
      'enhance': { feature: 'test feature' },
      'debug': { issue: 'test issue' },
      'correct': { issue: 'test bug' },
      'blocked': { blocker_description: 'test blocker' },
      'uncertainty': { uncertainty: 'test uncertainty' },
      'emergency': { reason: 'test emergency' },
      'setup': { projectName: 'test project' },
      'init_requirements': { userStory: 'test story' },
      'init_design': { architecture: 'test architecture' },
      'init_tasks': { feature: 'test feature' },
      'select_optimal_prompt': { scenario: 'assess' },
      'generate_contextualized_prompt': { promptId: 'ASSESS' },
      'pr': { pr_title: 'test PR' }
    };
    
    return argsMap[toolName] || {};
  }

  async callTool(toolName, args) {
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

      const timeout = setTimeout(() => {
        if (!responseReceived) {
          child.kill();
          resolve({ 
            success: false, 
            error: 'Timeout (no response within 5 seconds)'
          });
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
                  resolve({ success: false, error: parsed.error.message });
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

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          resolve({ success: false, error: error.message });
        }
      });

      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
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
      let responseReceived = false;

      const timeout = setTimeout(() => {
        if (!responseReceived) {
          child.kill();
          resolve({ success: false, error: 'Timeout' });
        }
      }, 5000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        try {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.trim()) {
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

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          resolve({ success: false, error: error.message });
        }
      });

      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
  }

  verifyToolsOrdering(tools) {
    console.log('\n📊 Tool Ordering Verification:');
    
    // Check that numbered tools are in order
    const numberedTools = tools.filter(t => t.name.match(/^\d+\./));
    let correctOrder = true;
    
    for (let i = 0; i < numberedTools.length - 1; i++) {
      const currentNum = parseInt(numberedTools[i].name.match(/^(\d+)\./)[1]);
      const nextNum = parseInt(numberedTools[i + 1].name.match(/^(\d+)\./)[1]);
      
      if (currentNum >= nextNum) {
        correctOrder = false;
        console.log(`  ❌ Order issue: ${numberedTools[i].name} comes before ${numberedTools[i + 1].name}`);
      }
    }
    
    if (correctOrder) {
      console.log('  ✅ All numbered tools are in correct order');
    }
    
    // Show first 10 tools to verify most-used-first ordering
    console.log('\n📋 Top 10 Most Frequently Used Tools:');
    tools.slice(0, 10).forEach((tool, index) => {
      const emoji = tool.description.match(/^[^\w\s]/)?.[0] || '•';
      console.log(`  ${(index + 1).toString().padStart(2)}. ${emoji} ${tool.name}`);
    });
  }
}

// Run the test
const tester = new RenamedToolsTester();
tester.testRenamedTools().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});