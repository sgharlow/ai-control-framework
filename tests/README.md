# AI Framework MCP Server Tests

This directory contains automated tests for the AI Framework MCP Server.

## Test Files

### `test-framework-state-reader.js`
Unit test for the FrameworkStateReader component. Tests:
- Component instantiation
- Framework state reading
- Property validation
- EnhancedPromptExecutor integration

**Usage:**
```bash
node tests/test-framework-state-reader.js
```

### `test-ai-framework-mcp.js`
Comprehensive integration test for the entire MCP server. Tests:
- Server startup
- MCP protocol compliance
- All 28+ MCP tools
- Error handling

**Usage:**
```bash
node tests/test-ai-framework-mcp.js
```

## Running Tests

To run all tests:
```bash
# Unit tests
node tests/test-framework-state-reader.js

# Integration tests  
node tests/test-ai-framework-mcp.js
```

## Test Results

Both tests should pass with 100% success rate after the fixes applied for:
- Missing `todos` property in FrameworkState
- Unsafe property access patterns
- Missing optional properties in type definitions

## Troubleshooting

If tests fail:
1. Ensure the server is built: `cd ai-framework-mcp-server && npm run build`
2. Check that all dependencies are installed: `npm install`
3. Verify the project structure includes required files (orchestration.md, tasks.md, etc.)