import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Avatar } from '@/components/ui/Avatar';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { KpiCard, KpiRow } from '@/components/ui/KpiCard';
import { MetaChips } from '@/components/ui/MetaChips';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusTone } from '@/components/ui/StatusPill';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/toast-store';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { formatDate } from '@/lib/dates';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { TutorShell } from './TutorShell';
import { WeeklyList } from './WeeklyList';
import { type CellState, heatmap, kpis, LEVELS, learningByLevel, membersOf, moduleOrder, moduleTitle } from './tutor-data';
import { pct, useTutorData } from './tutor-ui';

/**
 * T2, a cohort (CLAUDE.md F6, D-193): its KPIs, the heat map of progress by person and module, the
 * learning progress of each level of one person (guides, challenge, how it was enabled, completed;
 * never locked or unlocked, D-58), enabling a level with a reason (5.0, D-57) and its weekly
 * challenges. No money, habits or personal notes: they are not in the data the tutor reads.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

const CELL: Record<CellState, { icon: IconName; className: string }> = {
  done: { icon: 'check_circle', className: 'bg-success-container text-on-success-container' },
  reading: { icon: 'menu_book', className: 'bg-info-container text-on-info-container' },
  none: { icon: 'remove', className: 'bg-surface-container text-on-surface-variant' },
};

export function CohortPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const cohort = data.cohorts.find((c) => c.id === id && c.tutorId === user?.personId);
  if (!cohort) return <NotFoundPage />;
  const k = kpis(data, [cohort]);
  const rows = heatmap(data, cohort);
  const members = membersOf(data, cohort);

  return (
    <TutorShell>
      <header className="flex flex-col gap-3">
        <Link to="/tutor" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
          <Icon name="arrow_back" size={18} />
          {t('tutor.back')}
        </Link>
        <h1 className="text-headline-medium text-on-surface">{cohort.name}</h1>
        <MetaChips
          label={t('tutor.home.cohortData')}
          items={[
            { icon: 'person', label: t('tutor.home.people', { count: members.length }) },
            { icon: 'menu_book', label: t('tutor.cohort.modules', { count: cohort.moduleIds.length }) },
            ...(cohort.dueDate ? [{ icon: 'event_available' as IconName, label: t('tutor.home.due', { date: formatDate(cohort.dueDate) }), dateTime: cohort.dueDate }] : []),
          ]}
        />
      </header>

      <BentoGrid>
        <KpiRow minCardWidth="9rem">
          <KpiCard label={t('tutor.kpi.participation')} value={pct(k.participation, t)} icon="groups" caption={t('tutor.kpi.participationCaption')} />
          <KpiCard label={t('tutor.kpi.modules')} value={pct(k.modules, t)} icon="menu_book" iconTone="tertiary" caption={t('tutor.kpi.modulesCaption')} />
          <KpiCard label={t('tutor.kpi.challenges')} value={pct(k.challengeAverage, t)} icon="quiz" iconTone="secondary" caption={t('tutor.kpi.challengesCaption')} />
          <KpiCard label={t('tutor.kpi.weekly')} value={pct(k.weeklyDone, t)} icon="task_alt" iconTone="tertiary" caption={t('tutor.kpi.weeklyCaption')} />
        </KpiRow>
      </BentoGrid>
      {k.participation.status !== 'ok' && <InlineAlert tone="info" live="none">{t('tutor.insufficient')}</InlineAlert>}

      <section aria-labelledby="heat-title" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile icon="grid_view" tone="primary" />
            <h2 id="heat-title" className="text-title-large text-on-surface">
              {t('tutor.cohort.heatTitle')}
            </h2>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label={t('tutor.cohort.legend')}>
            {(['done', 'reading', 'none'] as const).map((s) => (
              <li key={s}>
                <StatusPill tone={s === 'done' ? 'success' : s === 'reading' ? 'info' : 'neutral'} icon={CELL[s].icon} label={t(`tutor.cohort.cell.${s}`)} />
              </li>
            ))}
          </ul>
        </div>
        <p className="text-body-medium text-on-surface-variant">{t('tutor.cohort.heatIntro')}</p>
        <TableContainer label={t('tutor.cohort.heatTitle')}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell scope="col" className="sticky left-0 z-10 min-w-48 bg-surface-container-lowest">
                  {t('tutor.cohort.person')}
                </TableHeaderCell>
                {cohort.moduleIds.map((m) => (
                  <TableHeaderCell key={m} scope="col" className="text-center" title={moduleTitle(m)}>
                    <abbr title={moduleTitle(m)} className="no-underline">
                      M{moduleOrder(m)}
                    </abbr>
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ person, cells }) => (
                <TableRow key={person.id}>
                  <TableHeaderCell scope="row" className="sticky left-0 z-10 bg-surface-container-lowest">
                    <span className="flex items-center gap-2">
                      <Avatar name={person.name} role="participant" size="sm" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-body-medium text-on-surface">{person.name}</span>
                        {person.status !== 'active' && <span className="text-body-small text-on-surface-variant">{t(`tutor.status.${person.status}`)}</span>}
                      </span>
                    </span>
                  </TableHeaderCell>
                  {cells.map((c) => (
                    <TableCell key={c.moduleId} className="p-1 text-center">
                      <span
                        className={cn('inline-flex h-8 min-w-12 items-center justify-center gap-0.5 rounded-md px-1 text-label-small tabular-nums', CELL[c.state].className, c.state === 'done' && c.score !== undefined && c.score < 0.7 && 'bg-warning-container text-on-warning-container')}
                        title={`${moduleTitle(c.moduleId)}: ${t(`tutor.cohort.cell.${c.state}`)}`}
                      >
                        <Icon name={c.state === 'done' && c.score !== undefined && c.score < 0.7 ? 'warning' : CELL[c.state].icon} size={16} />
                        {c.score !== undefined && c.state === 'done' ? formatPercent(c.score, { decimals: 0 }).replace(/\s%/, '%') : ''}
                        <span className="sr-only">
                          {t(`tutor.cohort.cell.${c.state}`)}
                          {c.score !== undefined ? `, ${formatPercent(c.score, { decimals: 0 })}` : ''}
                        </span>
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <p className="text-body-small text-on-surface-variant">{t('tutor.cohort.heatNote')}</p>
      </section>

      <PersonLevels cohortId={cohort.id} />

      <section aria-labelledby="weekly-title" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile icon="assignment" tone="secondary" />
            <h2 id="weekly-title" className="text-title-large text-on-surface">
              {t('tutor.weekly.title')}
            </h2>
          </div>
          <Button asChild leadingIcon="add">
            <Link to={`/tutor/cohorts/${cohort.id}/challenge`}>{t('tutor.weekly.assign')}</Link>
          </Button>
        </div>
        <WeeklyList cohortId={cohort.id} limit={3} />
      </section>
    </TutorShell>
  );
}

const CHALLENGE_TONE: Record<string, StatusTone> = { passed: 'success', in_progress: 'info', attempts_exhausted: 'warning', not_started: 'neutral' };

/** One person's learning progress by level and the form to enable a level with a reason (D-58, 5.0). */
function PersonLevels({ cohortId }: { cohortId: string }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const addUnlock = useDataStore((s) => s.addUnlockRecord);
  const cohort = data.cohorts.find((c) => c.id === cohortId)!;
  const members = membersOf(data, cohort).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const [personId, setPersonId] = useState(members[0]?.id ?? '');
  const [target, setTarget] = useState<'person' | 'cohort'>('person');
  const [levelId, setLevelId] = useState(LEVELS[1]?.id ?? '');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  const progress = learningByLevel(data, personId);
  const reasonError = tried && reason.trim().length < 10 ? t('tutor.unlock.reasonError') : undefined;
  const person = members.find((m) => m.id === personId);

  const submit = () => {
    setTried(true);
    if (reason.trim().length < 10 || !user) return;
    addUnlock({
      id: `unlock-${Date.now()}`,
      levelId,
      target: target === 'person' ? { kind: 'person', personId } : { kind: 'cohort', cohortId },
      tutorId: user.personId,
      reason: reason.trim(),
      at: `${DEMO_TODAY}T10:00:00.000Z`,
    });
    setReason('');
    setTried(false);
    toast.success(t('tutor.unlock.done'));
  };

  return (
    <section aria-labelledby="levels-title" className={cn(card, '@container')}>
      <div className="flex items-center gap-3">
        <IconTile icon="route" tone="tertiary" />
        <h2 id="levels-title" className="text-title-large text-on-surface">
          {t('tutor.levels.title')}
        </h2>
      </div>
      <InlineAlert tone="info" live="none">
        {t('tutor.levels.privacy')}
      </InlineAlert>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 @4xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Select
            label={t('tutor.levels.person')}
            helperText={t('tutor.levels.personHelp')}
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            options={members.map((m) => ({ value: m.id, label: m.name }))}
          />
          {progress.length === 0 ? (
            <p className="text-body-medium text-on-surface-variant">{t('tutor.levels.empty', { name: person?.name ?? '' })}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-outline-variant">
              {progress.map((l) => (
                <li key={l.levelId} className="flex flex-col gap-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-body-large text-on-surface">{t('tutor.levels.level', { n: l.levelOrder, name: t(`wallet.sections.${l.levelId}`) })}</p>
                    {l.completed && <StatusPill tone="success" icon="task_alt" label={t('tutor.levels.completed')} />}
                  </div>
                  <ul className="flex flex-wrap gap-2" aria-label={t('tutor.levels.data')}>
                    <li>
                      <StatusPill tone="neutral" icon="menu_book" label={t('tutor.levels.guides', { read: l.guidesRead, total: l.guidesTotal })} />
                    </li>
                    <li>
                      <StatusPill
                        tone={CHALLENGE_TONE[l.challenge] ?? 'neutral'}
                        icon={l.challenge === 'passed' ? 'check_circle' : l.challenge === 'attempts_exhausted' ? 'warning' : 'quiz'}
                        label={t(`tutor.levels.challenge.${l.challenge}`, { best: l.bestScore !== undefined ? formatPercent(l.bestScore, { decimals: 0 }) : '', first: l.firstScore !== undefined ? formatPercent(l.firstScore, { decimals: 0 }) : '' })}
                      />
                    </li>
                    {l.enabledBy && (
                      <li>
                        <StatusPill tone="primary" icon="lock_open" label={t(`tutor.levels.enabledBy.${l.enabledBy.kind}`)} />
                      </li>
                    )}
                  </ul>
                  {l.challenge === 'passed' && l.firstScore !== undefined && l.bestScore !== undefined && l.firstScore !== l.bestScore && (
                    <p className="text-body-small text-on-surface-variant">{t('tutor.levels.firstVsBest', { first: formatPercent(l.firstScore, { decimals: 0 }), best: formatPercent(l.bestScore, { decimals: 0 }), count: l.attempts })}</p>
                  )}
                  {l.enabledBy?.kind === 'tutor' && <p className="text-body-small text-on-surface-variant">{t('tutor.levels.reason', { reason: l.enabledBy.reason })}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4 rounded-lg bg-surface-container p-5">
          <h3 className="text-title-medium text-on-surface">{t('tutor.unlock.title')}</h3>
          <p className="text-body-small text-on-surface-variant">{t('tutor.unlock.intro')}</p>
          <RadioGroup
            name="unlock-target"
            legend={t('tutor.unlock.target')}
            value={target}
            onChange={(e) => setTarget(e.target.value as 'person' | 'cohort')}
            options={[
              { value: 'person', label: t('tutor.unlock.person', { name: person?.name ?? '' }) },
              { value: 'cohort', label: t('tutor.unlock.cohort', { name: cohort.name }) },
            ]}
          />
          <Select
            label={t('tutor.unlock.level')}
            helperText={t('tutor.unlock.levelHelp')}
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            options={LEVELS.filter((l) => l.order >= 2).map((l) => ({ value: l.id, label: t('tutor.levels.level', { n: l.order, name: t(`wallet.sections.${l.id}`) }) }))}
          />
          <TextArea
            label={t('tutor.unlock.reason')}
            helperText={t('tutor.unlock.reasonHelp')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reasonError}
            rows={3}
          />
          <Button leadingIcon="lock_open" className="self-start" onClick={submit}>
            {t('tutor.unlock.submit')}
          </Button>
        </div>
      </div>
    </section>
  );
}
