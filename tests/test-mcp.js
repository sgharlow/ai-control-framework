// Test script for AI Framework MCP Server
const { execute } = require('./ai-framework-mcp-server/dist/index.js');

async function testMcpServer() {
  try {
    console.log('Testing AI Framework MCP Server...');
    
    // Try a simple assess command
    const result = await execute('assess', {
      projectPath: __dirname
    });
    
    console.log('MCP Server Response:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('MCP Server is working correctly!');
  } catch (error) {
    console.error('Error testing MCP server:', error);
  }
}

testMcpServer();
