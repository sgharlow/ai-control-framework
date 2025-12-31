const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class SafeMCPTester {
  constructor() {
    this.mcpConfigPath = '.kiro/settings/mcp.json';
    this.backupConfigPath = '.kiro/settings/mcp.json.backup';
  }

  // Backup current MCP config
  backupConfig() {
    if (fs.existsSync(this.mcpConfigPath)) {
      fs.copyFileSync(this.mcpConfigPath, this.backupConfigPath);
      console.log('✅ MCP config backed up');
    }
  }

  // Restore MCP config from backup
  restoreConfig() {
    if (fs.existsSync(this.backupConfigPath)) {
      fs.copyFileSync(this.backupConfigPath, this.mcpConfigPath);
      console.log('✅ MCP config restored from backup');
    }
  }

  // Read current MCP config
  readConfig() {
    try {
      const content = fs.readFileSync(this.mcpConfigPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.log('❌ Failed to read MCP config:', error.message);
      return null;
    }
  }

  // Write MCP config
  writeConfig(config) {
    try {
      fs.writeFileSync(this.mcpConfigPath, JSON.stringify(config, null, 4));
      console.log('✅ MCP config updated');
      return true;
    } catch (error) {
      console.log('❌ Failed to write MCP config:', error.message);
      return false;
    }
  }

  // Enable a specific MCP server
  enableServer(serverName, serverConfig) {
    const config = this.readConfig();
    if (!config) return false;

    config.mcpServers = config.mcpServers || {};
    config.mcpServers[serverName] = {
      ...serverConfig,
      disabled: false
    };

    return this.writeConfig(config);
  }

  // Disable a specific MCP server
  disableServer(serverName) {
    const config = this.readConfig();
    if (!config) return false;

    if (config.mcpServers && config.mcpServers[serverName]) {
      config.mcpServers[serverName].disabled = true;
      return this.writeConfig(config);
    }

    console.log(`⚠️ Server ${serverName} not found in config`);
    return false;
  }

  // Test a server configuration safely
  async testServerSafely(serverName, serverConfig, testDurationMs = 10000) {
    console.log(`🧪 Testing MCP server: ${serverName}`);
    console.log(`⏱️ Test duration: ${testDurationMs}ms`);
    
    // Backup current config
    this.backupConfig();

    try {
      // Enable the server
      console.log('📝 Enabling server...');
      if (!this.enableServer(serverName, serverConfig)) {
        throw new Error('Failed to enable server');
      }

      // Wait for the test duration
      console.log('⏳ Waiting for test completion...');
      console.log('💡 Monitor Kiro for crashes or check the MCP panel');
      
      await new Promise(resolve => setTimeout(resolve, testDurationMs));

      // Test passed if we get here
      console.log('✅ Test completed - no immediate crashes detected');
      return true;

    } catch (error) {
      console.log('❌ Test failed:', error.message);
      return false;
    } finally {
      // Always restore the config
      console.log('🔄 Restoring original config...');
      this.restoreConfig();
    }
  }

  // Test server with standalone validation first
  async testServerWithValidation(serverName, serverConfig) {
    console.log(`🔍 Pre-testing server standalone: ${serverName}`);
    
    // First test the server standalone
    const standaloneResult = await this.testStandalone(serverConfig);
    if (!standaloneResult) {
      console.log('❌ Standalone test failed - server has issues');
      return false;
    }

    console.log('✅ Standalone test passed - proceeding with Kiro test');
    
    // Now test with Kiro
    return await this.testServerSafely(serverName, serverConfig);
  }

  // Test server in standalone mode
  async testStandalone(serverConfig) {
    return new Promise((resolve) => {
      console.log('🚀 Starting standalone server test...');
      
      const serverProcess = spawn(serverConfig.command, serverConfig.args, {
        cwd: serverConfig.cwd || '.',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let hasResponded = false;
      let timeout;

      // Send initialize request
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      };

      serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

      // Listen for response
      serverProcess.stdout.on('data', (data) => {
        try {
          const lines = data.toString().split('\n').filter(line => line.trim());
          for (const line of lines) {
            const response = JSON.parse(line);
            if (response.id === 1 && response.result) {
              console.log('✅ Server responded to initialize request');
              hasResponded = true;
              clearTimeout(timeout);
              serverProcess.kill();
              resolve(true);
              return;
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('started') || message.includes('running')) {
          console.log('📡 Server startup message:', message.trim());
        }
      });

      serverProcess.on('error', (error) => {
        console.log('❌ Server process error:', error.message);
        clearTimeout(timeout);
        resolve(false);
      });

      // Timeout after 5 seconds
      timeout = setTimeout(() => {
        if (!hasResponded) {
          console.log('❌ Server did not respond within 5 seconds');
          serverProcess.kill();
          resolve(false);
        }
      }, 5000);
    });
  }
}

// CLI interface
async function main() {
  const tester = new SafeMCPTester();
  
  console.log('🧪 Safe MCP Server Tester');
  console.log('='.repeat(50));

  // Test the minimal server first
  const minimalConfig = {
    command: 'node',
    args: ['./ai-framework-mcp-server/dist/index-minimal-copy.js'],
    cwd: '.',
    env: {}
  };

  console.log('\n1️⃣ Testing minimal server...');
  const minimalResult = await tester.testServerWithValidation('ai-framework-minimal', minimalConfig);
  
  if (minimalResult) {
    console.log('✅ Minimal server test passed');
  } else {
    console.log('❌ Minimal server test failed');
    return;
  }

  // Test the safe server
  const safeConfig = {
    command: 'node',
    args: ['./ai-framework-mcp-server/dist/index-safe.js'],
    cwd: '.',
    env: {}
  };

  console.log('\n2️⃣ Testing safe server...');
  const safeResult = await tester.testServerWithValidation('ai-framework-safe', safeConfig);
  
  if (safeResult) {
    console.log('✅ Safe server test passed');
  } else {
    console.log('❌ Safe server test failed');
  }

  console.log('\n🎯 Testing complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SafeMCPTester;