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
    assert.ok(!result.includes('- Category:'));
  });
});
