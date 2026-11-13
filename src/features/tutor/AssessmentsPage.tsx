import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Select } from '@/components/ui/Select';
import { StatusPill } from '@/components/ui/StatusPill';
import { aggregate, average } from '@/lib/metrics';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/store/session-store';
import { TutorShell } from './TutorShell';
import { cohortsOf, itemStats, LEVELS, membersOf, moduleOrder, moduleTitle } from './tutor-data';
import { useTutorData } from './tutor-ui';

/**
 * T4, assessment results (CLAUDE.md F6, 5.1, D-193): the questions with more errors and, for single
 * choice, which options were chosen, to reinforce them in the next session; and, per level, the
 * first attempt next to the best one (what people knew and what they learned). Only groups that reach
 * the privacy threshold (F7).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function AssessmentsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const mine = cohortsOf(data, user?.personId ?? '');
  const [filter, setFilter] = useState('all');
  const cohorts = filter === 'all' ? mine : mine.filter((c) => c.id === filter);
  const { stats, hidden } = itemStats(data, cohorts);
  const people = new Set(cohorts.flatMap((c) => membersOf(data, c)).map((p) => p.id));
  const levelRows = LEVELS.map((level) => {
    const rows = data.levelLearning.filter((l) => l.levelId === level.id && people.has(l.personId) && l.firstScore !== undefined);
    return {
      level,
      result: aggregate(
        rows,
        (list) => ({ first: average(list.map((l) => l.firstScore!)) ?? 0, best: average(list.map((l) => l.bestScore ?? l.firstScore!)) ?? 0 }),
        { threshold: data.organization.privacyThreshold, idOf: (l) => l.personId },
      ),
    };
  });

  return (
    <TutorShell>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-medium text-on-surface">{t('tutor.assessments.title')}</h1>
        <p className="text-body-large text-on-surface-variant">{t('tutor.assessments.intro')}</p>
      </header>
      <div className="max-w-md">
        <Select
          label={t('tutor.assessments.cohort')}
          helperText={t('tutor.assessments.cohortHelp')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[{ value: 'all', label: t('tutor.assessments.allCohorts') }, ...mine.map((c) => ({ value: c.id, label: c.name }))]}
        />
      </div>

      <section aria-labelledby="levels-title" className={cn(card, '@container')}>
        <div className="flex items-center gap-3">
          <IconTile icon="quiz" tone="secondary" />
          <h2 id="levels-title" className="text-title-large text-on-surface">
            {t('tutor.assessments.levelsTitle')}
          </h2>
        </div>
        <p className="text-body-medium text-on-surface-variant">{t('tutor.assessments.levelsIntro')}</p>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
          {levelRows.map(({ level, result }) => (
            <li key={level.id} className="flex flex-col gap-2 rounded-lg border border-outline-variant p-4">
              <p className="text-title-small text-on-surface">{t('tutor.levels.level', { n: level.order, name: t(`wallet.sections.${level.id}`) })}</p>
              {result.status === 'ok' ? (
                <dl className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <dt className="text-label-medium text-on-surface-variant">{t('tutor.assessments.first')}</dt>
                    <dd className="text-title-medium text-on-surface tabular-nums">{formatPercent(result.value.first, { decimals: 0 })}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-label-medium text-on-surface-variant">{t('tutor.assessments.best')}</dt>
                    <dd className="text-title-medium text-on-surface tabular-nums">{formatPercent(result.value.best, { decimals: 0 })}</dd>
                  </div>
                </dl>
              ) : (
                <StatusPill tone="neutral" icon="visibility_off" label={t('tutor.insufficientShort')} className="self-start" />
              )}
              {result.status === 'ok' && <p className="text-body-small text-on-surface-variant">{t('tutor.home.people', { count: result.count })}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="items-title" className={cn(card, '@container')}>
        <div className="flex items-center gap-3">
          <IconTile icon="warning" tone="primary" />
          <h2 id="items-title" className="text-title-large text-on-surface">
            {t('tutor.assessments.itemsTitle')}
          </h2>
        </div>
        <p className="text-body-medium text-on-surface-variant">{t('tutor.assessments.itemsIntro')}</p>
        {stats.length === 0 ? (
          <InlineAlert tone="info" live="none">
            {t('tutor.insufficient')}
          </InlineAlert>
        ) : (
          <ol className="grid grid-cols-[minmax(0,1fr)] gap-3 @4xl:grid-cols-2">
            {stats.slice(0, 8).map((s, index) => {
              const hard = s.errorRate >= 0.4;
              return (
                <li key={s.questionId} className="flex flex-col gap-3 rounded-lg border border-outline-variant p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusPill tone="neutral" icon="menu_book" label={t('tutor.assessments.module', { n: moduleOrder(s.moduleId), name: moduleTitle(s.moduleId) })} />
                    <span className="text-label-medium text-on-surface-variant">#{index + 1}</span>
                  </div>
                  <p className="text-body-medium text-on-surface">{s.prompt}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={cn('inline-flex items-center gap-1 text-label-large', hard ? 'text-warning' : 'text-on-surface')}>
                        {hard && <Icon name="warning" size={16} />}
                        {t('tutor.assessments.errorRate', { value: formatPercent(s.errorRate, { decimals: 0 }) })}
                      </span>
                      <span className="text-body-small text-on-surface-variant">{t('tutor.home.people', { count: s.people })}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container" aria-hidden>
                      <span className={cn('block h-full rounded-full', hard ? 'bg-warning' : 'bg-primary')} style={{ width: `${Math.round(s.errorRate * 100)}%` }} />
                    </div>
                  </div>
                  {s.options && (
                    <ul className="flex flex-col gap-1.5" aria-label={t('tutor.assessments.options')}>
                      {s.options.map((o) => {
                        const total = s.options!.reduce((n, x) => n + x.count, 0) || 1;
                        return (
                          <li key={o.id} className="flex flex-col gap-0.5">
                            <span className="flex items-start justify-between gap-2 text-body-small">
                              <span className={cn('inline-flex items-start gap-1', o.correct ? 'text-success' : 'text-on-surface-variant')}>
                                <Icon name={o.correct ? 'check_circle' : 'remove'} size={16} className="mt-px shrink-0" />
                                <span>
                                  {o.text}
                                  {o.correct && <span className="sr-only"> {t('tutor.assessments.correct')}</span>}
                                </span>
                              </span>
                              <span className="shrink-0 tabular-nums text-on-surface">{formatPercent(o.count / total, { decimals: 0 })}</span>
                            </span>
                            <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container" aria-hidden>
                              <span className={cn('block h-full rounded-full', o.correct ? 'bg-success' : 'bg-outline')} style={{ width: `${Math.round((o.count / total) * 100)}%` }} />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        {hidden > 0 && <p className="text-body-small text-on-surface-variant">{t('tutor.assessments.hidden', { count: hidden })}</p>}
      </section>
    </TutorShell>
  );
}
