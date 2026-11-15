import { useTranslation } from 'react-i18next';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
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
                <ListLinkRow
                  to={`/app/learn/review/${r.moduleId}`}
                  icon="replay"
                  title={title}
                  srPrefix={t('learn.review.start')}
                  detail={t('learn.review.item', { count: r.round })}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
