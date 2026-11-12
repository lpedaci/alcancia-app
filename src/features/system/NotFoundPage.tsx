import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

/** G7 (not found). Step 5 adds "Acceso no permitido" and the unexpected error page. */
export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main id="main-content" className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-headline-small">{t('notFound.title')}</h1>
      <p className="text-body-large text-on-surface-variant">{t('notFound.body')}</p>
      <p>
        <Link
          to="/"
          className="text-label-large text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t('notFound.home')}
        </Link>
      </p>
    </main>
  );
}
