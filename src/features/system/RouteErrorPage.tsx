import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button } from '@/components/ui/Button';
import { resetDemo } from '@/features/auth/auth-service';
import { SystemMessage } from './SystemMessage';

function messageOf(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * G7 · Unexpected error: the router's error element, so a failing screen never shows the raw
 * stack. Serious tone without blame (2.9): what happened, that the demo data is safe and what to do
 * (reload, go home, or reset the demo if it repeats). The technical detail stays folded.
 */
export function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();

  const goHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  return (
    <SystemMessage
      icon="error"
      tone="error"
      code={t('errorPage.code')}
      title={t('errorPage.title')}
      body={t('errorPage.body')}
      actions={
        <>
          <Button leadingIcon="refresh" onClick={() => window.location.reload()}>
            {t('errorPage.reload')}
          </Button>
          <Button variant="outlined" leadingIcon="home" onClick={goHome}>
            {t('errorPage.home')}
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-2 border-t border-outline-variant pt-5">
        <p className="text-body-medium text-on-surface-variant">{t('errorPage.resetHint')}</p>
        <Button
          variant="text"
          leadingIcon="restart_alt"
          className="-ml-3 w-fit"
          onClick={() => {
            resetDemo();
            goHome();
          }}
        >
          {t('errorPage.reset')}
        </Button>
      </div>
      <details className="w-full rounded-md bg-surface-container p-3 text-body-small text-on-surface-variant">
        <summary className="cursor-pointer text-label-large text-on-surface">{t('errorPage.details')}</summary>
        <pre className="mt-2 font-mono text-body-small break-words whitespace-pre-wrap">{messageOf(error)}</pre>
      </details>
    </SystemMessage>
  );
}
