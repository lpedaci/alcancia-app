import { acceptPrivacyNotice, resetDemo, switchPerson } from '@/features/auth/auth-service';
import { useSessionStore } from '@/store/session-store';

/** Back to the seed: no session, no consents, no lockouts, no local data. */
export function resetAll() {
  resetDemo();
  useSessionStore.getState().clearLastLogout();
  localStorage.clear();
}

/** Opens a demo person's session as "Ver como" does; by default with the privacy notice accepted. */
export function signInAs(personId: string, { consent = true } = {}) {
  if (consent) acceptPrivacyNotice(personId);
  switchPerson(personId);
}
