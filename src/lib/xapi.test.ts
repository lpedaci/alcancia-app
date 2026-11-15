import { describe, expect, it } from 'vitest';
import { seedOrgData } from '@/store/data-store';
import { countByVerb, deriveStatements, partnerEvents, pseudonym, XAPI_VERBS } from './xapi';

/** F21 (D-272): the activity log carries learning only, with pseudonymous actors. */
describe('xAPI-like activity log', () => {
  const data = seedOrgData();
  const statements = deriveStatements(data);

  it('has one statement per learning record, the newest first', () => {
    const guides = data.guideProgress.reduce((n, g) => n + g.guideIdsDone.length, 0);
    const expected = data.diagnostics.length + guides + data.challengeAttempts.length + data.missionCompletions.length + data.weeklyReports.length;
    expect(statements).toHaveLength(expected);
    expect(statements.every((s, i) => i === 0 || statements[i - 1]!.timestamp >= s.timestamp)).toBe(true);
    const c = countByVerb(statements);
    expect(c.passed + c.failed).toBe(data.challengeAttempts.length);
  });

  it('uses ADL verbs and never a name, an email or money', () => {
    const text = JSON.stringify(statements);
    for (const p of data.people) {
      expect(text).not.toContain(p.name);
      expect(text).not.toContain(p.email);
      expect(text).not.toContain(`"${p.id}`);
      expect(text).not.toContain(`${p.id}:`);
    }
    expect(text).not.toMatch(/"(balance|amount|movements|pocket|saldo|habit|reflection|status)"|\$\s?\d/i);
    expect(statements.every((s) => Object.values(XAPI_VERBS).includes(s.verb.id as never))).toBe(true);
  });

  it('pseudonyms are stable and differ between people and organizations', () => {
    expect(pseudonym('p-mariana', 'org-andina')).toBe(pseudonym('p-mariana', 'org-andina'));
    expect(pseudonym('p-mariana', 'org-andina')).not.toBe(pseudonym('p-diego', 'org-andina'));
    expect(pseudonym('p-mariana', 'org-andina')).not.toBe(pseudonym('p-mariana', 'org-ceibo'));
    // No two people of an organization share a pseudonym
    expect(new Set(data.people.map((p) => pseudonym(p.id, data.organization.id))).size).toBe(data.people.length);
  });

  it('the partner only gets milestones, without results or scores (5.5)', () => {
    const events = partnerEvents(deriveStatements(data, 'p-mariana'));
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => !('result' in e))).toBe(true);
    expect(events.every((e) => ['completed', 'passed'].includes(e.verb.display['en-US']))).toBe(true);
    expect(events.some((e) => e.object.definition.type === 'diagnostic' || e.object.definition.type === 'weekly-challenge')).toBe(false);
  });
});
