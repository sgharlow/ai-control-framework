#!/usr/bin/env node

/**
 * Unit Test for FrameworkStateReader
 * Tests that the FrameworkStateReader can be created and used without errors
 */

async function testFrameworkStateReader() {
  console.log('🧪 Testing FrameworkStateReader...\n');
  
  try {
    // Test 1: Import and create FrameworkStateReader
    console.log('📦 Testing import and instantiation...');
    const { FrameworkStateReader } = require('./ai-framework-mcp-server/dist/services/framework-state-reader.js');
    const reader = new FrameworkStateReader();
    console.log('✅ FrameworkStateReader created successfully');
    
    // Test 2: Read framework state
    console.log('\n📖 Testing readFrameworkState...');
    const projectPath = process.cwd();
    const state = await reader.readFrameworkState(projectPath);
    console.log('✅ FrameworkState read successfully');
    
    // Test 3: Verify all required properties exist
    console.log('\n🔍 Verifying state properties...');
    const requiredProps = [
      'orchestration', 'tasks', 'todos', 'drsScore', 'evidence', 
      'lastUpdate', 'confidence', 'projectPath'
    ];
    
    for (const prop of requiredProps) {
      if (state[prop] !== undefined) {
        console.log(`✅ ${prop}: ${typeof state[prop]}`);
      } else {
        throw new Error(`Missing required property: ${prop}`);
      }
    }
    
    // Test 4: Verify todos properties (the main fix)
    console.log('\n🎯 Verifying todos properties...');
    const todosProps = [
      'mockCount', 'oldestMockAge', 'allHaveExpiry', 'blockersDocumented',
      'prioritized', 'blockers', 'count', 'withoutExpiry', 'critical', 'high'
    ];
    
    for (const prop of todosProps) {
      if (state.todos[prop] !== undefined) {
        console.log(`✅ todos.${prop}: ${typeof state.todos[prop]} = ${JSON.stringify(state.todos[prop])}`);
      } else {
        throw new Error(`Missing todos property: ${prop}`);
      }
    }
    
    // Test 5: Verify orchestration properties
    console.log('\n🎭 Verifying orchestration properties...');
    const orchestrationProps = [
      'sessionMode', 'currentGate', 'gateDeadline', 'confidence', 
      'lastEvidence', 'contractHash', 'sessionStartTime', 'timeRemaining',
      'timeGates', 'patternUsed'
    ];
    
    for (const prop of orchestrationProps) {
      if (state.orchestration[prop] !== undefined) {
        console.log(`✅ orchestration.${prop}: ${typeof state.orchestration[prop]}`);
      } else {
        console.log(`⚠️  orchestration.${prop}: undefined (optional)`);
      }
    }
    
    // Test 6: Verify tasks properties
    console.log('\n📋 Verifying tasks properties...');
    const tasksProps = [
      'tasks', 'completionPercentage', 'blockers', 'partialProgress',
      'realServicesConnected', 'dodMet', 'acceptanceCriteria'
    ];
    
    for (const prop of tasksProps) {
      if (state.tasks[prop] !== undefined) {
        console.log(`✅ tasks.${prop}: ${typeof state.tasks[prop]}`);
      } else {
        console.log(`⚠️  tasks.${prop}: undefined (optional)`);
      }
    }
    
    // Test 7: Test EnhancedPromptExecutor creation
    console.log('\n🚀 Testing EnhancedPromptExecutor...');
    const { EnhancedPromptExecutor } = require('./ai-framework-mcp-server/dist/services/prompt-executor-enhanced.js');
    const executor = new EnhancedPromptExecutor();
    console.log('✅ EnhancedPromptExecutor created successfully');
    
    // Test 8: Test assess prompt execution (the main issue)
    console.log('\n🎯 Testing assess prompt execution...');
    try {
      const result = await executor.executePrompt('ASSESS', projectPath, {});
      console.log('✅ ASSESS prompt executed successfully');
      console.log(`📊 Result type: ${typeof result}`);
      console.log(`📊 Result keys: ${Object.keys(result).join(', ')}`);
    } catch (error) {
      console.log(`❌ ASSESS prompt failed: ${error.message}`);
      throw error;
    }
    
    console.log('\n🎉 All tests passed! FrameworkStateReader is working correctly.');
    return true;
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFrameworkStateReader().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testFrameworkStateReader;