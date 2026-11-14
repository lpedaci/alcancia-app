import { describe, expect, it } from 'vitest';
import linesJson from '@/data/fuerte-lines.json';
import { SIM_DEFS } from '@/features/simulators/defs';
import { fuerteLine, hasFuerteLine, setFuerteSeed } from './fuerte-lines';

/** RF-33, D-206: Fuerte's lines live in a JSON that L&D edits, and every line the app asks for exists. */
const sources = import.meta.glob<string>(['../../**/*.tsx', '!../../**/*.test.tsx'], { query: '?raw', import: 'default', eager: true });
const LINES = { ...linesJson.lines, ...linesJson.events } as Record<string, { state: string; variants: string[] }>;

describe("Fuerte's lines (5.0.1)", () => {
  it('every fixed key the app uses exists in fuerte-lines.json', () => {
    const keys = Object.values(sources).flatMap((code) => [...code.matchAll(/fuerteLine\((['"])([^'"]+)\1/g)].map((m) => m[2]!));
    expect(keys.length).toBeGreaterThan(30);
    for (const key of keys) expect(hasFuerteLine(key), key).toBe(true);
  });

  it('has a line for every tool and every risk level used in templates', () => {
    for (const def of SIM_DEFS) expect(hasFuerteLine(`sims.${def.id}.fuerte`), def.id).toBe(true);
    for (const risk of ['low', 'medium', 'high']) expect(hasFuerteLine(`invest.fuerte.${risk}`)).toBe(true);
    for (const slide of ['wallet', 'levels', 'privacy']) expect(hasFuerteLine(`welcome.intro.${slide}.fuerte`)).toBe(true);
  });

  it('keeps his voice: two sentences at most, no exclamation marks, no promises', () => {
    for (const [key, line] of Object.entries(LINES)) {
      expect(line.variants.length, key).toBeGreaterThan(0);
      // The welcome event is quoted word for word from the spec (5.0.1, "Voz"), so it keeps its length.
      if (key === 'welcome') continue;
      for (const v of line.variants) {
        // A greeting ("Hola, Mariana.") or his catchphrase "Guardado." does not count as a sentence, as in the spec's examples.
        const body = v.replace(/^(Hola[^.]*\.|Guardado\.)\s*/, '');
        expect(body.split(/(?<=[.?])\s+/).length, `${key}: ${v}`).toBeLessThanOrEqual(2);
        expect(v, key).not.toMatch(/!|vas a ganar|garantizad/i);
      }
    }
  });

  it('fills placeholders and picks a variant per session', () => {
    setFuerteSeed(0);
    expect(fuerteLine('welcome.fuerte.overview', { name: 'Mariana' })).toContain('Mariana');
    const seen = new Set<string>();
    for (let seed = 1; seed < 20; seed += 1) {
      setFuerteSeed(seed);
      seen.add(fuerteLine('learn.map.fuerte'));
    }
    expect(seen.size).toBe(2);
    setFuerteSeed(0);
  });
});
