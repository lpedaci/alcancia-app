import { useTranslation } from 'react-i18next';
import { DOCS_URL } from '@/app/links';

/**
 * Temporary landing while the phase A steps are built. The real landing (G0, CLAUDE.md F0)
 * is part of the visual pilot (step 4).
 */
export function LandingPlaceholder() {
  const { t } = useTranslation();
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-surface-container-lowest focus:px-4 focus:py-2"
      >
        {t('app.skipToContent')}
      </a>
      <main id="main-content" className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-12">
        <p className="text-sm font-medium text-on-surface-variant">{t('landing.eyebrow')}</p>
        <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
          <span className="text-primary">{t('app.name')}</span>
          <span className="sr-only">: </span>
          <span className="mt-2 block">{t('landing.title')}</span>
        </h1>
        <p className="text-base text-on-surface-variant">{t('landing.status')}</p>
        <p>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-medium text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('landing.docsLink')}
          </a>
        </p>
        <p className="border-t border-outline-variant pt-4 text-sm text-on-surface-variant">{t('landing.disclaimer')}</p>
      </main>
    </>
  );
}
