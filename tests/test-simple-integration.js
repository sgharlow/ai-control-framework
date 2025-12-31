#!/usr/bin/env node

/**
 * Simple integration test - just test tools list and one basic tool
 */

const { spawn } = require('child_process');
const path = require('path');

async function testSimpleIntegration() {
  console.log('🔧 Testing Simple MCP Integration...\n');

  const serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');

  // Test 1: Tools list
  console.log('1. Testing tools list...');
  const listResult = await testToolsList(serverPath);
  
  if (listResult.success) {
    console.log(`   ✅ Tools list: ${listResult.toolCount} tools available`);
  } else {
    console.log(`   ❌ Tools list failed: ${listResult.error}`);
    return false;
  }

  // Test 2: Simple tool call
  console.log('\n2. Testing simple tool call (get_framework_state)...');
  const toolResult = await testSimpleTool(serverPath);
  
  if (toolResult.success) {
    console.log('   ✅ Tool call successful');
  } else {
    console.log(`   ❌ Tool call failed: ${toolResult.error}`);
  }

  console.log('\n' + '='.repeat(50));
  if (listResult.success && toolResult.success) {
    console.log('🎉 MCP Server is working correctly!');
    console.log('\n📝 To use in Kiro:');
    console.log('1. Update .kiro/settings/mcp.json:');
    console.log('   "command": "node",');
    console.log('   "args": ["fixed-ai-framework-server.js"]');
    console.log('2. Restart Kiro or reconnect MCP servers');
    return true;
  } else {
    console.log('⚠️ MCP Server has issues');
    return false;
  }
}

async function testToolsList(serverPath) {
  return new Promise((resolve) => {
    const mcpRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill();
        resolve({ success: false, error: 'Timeout' });
      }
    }, 3000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        
        try {
          const lines = stdout.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.result && parsed.result.tools) {
                resolve({ 
                  success: true, 
                  toolCount: parsed.result.tools.length 
                });
                return;
              }
            } catch (e) {
              // Continue
            }
          }
          resolve({ success: false, error: 'No valid tools response' });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }
    });

    child.stdin.write(JSON.stringify(mcpRequest) + '\n');
    child.stdin.end();
  });
}

async function testSimpleTool(serverPath) {
  return new Promise((resolve) => {
    const mcpRequest = {
      jsonrpc: '2.0',
      id: 2,
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
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill();
        resolve({ success: false, error: 'Timeout' });
      }
    }, 5000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        
        if (stdout.includes('"content"') || stdout.includes('"result"')) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'No valid response' });
        }
      }
    });

    child.stdin.write(JSON.stringify(mcpRequest) + '\n');
    child.stdin.end();
  });
}

testSimpleIntegration().then(success => {
  process.exit(success ? 0 : 1);
});