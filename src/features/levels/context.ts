import { DEFAULT_PASSING_SCORE } from '@/app/config';
import { walletMetrics } from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';
import type { OrgData } from '@/store/data-store';
import type { LocalData } from '@/store/local-store';
import type { LevelContext } from './engine';

/**
 * Builds the level context of one participant from the three places her data lives: learning data
 * (shared with her tutor), her wallet and her local data (only in her browser). It runs in her
 * browser; no other role ever calls it (D-58).
 */
export function buildLevelContext({
  personId,
  data,
  wallet,
  local,
  demoUnlockAll,
}: {
  personId: string;
  data: Pick<OrgData, 'people' | 'program' | 'diagnostics' | 'guideProgress' | 'challengeAttempts' | 'missionCompletions' | 'unlockRecords'>;
  wallet: WalletState;
  local: LocalData;
  demoUnlockAll: boolean;
}): LevelContext {
  const person = data.people.find((p) => p.id === personId);
  const bestScores: Record<string, number> = {};
  for (const attempt of data.challengeAttempts.filter((a) => a.personId === personId)) {
    bestScores[attempt.challengeId] = Math.max(bestScores[attempt.challengeId] ?? 0, attempt.score);
  }
  const tutorUnlocks: Record<string, string> = {};
  for (const record of data.unlockRecords) {
    const forPerson = record.target.kind === 'person' && record.target.personId === personId;
    const forCohort = record.target.kind === 'cohort' && (person?.cohortIds.includes(record.target.cohortId) ?? false);
    if (forPerson || forCohort) tutorUnlocks[record.levelId] = record.reason;
  }
  const missions = new Set([
    ...data.missionCompletions.filter((m) => m.personId === personId).map((m) => m.missionId),
    ...wallet.completedMissionIds,
  ]);
  return {
    completedMissionIds: [...missions],
    bestScores,
    guidesRead: data.guideProgress.filter((g) => g.personId === personId && g.guideIdsDone.length > 0).map((g) => g.moduleId),
    conocerteDone: data.diagnostics.some((d) => d.personId === personId && d.kind === 'initial'),
    metrics: walletMetrics(wallet),
    investorProfileDone: local.investorProfile !== undefined,
    tutorUnlocks,
    previouslyUnlocked: local.levelProgress.filter((p) => p.status !== 'locked' && p.unlockedBy === 'rule').map((p) => p.levelId),
    passingScore: data.program.passingScore ?? DEFAULT_PASSING_SCORE,
    freeMode: data.program.freeMode,
    demoUnlockAll,
  };
}
