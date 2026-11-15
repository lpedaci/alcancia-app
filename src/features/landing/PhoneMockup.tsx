import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MoneyText } from '@/components/money/MoneyText';
import { Logo } from '@/components/layout/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Fuerte } from '@/features/companion/Fuerte';
import { buildMariana } from '@/features/wallet/engine/demo';
import { loanOffer, purchasingPowerToday, walletMetrics } from '@/features/wallet/engine/engine';
import { formatDate, walletDate } from '@/lib/dates';
import { D } from '@/lib/finance';
import { formatNumber, formatPercent } from '@/lib/money';
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type PhoneScreen = 'home' | 'mission' | 'card' | 'pockets' | 'levels';

/** Mariana's demo wallet, generated once by the engine (wallet-engine.md, section 12). */
const MARIANA = buildMariana();
const MARIANA_NAME = 'Mariana López';
const LIGHTS = 6;
const ACTIVE_MISSION = 'El préstamo tentador';

/**
 * A smartphone at real size (20 rem wide, 9:19 screen) with screens drawn with the same
 * components and data as the wallet (Mariana's pilot until the engine of step 6 generates it).
 * Never a screenshot and never a real wallet's look (1.1.1). The whole phone is one image for
 * assistive tech: its label says which screen it shows.
 */
/** `compact`: a shorter screen (9:17.5) for sections where the full height only adds empty space (D-283). */
export function PhoneFrame({ children, label, className, compact = false }: { children: ReactNode; label: string; className?: string; compact?: boolean }) {
  return (
    <div role="img" aria-label={label} className={cn('relative mx-auto w-80 max-w-full shrink-0 rounded-2xl bg-on-surface p-2.5', className)}>
      <div className={cn('relative flex flex-col overflow-hidden rounded-[calc(var(--radius-2xl)-0.625rem)] bg-surface', compact ? 'aspect-[9/17.5]' : 'aspect-[9/19]')}>
        {/* Camera island */}
        <span aria-hidden className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-on-surface" />
        {children}
      </div>
    </div>
  );
}

export function StatusBar() {
  const { t } = useTranslation();
  return (
    <div className="flex h-9 shrink-0 items-end justify-between px-6 pb-1 text-label-small text-on-surface">
      <span className="tabular-nums">{t('landing.phone.time')}</span>
      <span className="flex items-center gap-1">
        <Icon name="wifi" size={16} />
        <span className="h-2.5 w-5 rounded-xs border border-on-surface p-px">
          <span className="block h-full w-3/4 rounded-[1px] bg-on-surface" />
        </span>
      </span>
    </div>
  );
}

const NAV: { key: 'home' | 'pay' | 'save' | 'invest' | 'learn'; icon: IconName }[] = [
  { key: 'home', icon: 'home' },
  { key: 'pay', icon: 'payments' },
  { key: 'save', icon: 'savings' },
  { key: 'invest', icon: 'trending_up' },
  { key: 'learn', icon: 'school' },
];

/** Bottom navigation of phones (D-72): icons only, and the name only under the active destination. */
export function BottomNav({ active }: { active: 'home' | 'learn' }) {
  const { t } = useTranslation();
  return (
    <div className="grid shrink-0 grid-cols-5 border-t border-outline-variant bg-surface-container-lowest px-1 pt-2 pb-3">
      {NAV.map(({ key, icon }) => (
        <span key={key} className={cn('flex min-w-0 flex-col items-center gap-0.5', key === active ? 'text-on-surface' : 'text-on-surface-variant')}>
          <span className={cn('relative flex h-7 w-11 items-center justify-center rounded-full', key === active && 'bg-secondary-container text-on-secondary-container')}>
            <Icon name={icon} size={20} filled={key === active} />
            {key === 'invest' && <Icon name="lock" size={16} className="absolute -right-0.5 -bottom-0.5 rounded-full bg-surface-container-lowest" />}
          </span>
          <span className="sr-only">{t(`wallet.nav.${key}`)}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Top bar of the wallet on phones (D-169): the logo with the "Dinero ficticio" chip on the same row,
 * "Ver como", notifications and the avatar. The section is named by the page, not by the bar.
 */
export function AppTopBar({ person = 'mariana' }: { person?: 'mariana' | 'diego'; section?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-outline-variant bg-surface-container-lowest px-3">
      <Logo compact />
      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container px-2 py-0.5 text-label-small whitespace-nowrap text-on-surface-variant">
        <Icon name="info" size={16} />
        {t('wallet.practiceBannerShort')}
      </span>
      <span className="flex-1" />
      <span className="flex size-7 items-center justify-center rounded-sm border border-outline text-primary">
        <Icon name="swap_horiz" size={16} />
      </span>
      <span className="relative flex size-7 items-center justify-center text-on-surface-variant">
        <Icon name="notifications" size={20} />
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-error text-label-small leading-none text-on-error tabular-nums">4</span>
      </span>
      <Avatar name={person === 'diego' ? 'Diego Suárez' : MARIANA_NAME} role="participant" personId={`p-${person}`} size="sm" />
    </div>
  );
}

/** Fuerte floating over the bottom navigation (D-160, D-164), with his badge and, when he has
 *  something to tell, the bubble beside him (D-290). */
function FloatingFuerte({ bubble, count = 0, state = 'greeting' }: { bubble?: string; count?: number; state?: 'greeting' | 'thinking' | 'attention' | 'celebration' }) {
  return (
    <>
      {bubble && (
        <span aria-hidden className="pointer-events-none absolute right-16 bottom-[4.5rem] z-10 max-w-[11rem] rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-label-small text-on-surface shadow-elevation-1">
          {bubble}
        </span>
      )}
      <span aria-hidden className="pointer-events-none absolute right-2 bottom-16 z-10">
        <Fuerte state={state} lights={LIGHTS} size={2.75} />
        {count > 0 && (
          <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary px-0.5 text-[0.625rem] leading-none text-on-primary tabular-nums">
            {count}
          </span>
        )}
      </span>
    </>
  );
}

const card = 'flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-3';

/** The round icon buttons of the page headers (D-288, D-289): time and "¿Por qué importa?". */
function HeaderButtons({ time = false }: { time?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {time && (
        <span className="flex size-8 items-center justify-center rounded-full border border-outline bg-surface-container-lowest text-primary">
          <Icon name="schedule" size={16} />
        </span>
      )}
      <span className="flex size-8 items-center justify-center rounded-full bg-warning-container text-on-warning-container">
        <Icon name="lightbulb" size={16} />
      </span>
    </span>
  );
}

const QUICK: { key: 'transfer' | 'qr' | 'bills' | 'pockets'; icon: IconName }[] = [
  { key: 'transfer', icon: 'send_money' },
  { key: 'qr', icon: 'qr_code_scanner' },
  { key: 'bills', icon: 'receipt_long' },
  { key: 'pockets', icon: 'savings' },
];

/**
 * P1 on a phone, as the wallet draws it today: the greeting as the page header with the time and
 * "¿Por qué importa?" buttons on the right, the full balance, the quick actions in a row, and Fuerte
 * telling the pending mission in his bubble (D-287 to D-293).
 */
function HomeScreen() {
  const { t } = useTranslation();
  const power = purchasingPowerToday(MARIANA);
  return (
    <>
      <AppTopBar />
      <div className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-2.5 py-3">
        <div className="flex items-end justify-between gap-2 px-0.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-label-small text-on-surface-variant tabular-nums">
              {formatDate(walletDate(MARIANA.day))} · {t('wallet.home.dayChip', { day: MARIANA.day })}
            </span>
            <p className="text-title-large text-on-surface">
              {t('wallet.home.hello')} <span className="text-primary">Mariana</span>
            </p>
            <span className="flex items-center gap-1 text-label-medium text-primary">
              <Icon name="route" size={16} />
              {t('wallet.home.chipLevel', { level: 6, section: t('wallet.sections.level-6') })}
            </span>
          </div>
          <HeaderButtons time />
        </div>
        <div className={card}>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
              <Icon name="account_balance_wallet" size={16} />
            </span>
            <p className="min-w-0 flex-1 text-label-large text-on-surface">{t('wallet.home.balance.title')}</p>
            <Icon name="visibility" size={18} className="text-on-surface-variant" />
          </div>
          <p className="text-headline-small text-on-surface">
            <MoneyText value={MARIANA.balance} />
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-small whitespace-nowrap text-on-warning-container">
              <Icon name="trending_down" size={16} className="text-warning" />
              {t('wallet.home.balance.power')}
            </span>
            <span className="text-label-medium text-on-surface">
              <MoneyText value={power.toFixed(2)} />
            </span>
          </p>
        </div>
        <div className={card}>
          <p className="text-label-large text-on-surface">{t('wallet.home.actions.title')}</p>
          <span className="grid grid-cols-4">
            {QUICK.map((a) => (
              <span key={a.key} className="flex min-w-0 flex-col items-center gap-1 text-center">
                <span className="flex size-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <Icon name={a.icon} size={18} />
                </span>
                <span className="text-[0.625rem] leading-tight text-on-surface">{t(`wallet.home.actions.${a.key}`)}</span>
              </span>
            ))}
          </span>
        </div>
        <div className={card}>
          <p className="text-label-large text-on-surface">{t('wallet.home.movements.title')}</p>
          {[...MARIANA.movements].reverse().slice(0, 3).map((m) => (
            <span key={m.id} className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                <Icon name={m.type === 'yield' ? 'trending_up' : m.type === 'income' ? 'payments' : 'qr_code_2'} size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-label-small text-on-surface">{m.counterparty}</span>
              <MoneyText value={m.amount} trend flow className="shrink-0 text-label-small" />
            </span>
          ))}
        </div>
        <FloatingFuerte state="thinking" count={2} bubble={t('wallet.fuerte.notices.mission', { title: ACTIVE_MISSION, minutes: 5 })} />
      </div>
      <BottomNav active="home" />
    </>
  );
}

/** A mission step on a phone (D-250): the progress, the offer with the CFT first and Fuerte's warning. */
function MissionScreen() {
  const { t } = useTranslation();
  const offer = loanOffer(MARIANA);
  return (
    <>
      <AppTopBar />
      <div className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-2.5 py-3">
        <div className="flex flex-col gap-1 px-0.5">
          <span className="text-label-small text-primary">{t('landing.phone.missionKicker')}</span>
          <p className="text-title-large text-on-surface">{ACTIVE_MISSION}</p>
          <span className="grid grid-cols-6 gap-1" aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={cn('h-1 rounded-full', i < 2 ? 'bg-primary' : 'bg-outline-variant')} />
            ))}
          </span>
        </div>
        <div className={card}>
          <span className="flex items-center gap-1 text-label-small text-on-surface-variant">
            <Icon name="request_quote" size={16} className="text-primary" />
            {t('landing.phone.offerKicker')}
          </span>
          {/* The CFT before the installment (D-178) */}
          <div className="flex items-end justify-between gap-2 rounded-md bg-warning-container px-2.5 py-2 text-on-warning-container">
            <span className="text-label-medium">{t('landing.phone.offerCft')}</span>
            <span className="text-title-large tabular-nums">{formatPercent(offer.cft, { decimals: 1 })}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-label-small">
            <dt className="text-on-surface-variant">{t('landing.phone.offerInstallment', { n: offer.months })}</dt>
            <dd className="text-right text-on-surface"><MoneyText value={offer.installment.toFixed(2)} /></dd>
            <dt className="text-on-surface-variant">{t('landing.phone.offerReceived')}</dt>
            <dd className="text-right text-on-surface"><MoneyText value={offer.received.toFixed(2)} /></dd>
            <dt className="font-medium text-on-surface">{t('landing.phone.offerTotal')}</dt>
            <dd className="text-right font-medium text-on-surface"><MoneyText value={offer.total.toFixed(2)} /></dd>
          </dl>
        </div>
        {/* Fuerte's warning, as a chat bubble (D-291) */}
        <div className="flex items-start gap-2">
          <Fuerte state="attention" lights={LIGHTS} size={2.25} />
          <p className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-primary-container/50 px-3 py-2 text-label-medium text-on-surface">{t('landing.phone.missionFuerte')}</p>
        </div>
        <span className="mt-auto ml-auto inline-flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-label-medium text-on-primary">
          {t('landing.phone.continue')}
          <Icon name="arrow_forward" size={16} />
        </span>
      </div>
      <BottomNav active="home" />
    </>
  );
}

/** A learning card in the right moment (D-76): after transferring to someone new, with its source and question. */
function CardScreen() {
  const { t } = useTranslation();
  return (
    <>
      <AppTopBar />
      <div className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-2.5 py-3">
        {/* The receipt behind, dimmed by the sheet */}
        <div className={cn(card, 'opacity-60')}>
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-success-container text-success">
              <Icon name="check_circle" size={16} filled />
            </span>
            <span className="text-label-large text-on-surface">{t('landing.phone.transferDone')}</span>
          </span>
          <span className="text-headline-small text-on-surface"><MoneyText value="18500.00" /></span>
          <span className="text-label-small text-on-surface-variant">{t('landing.phone.transferTo')}</span>
        </div>
        <span aria-hidden className="absolute inset-0 bg-scrim/20" />
        {/* The card as a bottom sheet */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 rounded-t-2xl border-t border-outline-variant bg-surface-container-lowest px-3 pt-2 pb-3 shadow-elevation-2">
          <span aria-hidden className="mx-auto h-1 w-8 rounded-full bg-outline-variant" />
          <span className="flex items-center gap-2">
            <Fuerte state="thinking" lights={LIGHTS} size={1.75} />
            <span className="text-label-small text-primary">{t('landing.phone.cardKicker')}</span>
          </span>
          <p className="text-title-small text-on-surface">{t('landing.phone.cardTitle')}</p>
          <p className="text-label-small text-on-surface-variant">{t('landing.phone.cardBody')}</p>
          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-outline-variant px-2 py-0.5 text-[0.625rem] text-on-surface-variant">
            <Icon name="account_balance" size={16} className="text-primary" />
            {t('landing.phone.cardSource')}
          </span>
          <p className="text-label-medium text-on-surface">{t('landing.phone.cardQuestion')}</p>
          <span className="flex flex-col gap-1">
            <span className="rounded-md border border-primary bg-primary-container/60 px-2 py-1.5 text-label-small text-on-surface">{t('landing.phone.cardOptionA')}</span>
            <span className="rounded-md border border-outline-variant px-2 py-1.5 text-label-small text-on-surface">{t('landing.phone.cardOptionB')}</span>
          </span>
        </div>
      </div>
      <BottomNav active="home" />
    </>
  );
}

/** Apartados y metas on a phone: the emergency fund with its months, as the unlock of Invertir asks. */
function PocketsScreen() {
  const { t } = useTranslation();
  const months = walletMetrics(MARIANA).emergency_months;
  const fund = MARIANA.pockets.find((p) => p.isEmergencyFund)!;
  const goals = MARIANA.pockets.filter((p) => !p.isEmergencyFund);
  const pct = (p: { amount: string; goal?: string }) => (p.goal ? Math.min(100, D(p.amount).div(p.goal).times(100).toNumber()) : 0);
  return (
    <>
      <AppTopBar />
      <div className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-2.5 py-3">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="text-title-large text-on-surface">{t('wallet.sub.pockets')}</p>
          <HeaderButtons />
        </div>
        <div className={cn(card, 'border-tertiary')}>
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-tertiary-container text-on-tertiary-container">
              <Icon name="shield" size={16} />
            </span>
            <span className="min-w-0 flex-1 text-label-large text-on-surface">{fund.name}</span>
          </span>
          <span className="text-headline-small text-on-surface"><MoneyText value={fund.amount} /></span>
          <span className="relative h-2 overflow-hidden rounded-full bg-surface-container-high">
            <span className="absolute inset-y-0 left-0 rounded-full bg-tertiary" style={{ width: `${pct(fund)}%` }} />
          </span>
          <span className="flex items-center justify-between gap-2 text-label-small">
            <span className="text-on-surface">{t('landing.phone.fundMonths', { months: formatNumber(months, 1) })}</span>
            <span className="inline-flex items-center gap-1 text-on-surface-variant">
              <Icon name="lock" size={16} />
              {t('wallet.sections.level-7')}
            </span>
          </span>
        </div>
        {goals.map((g) => (
          <div key={g.id} className={card}>
            <span className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
                <Icon name={g.goal ? 'flag' : 'savings'} size={16} />
              </span>
              <span className="min-w-0 flex-1 text-label-large text-on-surface">{g.name}</span>
              <span className="text-label-medium text-on-surface"><MoneyText value={g.amount} /></span>
            </span>
            {g.goal && (
              <span className="relative h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pct(g)}%` }} />
              </span>
            )}
          </div>
        ))}
        <FloatingFuerte state="thinking" count={2} />
      </div>
      <BottomNav active="home" />
    </>
  );
}

/** P9 on a phone, as the level map looks today (D-254): compact rows, the check on the node, the current level outlined. */
function LevelsScreen() {
  const { t } = useTranslation();
  const rows = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <>
      <AppTopBar />
      <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 py-2.5">
        <p className="text-title-large text-on-surface">{t('wallet.nav.learn')}</p>
        <div className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5">
          <p className="pb-1 text-title-small text-on-surface">{t('learn.map.levels')}</p>
          <ol className="flex flex-col">
            {rows.map((n) => {
              const done = n < 6;
              const current = n === 6;
              return (
                <li key={n} className="relative flex gap-2 pb-1.5">
                  {n < rows.length - 1 && <span aria-hidden className="absolute top-7 bottom-0 left-3 w-0.5 -translate-x-1/2 bg-outline-variant" />}
                  <span
                    className={cn(
                      'relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                      done && 'bg-success-container text-success',
                      current && 'bg-primary text-on-primary',
                      !done && !current && 'bg-surface-container text-on-surface-variant',
                    )}
                  >
                    <Icon name={done ? 'check_circle' : current ? 'play_arrow' : 'lock'} size={16} filled={done} />
                  </span>
                  <span
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1',
                      current && 'border border-primary bg-primary-container/40',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-label-large text-on-surface">
                      {t('learn.map.levelName', { n, name: t(`wallet.sections.level-${n}`) })}
                    </span>
                    {current && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success-container px-1.5 text-label-small text-on-success-container">
                        <Icon name="check_circle" size={16} className="text-success" />
                        {t('learn.map.current')}
                      </span>
                    )}
                    <Icon name="keyboard_arrow_down" size={16} className="shrink-0 text-primary" />
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <FloatingFuerte />
      </div>
      <BottomNav active="learn" />
    </>
  );
}

const SCREENS: Record<PhoneScreen, () => ReactNode> = { home: HomeScreen, mission: MissionScreen, card: CardScreen, pockets: PocketsScreen, levels: LevelsScreen };

/** The phone with one of its five screens (D-300); switching screens crossfades (opacity only with reduced motion). */
export function AppPhone({ screen, className }: { screen: PhoneScreen; className?: string }) {
  const { t } = useTranslation();
  const reduce = useShouldReduceMotion();
  const Screen = SCREENS[screen];
  return (
    <PhoneFrame label={t('landing.phone.label', { screen: t(`landing.phone.screens.${screen}`) })} className={className}>
      <StatusBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, x: reduce ? 0 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduce ? 0 : -12 }}
          transition={{ duration: duration.medium, ease: easing.standard }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
    </PhoneFrame>
  );
}
