# FindSkills Design Document

> AI-First Skills Directory — a curated index of AI Agent Skills, optimized for both human browsing and AI Agent discovery.

## Problem

AI Agent Skills are scattered across ClawHub, GitHub, and individual repositories. There is no single, AI-friendly directory that aggregates them and makes them easily discoverable by both humans and AI Agents.

## Solution

A static website that:

1. Aggregates Skills from multiple sources (ClawHub, GitHub search, manual curation)
2. Exposes data via multiple AI-friendly protocols (`llms.txt`, `llms-full.txt`, `skills.json`)
3. Provides a clean human-browsable interface
4. Auto-updates via GitHub Actions

## Architecture

```
findskills/
├── index.html              # Human-facing UI (single page)
├── skills.json             # Structured data (AI Agent primary endpoint)
├── robots.txt              # AI crawler permissions
├── llms.txt                # LLM-friendly Markdown index
├── llms-full.txt           # Full Skills catalog in Markdown (auto-generated)
├── sources.json            # Manually curated source URLs
├── scripts/
│   ├── collect.js          # Main collection script (Node.js)
│   └── generate.js         # Generate llms.txt and llms-full.txt from skills.json
├── .github/
│   └── workflows/
│       └── collect.yml     # Daily cron job for auto-collection
├── docs/
│   └── plans/
│       └── 2026-02-14-findskills-design.md
└── package.json
```

## AI Agent Discovery Layers

| Layer | File | Consumer | Purpose |
|-------|------|----------|---------|
| 1 | `robots.txt` | AI crawlers | Explicitly allow all AI bots |
| 2 | `llms.txt` | LLMs | Markdown index with site overview and resource links |
| 3 | `llms-full.txt` | LLMs | Complete Skills catalog in one Markdown file |
| 4 | `skills.json` | Agents / Developers | Structured JSON data for programmatic access |
| 5 | `index.html` | Humans | Visual browsing with search and filtering |
| 6 | JSON-LD in HTML | Search engines / AI | Schema.org structured data in page `<head>` |

### robots.txt

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://findskills.org/sitemap.xml
```

### llms.txt

```markdown
# FindSkills

> AI Skills directory. Aggregates Skills from ClawHub, GitHub, and curated sources for AI Agent discovery.

FindSkills is a curated index of AI Agent Skills. It collects Skills from multiple sources and provides structured data for programmatic access.

## API

- [Skills JSON](/skills.json): Structured JSON data with all Skills
- [Full Skills Catalog](/llms-full.txt): Complete Markdown listing of all Skills

## About

- [Website](https://findskills.org): Browse Skills with search and filtering
- [GitHub](https://github.com/shintemy/findskills): Source code and contribution guide
```

### llms-full.txt (auto-generated from skills.json)

```markdown
# FindSkills - Complete Skills Catalog

> Total: N skills | Last updated: YYYY-MM-DD

## Web Search

- Author: openclaw
- Description: Enable AI Agent to perform real-time web search
- GitHub: https://github.com/openclaw/skills/tree/main/web-search
- Tags: search, web, browsing
- Source: clawhub

## Next Skill
...
```

## Data Schema

### skills.json

```json
{
  "skills": [
    {
      "id": "openclaw-web-search",
      "name": "Web Search",
      "description": "Enable AI Agent to perform real-time web search",
      "author": "openclaw",
      "github": "https://github.com/openclaw/skills/tree/main/web-search",
      "source": "clawhub",
      "tags": ["search", "web", "browsing"],
      "category": "tools",
      "updated_at": "2026-02-14",
      "collected_at": "2026-02-14"
    }
  ],
  "meta": {
    "total": 1,
    "last_updated": "2026-02-14T12:00:00Z",
    "sources": ["clawhub", "github", "manual"]
  }
}
```

### Field Definitions

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | Yes | string | Unique identifier, format: `author-skillname` |
| `name` | Yes | string | Display name |
| `description` | Yes | string | One-line description |
| `author` | Yes | string | Author or organization |
| `github` | Yes | string | GitHub URL |
| `source` | Yes | string | Collection source: `clawhub`, `github`, `manual` |
| `tags` | No | string[] | Tags for filtering |
| `category` | No | string | Category classification |
| `updated_at` | Yes | string | Last update date (ISO format) |
| `collected_at` | Yes | string | Date collected by FindSkills |

### sources.json (manual curation)

```json
{
  "repos": [
    {
      "url": "https://github.com/example/my-skill",
      "tags": ["custom-tag"]
    }
  ]
}
```

## Frontend (index.html)

Single-page static HTML with:

- **Header**: Site name, tagline, stats ("N Skills from X sources")
- **Search bar**: Real-time client-side filtering by name/description/tags
- **Skills cards**: Each card shows name, description, author, tags, GitHub link
- **Footer**: Links to `skills.json`, `llms.txt`, GitHub repo
- **JSON-LD**: Schema.org `DataCatalog` + `Dataset` structured data in `<head>`

Tech: Pure HTML + CSS + Vanilla JS. Fetches `skills.json` on load, renders cards, filters client-side. Zero dependencies.

## Auto-Collection Pipeline

### GitHub Actions Workflow (`.github/workflows/collect.yml`)

- **Trigger**: Daily cron (`0 6 * * *`) + manual dispatch
- **Steps**:
  1. Run `scripts/collect.js` — fetches from all sources
  2. Run `scripts/generate.js` — regenerates `llms.txt` and `llms-full.txt`
  3. If `skills.json` changed, auto-commit and push
  4. Vercel auto-deploys on push

### Collection Sources

1. **ClawHub**: Fetch from ClawHub API/registry, extract skill metadata
2. **GitHub Search**: Search for repos with `SKILL.md` files via GitHub API
3. **Manual list**: Read `sources.json`, fetch repo metadata from GitHub API

### Deduplication

Skills are deduplicated by `id` (derived from `author-skillname`). When the same skill appears in multiple sources, ClawHub metadata takes precedence, then GitHub, then manual.

## Deployment

- **Platform**: Vercel (free tier)
- **Domain**: findskills.org
- **Build**: No build step needed for MVP — just serve static files
- **Auto-deploy**: Vercel watches the repo, deploys on every push

## Future Enhancements (Post-MVP)

- `.well-known/agent-card.json` for A2A protocol
- `.well-known/mcp.json` for MCP server discovery
- SKILL.md file generation for each skill (OpenClaw direct install)
- Search API endpoint (Vercel API Routes)
- Category pages with individual URLs
- Community submission via GitHub Issues + bot
- Semantic search with embeddings
- Skill quality scoring / popularity ranking
