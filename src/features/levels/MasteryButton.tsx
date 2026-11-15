import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * "Ya sé esto" (5.0, D-233): the shortcut to a mastery challenge. Always the same piece and in the
 * same place: a small tonal button with the bolt, in the top right corner of the card or row of the
 * locked section, next to its title. It is a secondary path (the main one is to meet the
 * conditions), so it never takes the filled style. The accessible name starts with the visible text
 * and says which section it opens (2.10, label in name).
 */
export function MasteryButton({ to, section, className }: { to: string; section: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <Button asChild variant="tonal" size="xs" leadingIcon="bolt" className={cn('shrink-0 self-start', className)}>
      <Link to={to} aria-label={t('wallet.unlock.masteryLabel', { section })}>
        {t('wallet.unlock.mastery')}
      </Link>
    </Button>
  );
}
