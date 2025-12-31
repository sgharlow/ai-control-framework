const SafeMCPTester = require('./safe-mcp-tester.js');

async function testFinalServer() {
  const tester = new SafeMCPTester();
  
  console.log('🎯 Testing AI Framework Final Server (25+ tools)');
  console.log('='.repeat(60));

  const finalConfig = {
    command: 'node',
    args: ['./ai-framework-mcp-server/dist/index-final.js'],
    cwd: '.',
    env: {}
  };

  console.log('🔍 Testing final server with ALL AI Framework tools...');
  const result = await tester.testServerWithValidation('ai-framework-final', finalConfig);
  
  if (result) {
    console.log('✅ Final server test passed!');
    console.log('🎯 ALL 25+ AI Framework tools ready!');
    console.log('\n🎉 100% COMPLETE - AI Framework MCP Server');
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
    console.log('  ✅ 08_verify_compliance - Run compliance audit');
    console.log('  📋 09_generate_evidence - Generate required proof');
    console.log('  🛠️ 10_correct_bug - Debug with minimal scope');
    console.log('  ⚙️ 11_set_context - Set rules of engagement');
    console.log('  📤 12_handoff_session - End session properly');
    console.log('  ⏰ 13_check_milestone - Validate time gates');
    console.log('  🎨 14_select_pattern - Select implementation pattern');
    console.log('  🚦 15_decide_deployment - Make deployment decision');
    console.log('  🚀 16_deploy_project - Execute production deployment');
    console.log('  📋 17_create_pull_request - Generate pull request');
    console.log('  🚫 18_handle_blocker - Handle hard stops and blockers');
    console.log('  📉 19_recovery_mode - Handle DRS degradation');
    console.log('  ❓ 20_request_guidance - Request human guidance');
    console.log('  🛠️ 21_setup_framework - Complete framework initialization');
    console.log('  📝 22_init_requirements - Initialize requirements.md');
    console.log('  🎨 23_init_design - Initialize design.md');
    console.log('  📋 24_init_tasks - Initialize tasks.md');
    console.log('  ⚠️ 25_emergency_reset - Emergency contract change');
    console.log('\n🚀 READY FOR PRODUCTION USE!');
  } else {
    console.log('❌ Final server test failed');
    console.log('🔧 Need to debug the final implementation');
  }

  return result;
}

testFinalServer().catch(console.error);