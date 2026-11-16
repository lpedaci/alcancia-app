import { useTranslation } from 'react-i18next';
import { LICENSE_URL } from '@/app/links';
import { cn } from '@/lib/utils';

/**
 * Authorship and rights (D-306), at the foot of every screen: "© 2026 Lourdes Pedaci · Todos los
 * derechos reservados" with a link to the LICENSE of the repository. Body small on on-surface-variant
 * (AA on every surface of the app).
 */
export function RightsNotice({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p className={cn('text-body-small text-on-surface-variant', className)}>
      {t('rights.notice')} ·{' '}
      <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:no-underline">
        {t('rights.license')}
        <span className="sr-only"> {t('rights.newTab')}</span>
      </a>
    </p>
  );
}

/** The notice as the footer of a layout. */
export function RightsFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('print:hidden', className)}>
      <RightsNotice />
    </footer>
  );
}
