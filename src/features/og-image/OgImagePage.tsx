/**
 * Open Graph image (CLAUDE.md 15): a 1200 × 630 composition made with the product's own pieces.
 * Development only, like /styleguide: `npm run og-image` screenshots it into public/og-image.png.
 */
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/layout/Logo';
import { AppPhone } from '@/features/landing/PhoneMockup';
import { PieceKpi, PieceSimResult } from '@/features/landing/ProductPieces';

export function OgImagePage() {
  const { t } = useTranslation();
  return (
    <main id="og-image" className="grid h-[630px] w-[1200px] grid-cols-[minmax(0,1fr)_480px] overflow-hidden bg-surface">
      <div className="flex flex-col justify-between py-14 pl-16">
        <Logo className="text-title-large" />
        <div className="flex flex-col gap-5">
          <p className="w-fit rounded-full bg-primary-container px-3 py-1 text-label-large text-on-primary-container">{t('landing.eyebrowTag')}</p>
          <h1 className="text-display-medium text-balance text-on-surface">
            {t('landing.hero.titleStart')} <span className="text-primary">{t('landing.hero.titleKey')}</span> {t('landing.hero.titleEnd')}
          </h1>
          <p className="text-title-medium text-on-surface-variant">{t('landing.eyebrowText')}</p>
        </div>
        <p className="text-body-large text-on-surface-variant">Lourdes Pedaci · Experience Designer (Learning y UX/UI)</p>
      </div>
      <div className="relative">
        <AppPhone screen="home" className="absolute top-12 left-24" />
        <PieceSimResult className="absolute top-24 -left-20 w-56" />
        <PieceKpi className="absolute bottom-16 -left-16 w-56" />
      </div>
    </main>
  );
}
