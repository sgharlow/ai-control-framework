# 📝 MCP Tool Renaming & Reordering Guide

## 🎯 Quick Answer: Where to Edit

**PRIMARY LOCATION**: `ai-framework-mcp-server/src/index.ts`
- **Lines 476-695**: The `getPromptTools()` method
- **Lines 163-191**: The `knownPrompts` array (must match tool names)
- **Lines 165-191**: The `promptIdMap` object (maps names to IDs)

## 📍 Step-by-Step Guide to Rename/Reorder Tools

### 1️⃣ Edit Tool Definitions (Primary Location)
**File**: `ai-framework-mcp-server/src/index.ts`  
**Method**: `getPromptTools()` (starts at line 474)

```typescript
private getPromptTools() {
  const prompts = [
    {
      id: 'ASSESS',
      name: 'mcp_ai_framework_1_Assess_Project',  // ← Change number/name here
      description: '📊 Comprehensive project assessment...',  // ← Change description here
      inputs: {}
    },
    // ... more tools
  ];
}
```

**To rename a tool**:
- Change the `name` field (e.g., `mcp_ai_framework_1_Assess_Project` → `mcp_ai_framework_1_Analyze_System`)
- Update the `description` if needed
- Keep the `id` the same (internal identifier)

**To reorder tools**:
- Simply move the entire tool object to a different position in the array
- Update the numbers in the names to reflect new order

### 2️⃣ Update the Known Prompts Array
**File**: `ai-framework-mcp-server/src/index.ts`  
**Lines**: 134-161

```typescript
const knownPrompts = [
  'mcp_ai_framework_1_Assess_Project',  // ← Must match the new names
  'mcp_ai_framework_2_Resume_Work',
  // ... etc
];
```

### 3️⃣ Update the Prompt ID Map
**File**: `ai-framework-mcp-server/src/index.ts`  
**Lines**: 165-191

```typescript
const promptIdMap: Record<string, string> = {
  'mcp_ai_framework_1_Assess_Project': 'ASSESS',  // ← Update tool name (key)
  'mcp_ai_framework_2_Resume_Work': 'RESUME',
  // ... etc
};
```

## 🔧 Example: Renaming and Reordering

### Before:
```typescript
{
  id: 'ASSESS',
  name: 'mcp_ai_framework_1_Assess_Project',
  description: '📊 Comprehensive project assessment...',
},
{
  id: 'RESUME',
  name: 'mcp_ai_framework_2_Resume_Work',
  description: '🔄 Resume work safely...',
},
```

### After (Resume first, renamed Assess):
```typescript
{
  id: 'RESUME',
  name: 'mcp_ai_framework_1_Continue_Session',  // Renamed & reordered to #1
  description: '🔄 Continue your work session...',  // Updated description
},
{
  id: 'ASSESS',
  name: 'mcp_ai_framework_2_Analyze_Health',  // Renamed & reordered to #2
  description: '📊 Analyze project health and status...',
},
```

### Don't forget to update:
1. `knownPrompts` array with new names
2. `promptIdMap` with new name mappings

## 📋 Complete Checklist for Changes

When renaming/reordering tools, update these locations:

### Required Updates:
- [ ] `getPromptTools()` method - tool definitions (line 476+)
- [ ] `knownPrompts` array - list of valid tool names (line 134+)
- [ ] `promptIdMap` object - name to ID mappings (line 165+)

### Build & Test:
```bash
# After making changes:
cd ai-framework-mcp-server
npm run build  # Compile TypeScript
cd ../tests
node test-all-28-tools.js  # Verify all tools work
```

## 🎨 Tool Naming Convention

Current format: `mcp_ai_framework_[NUMBER]_[Tool_Name]`

- **NUMBER**: Order in the list (1-27)
- **Tool_Name**: PascalCase with underscores

Examples:
- `mcp_ai_framework_1_Assess_Project`
- `mcp_ai_framework_15_Decide_Deployment`
- `mcp_ai_framework_26_Select_Optimal_Prompt`

## 💡 Pro Tips

1. **Keep IDs unchanged**: The `id` field (ASSESS, RESUME, etc.) is used internally - don't change these unless you also update the prompt executor

2. **Maintain number sequence**: If you have 25 tools numbered 1-25, keep them sequential

3. **Test after changes**: Always run the test suite to ensure nothing broke

4. **Emoji descriptions**: Feel free to change emojis in descriptions for better visual organization

5. **Backward compatibility**: If you need to maintain old names, you can add duplicate entries in `knownPrompts` and `promptIdMap`

## 🚀 Quick Reorder Script

If you just want to reorder by frequency, you can rearrange the tools in `getPromptTools()` and then run this to fix numbers:

```javascript
// Quick renumber script (run in Node.js)
const tools = [...]; // Your reordered tools array
tools.forEach((tool, index) => {
  const oldName = tool.name;
  const newNumber = index + 1;
  tool.name = tool.name.replace(/mcp_ai_framework_\d+_/, `mcp_ai_framework_${newNumber}_`);
  console.log(`"${oldName}" → "${tool.name}"`);
});
```

## 📊 Current Tool Order (for reference)

1. Assess Project - Most used
2. Resume Work - Daily workflow  
3. Plan Next Action - Planning
4. Decide Next Step - Decision making
5. Start Session - Session init
... (and so on)

## ✅ Summary

**To rename/reorder MCP tools:**
1. Edit `ai-framework-mcp-server/src/index.ts`
2. Update the `getPromptTools()` method (line 476+)
3. Update `knownPrompts` array (line 134+)
4. Update `promptIdMap` object (line 165+)
5. Build with `npm run build`
6. Test with `node tests/test-all-28-tools.js`

That's it! The tools will appear in your new order/names in Kiro and other MCP clients.