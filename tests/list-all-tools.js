#!/usr/bin/env node

/**
 * List all available MCP tools
 */

const { spawn } = require('child_process');
const path = require('path');

class MCPTestClient {
  constructor() {
    this.server = null;
    this.buffer = '';
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  async start() {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, '..', 'ai-framework-mcp-server', 'dist', 'index.js');
      
      this.server = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      this.server.stdout.on('data', (data) => {
        this.buffer += data.toString();
        this.processBuffer();
      });

      this.server.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('AI Framework MCP Server running')) {
          resolve();
        }
      });

      this.server.on('error', reject);
      
      setTimeout(() => {
        reject(new Error('Server failed to start within timeout'));
      }, 5000);
    });
  }

  processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          if (message.id !== undefined && this.pendingRequests.has(message.id)) {
            const { resolve } = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            resolve(message);
          }
        } catch (e) {
          // Ignore non-JSON lines
        }
      }
    }
  }

  async sendRequest(method, params = {}) {
    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      this.server.stdin.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 10000);
    });
  }

  async listTools() {
    return this.sendRequest('tools/list');
  }

  async stop() {
    if (this.server) {
      this.server.kill();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

async function listAllTools() {
  console.log('📋 Listing All MCP Tools\n');
  console.log('=' .repeat(70) + '\n');
  
  const client = new MCPTestClient();
  
  try {
    await client.start();
    console.log('✅ Server started successfully\n');
    
    // Get the list of all tools
    const response = await client.listTools();
    const tools = response.result?.tools || [];
    
    console.log(`📊 Total tools found: ${tools.length}\n`);
    
    // List all tools with their descriptions
    tools.forEach((tool, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${tool.name}`);
      console.log(`    ${tool.description}`);
      console.log();
    });
    
    // Count tools by category
    const categories = {
      'Framework State': 0,
      'Numbered Tools': 0,
      'Analysis Tools': 0,
      'Legacy Names': 0
    };
    
    tools.forEach(tool => {
      if (tool.name.includes('get_framework_state')) {
        categories['Framework State']++;
      } else if (tool.name.match(/mcp_ai_framework_\d+_/)) {
        categories['Numbered Tools']++;
      } else if (tool.name.includes('Select_Optimal_Prompt') || tool.name.includes('Generate_Contextualized_Prompt')) {
        categories['Analysis Tools']++;
      } else {
        categories['Legacy Names']++;
      }
    });
    
    console.log('=' .repeat(70));
    console.log('📊 Tool Categories:');
    console.log('=' .repeat(70));
    for (const [category, count] of Object.entries(categories)) {
      if (count > 0) {
        console.log(`${category}: ${count}`);
      }
    }
    
    console.log('\n✅ All tools listed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to list tools:', error.message);
    process.exit(1);
  } finally {
    await client.stop();
  }
}

// Run the listing
listAllTools().catch(console.error);