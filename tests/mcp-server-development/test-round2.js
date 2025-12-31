const SafeMCPTester = require('./safe-mcp-tester.js');

async function testRound2() {
  const tester = new SafeMCPTester();
  
  console.log('🔧 Testing AI Framework Round 2 (10 tools total)');
  console.log('='.repeat(60));

  const incrementalConfig = {
    command: 'node',
    args: ['./ai-framework-mcp-server/dist/index-incremental.js'],
    cwd: '.',
    env: {}
  };

  console.log('🔍 Testing incremental server with 10 tools...');
  const result = await tester.testServerWithValidation('ai-framework-round2', incrementalConfig);
  
  if (result) {
    console.log('✅ Round 2 server test passed!');
    console.log('🎯 10 AI Framework tools ready for testing');
    console.log('\n📊 Available Tools:');
    console.log('  🧪 test_tool - Simple test tool');
    console.log('  📊 01_assess_project - Comprehensive project assessment');
    console.log('  📊 get_framework_state - Read and analyze current state');
    console.log('  🔄 02_resume_work - Resume work safely');
    console.log('  🎯 03_plan_next_action - Plan smallest next win');
    console.log('  🤔 04_decide_next_step - Automatic next action selection');
    console.log('  🚀 05_start_session - Initialize new AI Framework session');
    console.log('  ⚡ 06_enhance_feature - Handle new enhancements');
    console.log('  🔧 07_debug_issue - Debug without scope creep');
    console.log('\n🎉 Ready to test Round 2 tools!');
  } else {
    console.log('❌ Round 2 server test failed');
    console.log('🔧 Need to debug the Round 2 implementation');
  }

  return result;
}

testRound2().catch(console.error);