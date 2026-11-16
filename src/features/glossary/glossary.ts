import glossaryJson from '@/data/glossary.json';

/** Integrated glossary (CLAUDE.md 1.1.1, RF-47, D-204). */
export interface GlossaryEntry {
  id: string;
  term: string;
  match: string[];
  name: string;
  definition: string;
  sourceIds: string[];
  /** F10 (D-321): the module where it is studied, for the glossary page. */
  moduleId?: string;
}

export const GLOSSARY = glossaryJson.terms as GlossaryEntry[];

const byMatch = new Map(GLOSSARY.flatMap((g) => g.match.map((m) => [m, g] as const)));
// Longest first, so "PSPCP" wins over "PSP"; an optional plural "s" ("CEDEARs", "ETFs").
const alternatives = [...byMatch.keys()].sort((a, b) => b.length - a.length).map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
/** F10 (D-321): accent and case insensitive, for the search of the glossary page. */
export const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** The terms whose name, short form or definition contain the query, in alphabetical order. */
export function searchGlossary(query: string, entries: GlossaryEntry[] = GLOSSARY): GlossaryEntry[] {
  const q = fold(query.trim());
  const sorted = [...entries].sort((a, b) => fold(a.term).localeCompare(fold(b.term), 'es'));
  if (!q) return sorted;
  return sorted.filter((g) => fold(`${g.term} ${g.name} ${g.definition}`).includes(q));
}

const PATTERN = new RegExp(`(?<![\\p{L}\\p{N}])(${alternatives.join('|')})s?(?![\\p{L}\\p{N}])`, 'gu');

export const glossaryById = (id: string) => GLOSSARY.find((g) => g.id === id);

/** Every glossary term in a text, in order, with where it is. */
export function findTerms(text: string): { entry: GlossaryEntry; index: number; length: number }[] {
  return [...text.matchAll(PATTERN)].flatMap((m) => {
    const entry = byMatch.get(m[1] ?? '');
    return entry && m.index !== undefined ? [{ entry, index: m.index, length: m[0].length }] : [];
  });
}

/**
 * Which terms each block introduces: a term gets its chip the first time it appears in the
 * sequence (a guide's blocks, in order), never again after that (1.1.1).
 */
export function introducedTerms(blocks: string[]): Set<string>[] {
  const seen = new Set<string>();
  return blocks.map((text) => {
    const here = new Set<string>();
    for (const { entry } of findTerms(text)) {
      if (!seen.has(entry.id)) {
        seen.add(entry.id);
        here.add(entry.id);
      }
    }
    return here;
  });
}

/** Splits a block's new terms among its parts (paragraph pieces, example steps): each goes to the first part that has it. */
export function distributeTerms(parts: string[], terms: Set<string> | undefined): Set<string>[] {
  const remaining = new Set(terms ?? []);
  return parts.map((part) => {
    const here = new Set(findTerms(part).map((f) => f.entry.id).filter((id) => remaining.has(id)));
    for (const id of here) remaining.delete(id);
    return here;
  });
}
