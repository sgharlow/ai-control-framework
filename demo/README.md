# Demo Recording Guide

This directory contains scripts for creating demo GIFs/videos of the AI Control Framework.

## Quick Start

### Option 1: asciinema + agg (Recommended)

```bash
# Install tools
pip install asciinema
cargo install --git https://github.com/asciinema/agg

# Record
asciinema rec demo.cast

# In the recording, run:
./demo-script.sh

# Exit recording with 'exit' or Ctrl+D

# Convert to GIF
agg demo.cast demo.gif --cols 80 --rows 24
```

### Option 2: terminalizer

```bash
# Install
npm install -g terminalizer

# Record
terminalizer record demo

# In the recording, run:
./demo-script.sh

# Convert
terminalizer render demo -o demo.gif
```

### Option 3: Screen Recording

Use any screen recorder (OBS, QuickTime, etc.) with:
- Terminal window: 80x24 characters
- Font size: 16pt
- Dark theme background

## Demo Script

`demo-script.sh` runs a simulated DRS calculation showing:

1. **Problem** - "Is this code ready to deploy?"
2. **Low Score** - DRS 34/100 with specific issues highlighted
3. **What to Fix** - Clear action items
4. **High Score** - DRS 87/100 after fixes
5. **Call to Action** - Clone and try

Runtime: ~45 seconds

## Customization

Edit `demo-script.sh` to:
- Change typing speed: adjust `delay` parameter
- Modify scores: edit the simulated output
- Add steps: insert new sections

## Output Specs

For README/Show HN:
- Format: GIF or MP4
- Width: 800px recommended
- Duration: 30-60 seconds
- File size: < 5MB for GitHub, < 10MB for HN

## Files

- `demo-script.sh` - Main demo script
- `README.md` - This file
- `demo.gif` - Output (after recording)
