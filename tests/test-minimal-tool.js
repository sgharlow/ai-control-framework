#!/usr/bin/env node

/**
 * Test a minimal tool to see where the hang occurs
 */

const { spawn } = require('child_process');
const path = require('path');

async function testMinimalTool() {
  console.log('🔍 Testing minimal tool execution...\n');

  const serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');

  const mcpRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_framework_state',
      arguments: {}
    }
  };

  const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';

  console.log('📤 Sending request...');
  
  child.stdout.on('data', (data) => {
    const chunk = data.toString();
    stdout += chunk;
    console.log('📥 Stdout chunk:', chunk.slice(0, 100) + (chunk.length > 100 ? '...' : ''));
  });

  child.stderr.on('data', (data) => {
    const chunk = data.toString();
    stderr += chunk;
    console.log('⚠️ Stderr chunk:', chunk.slice(0, 100) + (chunk.length > 100 ? '...' : ''));
  });

  child.on('close', (code) => {
    console.log(`\n🏁 Process closed with code: ${code}`);
    console.log('📊 Final stdout length:', stdout.length);
    console.log('📊 Final stderr length:', stderr.length);
    
    if (stdout.length > 0) {
      console.log('\n📄 Stdout content:');
      console.log(stdout);
    }
    
    if (stderr.length > 0) {
      console.log('\n⚠️ Stderr content:');
      console.log(stderr);
    }
  });

  child.on('error', (error) => {
    console.log('❌ Process error:', error.message);
  });

  // Send request and wait
  child.stdin.write(JSON.stringify(mcpRequest) + '\n');
  child.stdin.end();

  // Kill after 10 seconds if still running
  setTimeout(() => {
    console.log('\n⏰ Timeout reached, killing process...');
    child.kill();
  }, 10000);
}

testMinimalTool();