# Skills Library Plugin

Personal skills library with 200+ skills for scientific research, programming, AI/ML, and more.

## Skills Location

All skills are stored in: `~/.claude/skills/`

## Skill Categories

### Scientific (40+ skills)
- pubmed-database, biopython, alphafold-database, gene-database
- rdkit, pymatgen, molecular-dynamics, deepchem
- And more...

### Programming (30+ skills)
- python, typescript, go, java
- pytorch, tensorflow, transformers
- scikit-learn, pandas, numpy

### AI/ML (25+ skills)
- god-mode, research-lookup, perplexity-search
- scientific-writing, literature-review
- AutoML, hypothesis-generation

### Data Processing (20+ skills)
- pandas, polars, dask, vaex
- scanpy, scvi-tools, anndata

### Visualization (15+ skills)
- matplotlib, plotly, seaborn
- scientific-visualization, scientific-schematics

### Cloud/DevOps (20+ skills)
- aws, gcp, docker, kubernetes
- modal, prefect

### Database (10+ skills)
- postgresql, mongodb, redis
- opensearch, timeseries databases

### Writing/Docs (15+ skills)
- latex, markdown, scientific-writing
- peer-review, research-grants

## Usage

Use `/skill <name>` to load a specific skill, or `/skills` to list all available skills.

## 常驻技能 (Always Active)

These skills are automatically available in every session:

- `nopua` - Respectful interaction
- `skill-tracker` - Show skill call flow
- `skill-flow-tree` - Show full call tree
- `main` - Main workflow controller
- `gemini-mcp` - Gemini parallel calls
- `auto-pilot` - Autonomous workflow

## Architecture

```
skills-library/
├── .claude-plugin/
│   └── plugin.json     # Plugin manifest
├── commands/
│   ├── list.md         # /skills command
│   ├── info.md         # /skill-info command
│   └── search.md      # /skill-search command
└── skills/             # Symlink to ~/.claude/skills/
```

## Commands

| Command | Description |
|---------|-------------|
| `/skills` | List all available skills by category |
| `/skill <name>` | Load a specific skill |
| `/skill-info <name>` | Get detailed information about a skill |
| `/skill-search <keyword>` | Search skills by keyword |
