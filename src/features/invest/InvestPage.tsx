import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import brokersJson from '@/data/brokers.json';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { MetaChips } from '@/components/ui/MetaChips';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { guideOfModule } from '@/features/learning/questions';
import { SourceList } from '@/features/learning/SourceList';
import { INVESTOR_PROFILE_ROUTE, UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, MISSIONS, useLevels } from '@/features/levels/use-levels';
import { Chart } from '@/features/simulators/GenericSimulator';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { WalletError } from '@/features/wallet/engine/engine';
import type { Trade } from '@/features/wallet/engine/types';
import { formatDate, walletDate } from '@/lib/dates';
import { D } from '@/lib/finance';
import { formatMoney, formatPercent, parseDecimalInput } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { readLocal } from '@/store/local-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { BROKER_NAME, buy, buyPreview, fundBrokerage, instrumentById, INSTRUMENTS, openBrokerage, portfolioValue, positions, quote, sell, withdrawBrokerage } from './engine';

/**
 * P8, Invertir (level 7, CLAUDE.md 5.4, SIM-14, D-186): the practice brokerage account at a
 * fictitious broker. Open it with the educational profile (D-67), fund it from the wallet, look at
 * each instrument's standard sheet (risk, liquidity, currency), buy and sell with example costs and
 * settlement, and follow the holding over time with a synthetic example series. Real brokers only
 * appear in the informative sheet of Annex C, with the link to the CNV registry.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const ICON: Record<string, IconName> = { cedear: 'stacked_line_chart', fund: 'savings', bond: 'account_balance' };
const RISK_TONE = { low: 'success', medium: 'info', high: 'warning' } as const;

function useInvestGate() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { statuses, isOpen } = useLevels(user?.personId ?? '');
  const status = statuses.find((s) => s.level.id === 'level-7');
  if (status && !isOpen('level-7')) {
    return (
      <WalletShell section={t('wallet.nav.invest')} fuerte={{ state: 'thinking', message: t('invest.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.placeholder.lockedTitle', { section: t('wallet.nav.invest') })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }
  return null;
}

export function InvestPage() {
  const gate = useInvestGate();
  return gate ?? <Invest />;
}

export function InstrumentPage() {
  const gate = useInvestGate();
  return gate ?? <Instrument />;
}

function Fact({ label, children, tone = 'neutral', icon }: { label: string; children: React.ReactNode; tone?: 'neutral' | 'primary' | 'warning' | 'success'; icon?: IconName }) {
  const box = { neutral: 'bg-surface-container text-on-surface', primary: 'bg-primary-container text-on-primary-container', warning: 'bg-warning-container text-on-warning-container', success: 'bg-success-container text-on-success-container' }[tone];
  const iconColor = { neutral: 'text-on-surface-variant', primary: 'text-primary', warning: 'text-warning', success: 'text-success' }[tone];
  return (
    <div className={cn('flex min-w-0 flex-col gap-1 rounded-lg p-3', box)}>
      <dt className="flex items-center gap-1 text-label-medium">
        {icon && <Icon name={icon} size={16} className={cn('shrink-0', iconColor)} />}
        {label}
      </dt>
      <dd className="text-title-medium tabular-nums">{children}</dd>
    </div>
  );
}

/** The standard sheet of an instrument (1.1.1): risk, liquidity and currency, always visible. */
function InstrumentSheet({ instrumentId }: { instrumentId: string }) {
  const { t } = useTranslation();
  const def = instrumentById(instrumentId)!;
  return (
    <ul className="flex flex-wrap gap-2" aria-label={t('invest.sheet.label')}>
      <li>
        <StatusPill tone={RISK_TONE[def.risk as keyof typeof RISK_TONE]} icon={def.risk === 'high' ? 'warning' : 'shield'} label={t(`invest.sheet.risk.${def.risk}`)} />
      </li>
      <li>
        <StatusPill tone="neutral" icon="schedule" label={t(`invest.sheet.liquidity.${def.liquidity}`)} />
      </li>
      <li>
        <StatusPill tone="neutral" icon="payments" label={t(`invest.sheet.currency.${def.currency}`)} />
      </li>
    </ul>
  );
}

function errorText(t: (key: string) => string, error: unknown) {
  return error instanceof WalletError ? t(`invest.errors.${error.message}`) : t('pay.errors.unknown');
}

// ---------------------------------------------------------------- Main page

function Invest() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [wallet] = useWallet(personId);
  const account = wallet.brokerage;

  return (
    <WalletShell section={t('wallet.nav.invest')} fuerte={{ state: 'neutral', message: account ? t('invest.fuerte.home') : t('invest.fuerte.open'), why: t('invest.why') }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.nav.invest')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('invest.intro')}</p>
          <MetaChips
            label={t('invest.context')}
            items={[
              { icon: 'calendar_month', label: formatDate(walletDate(wallet.day)), dateTime: walletDate(wallet.day) },
              { icon: 'account_balance', label: t('invest.brokerChip', { name: BROKER_NAME }) },
              ...(account ? [{ icon: 'psychology' as IconName, label: t('invest.profileChip', { profile: t(`invest.profile.${account.profile}`) }) }] : []),
            ]}
          />
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)] large:items-start">
          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            {account ? <AccountSection /> : <OpenSection />}
            <section aria-labelledby="instruments-title" className={card}>
              <h2 id="instruments-title" className="text-title-large text-on-surface">
                {t('invest.instruments.title')}
              </h2>
              <p className="text-body-medium text-on-surface-variant">{t('invest.instruments.intro')}</p>
              <ul className="flex flex-col divide-y divide-outline-variant">
                {INSTRUMENTS.map((i) => (
                  <li key={i.id}>
                    <Link to={`/app/invest/${i.id}`} className="group flex items-start gap-3 py-4 hover:bg-surface-container">
                      <IconTile icon={ICON[i.kind] ?? 'trending_up'} tone="secondary" size="sm" />
                      <span className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="text-body-large text-on-surface">{t(`invest.instrument.${i.id}.name`)}</span>
                        <InstrumentSheet instrumentId={i.id} />
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <MoneyText value={quote(wallet, i.id).price} className="text-title-medium text-on-surface" />
                        <span className="text-body-small text-on-surface-variant">{t('invest.instruments.perUnit')}</span>
                      </span>
                      <Icon name="chevron_right" size={20} className="mt-2 shrink-0 text-on-surface-variant" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            <BrokersSection />
            <LearnSection />
          </div>
        </div>
        <SourceList variant="footer" codes={['T', 'A-53', 'A-54', 'B-20', 'B-21', 'B-22', 'B-26', 'B-30', 'B-31', 'B-34', 'B-36', 'F-32', 'F-33', 'F-34']} legalText={t('invest.legal')} />
      </div>
    </WalletShell>
  );
}

/** Opening the practice account (A-54): verify, identity (simulated), profile and funding. */
function OpenSection() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [wallet, setWallet] = useWallet(personId);
  const profile = readLocal(personId).investorProfile;
  const steps: { key: string; done: boolean }[] = [
    { key: 'verify', done: true },
    { key: 'identity', done: true },
    { key: 'profile', done: Boolean(profile) },
    { key: 'fund', done: false },
  ];
  return (
    <section aria-labelledby="open-title" className={cn(card, 'border-primary')}>
      <div className="flex items-center gap-3">
        <IconTile icon="account_balance" tone="primary" />
        <div className="min-w-0">
          <h2 id="open-title" className="text-title-large text-on-surface">
            {t('invest.open.title')}
          </h2>
          <p className="text-body-small text-on-surface-variant">{t('invest.open.broker', { name: BROKER_NAME })}</p>
        </div>
      </div>
      <p className="text-body-medium text-on-surface-variant">{t('invest.open.intro')}</p>
      <ol className="flex flex-col gap-3">
        {steps.map((s, index) => (
          <li key={s.key} className="flex items-start gap-3">
            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-label-medium', s.done ? 'bg-success-container text-on-success-container' : 'bg-surface-container text-on-surface-variant')}>
              {s.done ? <Icon name="check" size={16} /> : index + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-body-medium text-on-surface">{t(`invest.open.steps.${s.key}.title`)}</span>
              <span className="text-body-small text-on-surface-variant">{t(`invest.open.steps.${s.key}.body`)}</span>
            </span>
          </li>
        ))}
      </ol>
      {!profile && (
        <InlineAlert tone="info" live="none" action={<Link to={INVESTOR_PROFILE_ROUTE} className="text-label-large text-primary underline underline-offset-4">{t('invest.open.takeTest')}</Link>}>
          {t('invest.open.noProfile')}
        </InlineAlert>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          leadingIcon="account_balance"
          onClick={() => {
            setWallet(() => openBrokerage(wallet, profile ?? 'moderate'));
            toast.success(t('invest.open.done'));
          }}
        >
          {t('invest.open.button')}
        </Button>
        <Button asChild variant="tonal" leadingIcon="flag">
          <Link to="/app/missions/mission-broker-account">{t('invest.open.mission')}</Link>
        </Button>
      </div>
    </section>
  );
}

/** The account: value, cash, holdings and transfers with the wallet. */
function AccountSection() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [amount, setAmount] = useState('');
  const [failure, setFailure] = useState<string | undefined>();
  const value = portfolioValue(wallet);
  const list = positions(wallet);
  const gain = value.result.gte(0);

  const move = (kind: 'in' | 'out') => {
    setFailure(undefined);
    const parsed = parseDecimalInput(amount);
    if (!parsed || D(parsed).lte(0)) {
      setFailure(t('invest.transfer.missing'));
      return;
    }
    try {
      setWallet(() => (kind === 'in' ? fundBrokerage(wallet, parsed) : withdrawBrokerage(wallet, parsed)));
      setAmount('');
      toast.success(t(kind === 'in' ? 'invest.transfer.funded' : 'invest.transfer.withdrawn', { amount: formatMoney(parsed) }));
    } catch (error) {
      setFailure(errorText(t, error));
    }
  };

  return (
    <section aria-labelledby="account-title" className={cn(card, '@container border-primary')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconTile icon="trending_up" tone="primary" />
          <div className="min-w-0">
            <h2 id="account-title" className="text-title-large text-on-surface">
              {t('invest.account.title')}
            </h2>
            <p className="text-body-small text-on-surface-variant">{t('invest.account.custody')}</p>
          </div>
        </div>
        <StatusPill tone="neutral" icon="info" label={t('invest.account.practice')} />
      </div>
      <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 @md:grid-cols-3">
        <Fact label={t('invest.account.total')} tone="primary">
          <MoneyText value={value.total} />
        </Fact>
        <Fact label={t('invest.account.cash')}>
          <MoneyText value={value.cash} />
        </Fact>
        <Fact label={t('invest.account.result')} tone={value.cost.isZero() ? 'neutral' : gain ? 'success' : 'warning'} icon={value.cost.isZero() ? undefined : gain ? 'trending_up' : 'trending_down'}>
          <MoneyText value={value.result} trend={!value.cost.isZero()} />
        </Fact>
      </dl>
      {!value.cost.isZero() && !gain && <InlineAlert tone="warning" live="none">{t('invest.account.paperLoss')}</InlineAlert>}

      <h3 className="text-title-medium text-on-surface">{t('invest.holdings.title')}</h3>
      {list.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('invest.holdings.empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant">
          {list.map((p) => (
            <li key={p.instrumentId} className="flex flex-col gap-2 py-3 @md:flex-row @md:items-center @md:justify-between">
              <div className="flex min-w-0 flex-col gap-1.5">
                <Link to={`/app/invest/${p.instrumentId}`} className="text-body-large text-primary underline-offset-4 hover:underline">
                  {t(`invest.instrument.${p.instrumentId}.name`)}
                </Link>
                <MetaChips
                  label={t('invest.holdings.data')}
                  items={[
                    { icon: 'inventory_2', label: t('invest.holdings.units', { count: p.quantity }) },
                    { icon: 'payments', label: t('invest.holdings.paid', { amount: formatMoney(p.cost) }) },
                  ]}
                />
                {p.pending > 0 && <StatusPill tone="info" icon="schedule" label={t('invest.holdings.pending', { count: p.pending })} className="self-start" />}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 @md:flex-col @md:items-end">
                <MoneyText value={p.value} className="text-title-medium text-on-surface" />
                <StatusPill
                  tone={p.result.gte(0) ? 'success' : 'warning'}
                  icon={p.result.gte(0) ? 'trending_up' : 'trending_down'}
                  label={`${formatMoney(p.result, { sign: 'always' })} (${formatPercent(p.resultRate, { decimals: 1, sign: 'always' })})`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="border-t border-outline-variant pt-4 text-title-medium text-on-surface">{t('invest.transfer.title')}</h3>
      <p className="text-body-medium text-on-surface-variant">
        {t('invest.transfer.walletBalance')} <MoneyText value={wallet.balance} />
      </p>
      <MoneyInput label={t('invest.transfer.amount')} helperText={t('invest.transfer.help')} value={amount} onChange={(e) => setAmount(e.target.value)} />
      {failure && <InlineAlert tone="info">{failure}</InlineAlert>}
      <div className="flex flex-wrap gap-3">
        <Button leadingIcon="arrow_forward" onClick={() => move('in')}>
          {t('invest.transfer.fund')}
        </Button>
        <Button variant="outlined" leadingIcon="arrow_back" onClick={() => move('out')}>
          {t('invest.transfer.withdraw')}
        </Button>
      </div>
    </section>
  );
}

/** Annex C: an informative sheet of registered ALyC, alphabetical, with no logos, rates or ranking. */
function BrokersSection() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="brokers-title" className={card}>
      <h2 id="brokers-title" className="text-title-large text-on-surface">
        {t('invest.brokers.title')}
      </h2>
      <InlineAlert tone="info" live="none">
        {t('invest.brokers.intro')}
      </InlineAlert>
      <ul className="flex flex-col divide-y divide-outline-variant">
        {[...brokersJson].sort((a, b) => a.nombreComercial.localeCompare(b.nombreComercial, 'es')).map((b) => (
          <li key={b.matricula} className="flex flex-col gap-1.5 py-3">
            <span className="text-body-large text-on-surface">{b.nombreComercial}</span>
            <span className="text-body-small text-on-surface-variant">{b.razonSocial}</span>
            <StatusPill tone="neutral" icon="badge" label={t('invest.brokers.registration', { category: b.categoria, number: b.matricula })} className="self-start" />
            {'nota' in b && b.nota && <p className="text-body-small text-on-surface-variant">{b.nota}</p>}
          </li>
        ))}
      </ul>
      <p className="text-body-small text-on-surface-variant">{t('invest.brokers.verified', { date: formatDate(brokersJson[0]!.verificadoEl) })}</p>
      <Button asChild variant="tonal" trailingIcon="open_in_new" className="self-start">
        <a href="https://www.cnv.gov.ar/sitioWeb/RegistrosPublicos/Agentes" target="_blank" rel="noopener noreferrer">
          {t('invest.brokers.cnv')}
          <span className="sr-only"> {t('learn.sources.newTab')}</span>
        </a>
      </Button>
    </section>
  );
}

function LearnSection() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { wallet } = useLevels(personId);
  const allMissions = useDataStore((s) => s.missionCompletions);
  const allGuides = useDataStore((s) => s.guideProgress);
  const level = LEVELS.find((l) => l.id === 'level-7')!;
  const missionDone = (id: string) => wallet.completedMissionIds.includes(id) || allMissions.some((m) => m.personId === personId && m.missionId === id);
  const guideDone = (id: string) => allGuides.some((g) => g.personId === personId && g.guideIdsDone.includes(id));
  const rows: { to: string; icon: IconName; done: boolean; title: string; meta: string }[] = [
    ...level.guideModuleIds.flatMap((moduleId) => {
      const guide = guideOfModule(moduleId);
      return guide ? [{ to: `/app/learn/guides/${guide.id}`, icon: 'menu_book' as IconName, done: guideDone(guide.id), title: guide.title, meta: t('pay.learn.guideMeta', { minutes: guide.minutes }) }] : [];
    }),
    ...MISSIONS.filter((m) => m.levelId === 'level-7').map((m) => ({ to: `/app/missions/${m.id}`, icon: 'flag' as IconName, done: missionDone(m.id), title: m.title, meta: t('pay.learn.missionMeta', { minutes: m.minutes }) })),
    ...level.toolSimIds.map((id) => ({ to: `/app/tools/${id}`, icon: 'calculate' as IconName, done: false, title: t(`sims.${id}.title`), meta: t('yield.learn.tool') })),
  ];
  return (
    <section aria-labelledby="invest-learn" className={card}>
      <h2 id="invest-learn" className="text-title-large text-on-surface">
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

// ---------------------------------------------------------------- Instrument page

function Instrument() {
  const { instrumentId = '' } = useParams();
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [quantity, setQuantity] = useState('1');
  const [settlement, setSettlement] = useState<Trade['settlement']>('ci');
  const [failure, setFailure] = useState<string | undefined>();
  const [confirm, setConfirm] = useState<'buy' | 'sell' | undefined>();
  const [showTable, setShowTable] = useState(false);
  const def = instrumentById(instrumentId);
  if (!def) return <NotFoundPage />;
  const account = wallet.brokerage;
  const q = quote(wallet, def.id);
  const units = Number(quantity);
  const validUnits = Number.isInteger(units) && units > 0;
  const preview = validUnits ? buyPreview(wallet, def.id, units) : undefined;
  const position = positions(wallet).find((p) => p.instrumentId === def.id);

  // Price since the account was opened (or the last 6 months), one point per month: an example series.
  const from = account ? account.openedDay : Math.max(0, wallet.day - 180);
  // Only up to today: the series is never shown ahead of time.
  const monthly = Array.from({ length: Math.floor((wallet.day - from) / 30) + 1 }, (_, k) => from + k * 30);
  const points = monthly.at(-1) === wallet.day ? monthly : [...monthly, wallet.day];
  const data = points.map((day) => ({ month: formatDate(walletDate(day)).slice(3), price: Number(quote(wallet, def.id, day).price.toFixed(2)) }));
  const first = data[0]!.price;
  const last = data[data.length - 1]!.price;

  const run = (action: () => void, done: string) => {
    setFailure(undefined);
    try {
      action();
      toast.success(done);
    } catch (error) {
      setFailure(errorText(t, error));
    }
  };

  return (
    <WalletShell section={t('wallet.nav.invest')} fuerte={{ state: def.risk === 'high' ? 'attention' : 'neutral', message: t(`invest.fuerte.${def.risk}`) }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <Link to="/app/invest" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
            <Icon name="arrow_back" size={18} />
            {t('invest.back')}
          </Link>
          <h1 className="text-headline-medium text-on-surface">{t(`invest.instrument.${def.id}.name`)}</h1>
          <p className="text-body-large text-on-surface-variant">{t(`invest.instrument.${def.id}.body`)}</p>
          <InstrumentSheet instrumentId={def.id} />
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)] large:items-start">
          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            <section aria-labelledby="price-title" className={cn(card, '@container')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 id="price-title" className="text-title-large text-on-surface">
                  {t('invest.price.title')}
                </h2>
                <StatusPill tone="neutral" icon="info" label={t('invest.price.example')} />
              </div>
              <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 @md:grid-cols-2">
                <Fact label={t('invest.price.today', { date: formatDate(walletDate(wallet.day)) })} tone="primary">
                  <MoneyText value={q.price} />
                </Fact>
                {q.usdPrice && (
                  <Fact label={t('invest.price.formulaShort')}>
                    <span className="text-body-medium">
                      {formatMoney(q.usdPrice, { currency: 'USD' })} ÷ {q.ratio!.toString()} × {formatMoney(q.impliedFx!)}
                    </span>
                  </Fact>
                )}
              </dl>
              {q.usdPrice && <InlineAlert tone="info" live="none">{t('invest.price.cedear')}</InlineAlert>}
              <div className="flex flex-col gap-2">
                <h3 className="text-title-medium text-on-surface">{t('invest.price.chartTitle')}</h3>
                {data.length >= 2 && (
                  <p className="text-body-medium text-on-surface-variant">
                    {t(last >= first ? 'invest.price.up' : 'invest.price.down', { from: formatMoney(String(first)), to: formatMoney(String(last)) })}
                  </p>
                )}
                {data.length < 2 ? (
                  <InlineAlert tone="info" live="none">
                    {t('invest.price.noHistory')}
                  </InlineAlert>
                ) : (
                  <Chart chart={{ kind: 'area', title: '', conclusion: '', xKey: 'month', series: [{ key: 'price', label: t('invest.price.unit') }], data, currency: 'ARS' }} />
                )}
                <Button variant="text" size="xs" leadingIcon="table_view" className={cn('self-start', data.length < 2 && 'hidden')} onClick={() => setShowTable((v) => !v)} aria-expanded={showTable}>
                  {showTable ? t('invest.price.hideTable') : t('invest.price.showTable')}
                </Button>
                {showTable && (
                  <table className="w-full text-body-small tabular-nums">
                    <thead>
                      <tr className="text-left text-on-surface-variant">
                        <th className="py-1 font-medium">{t('invest.price.month')}</th>
                        <th className="py-1 text-right font-medium">{t('invest.price.unit')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((d) => (
                        <tr key={d.month} className="border-t border-outline-variant">
                          <td className="py-1">{d.month}</td>
                          <td className="py-1 text-right">{formatMoney(String(d.price))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <p className="text-body-small text-on-surface-variant">{t('invest.price.past')}</p>
              </div>
            </section>
          </div>

          <section aria-labelledby="order-title" className={cn(card, '@container')}>
            <h2 id="order-title" className="text-title-large text-on-surface">
              {t('invest.order.title')}
            </h2>
            {!account ? (
              <InlineAlert tone="info" live="none" action={<Link to="/app/invest" className="text-label-large text-primary underline underline-offset-4">{t('invest.order.openLink')}</Link>}>
                {t('invest.order.noAccount')}
              </InlineAlert>
            ) : (
              <>
                <p className="text-body-medium text-on-surface-variant">
                  {t('invest.order.cash')} <MoneyText value={account.cash} />
                </p>
                <TextField
                  label={t('invest.order.quantity')}
                  helperText={t('invest.order.quantityHelp')}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ''))}
                  error={quantity !== '' && !validUnits ? t('invest.order.quantityError') : undefined}
                />
                <div className="flex flex-col gap-2">
                  <span aria-hidden className="text-label-large text-on-surface">
                    {t('invest.order.settlement')}
                  </span>
                  <SegmentedButton
                    label={t('invest.order.settlement')}
                    value={settlement}
                    onValueChange={setSettlement}
                    options={[
                      { value: 'ci', label: t('invest.order.ci') },
                      { value: '24h', label: t('invest.order.24h') },
                    ]}
                  />
                  <p className="text-body-small text-on-surface-variant">{t(`invest.order.${settlement}Help`)}</p>
                </div>
                {preview && (
                  <dl className="grid grid-cols-[minmax(0,1fr)] gap-2" aria-live="polite">
                    {[
                      [t('invest.order.gross'), preview.gross],
                      [t('invest.order.commission'), preview.commission],
                      [t('invest.order.marketFee'), preview.marketFee],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex flex-wrap items-baseline justify-between gap-2">
                        <dt className="text-body-medium text-on-surface-variant">{String(label)}</dt>
                        <dd>
                          <MoneyText value={value as typeof preview.gross} className="text-body-medium text-on-surface" />
                        </dd>
                      </div>
                    ))}
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-outline-variant pt-2">
                      <dt className="text-title-small text-on-surface">{t('invest.order.total')}</dt>
                      <dd>
                        <MoneyText value={preview.totalCost} className="text-title-medium text-on-surface" />
                      </dd>
                    </div>
                  </dl>
                )}
                <p className="text-body-small text-on-surface-variant">{t('invest.order.costsNote')}</p>
                {failure && <InlineAlert tone="info">{failure}</InlineAlert>}
                <div className="flex flex-wrap gap-3">
                  <Button leadingIcon="add" disabled={!validUnits} onClick={() => setConfirm('buy')}>
                    {t('invest.order.buy')}
                  </Button>
                  <Button variant="outlined" leadingIcon="remove" disabled={!validUnits || !position || position.settled < units} onClick={() => setConfirm('sell')}>
                    {t('invest.order.sell')}
                  </Button>
                </div>
                {position && (
                  <p className="text-body-small text-on-surface-variant">{t('invest.order.youHave', { count: position.settled, pending: position.pending > 0 ? t('invest.holdings.pending', { count: position.pending }).replace(/^/, ' · ') : '' })}</p>
                )}
              </>
            )}
          </section>
        </div>
        <SourceList variant="footer" codes={def.kind === 'cedear' ? ['B-30', 'B-31', 'B-32', 'B-33', 'B-34', 'B-36', 'F-20', 'F-32', 'F-33'] : def.kind === 'fund' ? ['B-14', 'B-25', 'B-26', 'F-34'] : ['B-25', 'B-34', 'F-34']} legalText={t('invest.legal')} />
      </div>
      {confirm && preview && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirm(undefined)}
          title={t(confirm === 'buy' ? 'invest.order.confirmBuyTitle' : 'invest.order.confirmSellTitle', { count: units })}
          description={
            confirm === 'buy'
              ? t('invest.order.confirmBuyBody', { total: formatMoney(preview.totalCost), settlement: t(`invest.order.${settlement}`) })
              : t('invest.order.confirmSellBody', { total: formatMoney(preview.gross.minus(preview.commission).minus(preview.marketFee)) })
          }
          confirmLabel={t(confirm === 'buy' ? 'invest.order.buy' : 'invest.order.sell')}
          destructive={false}
          onConfirm={() =>
            confirm === 'buy'
              ? run(() => setWallet(() => buy(wallet, def.id, units, settlement)), t('invest.order.bought'))
              : run(() => setWallet(() => sell(wallet, def.id, units)), t('invest.order.sold'))
          }
        />
      )}
    </WalletShell>
  );
}
