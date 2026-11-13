import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { TutorShell } from './TutorShell';
import { membersOf } from './tutor-data';
import { useTutorData } from './tutor-ui';
import { WeeklyList } from './WeeklyList';

/**
 * T3, assign a weekly challenge to a cohort (CLAUDE.md F5, F6, D-193): a suggested challenge or one
 * of her own, with a due date, and a preview of how participants see it. Participants answer with
 * a self-report (done, partial, not done) and an optional reflection that never reaches the tutor.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const TEMPLATES = ['track', 'cft', 'subscriptions', 'budget', 'emergency'] as const;
const addDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86400000).toISOString().slice(0, 10);

export function AssignChallengePage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const assign = useDataStore((s) => s.assignWeeklyChallenge);
  const [template, setTemplate] = useState<string>(TEMPLATES[0]);
  const [custom, setCustom] = useState('');
  const [due, setDue] = useState(addDays(DEMO_TODAY, 7));
  const [tried, setTried] = useState(false);
  const cohort = data.cohorts.find((c) => c.id === id && c.tutorId === user?.personId);
  if (!cohort) return <NotFoundPage />;
  const title = template === 'custom' ? custom.trim() : t(`tutor.assign.templates.${template}`);
  const titleError = tried && template === 'custom' && title.length < 5 ? t('tutor.assign.customError') : undefined;
  const dueError = tried && (!due || due < DEMO_TODAY) ? t('tutor.assign.dueError') : undefined;
  const active = membersOf(data, cohort).filter((p) => p.status === 'active').length;

  const submit = () => {
    setTried(true);
    if ((template === 'custom' && title.length < 5) || !due || due < DEMO_TODAY) return;
    const n = data.weeklyChallenges.filter((w) => w.cohortId === cohort.id).length + 1;
    assign({ id: `weekly-${cohort.id.replace('cohort-', '')}-${n}`, cohortId: cohort.id, title, assignedAt: DEMO_TODAY, dueDate: due });
    toast.success(t('tutor.assign.done'));
    setTried(false);
    setCustom('');
  };

  return (
    <TutorShell>
      <header className="flex flex-col gap-3">
        <Link to={`/tutor/cohorts/${cohort.id}`} className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
          <Icon name="arrow_back" size={18} />
          {t('tutor.assign.back', { name: cohort.name })}
        </Link>
        <h1 className="text-headline-medium text-on-surface">{t('tutor.assign.title')}</h1>
        <p className="text-body-large text-on-surface-variant">{t('tutor.assign.intro', { name: cohort.name, count: active })}</p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] large:items-start">
        <section aria-labelledby="assign-form" className={card}>
          <div className="flex items-center gap-3">
            <IconTile icon="assignment" tone="primary" />
            <h2 id="assign-form" className="text-title-large text-on-surface">
              {t('tutor.assign.formTitle')}
            </h2>
          </div>
          <RadioGroup
            name="weekly-template"
            legend={t('tutor.assign.template')}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            options={[...TEMPLATES.map((k) => ({ value: k, label: t(`tutor.assign.templates.${k}`) })), { value: 'custom', label: t('tutor.assign.custom') }]}
          />
          {template === 'custom' && (
            <TextField label={t('tutor.assign.customLabel')} helperText={t('tutor.assign.customHelp')} value={custom} onChange={(e) => setCustom(e.target.value)} error={titleError} maxLength={90} />
          )}
          <TextField type="date" label={t('tutor.assign.due')} helperText={t('tutor.assign.dueHelp')} value={due} min={DEMO_TODAY} onChange={(e) => setDue(e.target.value)} error={dueError} />
          <InlineAlert tone="info" live="none">
            {t('tutor.assign.privacy')}
          </InlineAlert>
          <Button leadingIcon="send" className="self-start" onClick={submit}>
            {t('tutor.assign.submit')}
          </Button>
        </section>

        <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
          <section aria-labelledby="preview-title" className={cn(card, 'bg-surface-container')}>
            <h2 id="preview-title" className="text-title-medium text-on-surface">
              {t('tutor.assign.preview')}
            </h2>
            <div className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <StatusPill tone="primary" icon="assignment" label={t('tutor.assign.previewChip')} className="self-start" />
              <p className="text-title-medium text-on-surface">{title || t('tutor.assign.previewEmpty')}</p>
              <p className="text-body-small text-on-surface-variant">{due ? t('tutor.assign.previewDue', { date: formatDate(due) }) : ''}</p>
              <p className="text-body-small text-on-surface-variant">{t('tutor.assign.previewReport')}</p>
            </div>
          </section>
          <section aria-labelledby="assigned-title" className={card}>
            <h2 id="assigned-title" className="text-title-large text-on-surface">
              {t('tutor.weekly.title')}
            </h2>
            <WeeklyList cohortId={cohort.id} />
          </section>
        </div>
      </div>
    </TutorShell>
  );
}
