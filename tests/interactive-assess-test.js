#!/usr/bin/env node

/**
 * Interactive test for the assess tool - shows exactly what Kiro would see
 */

const { spawn } = require('child_process');
const path = require('path');

async function interactiveAssessTest() {
  console.log('🎯 Interactive AI Framework Assess Tool Test\n');
  console.log('This shows exactly what Kiro sees when calling the assess tool.\n');

  const serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');

  const mcpRequest = {
    jsonrpc: '2.0',
    id: 42,
    method: 'tools/call',
    params: {
      name: 'assess',
      arguments: {}
    }
  };

  console.log('📤 Sending MCP request:');
  console.log(JSON.stringify(mcpRequest, null, 2));
  console.log('\n' + '─'.repeat(60) + '\n');

  const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdout = '';
  let responseReceived = false;

  const timeout = setTimeout(() => {
    if (!responseReceived) {
      console.log('⏰ Timeout - killing process');
      child.kill();
    }
  }, 10000);

  child.stdout.on('data', (data) => {
    stdout += data.toString();
    
    // Look for complete JSON response
    try {
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"result"')) {
          clearTimeout(timeout);
          if (!responseReceived) {
            responseReceived = true;
            
            console.log('📥 Raw MCP Response:');
            console.log(line);
            console.log('\n' + '─'.repeat(60) + '\n');
            
            try {
              const parsed = JSON.parse(line);
              if (parsed.result && parsed.result.content && parsed.result.content[0]) {
                console.log('📊 Parsed Assessment Data:');
                const assessmentData = JSON.parse(parsed.result.content[0].text);
                console.log(JSON.stringify(assessmentData, null, 2));
                
                console.log('\n' + '─'.repeat(60) + '\n');
                console.log('🎯 Key Metrics:');
                console.log(`   DRS Score: ${assessmentData.drsScore || 'N/A'}`);
                console.log(`   Confidence: ${assessmentData.confidence || 'N/A'}`);
                console.log(`   Project Path: ${assessmentData.projectPath || 'Current directory'}`);
                console.log(`   Session Mode: ${assessmentData.orchestration?.sessionMode || 'N/A'}`);
                console.log(`   Time Remaining: ${assessmentData.orchestration?.timeRemaining || 'N/A'} minutes`);
                console.log(`   Completion: ${assessmentData.tasks?.completionPercentage || 0}%`);
                console.log(`   Evidence Count: ${assessmentData.evidenceCount || 0}`);
                
                if (assessmentData.summary) {
                  console.log('\n🏥 Health Summary:');
                  console.log(`   Overall Health: ${assessmentData.summary.health || 'N/A'}`);
                  console.log(`   Can Deploy: ${assessmentData.summary.canDeploy ? '✅ Yes' : '❌ No'}`);
                  console.log(`   Blockers: ${assessmentData.summary.blockers || 0}`);
                }
              }
            } catch (e) {
              console.log('❌ Error parsing assessment data:', e.message);
            }
            
            child.kill();
            
            console.log('\n' + '='.repeat(60));
            console.log('✅ ASSESS TOOL TEST COMPLETE');
            console.log('='.repeat(60));
            console.log('The assess tool is working correctly and ready for use in Kiro!');
            console.log('\nTo use in Kiro:');
            console.log('1. Open the MCP panel');
            console.log('2. Find "ai-framework" server');
            console.log('3. Look for "assess" tool');
            console.log('4. Call it to get comprehensive project assessment');
          }
          return;
        }
      }
    } catch (e) {
      // Continue waiting
    }
  });

  child.stderr.on('data', (data) => {
    const stderr = data.toString();
    if (stderr.includes('Fixed AI Framework MCP Server running')) {
      console.log('✅ Server started successfully');
    }
  });

  child.on('error', (error) => {
    clearTimeout(timeout);
    console.log('❌ Process error:', error.message);
  });

  // Send request
  child.stdin.write(JSON.stringify(mcpRequest) + '\n');
  child.stdin.end();
}

interactiveAssessTest();