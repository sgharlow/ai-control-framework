#!/bin/bash
# Sprint-9 benchmark harness — implements benchmarks/METHODOLOGY.md (M1-M6).
#
# Usage: bash benchmarks/run-benchmark.sh [repos-file]
#   repos-file format: cohort<TAB>name[@sha]   (repos are sgharlow/<name> on GitHub)
#
# Outputs (all under benchmarks/):
#   data/repos.lock      cohort<TAB>name<TAB>resolved-sha (pinned commits, reproducible)
#   data/results.jsonl   one JSON line per repo (raw measurements)
#   data/raw/m1-*.txt    full M1 grep output (file:line:match) per repo
#   RESULTS.md           rendered tables + aggregates (via lib/render-results.mjs)
#
# SAFETY: never executes repo code. Only compilers/syntax checkers run
# (tsc --noEmit, node --check, python -m compileall, bash -n). npm install uses
# --ignore-scripts. During M5 (drs-calculate.sh) a PATH shim blocks npm/make/yarn/pnpm
# so the framework script's own `npm test` step cannot execute repo code — see the
# "Deviations" section of RESULTS.md.
#
# Requires: git, gh (authenticated), node >= 18, python, GNU grep/find/timeout (Git Bash ok).

set -u

BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRAMEWORK_ROOT="$(cd "$BENCH_DIR/.." && pwd)"
DRS_SCRIPT="$FRAMEWORK_ROOT/ai-framework/reference/bash/drs-calculate.sh"

REPOS_FILE="${1:-$BENCH_DIR/data/repos.txt}"
DATA_DIR="$BENCH_DIR/data"
RAW_DIR="$DATA_DIR/raw"
RESULTS_JSONL="$DATA_DIR/results.jsonl"
LOCK_FILE="$DATA_DIR/repos.lock"
GH_OWNER="${GH_OWNER:-sgharlow}"
WORK_DIR="${BENCH_WORK_DIR:-$(mktemp -d -t bench-XXXXXX)}"

mkdir -p "$RAW_DIR" "$WORK_DIR"
: > "$RESULTS_JSONL"
: > "$LOCK_FILE"

# --- M5 safety shim: block package managers / make so drs-calculate.sh cannot run repo code
SHIM_DIR="$WORK_DIR/.shim"
mkdir -p "$SHIM_DIR"
for tool in npm make yarn pnpm npx bun; do
  printf '#!/bin/sh\necho "%s blocked by benchmark harness (M5 safety shim)" >&2\nexit 1\n' "$tool" > "$SHIM_DIR/$tool"
  chmod +x "$SHIM_DIR/$tool"
done

# --- M1 patterns: reused VERBATIM from ai-framework/reference/bash/detect-mocks.sh
M1_PATTERN='mock|stub|fake|dummy|test.*data|hardcoded.*response|setTimeout.*simulate|Promise.resolve.*fake'
M1_DIRS=(src lib app api services components)          # detect-mocks.sh SCAN_DIRS, verbatim
M1_EXT=( -name '*.js' -o -name '*.ts' -o -name '*.jsx' -o -name '*.tsx' -o -name '*.py' -o -name '*.rb' -o -name '*.java' )
# excluded dir names (test/fixture/eval/mock-named), per methodology
M1_PRUNE=( -iname 'test' -o -iname 'tests' -o -iname '__tests__' -o -iname 'e2e' -o -iname 'spec' -o -iname 'specs' -o -iname 'fixture' -o -iname 'fixtures' -o -iname 'eval' -o -iname 'evals' -o -iname 'mock' -o -iname 'mocks' -o -iname '__mocks__' -o -iname 'node_modules' )

emit() { # emits one JSON result line from BM_* env vars
  BM_OUT="$RESULTS_JSONL" node "$BENCH_DIR/lib/emit-result.mjs"
}

echo "Work dir: $WORK_DIR"
echo "Results:  $RESULTS_JSONL"
echo ""

while IFS=$'\t' read -r cohort spec_name; do
  [ -z "${cohort:-}" ] && continue
  case "$cohort" in \#*) continue ;; esac
  name="${spec_name%%@*}"
  pin_sha=""
  [ "$spec_name" != "$name" ] && pin_sha="${spec_name#*@}"

  echo "=== [$cohort] $name ${pin_sha:+@ $pin_sha}"
  dir="$WORK_DIR/$name"
  rm -rf "$dir"

  # ---- clone (shallow, read-only; archived repos clone fine) ----
  clone_err=""
  if ! git clone --quiet --depth 50 --no-tags "https://github.com/$GH_OWNER/$name.git" "$dir" 2> "$WORK_DIR/clone.err"; then
    clone_err="$(head -3 "$WORK_DIR/clone.err" | tr '\n' ' ')"
  elif [ -n "$pin_sha" ]; then
    if ! git -C "$dir" checkout --quiet "$pin_sha" 2>/dev/null; then
      git -C "$dir" fetch --quiet --depth 1 origin "$pin_sha" 2>/dev/null && \
        git -C "$dir" checkout --quiet FETCH_HEAD 2>/dev/null || clone_err="pinned sha $pin_sha not reachable"
    fi
  fi
  if [ -n "$clone_err" ]; then
    echo "  CLONE FAILED: $clone_err"
    BM_COHORT="$cohort" BM_NAME="$name" BM_SHA="${pin_sha:-unresolved}" BM_ERROR="clone failed: $clone_err" emit
    continue
  fi
  sha="$(git -C "$dir" rev-parse HEAD)"
  printf '%s\t%s\t%s\n' "$cohort" "$name" "$sha" >> "$LOCK_FILE"

  # ---- M1: mock/placeholder residue (detect-mocks.sh patterns, verbatim) ----
  m1_raw="$RAW_DIR/m1-$name.txt"
  : > "$m1_raw"
  (
    cd "$dir"
    for d in "${M1_DIRS[@]}"; do
      [ -d "$d" ] || continue
      find "$d" \( -type d \( "${M1_PRUNE[@]}" \) -prune \) -o -type f \( "${M1_EXT[@]}" \) -print 2>/dev/null
    done
  ) | while IFS= read -r f; do
    # detect-mocks.sh also excludes files named *.test.* / *.spec.* / *.mock.*
    case "$f" in *.test.*|*.spec.*|*.mock.*) continue ;; esac
    (cd "$dir" && grep -inHE "($M1_PATTERN)" "$f" 2>/dev/null) >> "$m1_raw" || true
  done
  m1_hits=$(wc -l < "$m1_raw" | tr -d ' ')
  m1_files_sample=$(cut -d: -f1,2 "$m1_raw" | head -5)
  m1_file_count=$(cut -d: -f1 "$m1_raw" | sort -u | wc -l | tr -d ' ')

  # ---- M2: unverifiable README claims ----
  readme=""
  for f in README.md readme.md Readme.md README.MD; do [ -f "$dir/$f" ] && { readme="$dir/$f"; break; }; done
  m2_flags=""
  has_workflows=false
  [ -d "$dir/.github/workflows" ] && has_workflows=true
  if [ -n "$readme" ]; then
    # static shields "badge/" URLs are hand-written by construction; flag when text implies status
    # decode %20 first so URL-encoded spaces/chars don't false-positive the '%' check;
    # '%' only counts as a status signal when it is a numeric percentage (e.g. 100%25)
    badges=$(grep -oiE 'img\.shields\.io/badge/[^)" ]*' "$readme" 2>/dev/null | sed 's/%20/ /g' | grep -iE 'passing|tests|coverage|[0-9]+(%25|%([^0-9a-f]|$))' || true)
    while IFS= read -r b; do
      [ -n "$b" ] && m2_flags="${m2_flags}static-status-badge: ${b}"$'\n'
    done <<< "$badges"
    # numeric test-count claims count as unverifiable only when no workflows dir exists
    if [ "$has_workflows" = false ]; then
      claims=$(grep -oiE '[0-9][0-9,]*\+?[[:space:]]+(unit |integration |e2e )?tests?\b|[0-9]+/[0-9]+[[:space:]]*(tests|passing)|[0-9]+%[[:space:]]+(test[[:space:]]+)?coverage' "$readme" 2>/dev/null | sort -u | head -10 || true)
      while IFS= read -r c; do
        [ -n "$c" ] && m2_flags="${m2_flags}test-count-claim-no-workflow: ${c}"$'\n'
      done <<< "$claims"
    fi
  fi

  # ---- M6: license + lockfile hygiene ----
  m6_license=false
  for f in LICENSE LICENSE.md LICENSE.txt LICENCE COPYING; do [ -f "$dir/$f" ] && { m6_license=true; break; }; done
  m6_lockfile="n/a"
  if [ -f "$dir/package.json" ]; then
    m6_lockfile=false
    for f in package-lock.json yarn.lock pnpm-lock.yaml npm-shrinkwrap.json bun.lockb; do
      [ -f "$dir/$f" ] && { m6_lockfile=true; break; }
    done
  fi

  # ---- M5: framework's own DRS score, run on the clean clone (before npm install) ----
  m5_out="$WORK_DIR/drs-$name.out"
  (cd "$dir" && PATH="$SHIM_DIR:$PATH" timeout 300 bash "$DRS_SCRIPT") > "$m5_out" 2>&1 || true
  m5_drs=$(grep -oE 'FINAL SCORE: [0-9]+' "$m5_out" | grep -oE '[0-9]+' | head -1 || true)
  if [ -z "$m5_drs" ]; then
    m5_drs="error: $(tail -2 "$m5_out" | tr '\n' ' ' | cut -c1-160)"
  fi

  # ---- M3: CI presence + latest run conclusion on default branch ----
  default_branch=$(gh api "repos/$GH_OWNER/$name" --jq .default_branch 2>/dev/null || echo "")
  m3_ci=false
  if [ "$has_workflows" = true ] && [ -n "$default_branch" ]; then
    m3_raw=$(gh api "repos/$GH_OWNER/$name/actions/runs?branch=$default_branch&per_page=1" \
      --jq 'if (.workflow_runs|length)==0 then "no-runs" else .workflow_runs[0].conclusion // "in-progress" end' 2>/dev/null || echo "api-error")
    [ "$m3_raw" = "success" ] && m3_ci=true
  else
    m3_raw="no-workflows-dir"
  fi

  # ---- M4: buildability (compilers/syntax checkers ONLY) ----
  m4_builds="false"; m4_detail=""; m4_log="$WORK_DIR/m4-$name.log"; : > "$m4_log"
  if [ -f "$dir/package.json" ]; then
    if (cd "$dir" && timeout 300 npm install --ignore-scripts --no-audit --no-fund) > "$m4_log" 2>&1; then
      # tsconfig at root, or in sub-projects (monorepos: apps/*, packages/* etc, depth <= 3)
      ts_projects=()
      if [ -f "$dir/tsconfig.json" ]; then
        ts_projects=(tsconfig.json)
      else
        while IFS= read -r t; do ts_projects+=("$t"); done \
          < <(cd "$dir" && find . -maxdepth 3 -name tsconfig.json -not -path '*/node_modules/*' -printf '%P\n' 2>/dev/null | sort | head -10)
      fi
      if [ ${#ts_projects[@]} -gt 0 ]; then
        rc=0
        for t in "${ts_projects[@]}"; do
          if [ -f "$dir/node_modules/.bin/tsc" ]; then
            (cd "$dir" && timeout 300 ./node_modules/.bin/tsc --noEmit -p "$t") >> "$m4_log" 2>&1 || rc=1
          else
            (cd "$dir" && timeout 300 npx --yes -p typescript tsc --noEmit -p "$t") >> "$m4_log" 2>&1 || rc=1
          fi
        done
        [ $rc -eq 0 ] && m4_builds="true"
        m4_detail="node+tsc projects=${#ts_projects[@]} rc=$rc"
      else
        # no TS config anywhere: syntax-check all shipped .js repo-wide
        # (build output / vendored / test dirs excluded; *.min.js skipped)
        rc=0; nchecked=0
        js_list="$WORK_DIR/js-$name.txt"; : > "$js_list"
        (cd "$dir" && find . \( -type d \( -name node_modules -o -name .git -o -name dist -o -name build -o -name out -o -name .next -o -name coverage -o -name vendor -o "${M1_PRUNE[@]}" \) -prune \) -o -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' \) ! -name '*.min.js' -printf '%P\n' 2>/dev/null) >> "$js_list"
        while IFS= read -r jf; do
          [ -z "$jf" ] && continue
          nchecked=$((nchecked+1))
          (cd "$dir" && node --check "$jf") >> "$m4_log" 2>&1 || rc=1
        done < "$js_list"
        if [ "$nchecked" -eq 0 ]; then
          m4_builds="n/a"; m4_detail="node: no checkable .js files found (files=0 — no vacuous pass)"
        else
          [ $rc -eq 0 ] && m4_builds="true"
          m4_detail="node-check files=$nchecked rc=$rc"
        fi
      fi
    else
      m4_detail="node: npm install --ignore-scripts failed"
    fi
  elif [ -n "$(find "$dir" -maxdepth 2 -name project.godot -print -quit 2>/dev/null)" ]; then
    m4_builds="n/a"; m4_detail="godot: no static compiler available in this environment"
  elif [ -n "$(find "$dir" -name '*.py' -not -path '*/.git/*' -print -quit 2>/dev/null)" ]; then
    (cd "$dir" && timeout 300 python -m compileall -q -x '(\.git|node_modules|venv|\.venv)' .) > "$m4_log" 2>&1
    rc=$?
    [ $rc -eq 0 ] && m4_builds="true"
    m4_detail="python-compileall rc=$rc"
  elif [ -n "$(find "$dir" -name '*.sh' -not -path '*/.git/*' -print -quit 2>/dev/null)" ]; then
    rc=0; nchecked=0
    while IFS= read -r sf; do
      nchecked=$((nchecked+1))
      (cd "$dir" && bash -n "$sf") >> "$m4_log" 2>&1 || rc=1
    done < <(cd "$dir" && find . -name '*.sh' -not -path './.git/*' -type f)
    [ $rc -eq 0 ] && m4_builds="true"
    m4_detail="bash-n files=$nchecked rc=$rc"
  else
    m4_builds="n/a"; m4_detail="no recognized ecosystem (no package.json/godot/python/sh)"
  fi
  if [ "$m4_builds" = "false" ]; then
    err3=$(grep -viE '^\s*$|^npm (warn|notice)' "$m4_log" | head -3 | tr '\n' '|' | cut -c1-300)
    m4_detail="$m4_detail; first errors: $err3"
  fi

  echo "  m1_hits=$m1_hits (files=$m1_file_count)  m2_flags=$(printf '%s' "$m2_flags" | grep -c . || true)  m3=$m3_raw  m4=$m4_builds ($m4_detail)  m5=$m5_drs  license=$m6_license lock=$m6_lockfile"

  BM_COHORT="$cohort" BM_NAME="$name" BM_SHA="$sha" \
  BM_M1_HITS="$m1_hits" BM_M1_FILE_COUNT="$m1_file_count" BM_M1_FILES="$m1_files_sample" \
  BM_M2_FLAGS="$m2_flags" \
  BM_M3_CI="$m3_ci" BM_M3_RAW="$m3_raw" \
  BM_M4_BUILDS="$m4_builds" BM_M4_DETAIL="$m4_detail" \
  BM_M5_DRS="$m5_drs" \
  BM_M6_LICENSE="$m6_license" BM_M6_LOCKFILE="$m6_lockfile" emit

  rm -rf "$dir"
done < "$REPOS_FILE"

echo ""
echo "Rendering RESULTS.md..."
node "$BENCH_DIR/lib/render-results.mjs" "$RESULTS_JSONL" "$BENCH_DIR/RESULTS.md" "$DATA_DIR/findings.md"

# cleanup temp clones
rm -rf "$WORK_DIR"
echo "Done."
