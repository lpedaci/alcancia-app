import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Switches between Spanish and English (F17, D-322). The label is written in the other language and
 * marked with its `lang`, so a screen reader reads "English" in English (WCAG 3.1.2). The choice is
 * kept in this browser by `src/app/i18n.ts`.
 */
/** `compact`: only the icon on phones (the accessible name stays), for tight top bars. */
export function LanguageToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t, i18n } = useTranslation();
  const next = i18n.language === 'en' ? 'es' : 'en';
  return (
    <Button variant="text" size="xs" leadingIcon="language" className={cn('shrink-0', className)} aria-label={t('app.language.switchTo', { lng: next === 'en' ? 'English' : 'español' })} onClick={() => void i18n.changeLanguage(next)}>
      <span lang={next} className={cn(compact && 'sr-only medium:not-sr-only')}>
        {next === 'en' ? 'English' : 'Español'}
      </span>
    </Button>
  );
}
