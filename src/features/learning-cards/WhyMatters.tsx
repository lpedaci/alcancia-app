import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SourceList } from '@/features/learning/SourceList';
import { cn } from '@/lib/utils';
import { guideHref, SCREEN_WHY, type WhyScreen } from './cards';
import { rememberScroll } from '@/lib/use-return-state';

/**
 * "¿Por qué importa?" on every screen of the wallet (5.3, D-76, D-209): visible in the page itself,
 * so it is there with Fuerte in "Silencio" too. A disclosure button that opens the concept, its
 * official source and the exact part of the guide that explains it (D-78).
 */
export function WhyMatters({ screen, className }: { screen: WhyScreen; className?: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const why = SCREEN_WHY[screen];

  return (
    <div data-why-matters={screen} className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 text-label-large text-primary hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-10"
      >
        <Icon name="lightbulb" size={18} />
        {why.title ?? t('cards.why')}
        <Icon name="keyboard_arrow_down" size={18} className={cn('transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div id={panelId} className="@container rounded-lg border border-outline-variant bg-tertiary-container p-4 text-on-tertiary-container md:p-5">
          {/* Full width (Lourdes, 14/11/2026): the concept first and, beside it when there is room, where to go next */}
          {/* D-235: the concept first; then one clear action (the exact part of the guide) and the
              sources in a single compact line. From wide tablets, the concept left and both on the right. */}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @3xl:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] @3xl:items-center @3xl:gap-6">
            <p className="max-w-prose text-body-large">{why.body}</p>
            <div className="flex min-w-0 flex-col gap-3 border-t border-on-tertiary-container/15 pt-4 @3xl:border-t-0 @3xl:border-l @3xl:pt-0 @3xl:pl-6">
              <Button asChild variant="outlined" size="s" leadingIcon="menu_book" className="w-full bg-surface-container-lowest sm:w-fit">
                <Link to={guideHref(why.guide, pathname)} onClick={() => rememberScroll(pathname)}>
                  {t('cards.toGuide')}
                </Link>
              </Button>
              <SourceList codes={why.sourceIds} variant="footer" className="bg-transparent p-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The text of a screen's "¿Por qué importa?", for Fuerte's panel (it may repeat it, D-209). */
export const whyText = (screen: WhyScreen) => SCREEN_WHY[screen].body;
