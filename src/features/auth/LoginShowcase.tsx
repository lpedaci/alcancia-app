import { useTranslation } from 'react-i18next';
import { PieceGoal, PieceSimResult } from '@/features/landing/ProductPieces';

/**
 * Right panel of G1 from 1024 px: a value sentence and real pieces of the product (CLAUDE.md F0),
 * on a flat primary container. Decorative: the same message is in the text.
 */
export function LoginShowcase() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-8 text-on-primary-container">
      <div className="flex flex-col gap-3">
        <p className="text-label-large">{t('auth.showcase.eyebrow')}</p>
        <p className="text-display-small">{t('auth.showcase.title')}</p>
        <p className="text-body-large">{t('auth.showcase.body')}</p>
      </div>
      <div aria-hidden className="grid max-w-md grid-cols-2 gap-3">
        <PieceSimResult />
        <PieceGoal />
      </div>
    </div>
  );
}
