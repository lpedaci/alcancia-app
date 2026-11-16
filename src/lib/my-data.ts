import type { SharedData } from '@/store/data-store';
import type { LocalData } from '@/store/local-store';

/**
 * "Mi privacidad" (F16, D-320): everything the platform keeps about one person, split in what the
 * organization holds (learning data, seen by role and aggregated with the threshold) and what lives
 * only in her browser (wallet, habits, reflections, goals). Used to show it and to download it (the
 * right of access, art. 14 of Ley 25.326). It never takes a record of another person.
 */
export interface MyData {
  account: { name: string; email: string; role: string; jobOrProgram: string; cohorts: string[] } | null;
  platform: {
    diagnostics: number;
    guidesRead: number;
    challengeAttempts: number;
    missionsCompleted: number;
    weeklyReports: number;
    followUps: number;
    questions: number;
    sessionRequests: number;
    escape: boolean;
    consents: number;
    privacyRequests: number;
  };
  browser: {
    wallet: boolean;
    habitAnswers: number;
    reflections: number;
    goals: number;
    scenarios: number;
    reviews: number;
    escape: boolean;
  };
}

export function collectMyData(personId: string, shared: Partial<SharedData>, local: LocalData, wallet: unknown): MyData {
  const mine = <T extends { personId: string }>(list: T[] | undefined) => (list ?? []).filter((x) => x.personId === personId);
  const person = shared.people?.find((p) => p.id === personId);
  return {
    account: person
      ? {
          name: person.name,
          email: person.email,
          role: person.role,
          jobOrProgram: person.jobOrProgram,
          cohorts: (shared.cohorts ?? []).filter((c) => person.cohortIds.includes(c.id)).map((c) => c.name),
        }
      : null,
    platform: {
      diagnostics: mine(shared.diagnostics).length,
      guidesRead: mine(shared.guideProgress).reduce((n, g) => n + g.guideIdsDone.length, 0),
      challengeAttempts: mine(shared.challengeAttempts).length,
      missionsCompleted: mine(shared.missionCompletions).length,
      weeklyReports: mine(shared.weeklyReports).length,
      followUps: mine(shared.followUps).length,
      questions: mine(shared.tutorQuestions).length,
      sessionRequests: mine(shared.sessionRequests).length,
      escape: mine(shared.escapeCompletions).length > 0,
      consents: mine(shared.consents).length,
      privacyRequests: mine(shared.privacyRequests).length,
    },
    browser: {
      wallet: Boolean(wallet),
      habitAnswers: Object.keys(local.habitAnswers ?? {}).length,
      reflections: Object.keys(local.reflections ?? {}).length,
      goals: (local.goals ?? []).length,
      scenarios: (local.scenarios ?? []).length,
      reviews: (local.reviews ?? []).length,
      escape: Boolean(local.escape),
    },
  };
}

/**
 * The download of the right of access: the person's own records, as they are kept. Platform records
 * are filtered by her id; the browser part is her local store and her wallet, which never left it.
 */
export function exportMyData(personId: string, shared: Partial<SharedData>, local: LocalData, wallet: unknown, generatedAt: string) {
  const mine = <T extends { personId: string }>(list: T[] | undefined) => (list ?? []).filter((x) => x.personId === personId);
  const person = shared.people?.find((p) => p.id === personId);
  return {
    generatedAt,
    note: 'Datos de una persona de demostración de Alcancía, simulador de finanzas personales. Dinero ficticio.',
    account: person ?? null,
    platform: {
      diagnostics: mine(shared.diagnostics),
      guideProgress: mine(shared.guideProgress),
      challengeAttempts: mine(shared.challengeAttempts),
      missionCompletions: mine(shared.missionCompletions),
      weeklyReports: mine(shared.weeklyReports),
      followUps: mine(shared.followUps),
      tutorQuestions: mine(shared.tutorQuestions),
      sessionRequests: mine(shared.sessionRequests),
      escapeCompletions: mine(shared.escapeCompletions),
      consents: mine(shared.consents),
      privacyRequests: mine(shared.privacyRequests),
    },
    browser: { local, wallet: wallet ?? null },
  };
}
