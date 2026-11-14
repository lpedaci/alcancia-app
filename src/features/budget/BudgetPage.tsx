import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { MetaChips } from '@/components/ui/MetaChips';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { toast } from '@/components/ui/toast-store';
import { guideOfModule } from '@/features/learning/questions';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, MISSIONS, useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import { CATEGORIZABLE, categorize, DAYS_IN_MONTH, monthBreakdown, monthOf } from '@/features/wallet/engine/engine';
import type { BudgetCategory } from '@/features/wallet/engine/types';
import { formatDate, walletDate } from '@/lib/dates';
import { budgetSplit, type BudgetRule, D, type Decimal } from '@/lib/finance';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { fuerteLine } from '@/features/companion/fuerte-lines';

/**
 * P4, Presupuesto (level 3, CLAUDE.md 5.3, D-174): the month in progress against a reference split
 * (50/30/20 or 70/20/10, A-32, A-33) presented as a starting point and never as a rule, the three
 * checks of a green month (wallet-engine.md, section 8), the movements left to categorize and the
 * closed months. The split works as SIM-1 with the person's own wallet data.
 */
const CATEGORIES: BudgetCategory[] = ['needs', 'wants', 'savings'];
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function BudgetPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, isOpen } = useLevels(personId);
  const status = statuses.find((s) => s.level.id === 'level-3');
  if (status && !isOpen('level-3')) {
    return (
      <WalletShell section={t('wallet.sub.budget')} fuerte={{ state: 'thinking', message: fuerteLine('budget.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.placeholder.lockedTitle', { section: t('wallet.sub.budget') })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }
  return <Budget />;
}

const pct = (part: Decimal | string, whole: Decimal | string) => (D(whole).gt(0) ? formatPercent(D(part).div(whole), { decimals: 0 }) : formatPercent(0, { decimals: 0 }));

function Budget() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [wallet, setWallet] = useWallet(personId);
  const { wallet: levelWallet } = useLevels(personId);
  const allMissions = useDataStore((s) => s.missionCompletions);
  const allGuides = useDataStore((s) => s.guideProgress);
  const [rule, setRule] = useState<BudgetRule>('50/30/20');
  const [asTable, setAsTable] = useState(false);

  const month = Math.max(0, monthOf(wallet.day));
  const b = monthBreakdown(wallet, month);
  const reference = budgetSplit({ income: b.income, rule });
  const spentWants = b.wants.plus(b.unclassified);
  const actual: Record<BudgetCategory, Decimal> = { needs: b.needs, wants: spentWants, savings: b.saved };
  const target: Record<BudgetCategory, Decimal> = { needs: reference.needs, wants: reference.wants, savings: reference.savings };
  const firstDay = month * DAYS_IN_MONTH + 1;
  const level = LEVELS.find((l) => l.id === 'level-3')!;
  const guide = guideOfModule(level.guideModuleIds[0]!);
  const mission = MISSIONS.find((m) => m.levelId === 'level-3');
  const missionDone = mission ? levelWallet.completedMissionIds.includes(mission.id) || allMissions.some((m) => m.personId === personId && m.missionId === mission.id) : false;
  const guideDone = guide ? allGuides.some((g) => g.personId === personId && g.guideIdsDone.includes(guide.id)) : false;

  const toCategorize = wallet.movements
    .filter((m) => m.day >= firstDay && CATEGORIZABLE.includes(m.type) && !m.category)
    .slice(-6)
    .reverse();

  // Conclusion of the chart (2.10): the category furthest above its reference, or "within".
  const over = CATEGORIES.filter((c) => c !== 'savings' && actual[c].gt(target[c]));
  const conclusion = b.income.lte(0)
    ? t('budget.split.noIncome')
    : over.length
      ? t('budget.split.over', { category: t(`budget.cat.${rule}.${over[0]}`), actual: pct(actual[over[0]!], b.income), reference: pct(target[over[0]!], b.income) })
      : t('budget.split.within', { saved: pct(b.saved, b.income) });

  const checks = [
    { key: 'withinIncome', met: b.checks.withinIncome },
    { key: 'savedTenPercent', met: b.checks.savedTenPercent },
    { key: 'savingsKept', met: b.checks.savingsKept },
  ];

  return (
    <WalletShell section={t('wallet.sub.budget')} fuerte={{ state: b.green ? 'celebration' : 'neutral', message: b.green ? fuerteLine('budget.fuerte.green') : fuerteLine('budget.fuerte.home'), why: t('wallet.fuerte.why.budget') }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.sub.budget')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('budget.intro')}</p>
          <MetaChips
            label={t('budget.context')}
            items={[
              { icon: 'calendar_month', label: t('budget.monthRange', { from: formatDate(walletDate(firstDay)), to: formatDate(walletDate(firstDay + DAYS_IN_MONTH - 1)) }) },
              { icon: 'today', label: t('wallet.home.dayChip', { day: wallet.day }) },
            ]}
          />
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] large:items-start">
          {/* The split of the month against the reference (SIM-1 with the wallet's data) */}
          <section aria-labelledby="split-title" className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 id="split-title" className="text-title-large text-on-surface">
                {t('budget.split.title')}
              </h2>
              <SegmentedButton
                label={t('budget.split.rule')}
                value={rule}
                onValueChange={(v) => v && setRule(v as BudgetRule)}
                options={[
                  { value: '50/30/20', label: '50/30/20' },
                  { value: '70/20/10', label: '70/20/10' },
                ]}
              />
            </div>
            <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
              {[
                ['income', b.income],
                ['spent', b.needs.plus(spentWants)],
                ['saved', b.saved],
              ].map(([key, value]) => (
                <div key={key as string} className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
                  <dt className="text-label-medium text-on-surface-variant">{t(`budget.totals.${key}`)}</dt>
                  <dd className="text-title-large text-on-surface">
                    <MoneyText value={(value as Decimal).toFixed(2)} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-body-large text-on-surface" aria-live="polite">
              {conclusion}
            </p>
            {asTable ? (
              <TableContainer label={t('budget.split.title')}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>{t('budget.split.category')}</TableHeaderCell>
                      <TableHeaderCell className="text-right">{t('budget.split.actual')}</TableHeaderCell>
                      <TableHeaderCell className="text-right">{t('budget.split.share')}</TableHeaderCell>
                      <TableHeaderCell className="text-right">{t('budget.split.reference')}</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {CATEGORIES.map((c) => (
                      <TableRow key={c}>
                        <TableCell>{t(`budget.cat.${rule}.${c}`)}</TableCell>
                        <TableCell className="text-right">
                          <MoneyText value={actual[c].toFixed(2)} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{pct(actual[c], b.income)}</TableCell>
                        <TableCell className="text-right">
                          <MoneyText value={target[c].toFixed(2)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <ul className="flex flex-col gap-5">
                {CATEGORIES.map((c, i) => {
                  const share = b.income.gt(0) ? Math.min(1, actual[c].div(b.income).toNumber()) : 0;
                  const ref = b.income.gt(0) ? target[c].div(b.income).toNumber() : 0;
                  const above = c !== 'savings' && actual[c].gt(target[c]);
                  return (
                    <li key={c} className="flex flex-col gap-2">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="text-title-small text-on-surface">{t(`budget.cat.${rule}.${c}`)}</span>
                        <span className="text-label-large text-on-surface tabular-nums">
                          <MoneyText value={actual[c].toFixed(2)} /> · {pct(actual[c], b.income)}
                        </span>
                      </p>
                      {/* Bar with the reference as a tick; series colors, never status colors (2.1.1) */}
                      <div className="relative h-3 rounded-full bg-surface-container-high" aria-hidden>
                        <div
                          className={cn(
                            'h-full rounded-full transition-[width] duration-300 ease-standard motion-reduce:transition-none',
                            i === 0 ? 'bg-primary' : i === 1 ? 'bg-chart-3' : 'bg-tertiary',
                          )}
                          style={{ width: `${share * 100}%` }}
                        />
                        <span className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-on-surface" style={{ left: `calc(${ref * 100}% - 1px)` }} />
                      </div>
                      <p className="flex flex-wrap items-center gap-x-2 text-body-small text-on-surface-variant">
                        {t('budget.split.referenceLine', { share: pct(target[c], b.income) })}
                        {above && (
                          <span className="inline-flex items-center gap-1 text-on-surface">
                            <Icon name="info" size={16} className="text-info" />
                            {t('budget.split.above')}
                          </span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4">
              <p className="text-body-small text-on-surface-variant">{t('budget.split.note')}</p>
              <Button variant="text" size="xs" leadingIcon={asTable ? 'bar_chart' : 'table_rows'} onClick={() => setAsTable(!asTable)}>
                {asTable ? t('welcome.result.asChart') : t('welcome.result.asTable')}
              </Button>
            </div>
          </section>

          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            {/* Green month: the three checks, each with icon and text */}
            <section aria-labelledby="green-title" className={card}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="green-title" className="text-title-large text-on-surface">
                  {t('budget.green.title')}
                </h2>
                <StatusPill tone={b.green ? 'success' : 'info'} icon={b.green ? 'check_circle' : 'pending'} label={b.green ? t('budget.green.yes') : t('budget.green.notYet')} />
              </div>
              <ul className="flex flex-col gap-3">
                {checks.map((c) => (
                  <li key={c.key} className="flex items-start gap-3 text-body-medium text-on-surface">
                    <Icon name={c.met ? 'check_circle' : 'radio_button_unchecked'} size={20} filled={c.met} className={cn('mt-0.5 shrink-0', c.met ? 'text-success' : 'text-on-surface-variant')} />
                    <span>
                      {t(`budget.green.${c.key}`)}
                      <span className="sr-only">: {c.met ? t('wallet.mission.met') : t('wallet.mission.notMet')}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-body-small text-on-surface-variant">{t('budget.green.note')}</p>
            </section>

            <section aria-labelledby="learn-title" className={card}>
              <h2 id="learn-title" className="text-title-large text-on-surface">
                {t('pay.learn.title')}
              </h2>
              <div className="flex flex-col divide-y divide-outline-variant">
                {guide && (
                  <Link to={`/app/learn/guides/${guide.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-container">
                    <Icon name={guideDone ? 'check_circle' : 'menu_book'} filled={guideDone} className={guideDone ? 'text-success' : 'text-primary'} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-medium text-on-surface">{guide.title}</span>
                      <span className="block text-body-small text-on-surface-variant">{t('pay.learn.guideMeta', { minutes: guide.minutes })}</span>
                    </span>
                    <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
                  </Link>
                )}
                {mission && (
                  <Link to={`/app/missions/${mission.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-container">
                    <Icon name={missionDone ? 'check_circle' : 'flag'} filled={missionDone} className={missionDone ? 'text-success' : 'text-primary'} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-medium text-on-surface">{mission.title}</span>
                      <span className="block text-body-small text-on-surface-variant">
                        {t('pay.learn.missionMeta', { minutes: mission.minutes })}
                        {missionDone && ` · ${t('learn.map.done')}`}
                      </span>
                    </span>
                    <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
          {/* Movements left to categorize (they count for level 3 and for an accurate split) */}
          <section aria-labelledby="todo-title" className={card}>
            <h2 id="todo-title" className="text-title-large text-on-surface">
              {t('budget.todo.title')}
            </h2>
            {toCategorize.length === 0 ? (
              <p className="text-body-medium text-on-surface-variant">{t('budget.todo.empty')}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-outline-variant">
                {toCategorize.map((m) => (
                  <li key={m.id} className="flex flex-col gap-3 py-3">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="min-w-0">
                        <span className="block text-body-medium text-on-surface">{m.counterparty}</span>
                        <span className="block text-body-small text-on-surface-variant">
                          {formatDate(walletDate(m.day))}
                          {m.suggestedCategory && ` · ${t('budget.todo.suggested', { category: t(`budget.cat.50/30/20.${m.suggestedCategory}`) })}`}
                        </span>
                      </span>
                      <MoneyText value={m.amount} trend flow className="text-label-large" />
                    </span>
                    <span className="flex flex-wrap gap-2" role="group" aria-label={t('budget.todo.choose', { name: m.counterparty })}>
                      {CATEGORIES.map((c) => (
                        <Button
                          key={c}
                          variant={m.suggestedCategory === c ? 'tonal' : 'outlined'}
                          size="xs"
                          onClick={() => {
                            setWallet((w) => categorize(w, m.id, c));
                            toast.success(t('budget.todo.done'));
                          }}
                        >
                          {t(`budget.cat.50/30/20.${c}`)}
                        </Button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="months-title" className={card}>
            <h2 id="months-title" className="text-title-large text-on-surface">
              {t('budget.months.title')}
            </h2>
            {wallet.monthSummaries.length === 0 ? (
              <p className="text-body-medium text-on-surface-variant">{t('budget.months.empty')}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-outline-variant">
                {[...wallet.monthSummaries].reverse().map((s) => (
                  <li key={s.month} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block text-body-medium text-on-surface">
                        {t('budget.months.label', { from: formatDate(walletDate(s.month * DAYS_IN_MONTH + 1)), to: formatDate(walletDate((s.month + 1) * DAYS_IN_MONTH)) })}
                      </span>
                      <span className="block text-body-small text-on-surface-variant">
                        {t('budget.months.savedLine')} <MoneyText value={s.saved} /> · {pct(s.saved, s.income)}
                      </span>
                    </span>
                    <StatusPill tone={s.green ? 'success' : 'warning'} icon={s.green ? 'check_circle' : 'schedule'} label={s.green ? t('budget.green.yes') : t('profile.receipts.notGreen')} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </WalletShell>
  );
}
