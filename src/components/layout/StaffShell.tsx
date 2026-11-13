import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { SkipLink } from '@/components/layout/InPageLink';
import { Logo } from '@/components/layout/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { ViewAsMenu } from '@/components/layout/ViewAsMenu';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
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

/**
 * G6 layout of the tutor, the admin and the sponsor (D-193, D-195): the staff top bar (logo, "Ver
 * como", help, user menu) and, when the role has more than one page, its navigation: a side menu
 * with the active item in a primary pill from 1200 px, and a row of tabs under the top bar below,
 * which scrolls inside itself when it does not fit (2.7).
 */
export function StaffShell({ children, nav = [], home, navLabel }: { children: ReactNode; nav?: StaffNavItem[]; home: string; navLabel?: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const item = (n: StaffNavItem, compact: boolean) => {
    const active = n.match(pathname);
    return (
      <Link
        key={n.key}
        to={n.to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex min-h-12 shrink-0 items-center gap-3 rounded-full px-4 text-label-large transition-colors',
          active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container',
          compact && 'min-h-10 px-3',
        )}
      >
        <Icon name={n.icon} filled={active} size={20} />
        <span>{n.label}</span>
        {n.badge && n.badge.count > 0 && (
          <span className="ml-auto rounded-full bg-primary px-2 text-label-small text-on-primary">
            {n.badge.count}
            <span className="sr-only"> {n.badge.label}</span>
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-dvh bg-surface">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest print:static print:border-0">
        <div className="mx-auto flex h-16 max-w-[120rem] items-center gap-2 px-(--space-gutter) medium:px-8">
          <Link to={home} className="inline-flex min-w-0 rounded-sm">
            <Logo />
          </Link>
          <span className="flex-1" />
          <span className="flex items-center gap-2 print:hidden">
            <ViewAsMenu />
            <IconButton icon="help" label={t('demo.help')} />
            <UserMenu />
          </span>
        </div>
        {nav.length > 1 && (
          <nav aria-label={navLabel} className="large:hidden print:hidden">
            <div className="mx-auto flex max-w-[120rem] gap-1 overflow-x-auto px-(--space-gutter) pb-2 medium:px-8">{nav.map((n) => item(n, true))}</div>
          </nav>
        )}
      </header>
      <div className="mx-auto flex w-full max-w-[120rem] gap-8 px-(--space-gutter) py-8 medium:px-8">
        {nav.length > 1 && (
          <nav aria-label={navLabel} className="hidden w-60 shrink-0 large:block print:hidden">
            <div className="sticky top-24 flex flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
              <p className="px-4 pt-1 pb-2 text-label-medium text-on-surface-variant">{navLabel}</p>
              {nav.map((n) => item(n, false))}
            </div>
          </nav>
        )}
        <main id="main-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
