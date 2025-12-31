#!/usr/bin/env node

/**
 * Find the extra tool in our MCP server
 */

const { spawn } = require('child_process');
const path = require('path');

async function findExtraTool() {
  console.log('🔍 Finding the extra tool...\n');

  const serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  
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

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      try {
        const lines = stdout.split('\n').filter(line => line.trim());
        let response = null;
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.result && parsed.result.tools) {
              response = parsed;
              break;
            }
          } catch (e) {
            // Continue looking
          }
        }

        if (response && response.result && response.result.tools) {
          const tools = response.result.tools;
          
          const expectedTools = [
            'get_framework_state', 'assess',
            'start', 'set_context', 'resume', 'handoff',
            'decide', 'plan', 'select_pattern',
            'enhance', 'correct', 'debug',
            'verify', 'evidence', 'checkpoint',
            'deploy_decide', 'deploy', 'pr',
            'blocked', 'decline', 'uncertainty', 'emergency',
            'setup', 'init_requirements', 'init_design', 'init_tasks',
            'select_optimal_prompt', 'generate_contextualized_prompt'
          ];

          console.log('📋 All tools found:');
          tools.forEach((tool, index) => {
            const isExpected = expectedTools.includes(tool.name);
            const marker = isExpected ? '✅' : '🆕';
            console.log(`${(index + 1).toString().padStart(2)}. ${marker} ${tool.name} - ${tool.description}`);
          });

          const extraTools = tools.filter(tool => !expectedTools.includes(tool.name));
          
          if (extraTools.length > 0) {
            console.log('\n🆕 Extra tools found:');
            extraTools.forEach(tool => {
              console.log(`  • ${tool.name} - ${tool.description}`);
            });
          } else {
            console.log('\n✅ No extra tools - all tools are expected');
          }

          resolve(true);
        } else {
          console.log('❌ Failed to get tools list');
          resolve(false);
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
        resolve(false);
      }
    });

    child.stdin.write(JSON.stringify(mcpRequest) + '\n');
    child.stdin.end();
  });
}

findExtraTool();