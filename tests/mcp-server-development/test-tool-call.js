#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function testToolCall() {
  const serverPath = path.join(__dirname, 'ai-framework-mcp-server', 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let errorOutput = '';

  server.stdout.on('data', (data) => {
    output += data.toString();
  });

  server.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test tool call with exact format
  const toolCall = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: '01_assess_project',
      arguments: {}
    }
  }) + '\n';

  console.log('Testing tool call: 01_assess_project');
  server.stdin.write(toolCall);

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  server.kill();

  // Parse response
  const lines = output.split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const json = JSON.parse(line);
      if (json.error) {
        console.error('ERROR:', json.error);
      } else if (json.result) {
        console.log('SUCCESS: Tool executed');
        console.log('Response length:', JSON.stringify(json.result).length);
      }
    } catch (e) {
      // Not JSON
    }
  });

  if (errorOutput && errorOutput !== 'AI Framework MCP Server running on stdio\n') {
    console.error('Server errors:', errorOutput);
  }
}

testToolCall().catch(console.error);