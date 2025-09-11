#!/bin/bash

# Simple Project Assessment Script
# Provides basic project metrics without complex type detection
# EXCLUDES all AI Control Framework files from assessment

echo "═══════════════════════════════════════"
echo "PROJECT ASSESSMENT (User Project Only)"
echo "═══════════════════════════════════════"

echo "🔍 SCANNING USER PROJECT (excluding framework files)..."

# Basic File Analysis - EXCLUDE framework files using grep filters
echo "📁 FILE ANALYSIS:"
total_files=$(find . -type f -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" -o -name "*.cs" -o -name "*.php" -o -name "*.rb" -o -name "*.go" | \
    grep -v node_modules | \
    grep -v .git | \
    grep -v "Claude-template/" | \
    grep -v "DO NOT TOUCH/" | \
    grep -v "CLAUDE.md" | \
    grep -v "\.sh$" | \
    grep -v "FRAMEWORK" | \
    grep -v "OPERATIONALIZATION" | \
    grep -v "TROUBLESHOOTING" | \
    wc -l)
echo "   User code files: $total_files"

config_files=$(find . -maxdepth 2 -name "package.json" -o -name "requirements.txt" -o -name "Gemfile" -o -name "go.mod" -o -name "pom.xml" -o -name "*.csproj" | \
    grep -v "Claude-template/" | \
    grep -v "DO NOT TOUCH/" | \
    wc -l)
echo "   User config files: $config_files"

test_files=$(find . -type f -name "*test*" -o -name "*spec*" | \
    grep -v node_modules | \
    grep -v .git | \
    grep -v "Claude-template/" | \
    grep -v "DO NOT TOUCH/" | \
    grep -v "\.sh$" | \
    wc -l)
echo "   User test files: $test_files"

# Git Status
echo ""
echo "📊 GIT STATUS:"
if [ -d ".git" ]; then
    uncommitted=$(git status --porcelain | wc -l)
    echo "   Uncommitted changes: $uncommitted"
    
    last_commit=$(git log -1 --format="%cr" 2>/dev/null || echo "No commits")
    echo "   Last commit: $last_commit"
else
    echo "   Not a git repository"
fi

# Build Status
echo ""
echo "🔧 BUILD STATUS:"
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo "   Node.js: Dependencies installed ✓"
    else
        echo "   Node.js: Dependencies missing ✗"
    fi
elif [ -f "requirements.txt" ]; then
    echo "   Python: requirements.txt found"
elif [ -f "Gemfile" ]; then
    echo "   Ruby: Gemfile found"
elif [ -f "go.mod" ]; then
    echo "   Go: go.mod found"
else
    echo "   Build system: Not detected"
fi

# Test Status
echo ""
echo "🧪 TEST STATUS:"
if [ $test_files -gt 0 ]; then
    echo "   Test files present: ✓ ($test_files files)"
    
    # Try to detect if tests are runnable
    if [ -f "package.json" ] && grep -q "test" package.json; then
        echo "   Test script configured: ✓"
    elif [ -f "Makefile" ] && grep -q "test" Makefile; then
        echo "   Test target in Makefile: ✓"
    else
        echo "   Test runner: Unknown"
    fi
else
    echo "   Test files: None found ✗"
fi

# Completion Estimate
echo ""
echo "📈 COMPLETION ESTIMATE:"
completion_score=0

# Basic scoring
if [ $total_files -gt 0 ]; then
    completion_score=$((completion_score + 20))
fi

if [ $config_files -gt 0 ]; then
    completion_score=$((completion_score + 20))
fi

if [ $test_files -gt 0 ]; then
    completion_score=$((completion_score + 30))
fi

if [ -d ".git" ] && [ $uncommitted -eq 0 ]; then
    completion_score=$((completion_score + 15))
fi

# Check for user README (not framework README)
user_readme=0
if [ -f "README.md" ] && ! grep -q "AI Control Framework" README.md 2>/dev/null; then
    user_readme=1
elif [ -f "readme.md" ] && ! grep -q "AI Control Framework" readme.md 2>/dev/null; then
    user_readme=1
fi

if [ $user_readme -eq 1 ]; then
    completion_score=$((completion_score + 15))
fi

echo "   Estimated completion: ${completion_score}%"

# Recommendations
echo ""
echo "💡 RECOMMENDED SESSION TYPE:"
if [ $completion_score -lt 30 ]; then
    echo "   DEVELOPMENT - Project needs significant work"
elif [ $completion_score -lt 70 ]; then
    echo "   DEVELOPMENT - Continue building features"
elif [ $completion_score -lt 90 ]; then
    echo "   ASSESSMENT - Verify completeness, then DEPLOYMENT"
else
    echo "   ASSESSMENT - Project appears complete, verify status"
fi

echo ""
echo "⚠️  POTENTIAL ISSUES:"
if [ $test_files -eq 0 ]; then
    echo "   - No test files detected"
fi

if [ $uncommitted -gt 5 ]; then
    echo "   - Many uncommitted changes ($uncommitted)"
fi

if [ $total_files -gt 50 ]; then
    echo "   - Large codebase (>50 files) - consider focused sessions"
fi

echo "═══════════════════════════════════════"