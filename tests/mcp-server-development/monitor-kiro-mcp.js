const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Get the latest Kiro log directory
function getLatestKiroLogDir() {
  const kiroLogsPath = path.join(process.env.APPDATA, 'Kiro', 'logs');
  const logDirs = fs.readdirSync(kiroLogsPath)
    .map(dir => ({
      name: dir,
      path: path.join(kiroLogsPath, dir),
      mtime: fs.statSync(path.join(kiroLogsPath, dir)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  return logDirs[0]?.path;
}

// Monitor MCP-related log entries
function monitorMCPLogs() {
  const latestLogDir = getLatestKiroLogDir();
  if (!latestLogDir) {
    console.log('❌ Could not find Kiro log directory');
    return;
  }

  const mainLogPath = path.join(latestLogDir, 'main.log');
  console.log(`📊 Monitoring Kiro MCP logs: ${mainLogPath}`);
  console.log('🔍 Watching for MCP server events...\n');

  // Track the current file size to only read new content
  let lastSize = 0;
  try {
    lastSize = fs.statSync(mainLogPath).size;
  } catch (e) {
    console.log('⚠️ Main log file not found, waiting...');
  }

  // Watch for file changes
  const watcher = fs.watchFile(mainLogPath, { interval: 500 }, (curr, prev) => {
    if (curr.size > lastSize) {
      // Read only the new content
      const stream = fs.createReadStream(mainLogPath, {
        start: lastSize,
        end: curr.size
      });

      let newContent = '';
      stream.on('data', chunk => {
        newContent += chunk.toString();
      });

      stream.on('end', () => {
        const lines = newContent.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          // Filter for MCP-related log entries
          if (line.toLowerCase().includes('mcp') || 
              line.toLowerCase().includes('ai-framework') ||
              line.toLowerCase().includes('server') ||
              line.toLowerCase().includes('error') ||
              line.toLowerCase().includes('crash') ||
              line.toLowerCase().includes('exception')) {
            
            const timestamp = new Date().toLocaleTimeString();
            
            // Color code different types of messages
            if (line.toLowerCase().includes('error') || line.toLowerCase().includes('crash')) {
              console.log(`🔴 [${timestamp}] ${line}`);
            } else if (line.toLowerCase().includes('mcp') || line.toLowerCase().includes('ai-framework')) {
              console.log(`🔵 [${timestamp}] ${line}`);
            } else if (line.toLowerCase().includes('server')) {
              console.log(`🟡 [${timestamp}] ${line}`);
            } else {
              console.log(`⚪ [${timestamp}] ${line}`);
            }
          }
        });
      });

      lastSize = curr.size;
    }
  });

  // Also monitor for process crashes
  console.log('🎯 MCP Log Monitor Active');
  console.log('📝 Legend:');
  console.log('  🔴 Errors/Crashes');
  console.log('  🔵 MCP/AI-Framework events');
  console.log('  🟡 Server events');
  console.log('  ⚪ Other relevant events');
  console.log('\n' + '='.repeat(60));

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n📊 Stopping MCP log monitor...');
    fs.unwatchFile(mainLogPath);
    process.exit(0);
  });
}

// Start monitoring
monitorMCPLogs();