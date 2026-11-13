import type { MissionRun } from '@/features/missions/engine';
import type { LevelProgress, LocalGoal, LocalScenario } from '@/types/domain';

/**
 * Participant-only data (CLAUDE.md 7, D-58, D-62). Each person has a separate localStorage space;
 * nothing here is ever sent to metrics or read by tutor, admin or sponsor views (enforced by
 * `privacy-boundaries.test.ts`). The wallet keeps its own store (`walletStore`, step 6) under the
 * same per-person rule.
 */
export interface LocalData {
  scenarios: LocalScenario[];
  goals: LocalGoal[];
  /** Conocerte habit answers: never leave the browser, not even aggregated (D-62). */
  habitAnswers: Record<string, string>;
  /** Weekly challenge reflections: only the person sees them (F5). */
  reflections: Record<string, string>;
  /** Level lock states: only the person sees them (D-58). */
  levelProgress: LevelProgress[];
  /** D-67: result of the educational investor profile test. Never a portfolio recommendation (1.2). */
  investorProfile?: InvestorProfile;
  /** Mission runs in progress or finished (5.3): "Salir y retomar" keeps the step. */
  missionRuns?: Record<string, MissionRun>;
  /** Conocerte answers in progress, so leaving halfway resumes at the same question (CU-01, 2a). */
  conocerteDraft?: { answers: Record<string, string>; index: number; kind: 'initial' | 'final' };
  /** Presence of Fuerte chosen in the profile (5.0.1): talkative by default. */
  fuertePresence?: FuertePresence;
}

export type FuertePresence = 'chatty' | 'important' | 'silent';

export type InvestorProfile = 'conservative' | 'moderate' | 'aggressive';

export const LOCAL_PREFIX = 'alcancia-local:';
export const localKey = (personId: string) => `${LOCAL_PREFIX}${personId}`;

const empty = (): LocalData => ({ scenarios: [], goals: [], habitAnswers: {}, reflections: {}, levelProgress: [] });

export function readLocal(personId: string): LocalData {
  try {
    const raw = localStorage.getItem(localKey(personId));
    return raw ? { ...empty(), ...(JSON.parse(raw) as Partial<LocalData>) } : empty();
  } catch {
    return empty();
  }
}

export function writeLocal(personId: string, update: (data: LocalData) => LocalData): LocalData {
  const next = update(readLocal(personId));
  try {
    localStorage.setItem(localKey(personId), JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode): the session keeps working without saving.
  }
  return next;
}

export function clearLocal(personId: string) {
  try {
    localStorage.removeItem(localKey(personId));
  } catch {
    // Nothing to clear.
  }
}
