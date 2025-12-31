#!/usr/bin/env node

/**
 * Test the tools list endpoint to ensure all tools are visible
 */

const { spawn } = require('child_process');
const path = require('path');

async function testToolsList() {
  console.log('🔍 Testing MCP tools list endpoint...\n');

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
    let stderr = '';

    const timeout = setTimeout(() => {
      child.kill();
      console.log('❌ Timeout waiting for response');
      resolve(false);
    }, 5000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      
      try {
        // Parse the JSON response
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
            // Continue looking for valid JSON
          }
        }

        if (response && response.result && response.result.tools) {
          const tools = response.result.tools;
          console.log(`✅ Successfully retrieved ${tools.length} tools\n`);
          
          // Group tools by category
          const categories = {
            'Core Analysis': ['get_framework_state', 'assess'],
            'Session Management': ['start', 'set_context', 'resume', 'handoff'],
            'Planning & Decision': ['decide', 'plan', 'select_pattern'],
            'Development Actions': ['enhance', 'correct', 'debug'],
            'Validation & Compliance': ['verify', 'evidence', 'checkpoint'],
            'Deployment': ['deploy_decide', 'deploy', 'pr'],
            'Problem Resolution': ['blocked', 'decline', 'uncertainty', 'emergency'],
            'Setup Tools': ['setup', 'init_requirements', 'init_design', 'init_tasks'],
            'Analysis Tools': ['select_optimal_prompt', 'generate_contextualized_prompt']
          };

          let totalExpected = 0;
          for (const [category, expectedTools] of Object.entries(categories)) {
            console.log(`📂 ${category}:`);
            totalExpected += expectedTools.length;
            
            for (const toolName of expectedTools) {
              const tool = tools.find(t => t.name === toolName);
              if (tool) {
                console.log(`  ✅ ${toolName} - ${tool.description}`);
              } else {
                console.log(`  ❌ ${toolName} - MISSING`);
              }
            }
            console.log('');
          }

          console.log(`📊 Summary: ${tools.length}/${totalExpected} tools found`);
          
          if (tools.length === totalExpected) {
            console.log('🎉 All expected tools are available!');
            resolve(true);
          } else {
            console.log('⚠️ Some tools are missing');
            resolve(false);
          }
        } else {
          console.log('❌ Failed to get tools list');
          console.log('Response:', stdout);
          console.log('Error:', stderr);
          resolve(false);
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw output:', stdout);
        resolve(false);
      }
    });

    // Send the MCP request
    child.stdin.write(JSON.stringify(mcpRequest) + '\n');
    child.stdin.end();
  });
}

testToolsList().then(success => {
  process.exit(success ? 0 : 1);
});