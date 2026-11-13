import { type Aggregate } from '@/lib/metrics';
import { formatPercent } from '@/lib/money';
import { useDataStore } from '@/store/data-store';

/** The organization's learning data for the tutor's views (never the participant's local data, D-58). */
export const useTutorData = () => useDataStore();

/** A percentage, or the short "insufficient data" text when the group is below the threshold (F7). */
export function pct(result: Aggregate<number>, t: (key: string) => string) {
  return result.status === 'ok' ? formatPercent(result.value, { decimals: 0 }) : t('tutor.insufficientShort');
}
