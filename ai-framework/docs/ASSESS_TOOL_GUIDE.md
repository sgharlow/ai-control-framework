# AI Framework MCP Assess Tool - Testing Guide

## ✅ Tool Status: WORKING PERFECTLY

The `assess` tool from the ai-framework MCP server is fully functional and ready for use in Kiro.

## 🎯 What the Assess Tool Does

The assess tool provides a comprehensive analysis of your AI Framework project, including:

- **DRS Score**: Development Readiness Score (0-100, need 85+ to deploy)
- **Project Health**: Overall project status assessment
- **Framework Compliance**: Checks adherence to AI Framework rules
- **Time Gates**: Progress tracking against session milestones
- **Evidence Freshness**: How recent your proof/evidence is
- **Recommended Actions**: Prioritized next steps
- **Pattern Recommendations**: Suggests implementation patterns

## 🔧 How to Test in Kiro

### Method 1: Using MCP Panel
1. **Open MCP Panel**: Look for MCP icon in Kiro's sidebar
2. **Find ai-framework Server**: Should show as "ai-framework" 
3. **Locate assess Tool**: Look for "assess" in the tools list
4. **Call the Tool**: Click to execute (no parameters needed)
5. **View Results**: Get comprehensive project assessment

### Method 2: Using Command Palette
1. **Open Command Palette**: Ctrl+Shift+P (or Cmd+Shift+P on Mac)
2. **Search for MCP**: Type "MCP" to find MCP-related commands
3. **Select Tool**: Choose the assess tool from ai-framework server
4. **Execute**: Run the tool to get assessment

## 📊 Sample Output

When you run the assess tool, you'll get a detailed report like this:

```
## 📊 COMPREHENSIVE PROJECT STATE ANALYSIS

### EXECUTIVE SUMMARY
**Project Health**: CONCERNING
**DRS Score**: 37/100 (threshold: 85)
**Can Deploy**: ❌ NO
**Session Time**: 0 minutes elapsed, 30 remaining
**Immediate Action**: ENTER CRITICAL PATH RECOVERY

### RECOMMENDED ACTIONS (Prioritized)
1. **IMMEDIATE (Next 5 minutes)**
   - Capture evidence immediately
   - Select pattern from PATTERNS.md

2. **SHORT TERM (Next 30 minutes)**
   - Improve DRS by 48 points
   - Complete at least 50% of current task
   - Establish real service connections
```

## 🎯 Key Metrics Explained

- **DRS Score**: Your project's deployment readiness (aim for 85+)
- **Confidence**: AI's confidence in assessment (LOW/MEDIUM/HIGH)
- **Project State**: Current phase (INITIAL/DEVELOPMENT/READY)
- **Completion %**: How much of current task is done
- **Evidence Count**: Number of proof points captured
- **Time Remaining**: Minutes left in current session

## 🚀 Next Steps After Assessment

Based on the assess results, you can use other AI Framework tools:

- **Low DRS Score**: Use `plan` or `decline` tools
- **Need Evidence**: Use `evidence` tool
- **Ready to Deploy**: Use `deploy_decide` tool
- **Blocked**: Use `blocked` tool
- **Need Guidance**: Use `uncertainty` tool

## 🔍 Troubleshooting

If the assess tool doesn't work:

1. **Check MCP Configuration**: Ensure `.kiro/settings/mcp.json` points to `fixed-ai-framework-server.js`
2. **Restart Kiro**: Sometimes MCP servers need reconnection
3. **Check Server Status**: Look for "ai-framework" in MCP panel
4. **View Logs**: Check Kiro's output panel for MCP errors

## ✅ Test Results

All tests pass:
- ✅ Basic assess call: SUCCESS
- ✅ Assess with project path: SUCCESS  
- ✅ Error handling: SUCCESS
- ✅ MCP protocol compliance: SUCCESS
- ✅ Response parsing: SUCCESS

The assess tool is production-ready and safe to use in Kiro!