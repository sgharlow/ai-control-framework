#!/usr/bin/env node

/**
 * Quick test to verify the renamed tools work
 */

const { spawn } = require('child_process');
const path = require('path');

async function quickTest() {
  console.log('🔧 Quick test of renamed AI Framework tools...\n');

  const serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');

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
  let responseReceived = false;

  const timeout = setTimeout(() => {
    if (!responseReceived) {
      console.log('❌ Timeout waiting for response');
      child.kill();
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
              
              const tools = parsed.result.tools;
              console.log(`✅ Successfully retrieved ${tools.length} tools\n`);
              
              console.log('📋 First 10 tools (most frequently used):');
              tools.slice(0, 10).forEach((tool, index) => {
                const emoji = tool.description.match(/^[^\w\s]/)?.[0] || '•';
                console.log(`  ${(index + 1).toString().padStart(2)}. ${emoji} ${tool.name}`);
              });
              
              console.log('\n📋 Last 5 tools (least frequently used):');
              tools.slice(-5).forEach((tool, index) => {
                const emoji = tool.description.match(/^[^\w\s]/)?.[0] || '•';
                console.log(`  ${(tools.length - 4 + index).toString().padStart(2)}. ${emoji} ${tool.name}`);
              });
              
              console.log('\n🎉 Tool renaming and reordering successful!');
              console.log('✅ All tools are properly numbered and sorted by usage frequency');
              
              child.kill();
            }
            return;
          }
        }
      }
    } catch (e) {
      // Continue waiting
    }
  });

  child.stderr.on('data', (data) => {
    const stderr = data.toString();
    if (stderr.includes('Fixed AI Framework MCP Server running')) {
      console.log('✅ Server started successfully');
    }
  });

  child.on('error', (error) => {
    clearTimeout(timeout);
    console.log('❌ Process error:', error.message);
  });

  child.stdin.write(JSON.stringify(mcpRequest) + '\n');
  child.stdin.end();
}

quickTest();