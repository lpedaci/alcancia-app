import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { moduleById } from './questions';
import { useReminders } from './use-reminders';

/** Aprender (P9): the spaced reviews that are due (F19, D-273), one row each: the whole row opens it (D-279). */
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
        // M3 list (D-279): one action per row, so the whole row is the target, with a trailing chevron
        <ul className="flex flex-col gap-2">
          {reviews.map((r) => {
            const title = moduleById(r.moduleId)?.title ?? r.moduleId;
            return (
              <li key={`${r.moduleId}-${r.round}`}>
                <Link
                  to={`/app/learn/review/${r.moduleId}`}
                  aria-label={t('learn.review.startFor', { title })}
                  className="flex min-h-14 items-center gap-3 rounded-lg bg-surface-container px-3 py-2 transition-colors duration-150 hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Icon name="replay" size={20} className="shrink-0 text-primary" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-label-large text-on-surface">{title}</span>
                    <span className="text-body-small text-on-surface-variant">{t('learn.review.item', { count: r.round })}</span>
                  </span>
                  <Icon name="chevron_right" size={20} className="shrink-0 text-on-surface-variant" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
