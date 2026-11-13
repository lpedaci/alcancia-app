import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { MetaChips } from '@/components/ui/MetaChips';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { toast } from '@/components/ui/toast-store';
import { findPerson } from '@/features/auth/auth-service';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { useLevels } from '@/features/levels/use-levels';
import { formatDate, walletDate } from '@/lib/dates';
import { D } from '@/lib/finance';
import { formatMoney, formatNumber } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { advanceDays, advanceMonth, CATEGORIZABLE, categorize, pocketsTotal, purchasingPowerToday, walletMetrics } from './engine/engine';
import type { BudgetCategory, WalletMovement } from './engine/types';
import { WalletShell } from './WalletShell';

/**
 * P1 · Inicio de la cuenta (CLAUDE.md 6) with the person's own wallet (step 6): active mission,
 * greeting with the controls of time, balance and purchasing power, quick actions and pockets, the
 * next unlock with its conditions as chips (5.0) and the last movements, which can be categorized
 * from here (D-114). Fuerte talks from his floating button (D-160).
 */
const QUICK_ACTIONS: { key: string; icon: IconName; to: string }[] = [
  { key: 'transfer', icon: 'send_money', to: '/app/pay/transfer' },
  { key: 'qr', icon: 'qr_code_scanner', to: '/app/pay/qr' },
  { key: 'bills', icon: 'receipt_long', to: '/app/pay/bills' },
  { key: 'pockets', icon: 'savings', to: '/app/save/pockets' },
];

const WHY_BY_LEVEL: Record<string, string> = {
  'level-1': 'account',
  'level-2': 'pay',
  'level-3': 'budget',
  'level-4': 'pockets',
  'level-5': 'credit',
  'level-6': 'yield',
  'level-7': 'invest',
};

const MOVEMENT_ICON: Record<WalletMovement['type'], IconName> = {
  income: 'payments',
  transfer_out: 'send_money',
  transfer_in: 'send_money',
  qr_payment: 'qr_code_2',
  bill: 'receipt_long',
  yield: 'trending_up',
  pocket_in: 'savings',
  pocket_out: 'savings',
  loan: 'request_quote',
  card_payment: 'credit_card',
  installment: 'shopping_bag',
  term_deposit: 'account_balance',
};

const card = 'flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function WalletHomePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const person = findPerson(personId);
  const firstName = person?.name.split(' ')[0] ?? '';
  const [wallet, update] = useWallet(personId);
  const { current, next, activeMission } = useLevels(personId);
  const [announcement, setAnnouncement] = useState('');
  // A participant who has not opened her account yet starts there (flows.md 2.1, P2).
  const accountOpened = useDataStore((s) => s.diagnostics.some((d) => d.personId === personId && d.kind === 'initial'));

  const metrics = walletMetrics(wallet);
  const power = purchasingPowerToday(wallet);
  const canAdvance = wallet.completedMissionIds.includes('mission-1') && wallet.day > 0;
  const currentSection = current ? t(`wallet.sections.${current.level.id}`) : '';
  const nextSection = next ? t(`wallet.sections.${next.level.id}`) : '';
  const alias = `alcancia.practica.${firstName.toLowerCase()}`;

  const advance = (kind: 'day' | 'week' | 'month') => {
    const before = wallet.movements.length;
    const nextState = kind === 'month' ? advanceMonth(wallet) : advanceDays(wallet, kind === 'day' ? 1 : 7);
    update(() => nextState);
    const days = nextState.day - wallet.day;
    setAnnouncement(t('wallet.home.time.done', { count: days, movements: nextState.movements.length - before }));
  };

  // Fuerte's note: what the next unlock needs, and why the current section matters.
  let fuerteMessage = t('wallet.home.fuerteAllOpen');
  if (next?.level.id === 'level-7') fuerteMessage = t('wallet.home.fuerteInvest', { months: formatNumber(metrics.emergency_months, 1) });
  else if (next?.level.id === 'level-3') fuerteMessage = t('wallet.home.fuerteBudget', { current: metrics.categorized_movements });
  else if (next) fuerteMessage = t('wallet.home.fuerteGeneric', { section: nextSection });
  const whyKey = current ? WHY_BY_LEVEL[current.level.id] : undefined;

  const missionAction = activeMission ? (
    <Button asChild size="s" trailingIcon="arrow_forward" fullWidth>
      <Link to={`/app/missions/${activeMission.id}`}>{t('wallet.home.mission.start')}</Link>
    </Button>
  ) : undefined;

  const recent = [...wallet.movements].reverse().slice(0, 6);

  if (!accountOpened) return <Navigate to="/app/welcome" replace />;

  return (
    <WalletShell
      section={t('wallet.nav.home')}
      fuerte={{ state: 'greeting', message: fuerteMessage, why: whyKey ? t(`wallet.fuerte.why.${whyKey}`) : undefined, action: missionAction }}
    >
      <div className="flex flex-col gap-(--space-bento-gap)">
        {/* Active mission: one compact card above the content, at every size (5.3) */}
        {activeMission && (
          <Link
            to={`/app/missions/${activeMission.id}`}
            className="flex items-center gap-3 rounded-xl border border-primary bg-surface-container-lowest p-4 hover:bg-surface-container"
          >
            <IconTile icon="flag" size="sm" className="self-start" />
            {/* The objective wraps up to two lines instead of being cut (2.7) */}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-label-medium text-primary">{t('wallet.home.mission.kickerMinutes', { minutes: activeMission.minutes })}</span>
              <span className="text-title-medium text-pretty text-on-surface">{activeMission.title}</span>
              <span className="hidden text-body-small text-pretty text-on-surface-variant md:line-clamp-2">{activeMission.objective}</span>
            </span>
            <span className="hidden shrink-0 text-label-large text-primary expanded:inline">{t('wallet.home.mission.start')}</span>
            <Icon name="arrow_forward" className="shrink-0 text-primary" />
          </Link>
        )}

        {/* Greeting (2.2.1, pattern 2) with the controls of time on a white surface, so they read clearly */}
        <section aria-labelledby="home-title" className="flex flex-col gap-4 rounded-xl bg-primary-container p-(--space-card-padding) text-on-primary-container expanded:flex-row expanded:flex-wrap expanded:items-end expanded:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <MetaChips
              label={t('wallet.home.dateLabel')}
              items={[
                { icon: 'calendar_month', label: formatDate(walletDate(wallet.day)), dateTime: walletDate(wallet.day) },
                { icon: 'today', label: t('wallet.home.dayChip', { day: wallet.day }) },
              ]}
            />
            <h1 id="home-title" className="text-headline-medium">
              {t('wallet.home.hello')} <span className="text-primary">{firstName}</span>
            </h1>
            <MetaChips
              label={t('wallet.home.context')}
              items={[
                ...(current ? [{ icon: 'route' as const, label: t('wallet.home.chipLevel', { level: current.level.order, section: currentSection }), strong: true }] : []),
                ...(next ? [{ icon: 'lock' as const, label: t('wallet.home.chipNext', { section: nextSection }) }] : []),
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <p id="time-label" className="text-label-medium">{t('wallet.home.time.label')}</p>
            {canAdvance ? (
              // Phones: three equal buttons in one full-width row, text only, so they never wrap (D-169).
              <div role="group" aria-labelledby="time-label" className="grid w-full grid-cols-3 gap-1 rounded-lg bg-surface-container-lowest p-1 sm:inline-flex sm:w-fit">
                {(
                  [
                    ['day', 'skip_next'],
                    ['week', 'fast_forward'],
                    ['month', 'calendar_month'],
                  ] as const
                ).map(([kind, icon]) => (
                  <Button key={kind} variant="text" size="s" className="min-w-0 px-2 sm:px-3" onClick={() => advance(kind)}>
                    <Icon name={icon} size={20} className="hidden shrink-0 sm:block" />
                    {t(`wallet.home.time.${kind}`)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-body-small">{t('wallet.home.time.notYet')}</p>
            )}
            <p className="sr-only" aria-live="polite">
              {announcement}
            </p>
          </div>
        </section>

        {wallet.pendingDebit && (
          <InlineAlert tone="warning" live="alert">
            {t('wallet.home.time.pending', {
              name: wallet.pendingDebit.expenseKey ? t(`wallet.expenses.${wallet.pendingDebit.expenseKey}`) : (wallet.pendingDebit.counterparty ?? ""),
              amount: formatMoney(wallet.pendingDebit.amount),
            })}
          </InlineAlert>
        )}

        <div className="grid grid-cols-1 gap-(--space-bento-gap) expanded:grid-cols-2">
          {/* Balance */}
          <section aria-labelledby="balance-title" className={cn(card, '@container')}>
            <div className="flex items-start justify-between gap-2">
              <h2 id="balance-title" className="text-title-medium text-on-surface">{t('wallet.home.balance.title')}</h2>
              <IconTile icon="account_balance_wallet" size="sm" />
            </div>
            <p className="text-display-small text-on-surface">
              <MoneyText value={wallet.balance} compactBelow="xs" />
            </p>
            <p className="flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-medium text-on-warning-container">
                <Icon name="trending_down" size={16} className="text-warning" />
                {t('wallet.home.balance.power')}
              </span>
              <MoneyText value={power.toFixed(2)} className="text-label-large text-on-surface" />
            </p>
            {/* Label over value on phones, side by side from 24 rem of card: more air between lines (D-170) */}
            <dl className="mt-auto flex flex-col gap-3 border-t border-outline-variant pt-4">
              <div className="flex flex-col gap-0.5 @xs:flex-row @xs:items-baseline @xs:justify-between @xs:gap-3">
                <dt className="text-label-medium text-on-surface-variant">{t('wallet.home.balance.alias')}</dt>
                <dd className="min-w-0 truncate text-body-medium text-on-surface">{alias}</dd>
              </div>
              <div className="flex flex-col gap-0.5 @xs:flex-row @xs:items-baseline @xs:justify-between @xs:gap-3">
                <dt className="text-label-medium text-on-surface-variant">{t('wallet.home.balance.cvu')}</dt>
                <dd className="text-body-medium text-on-surface tabular-nums">0000000 0000000 EJEMPLO 00</dd>
              </div>
            </dl>
          </section>

          {/* Quick actions and pockets */}
          <section aria-labelledby="actions-title" className={cn(card, '@container')}>
            <h2 id="actions-title" className="text-title-medium text-on-surface">{t('wallet.home.actions.title')}</h2>
            <ul className="grid grid-cols-2 gap-2 @xs:grid-cols-4">
              {QUICK_ACTIONS.map((a) => (
                <li key={a.key}>
                  <Link to={a.to} className="flex min-h-12 flex-col items-center gap-1 rounded-lg p-2 text-center text-label-medium text-on-surface hover:bg-surface-container">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                      <Icon name={a.icon} />
                    </span>
                    {t(`wallet.home.actions.${a.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-3">
              {wallet.pockets.length === 0 ? (
                <p className="text-body-small text-on-surface-variant">{t('wallet.home.pockets.empty')}</p>
              ) : (
                <>
                  {/* The total only adds something with two pockets or more */}
                  {wallet.pockets.length > 1 && (
                    <div className="flex items-center justify-between gap-2 text-body-small">
                      <span className="text-on-surface-variant">{t('wallet.home.pockets.total')}</span>
                      <MoneyText value={pocketsTotal(wallet).toFixed(2)} className="text-label-large text-on-surface" />
                    </div>
                  )}
                  {wallet.pockets.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 text-body-medium">
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon name={p.isEmergencyFund ? 'shield' : p.goal ? 'target' : 'savings'} size={18} className="text-tertiary" />
                        <span className="truncate">{p.name}</span>
                      </span>
                      <MoneyText value={p.amount} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>

        {next && <UnlockCard status={next} />}

        {/* Recent movements, with the category to confirm (D-114) */}
        <section aria-labelledby="movements-title" className={cn(card, '@container')}>
          <div className="flex items-center justify-between gap-2">
            <h2 id="movements-title" className="text-title-large text-on-surface">{t('wallet.home.movements.title')}</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-body-medium text-on-surface-variant">{t('wallet.home.movements.empty')}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-outline-variant">
              {recent.map((m) => (
                <li key={m.id} className="flex items-center gap-4 py-4">
                  <span
                    className={cn(
                      'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
                      D(m.amount).isNegative() ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-container text-on-tertiary-container',
                    )}
                  >
                    <Icon name={MOVEMENT_ICON[m.type]} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-2 @md:flex-row @md:items-center @md:gap-4">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-body-large text-on-surface">{m.counterparty}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
                        {formatDate(walletDate(m.day))}
                        {CATEGORIZABLE.includes(m.type) && (
                          <CategoryChip movement={m} onChoose={(category) => {
                            update((s) => categorize(s, m.id, category));
                            toast.success(t('wallet.categorize.saved'));
                          }} />
                        )}
                      </span>
                    </span>
                    <MoneyText value={m.amount} trend flow className="text-label-large" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </WalletShell>
  );
}

const CATEGORIES: BudgetCategory[] = ['needs', 'wants', 'savings'];

/** Category of an expense: confirmed (with a check) or still to confirm, with the engine's suggestion. */
function CategoryChip({ movement, onChoose }: { movement: WalletMovement; onChoose: (category: BudgetCategory) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const confirmed = movement.category;
  const state = confirmed ? t(`wallet.categorize.${confirmed}`) : t('wallet.categorize.none');
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('wallet.categorize.button', { name: movement.counterparty, state })}
          className={cn(
            'inline-flex min-h-6 items-center gap-1 rounded-full px-2 text-label-small',
            confirmed ? 'bg-secondary-container text-on-secondary-container' : 'border border-dashed border-outline text-on-surface-variant hover:bg-surface-container',
          )}
        >
          <Icon name={confirmed ? 'check' : 'edit'} size={16} />
          {state}
        </button>
      </PopoverTrigger>
      <PopoverContent label={t('wallet.categorize.legend')} align="start">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-title-small text-on-surface">{t('wallet.categorize.legend')}</legend>
          <p className="text-body-small text-on-surface-variant">{t('wallet.categorize.help')}</p>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={category === (confirmed ?? movement.suggestedCategory) ? 'tonal' : 'outlined'}
              size="s"
              fullWidth
              onClick={() => {
                onChoose(category);
                setOpen(false);
              }}
            >
              {t(`wallet.categorize.${category}`)}
              {!confirmed && category === movement.suggestedCategory && ` · ${t('wallet.categorize.suggestedShort')}`}
            </Button>
          ))}
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}
