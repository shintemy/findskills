# FindSkills

**AI-First Skills Directory** — A curated index of AI Agent Skills, optimized for both human browsing and AI Agent discovery.

🌐 **[findskills.org](https://findskills.org)**

## Overview

AI Agent Skills are scattered across ClawHub, GitHub, and individual repositories. FindSkills aggregates them into a single directory with multiple consumption formats: human-readable web UI, structured JSON, and LLM-friendly plain text.

## Features

- **Human UI** — Browse skills with real-time search, filter by name, description, or tags
- **Machine-readable** — `skills.json` for programmatic access
- **LLM-friendly** — `llms.txt` and `llms-full.txt` for AI crawlers and agents
- **Auto-updated** — Daily collection via GitHub Actions
- **Multiple sources** — ClawHub, GitHub Search (`SKILL.md`), and manual curation

## AI-First Data Endpoints

| Endpoint | Format | Purpose |
|----------|--------|---------|
| [/skills.json](https://findskills.org/skills.json) | JSON | Structured catalog for developers and agents |
| [/llms.txt](https://findskills.org/llms.txt) | Markdown | Site overview and resource links |
| [/llms-full.txt](https://findskills.org/llms-full.txt) | Markdown | Complete Skills catalog in one file |

## Project Structure

```
findskills/
├── index.html              # Human-facing UI
├── skills.json             # Structured data (source of truth)
├── llms.txt                # LLM index
├── llms-full.txt           # Full catalog (auto-generated)
├── sources.json            # Manual repo curation
├── assets/                 # Logo, favicon
├── design/
│   └── design-system.json  # UI design tokens
├── scripts/
│   ├── collect.js          # Fetch from GitHub & sources
│   └── generate.js         # Generate llms-full.txt
└── .github/workflows/
    └── collect.yml         # Daily cron
```

## Local Development

```bash
# Prerequisites: Node.js >= 20

# Run collection (optional, requires GITHUB_TOKEN for full results)
npm run collect
npm run generate

# Serve locally
npx serve . -l 3000
# Open http://localhost:3000
```

## Adding Skills

1. **Manual curation** — Add repos to `sources.json`:

```json
{
  "repos": [
    {
      "url": "https://github.com/owner/repo",
      "tags": ["custom-tag"]
    }
  ]
}
```

2. **GitHub discovery** — Repos with `SKILL.md` at root are discovered automatically (requires `GITHUB_TOKEN` in Actions).

## Design System

UI follows `design/design-system.json`. All colors, typography, and spacing use defined tokens. See [.cursor/rules/design-system.mdc](.cursor/rules/design-system.mdc) for implementation guidance.

## License

Open directory of AI Agent Skills.
