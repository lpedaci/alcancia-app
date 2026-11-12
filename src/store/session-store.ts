import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthMethod, Role, Session } from '@/types/domain';

/**
 * Simulated session (CLAUDE.md F0, 8.1). Everything here is demo state: there are no tokens and no
 * passwords. In production the session lives in HttpOnly cookies issued by the server
 * (docs/security.md). Lockouts live here too, because they belong to this browser's demo.
 */
export type LogoutReason = 'manual' | 'expired' | 'switch' | 'reset';

/** A sign-in in progress, between the first factor and the verified session (G3). */
export interface PendingAuth {
  personId: string;
  role: Role;
  method: AuthMethod;
  /** One-click access from the landing: the verification code is prefilled. */
  demo: boolean;
}

export interface AuthAttempts {
  failedCount: number;
  locked: boolean;
}

interface SessionState {
  session: Session | null;
  pending: PendingAuth | null;
  /** Route requested before signing in, to return to it afterwards. */
  returnTo: string | null;
  /** Message for the login screen after signing out. Not persisted. */
  lastLogout: LogoutReason | null;
  /** Session warning dialog is open (idle timer). Not persisted. */
  warningOpen: boolean;
  /** Failed attempts per email (existing or not), for the generic lockout. */
  authAttempts: Record<string, AuthAttempts>;
  /** Demo mode of the portfolio (5.0): "Ver todo desbloqueado" in the wallet. */
  demoUnlockAll: boolean;

  setPending: (pending: PendingAuth | null) => void;
  setReturnTo: (path: string | null) => void;
  startSession: (session: Session) => void;
  touch: (at?: number) => void;
  endSession: (reason: LogoutReason) => void;
  clearLastLogout: () => void;
  setWarningOpen: (open: boolean) => void;
  setAuthAttempts: (email: string, attempts: AuthAttempts) => void;
  setDemoUnlockAll: (value: boolean) => void;
  resetSessionState: () => void;
}

export const SESSION_STORAGE_KEY = 'alcancia-session';

const initial = {
  session: null,
  pending: null,
  returnTo: null,
  lastLogout: null,
  warningOpen: false,
  authAttempts: {},
  demoUnlockAll: false,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initial,
      setPending: (pending) => set({ pending }),
      setReturnTo: (returnTo) => set({ returnTo }),
      startSession: (session) => set({ session, pending: null, lastLogout: null, warningOpen: false }),
      touch: (at = Date.now()) =>
        set((state) =>
          state.session ? { session: { ...state.session, lastActivityAt: new Date(at).toISOString() } } : state,
        ),
      endSession: (reason) => set({ session: null, pending: null, warningOpen: false, lastLogout: reason }),
      clearLastLogout: () => set({ lastLogout: null }),
      setWarningOpen: (warningOpen) => set({ warningOpen }),
      setAuthAttempts: (email, attempts) => set((state) => ({ authAttempts: { ...state.authAttempts, [email]: attempts } })),
      setDemoUnlockAll: (demoUnlockAll) => set({ demoUnlockAll }),
      resetSessionState: () => set(initial),
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ session, pending, returnTo, authAttempts, demoUnlockAll }) => ({
        session,
        pending,
        returnTo,
        authAttempts,
        demoUnlockAll,
      }),
    },
  ),
);

/** Current signed-in subject, for permission checks. */
export function useCurrentUser() {
  return useSessionStore((state) => state.session);
}
