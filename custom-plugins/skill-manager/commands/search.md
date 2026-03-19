---
description: Search skills by keyword
allowed-tools: Bash, Grep, Glob
---

# Skill Search

Search through available skills by keyword or functionality.

## Usage

```
/skill-search <关键词>
```

## Examples

### Search by technology
```
/skill-search python
/skill-search pytorch
/skill-search database
```

### Search by functionality
```
/skill-search visualization
/skill-search api
/skill-search testing
```

### Search by domain
```
/skill-search bioinformatics
/skill-search chemistry
/skill-search machine learning
```

## Implementation

The search scans skill descriptions in `~/.claude/skills/*/SKILL.md` files and matches keywords.

```bash
# Quick search implementation
SKILLS_DIR="$HOME/.claude/skills"
KEYWORD="$1"

for skill_dir in $SKILLS_DIR/*/; do
    skill_name=$(basename "$skill_dir")
    skill_md="$skill_dir/SKILL.md"

    if [ -f "$skill_md" ]; then
        # Search in filename and description
        if echo "$skill_name" | grep -qi "$KEYWORD"; then
            echo "=== $skill_name ==="
            head -10 "$skill_md" | grep -i "$KEYWORD" || echo "(matched by name)"
            echo ""
        fi
    fi
done
```

## Categories

Skills are organized into these categories:

| Category | Description |
|----------|-------------|
| `scientific` | Biology, chemistry, medicine |
| `programming` | Languages & frameworks |
| `ai-ml` | Machine learning & deep learning |
| `data` | Data processing & analysis |
| `visualization` | Charts & graphs |
| `cloud` | Cloud platforms & deployment |
| `database` | Database operations |
| `writing` | Documentation & papers |
| `workflow` | Automation & orchestration |

## Tips

- Use `/skills` to see all available skills
- Use `/skill-info <name>` for detailed info
- Skills marked as **常驻** are always active
