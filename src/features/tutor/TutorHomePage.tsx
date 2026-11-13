import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { ROLE_ACCENT } from '@/components/ui/Avatar';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { KpiCard, KpiRow } from '@/components/ui/KpiCard';
import { MetaChips } from '@/components/ui/MetaChips';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusPill } from '@/components/ui/StatusPill';
import { findPerson } from '@/features/auth/auth-service';
import { formatDate } from '@/lib/dates';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/store/session-store';
import { TutorShell } from './TutorShell';
import { pct, useTutorData } from './tutor-ui';
import { alerts, type AlertKind, cohortsOf, kpis, membersOf, moduleOrder, moduleTitle } from './tutor-data';

/**
 * T1, the tutor's home (CLAUDE.md F6, D-193): greeting with context, KPIs of her cohorts
 * (participation, modules completed, challenge average, weekly challenges done), alerts that lead
 * to an action, and one card per cohort. Every figure is computed from the data and goes through the
 * privacy threshold (F7).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const ALERT_ICON: Record<AlertKind, IconName> = { not_started: 'pending', due_soon: 'schedule', exhausted: 'lock_open', unanswered: 'forum' };

export function TutorHomePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const person = user ? findPerson(user.personId) : undefined;
  if (!user || !person) return null;
  const cohorts = cohortsOf(data, user.personId);
  const k = kpis(data, cohorts);
  const list = alerts(data, cohorts);
  const cohortName = (id?: string) => cohorts.find((c) => c.id === id)?.name ?? '';

  return (
    <TutorShell>
      <header className="flex flex-col gap-2">
        <MetaChips
          label={t('staff.context')}
          items={[
            { icon: 'calendar_month', label: formatDate(DEMO_TODAY), dateTime: DEMO_TODAY },
            { icon: 'school', label: t('staff.programName') },
            { icon: 'groups', label: t('tutor.home.cohortsChip', { count: cohorts.length }) },
          ]}
        />
        <h1 className="text-headline-medium text-on-surface">
          {t('staff.hello')} <span className="text-primary">{person.name.split(' ')[0]}</span>
        </h1>
        <p className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-label-medium', ROLE_ACCENT.tutor.chip)}>{t('roles.tutor')}</span>
          <span className="text-body-medium text-on-surface-variant">{t('tutor.home.subtitle', { count: k.people })}</span>
        </p>
      </header>

      <BentoGrid>
        <KpiRow minCardWidth="9rem">
          <KpiCard label={t('tutor.kpi.participation')} value={pct(k.participation, t)} icon="groups" caption={t('tutor.kpi.participationCaption')} />
          <KpiCard label={t('tutor.kpi.modules')} value={pct(k.modules, t)} icon="menu_book" iconTone="tertiary" caption={t('tutor.kpi.modulesCaption')} />
          <KpiCard label={t('tutor.kpi.challenges')} value={pct(k.challengeAverage, t)} icon="quiz" iconTone="secondary" caption={t('tutor.kpi.challengesCaption')} />
          <KpiCard label={t('tutor.kpi.weekly')} value={pct(k.weeklyDone, t)} icon="task_alt" iconTone="tertiary" caption={t('tutor.kpi.weeklyCaption')} />
        </KpiRow>
      </BentoGrid>

      <section aria-labelledby="alerts-title" className={card}>
        <div className="flex items-center gap-3">
          <IconTile icon="notifications" tone="primary" />
          <h2 id="alerts-title" className="text-title-large text-on-surface">
            {t('tutor.alerts.title')}
          </h2>
        </div>
        {list.length === 0 ? (
          <p className="text-body-medium text-on-surface-variant">{t('tutor.alerts.empty')}</p>
        ) : (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
            {list.map((a, i) => (
              <li key={`${a.kind}-${a.cohortId ?? ''}-${i}`}>
                <Link to={a.to} className="flex h-full items-start gap-3 rounded-lg border border-outline-variant p-4 hover:border-primary hover:bg-surface-container">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      a.kind === 'due_soon' || a.kind === 'exhausted' ? 'bg-warning-container text-warning' : 'bg-info-container text-info',
                    )}
                    aria-hidden
                  >
                    <Icon name={ALERT_ICON[a.kind]} size={20} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-body-medium text-on-surface">
                      {t(`tutor.alerts.${a.kind}`, { count: a.count, days: a.days, module: a.moduleId ? `${moduleOrder(a.moduleId)} · ${moduleTitle(a.moduleId)}` : '' })}
                    </span>
                    {a.cohortId && <span className="text-body-small text-on-surface-variant">{cohortName(a.cohortId)}</span>}
                  </span>
                  <Icon name="chevron_right" size={20} className="mt-2 shrink-0 text-on-surface-variant" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="cohorts-title" className="flex flex-col gap-4">
        <h2 id="cohorts-title" className="text-title-large text-on-surface">
          {t('tutor.home.cohortsTitle')}
        </h2>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) md:grid-cols-2">
          {cohorts.map((c) => {
            const ck = kpis(data, [c]);
            const members = membersOf(data, c);
            return (
              <li key={c.id}>
                <Link to={`/tutor/cohorts/${c.id}`} className={cn(card, 'h-full hover:border-primary')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <IconTile icon="groups" tone="secondary" />
                      <h3 className="text-title-medium text-on-surface">{c.name}</h3>
                    </div>
                    <Icon name="arrow_forward" size={20} className="mt-2 shrink-0 text-on-surface-variant" />
                  </div>
                  <MetaChips
                    label={t('tutor.home.cohortData')}
                    items={[
                      { icon: 'person', label: t('tutor.home.people', { count: members.length }) },
                      ...(c.dueDate ? [{ icon: 'event_available' as IconName, label: t('tutor.home.due', { date: formatDate(c.dueDate) }), dateTime: c.dueDate }] : []),
                    ]}
                  />
                  <p className="text-label-medium text-on-surface-variant">{t('tutor.kpi.modules')}</p>
                  {ck.modules.status === 'ok' ? (
                    <ProgressBar value={ck.modules.value * 100} label={t('tutor.kpi.modules')} valueText={formatPercent(ck.modules.value, { decimals: 0 })} tone="tertiary" />
                  ) : (
                    <StatusPill tone="neutral" icon="visibility_off" label={t('tutor.insufficientShort')} />
                  )}
                  <p className="text-body-small text-on-surface-variant">
                    {t('tutor.home.cohortLine', { participation: pct(ck.participation, t), challenges: pct(ck.challengeAverage, t) })}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="text-body-small text-on-surface-variant">{t('tutor.privacy')}</p>
      </section>
    </TutorShell>
  );
}
