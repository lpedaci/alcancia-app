import { SkipLink } from '@/components/layout/InPageLink';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Logo } from '@/components/layout/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { ViewAsMenu } from '@/components/layout/ViewAsMenu';
import { ROLE_ACCENT } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { findPerson } from '@/features/auth/auth-service';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/store/session-store';

/**
 * G6 layout of the tutor, the admin and the sponsor (floating top bar with logo, "Ver como", help
 * and the user menu) with a provisional home. The real panels arrive in steps 10 and 11
 * (CLAUDE.md 10): until then the page says so honestly and points to the wallet.
 */
export function StaffHomePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const person = user ? findPerson(user.personId) : undefined;
  if (!user || !person || user.role === 'participant') return null;
  const role = user.role;

  return (
    <div className="min-h-dvh bg-surface">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-2 px-(--space-gutter)">
          <Link to="/" className="inline-flex min-w-0 rounded-sm">
            <Logo />
          </Link>
          <span className="flex-1" />
          <ViewAsMenu />
          <IconButton icon="help" label={t('demo.help')} />
          <UserMenu />
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-[75rem] flex-col gap-8 px-(--space-gutter) py-8 focus:outline-none">
        <header className="flex flex-col gap-2">
          <p className="text-body-medium text-on-surface-variant">{DEMO_TODAY.split('-').reverse().join('/')} · {t('staff.program')}</p>
          <h1 className="text-headline-small text-on-surface">
            {t('staff.hello')}{' '}
            <span className="text-primary">{person.name.split(' ')[0]}</span>
          </h1>
          <p className="flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-label-medium', ROLE_ACCENT[role].chip)}>
              {t(`roles.${role}`)}
            </span>
            <span className="text-body-medium text-on-surface-variant">{t(`staff.titles.${role}`)}</span>
          </p>
        </header>
        <section
          aria-labelledby="staff-pending"
          className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-info-container text-on-info-container">
            <Icon name="dashboard" />
          </span>
          <h2 id="staff-pending" className="text-title-large text-on-surface">
            {t('staff.pendingTitle')}
          </h2>
          <p className="max-w-prose text-body-large text-on-surface-variant">{t('staff.pending', { step: t(`staff.steps.${role}`) })}</p>
        </section>
      </main>
    </div>
  );
}
