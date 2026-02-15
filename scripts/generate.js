import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    if (skill.stars) {
      lines.push(`- Stars: ${skill.stars}`);
    }
    lines.push(`- Source: ${skill.source}`);
    lines.push('');
  }

  return lines.join('\n');
}

// CLI entry point: read skills.json, write llms-full.txt
if (process.argv[1] && __filename === resolve(process.argv[1])) {
  const skillsPath = join(ROOT, 'skills.json');
  const outputPath = join(ROOT, 'llms-full.txt');

  const data = JSON.parse(readFileSync(skillsPath, 'utf-8'));
  const content = generateLlmsFullTxt(data);
  writeFileSync(outputPath, content, 'utf-8');

  console.log(`Generated llms-full.txt with ${data.meta.total} skills`);
}
