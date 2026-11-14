import { useState } from 'react';
import { readLocal, writeLocal } from '@/store/local-store';
import { useCurrentUser } from '@/store/session-store';
import type { LocalScenario } from '@/types/domain';

/** Two scenarios side by side at most (F4: "comparar dos escenarios"). */
export const MAX_SAVED = 2;

/**
 * Saved scenarios of a simulator (F4, RF-62, D-203): kept in the person's own local space as
 * `LocalScenario`, so they survive a reload and never leave the browser. Without a session (the
 * landing) they live only in memory.
 */
export function useSavedScenarios(simId: string) {
  const personId = useCurrentUser()?.personId;
  const [list, setList] = useState<LocalScenario[]>(() => (personId ? readLocal(personId).scenarios.filter((s) => s.simId === simId) : []));

  const persist = (next: LocalScenario[]) => {
    setList(next);
    if (personId) writeLocal(personId, (d) => ({ ...d, scenarios: [...d.scenarios.filter((s) => s.simId !== simId), ...next] }));
  };

  return {
    saved: list,
    save: (inputs: Record<string, string>) =>
      persist([{ id: `${simId}-${Date.now()}`, simId, name: '', inputs, savedAt: new Date().toISOString() }, ...list].slice(0, MAX_SAVED)),
    remove: (id: string) => persist(list.filter((s) => s.id !== id)),
  };
}
