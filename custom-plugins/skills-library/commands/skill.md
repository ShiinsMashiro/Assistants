---
description: Load a specific skill from the skills library
allowed-tools: Bash, Read, Glob
---

# Load Skill

Load a skill from the library:

```bash
cat ~/.claude/skills/<skill-name>/SKILL.md
```

Example - load the Python skill:

```bash
cat ~/.claude/skills/python/SKILL.md
```

## Available Skills

List all skills:

```bash
ls ~/.claude/skills/
```

## 常驻技能 (Always Active)

These skills are always loaded:
- `nopua` - Respectful interaction
- `skill-tracker` - Track skill flow
- `skill-flow-tree` - Show call tree
- `main` - Main workflow
- `gemini-mcp` - Gemini integration
- `auto-pilot` - Autonomous workflow
