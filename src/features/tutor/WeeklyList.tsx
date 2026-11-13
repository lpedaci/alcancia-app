import { useTranslation } from 'react-i18next';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/dates';
import { weeklyOf } from './tutor-data';
import { useTutorData } from './tutor-ui';

/** Weekly challenges of a cohort with their results (shared with T3). */
export function WeeklyList({ cohortId, limit }: { cohortId: string; limit?: number }) {
  const { t } = useTranslation();
  const data = useTutorData();
  const cohort = data.cohorts.find((c) => c.id === cohortId)!;
  const list = weeklyOf(data, cohort).slice(0, limit);
  if (!list.length) return <p className="text-body-medium text-on-surface-variant">{t('tutor.weekly.empty')}</p>;
  return (
    <ul className="flex flex-col divide-y divide-outline-variant">
      {list.map((w) => {
        const total = w.done + w.partial + w.notDone + w.pending;
        return (
          <li key={w.challenge.id} className="flex flex-col gap-2 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-body-large text-on-surface">{w.challenge.title}</p>
              <StatusPill
                tone={w.daysLeft < 0 ? 'neutral' : w.daysLeft <= 3 ? 'warning' : 'info'}
                icon={w.daysLeft < 0 ? 'event_available' : 'schedule'}
                label={w.daysLeft < 0 ? t('tutor.weekly.closed', { date: formatDate(w.challenge.dueDate) }) : t('tutor.weekly.dueIn', { count: w.daysLeft })}
              />
            </div>
            <ul className="flex flex-wrap gap-2" aria-label={t('tutor.weekly.results')}>
              <li>
                <StatusPill tone="success" icon="check_circle" label={t('tutor.weekly.done', { count: w.done })} />
              </li>
              <li>
                <StatusPill tone="info" icon="pending" label={t('tutor.weekly.partial', { count: w.partial })} />
              </li>
              <li>
                <StatusPill tone="neutral" icon="remove" label={t('tutor.weekly.notDone', { count: w.notDone })} />
              </li>
              <li>
                <StatusPill tone="neutral" icon="hourglass_empty" label={t('tutor.weekly.pending', { count: w.pending, total })} />
              </li>
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
