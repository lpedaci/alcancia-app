import { describe, expect, it } from 'vitest';
import { aggregate, average, breakdown, effectiveThreshold, share } from './metrics';

const people = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `p-${i}`, score: 60 + i }));

describe('aggregate (F-27)', () => {
  it('4 people: insufficient data, without revealing the size', () => {
    expect(aggregate(people(4), (g) => g.length)).toEqual({ status: 'insufficient', count: null });
  });

  it('5 people: shows the value', () => {
    expect(aggregate(people(5), (g) => average(g.map((p) => p.score)))).toEqual({ status: 'ok', value: 62, count: 5 });
  });

  it('counts distinct people, not rows (two attempts of one person are one person)', () => {
    const rows = [...people(4), { id: 'p-0', score: 99 }];
    expect(aggregate(rows, (g) => g.length, { idOf: (p) => p.id }).status).toBe('insufficient');
  });

  it('the threshold never goes below 5', () => {
    expect(effectiveThreshold(3)).toBe(5);
    expect(effectiveThreshold(8)).toBe(8);
    expect(aggregate(people(4), (g) => g.length, { threshold: 2 }).status).toBe('insufficient');
    expect(aggregate(people(7), (g) => g.length, { threshold: 8 }).status).toBe('insufficient');
  });
});

describe('breakdown: complementary suppression', () => {
  it('hides a small part and the smallest visible part, so the total cannot reveal it', () => {
    const result = breakdown([
      { key: 'operaciones', people: 30, value: 0.6 },
      { key: 'administracion', people: 12, value: 0.7 },
      { key: 'tecnologia', people: 9, value: 0.8 },
      { key: 'comercial', people: 3, value: 0.5 },
    ]);
    const status = Object.fromEntries(result.map((r) => [r.key, r.result.status]));
    expect(status).toEqual({
      operaciones: 'ok',
      administracion: 'ok',
      tecnologia: 'insufficient',
      comercial: 'insufficient',
    });
  });

  it('shows everything when every part reaches the threshold', () => {
    const result = breakdown([
      { key: 'a', people: 5, value: 1 },
      { key: 'b', people: 6, value: 2 },
    ]);
    expect(result.every((r) => r.result.status === 'ok')).toBe(true);
  });

  it('two small parts that add up to the threshold do not need a third one hidden', () => {
    const result = breakdown([
      { key: 'a', people: 20, value: 1 },
      { key: 'b', people: 3, value: 2 },
      { key: 'c', people: 2, value: 3 },
    ]);
    expect(result.map((r) => r.result.status)).toEqual(['ok', 'insufficient', 'insufficient']);
  });
});

describe('helpers', () => {
  it('average and share', () => {
    expect(average([])).toBeNull();
    expect(average([1, 2, 3])).toBe(2);
    expect(share([1, 2, 3, 4], (n) => n > 2)).toBe(0.5);
    expect(share([], () => true)).toBeNull();
  });
});
