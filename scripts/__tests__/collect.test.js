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
