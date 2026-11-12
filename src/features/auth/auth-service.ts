/**
 * Simulated access (CLAUDE.md F0, 8.1). Interface simulation only: it protects nothing, because
 * everything runs in the browser (docs/security.md). The real-world rules it mirrors:
 * - generic credential errors, never revealing whether an email exists
 * - lockout after 5 failed attempts for any email (existing or not), with no self-unlock
 * - two-step verification required for the admin and the sponsor (roles.md 4)
 * - "Ver como" switches the demo session without repeating the second step (F0)
 * The demo password is a published constant and is never stored.
 */
import { LOCKOUT_ATTEMPTS, PRIVACY_NOTICE_VERSION } from '@/app/config';
import { homePath } from '@/lib/permissions';
import { useDataStore } from '@/store/data-store';
import { clearLocal } from '@/store/local-store';
import { clearWallet } from '@/store/wallet-store';
import { type LogoutReason, useSessionStore } from '@/store/session-store';
import type { AccessRequest, AccessRequestReason, AuthMethod, Person, Role, Session } from '@/types/domain';

export const DEMO_PASSWORD = 'Demo.2026!';
export const DEMO_MFA_CODE = '246810';

/** Roles that always pass the second step when signing in (roles.md 4). */
export const MFA_REQUIRED_ROLES: Role[] = ['ld_admin', 'sponsor'];

/**
 * The five demo people (CLAUDE.md 4.2), in the order of "Ver como". Mariana and Diego open in their
 * demo states (level 6 and level 2, CLAUDE.md 7): choosing them is how the example states load.
 */
export const DEMO_KEYS = {
  mariana: 'p-mariana',
  diego: 'p-diego',
  kevin: 'p-kevin',
  paula: 'p-paula',
  ricardo: 'p-ricardo',
} as const;
export type DemoKey = keyof typeof DEMO_KEYS;
export const DEMO_PERSON_IDS: string[] = Object.values(DEMO_KEYS);

export function personIdForDemoKey(key: string | null): string | undefined {
  return key && key in DEMO_KEYS ? DEMO_KEYS[key as DemoKey] : undefined;
}

const data = () => useDataStore.getState();
const session = () => useSessionStore.getState();

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function findPerson(personId: string): Person | undefined {
  return data().people.find((p) => p.id === personId);
}

function demoAccountByEmail(email: string): Person | undefined {
  const person = data().people.find((p) => p.email === normalizeEmail(email));
  return person && DEMO_PERSON_IDS.includes(person.id) ? person : undefined;
}

export function isLocked(email: string): boolean {
  return session().authAttempts[normalizeEmail(email)]?.locked === true;
}

export function mfaRequired(person: Pick<Person, 'role'>): boolean {
  return MFA_REQUIRED_ROLES.includes(person.role);
}

export type SignInStep =
  | { status: 'invalid'; failedCount: number }
  | { status: 'locked' }
  | { status: 'mfa' }
  | { status: 'signed_in'; path: string };

// ---------- First factor ----------

/** Email and password. Errors are generic; attempts are counted per email, existing or not. */
export function signInWithPassword(email: string, password: string): SignInStep {
  const key = normalizeEmail(email);
  if (isLocked(key)) return { status: 'locked' };

  const person = demoAccountByEmail(key);
  if (!person || password !== DEMO_PASSWORD) {
    const failedCount = (session().authAttempts[key]?.failedCount ?? 0) + 1;
    const locked = failedCount >= LOCKOUT_ATTEMPTS;
    session().setAuthAttempts(key, { failedCount, locked });
    return locked ? { status: 'locked' } : { status: 'invalid', failedCount };
  }

  session().setAuthAttempts(key, { failedCount: 0, locked: false });
  return continueAfterFirstFactor(person, 'password', false);
}

/** Simulated SSO: the identity provider returns the chosen work account. */
export function signInWithSso(personId: string, method: Exclude<AuthMethod, 'password'>, demo: boolean): SignInStep {
  const person = findPerson(personId);
  if (!person || !DEMO_PERSON_IDS.includes(person.id)) return { status: 'invalid', failedCount: 0 };
  if (isLocked(person.email)) return { status: 'locked' };
  return continueAfterFirstFactor(person, method, demo);
}

function continueAfterFirstFactor(person: Person, method: AuthMethod, demo: boolean): SignInStep {
  if (mfaRequired(person)) {
    session().setPending({ personId: person.id, role: person.role, method, demo });
    return { status: 'mfa' };
  }
  return { status: 'signed_in', path: openSession(person, method, 'login') };
}

// ---------- Second factor (G3) ----------

export type MfaResult = { status: 'invalid' } | { status: 'signed_in'; path: string };

export function verifyMfa(code: string): MfaResult {
  const pending = session().pending;
  const person = pending && findPerson(pending.personId);
  if (!pending || !person) return { status: 'invalid' };
  if (code.replace(/\D/g, '') !== DEMO_MFA_CODE) return { status: 'invalid' };
  return { status: 'signed_in', path: openSession(person, pending.method, 'login') };
}

export function cancelSignIn() {
  session().setPending(null);
}

// ---------- Session ----------

export function hasConsent(personId: string): boolean {
  return data().consents.some((c) => c.personId === personId && c.version === PRIVACY_NOTICE_VERSION);
}

/** Opens the session and returns where to go: the notice first (G5), then the requested route or home. */
function openSession(person: Person, method: AuthMethod, via: Session['via']): string {
  const now = new Date().toISOString();
  const next: Session = { personId: person.id, role: person.role, method, via, startedAt: now, lastActivityAt: now };
  session().startSession(next);
  if (!hasConsent(person.id)) return '/consent';
  const returnTo = session().returnTo;
  session().setReturnTo(null);
  return returnTo ?? homePath(next);
}

/** After accepting the notice: the route requested before signing in, or home. */
export function afterConsentPath(): string {
  const current = session().session;
  const returnTo = session().returnTo;
  session().setReturnTo(null);
  return returnTo && returnTo !== '/consent' ? returnTo : homePath(current);
}

export function acceptPrivacyNotice(personId: string) {
  data().acceptConsent({ personId, version: PRIVACY_NOTICE_VERSION, acceptedAt: new Date().toISOString() });
}

export function signOut(reason: Extract<LogoutReason, 'manual' | 'expired'> = 'manual') {
  session().endSession(reason);
}

/**
 * "Ver como" (F0): closes the current session and opens the chosen demo person's session without
 * the sign-in steps. It is a tool of the demo, not a permission (roles.md 3.4).
 */
export function switchPerson(personId: string): string {
  const person = findPerson(personId);
  if (!person || !DEMO_PERSON_IDS.includes(personId)) return '/login';
  if (session().session) session().endSession('switch');
  session().setReturnTo(null);
  return openSession(person, 'sso_microsoft', 'switch');
}

/**
 * "Restablecer demo" (CLAUDE.md 7): seed data back, every demo person's local data cleared (their
 * example states come back), lockouts and demo preferences cleared, session closed.
 */
export function resetDemo() {
  data().resetData();
  for (const person of data().people) {
    clearLocal(person.id);
    clearWallet(person.id);
  }
  session().resetSessionState();
  session().endSession('reset');
}

// ---------- Help desk (G4) ----------

export interface AccessRequestInput {
  email: string;
  reason: AccessRequestReason;
  comment?: string;
}

/** Comment that triggers the simulated server error in G4, once (CLAUDE.md 2.10). */
export const SIMULATED_ERROR_TRIGGER = '#error';

export class ServiceUnavailableError extends Error {
  constructor() {
    super('service_unavailable');
  }
}

/**
 * Registers the request for the help desk. The confirmation is the same whether the email exists
 * or not, so the screen never reveals who has an account.
 */
export function createAccessRequest(input: AccessRequestInput, simulateFailure = false): string {
  if (simulateFailure) throw new ServiceUnavailableError();
  const requests = data().accessRequests;
  const max = Math.max(0, ...requests.map((r) => Number(r.id.split('-').at(-1)) || 0));
  const request: AccessRequest = {
    id: `MDA-2026-${String(max + 1).padStart(4, '0')}`,
    email: normalizeEmail(input.email),
    createdAt: new Date().toISOString(),
    reason: input.reason,
    comment: input.comment?.replace(SIMULATED_ERROR_TRIGGER, '').trim() || undefined,
    status: 'new',
  };
  data().addAccessRequest(request);
  return request.id;
}
