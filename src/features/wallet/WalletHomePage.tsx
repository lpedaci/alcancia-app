import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
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
import { setAmountsHidden, useAmountsHidden } from '@/store/amounts-visibility';
import { advanceDays, advanceMonth, CATEGORIZABLE, categorize, pocketsTotal, purchasingPowerToday, walletMetrics } from './engine/engine';
import type { BudgetCategory, WalletMovement } from './engine/types';
import { WalletShell } from './WalletShell';
import { fuerteLine } from '@/features/companion/fuerte-lines';
import { WhyMatters, whyText } from '@/features/learning-cards/WhyMatters';
import type { WhyScreen } from '@/features/learning-cards/cards';

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

const WHY_BY_LEVEL: Record<string, WhyScreen> = {
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
  brokerage: 'trending_up',
};

const card = 'flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function WalletHomePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const person = findPerson(personId);
  const firstName = person?.name.split(' ')[0] ?? '';
  const [wallet, update] = useWallet(personId);
  const { current, next, activeMission, activeMissionLevel, activeMissionFromEarlier } = useLevels(personId);
  const [announcement, setAnnouncement] = useState('');
  // A participant who has not opened her account yet starts there (flows.md 2.1, P2).
  const accountOpened = useDataStore((s) => s.diagnostics.some((d) => d.personId === personId && d.kind === 'initial'));

  const metrics = walletMetrics(wallet);
  const power = purchasingPowerToday(wallet);
  const amountsHidden = useAmountsHidden();
  const [showAccount, setShowAccount] = useState(false);
  const [showPockets, setShowPockets] = useState(false);
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
  let fuerteMessage = fuerteLine('wallet.home.fuerteAllOpen');
  if (next?.level.id === 'level-7') fuerteMessage = fuerteLine('wallet.home.fuerteInvest', { months: formatNumber(metrics.emergency_months, 1) });
  else if (next?.level.id === 'level-3') fuerteMessage = fuerteLine('wallet.home.fuerteBudget', { current: metrics.categorized_movements });
  else if (next) fuerteMessage = fuerteLine('wallet.home.fuerteGeneric', { section: nextSection });
  const whyKey = current ? WHY_BY_LEVEL[current.level.id] : undefined;

  const missionAction = activeMission ? (
    <Button asChild size="s" trailingIcon="arrow_forward" fullWidth>
      <Link to={`/app/missions/${activeMission.id}`}>{t('wallet.home.mission.start')}</Link>
    </Button>
  ) : undefined;

  // The last ones, and all of them on demand in a scrollable list (D-286)
  const allMovements = [...wallet.movements].reverse();
  const [showAll, setShowAll] = useState(false);
  const recent = showAll ? allMovements : allMovements.slice(0, RECENT_SHOWN);

  if (!accountOpened) return <Navigate to="/app/welcome" replace />;

  return (
    <WalletShell
      section={t('wallet.nav.home')}
      fuerte={{ state: 'greeting', message: fuerteMessage, why: whyKey ? whyText(whyKey) : undefined, action: missionAction }}
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
              <span className="text-label-medium text-primary">{activeMissionFromEarlier ? t('wallet.home.mission.kickerEarlier', { level: activeMissionLevel, minutes: activeMission.minutes }) : t('wallet.home.mission.kickerMinutes', { minutes: activeMission.minutes })}</span>
              <span className="text-title-medium text-pretty text-on-surface">{activeMission.title}</span>
              <span className="hidden text-body-small text-pretty text-on-surface-variant md:line-clamp-2">{activeMission.objective}</span>
            </span>
            <span className="hidden shrink-0 text-label-large text-primary expanded:inline">{t('wallet.home.mission.start')}</span>
            <Icon name="arrow_forward" className="shrink-0 text-primary" />
          </Link>
        )}

        {/* Greeting (2.2.1, pattern 2; D-287, D-288). Phones and tablets: on the page, with no card, as
            wallets do; from 840 px, the tinted card. One date line, the name, the level, and two quiet
            controls: "Avanzar el tiempo" opens a menu and "¿Por qué importa?" opens a dialog. */}
        <section aria-labelledby="home-title" className="flex flex-col gap-3 px-1 text-on-surface expanded:flex-row expanded:items-end expanded:justify-between expanded:gap-4 expanded:rounded-xl expanded:bg-primary-container expanded:p-(--space-card-padding) expanded:text-on-primary-container">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-label-medium text-on-surface-variant tabular-nums expanded:text-on-primary-container">
              <time dateTime={walletDate(wallet.day)}>{formatDate(walletDate(wallet.day))}</time> · {t('wallet.home.dayChip', { day: wallet.day })}
            </p>
            <h1 id="home-title" className="text-headline-small expanded:text-headline-medium">
              {t('wallet.home.hello')} <span className="text-primary">{firstName}</span>
            </h1>
            {current && (
              <p className="flex flex-wrap items-center gap-x-1.5 text-label-large text-primary">
                <Icon name="route" size={16} />
                {t('wallet.home.chipLevel', { level: current.level.order, section: currentSection })}
                {next && (
                  <span className="hidden items-center gap-1.5 text-on-primary-container expanded:inline-flex">
                    <span aria-hidden>·</span>
                    <Icon name="lock" size={16} />
                    {t('wallet.home.chipNext', { section: nextSection })}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canAdvance ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outlined" leadingIcon="schedule" trailingIcon="keyboard_arrow_down" className="bg-surface-container-lowest">
                    {t('wallet.home.time.label')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" label={t('wallet.home.time.label')}>
                  {(
                    [
                      ['day', 'skip_next'],
                      ['week', 'fast_forward'],
                      ['month', 'calendar_month'],
                    ] as const
                  ).map(([kind, icon]) => (
                    <DropdownMenuItem key={kind} icon={icon} onSelect={() => advance(kind)}>
                      {t(`wallet.home.time.${kind}`)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <p className="text-body-small">{t('wallet.home.time.notYet')}</p>
            )}
            {whyKey && <WhyMatters screen={whyKey} />}
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

        <div className="grid grid-cols-1 items-start gap-(--space-bento-gap) expanded:grid-cols-2">
          {/* Balance (D-260): amounts can be hidden from people looking at the screen, and the account
              details (alias and CVU) are shown only on request, as wallets do */}
          <section aria-labelledby="balance-title" className={cn(card, '@container')}>
            <div className="flex items-center gap-3">
              <IconTile icon="account_balance_wallet" size="sm" />
              <h2 id="balance-title" className="min-w-0 flex-1 text-title-medium text-on-surface">{t('wallet.home.balance.title')}</h2>
              <IconButton
                icon={amountsHidden ? 'visibility_off' : 'visibility'}
                label={amountsHidden ? t('wallet.home.balance.show') : t('wallet.home.balance.hide')}
                aria-pressed={amountsHidden}
                onClick={() => setAmountsHidden(!amountsHidden)}
              />
            </div>
            {/* The full amount: one type role smaller on narrow cards instead of abbreviating it (2.7, D-287) */}
            <p className="text-headline-medium text-on-surface @sm:text-display-small">
              <MoneyText value={wallet.balance} />
            </p>
            <p className="flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-medium text-on-warning-container">
                <Icon name="trending_down" size={16} className="text-warning" />
                {t('wallet.home.balance.power')}
              </span>
              <MoneyText value={power.toFixed(2)} className="text-label-large text-on-surface" />
            </p>
            <div className="flex flex-col gap-3 border-t border-outline-variant pt-3">
              <Button
                variant="text"
                size="xs"
                className="self-start"
                leadingIcon="badge"
                trailingIcon={showAccount ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                aria-expanded={showAccount}
                aria-controls="account-details"
                onClick={() => setShowAccount((v) => !v)}
              >
                {showAccount ? t('wallet.home.balance.accountHide') : t('wallet.home.balance.account')}
              </Button>
              {showAccount && (
                <div id="account-details" className="flex flex-col gap-3 rounded-lg bg-surface-container p-3">
                  <p className="text-body-small text-on-surface-variant">{t('wallet.home.balance.accountHint')}</p>
                  {/* Label over value on phones, side by side from 24 rem of card (D-170) */}
                  <dl className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5 @xs:flex-row @xs:items-baseline @xs:justify-between @xs:gap-3">
                      <dt className="text-label-medium text-on-surface-variant">{t('wallet.home.balance.alias')}</dt>
                      <dd className="min-w-0 truncate text-body-medium text-on-surface">{alias}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 @xs:flex-row @xs:items-baseline @xs:justify-between @xs:gap-3">
                      <dt className="text-label-medium text-on-surface-variant">{t('wallet.home.balance.cvu')}</dt>
                      <dd className="text-body-medium text-on-surface tabular-nums">0000000 0000000 EJEMPLO 00</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </section>

          {/* Quick actions, and the pockets folded under their total (D-260) */}
          <section aria-labelledby="actions-title" className={cn(card, '@container')}>
            <h2 id="actions-title" className="text-title-medium text-on-surface">{t('wallet.home.actions.title')}</h2>
            {/* One row of four at every size, as wallets do (D-287) */}
            <ul className="-mx-2 grid grid-cols-4">
              {QUICK_ACTIONS.map((a) => (
                <li key={a.key} className="min-w-0">
                  <Link to={a.to} className="flex min-h-12 flex-col items-center gap-1.5 rounded-lg px-0.5 py-2 text-center text-label-medium text-balance text-on-surface hover:bg-surface-container">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
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
                  <button
                    type="button"
                    aria-expanded={showPockets}
                    aria-controls="home-pockets"
                    onClick={() => setShowPockets((v) => !v)}
                    className="-mx-2 flex min-h-12 items-center justify-between gap-2 rounded-lg px-2 text-left hover:bg-surface-container"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon name="savings" size={18} className="text-tertiary" />
                      <span className="text-label-large text-on-surface">{t('wallet.home.pockets.total')}</span>
                      <span className="text-label-medium text-on-surface-variant tabular-nums">({wallet.pockets.length})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MoneyText value={pocketsTotal(wallet).toFixed(2)} className="text-label-large text-on-surface" />
                      <Icon name={showPockets ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={20} className="text-primary" />
                      <span className="sr-only">{showPockets ? t('wallet.home.pockets.hide') : t('wallet.home.pockets.show')}</span>
                    </span>
                  </button>
                  {showPockets && (
                    <ul id="home-pockets" className="flex flex-col gap-2">
                      {wallet.pockets.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 text-body-medium">
                          <span className="flex min-w-0 items-center gap-2">
                            <Icon name={p.isEmergencyFund ? 'shield' : p.goal ? 'target' : 'savings'} size={18} className="text-tertiary" />
                            <span className="truncate">{p.name}</span>
                          </span>
                          <MoneyText value={p.amount} />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {next && <UnlockCard status={next} />}

        {/* Recent movements, with the category to confirm (D-114) */}
        <section aria-labelledby="movements-title" className={cn(card, '@container')}>
          <div className="flex items-center justify-between gap-2">
            <h2 id="movements-title" className="text-title-medium text-on-surface @md:text-title-large">{t('wallet.home.movements.title')}</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-body-medium text-on-surface-variant">{t('wallet.home.movements.empty')}</p>
          ) : (
            <ul
              id="movements-list"
              // Expanded, it scrolls inside its card so the page stays short; focusable for the keyboard
              {...(showAll ? { tabIndex: 0, 'aria-label': t('wallet.home.movements.allLabel', { count: allMovements.length }) } : {})}
              className={cn('flex flex-col divide-y divide-outline-variant', showAll && 'max-h-[32rem] overflow-y-auto rounded-lg pr-2 focus-visible:outline-2 focus-visible:outline-primary')}
            >
              {recent.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-2.5 @md:gap-4 @md:py-4">
                  <span
                    className={cn(
                      'inline-flex size-9 shrink-0 items-center justify-center rounded-full @md:size-10',
                      D(m.amount).isNegative() ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-container text-on-tertiary-container',
                    )}
                  >
                    <Icon name={MOVEMENT_ICON[m.type]} />
                  </span>
                  {/* Name and date on the left and the amount on the right, as wallets do; under it on the narrowest cards (D-287) */}
                  <span className="flex min-w-0 flex-1 flex-col gap-1 @min-[18rem]:flex-row @min-[18rem]:items-start @min-[18rem]:gap-3 @md:items-center @md:gap-4">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 block text-body-medium text-on-surface @md:line-clamp-2 @md:text-body-large">{m.counterparty}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-small text-on-surface-variant @md:mt-1.5">
                        {formatDate(walletDate(m.day))}
                        {CATEGORIZABLE.includes(m.type) && (
                          <CategoryChip movement={m} onChoose={(category) => {
                            update((s) => categorize(s, m.id, category));
                            toast.success(t('wallet.categorize.saved'));
                          }} />
                        )}
                      </span>
                    </span>
                    <MoneyText value={m.amount} trend flow className="shrink-0 text-label-medium @min-[18rem]:text-right @md:text-label-large" />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {allMovements.length > RECENT_SHOWN && (
            <Button
              variant="text"
              trailingIcon={showAll ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              className="self-start"
              aria-expanded={showAll}
              aria-controls="movements-list"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? t('wallet.home.movements.showLess') : t('wallet.home.movements.showAll', { count: allMovements.length })}
            </Button>
          )}
        </section>
      </div>
    </WalletShell>
  );
}

/** Movements shown before "Ver todos" (D-286). */
const RECENT_SHOWN = 5;

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
