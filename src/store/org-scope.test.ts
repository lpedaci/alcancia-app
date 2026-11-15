import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_CONTEXTS, switchPerson } from '@/features/auth/auth-service';
import { orgIdOfPerson, scopeToOrg, seedData, useDataStore } from '@/store/data-store';
import { useSessionStore } from '@/store/session-store';

/** Contexts of use (5.5, D-74): one shared store, and no organization sees another one's records. */
describe('organization scope', () => {
  const data = seedData();

  it('each organization sees only its own people, cohorts and records', () => {
    for (const org of data.organizations) {
      const scoped = scopeToOrg(data, org.id);
      const ids = new Set(scoped.people.map((p) => p.id));
      expect(scoped.organization.id).toBe(org.id);
      expect(scoped.program.orgId).toBe(org.id);
      expect(scoped.people.every((p) => p.orgId === org.id)).toBe(true);
      expect(scoped.cohorts.every((c) => c.orgId === org.id)).toBe(true);
      for (const list of [scoped.diagnostics, scoped.guideProgress, scoped.challengeAttempts, scoped.itemResponses, scoped.levelLearning, scoped.missionCompletions, scoped.weeklyReports, scoped.followUps, scoped.tutorQuestions]) {
        expect(list.every((r) => ids.has(r.personId))).toBe(true);
      }
    }
  });

  it('the three slices add up to the whole: nothing is lost and nothing is shared', () => {
    const total = data.organizations.reduce((n, o) => n + scopeToOrg(data, o.id).people.length, 0);
    expect(total).toBe(data.people.length);
  });

  it('the demo people of each context belong to its organization', () => {
    const kindOf = (personId: string) => data.organizations.find((o) => o.id === orgIdOfPerson(data, personId))?.kind;
    for (const c of DEMO_CONTEXTS) for (const id of c.personIds) expect(kindOf(id)).toBe(c.kind);
  });
});

describe('entering by context (5.5)', () => {
  beforeEach(() => {
    useDataStore.getState().resetData();
    useSessionStore.getState().endSession('reset');
  });

  it('a Hornero user opens inside Hornero; a Ceibo student, in the wallet', () => {
    for (const id of ['p-joaquin', 'p-lucia']) useDataStore.getState().acceptConsent({ personId: id, version: '1.0', acceptedAt: '2026-11-16T10:00:00.000Z' });
    expect(switchPerson('p-joaquin')).toBe('/app/hornero');
    expect(switchPerson('p-lucia')).toBe('/app');
    expect(switchPerson('p-silvia')).toMatch(/^\/(consent|admin)/);
  });
});
