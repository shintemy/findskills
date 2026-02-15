import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const SOURCE_PRIORITY = { clawhub: 3, github: 2, manual: 1 };

// --- Exported utilities (testable) ---

export function normalizeSkillId(author, name) {
  const clean = (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${clean(author)}-${clean(name)}`;
}

export function parseLinkHeader(header) {
  if (!header) return null;
  const match = header.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
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
  const sources = [...new Set(deduped.map(s => s.source).filter(Boolean))];

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
  let url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=100`;
  let page = 0;
  const today = new Date().toISOString().split('T')[0];

  while (url && page < 10) {
    page++;
    console.log(`  GitHub search page ${page}...`);

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FindSkills-Collector'
        }
      });

      if (res.status === 403) {
        const retryAfter = res.headers.get('retry-after');
        if (retryAfter) {
          console.warn(`  Rate limited. Retrying after ${retryAfter}s...`);
          await new Promise(r => setTimeout(r, parseInt(retryAfter, 10) * 1000));
          page--; // Retry same page
          continue;
        }
        console.error('GitHub API 403 Forbidden (no Retry-After)');
        break;
      }

      if (!res.ok) {
        console.error(`GitHub API error: ${res.status} ${res.statusText}`);
        break;
      }

      const data = await res.json();

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

      // Follow pagination via Link header
      url = parseLinkHeader(res.headers.get('link'));

      // Respect rate limit: GitHub code search allows 10 req/min
      if (url) await new Promise(r => setTimeout(r, 6500));
    } catch (err) {
      console.error('GitHub collection failed:', err.message);
      break;
    }
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

if (process.argv[1] && __filename === resolve(process.argv[1])) {
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
