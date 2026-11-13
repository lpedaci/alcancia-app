import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { MetaChips } from '@/components/ui/MetaChips';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { toast } from '@/components/ui/toast-store';
import { guideOfModule } from '@/features/learning/questions';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, MISSIONS, useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import {
  activeDeposits,
  DEPOSIT_TERMS,
  depositQuote,
  makeDeposit,
  monthOf,
  scenarioOf,
  setYieldMode,
  tnaOf,
  WalletError,
  yieldOfMonth,
} from '@/features/wallet/engine/engine';
import type { TermDeposit, YieldMode } from '@/features/wallet/engine/types';
import { formatDate, walletDate } from '@/lib/dates';
import { D, periodRate, realRate } from '@/lib/finance';
import { formatMoney, formatPercent, parseDecimalInput } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';

/**
 * P6, Ahorrar > Rendir (level 6, CLAUDE.md 5.3 "Hacer rendir el saldo" and "Ganarle o no a la
 * inflación", D-180): where the balance yields (none, remunerated account or money market fund, each
 * with its standard sheet: risk, liquidity, currency and protection), this month's yield against the
 * scenario's inflation (real rate, F-03), and practice fixed-term deposits, traditional and UVA
 * (F-08, F-09). Rates are the scenario's examples, never current values (1.1.1).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function YieldPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { statuses, isOpen } = useLevels(user?.personId ?? '');
  const status = statuses.find((s) => s.level.id === 'level-6');
  if (status && !isOpen('level-6')) {
    return (
      <WalletShell section={t('wallet.sub.yield')} fuerte={{ state: 'thinking', message: t('yield.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.placeholder.lockedTitle', { section: t('wallet.sub.yield') })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }
  return <Yield />;
}

const MODES: { mode: YieldMode; icon: IconName }[] = [
  { mode: 'none', icon: 'account_balance_wallet' },
  { mode: 'remunerated', icon: 'savings' },
  { mode: 'money_market', icon: 'stacked_line_chart' },
];

function Yield() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const scenario = scenarioOf(wallet);
  const month = Math.max(0, monthOf(wallet.day));
  const earned = yieldOfMonth(wallet, month);
  const tna = tnaOf(wallet, wallet.yieldMode);
  const real = tna ? realRate(periodRate(tna, 30), scenario.monthlyInflation) : D(scenario.monthlyInflation).neg().div(D(1).plus(scenario.monthlyInflation));
  const beats = real.gt(0);

  return (
    <WalletShell
      section={t('wallet.sub.yield')}
      fuerte={{ state: 'neutral', message: wallet.yieldMode === 'none' ? t('yield.fuerte.none') : t('yield.fuerte.home'), why: t('yield.why') }}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.sub.yield')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('yield.intro')}</p>
          <MetaChips
            label={t('yield.context')}
            items={[
              { icon: 'calendar_month', label: formatDate(walletDate(wallet.day)), dateTime: walletDate(wallet.day) },
              { icon: 'trending_up', label: t('yield.inflationChip', { value: formatPercent(scenario.monthlyInflation, { decimals: 1 }) }) },
            ]}
          />
        </header>

          {/* Where the balance yields: one standard sheet per option (1.1.1 "riesgo siempre visible") */}
          <section aria-labelledby="mode-title" className={cn(card, '@container border-primary')}>
            <h2 id="mode-title" className="text-title-large text-on-surface">
              {t('yield.mode.title')}
            </h2>
            <p className="text-body-medium text-on-surface-variant">{t('yield.mode.intro')}</p>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 @xl:grid-cols-3">
              {MODES.map(({ mode, icon }) => {
                const selected = wallet.yieldMode === mode;
                const rate = tnaOf(wallet, mode);
                return (
                  <li key={mode} className={cn('flex flex-col gap-3 rounded-lg border p-4', selected ? 'border-primary bg-primary-container/40' : 'border-outline-variant')}>
                    <span className="flex items-start justify-between gap-2">
                      <IconTile icon={icon} tone={selected ? 'primary' : 'secondary'} size="sm" />
                      {selected && <StatusPill tone="primary" icon="check" label={t('yield.mode.current')} />}
                    </span>
                    <h3 className="text-title-medium text-on-surface">{t(`yield.mode.${mode}.name`)}</h3>
                    <dl className="flex flex-col gap-2 text-body-small">
                      {(['rate', 'risk', 'liquidity', 'currency', 'protection'] as const).map((row) => (
                        <div key={row} className="flex flex-col">
                          <dt className="text-label-medium text-on-surface-variant">{t(`yield.sheet.${row}`)}</dt>
                          <dd className="text-on-surface">
                            {row === 'rate'
                              ? rate
                                ? t(mode === 'money_market' ? 'yield.sheet.rateVaries' : 'yield.sheet.rateValue', { value: formatPercent(rate, { decimals: 1 }) })
                                : t('yield.sheet.noRate')
                              : t(`yield.mode.${mode}.${row}`)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {!selected && (
                      <Button
                        variant="outlined"
                        size="xs"
                        className="mt-auto self-start"
                        onClick={() => {
                          setWallet((w) => setYieldMode(w, mode));
                          toast.success(t('yield.mode.changed', { name: t(`yield.mode.${mode}.name`) }));
                        }}
                      >
                        {t('yield.mode.choose')}
                        <span className="sr-only"> {t(`yield.mode.${mode}.name`)}</span>
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="text-body-small text-on-surface-variant">{t('yield.mode.note')}</p>
          </section>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)] large:items-start">
          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            <DepositSection />
          </div>

          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            {/* Ganarle o no a la inflación: real rate of a month with the chosen option (F-03, SIM-4) */}
            <section aria-labelledby="real-title" className={cn(card, '@container')}>
              <div className="flex items-start justify-between gap-3">
                <h2 id="real-title" className="text-title-large text-on-surface">
                  {t('yield.real.title')}
                </h2>
                <IconTile icon={beats ? 'trending_up' : 'trending_down'} tone={beats ? 'tertiary' : 'secondary'} size="sm" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-label-medium text-on-surface-variant">{t('yield.real.earned')}</p>
                <p className="text-display-small text-on-surface">
                  <MoneyText value={earned} compactBelow="xs" />
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-surface-container p-3">
                <p className="text-label-medium text-on-surface-variant">{t('yield.real.label')}</p>
                <p className="text-title-large text-on-surface tabular-nums">{formatPercent(real, { decimals: 2, sign: 'always' })}</p>
                {beats ? (
                  <StatusPill tone="success" icon="check_circle" label={t('yield.real.beats')} className="self-start" />
                ) : (
                  <StatusPill tone="warning" icon="trending_down" label={t('yield.real.loses')} className="self-start" />
                )}
              </div>
              <p className="text-body-medium text-on-surface-variant">
                {tna
                  ? t('yield.real.explain', { rate: formatPercent(periodRate(tna, 30), { decimals: 2 }), inflation: formatPercent(scenario.monthlyInflation, { decimals: 1 }) })
                  : t('yield.real.explainNone', { inflation: formatPercent(scenario.monthlyInflation, { decimals: 1 }) })}
              </p>
              <Button asChild variant="text" trailingIcon="arrow_forward" className="self-start">
                <Link to="/app/tools/SIM-4">{t('yield.real.simulate')}</Link>
              </Button>
            </section>
            <LearnSection />
          </div>
        </div>
        <p className="text-body-small text-on-surface-variant">{t('yield.legal')}</p>
      </div>
    </WalletShell>
  );
}

// ---------------------------------------------------------------- Fixed-term deposits

function DepositSection() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [kind, setKind] = useState<TermDeposit['kind']>('traditional');
  const [days, setDays] = useState<number>(30);
  const [amount, setAmount] = useState('');
  const [tried, setTried] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();
  const [confirm, setConfirm] = useState(false);
  const deposits = activeDeposits(wallet);
  const terms = DEPOSIT_TERMS[kind] as readonly number[];
  const term = terms.includes(days) ? days : terms[0]!;
  const parsed = parseDecimalInput(amount);
  const valid = parsed !== null && D(parsed).gt(0);
  const quote = valid ? depositQuote(wallet, kind, parsed, term) : undefined;

  const ask = () => {
    setTried(true);
    setFailure(undefined);
    if (!valid) return;
    if (D(parsed).gt(wallet.balance)) {
      setFailure(t('pay.errors.insufficient_balance'));
      return;
    }
    setConfirm(true);
  };
  const make = () => {
    try {
      setWallet(() => makeDeposit(wallet, kind, parsed!, term));
      setAmount('');
      setTried(false);
      toast.success(t('yield.deposit.made'));
    } catch (error) {
      setFailure(error instanceof WalletError ? t(`pay.errors.${error.message}`) : t('pay.errors.unknown'));
    }
  };

  return (
    <section aria-labelledby="deposit-title" className={cn(card, '@container')}>
      <div className="flex items-center gap-3">
        <IconTile icon="account_balance" tone="secondary" />
        <h2 id="deposit-title" className="text-title-large text-on-surface">
          {t('yield.deposit.title')}
        </h2>
      </div>
      <p className="text-body-medium text-on-surface-variant">{t('yield.deposit.intro')}</p>
      <RadioGroup
        name="deposit-kind"
        legend={t('yield.deposit.kind')}
        value={kind}
        onChange={(event) => {
          const next = event.target.value as TermDeposit['kind'];
          setKind(next);
          setDays(DEPOSIT_TERMS[next][0]);
        }}
        options={[
          { value: 'traditional', label: t('yield.deposit.traditional'), description: t('yield.deposit.traditionalHelp', { rate: formatPercent(scenarioOf(wallet).exampleRates.fixedTerm, { decimals: 1 }) }) },
          { value: 'uva', label: t('yield.deposit.uva'), description: t('yield.deposit.uvaHelp', { rate: formatPercent(scenarioOf(wallet).exampleRates.uvaExtra, { decimals: 1 }) }) },
        ]}
      />
      <div className="flex flex-col gap-2">
        <span aria-hidden className="text-label-large text-on-surface">
          {t('yield.deposit.term')}
        </span>
        <SegmentedButton
          label={t('yield.deposit.term')}
          value={String(term)}
          onValueChange={(value) => setDays(Number(value))}
          options={terms.map((d) => ({ value: String(d), label: t('yield.deposit.days', { count: d }) }))}
        />
      </div>
      <MoneyInput
        label={t('yield.deposit.amount')}
        helperText={t('yield.deposit.amountHelp')}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={tried && !valid ? t('yield.deposit.amountMissing') : undefined}
      />
      {quote && (
        <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 @md:grid-cols-2" aria-live="polite">
          <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
            <dt className="text-label-medium text-on-surface-variant">{t('yield.deposit.final', { count: term })}</dt>
            <dd className="text-title-medium text-on-surface">
              <MoneyText value={quote.final} />
            </dd>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
            <dt className="text-label-medium text-on-surface-variant">{t('yield.deposit.power')}</dt>
            <dd className="text-title-medium text-on-surface">
              <MoneyText value={quote.purchasingPower} />
            </dd>
          </div>
        </dl>
      )}
      <p className="text-body-small text-on-surface-variant">{t(kind === 'uva' ? 'yield.deposit.assumptionsUva' : 'yield.deposit.assumptions')}</p>
      {failure && <InlineAlert tone="info">{failure}</InlineAlert>}
      <div className="flex flex-wrap gap-3">
        <Button leadingIcon="lock_clock" onClick={ask}>
          {t('yield.deposit.make')}
        </Button>
        <Button asChild variant="text" trailingIcon="arrow_forward">
          <Link to="/app/tools/SIM-5">{t('yield.deposit.compare')}</Link>
        </Button>
      </div>

      <h3 className="border-t border-outline-variant pt-4 text-title-medium text-on-surface">{t('yield.deposit.active')}</h3>
      {deposits.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('yield.deposit.none')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant">
          {deposits.map((d) => (
            <li key={d.id} className="flex flex-col gap-1 py-3">
              <span className="text-body-medium text-on-surface">
                {t(`yield.deposit.${d.kind}`)} · {t('yield.deposit.days', { count: d.days })}
              </span>
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-body-small text-on-surface-variant">
                  <MoneyText value={d.amount} /> · {t('yield.deposit.maturity', { date: formatDate(walletDate(d.maturityDay)) })}
                </span>
                <span className="text-label-large text-on-surface">
                  {t('yield.deposit.atMaturity')} <MoneyText value={d.final ?? d.amount} />
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={t(`yield.deposit.confirmTitle_${kind}`)}
        description={t('yield.deposit.confirmBody', { amount: parsed ? formatMoney(parsed) : '', count: term, final: quote ? formatMoney(quote.final) : '' })}
        confirmLabel={t('yield.deposit.make')}
        destructive={false}
        onConfirm={make}
      />
    </section>
  );
}

// ---------------------------------------------------------------- Learn

function LearnSection() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { wallet } = useLevels(personId);
  const allMissions = useDataStore((s) => s.missionCompletions);
  const allGuides = useDataStore((s) => s.guideProgress);
  const level = LEVELS.find((l) => l.id === 'level-6')!;
  const missions = MISSIONS.filter((m) => m.levelId === 'level-6');
  const missionDone = (id: string) => wallet.completedMissionIds.includes(id) || allMissions.some((m) => m.personId === personId && m.missionId === id);
  const guideDone = (id: string) => allGuides.some((g) => g.personId === personId && g.guideIdsDone.includes(id));
  const rows: { to: string; icon: IconName; done: boolean; title: string; meta: string }[] = [
    ...level.guideModuleIds.flatMap((moduleId) => {
      const guide = guideOfModule(moduleId);
      return guide ? [{ to: `/app/learn/guides/${guide.id}`, icon: 'menu_book' as IconName, done: guideDone(guide.id), title: guide.title, meta: t('pay.learn.guideMeta', { minutes: guide.minutes }) }] : [];
    }),
    ...missions.map((m) => ({ to: `/app/missions/${m.id}`, icon: 'flag' as IconName, done: missionDone(m.id), title: m.title, meta: t('pay.learn.missionMeta', { minutes: m.minutes }) })),
    ...level.toolSimIds.map((id) => ({ to: `/app/tools/${id}`, icon: 'calculate' as IconName, done: false, title: id === 'SIM-3' ? t('sim3.title') : t(`sims.${id}.title`), meta: t('yield.learn.tool') })),
  ];

  return (
    <section aria-labelledby="yield-learn" className={card}>
      <h2 id="yield-learn" className="text-title-large text-on-surface">
        {t('pay.learn.title')}
      </h2>
      <div className="flex flex-col divide-y divide-outline-variant">
        {rows.map((row) => (
          <Link key={row.to} to={row.to} className="flex items-center gap-3 py-3 hover:bg-surface-container">
            <Icon name={row.done ? 'check_circle' : row.icon} filled={row.done} className={row.done ? 'text-success' : 'text-primary'} />
            <span className="min-w-0 flex-1">
              <span className="block text-body-medium text-on-surface">{row.title}</span>
              <span className="block text-body-small text-on-surface-variant">
                {row.meta}
                {row.done && ` · ${t('learn.map.done')}`}
              </span>
            </span>
            <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
          </Link>
        ))}
      </div>
    </section>
  );
}
