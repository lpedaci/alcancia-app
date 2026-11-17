import { describe, expect, it } from 'vitest';
import en from './en.json';
import es from './es.json';

/** D-322: every English text has its Spanish key and the same {{placeholders}}, so nothing breaks at runtime. */
function flat(o: unknown, p = ''): Record<string, string> {
  if (Array.isArray(o)) return Object.assign({}, ...o.map((v, i) => flat(v, `${p}[${i}]`)));
  if (o && typeof o === 'object') return Object.assign({}, ...Object.entries(o).map(([k, v]) => flat(v, p ? `${p}.${k}` : k)));
  return { [p]: String(o) };
}
const placeholders = (text: string) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort();

describe('English texts', () => {
  const fe = flat(es);
  const fn = flat(en);

  it('every English key exists in Spanish', () => {
    expect(Object.keys(fn).filter((k) => !(k in fe) && !k.startsWith('landing.') && !k.startsWith('sim3.'))).toEqual([]);
  });

  it('keeps the same placeholders as the Spanish text', () => {
    const wrong = Object.keys(fn).filter((k) => k in fe && placeholders(fn[k]!).join() !== placeholders(fe[k]!).join());
    expect(wrong).toEqual([]);
  });

  it('has no em dashes nor Spanish punctuation left', () => {
    expect(Object.entries(fn).filter(([, v]) => /—|¿|¡/.test(v)).map(([k]) => k)).toEqual([]);
  });

  // F17 (step 35): the whole interface is in English, so a new Spanish text must come with its translation.
  it('translates every Spanish interface text', () => {
    expect(Object.keys(fe).filter((k) => !(k in fn))).toEqual([]);
  });

  // The design system patterns are arrays: an English list out of order would pair a decision with another's text.
  it('keeps the design system patterns in the same order, with the same decision numbers', () => {
    expect(en.designSystem.patterns.map((p) => p[0])).toEqual(es.designSystem.patterns.map((p) => p[0]));
  });

  // Money fields read the Argentine format (150.000 and 2,5), so the English examples keep it too.
  it('writes amount examples in the format the money fields accept', () => {
    const usFormat = /(example: |\$\s?)\d{1,3},\d{3}\b/i;
    expect(Object.entries(fn).filter(([, v]) => usFormat.test(v)).map(([k]) => k)).toEqual([]);
  });
});
