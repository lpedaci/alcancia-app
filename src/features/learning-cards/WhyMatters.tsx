import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { SourceList } from '@/features/learning/SourceList';
import { cn } from '@/lib/utils';
import { guideHref, SCREEN_WHY, type WhyScreen } from './cards';
import { rememberScroll } from '@/lib/use-return-state';

/**
 * "¿Por qué importa?" on every screen of the wallet (5.3, D-76, D-209): visible in the page itself,
 * so it is there with Fuerte in "Silencio" too. D-288: an attention button (the warning container,
 * the amber of the design system) that opens a dialog with the concept, its official source and the
 * exact part of the guide that explains it (D-78). On phones and tablets it is the icon alone, with
 * its name for screen readers and in a tooltip; from 1200 px it shows its name.
 */
export function WhyMatters({ screen, className }: { screen: WhyScreen; className?: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const why = SCREEN_WHY[screen];
  const title = why.title ?? t('cards.why');

  return (
    <div data-why-matters={screen} className={cn('flex', className)}>
      <Dialog>
        <Tooltip content={title} className="large:hidden">
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={title}
              className={cn(
                'inline-flex size-12 shrink-0 items-center justify-center gap-2 rounded-full bg-warning-container text-on-warning-container md:size-10',
                'large:size-auto large:min-h-10 large:px-4 large:text-label-large',
                'hover:bg-warning-container/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              )}
            >
              <Icon name="lightbulb" size={20} />
              <span className="hidden large:inline">{title}</span>
            </button>
          </DialogTrigger>
        </Tooltip>
        <DialogContent title={title} className="max-w-xl">
          <p className="text-body-large text-on-surface">{why.body}</p>
          <SourceList codes={why.sourceIds} variant="footer" className="bg-transparent p-0" />
          <Button asChild variant="filled" leadingIcon="menu_book" className="w-full sm:w-fit sm:self-end">
            <Link to={guideHref(why.guide, pathname)} onClick={() => rememberScroll(pathname)}>
              {t('cards.toGuide')}
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** The text of a screen's "¿Por qué importa?", for Fuerte's panel (it may repeat it, D-209). */
export const whyText = (screen: WhyScreen) => SCREEN_WHY[screen].body;
