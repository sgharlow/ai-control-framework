#!/usr/bin/env node

/**
 * Test script for MCP server functionality
 */

const { spawn } = require('child_process');
const path = require('path');

async function testMCPServer() {
  console.log('Testing MCP Server...\n');

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

  // Send list tools request
  const listToolsRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }) + '\n';

  console.log('Sending list tools request...');
  server.stdin.write(listToolsRequest);

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Send a test tool call
  const testToolCall = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_framework_state',
      arguments: {}
    }
  }) + '\n';

  console.log('Sending test tool call...');
  server.stdin.write(testToolCall);

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Kill the server
  server.kill();

  console.log('\n=== Server Output ===');
  console.log(output);

  console.log('\n=== Server Errors ===');
  console.log(errorOutput || 'No errors');

  // Parse and display results
  try {
    const lines = output.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      try {
        const json = JSON.parse(line);
        if (json.result) {
          if (json.result.tools) {
            console.log(`\n✅ Found ${json.result.tools.length} tools`);
            console.log('First 5 tools:');
            json.result.tools.slice(0, 5).forEach(tool => {
              console.log(`  - ${tool.name}: ${tool.description.substring(0, 60)}...`);
            });
          } else if (json.result.content) {
            console.log('\n✅ Tool call successful');
          }
        }
      } catch (e) {
        // Not JSON, skip
      }
    });
  } catch (e) {
    console.error('Error parsing output:', e.message);
  }
}

testMCPServer().catch(console.error);