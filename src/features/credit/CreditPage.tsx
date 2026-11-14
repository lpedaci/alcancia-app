import { useEffect, useState } from 'react';
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
import { SourceList } from '@/features/learning/SourceList';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, MISSIONS, useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import {
  acceptLoan,
  activeDebts,
  type ActiveDebt,
  annualInflationOf,
  buyInCash,
  buyInInstallments,
  CARD_NAME,
  loanOffer,
  openPracticeCard,
  payCard,
  payOffPlan,
  PURCHASE_OFFER,
  statementLeft,
  WalletError,
} from '@/features/wallet/engine/engine';
import { formatDate, walletDate } from '@/lib/dates';
import { D, effectiveAnnualRate } from '@/lib/finance';
import { formatMoney, formatPercent, parseDecimalInput } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { fuerteLine } from '@/features/companion/fuerte-lines';

/**
 * P7, Pagar > Tarjeta y préstamos (level 5, CLAUDE.md 5.3 "Ofertas", D-56, D-178): the practice card
 * with a statement to pay in full, the minimum or another amount; an example loan offer with its CFT
 * shown before deciding (B-04); an offer in installments without interest or cash with a discount
 * (F-10); and the person's debts, ordered by snowball or avalanche, with the high-rate ones marked
 * because they keep Invertir closed (5.0). The lender, merchant and card are fictitious (1.1.1).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function CreditPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { statuses, isOpen } = useLevels(user?.personId ?? '');
  const status = statuses.find((s) => s.level.id === 'level-5');
  if (status && !isOpen('level-5')) {
    return (
      <WalletShell section={t('wallet.nav.pay')} fuerte={{ state: 'thinking', message: fuerteLine('credit.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.placeholder.lockedTitle', { section: t('wallet.sub.credit') })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }
  return <Credit />;
}

type Confirm = 'loan' | 'installments' | 'cash' | { payOff: ActiveDebt };

function Credit() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [wallet, setWallet] = useWallet(personId);
  const [confirm, setConfirm] = useState<Confirm | undefined>();

  // The practice card arrives with level 5 (wallet-engine.md, section 9).
  useEffect(() => {
    if (!wallet.card) setWallet((w) => openPracticeCard(w));
  }, [wallet.card, setWallet]);

  const debts = activeDebts(wallet);
  const highRate = debts.filter((d) => d.highRate).length;
  const offer = loanOffer(wallet);
  const loanActive = (wallet.plans ?? []).some((p) => p.kind === 'loan' && !p.closed && p.paid < p.count);
  const cashPrice = D(PURCHASE_OFFER.price).times(D(1).minus(PURCHASE_OFFER.cashDiscount));

  const run = (action: () => void, done: string) => {
    try {
      action();
      toast.success(done);
    } catch (error) {
      toast.info(error instanceof WalletError ? t(`pay.errors.${error.message}`) : t('pay.errors.unknown'));
    }
  };
  const onConfirm = () => {
    if (!confirm) return;
    if (confirm === 'loan') run(() => setWallet(() => acceptLoan(wallet)), t('credit.loan.accepted'));
    else if (confirm === 'installments') run(() => setWallet(() => buyInInstallments(wallet)), t('credit.purchase.boughtInstallments'));
    else if (confirm === 'cash') run(() => setWallet(() => buyInCash(wallet)), t('credit.purchase.boughtCash'));
    else run(() => setWallet(() => payOffPlan(wallet, confirm.payOff.id)), t('credit.debts.paidOff'));
  };
  const confirmText: Record<string, { title: string; body: string; label: string }> = {
    loan: { title: t('credit.loan.confirmTitle'), body: t('credit.loan.confirmBody', { installment: formatMoney(offer.installment), count: offer.months, received: formatMoney(offer.received) }), label: t('credit.loan.accept') },
    installments: { title: t('credit.purchase.confirmInstallmentsTitle'), body: t('credit.purchase.confirmInstallmentsBody'), label: t('credit.purchase.installments') },
    cash: { title: t('credit.purchase.confirmCashTitle'), body: t('credit.purchase.confirmCashBody', { amount: formatMoney(cashPrice) }), label: t('credit.purchase.cash') },
  };
  const confirmCopy =
    confirm === undefined
      ? undefined
      : typeof confirm === 'string'
        ? confirmText[confirm]!
        : { title: t('credit.debts.payOffTitle'), body: t('credit.debts.payOffBody', { name: confirm.payOff.name, amount: formatMoney(confirm.payOff.balance) }), label: t('credit.debts.payOff') };

  return (
    <WalletShell
      section={t('wallet.nav.pay')}
      fuerte={{ state: highRate > 0 ? 'attention' : 'neutral', message: highRate > 0 ? fuerteLine('credit.fuerte.debt') : fuerteLine('credit.fuerte.home'), why: t('credit.why') }}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <Link to="/app/pay" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
            <Icon name="arrow_back" size={18} />
            {t('pay.back')}
          </Link>
          <h1 className="text-headline-medium text-on-surface">{t('wallet.sub.credit')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('credit.intro')}</p>
          <MetaChips
            label={t('credit.context')}
            items={[
              { icon: 'calendar_month', label: formatDate(walletDate(wallet.day)), dateTime: walletDate(wallet.day) },
              { icon: 'credit_card', label: t('credit.debtCount', { count: debts.length }) },
            ]}
          />
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)] large:items-start">
          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            <CardStatementSection />

            {/* Loan offer: the CFT stands out, before the installment (B-04) */}
            <section aria-labelledby="loan-title" className={cn(card, '@container')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IconTile icon="request_quote" tone="secondary" />
                  <div className="min-w-0">
                    <h2 id="loan-title" className="text-title-large text-on-surface">
                      {t('credit.loan.title')}
                    </h2>
                    <p className="text-body-small text-on-surface-variant">{t('credit.loan.lender')}</p>
                  </div>
                </div>
                <StatusPill tone="neutral" icon="info" label={t('credit.example')} />
              </div>
              <p className="text-body-large text-on-surface">{t('credit.loan.body', { principal: formatMoney(offer.principal), count: offer.months, installment: formatMoney(offer.installment) })}</p>
              <MetaChips
                label={t('credit.loan.terms')}
                items={[
                  { icon: 'calendar_month', label: t('credit.loan.chipMonths', { count: offer.months }) },
                  { icon: 'payments', label: t('credit.loan.chipInstallment', { amount: formatMoney(offer.installment) }) },
                  { icon: 'percent', label: t('credit.loan.chipCommission', { rate: formatPercent('0.05', { decimals: 0 }) }) },
                ]}
              />
              {/* The CFT first and in attention color: it is the number to compare credits (B-04) */}
              <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 @md:grid-cols-2">
                <Fact label={t('credit.loan.cft')} tone="warning" icon="warning">
                  {formatPercent(offer.cft, { decimals: 1 })}
                </Fact>
                <Fact label={t('credit.loan.tna')}>{formatPercent(offer.tna, { decimals: 1 })}</Fact>
                <Fact label={t('credit.loan.received')}>
                  <MoneyText value={offer.received} />
                </Fact>
                <Fact label={t('credit.loan.total')} tone="warning" icon="trending_up">
                  <MoneyText value={offer.total} />
                </Fact>
              </dl>
              <InlineAlert tone="info" live="none">
                {t('credit.loan.explain', { commission: formatMoney(offer.commission), extra: formatMoney(offer.total.minus(offer.received)) })}
              </InlineAlert>
              {loanActive && <InlineAlert tone="info">{t('credit.loan.active')}</InlineAlert>}
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="tonal" leadingIcon="flag">
                  <Link to="/app/missions/mission-5">{t('credit.loan.mission')}</Link>
                </Button>
                <Button variant="outlined" disabled={loanActive} onClick={() => setConfirm('loan')}>
                  {t('credit.loan.accept')}
                </Button>
              </div>
            </section>

            {/* Installments without interest or cash with a discount (F-10, SIM-6) */}
            <section aria-labelledby="purchase-title" className={cn(card, '@container')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IconTile icon="shopping_bag" tone="secondary" />
                  <div className="min-w-0">
                    <h2 id="purchase-title" className="text-title-large text-on-surface">
                      {t('credit.purchase.title')}
                    </h2>
                    <p className="text-body-small text-on-surface-variant">{PURCHASE_OFFER.merchant}</p>
                  </div>
                </div>
                <StatusPill tone="neutral" icon="info" label={t('credit.example')} />
              </div>
              <p className="text-body-large text-on-surface">{t('credit.purchase.body', { item: PURCHASE_OFFER.item.toLowerCase() })}</p>
              <MetaChips
                label={t('credit.purchase.terms')}
                items={[
                  { icon: 'shopping_bag', label: t('credit.purchase.chipPrice', { amount: formatMoney(PURCHASE_OFFER.price) }) },
                  { icon: 'percent', label: t('credit.purchase.chipNoInterest') },
                ]}
              />
              <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 @md:grid-cols-2">
                <Fact label={t('credit.purchase.installmentsLabel', { count: PURCHASE_OFFER.months })} icon="calendar_month">
                  <MoneyText value={D(PURCHASE_OFFER.price).div(PURCHASE_OFFER.months)} />
                </Fact>
                <Fact label={t('credit.purchase.cashLabel')} icon="payments">
                  <MoneyText value={cashPrice} />
                </Fact>
              </dl>
              <InlineAlert tone="info" live="none">
                {t('credit.purchase.explain')}
              </InlineAlert>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="tonal" leadingIcon="calculate">
                  <Link to="/app/tools/SIM-6">{t('credit.purchase.compare')}</Link>
                </Button>
                <Button variant="outlined" onClick={() => setConfirm('installments')}>
                  {t('credit.purchase.installments')}
                </Button>
                <Button variant="outlined" onClick={() => setConfirm('cash')}>
                  {t('credit.purchase.cash')}
                </Button>
              </div>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            <DebtsSection debts={debts} onPayOff={(debt) => setConfirm({ payOff: debt })} />
            <LearnSection />
          </div>
        </div>
        <SourceList variant="footer" codes={['T', 'A-23', 'A-28', 'A-29', 'B-04', 'B-05', 'B-06', 'F-10', 'F-14', 'F-29', 'F-30', 'F-31']} legalText={t('credit.legal')} />
      </div>

      {confirmCopy && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirm(undefined)}
          title={confirmCopy.title}
          description={confirmCopy.body}
          confirmLabel={confirmCopy.label}
          destructive={false}
          onConfirm={onConfirm}
        />
      )}
    </WalletShell>
  );
}

type FactTone = 'neutral' | 'primary' | 'warning' | 'success';
const FACT_TONE: Record<FactTone, { box: string; label: string; icon: string }> = {
  neutral: { box: 'bg-surface-container text-on-surface', label: 'text-on-surface-variant', icon: 'text-on-surface-variant' },
  primary: { box: 'bg-primary-container text-on-primary-container', label: 'text-on-primary-container', icon: 'text-primary' },
  warning: { box: 'bg-warning-container text-on-warning-container', label: 'text-on-warning-container', icon: 'text-warning' },
  success: { box: 'bg-success-container text-on-success-container', label: 'text-on-success-container', icon: 'text-success' },
};

/**
 * A key figure in a tinted box (2.2.1): the tone says what kind of data it is, and attention or
 * success figures also carry an icon, so color is never the only signal (2.1.1).
 */
function Fact({ label, children, tone = 'neutral', icon }: { label: string; children: React.ReactNode; tone?: FactTone; icon?: IconName }) {
  const style = FACT_TONE[tone];
  return (
    <div className={cn('flex flex-col gap-1 rounded-lg p-3', style.box)}>
      <dt className={cn('flex items-center gap-1 text-label-medium', style.label)}>
        {icon && <Icon name={icon} size={16} className={cn('shrink-0', style.icon)} />}
        {label}
      </dt>
      <dd className="text-title-medium tabular-nums">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------- Card statement

type PayChoice = 'total' | 'minimum' | 'other';

function CardStatementSection() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [choice, setChoice] = useState<PayChoice>('total');
  const [other, setOther] = useState('');
  const [failure, setFailure] = useState<string | undefined>();
  const practice = wallet.card;
  const statement = practice?.statement;
  const left = statementLeft(wallet);
  const tea = practice ? effectiveAnnualRate(practice.tna, 30) : D(0);
  const minimumDue = statement ? D(statement.minimum).minus(statement.paid) : D(0);
  const minimumLeft = minimumDue.gt(0) ? minimumDue : D(0);

  const pay = () => {
    setFailure(undefined);
    const amount = choice === 'total' ? left.toFixed(2) : choice === 'minimum' ? minimumLeft.toFixed(2) : parseDecimalInput(other);
    if (!amount || D(amount).lte(0)) {
      setFailure(t('credit.card.amountMissing'));
      return;
    }
    try {
      setWallet(() => payCard(wallet, amount));
      setOther('');
      setChoice('total');
      toast.success(t('credit.card.paid', { amount: formatMoney(amount) }));
    } catch (error) {
      setFailure(error instanceof WalletError ? t(`pay.errors.${error.message}`) : t('pay.errors.unknown'));
    }
  };

  return (
    <section aria-labelledby="card-title" className={cn(card, '@container border-primary')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconTile icon="credit_card" tone="primary" />
          <div className="min-w-0">
            <h2 id="card-title" className="text-title-large text-on-surface">
              {CARD_NAME}
            </h2>
            {practice && (
              <p className="text-body-small text-on-surface-variant">
                {t('credit.card.limit')} <MoneyText value={practice.limit} />
              </p>
            )}
          </div>
        </div>
        {statement?.financed ? (
          <StatusPill tone="warning" icon="trending_up" label={t('credit.card.financed')} />
        ) : statement ? (
          <StatusPill tone="info" icon="schedule" label={t('credit.card.due', { date: formatDate(walletDate(statement.dueDay)) })} />
        ) : (
          <StatusPill tone="success" icon="check_circle" label={t('credit.card.clear')} />
        )}
      </div>

      {!practice ? null : !statement ? (
        <p className="text-body-large text-on-surface">{t('credit.card.nothing', { count: practice.paidInFull })}</p>
      ) : (
        <>
          {statement.belowMinimum && <InlineAlert tone="warning">{t('credit.card.belowMinimum')}</InlineAlert>}
          <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 @md:grid-cols-3">
            <Fact label={t('credit.card.total')} tone={statement.financed ? 'warning' : 'primary'} icon={statement.financed ? 'warning' : undefined}>
              <MoneyText value={statement.total} />
            </Fact>
            <Fact label={t('credit.card.minimum')}>
              <MoneyText value={statement.minimum} />
            </Fact>
            <Fact label={t('credit.card.dueDate')} icon="calendar_month">
              {formatDate(walletDate(statement.dueDay))}
            </Fact>
          </dl>
          <MetaChips
            label={t('credit.card.ratesLabel')}
            items={[
              { icon: 'percent', label: t('credit.card.tna', { value: formatPercent(practice.tna, { decimals: 1 }) }) },
              { icon: 'trending_up', label: t('credit.card.tea', { value: formatPercent(tea, { decimals: 1 }) }) },
              { icon: 'info', label: t('credit.card.exampleRates') },
            ]}
          />
          <InlineAlert tone={statement.financed ? 'warning' : 'info'} live="none">
            {statement.financed ? t('credit.card.financedBody') : t('credit.card.firstBody')}
          </InlineAlert>
          {D(statement.paid).gt(0) && (
            <p className="text-body-medium text-on-surface">
              {t('credit.card.paidSoFar')} <MoneyText value={statement.paid} /> · {t('credit.card.left')} <MoneyText value={left} />
            </p>
          )}
          {left.gt(0) && (
            <div className="flex flex-col gap-4">
              <RadioGroup
                name="card-payment"
                legend={t('credit.card.howMuch')}
                value={choice}
                onChange={(event) => setChoice(event.target.value as PayChoice)}
                options={[
                  { value: 'total', label: t('credit.card.payTotal', { amount: formatMoney(left) }) },
                  ...(minimumLeft.gt(0) ? [{ value: 'minimum', label: t('credit.card.payMinimum', { amount: formatMoney(minimumLeft) }) }] : []),
                  { value: 'other', label: t('credit.card.payOther') },
                ]}
              />
              {/* The consequence of the chosen payment, in its color (2.1.1): no interest, financed, or it depends */}
              <InlineAlert tone={choice === 'total' ? 'success' : choice === 'minimum' ? 'warning' : 'info'} live="status">
                {choice === 'total'
                  ? t('credit.card.payTotalHelp')
                  : choice === 'minimum'
                    ? t('credit.card.payMinimumHelp', { amount: formatMoney(left.minus(minimumLeft)) })
                    : t('credit.card.payOtherHelp')}
              </InlineAlert>
              {choice === 'other' && (
                <MoneyInput label={t('credit.card.otherLabel')} helperText={t('credit.card.otherHelp', { max: formatMoney(left) })} value={other} onChange={(e) => setOther(e.target.value)} />
              )}
              {failure && <InlineAlert tone="info">{failure}</InlineAlert>}
              <div className="flex flex-wrap gap-3">
                <Button leadingIcon="payments" onClick={pay}>
                  {t('credit.card.pay')}
                </Button>
                <Button asChild variant="text" trailingIcon="arrow_forward">
                  <Link to="/app/tools/SIM-7">{t('credit.card.simulate')}</Link>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- Debts

function DebtsSection({ debts, onPayOff }: { debts: ActiveDebt[]; onPayOff: (debt: ActiveDebt) => void }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet] = useWallet(user?.personId ?? '');
  const [method, setMethod] = useState<'avalanche' | 'snowball'>('avalanche');
  const ordered = [...debts].sort((a, b) => (method === 'avalanche' ? b.tea.comparedTo(a.tea) : a.balance.comparedTo(b.balance)));
  const inflation = annualInflationOf(wallet);

  return (
    <section aria-labelledby="debts-title" className={card}>
      <h2 id="debts-title" className="text-title-large text-on-surface">
        {t('credit.debts.title')}
      </h2>
      {debts.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('credit.debts.empty')}</p>
      ) : (
        <>
          <dl className="grid grid-cols-[minmax(0,1fr)]">
            <Fact label={t('credit.debts.total')} tone={debts.some((d) => d.highRate) ? 'warning' : 'neutral'} icon={debts.some((d) => d.highRate) ? 'warning' : undefined}>
              <MoneyText value={debts.reduce((sum, d) => sum.plus(d.balance), D(0))} />
            </Fact>
          </dl>
          <p className="text-body-medium text-on-surface-variant">{t('credit.debts.intro', { inflation: formatPercent(inflation, { decimals: 1 }) })}</p>
          <SegmentedButton
            label={t('credit.debts.orderBy')}
            value={method}
            onValueChange={setMethod}
            options={[
              { value: 'avalanche', label: t('credit.debts.avalanche') },
              { value: 'snowball', label: t('credit.debts.snowball') },
            ]}
          />
          <p className="text-body-small text-on-surface-variant">{t(`credit.debts.${method}Help`)}</p>
          <ol className="flex flex-col divide-y divide-outline-variant">
            {ordered.map((debt, index) => (
              <li key={debt.id} className="flex flex-col gap-2 py-3">
                <span className="flex items-start gap-3">
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full text-label-large', index === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant')}>
                    {index + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="text-body-large text-on-surface">{debt.name}</span>
                    <MetaChips
                      label={t('credit.debts.terms')}
                      items={[
                        { icon: 'percent', label: debt.tna.isZero() ? t('credit.debts.noInterest') : t('credit.debts.rate', { tea: formatPercent(debt.tea, { decimals: 1 }) }) },
                        { icon: 'payments', label: t('credit.debts.monthlyChip', { amount: formatMoney(debt.monthlyPayment) }) },
                      ]}
                    />
                  </span>
                </span>
                <span className="flex flex-wrap items-center justify-between gap-2 pl-11">
                  <MoneyText value={debt.balance} className="text-title-medium text-on-surface" />
                  {debt.highRate ? (
                    <StatusPill tone="warning" icon="warning" label={t('credit.debts.highRate')} />
                  ) : (
                    <StatusPill tone="success" icon="check_circle" label={t('credit.debts.notHighRate')} />
                  )}
                </span>
                {debt.kind !== 'card' && (
                  <span className="pl-11">
                    <Button variant="outlined" size="xs" onClick={() => onPayOff(debt)}>
                      {t('credit.debts.payOff')}
                    </Button>
                  </span>
                )}
              </li>
            ))}
          </ol>
          <Button asChild variant="text" trailingIcon="arrow_forward" className="self-start">
            <Link to="/app/tools/SIM-9">{t('credit.debts.simulate')}</Link>
          </Button>
        </>
      )}
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
  const level = LEVELS.find((l) => l.id === 'level-5')!;
  const missions = MISSIONS.filter((m) => m.levelId === 'level-5');
  const missionDone = (id: string) => wallet.completedMissionIds.includes(id) || allMissions.some((m) => m.personId === personId && m.missionId === id);
  const guideDone = (id: string) => allGuides.some((g) => g.personId === personId && g.guideIdsDone.includes(id));

  return (
    <section aria-labelledby="credit-learn" className={card}>
      <h2 id="credit-learn" className="text-title-large text-on-surface">
        {t('pay.learn.title')}
      </h2>
      <div className="flex flex-col divide-y divide-outline-variant">
        {level.guideModuleIds.map((moduleId) => {
          const guide = guideOfModule(moduleId);
          if (!guide) return null;
          const done = guideDone(guide.id);
          return (
            <Link key={moduleId} to={`/app/learn/guides/${guide.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-container">
              <Icon name={done ? 'check_circle' : 'menu_book'} filled={done} className={done ? 'text-success' : 'text-primary'} />
              <span className="min-w-0 flex-1">
                <span className="block text-body-medium text-on-surface">{guide.title}</span>
                <span className="block text-body-small text-on-surface-variant">{t('pay.learn.guideMeta', { minutes: guide.minutes })}</span>
              </span>
              <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
            </Link>
          );
        })}
        {missions.map((m) => {
          const done = missionDone(m.id);
          return (
            <Link key={m.id} to={`/app/missions/${m.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-container">
              <Icon name={done ? 'check_circle' : 'flag'} filled={done} className={done ? 'text-success' : 'text-primary'} />
              <span className="min-w-0 flex-1">
                <span className="block text-body-medium text-on-surface">{m.title}</span>
                <span className="block text-body-small text-on-surface-variant">
                  {t('pay.learn.missionMeta', { minutes: m.minutes })}
                  {done && ` · ${t('learn.map.done')}`}
                </span>
              </span>
              <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
