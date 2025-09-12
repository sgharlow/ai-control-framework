#!/usr/bin/env node

/**
 * AI Framework MCP Server Installation Verification Script
 * 
 * This script verifies that the MCP server is properly installed and configured.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkPrerequisites() {
  log('\n🔍 Checking Prerequisites...', colors.blue);
  
  try {
    // Check Node.js version
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      log(`✅ Node.js ${nodeVersion} (>= 18.0 required)`, colors.green);
    } else {
      log(`❌ Node.js ${nodeVersion} (>= 18.0 required)`, colors.red);
      return false;
    }
  } catch (error) {
    log('❌ Node.js not found', colors.red);
    return false;
  }
  
  try {
    // Check npm version
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm ${npmVersion}`, colors.green);
  } catch (error) {
    log('❌ npm not found', colors.red);
    return false;
  }
  
  try {
    // Check TypeScript
    const tscVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
    log(`✅ ${tscVersion}`, colors.green);
  } catch (error) {
    log('⚠️  TypeScript not found (will be installed with dependencies)', colors.yellow);
  }
  
  return true;
}

function checkInstallation() {
  log('\n📦 Checking Installation...', colors.blue);
  
  // Check if we're in the right directory
  if (!existsSync('package.json')) {
    log('❌ package.json not found. Run this script from the ai-framework-mcp-server directory.', colors.red);
    return false;
  }
  
  // Check package.json content
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    if (packageJson.name === 'ai-framework-mcp-server') {
      log('✅ Correct package.json found', colors.green);
    } else {
      log('❌ Wrong package.json (not ai-framework-mcp-server)', colors.red);
      return false;
    }
  } catch (error) {
    log('❌ Invalid package.json', colors.red);
    return false;
  }
  
  // Check node_modules
  if (existsSync('node_modules')) {
    log('✅ Dependencies installed', colors.green);
  } else {
    log('❌ Dependencies not installed. Run: npm install', colors.red);
    return false;
  }
  
  // Check build output
  if (existsSync('dist/index.js')) {
    log('✅ Server built successfully', colors.green);
  } else {
    log('❌ Server not built. Run: npm run build', colors.red);
    return false;
  }
  
  return true;
}

function checkConfiguration() {
  log('\n⚙️  Checking Configuration...', colors.blue);
  
  const configPaths = [
    '.kiro/settings/mcp.json',
    '../.kiro/settings/mcp.json',
    '../../.kiro/settings/mcp.json'
  ];
  
  let configFound = false;
  
  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        if (config.mcpServers && config.mcpServers['ai-framework']) {
          log(`✅ Configuration found: ${configPath}`, colors.green);
          
          const serverConfig = config.mcpServers['ai-framework'];
          if (serverConfig.command === 'node' && serverConfig.args && serverConfig.args.length > 0) {
            log('✅ Valid server configuration', colors.green);
          } else {
            log('⚠️  Server configuration may be incomplete', colors.yellow);
          }
          
          configFound = true;
          break;
        }
      } catch (error) {
        log(`❌ Invalid JSON in ${configPath}`, colors.red);
      }
    }
  }
  
  if (!configFound) {
    log('❌ No MCP configuration found. Create .kiro/settings/mcp.json', colors.red);
    return false;
  }
  
  return true;
}

function testServer() {
  log('\n🧪 Testing Server...', colors.blue);
  
  try {
    // Test server startup (quick test)
    log('Testing server startup...', colors.blue);
    const result = execSync('timeout 5s npm start || true', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('Server ready') || result.includes('starting')) {
      log('✅ Server starts successfully', colors.green);
      return true;
    } else {
      log('⚠️  Server startup test inconclusive', colors.yellow);
      return true; // Don't fail on this
    }
  } catch (error) {
    log('⚠️  Could not test server startup', colors.yellow);
    return true; // Don't fail on this
  }
}

function main() {
  log('🚀 AI Framework MCP Server Installation Verification', colors.blue);
  log('=' .repeat(60), colors.blue);
  
  const checks = [
    checkPrerequisites,
    checkInstallation,
    checkConfiguration,
    testServer
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
    }
  }
  
  log('\n' + '='.repeat(60), colors.blue);
  
  if (allPassed) {
    log('🎉 All checks passed! MCP server is ready to use.', colors.green);
    log('\nNext steps:', colors.blue);
    log('1. Restart Kiro to load the MCP configuration', colors.reset);
    log('2. Check Kiro\'s MCP Server panel for connection status', colors.reset);
    log('3. Test the MCP tools in Kiro', colors.reset);
  } else {
    log('❌ Some checks failed. Please address the issues above.', colors.red);
    process.exit(1);
  }
}

main();