import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { moduleById } from './questions';
import { useReminders } from './use-reminders';

/** Aprender (P9): the spaced reviews that are due (F19, D-273), one row each, with "Repasar". */
export function DueReviews({ personId }: { personId: string }) {
  const { t } = useTranslation();
  const { reviews } = useReminders(personId);
  return (
    <section aria-labelledby="reviews-title" className="flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
      <div className="flex flex-col gap-1">
        <h2 id="reviews-title" className="text-title-large text-on-surface">
          {t('learn.review.cardTitle')}
        </h2>
        <p className="text-body-medium text-on-surface-variant">{t('learn.review.cardIntro')}</p>
      </div>
      {reviews.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('learn.review.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {reviews.map((r) => {
            const title = moduleById(r.moduleId)?.title ?? r.moduleId;
            return (
              <li key={`${r.moduleId}-${r.round}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container px-3 py-2">
                <span className="flex min-w-0 items-start gap-2">
                  <Icon name="replay" size={20} className="mt-0.5 shrink-0 text-primary" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-label-large text-on-surface">{title}</span>
                    <span className="text-body-small text-on-surface-variant">{t('learn.review.item', { count: r.round })}</span>
                  </span>
                </span>
                <Button asChild variant="tonal" size="xs" trailingIcon="arrow_forward">
                  <Link to={`/app/learn/review/${r.moduleId}`} aria-label={t('learn.review.startFor', { title })}>
                    {t('learn.review.start')}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
