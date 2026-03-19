# Skill Manager Plugin

Enhanced skill management system for Claude Code with 188+ pre-built skills.

## Commands

| Command | Description |
|---------|-------------|
| `/skills` | List all available skills by category |
| `/skill <name>` | Load a specific skill |
| `/skill-info <name>` | Get detailed information about a skill |
| `/skill-search <keyword>` | Search skills by keyword |
| `/skill-manager:setup` | Configure the plugin |

## Skill Location

All skills are stored in: `~/.claude/skills/`

## 常駐技能 (Always Active)

These skills are automatically available:

- `nopua` - Respectful interaction
- `skill-tracker` - Show skill call flow
- `skill-flow-tree` - Show full call tree
- `main` - Main workflow controller
- `gemini-mcp` - Gemini parallel calls
- `auto-pilot` - Autonomous workflow
- `skill-manager` - Skill dispatcher

## Skill Categories

- Scientific (40+ skills)
- Programming (30+ skills)
- AI/ML (25+ skills)
- Data Processing (20+ skills)
- Visualization (15+ skills)
- Cloud/DevOps (20+ skills)
- Database (10+ skills)
- Writing/Docs (15+ skills)

## Architecture

```
Skill Manager Plugin
├── commands/
│   ├── list.md      # /skills
│   ├── skill.md     # /skill
│   ├── search.md    # /skill-search
│   ├── info.md      # /skill-info
│   └── setup.md     # /skill-manager:setup
└── skills/          # User's personal skills
```

## Implementation Notes

- Skills are loaded from `~/.claude/skills/`
- Each skill has a `SKILL.md` with description and version
- Reference docs stored in `references/` subdirectory
- Skills follow s02-s09 principles for dynamic loading
