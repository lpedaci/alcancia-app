import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { KpiCard, KpiRow } from '@/components/ui/KpiCard';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { formatDate } from '@/lib/dates';
import { formatPercent } from '@/lib/money';
import { countByVerb, deriveStatements, type XapiStatement } from '@/lib/xapi';
import { useOrgData } from '@/store/data-store';
import { AdminShell } from './AdminShell';

/**
 * O5 · Activity log (CLAUDE.md F21, D-272): the learning actions of the program as xAPI-like
 * statements, the way an LRS or a corporate LMS would receive them. Pseudonymous actors, learning
 * data only: no amounts, no habits, no decisions inside the wallet. The JSON of each statement and
 * the export show the integration; nothing leaves the browser.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const FILTERS = ['all', 'guide', 'challenge', 'mission', 'diagnostic', 'weekly-challenge'] as const;
type Filter = (typeof FILTERS)[number];
const PAGE = 25;

export function ActivityPage() {
  const { t } = useTranslation();
  const data = useOrgData();
  const all = useMemo(() => deriveStatements(data), [data]);
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<XapiStatement | null>(null);
  const list = filter === 'all' ? all : all.filter((s) => s.object.definition.type === filter);
  const counts = countByVerb(all);
  const challenges = counts.passed + counts.failed;

  const result = (s: XapiStatement) => {
    const r = s.result;
    if (!r) return '';
    if (r.score) return t('org.activity.score', { value: formatPercent(r.score.scaled, { decimals: 0 }) });
    if (r.response) return t(`org.activity.responses.${r.response}`);
    return r.completion ? t('org.activity.done') : '';
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alcancia-xapi-${data.organization.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-medium text-on-surface">{t('org.activity.title')}</h1>
        <p className="text-body-large text-on-surface-variant">{t('org.activity.intro')}</p>
      </header>

      <KpiRow minCardWidth="9rem">
        <KpiCard label={t('org.activity.kpi.total')} value={String(all.length)} icon="timeline" caption={t('org.activity.kpi.totalCaption')} />
        <KpiCard label={t('org.activity.kpi.completed')} value={String(counts.completed)} icon="task_alt" iconTone="tertiary" caption={t('org.activity.kpi.completedCaption')} />
        <KpiCard
          label={t('org.activity.kpi.passed')}
          value={challenges ? formatPercent(counts.passed / challenges, { decimals: 0 }) : t('org.insufficientShort')}
          icon="military_tech"
          iconTone="secondary"
          caption={t('org.activity.kpi.passedCaption', { count: challenges })}
        />
      </KpiRow>

      <section aria-labelledby="activity-log" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="activity-log" className="text-title-large text-on-surface">
            {t('org.activity.logTitle')}
          </h2>
          <Button variant="outlined" size="xs" leadingIcon="download" onClick={download}>
            {t('org.activity.download')}
          </Button>
        </div>
        <SegmentedButton
          label={t('org.activity.filter')}
          value={filter}
          onValueChange={(v) => {
            if (!v) return;
            setFilter(v as Filter);
            setShown(PAGE);
          }}
          options={FILTERS.map((f) => ({ value: f, label: t(`org.activity.types.${f}`) }))}
          className="w-full"
        />
        <p className="text-body-small text-on-surface-variant" aria-live="polite">
          {t('org.activity.count', { count: list.length })}
        </p>
        <TableContainer label={t('org.activity.logTitle')}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-left">{t('org.activity.cols.actor')}</TableHeaderCell>
                <TableHeaderCell className="text-left">{t('org.activity.cols.verb')}</TableHeaderCell>
                <TableHeaderCell className="text-left">{t('org.activity.cols.object')}</TableHeaderCell>
                <TableHeaderCell className="text-left">{t('org.activity.cols.result')}</TableHeaderCell>
                <TableHeaderCell className="text-left">{t('org.activity.cols.date')}</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  <span className="sr-only">{t('org.activity.cols.json')}</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.slice(0, shown).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap tabular-nums">{s.actor.account.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{t(`org.activity.verbs.${s.verb.display['en-US']}`)}</TableCell>
                  <TableCell>{t(`org.activity.object.${s.object.definition.type}`, { name: s.object.definition.name['es-AR'] })}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{result(s)}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{formatDate(s.timestamp.slice(0, 10))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="text" size="xs" onClick={() => setOpen(s)} aria-label={t('org.activity.seeJsonFor', { name: s.object.definition.name['es-AR'] })}>
                      {t('org.activity.seeJson')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {shown < list.length && (
          <Button variant="tonal" className="self-start" leadingIcon="keyboard_arrow_down" onClick={() => setShown((n) => n + PAGE)}>
            {t('org.activity.more')}
          </Button>
        )}
      </section>

      <p className="flex items-start gap-2 text-body-small text-on-surface-variant">
        <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
        {t('org.activity.privacy')}
      </p>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent
            title={t('org.activity.jsonTitle')}
            description={t('org.activity.jsonIntro')}
            actions={
              <DialogClose asChild>
                <Button variant="outlined" fullWidth className="sm:w-auto">
                  {t('ui.close')}
                </Button>
              </DialogClose>
            }
          >
            <pre className="max-h-80 overflow-auto rounded-lg bg-surface-container p-4 text-body-small whitespace-pre-wrap break-all">{JSON.stringify(open, null, 2)}</pre>
          </DialogContent>
        )}
      </Dialog>
    </AdminShell>
  );
}

