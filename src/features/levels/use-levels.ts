import { useEffect, useMemo } from 'react';
import levelsJson from '@/data/levels.json';
import missionsJson from '@/data/wallet-missions.json';
import { useDataStore } from '@/store/data-store';
import { readLocal, writeLocal } from '@/store/local-store';
import { useSessionStore } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import type { LevelDef } from '@/types/domain';
import { buildLevelContext } from './context';
import { currentLevel, evaluateLevels, type LevelStatus, nextUnlock, toProgress } from './engine';

export const LEVELS = levelsJson as LevelDef[];

export interface MissionMeta {
  id: string;
  levelId: string;
  title: string;
  minutes: number;
  objective: string;
}
export const MISSIONS = missionsJson.missions as MissionMeta[];

/** Section of each wallet area (5.3): the level that opens it. */
export const AREA_LEVEL: Record<string, string> = {
  pay: 'level-2',
  transfer: 'level-2',
  qr: 'level-2',
  bills: 'level-2',
  credit: 'level-5',
  budget: 'level-3',
  pockets: 'level-4',
  yield: 'level-6',
  invest: 'level-7',
};

/**
 * Levels of the signed-in participant, computed in her browser from her learning data, her wallet
 * and her local data (D-58). Levels unlocked by the rule are saved locally so nothing is lost.
 */
export function useLevels(personId: string) {
  const people = useDataStore((s) => s.people);
  const program = useDataStore((s) => s.program);
  const diagnostics = useDataStore((s) => s.diagnostics);
  const guideProgress = useDataStore((s) => s.guideProgress);
  const challengeAttempts = useDataStore((s) => s.challengeAttempts);
  const missionCompletions = useDataStore((s) => s.missionCompletions);
  const unlockRecords = useDataStore((s) => s.unlockRecords);
  const demoUnlockAll = useSessionStore((s) => s.demoUnlockAll);
  const [wallet] = useWallet(personId);
  const local = readLocal(personId);

  const statuses = useMemo(
    () =>
      evaluateLevels(
        LEVELS,
        buildLevelContext({
          personId,
          data: { people, program, diagnostics, guideProgress, challengeAttempts, missionCompletions, unlockRecords },
          wallet,
          local,
          demoUnlockAll,
        }),
      ),
    // `local` is read on every render; its changes come with a navigation or a wallet update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [personId, people, program, diagnostics, guideProgress, challengeAttempts, missionCompletions, unlockRecords, wallet, demoUnlockAll],
  );

  useEffect(() => {
    const snapshot = toProgress(personId, statuses);
    const saved = readLocal(personId).levelProgress;
    if (JSON.stringify(saved) !== JSON.stringify(snapshot)) writeLocal(personId, (d) => ({ ...d, levelProgress: snapshot }));
  }, [personId, statuses]);

  const isOpen = (levelId: string) => statuses.find((s) => s.level.id === levelId)?.status !== 'locked';
  const done = new Set([...missionCompletions.filter((m) => m.personId === personId).map((m) => m.missionId), ...wallet.completedMissionIds]);
  const current = currentLevel(statuses);
  // Active mission (5.3, RF-90): the current level's first; if none is left there, one still pending
  // from an earlier open level, which the home says (`activeMissionFromEarlier`).
  const pending = MISSIONS.filter((m) => isOpen(m.levelId) && !done.has(m.id));
  const ofCurrent = pending.find((m) => m.levelId === current?.level.id);
  const activeMission = ofCurrent ?? pending[0];
  const activeMissionLevel = activeMission ? statuses.find((s) => s.level.id === activeMission.levelId)?.level.order : undefined;
  const activeMissionFromEarlier = Boolean(activeMission && !ofCurrent && current && activeMission.levelId !== current.level.id);

  return { statuses, current, next: nextUnlock(statuses), isOpen, activeMission, activeMissionLevel, activeMissionFromEarlier, wallet };
}

export type { LevelStatus };
