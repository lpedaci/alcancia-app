import { describe, expect, it } from 'vitest';
import type { Role } from '@/types/domain';
import { type Action, can, homePath, isAggregateOnly, PERMISSIONS, requiredPermission, scopeOf, type Scope } from './permissions';

/**
 * docs/roles.md, sections 3.1 to 3.3, written as a table: ✔ own/cohorts/all, ◐ aggregated, ✖ null.
 * Columns: participant, tutor, ld_admin, sponsor.
 */
const R = (participant: Scope | null, tutor: Scope | null, ld_admin: Scope | null, sponsor: Scope | null) => ({
  participant,
  tutor,
  ld_admin,
  sponsor,
});

const MATRIX: Partial<Record<Action, Record<Role, Scope | null>>> = {
  // 3.1
  'wallet.use': R('own', null, null, null),
  'wallet.read': R('own', null, null, null),
  'learning.take': R('own', null, null, null),
  'learning.readIndividual': R('own', 'cohorts', null, null),
  'levels.readLockState': R('own', null, null, null),
  'learning.readAggregate': R(null, 'cohorts_aggregate', 'all_aggregate', 'all_aggregate'),
  'missions.readAggregate': R(null, 'cohorts_aggregate', 'all_aggregate', null),
  'diagnostic.readHabits': R('own', null, null, null),
  'diagnostic.readKnowledge': R('own', 'cohorts', 'all_aggregate', 'all_aggregate'),
  'levels.unlockForPerson': R(null, 'cohorts', null, null),
  'levels.unlockForCohort': R(null, 'cohorts', null, null),
  'program.freeMode': R(null, null, 'all', null),
  // 3.2
  'weeklyChallenge.assign': R(null, 'cohorts', null, null),
  'weeklyChallenge.report': R('own', null, null, null),
  'weeklyChallenge.readResults': R('own', 'cohorts', 'all_aggregate', null),
  'questions.ask': R('own', null, null, null),
  'questions.answer': R(null, 'cohorts', null, null),
  'assessments.readItemStats': R(null, 'cohorts_aggregate', 'all_aggregate', null),
  // 3.3
  'program.configure': R(null, null, 'all', null),
  'people.manage': R(null, null, 'all', null),
  'cohorts.manage': R(null, null, 'all', null),
  'cohorts.read': R('own', 'cohorts', 'all', null),
  'adoption.read': R(null, null, 'all_aggregate', 'all_aggregate'),
  'impact.read': R(null, null, 'all_aggregate', 'all_aggregate'),
  'privacyThreshold.edit': R(null, null, 'all', null),
};

const subject = (role: Role) => ({ personId: `p-${role}`, role });

describe('permissions matrix (docs/roles.md 3.1 to 3.3)', () => {
  for (const [action, byRole] of Object.entries(MATRIX)) {
    it(action, () => {
      for (const [role, expected] of Object.entries(byRole)) {
        expect(scopeOf(subject(role as Role), action as Action), `${action} for ${role}`).toBe(expected);
      }
    });
  }

  it('only the participant can see wallet data, habits or lock states (D-58, D-62)', () => {
    for (const action of ['wallet.read', 'diagnostic.readHabits', 'levels.readLockState'] as const) {
      expect(Object.keys(PERMISSIONS[action])).toEqual(['participant']);
    }
  });

  it('the sponsor never sees anything individual', () => {
    for (const action of Object.keys(PERMISSIONS) as Action[]) {
      const scope = scopeOf(subject('sponsor'), action);
      expect(['cohorts', 'all'].includes(scope ?? ''), action).toBe(false);
    }
  });

  it('marks aggregated scopes', () => {
    expect(isAggregateOnly(subject('tutor'), 'learning.readAggregate')).toBe(true);
    expect(isAggregateOnly(subject('tutor'), 'learning.readIndividual')).toBe(false);
  });

  it('without a session nothing is allowed', () => {
    expect(can(null, 'wallet.use')).toBe(false);
    expect(homePath(null)).toBe('/login');
  });
});

describe('routes by role (roles.md 3.4)', () => {
  it('sends each role to its home', () => {
    expect(homePath(subject('participant'))).toBe('/app');
    expect(homePath(subject('tutor'))).toBe('/tutor');
    expect(homePath(subject('ld_admin'))).toBe('/admin');
    expect(homePath(subject('sponsor'))).toBe('/sponsor');
  });

  it('protects each prefix and leaves the public routes open', () => {
    const allowed: Record<string, Role[]> = {
      '/app/tools/SIM-3': ['participant'],
      '/tutor/cohorts/c1': ['tutor'],
      '/admin/people/import': ['ld_admin'],
      '/sponsor': ['sponsor'],
    };
    for (const [path, roles] of Object.entries(allowed)) {
      const action = requiredPermission(path)!;
      for (const role of ['participant', 'tutor', 'ld_admin', 'sponsor'] as Role[]) {
        expect(can(subject(role), action), `${role} on ${path}`).toBe(roles.includes(role));
      }
    }
    for (const path of ['/', '/login', '/login/sso', '/access-help', '/consent', '/design-system', '/application']) {
      expect(requiredPermission(path), path).toBeNull();
    }
  });
});
