const SafeMCPTester = require('./safe-mcp-tester.js');

async function testIncrementalServer() {
  const tester = new SafeMCPTester();
  
  console.log('🔧 Testing AI Framework Incremental Server');
  console.log('='.repeat(60));

  const incrementalConfig = {
    command: 'node',
    args: ['./ai-framework-mcp-server/dist/index-incremental.js'],
    cwd: '.',
    env: {}
  };

  console.log('🔍 Testing incremental server with 5 tools...');
  const result = await tester.testServerWithValidation('ai-framework-incremental', incrementalConfig);
  
  if (result) {
    console.log('✅ Incremental server test passed!');
    console.log('🎯 5 AI Framework tools ready for testing');
    console.log('\n📊 Available Tools:');
    console.log('  🧪 test_tool - Simple test tool');
    console.log('  📊 01_assess_project - Comprehensive project assessment');
    console.log('  📊 get_framework_state - Read and analyze current state');
    console.log('  🔄 02_resume_work - Resume work safely');
    console.log('  🎯 03_plan_next_action - Plan smallest next win');
    console.log('\n🎉 Ready to test individual tools!');
  } else {
    console.log('❌ Incremental server test failed');
    console.log('🔧 Need to debug the incremental implementation');
  }

  return result;
}

testIncrementalServer().catch(console.error);