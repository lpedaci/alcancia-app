import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Fuerte } from '@/features/companion/Fuerte';
import { cn } from '@/lib/utils';

/**
 * The participant's only navigation (CLAUDE.md 5.3): the same 5 destinations at every size.
 * Phones (< 600 px): top bar and bottom navigation bar. Tablets (600 to 1199 px): navigation rail.
 * Desktop (1200 px or more): side menu with subsections and the level indicator (D-104).
 * Locked destinations show a lock and open their "qué falta" card (step 6).
 */
export interface Destination {
  id: 'home' | 'pay' | 'save' | 'invest' | 'learn';
  to: string;
  icon: IconName;
  locked?: boolean;
  subsections?: { key: string; to: string; locked?: boolean }[];
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
  { id: 'invest', to: '/app/invest', icon: 'trending_up', locked: true },
  { id: 'learn', to: '/app/learn', icon: 'school', subsections: [{ key: 'map', to: '/app/learn' }, { key: 'tools', to: '/app/tools' }] },
];

function DestinationLabel({ d }: { d: Destination }) {
  const { t } = useTranslation();
  return (
    <>
      {t(`wallet.nav.${d.id}`)}
      {d.locked && <span className="sr-only">, {t('wallet.nav.locked')}</span>}
    </>
  );
}

export function WalletShell({
  section,
  children,
  aside,
  completedLevels,
  personName,
}: {
  /** Visible name of the section on phones. */
  section: string;
  children: ReactNode;
  /** Mission panel with Fuerte: right column on desktop, below the content on smaller screens. */
  aside?: ReactNode;
  completedLevels: number;
  personName: string;
}) {
  const { t } = useTranslation();

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group relative flex items-center rounded-full text-label-large outline-offset-2',
      isActive ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface',
    );

  return (
    <div className="min-h-dvh bg-surface">
      <a
        href="#main-content"
        className="sr-only rounded-sm bg-surface-container-lowest px-4 py-3 text-label-large text-primary focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:shadow-elevation-1"
      >
        {t('app.skipToContent')}
      </a>

      {/* Practice banner, always visible (5.3) */}
      <p className="flex items-center justify-center gap-2 bg-inverse-surface px-4 py-1.5 text-center text-label-medium text-inverse-on-surface">
        <Icon name="info" size={16} />
        {t('wallet.practiceBanner')}
      </p>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest">
        <div className="flex h-16 items-center gap-3 px-(--space-gutter)">
          <span className="medium:hidden">
            <Fuerte state="neutral" lights={completedLevels} size={2.25} />
          </span>
          <p className="min-w-0 flex-1 truncate text-title-medium text-on-surface medium:hidden">{section}</p>
          <Link to="/" className="hidden rounded-sm medium:inline-flex">
            <Logo />
          </Link>
          <span className="hidden flex-1 medium:block" />
          <span className="hidden rounded-full border border-outline-variant px-3 py-1 text-label-medium text-on-surface-variant expanded:inline-flex">
            {t('wallet.viewAs')}
          </span>
          <IconButton icon="help" label={t('wallet.help')} />
          <IconButton icon="notifications" label={t('wallet.notifications', { count: 2 })} />
          {/* The name comes from hidden text, so it never mismatches the visible initials (WCAG 2.5.3). */}
          <button type="button" className="rounded-full">
            <span className="sr-only">{t('wallet.profileMenu', { name: personName })}</span>
            <Avatar name={personName} role="participant" size="md" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Rail (tablet) and side menu (desktop) */}
        <nav aria-label={t('wallet.nav.label')} className="hidden shrink-0 border-r border-outline-variant bg-surface-container-lowest medium:block">
          <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto px-2 py-4 large:w-64 large:px-3">
            <ul className="flex flex-col gap-1">
              {DESTINATIONS.map((d) => (
                <li key={d.id}>
                  <NavLink to={d.to} end={d.id === 'home'} className={itemClass}>
                    {({ isActive }) => (
                      <>
                        {/* Rail item: indicator pill around the icon, label below */}
                        <span className="flex w-20 flex-col items-center gap-1 py-1 large:hidden">
                          <span className={cn('relative flex h-8 w-14 items-center justify-center rounded-full', isActive && 'bg-primary-container text-on-primary-container')}>
                            <Icon name={d.icon} size={24} filled={isActive} />
                            {d.locked && <Icon name="lock" size={16} className="absolute -right-1 -bottom-1 rounded-full bg-surface-container-lowest" />}
                          </span>
                          <span className="text-label-medium">
                            <DestinationLabel d={d} />
                          </span>
                        </span>
                        {/* Side menu item: full pill */}
                        <span className={cn('hidden h-12 w-full items-center gap-3 rounded-full px-4 large:flex', isActive ? 'bg-primary text-on-primary' : 'hover:bg-surface-container')}>
                          <Icon name={d.icon} size={24} filled={isActive} />
                          <span className="min-w-0 flex-1 truncate">
                            <DestinationLabel d={d} />
                          </span>
                          {d.locked && <Icon name="lock" size={18} />}
                        </span>
                      </>
                    )}
                  </NavLink>
                  {d.subsections && (
                    <ul className="mt-1 mb-2 ml-11 hidden flex-col gap-0.5 large:flex">
                      {d.subsections.map((s) => (
                        <li key={s.key}>
                          <span className="flex h-9 items-center rounded-full px-3 text-body-medium text-on-surface-variant">
                            {t(`wallet.sub.${s.key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {/* Level indicator and next unlock (Coursify reference: action card at the bottom) */}
            <div className="mt-auto hidden flex-col gap-2 rounded-lg bg-primary-container p-3 text-on-primary-container large:flex">
              <p className="text-label-medium">{t('wallet.levelIndicator', { level: completedLevels })}</p>
              <p className="text-title-small">{t('wallet.nextUnlock')}</p>
              <div className="h-1.5 rounded-full bg-surface-container-lowest">
                <div className="h-1.5 w-2/3 rounded-full bg-primary" />
              </div>
              <p className="text-body-small">{t('wallet.nextUnlockDetail')}</p>
            </div>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-(--space-bento-gap) px-(--space-gutter) pt-6 pb-28 medium:pb-10',
              aside && 'large:grid-cols-[minmax(0,1fr)_20rem]',
            )}
          >
            <main id="main-content" tabIndex={-1} className="min-w-0 focus:outline-none">
              {children}
            </main>
            {aside && <aside aria-label={t('wallet.missionPanel')} className="min-w-0">{aside}</aside>}
          </div>
        </div>
      </div>

      {/* Bottom navigation bar (phones) */}
      <nav aria-label={t('wallet.nav.label')} className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface-container-lowest medium:hidden">
        <ul className="grid grid-cols-5">
          {DESTINATIONS.map((d) => (
            <li key={d.id}>
              <NavLink to={d.to} end={d.id === 'home'} className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-label-medium text-on-surface-variant aria-[current=page]:text-on-surface">
                {({ isActive }) => (
                  <>
                    <span className={cn('relative flex h-8 w-14 items-center justify-center rounded-full', isActive && 'bg-primary-container text-on-primary-container')}>
                      <Icon name={d.icon} size={24} filled={isActive} />
                      {d.locked && <Icon name="lock" size={16} className="absolute right-1 bottom-0 rounded-full bg-surface-container-lowest" />}
                    </span>
                    <span className="max-w-full truncate">
                      <DestinationLabel d={d} />
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
