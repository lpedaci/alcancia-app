import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MoneyText } from '@/components/money/MoneyText';
import { Logo } from '@/components/layout/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Fuerte } from '@/features/companion/Fuerte';
import { buildMariana } from '@/features/wallet/engine/demo';
import { purchasingPowerToday } from '@/features/wallet/engine/engine';
import { formatDate, walletDate } from '@/lib/dates';
import { D, purchasingPower } from '@/lib/finance';
import { formatPercent } from '@/lib/money';
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type PhoneScreen = 'home' | 'levels' | 'tool';

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
export function PhoneFrame({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={cn('relative mx-auto w-80 max-w-full shrink-0 rounded-2xl bg-on-surface p-2.5', className)}>
      <div className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[calc(var(--radius-2xl)-0.625rem)] bg-surface">
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

/** Fuerte floating over the bottom navigation (D-160, D-164), as in the wallet. */
function FloatingFuerte() {
  return (
    <span aria-hidden className="pointer-events-none absolute right-2 bottom-16 z-10">
      <Fuerte state="greeting" lights={LIGHTS} size={2.75} />
      <span className="absolute top-1 right-1 size-2.5 rounded-full border-2 border-surface-container-lowest bg-primary" />
    </span>
  );
}

const card = 'flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-3';

/**
 * P1 on a phone, as the wallet draws it today at 375 px (D-256): the pending mission, the greeting with its
 * date and day chips, level and next unlock, "¿Por qué importa?" and the time controls with their label,
 * and the balance card with its icon on the left (D-228), the purchasing power and the alias.
 */
function HomeScreen() {
  const { t } = useTranslation();
  const power = purchasingPowerToday(MARIANA);
  const chip = 'inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest px-2 py-0.5 text-label-small whitespace-nowrap';
  return (
    <>
      <AppTopBar />
      <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 py-2.5">
        {/* Pending mission of an earlier level */}
        <div className="flex items-center gap-2 rounded-lg border border-primary bg-surface-container-lowest p-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
            <Icon name="flag" size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-label-small text-primary">{t('wallet.home.mission.kickerEarlier', { level: 5, minutes: 5 })}</span>
            <span className="block truncate text-label-large text-on-surface">{ACTIVE_MISSION}</span>
          </span>
          <Icon name="arrow_forward" size={16} className="text-primary" />
        </div>
        {/* Greeting */}
        <div className="flex flex-col gap-1.5 rounded-lg bg-primary-container p-2.5 text-on-primary-container">
          <span className="flex flex-wrap gap-1">
            <span className={cn(chip, 'text-on-surface-variant')}>
              <Icon name="calendar_month" size={16} className="text-primary" />
              {formatDate(walletDate(MARIANA.day))}
            </span>
            <span className={cn(chip, 'text-on-surface-variant')}>
              <Icon name="today" size={16} className="text-primary" />
              {t('wallet.home.dayChip', { day: MARIANA.day })}
            </span>
          </span>
          <p className="text-title-large">
            {t('wallet.home.hello')} <span className="text-primary">Mariana</span>
          </p>
          <span className="flex flex-wrap gap-1">
            <span className={cn(chip, 'font-medium text-on-surface')}>
              <Icon name="route" size={16} className="text-primary" />
              {t('wallet.home.chipLevel', { level: 6, section: t('wallet.sections.level-6') })}
            </span>
            <span className={cn(chip, 'text-on-surface-variant')}>
              <Icon name="lock" size={16} />
              {t('wallet.home.chipNext', { section: t('wallet.sections.level-7') })}
            </span>
          </span>
          <span className="text-label-small font-medium">{t('wallet.home.time.label')}</span>
          <span className="grid grid-cols-3 gap-0.5 rounded-md bg-surface-container-lowest p-0.5">
            {(['day', 'week', 'month'] as const).map((k) => (
              <span key={k} className="truncate rounded-sm px-1 py-1 text-center text-label-small text-primary">
                {t(`wallet.home.time.${k}`)}
              </span>
            ))}
          </span>
          <span className={cn(chip, 'w-fit py-1 text-primary')}>
            <Icon name="lightbulb" size={16} />
            {t('cards.why')}
            <Icon name="keyboard_arrow_down" size={16} />
          </span>
        </div>
        {/* Balance: the section icon on the left with its title (D-228) */}
        <div className={card}>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
              <Icon name="account_balance_wallet" size={16} />
            </span>
            <p className="text-label-large text-on-surface">{t('wallet.home.balance.title')}</p>
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
          <span className="flex flex-col gap-0.5 border-t border-outline-variant pt-2">
            <span className="text-label-small text-on-surface-variant">{t('wallet.home.balance.alias')}</span>
            <span className="text-label-medium text-on-surface">alcancia.practica.mariana</span>
          </span>
        </div>
        <FloatingFuerte />
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

function ToolScreen() {
  const { t } = useTranslation();
  const result = purchasingPower({ amount: '100000', rate: '0.03', periods: 12 });
  // Purchasing power month by month, as a flat area chart (2.2: no gradients).
  const points = Array.from({ length: 13 }, (_, m) => D(100000).div(D(1.03).pow(m)).toNumber());
  const x = (m: number) => (m / 12) * 220;
  const y = (v: number) => 90 - ((v - 60000) / 40000) * 80;
  const line = points.map((v, m) => `${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <>
      <AppTopBar />
      <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
        <p className="text-title-medium text-on-surface">{t('landing.phone.toolTitle')}</p>
        <div className="flex gap-1">
          {['1,5 %', '3 %', '6 %'].map((s, i) => (
            <span
              key={s}
              className={cn(
                'rounded-sm border px-2 py-1 text-label-small',
                i === 1 ? 'border-secondary-container bg-secondary-container text-on-secondary-container' : 'border-outline text-on-surface-variant',
              )}
            >
              {i === 1 && <Icon name="check" size={16} className="mr-0.5 inline" />}
              {s}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-small text-on-surface-variant">{t('landing.phone.toolResult')}</p>
          <p className="text-headline-small text-primary">
            <MoneyText value={result.purchasingPower} />
          </p>
          <p className="text-label-small text-on-surface">{t('landing.phone.toolPhrase', { loss: formatPercent(result.loss, { decimals: 1 }) })}</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <svg viewBox="0 0 220 96" className="h-auto w-full" aria-hidden>
            <line x1="0" y1="90" x2="220" y2="90" className="stroke-outline-variant" strokeWidth="1" />
            <polygon points={`0,90 ${line} 220,90`} className="fill-primary opacity-15" />
            <polyline points={line} fill="none" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-auto flex items-center gap-1 text-label-small text-on-surface-variant">
          <Icon name="info" size={16} /> {t('landing.phone.toolScenario')}: 3 % · {t('landing.phone.toolExample')}
        </p>
        <FloatingFuerte />
      </div>
      <BottomNav active="learn" />
    </>
  );
}

const SCREENS: Record<PhoneScreen, () => ReactNode> = { home: HomeScreen, levels: LevelsScreen, tool: ToolScreen };

/** The phone with one of the three screens; switching screens crossfades (opacity only with reduced motion). */
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
