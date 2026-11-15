import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/Dialog';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { PostThread } from '@/features/learning/Community';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { CohortPost } from '@/types/domain';
import { TutorShell } from './TutorShell';
import { useTutorData } from './tutor-ui';

/**
 * T6 · The tutor moderates the spaces of her cohorts (F20, D-274): she answers, endorses a good
 * answer and hides a post with a reason the author sees. Anonymous posts stay anonymous for her too.
 */
export function CommunityModerationPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const moderatePost = useDataStore((s) => s.moderatePost);
  const cohorts = data.cohorts.filter((c) => c.tutorId === user?.personId);
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? '');
  const [hiding, setHiding] = useState<CohortPost | null>(null);
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  const posts = data.cohortPosts.filter((p) => p.cohortId === cohortId);
  const roots = posts.filter((p) => !p.parentId).sort((a, b) => b.at.localeCompare(a.at));
  const reasonError = tried && reason.trim().length < 5 ? t('community.mod.reasonError') : undefined;

  const confirmHide = () => {
    setTried(true);
    if (!hiding || reason.trim().length < 5) return;
    moderatePost(hiding.id, { hidden: { reason: reason.trim(), at: new Date().toISOString() } });
    toast.success(t('community.mod.hidden'));
    setHiding(null);
    setReason('');
    setTried(false);
  };

  return (
    <TutorShell>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-medium text-on-surface">{t('community.mod.title')}</h1>
        <p className="text-body-large text-on-surface-variant">{t('community.mod.intro')}</p>
      </header>
      {cohorts.length > 1 && (
        <SegmentedButton label={t('community.mod.cohort')} value={cohortId} onValueChange={(v) => v && setCohortId(v)} options={cohorts.map((c) => ({ value: c.id, label: c.name.split(' · ')[0]! }))} className="w-full" />
      )}
      <section aria-labelledby="mod-threads" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
        <h2 id="mod-threads" className="text-title-large text-on-surface">
          {cohorts.find((c) => c.id === cohortId)?.name}
        </h2>
        {roots.length === 0 ? (
          <p className="text-body-medium text-on-surface-variant">{t('community.page.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {roots.map((root) => (
              <PostThread
                key={root.id}
                root={root}
                posts={posts}
                viewerId={user?.personId ?? ''}
                moderate={{
                  onEndorse: (p) => {
                    moderatePost(p.id, { endorsed: !p.endorsed });
                    toast.success(t(p.endorsed ? 'community.mod.unendorsed' : 'community.mod.endorsed'));
                  },
                  onHide: (p) => setHiding(p),
                }}
              />
            ))}
          </ul>
        )}
      </section>

      <Dialog open={hiding !== null} onOpenChange={(o) => !o && setHiding(null)}>
        {hiding && (
          <DialogContent
            title={t('community.mod.hideTitle')}
            description={t('community.mod.hideIntro')}
            actions={
              <>
                <DialogClose asChild>
                  <Button variant="outlined" fullWidth className="sm:w-auto">
                    {t('ui.cancel')}
                  </Button>
                </DialogClose>
                <Button fullWidth className="sm:w-auto" leadingIcon="visibility_off" onClick={confirmHide}>
                  {t('community.mod.hideConfirm')}
                </Button>
              </>
            }
          >
            <TextField label={t('community.mod.reason')} helperText={t('community.mod.reasonHelp')} value={reason} onChange={(e) => setReason(e.target.value)} error={reasonError} autoComplete="off" />
          </DialogContent>
        )}
      </Dialog>
    </TutorShell>
  );
}
