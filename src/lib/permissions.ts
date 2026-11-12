import type { Role } from '@/types/domain';

/**
 * Single source of permissions (CLAUDE.md F0, docs/roles.md section 3): a role × action matrix.
 * Routes, navigation and buttons always ask `can(user, action)`; components never compare role
 * names. If this file changes, docs/roles.md changes in the same commit (and the other way round).
 *
 * Scopes express least privilege in the data:
 * - `own`: only the person's own data
 * - `cohorts`: individual data of the tutor's cohorts
 * - `all`: the whole organization
 * - `cohorts_aggregate` and `all_aggregate`: only aggregated, through `aggregate()` with the
 *   privacy threshold (metrics.ts)
 */
export type Scope = 'own' | 'cohorts' | 'all' | 'cohorts_aggregate' | 'all_aggregate';

export const ROLES: Role[] = ['participant', 'tutor', 'ld_admin', 'sponsor'];

export const PERMISSIONS = {
  // Workspaces: each role lands on its own (roles.md 3.4).
  'workspace:wallet': { participant: 'own' },
  'workspace:tutor': { tutor: 'cohorts' },
  'workspace:admin': { ld_admin: 'all' },
  'workspace:sponsor': { sponsor: 'all_aggregate' },

  // 3.1 Wallet and learning of the participant
  'wallet.use': { participant: 'own' },
  'wallet.read': { participant: 'own' },
  'learning.take': { participant: 'own' },
  /** Never the lock state of a level (D-58). */
  'learning.readIndividual': { participant: 'own', tutor: 'cohorts' },
  'levels.readLockState': { participant: 'own' },
  'learning.readAggregate': { tutor: 'cohorts_aggregate', ld_admin: 'all_aggregate', sponsor: 'all_aggregate' },
  'missions.readAggregate': { tutor: 'cohorts_aggregate', ld_admin: 'all_aggregate' },
  /** Habit answers of Conocerte never leave the browser (D-62). */
  'diagnostic.readHabits': { participant: 'own' },
  'diagnostic.readKnowledge': {
    participant: 'own',
    tutor: 'cohorts',
    ld_admin: 'all_aggregate',
    sponsor: 'all_aggregate',
  },
  'levels.unlockForPerson': { tutor: 'cohorts' },
  'levels.unlockForCohort': { tutor: 'cohorts' },
  'program.freeMode': { ld_admin: 'all' },

  // 3.2 Tutoring
  'weeklyChallenge.assign': { tutor: 'cohorts' },
  'weeklyChallenge.report': { participant: 'own' },
  /** The tutor sees the result, never the reflection. */
  'weeklyChallenge.readResults': { participant: 'own', tutor: 'cohorts', ld_admin: 'all_aggregate' },
  'questions.ask': { participant: 'own' },
  'questions.answer': { tutor: 'cohorts' },
  'assessments.readItemStats': { tutor: 'cohorts_aggregate', ld_admin: 'all_aggregate' },

  // 3.3 Organization and impact
  'program.configure': { ld_admin: 'all' },
  'people.manage': { ld_admin: 'all' },
  'cohorts.manage': { ld_admin: 'all' },
  'cohorts.read': { participant: 'own', tutor: 'cohorts', ld_admin: 'all' },
  'adoption.read': { ld_admin: 'all_aggregate', sponsor: 'all_aggregate' },
  'impact.read': { ld_admin: 'all_aggregate', sponsor: 'all_aggregate' },
  'impact.export': { ld_admin: 'all_aggregate', sponsor: 'all_aggregate' },
  /** Only upwards: never below 5 (F1). */
  'privacyThreshold.edit': { ld_admin: 'all' },

  // Own account (P14 for the participant; user menu for everyone)
  'account.own': { participant: 'own', tutor: 'own', ld_admin: 'own', sponsor: 'own' },
  // Demo controls, available to every visitor (they are not permissions of the product, roles.md 3.4)
  'demo.switchRole': { participant: 'own', tutor: 'own', ld_admin: 'own', sponsor: 'own' },
  'demo.reset': { participant: 'own', tutor: 'own', ld_admin: 'own', sponsor: 'own' },
} as const satisfies Record<string, Partial<Record<Role, Scope>>>;

export type Action = keyof typeof PERMISSIONS;

export interface Subject {
  personId: string;
  role: Role;
}

/** Scope of an action for a user, or null when not allowed. */
export function scopeOf(user: Subject | null | undefined, action: Action): Scope | null {
  if (!user) return null;
  const byRole = PERMISSIONS[action] as Partial<Record<Role, Scope>>;
  return byRole[user.role] ?? null;
}

export function can(user: Subject | null | undefined, action: Action): boolean {
  return scopeOf(user, action) !== null;
}

/** True when the role may only see this action aggregated, with the privacy threshold. */
export function isAggregateOnly(user: Subject | null | undefined, action: Action): boolean {
  const scope = scopeOf(user, action);
  return scope === 'cohorts_aggregate' || scope === 'all_aggregate';
}

/** Home of each workspace, in priority order (roles.md 3.4). */
export const WORKSPACE_HOME: { action: Action; path: string }[] = [
  { action: 'workspace:wallet', path: '/app' },
  { action: 'workspace:tutor', path: '/tutor' },
  { action: 'workspace:admin', path: '/admin' },
  { action: 'workspace:sponsor', path: '/sponsor' },
];

/** Where a user lands after signing in, from the matrix (not from the role name). */
export function homePath(user: Subject | null | undefined): string {
  return WORKSPACE_HOME.find(({ action }) => can(user, action))?.path ?? '/login';
}

/** Required permission of each internal route prefix (roles.md 3.4). Longest prefix wins. */
export const ROUTE_PERMISSIONS: { prefix: string; action: Action }[] = [
  { prefix: '/app', action: 'workspace:wallet' },
  { prefix: '/tutor', action: 'workspace:tutor' },
  { prefix: '/admin', action: 'workspace:admin' },
  { prefix: '/admin/program', action: 'program.configure' },
  { prefix: '/admin/people', action: 'people.manage' },
  { prefix: '/sponsor', action: 'workspace:sponsor' },
];

export function requiredPermission(pathname: string): Action | null {
  const match = ROUTE_PERMISSIONS.filter(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0];
  return match?.action ?? null;
}

/** Routes that need a session (everything protected by ROUTE_PERMISSIONS). */
export function isProtectedPath(pathname: string): boolean {
  return requiredPermission(pathname) !== null;
}
