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
 * and the user menu. Below 1200 px, a plain top bar and the pages as tabs that scroll inside (2.7).
 */
export function StaffShell({ children, nav = [], home, navLabel }: { children: ReactNode; nav?: StaffNavItem[]; home: string; navLabel?: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const hasNav = nav.length > 1;
  const isLarge = useMediaQuery('(min-width: 75rem)', true);
  const [expandedPref, setExpandedPref] = useState<boolean | null>(readNavPref);
  const pinned = expandedPref ?? isLarge;
  const [peek, setPeek] = useState(false);
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
  useEffect(() => () => window.clearTimeout(peekTimer.current), []);
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

  /** Tab below 1200 px. */
  const tab = (n: StaffNavItem) => {
    const active = n.match(pathname);
    return (
      <Link
        key={n.key}
        to={n.to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-label-large',
          active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container',
        )}
      >
        <Icon name={n.icon} filled={active} size={20} />
        <span>{n.label}</span>
        {badge(n, false)}
      </Link>
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
            {hasNav && (
              <nav aria-label={navLabel} className="large:hidden print:hidden">
                <div className="flex gap-1 overflow-x-auto px-(--space-gutter) pb-2 medium:px-6">{nav.map(tab)}</div>
              </nav>
            )}
          </header>
          <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-[120rem] min-w-0 flex-col gap-6 px-(--space-gutter) pt-6 pb-16 focus:outline-none medium:px-6 large:px-0 print:p-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
