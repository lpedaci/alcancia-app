import { useSyncExternalStore } from 'react';

/**
 * Integrated mode (D-75, 5.5): Alcancía shown inside the app of a fictitious partner, Hornero (D-84).
 * Kept for this browser tab only (sessionStorage): opening the demo again starts in Alcancía's own mode.
 */
export type Partner = 'hornero';
const KEY = 'alcancia-partner';
const listeners = new Set<() => void>();

function read(): Partner | null {
  try {
    return sessionStorage.getItem(KEY) === 'hornero' ? 'hornero' : null;
  } catch {
    return null;
  }
}

function write(value: Partner | null) {
  try {
    if (value) sessionStorage.setItem(KEY, value);
    else sessionStorage.removeItem(KEY);
  } catch {
    // Blocked storage: the mode lasts until the next reload.
  }
  current = value;
  listeners.forEach((l) => l());
}

let current: Partner | null = read();

export const enterPartnerMode = (partner: Partner) => write(partner);
export const exitPartnerMode = () => write(null);

export function usePartnerMode(): Partner | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}

/** Home of the partner app in the demo. */
export const HORNERO_HOME = '/app/hornero';
