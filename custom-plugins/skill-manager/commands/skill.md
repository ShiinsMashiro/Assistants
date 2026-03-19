---
description: Load and use a specific skill
allowed-tools: Bash, Read, Glob
---

# Load Skill

Load a specific skill to use in the current conversation.

## Usage

```
/skill <技能名>
```

## How It Works

1. **Skill Discovery**: Searches `~/.claude/skills/` for the skill
2. **Description Injection**: Reads SKILL.md and injects the description
3. **Reference Loading**: Loads reference documentation
4. **Ready to Use**: The skill guidance is now active

## Examples

### Load a programming skill
```
/skill python
/skill typescript
/skill pytorch
```

### Load a database skill
```
/kill postgresql
/skill mongodb
```

### Load a scientific skill
```
/kill pubmed-database
/skill biopython
/skill rdkit
```

## Implementation

```bash
SKILL_DIR="$HOME/.claude/skills/$1/SKILL.md"

if [ -f "$SKILL_DIR" ]; then
    echo "Loading skill: $1"
    echo ""
    cat "$SKILL_DIR"
else
    echo "Skill '$1' not found"
    echo "Use /skills to list all available skills"
fi
```

## 常驻技能

These skills are always active - no need to load them:

| Skill | Purpose |
|-------|---------|
| `nopua` | Respectful interaction |
| `skill-tracker` | Show skill call flow |
| `skill-flow-tree` | Show full call tree |
| `main` | Main workflow controller |

## Skill Categories

| Category | Skills |
|----------|--------|
| Scientific | pubmed, biopython, alphafold, rdkit, pymc |
| Programming | python, typescript, java, go, rust |
| AI/ML | pytorch, sklearn, transformers, mlflow |
| Data | pandas, dask, polars, vaex |
| Visualization | matplotlib, plotly, seaborn |
| Cloud | aws, gcp, azure, docker, k8s |
| Database | postgresql, mongodb, redis |
| Writing | latex, markdown, mermaid |

## Tips

- Use `/skill-search <keyword>` to find skills
- Use `/skill-info <name>` to learn about a skill
- Use `/skills` to see all available skills
