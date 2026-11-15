import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { SkipLink } from '@/components/layout/InPageLink';
import { Logo } from '@/components/layout/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { ViewAsMenu } from '@/components/layout/ViewAsMenu';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { useMediaQuery } from '@/lib/use-media-query';
import { cn } from '@/lib/utils';

export interface StaffNavItem {
  key: string;
  to: string;
  icon: IconName;
  label: string;
  match: (pathname: string) => boolean;
  /** A count that needs attention (for example, unanswered questions), with its text for screen readers. */
  badge?: { count: number; label: string };
}

/** Same preference as the wallet menu: folded or open is one choice for the whole app (D-226). */
const NAV_PREF = 'alcancia-ui:nav-expanded';
const PEEK_DELAY_MS = 700;

function readNavPref(): boolean | null {
  try {
    const value = localStorage.getItem(NAV_PREF);
    return value === null ? null : value === '1';
  } catch {
    return null;
  }
}

/**
 * G6 layout of the tutor, the admin and the sponsor (D-193, D-195), with the same floating panels as
 * the wallet (2.2.1, pattern 5; D-226): from 1200 px, a side menu that reaches the top with the logo,
 * the role's pages (active item in a pill) and the fold control, folding to icons and opening over
 * the page when the pointer rests on it (D-224); a floating top bar beside it with "Ver como", help
 * and the user menu. Below 1200 px, a plain top bar and the pages in a bottom bar, as in the wallet (D-237).
 */
export function StaffShell({ children, nav = [], home, navLabel }: { children: ReactNode; nav?: StaffNavItem[]; home: string; navLabel?: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const hasNav = nav.length > 1;
  const isLarge = useMediaQuery('(min-width: 75rem)', true);
  const [expandedPref, setExpandedPref] = useState<boolean | null>(readNavPref);
  const pinned = expandedPref ?? isLarge;
  const [peek, setPeek] = useState(false);
  const [labelFor, setLabelFor] = useState<string | undefined>();
  const pressTimer = useRef<number | undefined>(undefined);
  const labelTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const peekTimer = useRef<number | undefined>(undefined);
  const expanded = pinned || peek;
  const startPeek = () => {
    if (pinned) return;
    window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => setPeek(true), PEEK_DELAY_MS);
  };
  const endPeek = () => {
    window.clearTimeout(peekTimer.current);
    setPeek(false);
  };
  useEffect(
    () => () => {
      window.clearTimeout(peekTimer.current);
      window.clearTimeout(pressTimer.current);
      window.clearTimeout(labelTimer.current);
    },
    [],
  );
  const toggleNav = () => {
    endPeek();
    const value = !pinned;
    setExpandedPref(value);
    try {
      localStorage.setItem(NAV_PREF, value ? '1' : '0');
    } catch {
      // The preference only lasts for this visit.
    }
  };

  const badge = (n: StaffNavItem, rail: boolean) =>
    n.badge && n.badge.count > 0 ? (
      <span
        className={cn(
          'rounded-full bg-primary text-label-small text-on-primary tabular-nums',
          rail ? 'absolute top-1 right-2 min-w-4 px-1 text-center' : 'ml-auto px-2',
        )}
      >
        {n.badge.count}
        <span className="sr-only"> {n.badge.label}</span>
      </span>
    ) : null;

  /** Side menu item: like the wallet's (secondary container pill, filled icon when active). */
  const sideItem = (n: StaffNavItem) => {
    const active = n.match(pathname);
    if (!expanded) {
      return (
        <li key={n.key} className="flex justify-center">
          <Tooltip content={n.label} side="right">
            <Link
              to={n.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-12 w-14 items-center justify-center rounded-full',
                active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
            >
              <Icon name={n.icon} size={24} filled={active} />
              <span className="sr-only">{n.label}</span>
              {badge(n, true)}
            </Link>
          </Tooltip>
        </li>
      );
    }
    return (
      <li key={n.key}>
        <Link
          to={n.to}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex h-12 items-center gap-3 rounded-full pr-3 pl-4 text-label-large',
            active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
          )}
        >
          <Icon name={n.icon} size={24} filled={active} />
          <span className="min-w-0 flex-1 truncate">{n.label}</span>
          {badge(n, false)}
        </Link>
      </li>
    );
  };

  /** Bottom bar item below 1200 px (D-237): like the wallet's (D-228), icon with the indicator pill; the
   * name for screen readers, in a tooltip with a pointer and in a bubble when held. */
  const bottomItem = (n: StaffNavItem) => {
    const active = n.match(pathname);
    return (
      <li key={n.key}>
        <Tooltip content={n.label}>
          <Link
            to={n.to}
            aria-current={active ? 'page' : undefined}
            data-staff-bottom-item={n.key}
            onPointerDown={(e) => {
              if (e.pointerType === 'mouse') return;
              longPressed.current = false;
              window.clearTimeout(pressTimer.current);
              pressTimer.current = window.setTimeout(() => {
                longPressed.current = true;
                setLabelFor(n.key);
                window.clearTimeout(labelTimer.current);
                labelTimer.current = window.setTimeout(() => setLabelFor(undefined), 1800);
              }, 500);
            }}
            onPointerUp={() => window.clearTimeout(pressTimer.current)}
            onPointerCancel={() => window.clearTimeout(pressTimer.current)}
            onPointerLeave={() => window.clearTimeout(pressTimer.current)}
            onContextMenu={(e) => e.preventDefault()}
            onClick={(e) => {
              if (longPressed.current) {
                e.preventDefault();
                longPressed.current = false;
              }
            }}
            className="relative flex min-h-16 touch-manipulation items-center justify-center px-1 py-2 text-on-surface-variant select-none [-webkit-touch-callout:none] aria-[current=page]:text-on-surface"
          >
            <span className={cn('relative flex h-8 w-16 items-center justify-center rounded-full', active && 'bg-secondary-container text-on-secondary-container')}>
              <Icon name={n.icon} size={24} filled={active} />
              {n.badge && n.badge.count > 0 && (
                <span aria-hidden className="absolute top-0 right-3 min-w-4 rounded-full bg-primary px-1 text-center text-label-small text-on-primary tabular-nums">
                  {n.badge.count}
                </span>
              )}
            </span>
            <span className="sr-only">
              {n.label}
              {n.badge && n.badge.count > 0 && `, ${n.badge.label}`}
            </span>
            {labelFor === n.key && (
              <span aria-hidden className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-md bg-inverse-surface px-3 py-1.5 text-label-medium whitespace-nowrap text-inverse-on-surface shadow-(--elevation-1)">
                {n.label}
              </span>
            )}
          </Link>
        </Tooltip>
      </li>
    );
  };

  const actions = (
    <span className="flex items-center gap-2 print:hidden">
      <ViewAsMenu />
      <IconButton icon="help" label={t('demo.help')} />
      <UserMenu />
    </span>
  );

  return (
    <div className="min-h-dvh bg-surface">
      <SkipLink />
      <div className={cn('large:flex large:items-start large:gap-3 large:p-3', !hasNav && 'large:block')}>
        {hasNav && (
          // The slot keeps the folded width while the menu opens over the page (D-224)
          <div className={cn('sticky top-3 hidden h-[calc(100dvh-1.5rem)] shrink-0 large:block print:!hidden', pinned ? 'w-64' : 'w-20', peek ? 'z-40' : 'z-20')}>
            <nav
              aria-label={navLabel}
              onMouseEnter={startPeek}
              onMouseLeave={endPeek}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && peek) endPeek();
              }}
              className={cn(
                'absolute inset-y-0 left-0 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-[width] duration-200 ease-standard motion-reduce:transition-none',
                expanded ? 'w-64' : 'w-20',
                peek && 'z-40 shadow-(--elevation-2)',
              )}
            >
              <div className={cn('flex h-16 shrink-0 items-center border-b border-outline-variant', expanded ? 'px-4' : 'justify-center')}>
                <Link to={home} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-sm">
                  <Logo compact={!expanded} />
                </Link>
              </div>
              <div id="staff-nav-items" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
                {expanded && <p className="px-4 pb-1 text-label-medium text-on-surface-variant">{navLabel}</p>}
                <ul className="flex flex-col gap-1">{nav.map(sideItem)}</ul>
              </div>
              <div className={cn('flex shrink-0 border-t border-outline-variant p-2', expanded ? 'justify-end' : 'justify-center')}>
                <IconButton
                  icon={pinned ? 'chevron_left' : 'chevron_right'}
                  label={pinned ? t('wallet.nav.menuCollapse') : t(peek ? 'wallet.nav.menuPin' : 'wallet.nav.menuExpand')}
                  tooltipSide="right"
                  aria-expanded={pinned}
                  aria-controls="staff-nav-items"
                  onClick={toggleNav}
                />
              </div>
            </nav>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Top bar: plain below 1200 px; floating beside the side menu from 1200 px (2.2.1, pattern 5) */}
          <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest large:-mt-3 large:border-0 large:bg-surface large:pt-3 print:static print:border-0">
            <div className="flex min-h-16 items-center gap-2 px-(--space-gutter) py-2 medium:px-6 large:rounded-xl large:border large:border-outline-variant large:bg-surface-container-lowest large:px-4">
              <Link to={home} className={cn('inline-flex min-w-0 rounded-sm', hasNav && 'large:hidden')}>
                <Logo />
              </Link>
              <span className="flex-1" />
              {actions}
            </div>
          </header>
          <main id="main-content" tabIndex={-1} className={cn('mx-auto flex w-full max-w-[120rem] min-w-0 flex-col gap-6 px-(--space-gutter) pt-6 pb-16 focus:outline-none medium:px-6 large:px-0 print:p-0', hasNav && 'pb-28 large:pb-16')}>
            {children}
          </main>
        </div>
      </div>
      {/* Below 1200 px the role's pages go in a bottom bar, as in the wallet (D-237) */}
      {hasNav && (
        <nav
          aria-label={navLabel}
          data-staff-bottom-nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface-container-lowest pb-[env(safe-area-inset-bottom)] large:hidden print:!hidden"
        >
          <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
            {nav.map(bottomItem)}
          </ul>
        </nav>
      )}
    </div>
  );
}
