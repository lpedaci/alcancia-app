import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MoneyText } from '@/components/money/MoneyText';
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

export function BottomNav({ active }: { active: 'home' | 'learn' }) {
  const { t } = useTranslation();
  return (
    <div className="grid shrink-0 grid-cols-5 border-t border-outline-variant bg-surface-container-lowest px-1 pt-1.5 pb-3">
      {NAV.map(({ key, icon }) => (
        <span key={key} className={cn('flex min-w-0 flex-col items-center gap-0.5 text-label-small', key === active ? 'text-on-surface' : 'text-on-surface-variant')}>
          <span className={cn('relative flex h-6 w-10 items-center justify-center rounded-full', key === active && 'bg-primary-container text-on-primary-container')}>
            <Icon name={icon} size={18} filled={key === active} />
            {key === 'invest' && <Icon name="lock" size={16} className="absolute -right-0.5 -bottom-0.5 rounded-full bg-surface-container-lowest" />}
          </span>
          <span className="max-w-full truncate">{t(`wallet.nav.${key}`)}</span>
        </span>
      ))}
    </div>
  );
}

/** Practice banner and top bar of the wallet on phones (5.3): Fuerte, the section, help, notifications, avatar. */
export function AppTopBar({ section }: { section: string }) {
  const { t } = useTranslation();
  return (
    <>
      <p className="flex shrink-0 items-center justify-center gap-1 bg-inverse-surface px-3 py-1 text-label-small text-inverse-on-surface">
        <Icon name="info" size={16} />
        {t('wallet.practiceBanner')}
      </p>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container-lowest px-3">
        <Fuerte state="neutral" lights={LIGHTS} size={1.75} />
        <span className="min-w-0 flex-1 truncate text-title-small text-on-surface">{section}</span>
        <Icon name="help" size={20} className="text-on-surface-variant" />
        <Icon name="notifications" size={20} className="text-on-surface-variant" />
        <Avatar name={MARIANA_NAME} role="participant" personId="p-mariana" size="sm" />
      </div>
    </>
  );
}

const card = 'flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-3';

/** P1 on a phone, as the wallet draws it at 320 px: mission card, greeting, balance and quick actions. */
function HomeScreen() {
  const { t } = useTranslation();
  const power = purchasingPowerToday(MARIANA);
  const actions: { key: 'transfer' | 'qr' | 'bills' | 'pockets'; icon: IconName }[] = [
    { key: 'transfer', icon: 'send_money' },
    { key: 'qr', icon: 'qr_code_scanner' },
    { key: 'bills', icon: 'receipt_long' },
    { key: 'pockets', icon: 'savings' },
  ];
  return (
    <>
      <AppTopBar section={t('wallet.nav.home')} />
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-3 py-3">
        {/* Active mission: fixed card above the content on phones */}
        <div className="flex items-center gap-2 rounded-lg border border-primary bg-surface-container-lowest p-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
            <Icon name="flag" size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-label-small text-primary">
              {t('wallet.home.mission.kickerMinutes', { minutes: 5 })}
            </span>
            <span className="block truncate text-title-small text-on-surface">{ACTIVE_MISSION}</span>
          </span>
          <Icon name="keyboard_arrow_up" size={20} className="text-on-surface-variant" />
        </div>
        {/* Greeting */}
        <div className="flex flex-col gap-1.5 rounded-lg bg-primary-container p-3 text-on-primary-container">
          <p className="text-label-small">
            {formatDate(walletDate(MARIANA.day))} · {t('wallet.home.day', { day: MARIANA.day })}
          </p>
          <p className="text-title-large">
            {t('wallet.home.hello')} <span className="text-primary">Mariana</span>
          </p>
          <p className="text-body-small">{t('wallet.home.fuerteInvest', { months: '2,3' })}</p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="rounded-full bg-surface-container-lowest px-2 py-0.5 text-label-small text-on-surface">
              {t('wallet.home.chipLevel', { level: 6, section: t('wallet.sections.level-6') })}
            </span>
            <span className="rounded-full bg-tertiary-container px-2 py-0.5 text-label-small text-on-tertiary-container">{t('wallet.home.chipNext', { section: t('wallet.sections.level-7') })}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 rounded-sm bg-secondary-container px-2 py-1 text-label-small text-on-secondary-container">
              <Icon name="skip_next" size={16} />
              {t('wallet.home.advance.day')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm border border-outline px-2 py-1 text-label-small text-primary">
              <Icon name="fast_forward" size={16} />
              {t('wallet.home.advance.week')}
            </span>
          </div>
        </div>
        {/* Balance */}
        <div className={card}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-label-medium text-on-surface-variant">{t('wallet.home.balance.title')}</p>
            <span className="flex size-7 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
              <Icon name="account_balance_wallet" size={16} />
            </span>
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
        {/* Quick actions */}
        <div className={card}>
          <p className="text-label-medium text-on-surface-variant">{t('wallet.home.actions.title')}</p>
          {/* Two per row, as the wallet's container query lays them out at 320 px */}
          <div className="grid grid-cols-2 gap-2">
            {actions.map(({ key, icon }) => (
              <span key={key} className="flex min-w-0 flex-col items-center gap-1 text-center text-label-small text-on-surface">
                <span className="flex size-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <Icon name={icon} size={18} />
                </span>
                {t(`wallet.home.actions.${key}`)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <BottomNav active="home" />
    </>
  );
}

function LevelsScreen() {
  const { t } = useTranslation();
  const names = t('landing.phone.levels', { returnObjects: true }) as string[];
  return (
    <>
      <AppTopBar section={t('wallet.nav.learn')} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
        <div>
          <p className="text-title-medium text-on-surface">{t('landing.phone.levelsTitle')}</p>
          <p className="text-label-small text-on-surface-variant">{t('landing.phone.levelsSubtitle')}</p>
        </div>
        <ol className="flex flex-col">
          {names.map((name, i) => {
            const done = i < 6;
            return (
              <li key={name} className="flex gap-2.5">
                <span className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full',
                      done ? 'bg-success text-on-success' : 'border border-outline bg-surface-container-lowest text-on-surface-variant',
                    )}
                  >
                    <Icon name={done ? 'check' : 'lock'} size={16} />
                  </span>
                  {i < names.length - 1 && <span className={cn('h-4 w-0.5', done ? 'bg-success' : 'bg-outline-variant')} />}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-label-small text-on-surface-variant">{t('landing.phone.levelPrefix', { n: i + 1 })}</span>
                  <span className={cn('block text-label-large', done ? 'text-on-surface' : 'text-on-surface-variant')}>{name}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-auto flex flex-col gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <p className="flex items-center gap-1 text-label-medium text-on-surface">
            <Icon name="lock" size={16} /> {t('landing.phone.missing')}
          </p>
          <p className="text-label-small text-on-surface-variant">{t('landing.phone.missingFund')}</p>
          <span className="h-1.5 rounded-full bg-surface-container">
            <span className="block h-1.5 w-2/3 rounded-full bg-tertiary" />
          </span>
        </div>
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
      <AppTopBar section={t('wallet.nav.learn')} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
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
