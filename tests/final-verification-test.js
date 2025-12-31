#!/usr/bin/env node

/**
 * Final verification test for the renamed AI Framework MCP tools
 */

const { spawn } = require('child_process');
const path = require('path');

class FinalVerificationTester {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  }

  async runFinalVerification() {
    console.log('🔍 Final Verification of AI Framework MCP Tools\n');

    // Test 1: Verify exact tool count
    console.log('📊 Test 1: Verifying tool count...');
    const listResult = await this.getToolsList();
    
    if (listResult.success) {
      const expectedCount = 28; // 1 core + 25 main + 2 analysis
      if (listResult.toolCount === expectedCount) {
        console.log(`  ✅ Correct tool count: ${listResult.toolCount}/${expectedCount}`);
      } else {
        console.log(`  ❌ Wrong tool count: ${listResult.toolCount}/${expectedCount}`);
        return false;
      }
    } else {
      console.log(`  ❌ Failed to get tools list: ${listResult.error}`);
      return false;
    }

    // Test 2: Verify no duplicates
    console.log('\n🔍 Test 2: Checking for duplicates...');
    const duplicates = this.findDuplicates(listResult.tools);
    if (duplicates.length === 0) {
      console.log('  ✅ No duplicate tools found');
    } else {
      console.log('  ❌ Duplicate tools found:');
      duplicates.forEach(dup => console.log(`    - ${dup}`));
      return false;
    }

    // Test 3: Verify proper numbering
    console.log('\n🔢 Test 3: Verifying tool numbering...');
    const numberingIssues = this.verifyNumbering(listResult.tools);
    if (numberingIssues.length === 0) {
      console.log('  ✅ All tools properly numbered');
    } else {
      console.log('  ❌ Numbering issues found:');
      numberingIssues.forEach(issue => console.log(`    - ${issue}`));
      return false;
    }

    // Test 4: Test key renamed tools
    console.log('\n🔧 Test 4: Testing key renamed tools...');
    const keyTests = [
      { name: '0. Get Framework State', description: 'Core framework state' },
      { name: '1. Assess Project', description: 'Most used assessment' },
      { name: '2. Resume Work', description: 'Daily workflow' },
      { name: '25. Emergency Reset', description: 'Emergency tool' }
    ];

    let keyTestsPassed = 0;
    for (const test of keyTests) {
      const result = await this.testTool(test.name);
      if (result.success) {
        console.log(`  ✅ ${test.name}: Works correctly`);
        keyTestsPassed++;
      } else {
        console.log(`  ❌ ${test.name}: Failed - ${result.error}`);
      }
    }

    // Test 5: Test backward compatibility
    console.log('\n🔄 Test 5: Testing backward compatibility...');
    const backwardTests = [
      { name: 'get_framework_state', newName: '0. Get Framework State' },
      { name: 'assess', newName: '1. Assess Project' },
      { name: 'resume', newName: '2. Resume Work' }
    ];

    let backwardTestsPassed = 0;
    for (const test of backwardTests) {
      const result = await this.testTool(test.name);
      if (result.success) {
        console.log(`  ✅ ${test.name}: Backward compatibility maintained`);
        backwardTestsPassed++;
      } else {
        console.log(`  ❌ ${test.name}: Backward compatibility broken - ${result.error}`);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL VERIFICATION RESULTS');
    console.log('='.repeat(70));
    
    const totalTests = 5;
    const passedTests = (listResult.success ? 1 : 0) + 
                       (duplicates.length === 0 ? 1 : 0) + 
                       (numberingIssues.length === 0 ? 1 : 0) + 
                       (keyTestsPassed === keyTests.length ? 1 : 0) + 
                       (backwardTestsPassed === backwardTests.length ? 1 : 0);

    console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`📊 Tool Count: ${listResult.toolCount} (Expected: 28)`);
    console.log(`🔧 Key Tools: ${keyTestsPassed}/${keyTests.length} working`);
    console.log(`🔄 Backward Compatibility: ${backwardTestsPassed}/${backwardTests.length} working`);

    if (passedTests === totalTests) {
      console.log('\n🎉 ALL VERIFICATION TESTS PASSED!');
      console.log('✅ AI Framework MCP tools are properly renamed and reordered');
      console.log('✅ No duplicates, proper numbering, full functionality');
      console.log('✅ Backward compatibility maintained');
      console.log('\n📋 Final Tool Organization:');
      this.showFinalOrganization(listResult.tools);
      return true;
    } else {
      console.log('\n⚠️ Some verification tests failed. Please check the issues above.');
      return false;
    }
  }

  findDuplicates(tools) {
    const names = tools.map(t => t.name);
    const duplicates = [];
    const seen = new Set();
    
    for (const name of names) {
      if (seen.has(name)) {
        duplicates.push(name);
      } else {
        seen.add(name);
      }
    }
    
    return duplicates;
  }

  verifyNumbering(tools) {
    const issues = [];
    const numberedTools = tools.filter(t => t.name.match(/^\d+\./));
    
    // Check for proper sequence
    const numbers = numberedTools.map(t => parseInt(t.name.match(/^(\d+)\./)[1]));
    const expectedNumbers = Array.from({length: numbers.length}, (_, i) => i);
    
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] !== expectedNumbers[i]) {
        issues.push(`Expected ${expectedNumbers[i]} but found ${numbers[i]} in position ${i + 1}`);
      }
    }
    
    return issues;
  }

  showFinalOrganization(tools) {
    console.log('\n📊 Core Tool:');
    console.log(`   ${tools[0].name}`);
    
    console.log('\n🔥 Most Frequently Used (1-5):');
    tools.slice(1, 6).forEach(tool => {
      console.log(`   ${tool.name}`);
    });
    
    console.log('\n⚡ Development Tools (6-10):');
    tools.slice(6, 11).forEach(tool => {
      console.log(`   ${tool.name}`);
    });
    
    console.log('\n📋 Session Management (11-14):');
    tools.slice(11, 15).forEach(tool => {
      console.log(`   ${tool.name}`);
    });
    
    console.log('\n🚀 Deployment & Advanced (15+):');
    tools.slice(15).forEach(tool => {
      console.log(`   ${tool.name}`);
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
            if (line.trim() && (line.includes('"result"') || line.includes('"error"'))) {
              clearTimeout(timeout);
              if (!responseReceived) {
                responseReceived = true;
                child.kill();
                
                const parsed = JSON.parse(line);
                if (parsed.result) {
                  resolve({ success: true });
                } else if (parsed.error) {
                  resolve({ success: false, error: parsed.error.message });
                } else {
                  resolve({ success: false, error: 'Invalid response' });
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
}

// Run the final verification
const tester = new FinalVerificationTester();
tester.runFinalVerification().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});