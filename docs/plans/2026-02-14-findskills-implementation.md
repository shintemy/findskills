# FindSkills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static AI-First Skills directory website that aggregates Skills from ClawHub, GitHub, and manual sources, exposing data via `llms.txt`, `llms-full.txt`, `skills.json`, and a human-browsable `index.html`.

**Architecture:** Pure static site — `skills.json` is the single source of truth. Node.js scripts collect data and generate derivative files (`llms.txt`, `llms-full.txt`). GitHub Actions runs collection daily. Vercel serves static files.

**Tech Stack:** HTML, CSS, Vanilla JS (frontend), Node.js (scripts), GitHub Actions (automation), Vercel (hosting)

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `sources.json`
- Create: `skills.json` (seed data)

**Step 1: Initialize git repo**

```bash
cd /Users/sean/Documents/个人项目/findskills
git init
```

**Step 2: Create package.json**

Create `package.json`:

```json
{
  "name": "findskills",
  "version": "0.1.0",
  "description": "AI-First Skills Directory",
  "private": true,
  "scripts": {
    "collect": "node scripts/collect.js",
    "generate": "node scripts/generate.js",
    "update": "npm run collect && npm run generate",
    "test": "node --test scripts/__tests__/"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Step 3: Create .gitignore**

Create `.gitignore`:

```
node_modules/
.env
.vercel
.DS_Store
```

**Step 4: Create sources.json with seed data**

Create `sources.json` — this is the manually curated list of skill repos:

```json
{
  "repos": []
}
```

**Step 5: Create skills.json with seed data**

Create `skills.json` with 2-3 sample skills so we can develop the frontend and generators against real data:

```json
{
  "skills": [
    {
      "id": "anthropic-memory",
      "name": "Memory",
      "description": "Persistent memory for Claude Code sessions, storing user preferences and project context across conversations",
      "author": "anthropic",
      "github": "https://github.com/anthropics/claude-code/tree/main/skills/memory",
      "source": "manual",
      "tags": ["memory", "context", "persistence"],
      "category": "core",
      "updated_at": "2026-02-01",
      "collected_at": "2026-02-14"
    },
    {
      "id": "openclaw-web-search",
      "name": "Web Search",
      "description": "Enable AI Agent to perform real-time web search with configurable search engines",
      "author": "openclaw",
      "github": "https://github.com/openclaw/openclaw",
      "source": "manual",
      "tags": ["search", "web", "browsing"],
      "category": "tools",
      "updated_at": "2026-01-15",
      "collected_at": "2026-02-14"
    },
    {
      "id": "openclaw-thought",
      "name": "Thought",
      "description": "Extended thinking and reasoning skill for complex problem decomposition",
      "author": "openclaw",
      "github": "https://github.com/openclaw/openclaw",
      "source": "manual",
      "tags": ["thinking", "reasoning", "planning"],
      "category": "core",
      "updated_at": "2026-01-20",
      "collected_at": "2026-02-14"
    }
  ],
  "meta": {
    "total": 3,
    "last_updated": "2026-02-14T12:00:00Z",
    "sources": ["manual"]
  }
}
```

**Step 6: Commit**

```bash
git add package.json .gitignore sources.json skills.json docs/
git commit -m "chore: project scaffolding with seed data and design docs"
```

---

### Task 2: AI Discovery Files — robots.txt and llms.txt

**Files:**
- Create: `robots.txt`
- Create: `llms.txt`

**Step 1: Create robots.txt**

Create `robots.txt`:

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bytespider
Allow: /
```

**Step 2: Create llms.txt**

Create `llms.txt`:

```markdown
# FindSkills

> AI Skills directory. Aggregates Skills from ClawHub, GitHub, and curated sources for AI Agent discovery.

FindSkills is a curated index of AI Agent Skills. It collects Skills from multiple sources and provides structured data for programmatic access. Data is updated daily via automated collection.

## API

- [Skills JSON](/skills.json): Structured JSON data with all Skills, suitable for programmatic consumption
- [Full Skills Catalog](/llms-full.txt): Complete Markdown listing of all Skills in one file

## About

- [Website](https://findskills.vercel.app): Browse Skills with search and filtering
- [GitHub](https://github.com/seanwangai/findskills): Source code and contribution guide
```

**Step 3: Commit**

```bash
git add robots.txt llms.txt
git commit -m "feat: add robots.txt and llms.txt for AI agent discovery"
```

---

### Task 3: Generate Script — llms-full.txt from skills.json

**Files:**
- Create: `scripts/generate.js`
- Create: `scripts/__tests__/generate.test.js`

**Step 1: Write the test for generate**

Create `scripts/__tests__/generate.test.js`:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateLlmsFullTxt } from '../generate.js';

describe('generateLlmsFullTxt', () => {
  it('generates correct markdown from skills data', () => {
    const data = {
      skills: [
        {
          id: 'test-skill',
          name: 'Test Skill',
          description: 'A test skill for validation',
          author: 'tester',
          github: 'https://github.com/tester/test-skill',
          source: 'manual',
          tags: ['test', 'demo'],
          category: 'tools',
          updated_at: '2026-02-14',
          collected_at: '2026-02-14'
        }
      ],
      meta: {
        total: 1,
        last_updated: '2026-02-14T12:00:00Z',
        sources: ['manual']
      }
    };

    const result = generateLlmsFullTxt(data);

    assert.ok(result.includes('# FindSkills - Complete Skills Catalog'));
    assert.ok(result.includes('Total: 1 skills'));
    assert.ok(result.includes('## Test Skill'));
    assert.ok(result.includes('- Author: tester'));
    assert.ok(result.includes('- Description: A test skill for validation'));
    assert.ok(result.includes('- GitHub: https://github.com/tester/test-skill'));
    assert.ok(result.includes('- Tags: test, demo'));
    assert.ok(result.includes('- Source: manual'));
  });

  it('handles empty skills array', () => {
    const data = {
      skills: [],
      meta: { total: 0, last_updated: '2026-02-14T12:00:00Z', sources: [] }
    };

    const result = generateLlmsFullTxt(data);

    assert.ok(result.includes('Total: 0 skills'));
    assert.ok(!result.includes('## '));
  });

  it('handles skills without optional fields', () => {
    const data = {
      skills: [
        {
          id: 'minimal-skill',
          name: 'Minimal',
          description: 'No tags or category',
          author: 'someone',
          github: 'https://github.com/someone/minimal',
          source: 'github',
          updated_at: '2026-02-14',
          collected_at: '2026-02-14'
        }
      ],
      meta: { total: 1, last_updated: '2026-02-14T12:00:00Z', sources: ['github'] }
    };

    const result = generateLlmsFullTxt(data);

    assert.ok(result.includes('## Minimal'));
    assert.ok(!result.includes('- Tags:'));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/sean/Documents/个人项目/findskills && node --test scripts/__tests__/generate.test.js`
Expected: FAIL — module not found

**Step 3: Write the generate script**

Create `scripts/generate.js`:

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

export function generateLlmsFullTxt(data) {
  const date = data.meta.last_updated.split('T')[0];
  const lines = [
    '# FindSkills - Complete Skills Catalog',
    '',
    `> Total: ${data.meta.total} skills | Last updated: ${date}`,
    '',
    'This file contains a complete listing of all Skills in the FindSkills directory.',
    'For structured JSON data, fetch: /skills.json',
    ''
  ];

  for (const skill of data.skills) {
    lines.push(`## ${skill.name}`);
    lines.push('');
    lines.push(`- Author: ${skill.author}`);
    lines.push(`- Description: ${skill.description}`);
    lines.push(`- GitHub: ${skill.github}`);
    if (skill.tags && skill.tags.length > 0) {
      lines.push(`- Tags: ${skill.tags.join(', ')}`);
    }
    if (skill.category) {
      lines.push(`- Category: ${skill.category}`);
    }
    lines.push(`- Source: ${skill.source}`);
    lines.push('');
  }

  return lines.join('\n');
}

// CLI entry point: read skills.json, write llms-full.txt
if (import.meta.url === `file://${process.argv[1]}`) {
  const skillsPath = join(ROOT, 'skills.json');
  const outputPath = join(ROOT, 'llms-full.txt');

  const data = JSON.parse(readFileSync(skillsPath, 'utf-8'));
  const content = generateLlmsFullTxt(data);
  writeFileSync(outputPath, content, 'utf-8');

  console.log(`Generated llms-full.txt with ${data.meta.total} skills`);
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/sean/Documents/个人项目/findskills && node --test scripts/__tests__/generate.test.js`
Expected: PASS — all 3 tests pass

**Step 5: Run the script to generate llms-full.txt from seed data**

Run: `cd /Users/sean/Documents/个人项目/findskills && node scripts/generate.js`
Expected: Output `Generated llms-full.txt with 3 skills`

**Step 6: Verify generated file looks correct**

Read `llms-full.txt` and confirm it has the 3 seed skills formatted correctly.

**Step 7: Commit**

```bash
git add scripts/generate.js scripts/__tests__/generate.test.js llms-full.txt
git commit -m "feat: add generate script to produce llms-full.txt from skills.json"
```

---

### Task 4: Frontend — index.html

**Files:**
- Create: `index.html`

**Step 1: Create index.html**

Create `index.html` — a single-page static site that fetches `skills.json` and renders skill cards with search filtering. Requirements:

- Clean, modern design (dark theme, good for developer audience)
- JSON-LD structured data in `<head>` for Schema.org `DataCatalog`
- Header with site name, tagline, stats
- Search bar with real-time filtering by name/description/tags
- Responsive skill cards showing: name, description, author, tags, GitHub link, source badge
- Footer with links to `skills.json`, `llms.txt`, GitHub repo
- Zero external dependencies — all CSS inline, all JS inline
- Fetches `skills.json` on page load
- Language: page content in English (international audience, AI-friendly)

Key implementation details:

```html
<!-- JSON-LD in <head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "DataCatalog",
  "name": "FindSkills",
  "description": "AI-First Skills Directory",
  "url": "https://findskills.vercel.app",
  "dataset": {
    "@type": "Dataset",
    "name": "AI Agent Skills",
    "description": "Curated index of AI Agent Skills from ClawHub, GitHub, and manual sources",
    "distribution": {
      "@type": "DataDownload",
      "contentUrl": "https://findskills.vercel.app/skills.json",
      "encodingFormat": "application/json"
    }
  }
}
</script>
```

```html
<!-- Meta tags for AI discoverability -->
<meta name="description" content="FindSkills - AI-First Skills Directory. Discover AI Agent Skills from ClawHub, GitHub, and curated sources. Machine-readable via skills.json and llms.txt.">
<meta name="robots" content="index, follow">
<link rel="alternate" type="application/json" href="/skills.json" title="Skills JSON API">
```

The JS should:
1. Fetch `skills.json` on `DOMContentLoaded`
2. Render cards into a grid container
3. Implement search: on input, filter skills where `name`, `description`, or `tags` match the query (case-insensitive)
4. Update stats counter on filter
5. Handle fetch error gracefully (show message)

**Step 2: Open in browser to verify**

Run: `cd /Users/sean/Documents/个人项目/findskills && npx serve .` (or just open `index.html`)
Expected: Page loads, shows 3 seed skill cards, search works, links work.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add index.html with search, cards, and JSON-LD structured data"
```

---

### Task 5: Collection Script — Collect from GitHub

**Files:**
- Create: `scripts/collect.js`
- Create: `scripts/__tests__/collect.test.js`

This is the most complex task. For MVP, implement GitHub search collection first (most universally accessible — no special API keys needed beyond `GITHUB_TOKEN` which GitHub Actions provides). ClawHub collection can be added later once we verify the ClawHub API format.

**Step 1: Write tests for collection utilities**

Create `scripts/__tests__/collect.test.js`:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateSkills, mergeSkillsData, normalizeSkillId } from '../collect.js';

describe('normalizeSkillId', () => {
  it('creates id from author and name', () => {
    assert.equal(normalizeSkillId('openclaw', 'web-search'), 'openclaw-web-search');
  });

  it('lowercases and strips special chars', () => {
    assert.equal(normalizeSkillId('OpenClaw', 'Web Search!'), 'openclaw-web-search');
  });
});

describe('deduplicateSkills', () => {
  it('removes duplicate skills by id', () => {
    const skills = [
      { id: 'a-skill', name: 'Skill', source: 'clawhub' },
      { id: 'a-skill', name: 'Skill Updated', source: 'github' }
    ];
    const result = deduplicateSkills(skills);
    assert.equal(result.length, 1);
  });

  it('prefers clawhub over github over manual', () => {
    const skills = [
      { id: 'a-skill', name: 'Manual', source: 'manual' },
      { id: 'a-skill', name: 'GitHub', source: 'github' },
      { id: 'a-skill', name: 'ClawHub', source: 'clawhub' }
    ];
    const result = deduplicateSkills(skills);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'ClawHub');
  });
});

describe('mergeSkillsData', () => {
  it('merges new skills into existing data', () => {
    const existing = {
      skills: [{ id: 'old-skill', name: 'Old' }],
      meta: { total: 1, last_updated: '2026-01-01T00:00:00Z', sources: ['manual'] }
    };
    const newSkills = [{ id: 'new-skill', name: 'New', source: 'github' }];

    const result = mergeSkillsData(existing, newSkills);
    assert.equal(result.skills.length, 2);
    assert.equal(result.meta.total, 2);
  });

  it('updates existing skills when re-collected', () => {
    const existing = {
      skills: [{ id: 'skill-a', name: 'Old Name', source: 'manual' }],
      meta: { total: 1, last_updated: '2026-01-01T00:00:00Z', sources: ['manual'] }
    };
    const newSkills = [{ id: 'skill-a', name: 'New Name', source: 'github' }];

    const result = mergeSkillsData(existing, newSkills);
    assert.equal(result.skills.length, 1);
    assert.equal(result.skills[0].name, 'New Name');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/sean/Documents/个人项目/findskills && node --test scripts/__tests__/collect.test.js`
Expected: FAIL — module not found

**Step 3: Write collect.js**

Create `scripts/collect.js` with the following structure:

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOURCE_PRIORITY = { clawhub: 3, github: 2, manual: 1 };

// --- Exported utilities (testable) ---

export function normalizeSkillId(author, name) {
  const clean = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-');
  return `${clean(author)}-${clean(name)}`;
}

export function deduplicateSkills(skills) {
  const map = new Map();
  for (const skill of skills) {
    const existing = map.get(skill.id);
    if (!existing || (SOURCE_PRIORITY[skill.source] || 0) > (SOURCE_PRIORITY[existing.source] || 0)) {
      map.set(skill.id, skill);
    }
  }
  return Array.from(map.values());
}

export function mergeSkillsData(existing, newSkills) {
  const allSkills = [...existing.skills, ...newSkills];
  const deduped = deduplicateSkills(allSkills);
  const sources = [...new Set(deduped.map(s => s.source))];

  return {
    skills: deduped,
    meta: {
      total: deduped.length,
      last_updated: new Date().toISOString(),
      sources
    }
  };
}

// --- Collection functions ---

async function collectFromGitHub() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('GITHUB_TOKEN not set, skipping GitHub collection');
    return [];
  }

  const skills = [];
  const query = 'filename:SKILL.md path:/';
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=100`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'FindSkills-Collector'
      }
    });

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    const today = new Date().toISOString().split('T')[0];

    for (const item of data.items || []) {
      const repo = item.repository;
      const author = repo.owner.login;
      const name = repo.name;

      skills.push({
        id: normalizeSkillId(author, name),
        name: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: repo.description || `Skill from ${author}/${name}`,
        author,
        github: repo.html_url,
        source: 'github',
        tags: repo.topics || [],
        category: '',
        updated_at: repo.updated_at ? repo.updated_at.split('T')[0] : today,
        collected_at: today
      });
    }
  } catch (err) {
    console.error('GitHub collection failed:', err.message);
  }

  return skills;
}

async function collectFromSources() {
  const sourcesPath = join(ROOT, 'sources.json');
  let sources;

  try {
    sources = JSON.parse(readFileSync(sourcesPath, 'utf-8'));
  } catch {
    console.warn('sources.json not found or invalid');
    return [];
  }

  const token = process.env.GITHUB_TOKEN;
  const skills = [];
  const today = new Date().toISOString().split('T')[0];

  for (const repo of sources.repos || []) {
    try {
      const match = repo.url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) continue;

      const [, owner, name] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${name}`;
      const headers = { 'User-Agent': 'FindSkills-Collector', 'Accept': 'application/vnd.github.v3+json' };
      if (token) headers['Authorization'] = `token ${token}`;

      const res = await fetch(apiUrl, { headers });
      if (!res.ok) continue;

      const data = await res.json();

      skills.push({
        id: normalizeSkillId(owner, name),
        name: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: data.description || `Skill from ${owner}/${name}`,
        author: owner,
        github: data.html_url,
        source: 'manual',
        tags: [...(data.topics || []), ...(repo.tags || [])],
        category: '',
        updated_at: data.updated_at ? data.updated_at.split('T')[0] : today,
        collected_at: today
      });
    } catch (err) {
      console.error(`Failed to collect ${repo.url}:`, err.message);
    }
  }

  return skills;
}

// --- CLI entry point ---

if (import.meta.url === `file://${process.argv[1]}`) {
  const skillsPath = join(ROOT, 'skills.json');
  const existing = JSON.parse(readFileSync(skillsPath, 'utf-8'));

  console.log('Collecting from GitHub...');
  const githubSkills = await collectFromGitHub();
  console.log(`  Found ${githubSkills.length} skills from GitHub`);

  console.log('Collecting from sources.json...');
  const manualSkills = await collectFromSources();
  console.log(`  Found ${manualSkills.length} skills from sources`);

  const allNew = [...githubSkills, ...manualSkills];
  const merged = mergeSkillsData(existing, allNew);

  writeFileSync(skillsPath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  console.log(`Updated skills.json: ${merged.meta.total} total skills`);
}
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/sean/Documents/个人项目/findskills && node --test scripts/__tests__/collect.test.js`
Expected: PASS — all tests pass

**Step 5: Commit**

```bash
git add scripts/collect.js scripts/__tests__/collect.test.js
git commit -m "feat: add collection script with GitHub search and manual sources"
```

---

### Task 6: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/collect.yml`

**Step 1: Create the workflow file**

Create `.github/workflows/collect.yml`:

```yaml
name: Collect Skills

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6:00 UTC
  workflow_dispatch:       # Manual trigger

permissions:
  contents: write

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Collect skills from all sources
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node scripts/collect.js

      - name: Generate llms-full.txt
        run: node scripts/generate.js

      - name: Check for changes
        id: changes
        run: |
          git diff --quiet skills.json llms-full.txt || echo "changed=true" >> $GITHUB_OUTPUT

      - name: Commit and push changes
        if: steps.changes.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add skills.json llms-full.txt
          git commit -m "chore: auto-update skills data [skip ci]"
          git push
```

**Step 2: Commit**

```bash
git add .github/workflows/collect.yml
git commit -m "feat: add GitHub Actions workflow for daily skills collection"
```

---

### Task 7: Vercel Configuration

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

Create `vercel.json` — configure proper CORS headers for `skills.json` (so AI Agents can fetch it cross-origin) and correct MIME types for `.txt` files:

```json
{
  "headers": [
    {
      "source": "/skills.json",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "public, max-age=3600" },
        { "key": "Content-Type", "value": "application/json; charset=utf-8" }
      ]
    },
    {
      "source": "/llms.txt",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "public, max-age=3600" },
        { "key": "Content-Type", "value": "text/markdown; charset=utf-8" }
      ]
    },
    {
      "source": "/llms-full.txt",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "public, max-age=3600" },
        { "key": "Content-Type", "value": "text/markdown; charset=utf-8" }
      ]
    },
    {
      "source": "/robots.txt",
      "headers": [
        { "key": "Content-Type", "value": "text/plain; charset=utf-8" }
      ]
    }
  ]
}
```

**Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add vercel.json with CORS and MIME type headers"
```

---

### Task 8: Final Integration Test & First Run

**Step 1: Run all tests**

Run: `cd /Users/sean/Documents/个人项目/findskills && node --test scripts/__tests__/`
Expected: All tests pass

**Step 2: Run the generate script against seed data**

Run: `cd /Users/sean/Documents/个人项目/findskills && node scripts/generate.js`
Expected: `llms-full.txt` generated with 3 seed skills

**Step 3: Verify all files are present and correct**

Run: `ls -la /Users/sean/Documents/个人项目/findskills/` and verify these files exist:
- `index.html`
- `skills.json`
- `llms.txt`
- `llms-full.txt`
- `robots.txt`
- `vercel.json`
- `package.json`
- `sources.json`
- `scripts/collect.js`
- `scripts/generate.js`
- `.github/workflows/collect.yml`

**Step 4: Open index.html in browser for manual smoke test**

Check:
- Page loads and shows 3 skill cards
- Search bar filters correctly
- GitHub links work
- Footer links to skills.json and llms.txt
- Page source contains JSON-LD

**Step 5: Final commit if anything needed**

```bash
git add -A
git commit -m "chore: final MVP integration"
```

---

## Summary

| Task | Description | Estimated Time |
|------|-------------|---------------|
| 1 | Project scaffolding | 3 min |
| 2 | robots.txt + llms.txt | 2 min |
| 3 | Generate script + tests | 5 min |
| 4 | Frontend index.html | 10 min |
| 5 | Collection script + tests | 8 min |
| 6 | GitHub Actions workflow | 3 min |
| 7 | Vercel config | 2 min |
| 8 | Integration test | 5 min |
| **Total** | | **~38 min** |

## Post-MVP (not in this plan)

- ClawHub API collection
- `.well-known/agent-card.json`
- MCP server integration
- Community submission via Issues
- Semantic search
