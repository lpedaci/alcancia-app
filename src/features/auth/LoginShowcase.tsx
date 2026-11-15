import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AppPhone } from '@/features/landing/PhoneMockup';
import { PieceSimResult } from '@/features/landing/ProductPieces';

/**
 * Right panel of G1 from 1024 px (D-257): the same story as the landing hero. A short value sentence
 * with the key words in primary, and the wallet as it looks today on a phone, rising from the bottom
 * of the panel with two real pieces beside it. Flat primary container, never a gradient. Decorative:
 * the same message is in the text.
 */
export function LoginShowcase() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full min-h-0 flex-col gap-8 text-on-primary-container">
      <div className="flex max-w-xl flex-col gap-3">
        <p className="w-fit rounded-full bg-surface-container-lowest px-3 py-1 text-label-large text-primary">{t('auth.showcase.eyebrow')}</p>
        <p className="text-headline-medium text-balance xl:text-display-small">
          {t('auth.showcase.titleStart')} <span className="text-primary">{t('auth.showcase.titleKey')}</span> {t('auth.showcase.titleEnd')}
        </p>
        <p className="text-body-large">{t('auth.showcase.body')}</p>
      </div>
      {/* The phone rises from the bottom edge of the panel, cropped like a product shot */}
      <div aria-hidden className="relative -mb-12 flex flex-1 items-end justify-center">
        <div className="relative w-80 translate-y-24">
          <AppPhone screen="home" />
        </div>
        <PieceSimResult className="absolute top-6 left-0 hidden w-52 xl:flex" />
        <div className="absolute right-0 bottom-28 hidden w-52 flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-on-surface xl:flex">
          <p className="text-label-medium text-on-surface-variant">{t('landing.floating.unlockLabel')}</p>
          <p className="flex items-center gap-1.5 text-title-small">
            <Icon name="lock" size={18} /> {t('landing.floating.unlockTitle')}
          </p>
          <ProgressBar value={66.67} label={t('landing.floating.unlockProgress')} valueText={t('landing.floating.unlockValue')} tone="tertiary" />
          <p className="text-body-small text-on-surface-variant">
            {t('landing.floating.unlockProgress')}: {t('landing.floating.unlockValue')}
          </p>
        </div>
      </div>
    </div>
  );
}
