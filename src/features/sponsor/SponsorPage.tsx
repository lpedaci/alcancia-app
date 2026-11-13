import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { StaffShell } from '@/components/layout/StaffShell';
import { ROLE_ACCENT } from '@/components/ui/Avatar';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { Button } from '@/components/ui/Button';
import { KpiCard, KpiRow } from '@/components/ui/KpiCard';
import { MetaChips } from '@/components/ui/MetaChips';
import { findPerson } from '@/features/auth/auth-service';
import { BehaviorSection, LearningSection, ReactionSection, ResultsSection } from '@/features/organization/ImpactSections';
import { adoption, behavior, learning, reaction } from '@/features/organization/org-data';
import { formatDate } from '@/lib/dates';
import { formatNumber, formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { impactRows, toCsv } from './impact-export';

/**
 * D1, the sponsor's impact report (CLAUDE.md F7, D-198): a read-only summary of the admin's panel
 * with the same aggregated metrics (Kirkpatrick 1 to 3, level 4 as a future line), exportable as a
 * printable page or a CSV of aggregated figures. No person, cohort detail or money ever appears.
 */
export function SponsorPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useDataStore();
  const person = user ? findPerson(user.personId) : undefined;
  if (!person) return null;
  const a = adoption(data);
  const r = reaction(data);
  const l = learning(data);
  const b = behavior(data);
  const missing = t('org.insufficientShort');
  const gain = l.status === 'ok' ? l.value.byDimension.reduce((s, d) => s + d.after - d.before, 0) / l.value.byDimension.length : null;

  const download = () => {
    const blob = new Blob([toCsv(impactRows(data, (key, values) => t(key, values ?? {})))], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-impacto-${DEMO_TODAY}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StaffShell home="/sponsor">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <MetaChips
            label={t('staff.context')}
            items={[
              {
                icon: 'calendar_month',
                label: formatDate(DEMO_TODAY),
                dateTime: DEMO_TODAY,
              },
              { icon: 'school', label: data.program.name },
              { icon: 'apartment', label: data.organization.name },
            ]}
          />
          <h1 className="text-headline-medium text-on-surface">
            {t('staff.hello')} <span className="text-primary">{person.name.split(' ')[0]}</span>
          </h1>
          <p className="flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-label-medium', ROLE_ACCENT.sponsor.chip)}>{t('roles.sponsor')}</span>
            <span className="text-body-medium text-on-surface-variant">{t('sponsor.subtitle')}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 print:hidden">
          <Button variant="tonal" leadingIcon="print" onClick={() => window.print()}>
            {t('sponsor.print')}
          </Button>
          <Button variant="outlined" leadingIcon="download" onClick={download}>
            {t('sponsor.csv.download')}
          </Button>
        </div>
      </header>

      <p className="max-w-[72ch] text-body-large text-on-surface">{t('sponsor.intro')}</p>

      <BentoGrid>
        <KpiRow minCardWidth="9rem">
          <KpiCard
            label={t('org.kpi.active')}
            value={a.activeShare.status === 'ok' ? formatPercent(a.activeShare.value, { decimals: 0 }) : missing}
            icon="groups"
            caption={t('sponsor.kpi.activeCaption')}
          />
          <KpiCard
            label={t('sponsor.kpi.satisfaction')}
            value={r.status === 'ok' ? formatNumber(r.value.average.toFixed(1), 1) : missing}
            icon="sentiment_satisfied"
            iconTone="tertiary"
            caption={t('sponsor.kpi.satisfactionCaption')}
          />
          <KpiCard
            label={t('sponsor.kpi.learning')}
            value={gain === null ? missing : `+${formatNumber((gain * 100).toFixed(0), 0)}`}
            icon="school"
            iconTone="secondary"
            caption={t('sponsor.kpi.learningCaption')}
          />
          <KpiCard
            label={t('sponsor.kpi.behavior')}
            value={b.status === 'ok' ? formatPercent(b.value.budget, { decimals: 0 }) : missing}
            icon="task_alt"
            iconTone="tertiary"
            caption={t('sponsor.kpi.behaviorCaption')}
          />
        </KpiRow>
      </BentoGrid>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
        <ReactionSection data={data} />
        <BehaviorSection data={data} />
      </div>
      <LearningSection data={data} />
      <ResultsSection />
      <p className="text-body-small text-on-surface-variant">
        {t('sponsor.privacy', {
          threshold: data.organization.privacyThreshold,
        })}
      </p>
    </StaffShell>
  );
}
