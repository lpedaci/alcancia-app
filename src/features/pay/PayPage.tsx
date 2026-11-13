import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import paymentsJson from '@/data/payments.json';
import { guideOfModule } from '@/features/learning/questions';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, MISSIONS, useLevels } from '@/features/levels/use-levels';
import { CreditPage } from '@/features/credit/CreditPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { dayOfMonth, payQr, setSubscription, transferOut, WalletError } from '@/features/wallet/engine/engine';
import { EXPENSE_DEFS } from '@/features/wallet/engine/profile';
import type { BudgetCategory, WalletMovement } from '@/features/wallet/engine/types';
import { formatDate, walletDate } from '@/lib/dates';
import { D } from '@/lib/finance';
import { formatMoney, parseDecimalInput } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';

/**
 * P3, Pagar (level 2, CLAUDE.md 5.3, D-173): transfer to an alias with the holder and entity shown
 * before confirming, pay with an interoperable QR (choosing the merchant from a list, the
 * alternative to the camera), scheduled debits and the receipt of each payment. Everything is
 * fictitious: payees, entities and merchants (1.1.1). "Tarjeta y préstamos" opens at level 5 (D-56).
 */
interface Payee {
  alias: string;
  holder: string;
  entity: string;
  accountType: 'CVU' | 'CBU';
}
interface Merchant {
  id: string;
  name: string;
  amount: string;
  category: BudgetCategory;
}
const PAYEES = paymentsJson.payees as Payee[];
const MERCHANTS = paymentsJson.merchants as Merchant[];
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function PayPage() {
  const { flow } = useParams();
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { statuses, isOpen } = useLevels(user?.personId ?? '');
  if (flow === 'credit') return <CreditPage />;
  const status = statuses.find((s) => s.level.id === 'level-2');
  if (status && !isOpen('level-2')) {
    return (
      <WalletShell section={t('wallet.nav.pay')} fuerte={{ state: 'thinking', message: t('pay.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.placeholder.lockedTitle', { section: t('wallet.nav.pay') })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }
  if (flow === 'transfer') return <TransferFlow />;
  if (flow === 'qr') return <QrFlow />;
  if (flow === 'bills') return <BillsPage />;
  return <PayHome />;
}

function errorText(t: (key: string) => string, error: unknown) {
  return error instanceof WalletError ? t(`pay.errors.${error.message}`) : t('pay.errors.unknown');
}

/** The receipt of a payment (5.3 "Comprobantes"): fictitious operation number, date, payee and amount. */
function Receipt({ movement, rows, headingRef }: { movement: WalletMovement; rows: [string, string][]; headingRef: React.RefObject<HTMLHeadingElement> }) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="receipt-title" className={card}>
      <div className="flex items-center gap-3">
        <IconTile icon="task_alt" tone="tertiary" />
        <div className="min-w-0">
          <h1 id="receipt-title" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
            {t('pay.receipt.title')}
          </h1>
          <p className="text-body-medium text-on-surface-variant">{t('pay.receipt.subtitle')}</p>
        </div>
      </div>
      <dl className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
        {[
          [t('pay.receipt.operation'), `N.º ${movement.id.replace('m-', '').padStart(4, '0')} (${t('pay.receipt.example')})`],
          [t('pay.receipt.date'), formatDate(walletDate(movement.day))],
          ...rows,
        ].map(([label, value]) => (
          <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-3">
            <dt className="text-label-medium text-on-surface-variant">{label}</dt>
            <dd className="text-body-medium text-on-surface">{value}</dd>
          </div>
        ))}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-3">
          <dt className="text-label-medium text-on-surface-variant">{t('pay.receipt.amount')}</dt>
          <dd className="text-title-medium">
            <MoneyText value={movement.amount} trend flow />
          </dd>
        </div>
      </dl>
      <p className="text-body-small text-on-surface-variant">{t('pay.receipt.note')}</p>
    </section>
  );
}

/** "¿Por qué importa?" (5.3): a short learning card with its official source. */
function WhyCard({ title, body, source }: { title: string; body: string; source: string }) {
  const { t } = useTranslation();
  return (
    <aside className="flex items-start gap-3 rounded-lg bg-info-container p-4 text-on-info-container">
      <Icon name="lightbulb" className="mt-0.5 shrink-0 text-info" />
      <div className="flex flex-col gap-1">
        <p className="text-title-small">{title}</p>
        <p className="text-body-medium">{body}</p>
        <p className="text-body-small">{t('pay.source', { source })}</p>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------- Hub

function PayHome() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { isOpen, wallet } = useLevels(personId);
  const allMissions = useDataStore((s) => s.missionCompletions);
  const allGuides = useDataStore((s) => s.guideProgress);
  const level = LEVELS.find((l) => l.id === 'level-2')!;
  const missions = MISSIONS.filter((m) => m.levelId === 'level-2');
  const missionDone = (id: string) => wallet.completedMissionIds.includes(id) || allMissions.some((m) => m.personId === personId && m.missionId === id);
  const guideDone = (id: string) => allGuides.some((g) => g.personId === personId && g.guideIdsDone.includes(id));
  const recent = [...wallet.movements].filter((m) => ['transfer_out', 'qr_payment', 'bill'].includes(m.type)).slice(-5).reverse();
  const creditOpen = isOpen('level-5');

  const actions: { to: string; icon: IconName; key: string; locked?: boolean }[] = [
    { to: '/app/pay/transfer', icon: 'send_money', key: 'transfer' },
    { to: '/app/pay/qr', icon: 'qr_code_scanner', key: 'qr' },
    { to: '/app/pay/bills', icon: 'receipt_long', key: 'bills' },
    { to: '/app/pay/credit', icon: 'credit_card', key: 'credit', locked: !creditOpen },
  ];

  return (
    <WalletShell section={t('wallet.nav.pay')} fuerte={{ state: 'neutral', message: t('pay.fuerte.home'), why: t('wallet.fuerte.why.pay') }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.nav.pay')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('pay.intro')}</p>
        </header>

        <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) sm:grid-cols-2 large:grid-cols-4">
          {actions.map((a) => (
            <li key={a.key}>
              <Link to={a.to} className="group flex h-full flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) hover:border-primary">
                <span className="flex items-start justify-between gap-2">
                  <IconTile icon={a.icon} tone={a.locked ? 'secondary' : 'primary'} />
                  <Icon name={a.locked ? 'lock' : 'arrow_forward'} size={20} className="text-on-surface-variant transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </span>
                <span className="text-title-medium text-on-surface">
                  {t(`wallet.sub.${a.key}`)}
                  {a.locked && <span className="sr-only">, {t('wallet.nav.locked')}</span>}
                </span>
                <span className="text-body-medium text-on-surface-variant">{t(`pay.actions.${a.key}`)}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
          <section aria-labelledby="pay-learn" className={card}>
            <h2 id="pay-learn" className="text-title-large text-on-surface">
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

          <section aria-labelledby="pay-recent" className={card}>
            <h2 id="pay-recent" className="text-title-large text-on-surface">
              {t('pay.recent.title')}
            </h2>
            {recent.length === 0 ? (
              <p className="text-body-medium text-on-surface-variant">{t('pay.recent.empty')}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-outline-variant">
                {recent.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                      <Icon name={m.type === 'qr_payment' ? 'qr_code_scanner' : m.type === 'bill' ? 'receipt_long' : 'send_money'} size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-medium text-on-surface">{m.counterparty}</span>
                      <span className="block text-body-small text-on-surface-variant">{formatDate(walletDate(m.day))}</span>
                    </span>
                    <MoneyText value={m.amount} trend flow className="text-label-large" />
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

// ---------------------------------------------------------------- Transfer

function useFocusOn(dep: unknown) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [dep]);
  return ref;
}

function TransferFlow() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [wallet, setWallet] = useWallet(personId);
  const [stage, setStage] = useState<'form' | 'confirm' | 'receipt'>('form');
  const [alias, setAlias] = useState('');
  const [amount, setAmount] = useState('');
  const [tried, setTried] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();
  const [movement, setMovement] = useState<WalletMovement | undefined>();
  const headingRef = useFocusOn(stage);

  const payee = PAYEES.find((p) => p.alias === alias.trim().toLowerCase());
  const parsed = parseDecimalInput(amount);
  const aliasError = tried && !payee ? (alias.trim() ? t('pay.transfer.aliasUnknown') : t('pay.transfer.aliasMissing')) : undefined;
  const amountError = tried && (!parsed || D(parsed).lte(0)) ? t('pay.transfer.amountMissing') : undefined;

  const next = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    setFailure(undefined);
    if (payee && parsed && D(parsed).gt(0)) setStage('confirm');
  };
  const confirm = () => {
    try {
      const updated = transferOut(wallet, { amount: parsed!, counterparty: `${payee!.holder} · alias ${payee!.alias}` });
      setWallet(() => updated);
      setMovement(updated.movements.at(-1));
      setStage('receipt');
      toast.success(t('pay.transfer.sent'));
    } catch (error) {
      setFailure(errorText(t, error));
      setStage('form');
    }
  };

  return (
    <WalletShell section={t('wallet.nav.pay')} fuerte={{ state: stage === 'confirm' ? 'attention' : 'neutral', message: stage === 'confirm' ? t('pay.fuerte.confirm') : t('pay.fuerte.transfer') }}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-[minmax(0,1fr)_22rem] large:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="flex items-center gap-2 text-label-large text-primary">
            <Icon name="send_money" size={18} />
            {t('wallet.sub.transfer')}
          </p>
          {stage === 'form' && (
            <form noValidate onSubmit={next} className={card} aria-labelledby="transfer-title">
              <h1 id="transfer-title" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
                {t('pay.transfer.title')}
              </h1>
              {failure && <InlineAlert tone="info">{failure}</InlineAlert>}
              <TextField
                label={t('pay.transfer.alias')}
                helperText={t('pay.transfer.aliasHelp')}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                error={aliasError}
                autoComplete="off"
                spellCheck={false}
              />
              <div className="flex flex-col gap-2">
                <p className="text-label-medium text-on-surface-variant">{t('pay.transfer.contacts')}</p>
                <ul className="flex flex-wrap gap-2">
                  {PAYEES.filter((p) => p.alias !== 'inmobiliaria.ejemplo').map((p) => (
                    <li key={p.alias}>
                      <Button type="button" variant="outlined" size="xs" onClick={() => setAlias(p.alias)}>
                        {p.alias}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <MoneyInput label={t('pay.transfer.amount')} helperText={t('pay.transfer.amountHelp')} value={amount} onChange={(e) => setAmount(e.target.value)} error={amountError} />
              <p className="text-body-small text-on-surface-variant">
                {t('pay.balance')} <MoneyText value={wallet.balance} />
              </p>
              <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-4">
                <Button type="submit" trailingIcon="arrow_forward">
                  {t('pay.transfer.continue')}
                </Button>
                <Button asChild variant="text">
                  <Link to="/app/pay">{t('pay.back')}</Link>
                </Button>
              </div>
            </form>
          )}
          {stage === 'confirm' && payee && parsed && (
            <section aria-labelledby="confirm-title" className={card}>
              <h1 id="confirm-title" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
                {t('pay.transfer.confirmTitle')}
              </h1>
              {/* The holder goes first and big: it is what must be checked before confirming (B-15) */}
              <div className="flex flex-col gap-1 rounded-lg bg-primary-container p-4 text-on-primary-container">
                <span className="text-label-medium">{t('pay.transfer.holder')}</span>
                <span className="text-title-large">{payee.holder}</span>
              </div>
              <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
                {[
                  [t('pay.transfer.aliasLabel'), payee.alias],
                  [t('pay.transfer.entity'), payee.entity],
                  [t('pay.transfer.account'), t(`pay.transfer.type.${payee.accountType}`)],
                  [t('pay.transfer.amount'), formatMoney(parsed)],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-label-medium text-on-surface-variant">{label}</dt>
                    <dd className="text-body-large break-all text-on-surface">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-4">
                <Button leadingIcon="check" onClick={confirm}>
                  {t('pay.transfer.confirm')}
                </Button>
                <Button variant="outlined" leadingIcon="edit" onClick={() => setStage('form')}>
                  {t('pay.transfer.edit')}
                </Button>
                <Button asChild variant="text">
                  <Link to="/app/pay">{t('pay.cancel')}</Link>
                </Button>
              </div>
            </section>
          )}
          {stage === 'receipt' && movement && payee && (
            <>
              <Receipt
                movement={movement}
                headingRef={headingRef}
                rows={[
                  [t('pay.transfer.holder'), payee.holder],
                  [t('pay.transfer.aliasLabel'), payee.alias],
                  [t('pay.transfer.entity'), `${payee.entity} (${payee.accountType})`],
                ]}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  leadingIcon="send_money"
                  onClick={() => {
                    setAlias('');
                    setAmount('');
                    setTried(false);
                    setStage('form');
                  }}
                >
                  {t('pay.transfer.another')}
                </Button>
                <Button asChild variant="outlined">
                  <Link to="/app/pay">{t('pay.back')}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
        <WhyCard title={t('pay.why.transferTitle')} body={t('pay.why.transfer')} source="B-15, B-16" />
      </div>
    </WalletShell>
  );
}

// ---------------------------------------------------------------- QR

function QrFlow() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [merchant, setMerchant] = useState<Merchant | undefined>();
  const [movement, setMovement] = useState<WalletMovement | undefined>();
  const [failure, setFailure] = useState<string | undefined>();
  const stage = movement ? 'receipt' : merchant ? 'confirm' : 'scan';
  const headingRef = useFocusOn(stage);

  const pay = () => {
    try {
      const updated = payQr(wallet, { amount: merchant!.amount, merchant: merchant!.name, category: merchant!.category });
      setWallet(() => updated);
      setMovement(updated.movements.at(-1));
      toast.success(t('pay.qr.paid'));
    } catch (error) {
      setFailure(errorText(t, error));
    }
  };

  return (
    <WalletShell section={t('wallet.nav.pay')} fuerte={{ state: 'neutral', message: t('pay.fuerte.qr') }}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-[minmax(0,1fr)_22rem] large:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="flex items-center gap-2 text-label-large text-primary">
            <Icon name="qr_code_scanner" size={18} />
            {t('wallet.sub.qr')}
          </p>
          {stage === 'scan' && (
            <section aria-labelledby="qr-title" className={card}>
              <h1 id="qr-title" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
                {t('pay.qr.title')}
              </h1>
              <p className="text-body-large text-on-surface-variant">{t('pay.qr.body')}</p>
              {/* No camera in the demo: choosing the merchant from the list is the alternative of 5.3 */}
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
                {MERCHANTS.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setMerchant(m)}
                      className="flex h-full w-full flex-col items-start gap-3 rounded-lg border border-outline-variant p-4 text-left hover:border-primary hover:bg-surface-container"
                    >
                      <Icon name="qr_code_2" size={24} className="text-primary" />
                      <span className="text-title-small text-on-surface">{m.name}</span>
                      <MoneyText value={m.amount} className="text-label-large text-on-surface-variant" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button asChild variant="text" className="self-start">
                <Link to="/app/pay">{t('pay.back')}</Link>
              </Button>
            </section>
          )}
          {stage === 'confirm' && merchant && (
            <section aria-labelledby="qr-confirm" className={card}>
              <h1 id="qr-confirm" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
                {t('pay.qr.confirmTitle')}
              </h1>
              {failure && <InlineAlert tone="info">{failure}</InlineAlert>}
              <div className="flex flex-col gap-1 rounded-lg bg-primary-container p-4 text-on-primary-container">
                <span className="text-label-medium">{t('pay.qr.merchant')}</span>
                <span className="text-title-large">{merchant.name}</span>
                <span className="text-headline-small">
                  <MoneyText value={merchant.amount} />
                </span>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-4">
                <Button leadingIcon="check" onClick={pay}>
                  {t('pay.qr.pay')}
                </Button>
                <Button variant="text" onClick={() => setMerchant(undefined)}>
                  {t('pay.cancel')}
                </Button>
              </div>
            </section>
          )}
          {stage === 'receipt' && movement && merchant && (
            <>
              <Receipt movement={movement} headingRef={headingRef} rows={[[t('pay.qr.merchant'), merchant.name], [t('pay.qr.method'), t('pay.qr.methodValue')]]} />
              <div className="flex flex-wrap gap-3">
                <Button
                  leadingIcon="qr_code_scanner"
                  onClick={() => {
                    setMovement(undefined);
                    setMerchant(undefined);
                  }}
                >
                  {t('pay.qr.another')}
                </Button>
                <Button asChild variant="outlined">
                  <Link to="/app/pay">{t('pay.back')}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
        <WhyCard title={t('pay.why.qrTitle')} body={t('pay.why.qr')} source="B-15" />
      </div>
    </WalletShell>
  );
}

// ---------------------------------------------------------------- Bills

function BillsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const today = wallet.day > 0 ? dayOfMonth(wallet.day) : 0;
  const bills = EXPENSE_DEFS.filter((d) => d.type === 'bill');

  /** Next debit date: the first scheduled day of the month after today, or next month. */
  const nextDate = (days: number[]) => {
    const upcoming = days.find((d) => d > today);
    const offset = upcoming !== undefined ? upcoming - today : 30 - today + days[0]!;
    return formatDate(walletDate(wallet.day + offset));
  };

  return (
    <WalletShell section={t('wallet.nav.pay')} fuerte={{ state: 'neutral', message: t('pay.fuerte.bills') }}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-[minmax(0,1fr)_22rem] large:items-start">
        <section aria-labelledby="bills-title" className={card}>
          <p className="flex items-center gap-2 text-label-large text-primary">
            <Icon name="receipt_long" size={18} />
            {t('wallet.sub.bills')}
          </p>
          <h1 id="bills-title" className="text-headline-medium text-on-surface">
            {t('pay.bills.title')}
          </h1>
          <p className="text-body-large text-on-surface-variant">{t('pay.bills.body')}</p>
          <ul className="flex flex-col divide-y divide-outline-variant">
            {bills.map((b) => {
              const isSub = b.key === 'subscription';
              const active = !isSub || wallet.subscriptionActive;
              return (
                <li key={b.key} className="flex items-start gap-3 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                    <Icon name="receipt_long" size={20} />
                  </span>
                  {/* Name and date on top; amount and action below, so the text never gets squeezed (2.7) */}
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span>
                      <span className="block text-body-medium text-on-surface">{b.counterparty}</span>
                      <span className="block text-body-small text-on-surface-variant">
                        {active ? t('pay.bills.next', { date: nextDate(b.days) }) : t('pay.bills.cancelled')} · {t(`pay.bills.category.${b.category}`)}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <MoneyText value={wallet.expenses[b.key]} className={cn('text-label-large', active ? 'text-on-surface' : 'text-on-surface-variant line-through')} />
                      {isSub &&
                        (active ? (
                          <Button variant="outlined" size="xs" onClick={() => setConfirmCancel(true)}>
                            {t('pay.bills.cancel')}
                          </Button>
                        ) : (
                          <Button
                            variant="text"
                            size="xs"
                            onClick={() => {
                              setWallet((w) => setSubscription(w, true));
                              toast.success(t('pay.bills.reactivated'));
                            }}
                          >
                            {t('pay.bills.reactivate')}
                          </Button>
                        ))}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          {wallet.pendingDebit && <StatusPill tone="warning" icon="schedule" label={t('pay.bills.pending')} />}
          <p className="text-body-small text-on-surface-variant">{t('pay.bills.note')}</p>
        </section>
        <WhyCard title={t('pay.why.billsTitle')} body={t('pay.why.bills')} source="A-15, A-34" />
      </div>
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t('pay.bills.cancelTitle')}
        description={t('pay.bills.cancelBody')}
        confirmLabel={t('pay.bills.cancel')}
        onConfirm={() => {
          setWallet((w) => setSubscription(w, false));
          toast.success(t('pay.bills.cancelledToast'));
        }}
      />
    </WalletShell>
  );
}
