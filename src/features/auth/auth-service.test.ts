import { beforeEach, describe, expect, it } from 'vitest';
import { useDataStore } from '@/store/data-store';
import { localKey, writeLocal } from '@/store/local-store';
import { useSessionStore } from '@/store/session-store';
import { resetAll, signInAs } from '@/test/session';
import {
  acceptPrivacyNotice,
  afterConsentPath,
  createAccessRequest,
  DEMO_MFA_CODE,
  DEMO_PASSWORD,
  hasConsent,
  resetDemo,
  ServiceUnavailableError,
  signInWithPassword,
  signInWithSso,
  switchPerson,
  verifyMfa,
} from './auth-service';

const session = () => useSessionStore.getState();

beforeEach(() => resetAll());

describe('password sign-in (F0)', () => {
  it('signs in a participant without a second step and asks for the notice first (G5)', () => {
    expect(signInWithPassword('Mariana.Lopez@andina.demo ', DEMO_PASSWORD)).toEqual({ status: 'signed_in', path: '/consent' });
    expect(session().session).toMatchObject({ personId: 'p-mariana', role: 'participant', method: 'password', via: 'login' });
  });

  it('gives the same generic error for a wrong password and an unknown email', () => {
    expect(signInWithPassword('mariana.lopez@andina.demo', 'nope')).toEqual({ status: 'invalid', failedCount: 1 });
    expect(signInWithPassword('nadie@andina.demo', DEMO_PASSWORD)).toEqual({ status: 'invalid', failedCount: 1 });
  });

  it('locks after 5 failed attempts, even with the right password afterwards, with no self-unlock', () => {
    for (let i = 1; i <= 4; i++) expect(signInWithPassword('diego.suarez@andina.demo', 'x').status).toBe('invalid');
    expect(signInWithPassword('diego.suarez@andina.demo', 'x')).toEqual({ status: 'locked' });
    expect(signInWithPassword('diego.suarez@andina.demo', DEMO_PASSWORD)).toEqual({ status: 'locked' });
    expect(signInWithSso('p-diego', 'sso_microsoft', true)).toEqual({ status: 'locked' });
    // Other people are not affected.
    expect(signInWithPassword('mariana.lopez@andina.demo', DEMO_PASSWORD).status).toBe('signed_in');
  });

  it('only demo accounts can sign in', () => {
    const someone = useDataStore.getState().people.find((p) => p.role === 'participant' && p.id !== 'p-mariana' && p.id !== 'p-diego')!;
    expect(signInWithPassword(someone.email, DEMO_PASSWORD).status).toBe('invalid');
  });
});

describe('two-step verification (G3)', () => {
  it('is required for the admin and the sponsor, not for the tutor or participants', () => {
    expect(signInWithSso('p-paula', 'sso_microsoft', true)).toEqual({ status: 'mfa' });
    expect(session().pending).toMatchObject({ personId: 'p-paula', demo: true });
    expect(session().session).toBeNull();
    resetAll();
    expect(signInWithSso('p-ricardo', 'sso_google', false)).toEqual({ status: 'mfa' });
    resetAll();
    expect(signInWithSso('p-andres', 'sso_google', true).status).toBe('signed_in');
  });

  it('accepts only the demo code, also pasted with spaces', () => {
    signInWithSso('p-paula', 'sso_microsoft', true);
    expect(verifyMfa('111111')).toEqual({ status: 'invalid' });
    acceptPrivacyNotice('p-paula');
    expect(verifyMfa(` ${DEMO_MFA_CODE.slice(0, 3)} ${DEMO_MFA_CODE.slice(3)} `)).toEqual({ status: 'signed_in', path: '/admin' });
    expect(session().pending).toBeNull();
  });
});

describe('"Ver como" (F0)', () => {
  it('switches without the second step and closes the previous session', () => {
    signInAs('p-mariana');
    expect(switchPerson('p-ricardo')).toBe('/consent');
    expect(session().session).toMatchObject({ personId: 'p-ricardo', role: 'sponsor', via: 'switch' });
    expect(session().pending).toBeNull();
    acceptPrivacyNotice('p-ricardo');
    expect(switchPerson('p-ricardo')).toBe('/sponsor');
  });

  it('never opens a session for a person outside the demo', () => {
    expect(switchPerson('p-unknown')).toBe('/login');
  });
});

describe('consent and return route (G5)', () => {
  it('returns to the requested route after accepting', () => {
    session().setReturnTo('/app/tools/SIM-3');
    signInWithPassword('mariana.lopez@andina.demo', DEMO_PASSWORD);
    expect(hasConsent('p-mariana')).toBe(false);
    acceptPrivacyNotice('p-mariana');
    expect(afterConsentPath()).toBe('/app/tools/SIM-3');
    expect(afterConsentPath()).toBe('/app');
  });
});

describe('help desk (G4)', () => {
  it('records a request with a number, the same for known and unknown emails', () => {
    expect(createAccessRequest({ email: 'nadie@andina.demo', reason: 'locked' })).toBe('MDA-2026-0001');
    expect(createAccessRequest({ email: 'Diego.Suarez@andina.demo', reason: 'other', comment: 'Hola #error' })).toBe('MDA-2026-0002');
    const requests = useDataStore.getState().accessRequests;
    expect(requests[1]).toMatchObject({ email: 'diego.suarez@andina.demo', comment: 'Hola', status: 'new' });
    expect(requests[0]).not.toHaveProperty('personId');
  });

  it('can simulate a server error', () => {
    expect(() => createAccessRequest({ email: 'a@andina.demo', reason: 'other' }, true)).toThrow(ServiceUnavailableError);
    expect(useDataStore.getState().accessRequests).toHaveLength(0);
  });
});

describe('"Restablecer demo" (CLAUDE.md 7)', () => {
  it('clears session, lockouts, consents, requests, demo mode and local data', () => {
    for (let i = 0; i < 5; i++) signInWithPassword('diego.suarez@andina.demo', 'x');
    signInAs('p-mariana');
    session().setDemoUnlockAll(true);
    createAccessRequest({ email: 'a@andina.demo', reason: 'other' });
    writeLocal('p-mariana', (d) => ({ ...d, habitAnswers: { q1: 'often' } }));
    resetDemo();
    expect(session().session).toBeNull();
    expect(session().lastLogout).toBe('reset');
    expect(session().authAttempts).toEqual({});
    expect(session().demoUnlockAll).toBe(false);
    expect(useDataStore.getState().consents).toEqual([]);
    expect(useDataStore.getState().accessRequests).toEqual([]);
    expect(localStorage.getItem(localKey('p-mariana'))).toBeNull();
  });
});
