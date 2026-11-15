import { useSyncExternalStore } from 'react';

export type ToastTone = 'success' | 'info' | 'error';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

/**
 * Our own timer (D-241): Radix pauses toasts while the window has no focus, so in an embedded view
 * or after switching windows they never closed. A toast closes after 5 seconds; it holds while the
 * pointer or the focus is on it (WCAG 2.2.1) and starts the count again when they leave.
 */
export const TOAST_DURATION_MS = 5000;
const timers = new Map<number, number>();

function startTimer(id: number) {
  window.clearTimeout(timers.get(id));
  timers.set(
    id,
    window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS),
  );
}

export function holdToast(id: number) {
  window.clearTimeout(timers.get(id));
  timers.delete(id);
}

export function releaseToast(id: number) {
  if (items.some((item) => item.id === id)) startTimer(id);
}

function emit() {
  for (const listener of listeners) listener();
}

function push(tone: ToastTone, message: string) {
  // One toast at a time (Rumbo D-90): a new one replaces the previous, so they never pile up.
  for (const item of items) holdToast(item.id);
  const id = nextId++;
  items = [{ id, tone, message }];
  startTimer(id);
  emit();
}

/** Show a toast from anywhere. Success messages go in past tense and stay short (2.9). */
export const toast = {
  success: (message: string) => push('success', message),
  info: (message: string) => push('info', message),
  error: (message: string) => push('error', message),
};

export function dismissToast(id: number) {
  holdToast(id);
  items = items.filter((item) => item.id !== id);
  emit();
}

export function useToasts(): ToastItem[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => items,
    () => items,
  );
}
