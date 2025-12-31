const SafeMCPTester = require('./safe-mcp-tester.js');

async function testRound11() {
  const tester = new SafeMCPTester();
  
  console.log('🔧 Testing AI Framework Round 1.1 (6 tools total)');
  console.log('='.repeat(60));

  const round11Config = {
    command: 'node',
    args: ['./ai-framework-mcp-server/dist/index-round1-1.js'],
    cwd: '.',
    env: {}
  };

  console.log('🔍 Testing Round 1.1 server with just ONE new tool...');
  const result = await tester.testServerWithValidation('ai-framework-round1-1', round11Config);
  
  if (result) {
    console.log('✅ Round 1.1 server test passed!');
    console.log('🎯 6 AI Framework tools ready for testing');
    console.log('\n📊 Available Tools:');
    console.log('  🧪 test_tool - Simple test tool');
    console.log('  📊 01_assess_project - Comprehensive project assessment');
    console.log('  📊 get_framework_state - Read and analyze current state');
    console.log('  🔄 02_resume_work - Resume work safely');
    console.log('  🎯 03_plan_next_action - Plan smallest next win');
    console.log('  🤔 04_decide_next_step - NEW: Automatic next action selection');
    console.log('\n🎉 Ready to test the new tool!');
  } else {
    console.log('❌ Round 1.1 server test failed');
    console.log('🔧 Need to debug the new tool implementation');
  }

  return result;
}

testRound11().catch(console.error);