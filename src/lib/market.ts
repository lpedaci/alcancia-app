import { useSyncExternalStore } from 'react';
import { z } from 'zod';

/**
 * Real market values (CLAUDE.md 5.6, D-79, D-264): the daily snapshot that the build writes in
 * `public/market/snapshot.json` from the BCRA and the INDEC. Read from the same origin (the CSP keeps
 * `connect-src 'self'`), once per visit. If it is missing or invalid, the app keeps the example
 * scenarios and says so: a source never breaks a screen.
 */
export type MarketId =
  | 'term-deposit-30d'
  | 'term-deposit-people'
  | 'term-deposit-uva'
  | 'badlar'
  | 'personal-loans'
  | 'uva'
  | 'cer'
  | 'fx-wholesale'
  | 'fx-retail'
  | 'inflation-monthly'
  | 'inflation-yearly';

const MarketValueSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string().regex(/^-?\d+(\.\d+)?$/),
  unit: z.enum(['percent', 'ARS', 'index']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceId: z.string(),
  stale: z.boolean().optional(),
});

export const SnapshotSchema = z.object({
  generatedAt: z.string(),
  values: z.array(MarketValueSchema),
  missing: z.array(z.string()),
  note: z.string(),
});

export type MarketValue = z.infer<typeof MarketValueSchema>;
export type Snapshot = z.infer<typeof SnapshotSchema>;

export type MarketState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: Snapshot; byId: Partial<Record<MarketId, MarketValue>> }
  | { status: 'unavailable' };

/** Parses an answer into the state the screens read; anything invalid means "unavailable". */
export function toMarketState(raw: unknown): MarketState {
  const parsed = SnapshotSchema.safeParse(raw);
  if (!parsed.success || parsed.data.values.length === 0) return { status: 'unavailable' };
  const byId: Partial<Record<MarketId, MarketValue>> = {};
  for (const v of parsed.data.values) byId[v.id as MarketId] = v;
  return { status: 'ready', snapshot: parsed.data, byId };
}

let state: MarketState = { status: 'loading' };
let started = false;
const listeners = new Set<() => void>();

function set(next: MarketState) {
  state = next;
  listeners.forEach((l) => l());
}

export function loadMarket(url = `${import.meta.env.BASE_URL}market/snapshot.json`) {
  if (started) return;
  started = true;
  fetch(url, { cache: 'no-cache' })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((raw) => set(toMarketState(raw)))
    .catch(() => set({ status: 'unavailable' }));
}

/** For tests: start again from "loading". */
export function resetMarket(next: MarketState = { status: 'loading' }) {
  started = next.status !== 'loading';
  state = next;
  listeners.forEach((l) => l());
}

export function useMarket(): MarketState {
  const snapshot = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      loadMarket();
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
  return snapshot;
}

/** "31/10/2026" from "2026-10-31". */
export const marketDate = (iso: string) => iso.split('-').reverse().join('/');
