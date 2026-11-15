import { createContext, useContext, useSyncExternalStore } from 'react';

/**
 * Hide amounts (D-260): one choice for the whole wallet, kept in this browser, so the money is not
 * read by someone looking at the screen. It is a demo convenience: nothing leaves the browser.
 */
const KEY = 'alcancia-ui:hide-amounts';
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

let current = read();

export function setAmountsHidden(value: boolean) {
  current = value;
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    // The choice only lasts for this visit.
  }
  listeners.forEach((l) => l());
}

export function useAmountsHidden(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => false,
  );
}

/** True inside the wallet when the person chose to hide amounts; MoneyText reads it. */
export const MaskAmountsContext = createContext(false);
export const useMaskAmounts = () => useContext(MaskAmountsContext);
