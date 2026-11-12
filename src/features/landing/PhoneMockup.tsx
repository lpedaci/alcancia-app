import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MoneyText } from '@/components/money/MoneyText';
import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PILOT } from '@/features/wallet/pilot-fixture';
import { D, priceIndex, purchasingPower } from '@/lib/finance';
import { formatPercent } from '@/lib/money';
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type PhoneScreen = 'home' | 'levels' | 'tool';

/**
 * A smartphone at real size (about 18 rem wide, 9:19 screen) with screens drawn with the same
 * components and data as the wallet (Mariana's pilot until the engine of step 6 generates it).
 * Never a screenshot and never a real wallet's look (1.1.1). The whole phone is one image for
 * assistive tech: its label says which screen it shows.
 */
export function PhoneFrame({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={cn('relative mx-auto w-72 max-w-full shrink-0 rounded-2xl bg-on-surface p-2.5', className)}>
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
        <span key={key} className={cn('flex flex-col items-center gap-0.5 text-label-small', key === active ? 'text-on-surface' : 'text-on-surface-variant')}>
          <span className={cn('relative flex h-6 w-10 items-center justify-center rounded-full', key === active && 'bg-primary-container text-on-primary-container')}>
            <Icon name={icon} size={18} filled={key === active} />
            {key === 'invest' && <Icon name="lock" size={16} className="absolute -right-0.5 -bottom-0.5 rounded-full bg-surface-container-lowest" />}
          </span>
          {t(`landing.phone.nav.${key}`)}
        </span>
      ))}
    </div>
  );
}

function HomeScreen() {
  const { t } = useTranslation();
  const power = D(PILOT.balance).div(priceIndex(PILOT.day, PILOT.monthlyInflation));
  const actions: { key: 'transfer' | 'qr' | 'bills' | 'pockets'; icon: IconName }[] = [
    { key: 'transfer', icon: 'send_money' },
    { key: 'qr', icon: 'qr_code_scanner' },
    { key: 'bills', icon: 'receipt_long' },
    { key: 'pockets', icon: 'savings' },
  ];
  return (
    <>
      <p className="shrink-0 bg-inverse-surface px-3 py-1 text-center text-label-small text-inverse-on-surface">{t('landing.phone.banner')}</p>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-title-small text-on-surface">{t('landing.phone.hello')}</p>
          <Avatar name={PILOT.personName} role="participant" size="sm" />
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-small text-on-surface-variant">{t('landing.phone.balance')}</p>
          <p className="text-title-large text-on-surface">
            <MoneyText value={PILOT.balance} />
          </p>
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-small text-on-warning-container">
            <Icon name="trending_down" size={16} className="text-warning" />
            {t('landing.phone.power')}: <MoneyText value={power.toFixed(2)} />
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {actions.map(({ key, icon }) => (
            <span key={key} className="flex flex-col items-center gap-1 text-label-small text-on-surface">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <Icon name={icon} size={18} />
              </span>
              {t(`landing.phone.actions.${key}`)}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg bg-primary-container p-3 text-on-primary-container">
          <p className="text-label-small">{t('landing.phone.mission')}</p>
          <p className="text-title-small">{t('landing.phone.missionTitle')}</p>
          <span className="h-1.5 rounded-full bg-surface-container-lowest">
            <span className="block h-1.5 w-1/2 rounded-full bg-primary" />
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-label-medium text-on-surface">{t('landing.phone.movements')}</p>
          {PILOT.movements.slice(0, 3).map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                <Icon name={m.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-label-small text-on-surface">{m.counterparty}</span>
              <span className="text-label-small text-on-surface">
                <MoneyText value={m.amount} />
              </span>
            </div>
          ))}
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
