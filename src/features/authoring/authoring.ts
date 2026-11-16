import { parseDecimalInput } from '@/lib/money';
import type { GuideBlock, LearningQuestion } from '@/features/learning/questions';
import type { CustomCard, CustomLesson } from '@/types/domain';

/**
 * Pure rules of the lesson and card builder (F14, D-317): the blocks a tutor or L&D can add, the
 * question types of this batch (single choice, multiple choice, true or false with why, numeric), how
 * a form becomes a question of 5.1, and what must be filled before publishing. Tested in
 * `authoring.test.ts`.
 */
export type BlockKind = 'objective' | 'text' | 'example' | 'practice' | 'tool' | 'takeaway';
export const BLOCK_KINDS: BlockKind[] = ['objective', 'text', 'example', 'practice', 'tool', 'takeaway'];
export type QuestionKind = 'single' | 'multiple' | 'true_false_why' | 'numeric';
export const QUESTION_KINDS: QuestionKind[] = ['single', 'multiple', 'true_false_why', 'numeric'];

/** The editable form of a question, before it becomes a LearningQuestion. */
export interface QuestionDraft {
  kind: QuestionKind;
  prompt: string;
  /** single and multiple: the options and which are right. */
  options: { id: string; text: string; correct: boolean }[];
  /** true_false_why: whether the statement is true, and the why. */
  statementTrue: boolean;
  whyPrompt: string;
  whyOptions: { id: string; text: string; correct: boolean }[];
  /** numeric: the answer, its tolerance and unit. */
  answer: string;
  tolerance: string;
  unit: 'ARS' | 'percent' | 'months';
  correctFeedback: string;
  incorrectFeedback: string;
}

export type BlockDraft =
  | { key: string; kind: 'objective' | 'takeaway'; body: string }
  | { key: string; kind: 'text'; title: string; body: string }
  | { key: string; kind: 'example'; title: string; steps: string[] }
  | { key: string; kind: 'tool'; simId: string; body: string }
  | { key: string; kind: 'practice'; question: QuestionDraft };

let counter = 0;
export const newKey = (prefix = 'b') => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function emptyQuestion(): QuestionDraft {
  return {
    kind: 'single',
    prompt: '',
    options: [
      { id: 'a', text: '', correct: true },
      { id: 'b', text: '', correct: false },
    ],
    statementTrue: true,
    whyPrompt: '',
    whyOptions: [
      { id: 'a', text: '', correct: true },
      { id: 'b', text: '', correct: false },
    ],
    answer: '',
    tolerance: '1',
    unit: 'ARS',
    correctFeedback: '',
    incorrectFeedback: '',
  };
}

export function emptyBlock(kind: BlockKind): BlockDraft {
  const key = newKey();
  switch (kind) {
    case 'objective':
    case 'takeaway':
      return { key, kind, body: '' };
    case 'text':
      return { key, kind, title: '', body: '' };
    case 'example':
      return { key, kind, title: '', steps: ['', ''] };
    case 'tool':
      return { key, kind, simId: 'SIM-1', body: '' };
    case 'practice':
      return { key, kind, question: emptyQuestion() };
  }
}

const filled = (text: string) => text.trim().length > 0;

/** What is missing in a question, as keys of the locale (empty when it is complete). */
export function questionErrors(q: QuestionDraft): string[] {
  const errors: string[] = [];
  if (!filled(q.prompt)) errors.push('prompt');
  if (q.kind === 'single' || q.kind === 'multiple') {
    if (q.options.filter((o) => filled(o.text)).length < 2) errors.push('options');
    const right = q.options.filter((o) => o.correct && filled(o.text)).length;
    if (q.kind === 'single' ? right !== 1 : right < 1) errors.push('correct');
  }
  if (q.kind === 'true_false_why') {
    if (!filled(q.whyPrompt) || q.whyOptions.filter((o) => filled(o.text)).length < 2) errors.push('why');
    if (q.whyOptions.filter((o) => o.correct && filled(o.text)).length !== 1) errors.push('correct');
  }
  if (q.kind === 'numeric') {
    if (parseDecimalInput(q.answer) === null) errors.push('answer');
    if (parseDecimalInput(q.tolerance) === null) errors.push('tolerance');
  }
  if (!filled(q.correctFeedback) || !filled(q.incorrectFeedback)) errors.push('feedback');
  return errors;
}

/** What is missing in a block (empty when it is complete). */
export function blockErrors(b: BlockDraft): string[] {
  switch (b.kind) {
    case 'objective':
    case 'takeaway':
      return filled(b.body) ? [] : ['body'];
    case 'text':
      return [...(filled(b.title) ? [] : ['title']), ...(filled(b.body) ? [] : ['body'])];
    case 'example':
      return [...(filled(b.title) ? [] : ['title']), ...(b.steps.filter(filled).length >= 2 ? [] : ['steps'])];
    case 'tool':
      return filled(b.body) ? [] : ['body'];
    case 'practice':
      return questionErrors(b.question);
  }
}

/** A lesson can be published with a title, a module, one cohort or more, and at least two complete blocks. */
export function lessonErrors(l: { title: string; moduleId: string; cohortIds: string[]; blocks: BlockDraft[] }): string[] {
  const errors: string[] = [];
  if (!filled(l.title)) errors.push('title');
  if (!l.moduleId) errors.push('module');
  if (l.cohortIds.length === 0) errors.push('cohorts');
  if (l.blocks.length < 2) errors.push('blocks');
  if (l.blocks.some((b) => blockErrors(b).length > 0)) errors.push('incomplete');
  return errors;
}

const clean = (options: { id: string; text: string; correct: boolean }[]) => options.filter((o) => filled(o.text)).map((o) => ({ id: o.id, text: o.text.trim(), correct: o.correct }));

/** The question of 5.1 that a draft becomes. */
export function toQuestion(q: QuestionDraft, id: string, moduleId: string): LearningQuestion {
  const base = { id, moduleId, prompt: q.prompt.trim(), sourceIds: [], feedback: { correct: q.correctFeedback.trim(), incorrect: q.incorrectFeedback.trim() } };
  switch (q.kind) {
    case 'single':
    case 'multiple': {
      const options = clean(q.options);
      return { ...base, type: q.kind, options: options.map(({ id: oid, text }) => ({ id: oid, text })), correctOptionIds: options.filter((o) => o.correct).map((o) => o.id) };
    }
    case 'true_false_why': {
      const why = clean(q.whyOptions);
      return {
        ...base,
        type: 'true_false_why',
        options: [
          { id: 'true', text: 'Verdadero' },
          { id: 'false', text: 'Falso' },
        ],
        correctOptionIds: [q.statementTrue ? 'true' : 'false'],
        why: { prompt: q.whyPrompt.trim(), options: why.map(({ id: oid, text }) => ({ id: oid, text })), correct: why.find((o) => o.correct)?.id ?? '' },
      };
    }
    case 'numeric':
      return {
        ...base,
        type: 'numeric',
        numeric: { answer: parseDecimalInput(q.answer)?.toString() ?? '0', tolerance: parseDecimalInput(q.tolerance)?.toString() ?? '0', unit: q.unit },
        help: q.unit === 'percent' ? 'Porcentaje, por ejemplo: 12,5' : q.unit === 'months' ? 'Cantidad de meses, por ejemplo: 6' : 'Monto en pesos, por ejemplo: 150.000',
      };
  }
}

/** The guide blocks of a lesson, in order. */
export function toBlocks(blocks: BlockDraft[], lessonId: string, moduleId: string): GuideBlock[] {
  return blocks.map((b, i) => {
    switch (b.kind) {
      case 'objective':
      case 'takeaway':
        return { type: b.kind, body: b.body.trim() };
      case 'text':
        return { type: 'text', title: b.title.trim(), body: b.body.trim() };
      case 'example':
        return { type: 'example', title: b.title.trim(), steps: b.steps.map((s) => s.trim()).filter(Boolean) };
      case 'tool':
        return { type: 'tool', simId: b.simId, body: b.body.trim() };
      case 'practice':
        return { type: 'practice', question: toQuestion(b.question, `${lessonId}-q${i + 1}`, moduleId) };
    }
  });
}

/** Back from a saved lesson to the editable drafts (to edit it again). */
export function toDrafts(lesson: CustomLesson): BlockDraft[] {
  return lesson.blocks.flatMap<BlockDraft>((b) => {
    const key = newKey();
    switch (b.type) {
      case 'objective':
      case 'takeaway':
        return [{ key, kind: b.type, body: b.body }];
      case 'text':
        return [{ key, kind: 'text', title: b.title, body: b.body }];
      case 'example':
        return [{ key, kind: 'example', title: b.title, steps: b.steps }];
      case 'tool':
        return [{ key, kind: 'tool', simId: b.simId, body: b.body }];
      case 'practice':
        return [{ key, kind: 'practice', question: fromQuestion(b.question) }];
      default:
        return [];
    }
  });
}

function fromQuestion(q: LearningQuestion): QuestionDraft {
  const draft = { ...emptyQuestion(), prompt: q.prompt, correctFeedback: q.feedback.correct ?? '', incorrectFeedback: q.feedback.incorrect ?? '' };
  switch (q.type) {
    case 'single':
    case 'multiple':
      return { ...draft, kind: q.type, options: q.options.map((o) => ({ ...o, correct: q.correctOptionIds.includes(o.id) })) };
    case 'true_false_why':
      return { ...draft, kind: 'true_false_why', statementTrue: q.correctOptionIds[0] === 'true', whyPrompt: q.why.prompt, whyOptions: q.why.options.map((o) => ({ ...o, correct: o.id === q.why.correct })) };
    case 'numeric':
      return { ...draft, kind: 'numeric', answer: q.numeric.answer, tolerance: q.numeric.tolerance, unit: q.numeric.unit === 'USD' ? 'ARS' : q.numeric.unit };
    default:
      return draft;
  }
}

/** A card can be published with a trigger, a title, a text, a guide part and one cohort or more. */
export function cardErrors(c: Pick<CustomCard, 'trigger' | 'title' | 'body' | 'cohortIds' | 'guide'> & { question?: CustomCard['question'] }): string[] {
  const errors: string[] = [];
  if (!c.trigger) errors.push('trigger');
  if (!filled(c.title)) errors.push('title');
  if (!filled(c.body)) errors.push('body');
  if (!c.guide.guideId || c.guide.part < 1) errors.push('guide');
  if (c.cohortIds.length === 0) errors.push('cohorts');
  if (c.question) {
    const q = c.question;
    if (!filled(q.prompt) || q.options.filter((o) => filled(o.text)).length < 2 || !q.options.some((o) => o.id === q.correct && filled(o.text))) errors.push('question');
    if (!filled(q.feedback.correct) || !filled(q.feedback.incorrect)) errors.push('question');
  }
  return [...new Set(errors)];
}
