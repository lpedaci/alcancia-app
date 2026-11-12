import { useCallback, useSyncExternalStore } from 'react';
import { buildDemoWallet } from '@/features/wallet/engine/demo';
import { createWallet } from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';

/**
 * walletStore (CLAUDE.md 5.3, 7): the practice wallet of each person, in a separate localStorage
 * space per person. It never leaves the browser and no view of another role imports it
 * (privacy-boundaries.test.ts). The first time, Diego and Mariana start from the demo state the
 * engine generates (wallet-engine.md, section 12); anyone else starts at day 0.
 */
export const WALLET_PREFIX = 'alcancia-wallet:';
export const walletKey = (personId: string) => `${WALLET_PREFIX}${personId}`;

const cache = new Map<string, WalletState>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function initial(personId: string): WalletState {
  return buildDemoWallet(personId) ?? createWallet(personId);
}

export function readWallet(personId: string): WalletState {
  const cached = cache.get(personId);
  if (cached) return cached;
  let state: WalletState | null = null;
  try {
    const raw = localStorage.getItem(walletKey(personId));
    const parsed = raw ? (JSON.parse(raw) as WalletState) : null;
    if (parsed && parsed.version === 1 && parsed.personId === personId) state = parsed;
  } catch {
    // Corrupted or blocked storage: start again from the initial state.
  }
  const result = state ?? initial(personId);
  cache.set(personId, result);
  return result;
}

export function writeWallet(personId: string, state: WalletState) {
  cache.set(personId, state);
  try {
    localStorage.setItem(walletKey(personId), JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): the session keeps working without saving.
  }
  notify();
}

/** "Empezar de cero" and "Restablecer demo": back to the initial state of the person. */
export function clearWallet(personId: string) {
  cache.delete(personId);
  try {
    localStorage.removeItem(walletKey(personId));
  } catch {
    // Nothing to clear.
  }
  notify();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The person's wallet and an update function that runs an engine action and saves the result. */
export function useWallet(personId: string): [WalletState, (action: (state: WalletState) => WalletState) => void] {
  const state = useSyncExternalStore(
    subscribe,
    () => readWallet(personId),
    () => readWallet(personId),
  );
  const update = useCallback(
    (action: (current: WalletState) => WalletState) => writeWallet(personId, action(readWallet(personId))),
    [personId],
  );
  return [state, update];
}
