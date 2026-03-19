---
description: List all available skills from user's skills library
allowed-tools: Bash, Glob
---

# Available Skills

Run the following to list all skills:

```bash
ls ~/.claude/skills/ | wc -l
```

```bash
ls ~/.claude/skills/
```

## 常驻技能 (Always Active)

These skills are automatically available in every session.

## Skill Categories

Skills are stored in `~/.claude/skills/` and can be loaded with:

- `/skill <name>` - Load a specific skill
- `/skill-info <name>` - Get detailed information
- `/skill-search <keyword>` - Search skills

## Quick Reference

| Command | Description |
|---------|-------------|
| `/skill python` | Load Python skill |
| `/skill pytorch` | Load PyTorch skill |
| `/skill pubmed-database` | Load PubMed skill |
| `/skills` | Show this list |
| `/skill-search <keyword>` | Search skills |
