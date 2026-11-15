import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { IconTile } from '@/components/ui/IconTile';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import levels from '@/data/levels.json';
import missionsJson from '@/data/wallet-missions.json';
import { GoalProgressView, useGoalText } from '@/features/learning/Community';
import { activeGoal } from '@/lib/community';
import { formatDate } from '@/lib/dates';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { Cohort, CollectiveGoal } from '@/types/domain';
import { useTutorData } from './tutor-ui';

/**
 * T2 · Collective goal of the cohort (D-80, D-274): the tutor picks a behavior measured with learning
 * data (a mission completed or a level challenge passed), a share and a date. The progress is
 * aggregated with the threshold; nobody is ranked or named.
 */
const LEVEL_OPTIONS = levels.filter((l) => l.phase === 'A' && l.order >= 1).map((l) => l.id);
const MISSION_OPTIONS = missionsJson.missions.filter((m) => m.id !== 'mission-security');

export function CollectiveGoalSection({ cohort }: { cohort: Cohort }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const setGoal = useDataStore((s) => s.setCollectiveGoal);
  const goalText = useGoalText();
  const goal = activeGoal(data.collectiveGoals, cohort, DEMO_TODAY);
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState(goal ? `${goal.kind}:${goal.targetId}` : `mission:${MISSION_OPTIONS[0]!.id}`);
  const [share, setShare] = useState(goal ? String(Math.round(goal.targetShare * 100)) : '70');
  const [due, setDue] = useState(goal?.dueDate ?? cohort.dueDate ?? '');
  const [tried, setTried] = useState(false);
  const shareN = Number(share);
  const shareError = tried && !(shareN >= 50 && shareN <= 100) ? t('community.goal.shareError') : undefined;
  const dueError = tried && (!due || due < DEMO_TODAY) ? t('tutor.assign.dueError') : undefined;

  const save = () => {
    setTried(true);
    if (!(shareN >= 50 && shareN <= 100) || !due || due < DEMO_TODAY) return;
    const [kind, targetId] = target.split(':') as [CollectiveGoal['kind'], string];
    setGoal({ id: `goal-${cohort.id}-${data.collectiveGoals.length + 1}`, cohortId: cohort.id, kind, targetId, targetShare: shareN / 100, dueDate: due, createdBy: user?.personId ?? '', createdAt: DEMO_TODAY });
    toast.success(t('community.goal.saved'));
    setEditing(false);
    setTried(false);
  };

  return (
    <section aria-labelledby="goal-title" className="flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconTile icon="target" tone="tertiary" />
          <h2 id="goal-title" className="text-title-large text-on-surface">
            {t('community.goal.title')}
          </h2>
        </div>
        {!editing && (
          <Button variant="tonal" leadingIcon={goal ? 'edit' : 'add'} onClick={() => setEditing(true)}>
            {goal ? t('community.goal.change') : t('community.goal.create')}
          </Button>
        )}
      </div>
      <p className="text-body-medium text-on-surface-variant">{t('community.goal.intro')}</p>
      {goal && !editing && (
        <div className="flex flex-col gap-3 rounded-lg bg-surface-container p-4">
          <p className="text-label-large text-on-surface">{goalText(goal)}</p>
          <p className="text-body-small text-on-surface-variant">{t('community.goal.due', { date: formatDate(goal.dueDate) })}</p>
          <GoalProgressView goal={goal} />
        </div>
      )}
      {editing && (
        <div className="flex flex-col gap-4">
          <Select
            label={t('community.goal.target')}
            helperText={t('community.goal.targetHelp')}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            options={[
              ...MISSION_OPTIONS.map((m) => ({ value: `mission:${m.id}`, label: t('community.goal.optionMission', { name: m.title }) })),
              ...LEVEL_OPTIONS.map((id) => ({ value: `level:${id}`, label: t('community.goal.optionLevel', { n: id.replace('level-', ''), name: t(`wallet.sections.${id}`) }) })),
            ]}
          />
          <TextField label={t('community.goal.share')} helperText={t('community.goal.shareHelp')} value={share} onChange={(e) => setShare(e.target.value.replace(/\D/g, ''))} error={shareError} inputMode="numeric" />
          <TextField type="date" label={t('community.goal.dueLabel')} helperText={t('community.goal.dueHelp')} value={due} min={DEMO_TODAY} onChange={(e) => setDue(e.target.value)} error={dueError} />
          <div className="flex flex-wrap gap-3">
            <Button leadingIcon="check" onClick={save}>
              {t('community.goal.save')}
            </Button>
            <Button variant="outlined" onClick={() => setEditing(false)}>
              {t('ui.cancel')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
