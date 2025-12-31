const { spawn } = require('child_process');

console.log('Testing tool execution with fixed server...');

const server = spawn('node', ['./ai-framework-mcp-server/dist/index-safe.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// Send tool call request
const toolCallRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: '01_assess_project',
    arguments: {
      projectPath: '.'
    }
  }
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(toolCallRequest) + '\n');
}, 100);

// Handle responses
let responseCount = 0;
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log(`Response ${++responseCount}:`, JSON.stringify(response, null, 2));
      
      if (responseCount >= 2) {
        console.log('✅ Tool execution successful!');
        server.kill();
        process.exit(0);
      }
    } catch (e) {
      console.log('Raw output:', line);
    }
  });
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.log('❌ Test timeout');
  server.kill();
  process.exit(1);
}, 5000);