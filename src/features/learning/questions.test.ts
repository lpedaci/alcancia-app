import { describe, expect, it } from 'vitest';
import fuerteLines from '@/data/fuerte-lines.json';
import levels from '@/data/levels.json';
import missions from '@/data/wallet-missions.json';
import es from '@/locales/es.json';
import { describeSources, isKnownSourceCode } from '@/app/content-sources';
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
import { compoundGrowth, minimumPaymentSchedule } from '@/lib/finance';
import { simById } from '@/features/simulators/defs';

const byId = (id: string) => BANK.find((q) => q.id === id)!;

/** The right answer of any question, built from its own data. */
function rightAnswer(q: LearningQuestion): Answer {
  switch (q.type) {
    case 'reflection':
      return q.options[0]!.id;
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
    case 'simulator_task':
      return q.simulatorTask.answer.replace('.', ',');
  }
}

describe('content of levels 1 to 7 (D-61)', () => {
  it('has one guide for each phase A module of levels 1 to 7, with the Gagné sequence', () => {
    const modules = levels.filter((l) => ['level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6', 'level-7'].includes(l.id)).flatMap((l) => l.guideModuleIds);
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

  it('every question with an amount, a rate or a percentage has a source (review of 13/11/2026)', () => {
    const all = [...BANK, ...GUIDES.flatMap((g) => g.blocks.flatMap((b) => (b.type === 'recall' || b.type === 'practice' ? [b.question] : [])))];
    for (const q of all) {
      const visible = JSON.stringify({ prompt: q.prompt, options: 'options' in q ? q.options : undefined, numeric: q.type === 'numeric' ? q.numeric : undefined });
      if (q.type !== 'reflection' && /\$|%|USD|TNA|TEA|CFT/.test(visible)) expect(q.sourceIds.length, q.id).toBeGreaterThan(0);
    }
  });

  it('no visible text names a tool by its internal code or mentions "el material"', () => {
    // Every text a person can read: interface, guides, banks, missions and Fuerte (keys and ids are not visible).
    const hidden = new Set(['id', 'toolId', 'simId', 'sourceIds', 'moduleId', 'levelId', 'toolSimIds', 'missionIds', 'guideModuleIds', 'challengeId', 'masteryChallengeId']);
    const texts: string[] = [];
    const walk = (value: unknown, key = ''): void => {
      if (hidden.has(key)) return;
      if (typeof value === 'string') texts.push(value);
      else if (Array.isArray(value)) value.forEach((v) => walk(v));
      else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, k);
    };
    [es, BANK, GUIDES, missions, fuerteLines].forEach((source) => walk(source));
    expect(texts.filter((text) => /SIM-\d/.test(text))).toEqual([]);
    expect(texts.filter((text) => /el material/i.test(text))).toEqual([]);
    // Source codes go in sourceIds and are shown by name in "Fuentes", never inside a text.
    expect(texts.filter((text) => /(^|[^A-Za-z])[ABF]-[0-9]{2}/.test(text))).toEqual([]);
  });

  it('"Antes de empezar" about personal experience is a reflection: no right answer, and never in a bank or a challenge', () => {
    const recalls = GUIDES.flatMap((g) => g.blocks.filter((b) => b.type === 'recall').map((b) => (b as { question: LearningQuestion }).question));
    expect(recalls.filter((q) => q.type === 'reflection').length).toBeGreaterThanOrEqual(12);
    for (const q of recalls.filter((r) => r.type === 'reflection')) {
      expect('correctOptionIds' in q, q.id).toBe(false);
      for (const o of 'options' in q ? q.options : []) expect(isCorrect(q, o.id)).toBe(true);
    }
    expect(BANK.some((q) => q.type === 'reflection')).toBe(false);
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

  it('has a level challenge for levels 1 to 7 and a mastery challenge for levels 2 to 7', () => {
    expect(CHALLENGES.filter((c) => !c.mastery).map((c) => c.levelId)).toEqual(['level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6', 'level-7']);
    expect(CHALLENGES.filter((c) => c.mastery).map((c) => c.levelId)).toEqual(['level-2', 'level-3', 'level-4', 'level-5', 'level-6', 'level-7']);
    for (const level of levels.filter((l) => ['level-2', 'level-3', 'level-4', 'level-5', 'level-6', 'level-7'].includes(l.id))) {
      expect(CHALLENGES.map((c) => c.id)).toContain(level.masteryChallengeId);
    }
  });
});

describe('sources shown with full names (review of 13/11/2026)', () => {
  it('every source code in guides, banks and missions is known, and shows its full name', () => {
    const codes = new Set<string>();
    const walk = (value: unknown, key = ''): void => {
      if (key === 'sourceIds' && Array.isArray(value)) value.forEach((c) => codes.add(String(c)));
      else if (Array.isArray(value)) value.forEach((v) => walk(v));
      else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, k);
    };
    [BANK, GUIDES, missions].forEach((source) => walk(source));
    expect([...codes].filter((c) => !isKnownSourceCode(c))).toEqual([]);
    const shown = describeSources(['T', 'A-23', 'A-14', 'B-04', 'B-02', 'F-14']);
    expect(shown.map((s) => s.kind)).toEqual(['workshop', 'presentation', 'official', 'official', 'formula']);
    expect(shown[0]).toMatchObject({ name: 'Taller "Del aula al primer trabajo", de Lourdes Pedaci', url: 'https://lpedaci.github.io/taller-primerempleo/' });
    expect(shown[1]!.name).toContain('Lic. Kevin Giampieri (diapositivas 14, 23)');
    expect(shown[2]).toMatchObject({ verifiedAt: '2026-11-12' });
    expect(shown[3]).toMatchObject({ verifiedAt: '2026-11-11' });
  });
});

describe('exercises with a simulator (5.1, RF-43, D-205)', () => {
  const tasks = BANK.filter((q): q is Extract<LearningQuestion, { type: 'simulator_task' }> => q.type === 'simulator_task');

  it('exist, with a simulator that exists and a preset for its fields', () => {
    expect(tasks.length).toBeGreaterThanOrEqual(2);
    for (const q of tasks) {
      const def = simById(q.simulatorTask.simId);
      expect(def, q.id).toBeDefined();
      for (const key of Object.keys(q.simulatorTask.preset)) expect(def!.fields.map((f) => f.id), q.id).toContain(key);
    }
  });

  it('expect exactly what the simulator computes with the preset (hand-checked cases F-15 and F-19)', () => {
    const card = tasks.find((q) => q.simulatorTask.simId === 'SIM-7')!;
    const p = card.simulatorTask.preset;
    const months = minimumPaymentSchedule({ balance: p.balance!, tna: String(Number(p.tna) / 100), minimumRate: String(Number(p.minimum) / 100) }).months;
    expect(String(months)).toBe(card.simulatorTask.answer);

    const compound = tasks.find((q) => q.simulatorTask.simId === 'SIM-10')!;
    const c = compound.simulatorTask.preset;
    const final = compoundGrowth({ initial: c.initial!, monthly: c.monthly!, annualRate: String(Number(c.rate) / 100), years: Number(c.years) }).final;
    expect(final.toFixed(2)).toBe(compound.simulatorTask.answer);
  });
});
