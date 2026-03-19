---
description: Search skills by keyword
allowed-tools: Bash, Grep, Glob
---

# Search Skills

Search for skills containing a keyword:

```bash
ls ~/.claude/skills/ | grep -i "<keyword>"
```

Example - search for "python":

```bash
ls ~/.claude/skills/ | grep -i python
```

Example - search for "data":

```bash
ls ~/.claude/skills/ | grep -i data
```

## Available Search Keywords

Common categories:
- `python`, `java`, `go`, `rust`, `typescript` - Programming languages
- `pytorch`, `tensorflow`, `sklearn`, `jax` - ML frameworks
- `database`, `redis`, `postgresql`, `mongodb` - Databases
- `bio`, `chem`, `mol` - Scientific
- `web`, `api`, `http` - Web development
- `docker`, `kubernetes`, `aws`, `gcp` - DevOps/Cloud
- `visualization`, `plot`, `chart` - Visualization
- `research`, `paper`, `literature` - Research tools
