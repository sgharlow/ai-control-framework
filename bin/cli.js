#!/usr/bin/env node
'use strict';

/*
 * AI Control Framework installer.
 *
 * Scaffolds the framework into the CURRENT directory, mirroring what the
 * repo's install.sh / Install.ps1 do:
 *   - copies ai-framework/ (specs, templates, reference, docs) with the same
 *     exclusion list install.sh uses
 *   - copies CLAUDE.md, validate-framework.sh, Validate-Framework.ps1 to the
 *     project root
 *   - creates evidence/, the tracking files (.contract-hashes, .drs-score,
 *     .drs-history), run-check.sh, QUICK-REFERENCE.md, and the initial
 *     ai-framework/templates/code.md session file
 *   - appends the framework block to .gitignore and installs the pre-commit
 *     hook when a .git directory exists
 *
 * Difference from install.sh: the optional ai-framework-mcp-server component
 * is NOT shipped in this npm package (it has its own build/CI); get it from
 * https://github.com/sgharlow/ai-control-framework if you want it.
 *
 * Refuses to overwrite existing files unless --force is given.
 */

const fs = require('fs');
const path = require('path');

const VERSION = require(path.join(__dirname, '..', 'package.json')).version;
const PKG_ROOT = path.join(__dirname, '..');

// Same exclusion list as install.sh / Install.ps1
const EXCLUDE_NAMES = [
  'node_modules', '.git', 'dist', 'build', '.DS_Store', 'Thumbs.db',
  'package-lock.json', 'yarn.lock', '.env', '.env.local',
];
const EXCLUDE_SUFFIXES = ['.log', '.tmp'];

function isExcluded(relPath) {
  const segments = relPath.split(/[\\/]/);
  for (const seg of segments) {
    if (EXCLUDE_NAMES.includes(seg)) return true;
    for (const suf of EXCLUDE_SUFFIXES) {
      if (seg.endsWith(suf)) return true;
    }
  }
  return false;
}

function walk(dir, base, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(base, abs);
    if (isExcluded(rel)) continue;
    if (entry.isDirectory()) {
      walk(abs, base, out);
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Generated file contents (verbatim from install.sh heredocs)
// ---------------------------------------------------------------------------

const RUN_CHECK_SH = `#!/bin/bash
# Cross-platform wrapper for framework checks

# Function to run a script with proper path handling
run_script() {
    local script_name="$1"
    shift

    # Try different implementations in order
    if [ -f "ai-framework/reference/bash/\${script_name}.sh" ]; then
        bash "ai-framework/reference/bash/\${script_name}.sh" "$@"
    elif [ -f "ai-framework/reference/powershell/\${script_name}.ps1" ] && (command -v powershell &> /dev/null || command -v pwsh &> /dev/null); then
        if command -v pwsh &> /dev/null; then
            pwsh -ExecutionPolicy Bypass -File "ai-framework/reference/powershell/\${script_name}.ps1" "$@"
        else
            powershell -ExecutionPolicy Bypass -File "ai-framework/reference/powershell/\${script_name}.ps1" "$@"
        fi
    elif command -v python &> /dev/null && [ -f "ai-framework/reference/python/\${script_name}.py" ]; then
        python "ai-framework/reference/python/\${script_name}.py" "$@"
    else
        echo "Error: Script \${script_name} not found"
        exit 1
    fi
}

# Main check routine
case "$1" in
    contracts)
        run_script check-contracts
        ;;
    mocks)
        run_script detect-mocks
        ;;
    scope)
        run_script check-scope
        ;;
    drs)
        run_script drs-calculate
        ;;
    continue)
        run_script can-i-continue
        ;;
    evidence)
        shift
        run_script capture-evidence "$@"
        ;;
    all)
        echo "Running all checks..."
        run_script can-i-continue
        ;;
    *)
        echo "Usage: ./run-check.sh {contracts|mocks|scope|drs|continue|evidence|all}"
        exit 1
        ;;
esac
`;

const QUICK_REFERENCE_MD = `# AI Control Framework - Quick Reference

## Essential Commands

### Check if safe to continue
\`\`\`bash
./run-check.sh continue
\`\`\`

### Calculate Deployability Score
\`\`\`bash
./run-check.sh drs
\`\`\`

### Run all checks
\`\`\`bash
./run-check.sh all
\`\`\`

## Key Prompts for Claude Code

### Start every session with:
\`\`\`
I'm using the AI Control Framework.
Read CLAUDE.md and ai-framework/templates/code.md.
Run ./run-check.sh continue
\`\`\`

### When blocked:
\`\`\`
I'm blocked. Run diagnostics and document per framework prompt F.
\`\`\`

### To deploy (when DRS >= 85):
\`\`\`
Ready to deploy. Execute framework prompt G for production deployment.
\`\`\`

## Framework Rules
- Max 5 files per session
- Max 200 lines per session
- Mocks expire after 30 minutes
- Contracts are frozen (no changes without CCR)
- DRS >= 85 required for deployment

## Get Help
- Documentation: ai-framework/docs/
- Prompts: ai-framework/docs/CLAUDE-CODE-PROMPTS.md
- Troubleshooting: ./run-check.sh all
`;

const CODE_MD = `# SESSION CONTROL — Read First, Check Often
**Purpose: Current state tracking for AI agents**

## Mission (ONE Thing)

- **Goal:** [TO BE DEFINED - Set specific test/feature goal]
- **Pattern:** [TO BE SELECTED - Choose from patterns.md]
- **Scope:** 5 files max, 200 LOC max

## Contracts (Frozen)

- **Files:** [TO BE DEFINED - List contract files when created]
- **Hash:** [Initialize using appropriate implementation]
- **Status:** AWAITING INITIALIZATION

## Real Services (No Mocks)

- **API Endpoint:** [TO BE CONFIGURED]
- **Auth Service:** [TO BE CONFIGURED]
- **Database:** [TO BE CONFIGURED]
- **Last Real Call:** [NOT YET CONNECTED]

## Deployability Score

- **Current:** 0% (Not initialized)
- **Target:** 100%
- **Blockers:**
  - No contracts defined
  - No real services connected
  - No tests created
- **Next Action:** Define project contracts and goals
- **Time to Deployable:** TBD after initialization

## Stop Conditions (Any = STOP)

- Contract hash mismatch
- Mock detected after 30m
- Scope exceeded (files/LOC)
- Confidence = LOW/BLOCKED
- No real API calls in 10m
`;

const GITIGNORE_BLOCK = `# AI Control Framework
.drs-score
.drs-history
.contract-hashes.backup.*
evidence/
handoff-*.md
handoff.txt
*.log

# Session files
.session-*
.claude-session

# Temporary files
*.tmp
*.bak
`;

const PRE_COMMIT_HOOK = `#!/bin/bash
# AI Control Framework Pre-commit Hook

echo "Running AI Control Framework checks..."

# Framework checks - use appropriate implementation
echo "Perform framework checks per ai-framework/specs/"
echo "Use implementation appropriate for your environment"
if [ $? -ne 0 ]; then
    echo "Scope exceeded. Commit aborted."
    exit 1
fi

# Check DRS
if [ -f .drs-score ]; then
    DRS=$(cat .drs-score)
    if [ "$DRS" -lt 50 ]; then
        echo "Warning: DRS is low ($DRS/100)"
        echo "Consider improving before commit"
    fi
fi

echo "AI Control checks passed"
`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`ai-control-framework v${VERSION}

Usage: npx ai-control-framework [--force]

Scaffolds the AI Control Framework into the current directory.

Options:
  --force      Overwrite existing files
  -h, --help   Show this help
`);
    return 0;
  }
  const force = args.includes('--force');
  const unknown = args.filter((a) => !['--force'].includes(a));
  if (unknown.length > 0) {
    console.error(`Unknown argument(s): ${unknown.join(' ')}`);
    console.error('Usage: npx ai-control-framework [--force]');
    return 1;
  }

  const target = process.cwd();

  console.log('=======================================================');
  console.log(`       AI Control Framework Installer v${VERSION}`);
  console.log('=======================================================');
  console.log('');
  console.log(`-> Installing framework in: ${target}`);
  console.log('');

  // Build the copy manifest: [sourceAbsPath, destRelPath]
  const copies = [];

  const srcFramework = path.join(PKG_ROOT, 'ai-framework');
  if (!fs.existsSync(srcFramework)) {
    console.error(`Error: Source ai-framework directory not found at ${srcFramework}`);
    return 1;
  }
  for (const rel of walk(srcFramework, srcFramework, [])) {
    copies.push([path.join(srcFramework, rel), path.join('ai-framework', rel)]);
  }

  // Root files install.sh copies into the project root
  for (const rootFile of ['CLAUDE.md', 'Validate-Framework.ps1', 'validate-framework.sh']) {
    const src = path.join(PKG_ROOT, rootFile);
    if (fs.existsSync(src)) copies.push([src, rootFile]);
  }

  // Generated files: [destRelPath, content]
  const generated = [
    ['run-check.sh', RUN_CHECK_SH],
    ['QUICK-REFERENCE.md', QUICK_REFERENCE_MD],
    [path.join('ai-framework', 'templates', 'code.md'), CODE_MD],
    ['.contract-hashes', ''],
    ['.drs-score', '0\n'],
    ['.drs-history', ''],
  ];

  const hasGitDir = fs.existsSync(path.join(target, '.git')) &&
    fs.statSync(path.join(target, '.git')).isDirectory();
  if (hasGitDir) {
    generated.push([path.join('.git', 'hooks', 'pre-commit'), PRE_COMMIT_HOOK]);
  }

  // code.md is both copied and generated; the generated session template wins
  // (matches install.sh, which overwrites it after the copy). Deduplicate.
  const generatedSet = new Set(generated.map(([rel]) => rel));
  const finalCopies = copies.filter(([, rel]) => !generatedSet.has(rel));

  // Conflict check: refuse to overwrite anything without --force
  const allDest = [...finalCopies.map(([, rel]) => rel), ...generated.map(([rel]) => rel)];
  const conflicts = allDest.filter((rel) => fs.existsSync(path.join(target, rel)));
  if (conflicts.length > 0 && !force) {
    console.error('Refusing to overwrite existing files (re-run with --force to overwrite):');
    for (const rel of conflicts.sort()) {
      console.error(`  ${rel}`);
    }
    return 1;
  }

  // Copy framework files
  console.log('Copying framework files (excluding node_modules, etc.)...');
  for (const [src, rel] of finalCopies) {
    const dest = path.join(target, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  console.log(`OK Framework files copied (${finalCopies.length} files)`);

  // Generated files + tracking files
  for (const [rel, content] of generated) {
    const dest = path.join(target, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
  }

  // evidence/ directory
  fs.mkdirSync(path.join(target, 'evidence'), { recursive: true });

  // .gitignore: append the framework block unless already present
  const gitignorePath = path.join(target, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const existing = fs.readFileSync(gitignorePath, 'utf8');
    if (!existing.includes('# AI Control Framework')) {
      fs.appendFileSync(gitignorePath, `\n${GITIGNORE_BLOCK}`);
    }
  } else {
    fs.writeFileSync(gitignorePath, GITIGNORE_BLOCK);
  }

  if (hasGitDir) {
    console.log('OK Git pre-commit hook installed');
  }

  // Make scripts executable (no-op on Windows)
  if (process.platform !== 'win32') {
    const chmodTargets = ['run-check.sh', 'validate-framework.sh'];
    const bashDir = path.join(target, 'ai-framework', 'reference', 'bash');
    if (fs.existsSync(bashDir)) {
      for (const f of fs.readdirSync(bashDir)) {
        if (f.endsWith('.sh')) chmodTargets.push(path.join('ai-framework', 'reference', 'bash', f));
      }
    }
    if (hasGitDir) chmodTargets.push(path.join('.git', 'hooks', 'pre-commit'));
    for (const rel of chmodTargets) {
      const p = path.join(target, rel);
      try {
        if (fs.existsSync(p)) fs.chmodSync(p, 0o755);
      } catch {
        /* best effort */
      }
    }
  }

  // Final summary (mirrors install.sh next steps / README quick start)
  console.log('');
  console.log('=======================================================');
  console.log('OK AI Control Framework installed successfully!');
  console.log('=======================================================');
  console.log('');
  console.log('Next steps:');
  console.log('');
  console.log(`1. Open Claude Code in this directory: ${target}`);
  console.log('');
  console.log('2. Initialize your project:');
  console.log('   bash ai-framework/reference/bash/initialize-project.sh');
  console.log('');
  console.log('3. To validate the installation, you can run:');
  console.log('   Bash: ./validate-framework.sh');
  console.log('   PowerShell: ./Validate-Framework.ps1');
  console.log('');
  console.log('4. Copy and paste this initialization prompt:');
  console.log('');
  console.log('   Initialize the AI Control Framework for this project.');
  console.log('   Read all template files in ai-framework/templates/');
  console.log('   Help me set up: [describe your project]');
  console.log('');
  console.log('5. For every future session, start with:');
  console.log('');
  console.log("   I'm using the AI Control Framework.");
  console.log('   Read CLAUDE.md and ai-framework/IMPLEMENTATION-GUIDE.md');
  console.log('   Perform safety checks using appropriate implementation');
  console.log('');
  console.log('Quick reference saved to: QUICK-REFERENCE.md');
  console.log('Full prompts available in: ai-framework/docs/CLAUDE-CODE-PROMPTS.md');
  console.log('');
  console.log('Optional: the MCP server component is not bundled in this npm package.');
  console.log('Get it from https://github.com/sgharlow/ai-control-framework (ai-framework-mcp-server/).');
  console.log('');
  console.log('Happy disciplined coding!');
  return 0;
}

process.exit(main());
