const SafeMCPTester = require('./safe-mcp-tester.js');

async function testHybridV1() {
  const tester = new SafeMCPTester();
  
  console.log('🧪 Testing AI Framework Hybrid V1 Server');
  console.log('='.repeat(50));

  const hybridConfig = {
    command: 'node',
    args: ['./ai-framework-mcp-server/dist/index-hybrid-v1.js'],
    cwd: '.',
    env: {}
  };

  console.log('🔍 Testing hybrid server with 01_assess_project tool...');
  const result = await tester.testServerWithValidation('ai-framework-hybrid-v1', hybridConfig);
  
  if (result) {
    console.log('✅ Hybrid V1 server test passed!');
    console.log('🎯 Ready to add more AI Framework tools');
  } else {
    console.log('❌ Hybrid V1 server test failed');
    console.log('🔧 Need to debug the 01_assess_project implementation');
  }

  return result;
}

testHybridV1().catch(console.error);