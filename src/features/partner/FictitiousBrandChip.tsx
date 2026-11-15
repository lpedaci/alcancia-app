import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

/** The fictitious-brand label (D-87): always visible in the integrated mode. */
export function FictitiousBrandChip({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border border-partner-hornero px-2.5 py-0.5 text-label-medium whitespace-nowrap text-partner-on-hornero-container', className)}
    >
      <Icon name="info" size={16} />
      {t('partner.hornero.fictitiousBrand')}
    </span>
  );
}
