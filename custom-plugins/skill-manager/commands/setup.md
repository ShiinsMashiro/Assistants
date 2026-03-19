---
description: Setup and configure the Skill Manager plugin
allowed-tools: Bash, Read, Glob
---

# Skill Manager Plugin Setup

## Overview

This plugin provides enhanced skill management for Claude Code with:
- 188+ pre-built skills
- Smart categorization
- On-demand loading
- Skill search and discovery

## Quick Setup

### Step 1: Verify Skills Directory

```bash
ls ~/.claude/skills/ | wc -l
```

You should see a list of skill directories.

### Step 2: Enable常驻技能

These skills auto-load every session:

Add to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "加载skill-tracker和skill-flow-tree技能，在当前会话中始终显示技能调用流程",
            "once": false
          }
        ]
      }
    ]
  }
}
```

### Step 3: Test the Plugin

Try these commands:

```
/skills           # List all skills
/skill-info pytorch  # Get info about pytorch skill
/skill-search python # Search for python skills
```

## Skill Categories

| Category | Count | Examples |
|----------|-------|---------|
| Scientific | 40+ | pubmed, biopython, rdkit |
| Programming | 30+ | python, typescript, go |
| AI/ML | 25+ | pytorch, sklearn, transformers |
| Data | 20+ | pandas, dask, polars |
| Visualization | 15+ | matplotlib, plotly |
| Cloud | 20+ | aws, gcp, docker |
| Database | 10+ | postgresql, mongodb |
| Writing | 15+ | latex, markdown |

## Available Commands

| Command | Description |
|---------|-------------|
| `/skills` | List all available skills |
| `/skill <name>` | Load a specific skill |
| `/skill-info <name>` | Get detailed skill info |
| `/skill-search <keyword>` | Search skills |

## 常驻技能 (Always Active)

These skills are automatically loaded:

- `nopua` - Respectful interaction
- `skill-tracker` - Show skill call flow
- `skill-flow-tree` - Show full call tree
- `main` - Main workflow controller
- `gemini-mcp` - Gemini parallel calls

## Customization

### Add Custom Skills

Place skill directories in `~/.claude/skills/`:

```
~/.claude/skills/
├── my-custom-skill/
│   ├── SKILL.md
│   └── references/
│       └── guide.md
```

### Skill Format

Each skill needs a `SKILL.md`:

```markdown
---
name: my-skill
description: |
  Brief description of the skill
version: 1.0.0
---

# My Skill

Detailed skill documentation...
```

## Troubleshooting

**Skills not showing?**
```bash
ls ~/.claude/skills/
```

**Need to reload?**
Restart Claude Code session.

**Missing a skill?**
Skills are loaded from `~/.claude/skills/` - check the directory exists.
