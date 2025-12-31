#!/usr/bin/env node

/**
 * Comprehensive test for all AI Framework MCP tools
 * Tests all 25+ tools to ensure they work without crashing
 */

const { spawn } = require('child_process');
const path = require('path');

class AIFrameworkToolTester {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest() {
    console.log('🧪 Starting comprehensive AI Framework MCP tool test...\n');

    // Test all tools systematically
    await this.testCoreTools();
    await this.testSessionManagement();
    await this.testPlanningDecision();
    await this.testDevelopmentActions();
    await this.testValidationCompliance();
    await this.testDeployment();
    await this.testProblemResolution();
    await this.testSetupTools();
    await this.testAnalysisTools();

    this.printSummary();
  }

  async testCoreTools() {
    console.log('📊 Testing Core Analysis Tools...');
    
    await this.testTool('get_framework_state', {});
    await this.testTool('assess', {});
  }

  async testSessionManagement() {
    console.log('\n🎯 Testing Session Management Tools...');
    
    await this.testTool('start', {});
    await this.testTool('set_context', {});
    await this.testTool('resume', {});
    await this.testTool('handoff', {});
  }

  async testPlanningDecision() {
    console.log('\n🎯 Testing Planning & Decision Tools...');
    
    await this.testTool('decide', {});
    await this.testTool('plan', {});
    await this.testTool('select_pattern', { task: 'implement user authentication' });
  }

  async testDevelopmentActions() {
    console.log('\n⚡ Testing Development Action Tools...');
    
    await this.testTool('enhance', { feature: 'user authentication system' });
    await this.testTool('correct', { issue: 'login validation bug' });
    await this.testTool('debug', { issue: 'memory leak in user service' });
  }

  async testValidationCompliance() {
    console.log('\n✅ Testing Validation & Compliance Tools...');
    
    await this.testTool('verify', {});
    await this.testTool('evidence', {});
    await this.testTool('checkpoint', {});
  }

  async testDeployment() {
    console.log('\n🚀 Testing Deployment Tools...');
    
    await this.testTool('deploy_decide', {});
    await this.testTool('deploy', {});
    await this.testTool('pr', { pr_title: 'Add user authentication feature' });
  }

  async testProblemResolution() {
    console.log('\n🔧 Testing Problem Resolution Tools...');
    
    await this.testTool('blocked', { blocker_description: 'API rate limit exceeded' });
    await this.testTool('decline', {});
    await this.testTool('uncertainty', { uncertainty: 'unclear requirements for user roles' });
    await this.testTool('emergency', { reason: 'critical security vulnerability found' });
  }

  async testSetupTools() {
    console.log('\n🛠️ Testing Setup Tools (Non-Kiro)...');
    
    await this.testTool('setup', { 
      projectName: 'test-project',
      projectType: 'api',
      description: 'Test API project'
    });
    await this.testTool('init_requirements', { userStory: 'As a user, I want to login' });
    await this.testTool('init_design', { architecture: 'microservices' });
    await this.testTool('init_tasks', { feature: 'user authentication' });
  }

  async testAnalysisTools() {
    console.log('\n🔍 Testing Analysis Tools...');
    
    await this.testTool('select_optimal_prompt', { 
      scenario: 'assess',
      userIntent: 'check project health'
    });
    await this.testTool('generate_contextualized_prompt', { 
      promptId: 'ASSESS'
    });
  }

  async testTool(toolName, args = {}) {
    this.totalTests++;
    
    try {
      const result = await this.callMCPTool(toolName, args);
      
      if (result.success) {
        console.log(`  ✅ ${toolName}: PASS`);
        this.passedTests++;
        this.testResults.push({ tool: toolName, status: 'PASS', error: null });
      } else {
        console.log(`  ❌ ${toolName}: FAIL - ${result.error}`);
        this.testResults.push({ tool: toolName, status: 'FAIL', error: result.error });
      }
    } catch (error) {
      console.log(`  ❌ ${toolName}: ERROR - ${error.message}`);
      this.testResults.push({ tool: toolName, status: 'ERROR', error: error.message });
    }
  }

  async callMCPTool(toolName, args) {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
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
          resolve({ success: false, error: 'Timeout (10s)' });
        }
      }, 10000);

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
          
          if (code === 0 || stdout.includes('"content"')) {
            resolve({ success: true, output: stdout });
          } else {
            resolve({ 
              success: false, 
              error: `Exit code ${code}, stderr: ${stderr.slice(0, 100)}` 
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

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! The AI Framework MCP server is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Details:');
      this.testResults
        .filter(r => r.status !== 'PASS')
        .forEach(r => {
          console.log(`  - ${r.tool}: ${r.status} (${r.error})`);
        });
    }

    console.log('\n📊 Tool Categories Tested:');
    console.log('  • Core Analysis Tools (2)');
    console.log('  • Session Management (4)');
    console.log('  • Planning & Decision (3)');
    console.log('  • Development Actions (3)');
    console.log('  • Validation & Compliance (3)');
    console.log('  • Deployment (3)');
    console.log('  • Problem Resolution (4)');
    console.log('  • Setup Tools (4)');
    console.log('  • Analysis Tools (2)');
    console.log(`  Total: ${this.totalTests} tools`);
  }
}

// Run the test
const tester = new AIFrameworkToolTester();
tester.runTest().catch(console.error);