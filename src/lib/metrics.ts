import { PRIVACY_THRESHOLD_MIN } from '@/app/config';

/**
 * Aggregated metrics with a privacy threshold (CLAUDE.md F7, docs/formulas.md F-27). Every metric
 * shown to the tutor, the admin or the sponsor goes through `aggregate()`. Metrics are always
 * computed from data, never written by hand.
 */

export type Aggregate<T> =
  | { status: 'ok'; value: T; count: number }
  | { status: 'insufficient'; count: null };

/** The threshold never goes below 5, whatever the program configuration says. */
export function effectiveThreshold(configured: number = PRIVACY_THRESHOLD_MIN): number {
  return Math.max(PRIVACY_THRESHOLD_MIN, Math.floor(configured));
}

/**
 * Computes a value only when the group has at least `threshold` distinct people. Below it, the
 * result says "insufficient" and does not even reveal the group size.
 */
export function aggregate<P, T>(
  people: readonly P[],
  compute: (people: readonly P[]) => T,
  { threshold = PRIVACY_THRESHOLD_MIN, idOf }: { threshold?: number; idOf?: (person: P) => string } = {},
): Aggregate<T> {
  const count = idOf ? new Set(people.map(idOf)).size : people.length;
  if (count < effectiveThreshold(threshold)) return { status: 'insufficient', count: null };
  return { status: 'ok', value: compute(people), count };
}

export interface BreakdownPart<T> {
  key: string;
  people: number;
  value: T;
}

export type BreakdownResult<T> = {
  key: string;
  result: Aggregate<T>;
}[];

/**
 * A total and its parts in the same view (for example, adoption by cohort). Parts below the
 * threshold are hidden, and so is the smallest visible part when the hidden ones would add up to
 * fewer than `threshold` people: otherwise "total minus the visible parts" would reveal a small
 * group (complementary suppression).
 */
export function breakdown<T>(parts: readonly BreakdownPart<T>[], threshold = PRIVACY_THRESHOLD_MIN): BreakdownResult<T> {
  const limit = effectiveThreshold(threshold);
  const hidden = new Set(parts.filter((p) => p.people < limit).map((p) => p.key));
  const hiddenPeople = () => parts.filter((p) => hidden.has(p.key)).reduce((sum, p) => sum + p.people, 0);
  while (hidden.size > 0 && hiddenPeople() < limit) {
    const nextVisible = parts
      .filter((p) => !hidden.has(p.key))
      .sort((a, b) => a.people - b.people || a.key.localeCompare(b.key))[0];
    if (!nextVisible) break;
    hidden.add(nextVisible.key);
  }
  return parts.map((p) => ({
    key: p.key,
    result: hidden.has(p.key) ? { status: 'insufficient', count: null } : { status: 'ok', value: p.value, count: p.people },
  }));
}

/** Average of a list of numbers (scores, satisfaction); null when empty. Not for money. */
export function average(values: readonly number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Share of items that pass a test, from 0 to 1; null when empty. */
export function share<T>(items: readonly T[], test: (item: T) => boolean): number | null {
  if (!items.length) return null;
  return items.filter(test).length / items.length;
}
