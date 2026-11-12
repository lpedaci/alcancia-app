import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { SkipLink } from '@/components/layout/InPageLink';
import { Logo } from '@/components/layout/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { ViewAsMenu } from '@/components/layout/ViewAsMenu';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { FuerteFab } from '@/features/companion/FuerteFab';
import type { FuerteState } from '@/features/companion/Fuerte';
import { completedLights } from '@/features/levels/engine';
import { LEVEL_ROUTE } from '@/features/levels/UnlockCard';
import { AREA_LEVEL, useLevels } from '@/features/levels/use-levels';
import { useMediaQuery } from '@/lib/use-media-query';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/store/session-store';

/**
 * The participant's only navigation (CLAUDE.md 5.3): the same 5 destinations at every size.
 * Phones (< 600 px): top bar and bottom navigation bar. Tablets and desktop: a side menu that folds
 * into a rail of icons with the menu button of the top bar (2.2.1, pattern 5). Locks come from the
 * level engine; a locked destination still opens, to show what is missing (5.0).
 */
export interface Destination {
  id: 'home' | 'pay' | 'save' | 'invest' | 'learn';
  to: string;
  icon: IconName;
  subsections?: { key: string; to: string }[];
}

export const DESTINATIONS: Destination[] = [
  { id: 'home', to: '/app', icon: 'home' },
  {
    id: 'pay',
    to: '/app/pay',
    icon: 'payments',
    subsections: [
      { key: 'transfer', to: '/app/pay/transfer' },
      { key: 'qr', to: '/app/pay/qr' },
      { key: 'bills', to: '/app/pay/bills' },
      { key: 'credit', to: '/app/pay/credit' },
    ],
  },
  {
    id: 'save',
    to: '/app/save/budget',
    icon: 'savings',
    subsections: [
      { key: 'budget', to: '/app/save/budget' },
      { key: 'pockets', to: '/app/save/pockets' },
      { key: 'yield', to: '/app/save/yield' },
    ],
  },
  { id: 'invest', to: '/app/invest', icon: 'trending_up' },
  { id: 'learn', to: '/app/learn', icon: 'school', subsections: [{ key: 'map', to: '/app/learn' }, { key: 'tools', to: '/app/tools' }] },
];

/** Path prefixes of each destination: Aprender also covers the tools and the missions (P12, P13). */
const ACTIVE_PREFIXES: Record<Destination['id'], string[]> = {
  home: [],
  pay: ['/app/pay'],
  save: ['/app/save'],
  invest: ['/app/invest'],
  learn: ['/app/learn', '/app/tools', '/app/missions'],
};

export function isDestinationActive(d: Pick<Destination, 'id'>, pathname: string): boolean {
  if (d.id === 'home') return pathname === '/app' || pathname === '/app/';
  return ACTIVE_PREFIXES[d.id].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const NAV_PREF = 'alcancia-ui:nav-expanded';
function readNavPref(): boolean | null {
  try {
    const value = localStorage.getItem(NAV_PREF);
    return value === null ? null : value === '1';
  } catch {
    return null;
  }
}

export interface FuerteNote {
  state?: FuerteState;
  message: string;
  why?: string;
  action?: ReactNode;
}

export function WalletShell({ section, children, fuerte }: { section: string; children: ReactNode; fuerte?: FuerteNote }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useCurrentUser();
  const { statuses, next, isOpen } = useLevels(user?.personId ?? '');
  const lights = completedLights(statuses);
  const isLarge = useMediaQuery('(min-width: 75rem)', true);
  const [expandedPref, setExpandedPref] = useState<boolean | null>(readNavPref);
  const expanded = expandedPref ?? isLarge;
  const toggleNav = () => {
    const value = !expanded;
    setExpandedPref(value);
    try {
      localStorage.setItem(NAV_PREF, value ? '1' : '0');
    } catch {
      // The preference only lasts for this visit.
    }
  };

  const subLocked = (key: string) => (AREA_LEVEL[key] ? !isOpen(AREA_LEVEL[key]) : false);
  const destinationLocked = (d: Destination) => {
    if (d.id === 'pay') return subLocked('pay');
    if (d.id === 'save') return ['budget', 'pockets', 'yield'].every(subLocked);
    if (d.id === 'invest') return subLocked('invest');
    return false;
  };
  const activeId = DESTINATIONS.find((d) => isDestinationActive(d, pathname))?.id;
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(activeId ? [activeId] : []));
  const toggleGroup = (id: string) =>
    setOpenGroups((current) => {
      const nextSet = new Set(current);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      return nextSet;
    });

  const nextMet = next ? next.conditions.filter((c) => c.met).length : 0;

  const renderItem = (d: Destination) => {
    const active = isDestinationActive(d, pathname);
    const locked = destinationLocked(d);
    const label = (
      <>
        {t(`wallet.nav.${d.id}`)}
        {locked && <span className="sr-only">, {t('wallet.nav.locked')}</span>}
      </>
    );
    if (!expanded) {
      // Rail: icon in its indicator, label below.
      return (
        <li key={d.id}>
          <Link
            to={d.to}
            aria-current={active ? 'page' : undefined}
            className={cn('flex w-full flex-col items-center gap-1 rounded-lg py-1.5 text-label-medium', active ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface')}
          >
            <span className={cn('relative flex h-8 w-14 items-center justify-center rounded-full', active && 'bg-secondary-container text-on-secondary-container')}>
              <Icon name={d.icon} size={24} filled={active} />
              {locked && <Icon name="lock" size={16} className="absolute -right-1 -bottom-1 rounded-full bg-surface-container-lowest" />}
            </span>
            <span>{label}</span>
          </Link>
        </li>
      );
    }
    const groupOpen = openGroups.has(d.id);
    return (
      <li key={d.id} className="flex flex-col">
        <div className={cn('flex items-center rounded-full', active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface')}>
          <Link to={d.to} aria-current={active ? 'page' : undefined} className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full pr-2 pl-4 text-label-large">
            <Icon name={d.icon} size={24} filled={active} />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {locked && <Icon name="lock" size={18} />}
          </Link>
          {/* Items without subsections keep the same slot, so locks and labels line up (balance) */}
          {!d.subsections && <span aria-hidden className="mr-2 size-8 shrink-0" />}
          {d.subsections && (
            <IconButton
              icon={groupOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              label={t(groupOpen ? 'wallet.nav.hideSub' : 'wallet.nav.showSub', { name: t(`wallet.nav.${d.id}`) })}
              aria-expanded={groupOpen}
              size="xs"
              className="mr-2"
              onClick={() => toggleGroup(d.id)}
            />
          )}
        </div>
        {d.subsections && groupOpen && (
          <ul className="my-1 ml-7 flex flex-col gap-0.5 border-l border-outline-variant pl-3">
            {d.subsections.map((s) => {
              const subActive = pathname === s.to;
              const lockedSub = subLocked(s.key);
              return (
                <li key={s.key}>
                  <Link
                    to={s.to}
                    aria-current={subActive ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-2 rounded-full px-3 text-body-medium',
                      subActive ? 'bg-surface-container text-label-large text-on-surface' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{t(`wallet.sub.${s.key}`)}</span>
                    {lockedSub && (
                      <>
                        <Icon name="lock" size={16} />
                        <span className="sr-only">, {t('wallet.nav.locked')}</span>
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  const walletDestinations = DESTINATIONS.filter((d) => d.id !== 'learn');
  const learn = DESTINATIONS.find((d) => d.id === 'learn')!;

  return (
    <div className="min-h-dvh bg-surface">
      <SkipLink />

      {/* Fixed banner (5.3, D-69): "dinero ficticio" is never removed */}
      <p className="flex items-center justify-center gap-2 bg-inverse-surface px-4 py-1.5 text-center text-label-medium text-inverse-on-surface">
        <Icon name="info" size={16} />
        {t('wallet.practiceBanner')}
      </p>

      {/* Floating panels (2.2.1, pattern 5): the side menu reaches the top and holds the menu button and
          the logo; the top bar floats beside it. On phones, a plain top bar and the bottom navigation. */}
      <div className="medium:flex medium:items-start medium:gap-3 medium:p-3">
        <nav
          id="wallet-nav"
          aria-label={t('wallet.nav.label')}
          className={cn(
            'sticky top-3 hidden h-[calc(100dvh-1.5rem)] shrink-0 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest medium:flex',
            expanded ? 'w-64' : 'w-24',
          )}
        >
          <div className={cn('flex h-16 shrink-0 items-center gap-1 border-b border-outline-variant px-3', !expanded && 'justify-center')}>
            <IconButton
              icon={expanded ? 'menu_open' : 'menu'}
              label={expanded ? t('wallet.nav.menuCollapse') : t('wallet.nav.menuExpand')}
              aria-expanded={expanded}
              aria-controls="wallet-nav-items"
              onClick={toggleNav}
            />
            {expanded && (
              <Link to="/app" className="inline-flex min-w-0 rounded-sm">
                <Logo />
              </Link>
            )}
          </div>
          <div id="wallet-nav-items" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
            {expanded && <p className="px-4 pb-1 text-label-medium text-on-surface-variant">{t('wallet.nav.groupWallet')}</p>}
            <ul className="flex flex-col gap-1">{walletDestinations.map(renderItem)}</ul>
            <div className="mx-2 my-2 h-px bg-outline-variant" />
            {expanded && <p className="px-4 pb-1 text-label-medium text-on-surface-variant">{t('wallet.nav.groupLearn')}</p>}
            <ul className="flex flex-col gap-1">{renderItem(learn)}</ul>

            {expanded && (
              // Progress card (one link): the levels completed as 7 segments, one per light of Fuerte,
              // and the next unlock with how many of its conditions are met.
              <Link
                to={next ? (LEVEL_ROUTE[next.level.id] ?? '/app/learn') : '/app/learn'}
                className="group mt-auto flex flex-col gap-3 rounded-lg bg-surface-container p-3 hover:bg-surface-container-high"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-label-medium text-on-surface-variant">{t('wallet.levelCard.title')}</span>
                  <span className="text-title-small text-on-surface tabular-nums">{t('wallet.levelCard.levels', { level: lights })}</span>
                </span>
                <span aria-hidden className="flex gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < lights ? 'bg-tertiary' : 'bg-outline-variant')} />
                  ))}
                </span>
                {next ? (
                  <span className="flex items-center gap-2 border-t border-outline-variant pt-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-container-lowest text-on-surface-variant">
                      <Icon name="lock" size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-label-small text-on-surface-variant">{t('wallet.levelCard.nextLabel')}</span>
                      <span className="block truncate text-title-small text-on-surface">{t(`wallet.sections.${next.level.id}`)}</span>
                    </span>
                    <span aria-hidden className="shrink-0 rounded-full bg-tertiary-container px-2 py-0.5 text-label-medium text-on-tertiary-container tabular-nums">
                      {nextMet}/{next.conditions.length}
                    </span>
                    <Icon name="chevron_right" size={20} className="shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
                    <span className="sr-only">{t('wallet.levelCard.linkHint', { met: nextMet, total: next.conditions.length })}</span>
                  </span>
                ) : (
                  <span className="text-title-small text-on-surface">{t('wallet.levelCard.allOpen')}</span>
                )}
              </Link>
            )}
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          {/* Top bar: on phones the logo and the section; from tablets, a floating bar with the section title */}
          {/* From tablets, the header covers the gap above the floating bar so content never shows behind it */}
          <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest medium:-mt-3 medium:border-0 medium:bg-surface medium:pt-3">
            <div className="flex h-16 items-center gap-1 px-(--space-gutter) medium:gap-2 medium:rounded-xl medium:border medium:border-outline-variant medium:bg-surface-container-lowest medium:px-4">
              <Link to="/app" className="inline-flex shrink-0 rounded-sm medium:hidden">
                <Logo compact />
              </Link>
              <p className="ml-2 min-w-0 flex-1 truncate text-title-medium text-on-surface medium:ml-0">{section}</p>
              <ViewAsMenu />
              <IconButton icon="help" label={t('wallet.help')} className="hidden sm:inline-flex" />
              <IconButton icon="notifications" label={t('wallet.notifications', { count: 2 })} />
              <UserMenu />
            </div>
          </header>
          <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[75rem] px-(--space-gutter) pt-6 pb-40 focus:outline-none medium:px-0 medium:pt-4 medium:pb-28">
            {children}
          </main>
        </div>
      </div>

      {/* Bottom navigation bar (phones) */}
      <nav aria-label={t('wallet.nav.label')} className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface-container-lowest medium:hidden">
        <ul className="grid grid-cols-5">
          {DESTINATIONS.map((d) => {
            const active = isDestinationActive(d, pathname);
            const locked = destinationLocked(d);
            return (
              <li key={d.id}>
                <Link
                  to={d.to}
                  aria-current={active ? 'page' : undefined}
                  className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-label-medium text-on-surface-variant aria-[current=page]:text-on-surface"
                >
                  <span className={cn('relative flex h-8 w-14 items-center justify-center rounded-full', active && 'bg-secondary-container text-on-secondary-container')}>
                    <Icon name={d.icon} size={24} filled={active} />
                    {locked && <Icon name="lock" size={16} className="absolute right-1 bottom-0 rounded-full bg-surface-container-lowest" />}
                  </span>
                  <span className="max-w-full truncate">
                    {t(`wallet.nav.${d.id}`)}
                    {locked && <span className="sr-only">, {t('wallet.nav.locked')}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {fuerte && (
        <FuerteFab state={fuerte.state} lights={lights} message={fuerte.message} why={fuerte.why}>
          {fuerte.action}
        </FuerteFab>
      )}
    </div>
  );
}
