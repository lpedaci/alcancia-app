import { useSyncExternalStore } from 'react';

/**
 * Light, dark or the system's theme (F17, step 35, D-322). A per-viewer convenience kept in this
 * browser's storage: it sets `data-theme` on <html>, where the dark color roles of tokens.css live.
 * "Del sistema" follows `prefers-color-scheme` and changes with it. Applied before the first paint.
 */
export type ThemeChoice = 'light' | 'dark' | 'system';
export const THEME_CHOICES: ThemeChoice[] = ['light', 'dark', 'system'];
const KEY = 'alcancia-ui:theme';
const listeners = new Set<() => void>();

export function readTheme(): ThemeChoice {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'light';
  } catch {
    return 'light';
  }
}

const systemDark = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);

/** The theme actually shown: the choice, or the system's when the choice is "system". */
export const resolveTheme = (choice: ThemeChoice): 'light' | 'dark' => (choice === 'system' ? (systemDark() ? 'dark' : 'light') : choice);

export function applyTheme(choice: ThemeChoice = readTheme()) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolveTheme(choice);
}

export function setTheme(choice: ThemeChoice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked: the choice lasts for this page only
  }
  applyTheme(choice);
  for (const l of listeners) l();
}

let watching = false;
function watchSystem() {
  if (watching || typeof window === 'undefined' || !window.matchMedia) return;
  watching = true;
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (readTheme() === 'system') applyTheme('system');
    for (const l of listeners) l();
  });
}

export function useTheme(): [ThemeChoice, (choice: ThemeChoice) => void] {
  watchSystem();
  const choice = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readTheme,
    () => 'light' as ThemeChoice,
  );
  return [choice, setTheme];
}
