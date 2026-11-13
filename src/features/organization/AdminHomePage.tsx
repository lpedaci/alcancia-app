import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { ROLE_ACCENT } from '@/components/ui/Avatar';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { KpiCard, KpiRow } from '@/components/ui/KpiCard';
import { MetaChips } from '@/components/ui/MetaChips';
import { StatusPill } from '@/components/ui/StatusPill';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { findPerson } from '@/features/auth/auth-service';
import { formatDate } from '@/lib/dates';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { AdminShell } from './AdminShell';
import { BehaviorSection, LearningSection, ReactionSection, ResultsSection } from './ImpactSections';
import { adoption, adoptionByCohort, type OrgAlertKind, orgAlerts, weeklyActivity } from './org-data';

/**
 * O1, the program's tracking panel (CLAUDE.md F7, D-195): adoption (invited, active, Conocerte done,
 * modules), adoption by cohort with complementary suppression, Kirkpatrick levels 1 to 3 and
 * alerts. Only aggregated data: the admin never sees one person's learning or money.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const ALERT_ICON: Record<OrgAlertKind, IconName> = {
  invited: 'person_add',
  low_adoption: 'trending_down',
  due_soon: 'schedule',
  hidden: 'visibility_off',
};

export function AdminHomePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useDataStore();
  const person = user ? findPerson(user.personId) : undefined;
  if (!person) return null;
  const a = adoption(data);
  const byCohort = adoptionByCohort(data);
  const alerts = orgAlerts(data);
  const activity = weeklyActivity(data);
  const v = (x: typeof a.activeShare) => (x.status === 'ok' ? formatPercent(x.value, { decimals: 0 }) : t('org.insufficientShort'));
  const n = (x: typeof a.invited) => (x.status === 'ok' ? String(x.value) : t('org.insufficientShort'));
  const cohortName = (id?: string) => data.cohorts.find((c) => c.id === id)?.name ?? '';

  return (
    <AdminShell>
      <header className="flex flex-col gap-2">
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
          <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-label-medium', ROLE_ACCENT.ld_admin.chip)}>{t('roles.ld_admin')}</span>
          <span className="text-body-medium text-on-surface-variant">
            {t('org.home.subtitle', {
              mode: t(`org.program.modes.${data.program.mode}`),
            })}
          </span>
        </p>
      </header>

      <BentoGrid>
        <KpiRow minCardWidth="9rem">
          <KpiCard label={t('org.kpi.invited')} value={n(a.invited)} icon="person_add" caption={t('org.kpi.invitedCaption')} />
          <KpiCard
            label={t('org.kpi.active')}
            value={v(a.activeShare)}
            icon="groups"
            iconTone="tertiary"
            caption={t('org.kpi.activeCaption', {
              count: a.active.status === 'ok' ? a.active.value : 0,
            })}
            series={activity}
          />
          <KpiCard label={t('org.kpi.diagnosed')} value={v(a.diagnosedShare)} icon="psychology" iconTone="secondary" caption={t('org.kpi.diagnosedCaption')} />
          <KpiCard label={t('org.kpi.modules')} value={v(a.modulesShare)} icon="menu_book" iconTone="tertiary" caption={t('org.kpi.modulesCaption')} />
        </KpiRow>
      </BentoGrid>

      {alerts.length > 0 && (
        <section aria-labelledby="org-alerts" className={card}>
          <div className="flex items-center gap-3">
            <IconTile icon="notifications" tone="primary" />
            <h2 id="org-alerts" className="text-title-large text-on-surface">
              {t('org.alerts.title')}
            </h2>
          </div>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
            {alerts.map((al, i) => (
              <li key={`${al.kind}-${i}`} className="flex items-start gap-3 rounded-lg border border-outline-variant p-4">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    al.kind === 'hidden' ? 'bg-surface-container text-on-surface-variant' : al.kind === 'invited' ? 'bg-info-container text-info' : 'bg-warning-container text-warning',
                  )}
                  aria-hidden
                >
                  <Icon name={ALERT_ICON[al.kind]} size={20} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-body-medium text-on-surface">
                    {t(`org.alerts.${al.kind}`, {
                      count: al.count,
                      days: al.days,
                      name: cohortName(al.cohortId),
                    })}
                  </span>
                  {al.kind === 'invited' && (
                    <Link to="/admin/people" className="w-fit text-label-large text-primary underline-offset-4 hover:underline">
                      {t('org.alerts.seePeople')}
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="by-cohort" className={card}>
        <div className="flex items-center gap-3">
          <IconTile icon="groups" tone="secondary" />
          <h2 id="by-cohort" className="text-title-large text-on-surface">
            {t('org.cohorts.title')}
          </h2>
        </div>
        <p className="text-body-medium text-on-surface-variant">{t('org.cohorts.intro')}</p>
        <TableContainer label={t('org.cohorts.title')}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-left">{t('org.cohorts.cohort')}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t('org.cohorts.people')}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t('org.kpi.active')}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t('org.kpi.diagnosed')}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t('org.kpi.modules')}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {byCohort.map(({ key, result }) => (
                <TableRow key={key}>
                  <TableHeaderCell scope="row" className="text-left text-on-surface">
                    {cohortName(key)}
                  </TableHeaderCell>
                  {result.status === 'ok' ? (
                    <>
                      <TableCell className="text-right tabular-nums">{result.count}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPercent(result.value.active, { decimals: 0 })}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPercent(result.value.diagnosed, { decimals: 0 })}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPercent(result.value.modules, { decimals: 0 })}</TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={4} className="text-right">
                      <StatusPill tone="neutral" icon="visibility_off" label={t('org.insufficientShort')} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {byCohort.some((c) => c.result.status !== 'ok') && (
          <InlineAlert tone="info" live="none">
            {t('org.cohorts.hidden')}
          </InlineAlert>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <h2 className="text-title-large text-on-surface">{t('org.k.title')}</h2>
        <p className="text-body-medium text-on-surface-variant">{t('org.k.intro')}</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
        <ReactionSection data={data} />
        <BehaviorSection data={data} />
      </div>
      <LearningSection data={data} />
      <ResultsSection />
      <p className="text-body-small text-on-surface-variant">{t('org.privacy')}</p>
    </AdminShell>
  );
}
