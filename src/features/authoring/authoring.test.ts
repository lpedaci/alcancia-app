import { describe, expect, it } from 'vitest';
import { isCorrect } from '@/features/learning/questions';
import { type BlockDraft, blockErrors, cardErrors, emptyBlock, emptyQuestion, lessonErrors, toBlocks, toDrafts, toQuestion } from './authoring';

/** F14 (D-317): the builder only publishes complete lessons, and what it builds are valid questions of 5.1. */
describe('lesson builder rules', () => {
  const single = { ...emptyQuestion(), prompt: '¿Qué dato compara el costo total?', options: [{ id: 'a', text: 'El CFT', correct: true }, { id: 'b', text: 'La TNA', correct: false }], correctFeedback: 'Bien.', incorrectFeedback: 'Mira el CFT.' };

  it('a single choice needs one right option, a multiple at least one', () => {
    expect(blockErrors({ key: 'k', kind: 'practice', question: single })).toEqual([]);
    expect(blockErrors({ key: 'k', kind: 'practice', question: { ...single, options: single.options.map((o) => ({ ...o, correct: true })) } })).toContain('correct');
    expect(blockErrors({ key: 'k', kind: 'practice', question: { ...single, kind: 'multiple', options: single.options.map((o) => ({ ...o, correct: true })) } })).toEqual([]);
  });

  it('builds questions that the player of 5.1 grades right', () => {
    expect(isCorrect(toQuestion(single, 'q1', 'module-06'), 'a')).toBe(true);
    expect(isCorrect(toQuestion(single, 'q1', 'module-06'), 'b')).toBe(false);
    const numeric = toQuestion({ ...single, kind: 'numeric', answer: '1.000,50', tolerance: '1' }, 'q2', 'module-01');
    expect(numeric.type === 'numeric' && numeric.numeric.answer).toBe('1000.5');
    expect(isCorrect(numeric, '1001')).toBe(true);
    const tf = toQuestion(
      { ...single, kind: 'true_false_why', statementTrue: false, whyPrompt: '¿Por qué?', whyOptions: [{ id: 'a', text: 'Porque sí', correct: false }, { id: 'b', text: 'Por el costo', correct: true }] },
      'q3',
      'module-08',
    );
    expect(isCorrect(tf, { value: 'false', why: 'b' })).toBe(true);
    expect(isCorrect(tf, { value: 'true', why: 'b' })).toBe(false);
  });

  it('a lesson needs a title, a module, a cohort and two complete blocks', () => {
    const blocks: BlockDraft[] = [{ ...(emptyBlock('objective') as BlockDraft & { kind: 'objective' }), body: 'Al terminar vas a poder comparar dos ofertas.' }, { key: 'p', kind: 'practice', question: single }];
    expect(lessonErrors({ title: 'Comparar cuotas', moduleId: 'module-08', cohortIds: ['cohort-operations'], blocks })).toEqual([]);
    expect(lessonErrors({ title: ' ', moduleId: '', cohortIds: [], blocks: [blocks[0]!] })).toEqual(['title', 'module', 'cohorts', 'blocks']);
    expect(lessonErrors({ title: 'X', moduleId: 'm', cohortIds: ['c'], blocks: [...blocks, emptyBlock('text')] })).toEqual(['incomplete']);
  });

  it('a saved lesson goes back to the editor with the same content', () => {
    const drafts: BlockDraft[] = [
      { key: 'a', kind: 'text', title: 'Dos ofertas', body: 'Compara el total.' },
      { key: 'b', kind: 'example', title: 'Cuenta', steps: ['12 × 10.000', '= 120.000'] },
      { key: 'c', kind: 'tool', simId: 'SIM-6', body: 'Prueba con tu precio.' },
      { key: 'd', kind: 'practice', question: single },
    ];
    const blocks = toBlocks(drafts, 'lesson-1', 'module-08');
    const back = toDrafts({ id: 'lesson-1', orgId: 'o', authorId: 'p', title: 'T', moduleId: 'module-08', minutes: 5, blocks, cohortIds: ['c'], status: 'draft', updatedAt: '2026-11-16' });
    expect(toBlocks(back, 'lesson-1', 'module-08')).toEqual(blocks);
  });

  it('a card needs its trigger, text, guide part and cohorts; its question, a right option and feedback', () => {
    const card = { trigger: 'salary_received', title: 'Separa primero', body: 'Apenas cobras.', guide: { guideId: 'module-03-guide-1', part: 2 }, cohortIds: ['c'] };
    expect(cardErrors(card)).toEqual([]);
    expect(cardErrors({ ...card, trigger: '', cohortIds: [] })).toEqual(['trigger', 'cohorts']);
    expect(cardErrors({ ...card, question: { prompt: '¿Cuándo?', options: [{ id: 'a', text: 'Al cobrar' }, { id: 'b', text: 'A fin de mes' }], correct: 'c', feedback: { correct: 'Sí', incorrect: 'No' } } })).toEqual(['question']);
  });

  it('builds the five complex types of 5.1 so the player grades them right, and back to the editor (D-318)', () => {
    const base = { ...emptyQuestion(), prompt: 'Pregunta', correctFeedback: 'Bien.', incorrectFeedback: 'Mira otra vez.' };
    const ordering = { ...base, kind: 'ordering' as const, items: [{ id: 'i1', text: 'Sumar los gastos' }, { id: 'i2', text: 'Restar al ingreso' }, { id: 'i3', text: 'Separar el ahorro' }] };
    const matching = { ...base, kind: 'matching' as const, pairs: [{ id: 'p1', left: 'TNA', right: 'Tasa nominal anual' }, { id: 'p2', left: 'CFT', right: 'Costo financiero total' }, { id: 'p3', left: 'CVU', right: 'Clave virtual uniforme' }] };
    const categorize = {
      ...base,
      kind: 'categorize' as const,
      categories: [{ id: 'c1', label: 'Necesidad' }, { id: 'c2', label: 'Deseo' }],
      catItems: [{ id: 'k1', text: 'Alquiler', categoryId: 'c1' }, { id: 'k2', text: 'Luz', categoryId: 'c1' }, { id: 'k3', text: 'Salida', categoryId: 'c2' }, { id: 'k4', text: 'Streaming', categoryId: 'c2' }],
    };
    const branching = {
      ...base,
      kind: 'branching' as const,
      steps: [
        { id: 's1', text: 'Te ofrecen un préstamo.', good: 'Miro el CFT', bad: 'Acepto ya', badFeedback: 'Sin el CFT no sabes cuánto pagas.' },
        { id: 's2', text: 'El CFT es alto.', good: 'Lo rechazo', bad: 'Lo tomo igual', badFeedback: 'Pagarías casi el doble.' },
      ],
      goodOutcome: 'Decidiste con el costo total a la vista.',
    };
    const sim = { ...base, kind: 'simulator_task' as const, simId: 'SIM-7', answer: '12', tolerance: '1', unit: 'months' as const };
    for (const d of [ordering, matching, categorize, branching, sim]) expect(blockErrors({ key: 'k', kind: 'practice', question: d }), d.kind).toEqual([]);

    expect(isCorrect(toQuestion(ordering, 'q', 'm'), ['i1', 'i2', 'i3'])).toBe(true);
    expect(isCorrect(toQuestion(ordering, 'q', 'm'), ['i2', 'i1', 'i3'])).toBe(false);
    const m = toQuestion(matching, 'q', 'm');
    expect(isCorrect(m, { 'p1-l': 'p1-r', 'p2-l': 'p2-r', 'p3-l': 'p3-r' })).toBe(true);
    expect(m.type === 'matching' && m.matching.right.map((r) => r.text)).toEqual(['Clave virtual uniforme', 'Costo financiero total', 'Tasa nominal anual']);
    expect(isCorrect(toQuestion(categorize, 'q', 'm'), { k1: 'c1', k2: 'c1', k3: 'c2', k4: 'c2' })).toBe(true);
    const b = toQuestion(branching, 'q', 'm');
    expect(isCorrect(b, ['s1-good', 's2-good'])).toBe(true);
    expect(isCorrect(b, ['s1-good', 's2-bad'])).toBe(false);
    expect(isCorrect(toQuestion(sim, 'q', 'm'), '12')).toBe(true);

    // Back to the editor and again to the same question
    const drafts: BlockDraft[] = [ordering, matching, categorize, branching, sim].map((q, i) => ({ key: `${i}`, kind: 'practice', question: q }));
    const blocks = toBlocks(drafts, 'l', 'm');
    const lesson = { id: 'l', orgId: 'o', authorId: 'p', title: 'T', moduleId: 'm', minutes: 5, blocks, cohortIds: ['c'], status: 'draft' as const, updatedAt: '2026-11-16' };
    expect(toBlocks(toDrafts(lesson), 'l', 'm')).toEqual(blocks);
  });

  it('points out what is missing in the complex types', () => {
    const q = emptyQuestion();
    expect(blockErrors({ key: 'k', kind: 'practice', question: { ...q, kind: 'ordering', prompt: 'P' } })).toContain('items');
    expect(blockErrors({ key: 'k', kind: 'practice', question: { ...q, kind: 'matching', prompt: 'P' } })).toContain('pairs');
    expect(blockErrors({ key: 'k', kind: 'practice', question: { ...q, kind: 'categorize', prompt: 'P' } })).toEqual(expect.arrayContaining(['categories', 'catItems']));
    expect(blockErrors({ key: 'k', kind: 'practice', question: { ...q, kind: 'branching', prompt: 'P' } })).toEqual(['steps', 'goodOutcome']);
  });
});
