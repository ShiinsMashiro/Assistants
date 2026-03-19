---
description: Get detailed information about a specific skill
allowed-tools: Bash, Read, Glob
---

# Skill Information

Get detailed information about a specific skill.

## Usage

```
/skill-info <技能名>
```

## Examples

```
/skill-info pytorch
/skill-info godot-dev
/skill-search pubmed-database
```

## Implementation

```bash
SKILL_DIR="$HOME/.claude/skills/$1"

if [ -d "$SKILL_DIR" ]; then
    echo "=== Skill: $1 ==="
    echo ""

    # Read SKILL.md
    if [ -f "$SKILL_DIR/SKILL.md" ]; then
        echo "--- Description ---"
        head -50 "$SKILL_DIR/SKILL.md"
    fi

    # List reference files
    if [ -d "$SKILL_DIR/references" ]; then
        echo ""
        echo "--- Reference Files ---"
        ls "$SKILL_DIR/references/"
    fi

    # List all files
    echo ""
    echo "--- All Files ---"
    find "$SKILL_DIR" -type f -name "*.md" | head -20
else
    echo "Skill '$1' not found"
    echo "Use /skills to list all available skills"
fi
```

## Skill Structure

Each skill follows this structure:

```
~/.claude/skills/<skill-name>/
├── SKILL.md              # Main description (required)
├── references/           # Detailed reference docs
│   ├── api_reference.md
│   ├── examples.md
│   └── ...
└── assets/              # Images, diagrams, etc.
    └── ...
```

## Special Skills

### 常驻技能 (Always Active)
These skills are always available and don't need to be loaded:

- `nopua` - Respectful interaction
- `skill-tracker` - Show skill call flow
- `skill-flow-tree` - Show full call tree
- `main` - Main workflow controller
- `gemini-mcp` - Gemini parallel calls
