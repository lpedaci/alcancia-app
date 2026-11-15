import type { DueReview } from './spaced-review';

/**
 * Reminders of the program (CLAUDE.md F9, D-273): in the platform, and as a simulated preview of how
 * they would arrive by each channel of the context (5.5). Learning only: a pending guide, a new
 * weekly challenge, a deadline, a goal reached and the spaced reviews (F19). A goal reached says the
 * goal's name, never its amount. Nothing is sent anywhere.
 */
export type ReminderKind = 'review' | 'guide' | 'weekly' | 'due' | 'goal';

export interface Reminder {
  id: string;
  kind: ReminderKind;
  /** Interpolation values for the text: module title, challenge, date, goal name, days. */
  params: Record<string, string | number>;
  /** Where the reminder takes the person. */
  to: string;
}

/** Channels by context (5.5): work tools, the institution's campus, or the partner's app. */
export type ReminderChannel = 'email' | 'teams' | 'slack' | 'campus' | 'app';
export const CHANNELS_BY_KIND = {
  employer: ['email', 'teams', 'slack'],
  education: ['email', 'campus'],
  product: ['app'],
} as const satisfies Record<string, readonly ReminderChannel[]>;

const DAY = 86400000;
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY);
/** A deadline is worth a reminder from two weeks before. */
export const DUE_SOON_DAYS = 14;

export function programReminders(input: {
  today: string;
  reviews: DueReview[];
  moduleTitle: (moduleId: string) => string;
  nextGuide?: { guideId: string; moduleId: string };
  weekly: { id: string; title: string; dueDate: string; reported: boolean }[];
  cohortDueDate?: string;
  goalsReached: { id: string; name: string }[];
}): Reminder[] {
  const out: Reminder[] = [];
  for (const w of input.weekly) {
    if (!w.reported && w.dueDate >= input.today) out.push({ id: `weekly:${w.id}`, kind: 'weekly', params: { title: w.title, date: w.dueDate }, to: '/app/learn' });
  }
  if (input.cohortDueDate && input.cohortDueDate >= input.today) {
    const days = daysBetween(input.today, input.cohortDueDate);
    if (days <= DUE_SOON_DAYS) out.push({ id: `due:${input.cohortDueDate}`, kind: 'due', params: { date: input.cohortDueDate, count: days }, to: '/app/learn' });
  }
  for (const r of input.reviews) {
    out.push({ id: `review:${r.moduleId}:${r.round}`, kind: 'review', params: { module: input.moduleTitle(r.moduleId), count: r.round }, to: `/app/learn/review/${r.moduleId}` });
  }
  if (input.nextGuide) {
    out.push({ id: `guide:${input.nextGuide.guideId}`, kind: 'guide', params: { module: input.moduleTitle(input.nextGuide.moduleId) }, to: `/app/learn/guides/${input.nextGuide.guideId}` });
  }
  for (const g of input.goalsReached) out.push({ id: `goal:${g.id}`, kind: 'goal', params: { name: g.name }, to: '/app/save/pockets' });
  return out;
}
