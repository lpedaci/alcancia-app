import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { homePath } from '@/lib/permissions';
import { useCurrentUser } from '@/store/session-store';

/**
 * G7 · Acceso no permitido (roles.md 3.4): a route of another role. Serious and without blame
 * (2.9): what happened and a way back to the person's own home.
 */
export function AccessDeniedPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  return (
    <div className="flex min-h-dvh flex-col bg-surface px-(--space-gutter) py-6">
      <header className="mx-auto w-full max-w-2xl">
        <Link to="/" className="inline-flex rounded-sm">
          <Logo />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10 focus:outline-none">
        <section className="flex flex-col items-start gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            <Icon name="lock" size={24} />
          </span>
          <h1 className="text-headline-small text-on-surface">{t('forbidden.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('forbidden.body')}</p>
          <Button asChild leadingIcon="home">
            <Link to={homePath(user)}>{t('forbidden.backHome')}</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
