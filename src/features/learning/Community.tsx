import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/toast-store';
import missionsJson from '@/data/wallet-missions.json';
import { activeGoal, contributes, goalProgress, POST_MAX, type PostProblem, postProblems } from '@/lib/community';
import { formatDate } from '@/lib/dates';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore, useOrgData } from '@/store/data-store';
import type { CohortPost, CollectiveGoal } from '@/types/domain';

/**
 * Step 26 (D-274): the collective goal of the cohort (D-80) and the cohort's space (F20). The goal
 * is aggregated with the threshold of 5, with no ranking and no names; the person only sees her own
 * contribution. The space is moderated by the tutor and never accepts amounts or personal data.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const missionTitle = (id: string) => missionsJson.missions.find((m) => m.id === id)?.title ?? id;

/** "Que el 60 % de la cohorte complete la misión «…»" */
export function useGoalText() {
  const { t } = useTranslation();
  return (goal: CollectiveGoal) =>
    goal.kind === 'mission'
      ? t('community.goal.mission', { share: formatPercent(goal.targetShare, { decimals: 0 }), name: missionTitle(goal.targetId) })
      : t('community.goal.level', { share: formatPercent(goal.targetShare, { decimals: 0 }), n: goal.targetId.replace('level-', ''), name: t(`wallet.sections.${goal.targetId}`) });
}

/** Progress of a goal, aggregated (or "insufficient" under the threshold). */
export function GoalProgressView({ goal }: { goal: CollectiveGoal }) {
  const { t } = useTranslation();
  const data = useOrgData();
  const p = goalProgress(goal, data, data.program.passingScore, data.organization.privacyThreshold);
  if (p.status !== 'ok') return <p className="text-body-medium text-on-surface-variant">{t('community.goal.insufficient')}</p>;
  return (
    <div className="flex flex-col gap-2">
      <ProgressBar
        value={(p.value.share / goal.targetShare) * 100}
        label={t('community.goal.progressLabel')}
        valueText={t('community.goal.progress', { share: formatPercent(p.value.share, { decimals: 0 }), goal: formatPercent(goal.targetShare, { decimals: 0 }) })}
        tone="tertiary"
      />
      {p.value.reached && <StatusPill tone="success" icon="task_alt" label={t('community.goal.reached')} className="self-start" />}
    </div>
  );
}

/** Aprender (P9): the cohort's goal and the way into its space. Not in the product context (5.5). */
export function CohortCommunityCard({ personId, showLink = true }: { personId: string; showLink?: boolean }) {
  const { t } = useTranslation();
  const data = useOrgData();
  const goalText = useGoalText();
  const cohort = data.cohorts.find((c) => data.people.find((p) => p.id === personId)?.cohortIds.includes(c.id));
  if (!cohort) return null;
  const goal = activeGoal(data.collectiveGoals, cohort, DEMO_TODAY);
  const threads = data.cohortPosts.filter((p) => p.cohortId === cohort.id && !p.parentId && !p.hidden).length;
  const mine = goal ? contributes(goal, personId, data, data.program.passingScore) : false;
  return (
    <section aria-labelledby="cohort-goal-title" className={card}>
      <div className="flex flex-col gap-1">
        <h2 id="cohort-goal-title" className="text-title-large text-on-surface">
          {t('community.card.title')}
        </h2>
        <p className="text-body-medium text-on-surface-variant">{cohort.name}</p>
      </div>
      {goal ? (
        <div className="flex flex-col gap-3 rounded-lg bg-surface-container p-4">
          <p className="text-label-large text-on-surface">{goalText(goal)}</p>
          <p className="text-body-small text-on-surface-variant">{t('community.goal.due', { date: formatDate(goal.dueDate) })}</p>
          <GoalProgressView goal={goal} />
          <p className="flex items-start gap-2 text-body-small text-on-surface">
            <Icon name={mine ? 'check_circle' : 'flag'} size={16} className={cn('mt-0.5 shrink-0', mine ? 'text-success' : 'text-primary')} />
            {mine ? t('community.goal.youDid') : t('community.goal.youCan')}
          </p>
        </div>
      ) : (
        <p className="text-body-medium text-on-surface-variant">{t('community.goal.none')}</p>
      )}
      <p className="text-body-small text-on-surface-variant">{t('community.card.noRanking')}</p>
      {showLink && (
        <Button asChild variant="tonal" leadingIcon="forum" className="self-start">
          <Link to="/app/learn/community">{t('community.card.open', { count: threads })}</Link>
        </Button>
      )}
    </section>
  );
}

/** Name shown in the space: "Tú", the tutor with her role, a peer as "Nombre I.", or anonymous. */
export function useAuthorName(viewerId: string) {
  const { t } = useTranslation();
  const people = useDataStore((s) => s.people);
  return (post: CohortPost) => {
    if (post.personId === viewerId) return post.anonymous ? t('community.post.youAnonymous') : t('community.post.you');
    if (post.anonymous) return t('community.post.anonymous');
    const person = people.find((p) => p.id === post.personId);
    if (!person) return '';
    const [first, last] = person.name.split(' ');
    return person.role === 'tutor' ? t('community.post.tutor', { name: person.name }) : `${first} ${last ? `${last[0]}.` : ''}`.trim();
  };
}

const PROBLEM_KEY: Record<PostProblem, string> = {
  empty: 'community.form.errors.empty',
  too_long: 'community.form.errors.tooLong',
  money: 'community.form.errors.money',
  contact: 'community.form.errors.contact',
  account: 'community.form.errors.account',
};

/** A new thread or a reply. The guard explains what to remove; nothing is published with it. */
export function PostForm({ personId, cohortId, parentId, onDone, allowAnonymous = true }: { personId: string; cohortId: string; parentId?: string; onDone?: () => void; allowAnonymous?: boolean }) {
  const { t } = useTranslation();
  const addPost = useDataStore((s) => s.addPost);
  const count = useDataStore((s) => s.cohortPosts.length);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [problems, setProblems] = useState<PostProblem[]>([]);
  const submit = () => {
    const found = postProblems(text);
    setProblems(found);
    if (found.length) return;
    addPost({ id: `post-${personId}-${count + 1}`, cohortId, personId, anonymous: allowAnonymous && anonymous, text: text.trim(), at: new Date().toISOString(), ...(parentId ? { parentId } : {}) });
    setText('');
    setAnonymous(false);
    toast.success(t(parentId ? 'community.form.replied' : 'community.form.posted'));
    onDone?.();
  };
  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <TextArea
        label={t(parentId ? 'community.form.replyLabel' : 'community.form.label')}
        helperText={t('community.form.help')}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (problems.length && postProblems(e.target.value).length === 0) setProblems([]);
        }}
        error={problems.length ? problems.map((p) => t(PROBLEM_KEY[p])).join(' ') : undefined}
        maxLength={POST_MAX}
        required
      />
      {allowAnonymous && <Checkbox label={t('community.form.anonymous')} description={t('community.form.anonymousHelp')} checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />}
      <Button type="submit" variant="tonal" leadingIcon="send" className="self-start">
        {t(parentId ? 'community.form.reply' : 'community.form.post')}
      </Button>
    </form>
  );
}

/** A thread: the question and its replies. `moderate` adds the tutor's actions. */
export function PostThread({
  root,
  posts,
  viewerId,
  moderate,
  canReply = true,
}: {
  root: CohortPost;
  posts: CohortPost[];
  viewerId: string;
  moderate?: { onEndorse: (post: CohortPost) => void; onHide: (post: CohortPost) => void };
  canReply?: boolean;
}) {
  const { t } = useTranslation();
  const name = useAuthorName(viewerId);
  const [replying, setReplying] = useState(false);
  const replies = posts.filter((p) => p.parentId === root.id).sort((a, b) => a.at.localeCompare(b.at));
  // Hidden posts: the tutor sees them with the reason; the author too; nobody else
  const visible = (p: CohortPost) => !p.hidden || moderate || p.personId === viewerId;

  const item = (p: CohortPost, reply: boolean) =>
    visible(p) && (
      <div key={p.id} className={cn('flex flex-col gap-2', reply && 'border-l-2 border-outline-variant pl-4')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-label-large text-on-surface">{name(p)}</span>
          <span className="text-body-small text-on-surface-variant tabular-nums">{formatDate(p.at.slice(0, 10))}</span>
          {p.endorsed && <StatusPill tone="success" icon="verified_user" label={t('community.post.endorsed')} />}
        </div>
        {p.hidden ? (
          <InlineAlert tone="info" live="none">
            {t('community.post.hidden', { reason: p.hidden.reason })}
          </InlineAlert>
        ) : (
          <p className="text-body-large whitespace-pre-line text-on-surface">{p.text}</p>
        )}
        {moderate && !p.hidden && (
          <div className="flex flex-wrap gap-2">
            {reply && (
              <Button variant="text" size="xs" leadingIcon="verified_user" onClick={() => moderate.onEndorse(p)}>
                {p.endorsed ? t('community.mod.unendorse') : t('community.mod.endorse')}
              </Button>
            )}
            <Button variant="text" size="xs" leadingIcon="visibility_off" onClick={() => moderate.onHide(p)}>
              {t('community.mod.hide')}
            </Button>
          </div>
        )}
      </div>
    );

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-outline-variant p-4">
      {item(root, false)}
      {replies.length > 0 && <div className="flex flex-col gap-4">{replies.map((r) => item(r, true))}</div>}
      {canReply &&
        !root.hidden &&
        (replying ? (
          <PostForm personId={viewerId} cohortId={root.cohortId} parentId={root.id} allowAnonymous={!moderate} onDone={() => setReplying(false)} />
        ) : (
          <Button variant="text" size="xs" leadingIcon="chat" className="self-start" onClick={() => setReplying(true)}>
            {t('community.form.reply')}
          </Button>
        ))}
    </li>
  );
}
