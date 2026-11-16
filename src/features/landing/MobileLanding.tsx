import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InPageLink } from '@/components/layout/InPageLink';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';

/**
 * The landing on phones and tablets (D-324), as fintech landings do it (Mercado Pago; Chime, Cash
 * App): a menu instead of a crowded top bar, and one sticky action at the bottom once the hero is
 * behind. Desktops keep their top bar with the sections in the center.
 */
export function LandingMenu({ nav, caseStudyUrl }: { nav: readonly (readonly [string, string])[]; caseStudyUrl: string }) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton icon="menu" label={t('landing.menu.open')} className="large:hidden" />
      </DialogTrigger>
      <DialogContent title={t('landing.menu.title')} className="top-4 max-w-md translate-y-0">
        <nav aria-label={t('landing.nav.label')}>
          <ul className="flex flex-col">
            {nav.map(([id, key]) => (
              <li key={id}>
                <DialogClose asChild>
                  <InPageLink to={id} className="flex min-h-12 items-center rounded-md px-3 text-body-large text-on-surface hover:bg-surface-container">
                    {t(`landing.${key}`)}
                  </InPageLink>
                </DialogClose>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
          <DialogClose asChild>
            <Button asChild size="m">
              <InPageLink to="recorridos">{t('landing.chooseJourney')}</InPageLink>
            </Button>
          </DialogClose>
          <Button asChild size="m" variant="outlined" trailingIcon="open_in_new">
            <a href={caseStudyUrl} target="_blank" rel="noopener noreferrer">
              {t('landing.hero.caseStudy')}
              <span className="sr-only"> {t('rights.newTab')}</span>
            </a>
          </Button>
          <LanguageToggle className="self-start" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The sticky action of phones: it shows up once the hero is behind and hides where the journeys,
 * the final band or the footer already offer it, so it never covers the same action twice.
 */
export function StickyJourneyBar() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const ids = ['hero-title', 'recorridos', 'final-title', 'landing-footer'];
    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target.id, e.isIntersecting);
      setVisible(!ids.some((id) => seen.get(id)));
    });
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return (
    <div
      data-sticky-journey
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface-container-lowest px-(--space-gutter) pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-200 ease-standard motion-reduce:transition-none medium:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
    >
      <Button asChild size="m" className="w-full">
        <InPageLink to="recorridos" tabIndex={visible ? 0 : -1}>
          {t('landing.chooseJourney')}
        </InPageLink>
      </Button>
    </div>
  );
}

/** Horizontal cards with snap on phones; the usual grid from tablets (D-324). */
export const carouselList = 'max-medium:-mx-(--space-gutter) max-medium:flex max-medium:snap-x max-medium:snap-mandatory max-medium:overflow-x-auto max-medium:px-(--space-gutter) max-medium:pb-3 max-medium:scroll-px-(--space-gutter) max-medium:[scrollbar-width:thin]';
export const carouselItem = 'max-medium:w-[82%] max-medium:shrink-0 max-medium:snap-start';
