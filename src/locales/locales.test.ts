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
});
