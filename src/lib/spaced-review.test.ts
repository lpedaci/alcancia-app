import { describe, expect, it } from 'vitest';
import { programReminders } from './reminders';
import { drawReview, dueReviews, MAX_PENDING, REVIEW_QUESTIONS } from './spaced-review';

const guide = (moduleId: string, completedAt: string) => ({ moduleId, completedAt, guideIdsDone: [`${moduleId}-guide-1`] });

/** F19 and F9 (D-273): reviews at 7 and 30 days, and the reminders of the program. */
describe('spaced review', () => {
  it('the 7-day review is due a week after the guide, never before', () => {
    expect(dueReviews([guide('module-09', '2026-11-10')], [], '2026-11-16')).toEqual([]);
    expect(dueReviews([guide('module-09', '2026-11-09')], [], '2026-11-16')).toEqual([{ moduleId: 'module-09', round: 7, dueOn: '2026-11-16' }]);
  });

  it('after the 7-day review comes the 30-day one, and then nothing', () => {
    const g = [guide('module-09', '2026-10-01')];
    expect(dueReviews(g, [{ moduleId: 'module-09', round: 7, at: '2026-10-08' }], '2026-11-16')[0]).toMatchObject({ round: 30, dueOn: '2026-10-31' });
    expect(dueReviews(g, [{ moduleId: 'module-09', round: 7, at: 'x' }, { moduleId: 'module-09', round: 30, at: 'y' }], '2026-11-16')).toEqual([]);
  });

  it('never more than three pending at once, the oldest first', () => {
    const many = ['module-01', 'module-02', 'module-03', 'module-04', 'module-09'].map((m, i) => guide(m, `2026-09-0${i + 1}`));
    const due = dueReviews(many, [], '2026-11-16');
    expect(due).toHaveLength(MAX_PENDING);
    expect(due.map((d) => d.moduleId)).toEqual(['module-01', 'module-02', 'module-03']);
  });

  it('draws three questions of the module, the same ones for the same round', () => {
    const a = drawReview('module-09', 7);
    expect(a).toHaveLength(REVIEW_QUESTIONS);
    expect(a.every((q) => q.moduleId === 'module-09')).toBe(true);
    expect(drawReview('module-09', 7).map((q) => q.id)).toEqual(a.map((q) => q.id));
    expect(a.some((q) => q.type === 'branching' || q.type === 'simulator_task' || q.type === 'ordering')).toBe(false);
  });
});

describe('program reminders', () => {
  const base = { today: '2026-11-16', reviews: [], moduleTitle: (id: string) => id, weekly: [], goalsReached: [] };

  it('a weekly challenge only until its date and only if not reported yet', () => {
    const r = programReminders({
      ...base,
      weekly: [
        { id: 'w1', title: 'A', dueDate: '2026-11-23', reported: false },
        { id: 'w2', title: 'B', dueDate: '2026-11-10', reported: false },
        { id: 'w3', title: 'C', dueDate: '2026-11-23', reported: true },
      ],
    });
    expect(r.map((x) => x.id)).toEqual(['weekly:w1']);
  });

  it('the deadline from two weeks before, with the days left', () => {
    expect(programReminders({ ...base, cohortDueDate: '2026-12-18' })).toEqual([]);
    expect(programReminders({ ...base, cohortDueDate: '2026-11-30' })[0]).toMatchObject({ kind: 'due', params: { count: 14 } });
  });

  it('a goal reached says its name, never an amount', () => {
    const [goal] = programReminders({ ...base, goalsReached: [{ id: 'p1', name: 'Vacaciones' }] });
    expect(goal).toMatchObject({ kind: 'goal', params: { name: 'Vacaciones' }, to: '/app/save/pockets' });
    expect(JSON.stringify(goal)).not.toMatch(/\d{3}/);
  });

  it('the 30-day follow-up is due 30 days after Conocerte and leaves once answered (F15, D-316)', () => {
    expect(programReminders({ ...base, followUp: { startedAt: '2026-10-18', answered: false } })).toEqual([]);
    expect(programReminders({ ...base, followUp: { startedAt: '2026-10-17', answered: false } })[0]).toMatchObject({ kind: 'followup', to: '/app/learn/follow-up' });
    expect(programReminders({ ...base, followUp: { startedAt: '2026-08-07', answered: true } })).toEqual([]);
  });
});
