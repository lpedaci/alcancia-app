import { describe, expect, it } from 'vitest';
import levels from '@/data/levels.json';
import {
  type Answer,
  BANK,
  CHALLENGES,
  drawChallenge,
  feedbackFor,
  GUIDES,
  isAnswered,
  isCorrect,
  type LearningQuestion,
  scoreAttempt,
  seeded,
  startingOrder,
} from './questions';

const byId = (id: string) => BANK.find((q) => q.id === id)!;

/** The right answer of any question, built from its own data. */
function rightAnswer(q: LearningQuestion): Answer {
  switch (q.type) {
    case 'single':
      return q.correctOptionIds[0]!;
    case 'multiple':
      return q.correctOptionIds;
    case 'true_false_why':
      return { value: q.correctOptionIds[0]!, why: q.why.correct };
    case 'numeric':
      return q.numeric.answer.replace('.', ',');
    case 'ordering':
      return q.ordering.correctOrder;
    case 'matching':
      return Object.fromEntries(q.matching.pairs);
    case 'categorize':
      return Object.fromEntries(q.categorize.items.map((i) => [i.id, i.categoryId]));
  }
}

describe('content of levels 1 to 6 (D-61)', () => {
  it('has one guide for each phase A module of levels 1 to 6, with the Gagné sequence', () => {
    const modules = levels.filter((l) => ['level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6'].includes(l.id)).flatMap((l) => l.guideModuleIds);
    expect(GUIDES.map((g) => g.moduleId).sort()).toEqual([...modules].sort());
    for (const guide of GUIDES) {
      const types = guide.blocks.map((b) => b.type);
      expect(types[0]).toBe('hook');
      expect(types).toContain('objective');
      expect(types).toContain('recall');
      expect(types).toContain('example');
      expect(types).toContain('practice');
      expect(types.at(-1)).toBe('takeaway');
    }
  });

  it('every bank question is right with its own answer and explains both outcomes', () => {
    for (const q of BANK) {
      expect(isCorrect(q, rightAnswer(q)), q.id).toBe(true);
      expect(feedbackFor(q, rightAnswer(q)), q.id).toBeTruthy();
      if (q.type !== 'single') expect(q.feedback.incorrect, q.id).toBeTruthy();
      else for (const o of q.options) expect(q.feedback[o.id], `${q.id}/${o.id}`).toBeTruthy();
    }
  });

  it('each challenge draws from banks with enough questions', () => {
    for (const c of CHALLENGES) {
      for (const [moduleId, count] of Object.entries(c.questionsPerModule)) {
        expect(BANK.filter((q) => q.moduleId === moduleId).length, `${c.id}/${moduleId}`).toBeGreaterThanOrEqual(count);
      }
    }
  });
});

describe('answers by type (5.1)', () => {
  it('numeric: accepts the Argentine format and a tolerance of $ 1 (hand calculation)', () => {
    const q = byId('m01-net');
    expect(isCorrect(q, '1.284.958,86')).toBe(true);
    expect(isCorrect(q, '1284959')).toBe(true);
    expect(isCorrect(q, '1.284.960,00')).toBe(false);
    expect(feedbackFor(q, '1.000.000')).toContain('274.304,46');
  });

  it('multiple: needs exactly the right set', () => {
    const q = byId('m04-what');
    expect(isCorrect(q, ['a', 'b'])).toBe(true);
    expect(isCorrect(q, ['a'])).toBe(false);
    expect(isCorrect(q, ['a', 'b', 'c'])).toBe(false);
  });

  it('true or false needs the right reason too', () => {
    const q = byId('m03-ant');
    expect(isCorrect(q, { value: 'false', why: 'w1' })).toBe(true);
    expect(isCorrect(q, { value: 'false', why: 'w2' })).toBe(false);
    expect(isAnswered(q, { value: 'false' })).toBe(false);
  });

  it('single choice explains each option', () => {
    const q = byId('m17-guarantee');
    expect(feedbackFor(q, 'a')).toContain('No');
    expect(feedbackFor(q, 'b')).toMatch(/^Correcto/);
  });

  it('ordering never starts solved', () => {
    const q = byId('m04-order') as Extract<LearningQuestion, { type: 'ordering' }>;
    for (let seed = 1; seed < 20; seed += 1) expect(startingOrder(q, seeded(seed)).join()).not.toBe(q.ordering.correctOrder.join());
  });
});

describe('challenges (D-57)', () => {
  const level1 = CHALLENGES.find((c) => c.id === 'challenge-level-1')!;

  it('draws 3 questions from each module of the level, the same with the same seed', () => {
    const drawn = drawChallenge(level1, seeded(7));
    expect(drawn).toHaveLength(6);
    expect(drawn.filter((q) => q.moduleId === 'module-01')).toHaveLength(3);
    expect(drawn.filter((q) => q.moduleId === 'module-02')).toHaveLength(3);
    expect(drawChallenge(level1, seeded(7)).map((q) => q.id)).toEqual(drawn.map((q) => q.id));
  });

  it('scores the attempt in total and per module', () => {
    const drawn = drawChallenge(level1, seeded(3));
    const answers: Record<string, Answer> = {};
    for (const q of drawn) answers[q.id] = q.moduleId === 'module-01' ? rightAnswer(q) : 'x';
    expect(scoreAttempt(drawn, answers)).toEqual({ score: 0.5, moduleScores: { 'module-01': 1, 'module-02': 0 }, right: 3, total: 6 });
  });

  it('has a level challenge for levels 1 to 6 and a mastery challenge for levels 2 to 6', () => {
    expect(CHALLENGES.filter((c) => !c.mastery).map((c) => c.levelId)).toEqual(['level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6']);
    expect(CHALLENGES.filter((c) => c.mastery).map((c) => c.levelId)).toEqual(['level-2', 'level-3', 'level-4', 'level-5', 'level-6']);
    for (const level of levels.filter((l) => ['level-2', 'level-3', 'level-4', 'level-5', 'level-6'].includes(l.id))) {
      expect(CHALLENGES.map((c) => c.id)).toContain(level.masteryChallengeId);
    }
  });
});
