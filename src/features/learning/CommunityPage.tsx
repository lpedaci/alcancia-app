import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { fuerteLine } from '@/features/companion/fuerte-lines';
import { WalletShell } from '@/features/wallet/WalletShell';
import { useOrgData } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { CohortCommunityCard, PostForm, PostThread } from './Community';

/**
 * F20 · The cohort's space (D-274): questions and answers among peers, moderated by the tutor.
 * Only the person's cohort; never amounts or personal data (the form blocks them). Not in the
 * product context, which has no cohorts for its users (5.5).
 */
export function CommunityPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const data = useOrgData();
  const cohort = data.cohorts.find((c) => data.people.find((p) => p.id === personId)?.cohortIds.includes(c.id));
  const posts = cohort ? data.cohortPosts.filter((p) => p.cohortId === cohort.id) : [];
  const roots = posts.filter((p) => !p.parentId && (!p.hidden || p.personId === personId)).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'neutral', message: fuerteLine('community.fuerte') }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Button asChild variant="text" leadingIcon="arrow_back" className="-ml-3 self-start">
            <Link to="/app/learn">{t('learn.challenge.leaveToLearn')}</Link>
          </Button>
          <h1 className="text-headline-medium text-on-surface">{t('community.page.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('community.page.intro')}</p>
        </header>

        {data.organization.kind === 'product' || !cohort ? (
          <p className="text-body-large text-on-surface-variant">{t('community.page.none')}</p>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] large:items-start">
            <div className="flex min-w-0 flex-col gap-6">
              <section aria-labelledby="new-post" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
                <h2 id="new-post" className="text-title-large text-on-surface">
                  {t('community.form.title')}
                </h2>
                <p className="flex items-start gap-2 rounded-lg bg-surface-container p-3 text-body-medium text-on-surface">
                  <Icon name="shield_person" size={20} className="mt-0.5 shrink-0 text-primary" />
                  {t('community.page.rules')}
                </p>
                <PostForm personId={personId} cohortId={cohort.id} />
              </section>
              <section aria-labelledby="threads" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
                <h2 id="threads" className="text-title-large text-on-surface">
                  {t('community.page.threads', { cohort: cohort.name })}
                </h2>
                {roots.length === 0 ? (
                  <p className="text-body-medium text-on-surface-variant">{t('community.page.empty')}</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {roots.map((root) => (
                      <PostThread key={root.id} root={root} posts={posts} viewerId={personId} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
            <CohortCommunityCard personId={personId} showLink={false} />
          </div>
        )}
      </div>
    </WalletShell>
  );
}
