import Decimal from 'decimal.js';
import { DEMO_TODAY } from '@/app/config';
import { useLevels } from '@/features/levels/use-levels';
import { programReminders, type Reminder } from '@/lib/reminders';
import { dueReviews, type DueReview } from '@/lib/spaced-review';
import { useDataStore, useOrganization } from '@/store/data-store';
import { readLocal } from '@/store/local-store';
import { guideOfModule, moduleById } from './questions';

/**
 * Reminders and spaced reviews of the signed-in participant (F9, F19, D-273), computed in her
 * browser from her learning data, her wallet and her local reviews. Nothing leaves the browser.
 */
export function useReminders(personId: string): { reminders: Reminder[]; reviews: DueReview[] } {
  const organization = useOrganization();
  const { current, wallet } = useLevels(personId);
  // Whole arrays (stable references), filtered here
  const allGuides = useDataStore((s) => s.guideProgress);
  const people = useDataStore((s) => s.people);
  const cohorts = useDataStore((s) => s.cohorts);
  const allWeekly = useDataStore((s) => s.weeklyChallenges);
  const allReports = useDataStore((s) => s.weeklyReports);

  const guides = allGuides.filter((g) => g.personId === personId);
  const reviews = dueReviews(guides, readLocal(personId).reviews ?? [], DEMO_TODAY);
  const person = people.find((p) => p.id === personId);
  const myCohorts = cohorts.filter((c) => person?.cohortIds.includes(c.id));
  const done = (moduleId: string) => guides.some((g) => g.moduleId === moduleId && g.guideIdsDone.length > 0);
  const nextModule = current?.level.guideModuleIds.find((m) => !done(m));
  const nextGuide = nextModule ? guideOfModule(nextModule) : undefined;
  // The product context has no tutor, so no weekly challenges (5.5)
  const weekly =
    organization.kind === 'product'
      ? []
      : allWeekly
          .filter((w) => myCohorts.some((c) => c.id === w.cohortId))
          .map((w) => ({ id: w.id, title: w.title, dueDate: w.dueDate, reported: allReports.some((r) => r.challengeId === w.id && r.personId === personId) }));
  const goalsReached = wallet.pockets.filter((p) => p.goal && new Decimal(p.amount).gte(p.goal)).map((p) => ({ id: p.id, name: p.name }));

  const reminders = programReminders({
    today: DEMO_TODAY,
    reviews,
    moduleTitle: (id) => moduleById(id)?.title ?? id,
    nextGuide: nextGuide ? { guideId: nextGuide.id, moduleId: nextGuide.moduleId } : undefined,
    weekly,
    cohortDueDate: myCohorts.map((c) => c.dueDate).find(Boolean),
    goalsReached,
  });
  return { reminders, reviews };
}
