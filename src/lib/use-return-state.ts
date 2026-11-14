import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from '@/store/session-store';

/**
 * "La guía nace de la acción" (D-78): going from a wallet screen to a part of a guide and back keeps
 * what the person had typed. Form fields of the wallet screens use this instead of `useState`; the
 * value lives in `sessionStorage`, per person and per field, only for the browser session (nothing
 * leaves the browser, D-58).
 */
const PREFIX = 'alcancia-return:';

function read<T>(key: string, initial: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? initial : (JSON.parse(raw) as T);
  } catch {
    return initial;
  }
}

export function useReturnState<T>(field: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const personId = useCurrentUser()?.personId ?? 'anon';
  const key = `${PREFIX}${personId}:${field}`;
  const [value, setValue] = useState<T>(() => read(key, initial));
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Blocked storage: the field still works, it just does not survive the trip to the guide.
    }
  }, [key, value]);
  return [value, setValue];
}

const SCROLL = 'alcancia-scroll:';

/** Called when leaving for a guide: remembers where the screen was scrolled. */
export function rememberScroll(path: string) {
  try {
    sessionStorage.setItem(`${SCROLL}${path}`, String(Math.round(window.scrollY)));
  } catch {
    // Nothing to remember.
  }
}

/** On a wallet screen: when coming back from a guide, scrolls to where the person was. */
export function useRestoreScroll(path: string) {
  const restore = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(`${SCROLL}${path}`);
      if (raw === null) return;
      sessionStorage.removeItem(`${SCROLL}${path}`);
      window.requestAnimationFrame(() => window.scrollTo({ top: Number(raw), behavior: 'auto' }));
    } catch {
      // Blocked storage.
    }
  }, [path]);
  useEffect(restore, [restore]);
}

/** Only screens of the app can be a return target (no open redirect through `from`). */
export function safeReturnPath(from: string | null): string | undefined {
  if (!from || !from.startsWith('/app') || from.startsWith('//') || from.includes('://')) return undefined;
  return from;
}
