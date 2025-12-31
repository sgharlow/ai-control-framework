// MCP Interface for AI Framework
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class McpInterface {
  constructor(serverPath) {
    this.serverPath = serverPath || path.join(__dirname, 'ai-framework-mcp-server/dist/index.js');
    this.server = null;
    this.requestId = 1;
    this.callbacks = {};
  }

  /**
   * Start the MCP server
   */
  start() {
    if (this.server) {
      console.log('MCP server is already running');
      return;
    }

    console.log(`Starting MCP server from: ${this.serverPath}`);
    this.server = spawn('node', [this.serverPath]);
    
    this.server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`MCP Server output: ${output}`);
      
      try {
        // Try to parse the output as JSON
        const response = JSON.parse(output);
        if (response.id && this.callbacks[response.id]) {
          this.callbacks[response.id](response);
          delete this.callbacks[response.id];
        }
      } catch (e) {
        // Not JSON or other error, just log it
      }
    });

    this.server.stderr.on('data', (data) => {
      console.error(`MCP Server error: ${data}`);
    });

    this.server.on('close', (code) => {
      console.log(`MCP server exited with code ${code}`);
      this.server = null;
    });
  }

  /**
   * Stop the MCP server
   */
  stop() {
    if (this.server) {
      this.server.kill();
      this.server = null;
      console.log('MCP server stopped');
    }
  }

  /**
   * Execute an MCP command
   * @param {string} command - The command to execute (e.g., 'assess', 'start', 'resume')
   * @param {object} params - Parameters for the command
   * @returns {Promise} - Promise that resolves with the command result
   */
  async execute(command, params = {}) {
    if (!this.server) {
      this.start();
    }

    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      
      const request = {
        jsonrpc: '2.0',
        id,
        method: 'execute',
        params: {
          command,
          ...params
        }
      };

      this.callbacks[id] = (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.result);
        }
      };

      this.server.stdin.write(JSON.stringify(request) + '\\n');
    });
  }
}

// Example usage
async function example() {
  const mcp = new McpInterface();
  
  try {
    // Start the server
    mcp.start();
    
    // Execute the assess command
    const result = await mcp.execute('assess', { projectPath: __dirname });
    console.log('Assessment result:', result);
    
    // Stop the server when done
    mcp.stop();
  } catch (error) {
    console.error('Error:', error);
    mcp.stop();
  }
}

// Export the interface
module.exports = {
  McpInterface,
  example
};

// Run the example if this file is executed directly
if (require.main === module) {
  example();
}
