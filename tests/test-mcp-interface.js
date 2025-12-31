// Test script for the MCP Interface
const { McpInterface } = require('./mcp-interface');

async function testMcpCommands() {
  // Create a new MCP interface
  const mcp = new McpInterface();
  
  try {
    // Start the MCP server
    console.log('Starting MCP server...');
    mcp.start();
    
    // Wait a moment for the server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test the 'start' command
    console.log('\nExecuting "start" command...');
    const startResult = await mcp.execute('start', { 
      projectPath: __dirname 
    });
    console.log('Start result:', JSON.stringify(startResult, null, 2));
    
    // Test the 'assess' command
    console.log('\nExecuting "assess" command...');
    const assessResult = await mcp.execute('assess', { 
      projectPath: __dirname 
    });
    console.log('Assessment result:', JSON.stringify(assessResult, null, 2));
    
    // Test the 'decide' command
    console.log('\nExecuting "decide" command...');
    const decideResult = await mcp.execute('decide', { 
      projectPath: __dirname 
    });
    console.log('Decision result:', JSON.stringify(decideResult, null, 2));
    
    // Stop the server when done
    console.log('\nTests completed. Stopping MCP server...');
    mcp.stop();
    
  } catch (error) {
    console.error('Error during MCP testing:', error);
    // Make sure to stop the server even if there's an error
    mcp.stop();
  }
}

// Run the test
console.log('Starting MCP Interface Test...');
testMcpCommands().then(() => {
  console.log('Test completed.');
}).catch(err => {
  console.error('Test failed:', err);
});
