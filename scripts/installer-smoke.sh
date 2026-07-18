#!/usr/bin/env bash
# Installer smoke test.
# Verifies that bin/cli.js:
#   (1) parses (node --check)
#   (2) scaffolds the same file set as install.sh (minus the MCP server,
#       which is deliberately not bundled in the npm package)
#   (3) refuses to overwrite an existing install without --force (exit 1)
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/acf-smoke.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

echo "== (1) node --check bin/cli.js"
node --check "$REPO_DIR/bin/cli.js"
echo "OK syntax"

echo "== (2) scaffold via bin/cli.js and diff against install.sh"
A="$WORK/cli-target"
B="$WORK/sh-target"
mkdir -p "$A"
(cd "$A" && node "$REPO_DIR/bin/cli.js" > "$WORK/cli.log" 2>&1) || {
  echo "cli.js failed:"; cat "$WORK/cli.log"; exit 1; }
bash "$REPO_DIR/install.sh" "$B" > "$WORK/install-sh.log" 2>&1 || {
  echo "install.sh failed:"; tail -50 "$WORK/install-sh.log"; exit 1; }

(cd "$A" && find ai-framework -type f | sort) > "$WORK/a-framework.txt"
(cd "$B" && find ai-framework -type f | sort) > "$WORK/b-framework.txt"
diff -u "$WORK/b-framework.txt" "$WORK/a-framework.txt"
echo "OK ai-framework file lists identical ($(wc -l < "$WORK/a-framework.txt" | tr -d ' ') files)"

# Root-level artifacts; the MCP server is excluded from the comparison because
# it is deliberately not shipped in the npm package (fetch it from the repo).
(cd "$A" && find . -maxdepth 1 -mindepth 1 | sort | grep -v '^\./ai-framework-mcp-server$') > "$WORK/a-root.txt"
(cd "$B" && find . -maxdepth 1 -mindepth 1 | sort | grep -v '^\./ai-framework-mcp-server$') > "$WORK/b-root.txt"
diff -u "$WORK/b-root.txt" "$WORK/a-root.txt"
echo "OK root artifact lists identical (MCP server excluded by design)"

test "$(cat "$A/.drs-score")" = "0" && echo "OK .drs-score initialized to 0"
test -d "$A/evidence" && echo "OK evidence/ directory created"
grep -q "AI Control Framework" "$A/.gitignore" && echo "OK .gitignore framework block present"
test -f "$A/run-check.sh" && echo "OK run-check.sh generated"
test -f "$A/QUICK-REFERENCE.md" && echo "OK QUICK-REFERENCE.md generated"
grep -q "SESSION CONTROL" "$A/ai-framework/templates/code.md" && echo "OK session template initialized"

echo "== (3) re-run without --force must refuse with exit 1"
set +e
(cd "$A" && node "$REPO_DIR/bin/cli.js" > "$WORK/refuse.log" 2>&1)
RC=$?
set -e
if [ "$RC" -ne 1 ]; then
  echo "FAIL: expected exit code 1, got $RC"; cat "$WORK/refuse.log"; exit 1
fi
grep -q "Refusing to overwrite" "$WORK/refuse.log"
echo "OK refused with exit 1 and listed conflicts"

echo "== (3b) re-run WITH --force must succeed"
(cd "$A" && node "$REPO_DIR/bin/cli.js" --force > /dev/null)
echo "OK --force overwrites"

echo ""
echo "ALL INSTALLER SMOKE CHECKS PASSED"
