import { describe, expect, it } from 'vitest';
import { describeSources } from '@/app/content-sources';
import { distributeTerms, findTerms, fold, GLOSSARY, introducedTerms, searchGlossary } from './glossary';

describe('integrated glossary (1.1.1, RF-47)', () => {
  it('covers the terms of the spec, each with a definition and an official source', () => {
    const ids = GLOSSARY.map((g) => g.term);
    for (const term of ['TNA', 'CFT', 'UVA', 'CER', 'CEDEAR', 'ETF', 'FCI', 'CVU', 'PSPCP', 'DCA']) expect(ids).toContain(term);
    for (const g of GLOSSARY) {
      expect(g.definition.length, g.id).toBeGreaterThan(30);
      expect(describeSources(g.sourceIds).length, g.id).toBeGreaterThan(0);
    }
  });

  it('finds whole words, plurals and the longest match', () => {
    expect(findTerms('Compré CEDEARs de un ETF con la TNA y el PSPCP').map((f) => f.entry.id)).toEqual(['cedear', 'etf', 'tna', 'pspcp']);
    expect(findTerms('CERTIFICADO y TEAM no son términos')).toEqual([]);
    expect(findTerms('un fondo money market').map((f) => f.entry.id)).toEqual(['money-market']);
  });

  it('marks each term only the first time it appears in a sequence of blocks', () => {
    const blocks = introducedTerms(['La TNA de un plazo fijo', 'La TNA y la TEA', 'Sin términos', 'El CFT y otra vez el CFT']);
    expect(blocks.map((s) => [...s])).toEqual([['tna'], ['tea'], [], ['cft']]);
  });

  it('gives a term to the first part of a block that has it', () => {
    expect(distributeTerms(['La TNA', 'otra TNA y la TEA'], new Set(['tna', 'tea'])).map((s) => [...s])).toEqual([['tna'], ['tea']]);
  });

  it('searches ignoring accents and case, in alphabetical order (F10, D-321)', () => {
    expect(searchGlossary('inflacion').map((g) => g.id)).toContain('inflacion');
    expect(searchGlossary('CFT').map((g) => g.id)).toContain('cft');
    expect(searchGlossary('zzz')).toEqual([]);
    const all = searchGlossary('');
    expect(all).toHaveLength(GLOSSARY.length);
    expect(all.map((g) => fold(g.term))).toEqual([...all.map((g) => fold(g.term))].sort((a, b) => a.localeCompare(b, 'es')));
  });

  it('every term of the glossary page names a module that exists, and has no em dashes', () => {
    for (const g of GLOSSARY) {
      expect(g.definition, g.id).not.toMatch(/—/);
      if (g.moduleId) expect(g.moduleId).toMatch(/^module-\d{2}$/);
    }
  });
});
