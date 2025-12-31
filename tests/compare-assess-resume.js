#!/usr/bin/env node

/**
 * Compare assess vs resume tools to show their different purposes
 */

const { spawn } = require('child_process');
const path = require('path');

class AssessResumeComparison {
  constructor() {
    this.serverPath = path.join(__dirname, '..', 'fixed-ai-framework-server.js');
  }

  async runComparison() {
    console.log('🔄 AI Framework Tools Comparison: ASSESS vs RESUME\n');

    console.log('📊 Testing ASSESS tool...');
    const assessResult = await this.callTool('assess', {});
    
    console.log('\n🔄 Testing RESUME tool...');
    const resumeResult = await this.callTool('resume', {});

    console.log('\n' + '='.repeat(70));
    console.log('📋 TOOL COMPARISON RESULTS');
    console.log('='.repeat(70));

    this.compareResults(assessResult, resumeResult);

    console.log('\n📝 USAGE RECOMMENDATIONS:');
    console.log('='.repeat(70));
    console.log('🎯 Use ASSESS when:');
    console.log('   • You want a comprehensive project health check');
    console.log('   • You need detailed DRS breakdown and analysis');
    console.log('   • You want specific recommendations and next actions');
    console.log('   • You\'re deciding if the project is ready to deploy');
    console.log('   • You need to understand current framework compliance');

    console.log('\n🔄 Use RESUME when:');
    console.log('   • You\'re returning to work after a break');
    console.log('   • You want to safely continue development');
    console.log('   • You need to verify contracts before proceeding');
    console.log('   • You want to identify current implementation patterns');
    console.log('   • You need guidance on safe work resumption');

    console.log('\n💡 WORKFLOW SUGGESTION:');
    console.log('   1. Use RESUME when starting work (safe resumption)');
    console.log('   2. Use ASSESS periodically for health checks');
    console.log('   3. Use ASSESS before major decisions or deployment');
  }

  async callTool(toolName, args) {
    return new Promise((resolve) => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      const child = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let responseReceived = false;

      const timeout = setTimeout(() => {
        if (!responseReceived) {
          child.kill();
          resolve({ 
            success: false, 
            error: 'Timeout',
            toolName
          });
        }
      }, 8000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        try {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.trim() && line.includes('"result"')) {
              clearTimeout(timeout);
              if (!responseReceived) {
                responseReceived = true;
                child.kill();
                
                const parsed = JSON.parse(line);
                if (parsed.result && parsed.result.content && parsed.result.content[0]) {
                  const data = JSON.parse(parsed.result.content[0].text);
                  resolve({ 
                    success: true, 
                    data,
                    toolName,
                    responseLength: line.length
                  });
                } else {
                  resolve({ 
                    success: false, 
                    error: 'Invalid response format',
                    toolName
                  });
                }
              }
              return;
            }
          }
        } catch (e) {
          // Continue waiting
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        if (!responseReceived) {
          responseReceived = true;
          resolve({ 
            success: false, 
            error: error.message,
            toolName
          });
        }
      });

      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();
    });
  }

  compareResults(assessResult, resumeResult) {
    console.log('📊 ASSESS Tool Results:');
    if (assessResult.success) {
      console.log(`   ✅ Status: SUCCESS (${assessResult.responseLength} chars)`);
      console.log(`   🎯 Prompt: ${assessResult.data.promptName || 'N/A'}`);
      console.log(`   📊 DRS Score: ${assessResult.data.context?.drsScore || 'N/A'}`);
      console.log(`   🎯 Confidence: ${assessResult.data.confidence || 'N/A'}`);
      console.log(`   💡 Recommendations: ${assessResult.data.recommendations?.length || 0}`);
      console.log(`   🎯 Next Actions: ${assessResult.data.nextActions?.length || 0}`);
      
      if (assessResult.data.output && assessResult.data.output.length > 100) {
        console.log(`   📄 Detailed Analysis: ${assessResult.data.output.length} chars of detailed output`);
      }
    } else {
      console.log(`   ❌ Status: FAILED - ${assessResult.error}`);
    }

    console.log('\n🔄 RESUME Tool Results:');
    if (resumeResult.success) {
      console.log(`   ✅ Status: SUCCESS (${resumeResult.responseLength} chars)`);
      console.log(`   🎯 Prompt: ${resumeResult.data.promptName || 'N/A'}`);
      console.log(`   📊 DRS Score: ${resumeResult.data.context?.drsScore || 'N/A'}`);
      console.log(`   🎯 Confidence: ${resumeResult.data.confidence || 'N/A'}`);
      console.log(`   💡 Recommendations: ${resumeResult.data.recommendations?.length || 0}`);
      console.log(`   🎯 Next Actions: ${resumeResult.data.nextActions?.length || 0}`);
      
      if (resumeResult.data.output && resumeResult.data.output.length > 100) {
        console.log(`   📄 Detailed Analysis: ${resumeResult.data.output.length} chars of detailed output`);
      }
    } else {
      console.log(`   ❌ Status: FAILED - ${resumeResult.error}`);
    }

    console.log('\n🔍 KEY DIFFERENCES:');
    if (assessResult.success && resumeResult.success) {
      const assessOutput = assessResult.data.output?.length || 0;
      const resumeOutput = resumeResult.data.output?.length || 0;
      
      console.log(`   📊 Output Detail: ASSESS (${assessOutput} chars) vs RESUME (${resumeOutput} chars)`);
      console.log(`   💡 Recommendations: ASSESS (${assessResult.data.recommendations?.length || 0}) vs RESUME (${resumeResult.data.recommendations?.length || 0})`);
      console.log(`   🎯 Next Actions: ASSESS (${assessResult.data.nextActions?.length || 0}) vs RESUME (${resumeResult.data.nextActions?.length || 0})`);
      
      if (assessOutput > resumeOutput) {
        console.log('   📈 ASSESS provides more detailed analysis');
      } else if (resumeOutput > assessOutput) {
        console.log('   📈 RESUME provides more detailed analysis');
      } else {
        console.log('   📊 Both tools provide similar detail levels');
      }
    }
  }
}

// Run the comparison
const comparison = new AssessResumeComparison();
comparison.runComparison().catch(error => {
  console.error('Comparison failed:', error);
  process.exit(1);
});