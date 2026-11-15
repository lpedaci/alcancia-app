import { describe, expect, it } from 'vitest';
import { type Answer, type Guide, isCorrect, type LearningQuestion } from '@/features/learning/questions';
import banks from './question-banks.json';
import drafts from './guides-drafts.json';
import guides from './guides.json';

/**
 * Step 27 (D-61, D-276): drafts of guides 2 and 3, waiting for Lourdes's review. They follow the
 * same Gagné sequence and question types as the published guides, but the app does not read them.
 */
type Draft = Guide & { review: { status: 'draft' | 'approved'; batch: number; validated: string[]; extensions: string[] } };
const list = drafts.guides as unknown as Draft[];

const rightAnswer = (q: LearningQuestion): Answer | undefined => {
  switch (q.type) {
    case 'single':
      return q.correctOptionIds[0];
    case 'true_false_why':
      return { value: q.correctOptionIds[0]!, why: q.why.correct };
    case 'numeric':
      return q.numeric.answer.replace('.', ',');
    case 'categorize':
      return Object.fromEntries(q.categorize.items.map((i) => [i.id, i.categoryId]));
    default:
      return undefined;
  }
};

describe('guide drafts (step 27)', () => {
  it('follow the Gagné sequence: hook, objective, recall, content, example, practice and "Para tu vida"', () => {
    for (const g of list) {
      const types = g.blocks.map((b) => b.type);
      expect(types.slice(0, 3), g.id).toEqual(['hook', 'objective', 'recall']);
      expect(types).toContain('text');
      expect(types).toContain('example');
      expect(types).toContain('practice');
      expect(types.at(-1)).toBe('takeaway');
      expect(g.minutes).toBeGreaterThanOrEqual(5);
      expect(g.minutes).toBeLessThanOrEqual(8);
      expect(g.id).toMatch(new RegExp(`^${g.moduleId}-guide-[23]$`));
    }
  });

  it('every practice question accepts its right answer and has explained feedback', () => {
    for (const g of list) {
      for (const b of g.blocks) {
        if (b.type !== 'practice') continue;
        const answer = rightAnswer(b.question);
        expect(answer, b.question.id).toBeDefined();
        expect(isCorrect(b.question, answer), b.question.id).toBe(true);
        expect(Object.values(b.question.feedback as Record<string, string>).every((f) => f.length > 20)).toBe(true);
      }
    }
  });

  it('ids never collide with the published guides or the banks', () => {
    const published = new Set([...guides.guides.map((g) => g.id), ...banks.questions.map((q) => q.id)]);
    const mine = list.flatMap((g) => [g.id, ...g.blocks.flatMap((b) => ('question' in b ? [b.question.id] : []))]);
    expect(new Set(mine).size).toBe(mine.length);
    for (const id of mine) expect(published.has(id), id).toBe(false);
  });

  it('are drafts until Lourdes approves them, with the extensions listed for Lic. Giampieri', () => {
    for (const g of list) {
      expect(g.review.status).toBe('draft');
      expect(g.review.validated.length + g.review.extensions.length).toBeGreaterThan(0);
      expect(g.sourceIds.every((s) => /^(T|LCT|A-\d{2}|B-\d{2}|F-\d{2})$/.test(s))).toBe(true);
    }
  });

  it('keep the voice rules: tú, no exclamations and no em dashes', () => {
    const text = JSON.stringify(list);
    expect(text).not.toMatch(/—|¡|\b(vos|tenés|podés|sabés)\b/);
  });
});
