import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusTone } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/toast-store';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { readLocal, writeLocal } from '@/store/local-store';
import type { WeeklyChallenge, WeeklyChallengeReport } from '@/types/domain';
import { guideOfModule, MODULES } from './questions';

/**
 * The participant's side of tutoring (F5, F6; RF-50, D-202): the tutor's weekly challenges with a
 * self-report (yes, partly, no) and an optional reflection, and the questions about the modules.
 * Only the result of a challenge and the text of a question reach the tutor; the reflection stays
 * in this browser (local store), as the privacy notice says.
 */
type Result = WeeklyChallengeReport['result'];
const RESULT_TONE: Record<Result, StatusTone> = { done: 'success', partial: 'warning', not_done: 'neutral' };
const RESULT_ICON = { done: 'check_circle', partial: 'timelapse', not_done: 'radio_button_unchecked' } as const;
const at = () => `${DEMO_TODAY}T10:00:00.000Z`;
const card = 'flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function WeeklyChallenges({ personId }: { personId: string }) {
  const { t } = useTranslation();
  const people = useDataStore((s) => s.people);
  const allChallenges = useDataStore((s) => s.weeklyChallenges);
  const allReports = useDataStore((s) => s.weeklyReports);
  const cohortIds = people.find((p) => p.id === personId)?.cohortIds ?? [];
  const challenges = allChallenges.filter((c) => cohortIds.includes(c.cohortId)).sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
  const reportOf = (id: string) => allReports.find((r) => r.challengeId === id && r.personId === personId);
  const [current, ...past] = challenges;

  return (
    <section aria-labelledby="weekly-title" className={card}>
      <div className="flex flex-col gap-1">
        <h2 id="weekly-title" className="text-title-large text-on-surface">
          {t('learn.weekly.title')}
        </h2>
        <p className="text-body-medium text-on-surface-variant">{t('learn.weekly.intro')}</p>
      </div>
      {!current ? (
        <p className="text-body-medium text-on-surface-variant">{t('learn.weekly.empty')}</p>
      ) : (
        <WeeklyItem key={current.id} challenge={current} report={reportOf(current.id)} personId={personId} />
      )}
      {past.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
          <h3 className="text-title-small text-on-surface">{t('learn.weekly.past')}</h3>
          <ul className="flex flex-col gap-2">
            {past.map((c) => {
              const report = reportOf(c.id);
              return (
                <li key={c.id} className="flex flex-col gap-1.5 rounded-lg bg-surface-container px-3 py-2">
                  <span className="text-body-medium text-on-surface">{c.title}</span>
                  <span className="flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
                    {report ? (
                      <StatusPill tone={RESULT_TONE[report.result]} icon={RESULT_ICON[report.result]} label={t(`learn.weekly.results.${report.result}`)} />
                    ) : (
                      <StatusPill tone="neutral" icon="schedule" label={t('learn.weekly.notReported')} />
                    )}
                    {t('learn.weekly.due', { date: formatDate(c.dueDate) })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function WeeklyItem({ challenge, report, personId }: { challenge: WeeklyChallenge; report?: WeeklyChallengeReport; personId: string }) {
  const { t } = useTranslation();
  const reportWeekly = useDataStore((s) => s.reportWeeklyChallenge);
  const [editing, setEditing] = useState(!report);
  const [result, setResult] = useState<Result | undefined>(report?.result);
  const [reflection, setReflection] = useState(() => readLocal(personId).reflections[challenge.id] ?? '');
  const [error, setError] = useState<string>();
  const overdue = challenge.dueDate < DEMO_TODAY;

  const submit = () => {
    if (!result) {
      setError(t('learn.weekly.resultError'));
      return;
    }
    // Only the result is shared; the reflection stays in this browser (F5).
    writeLocal(personId, (d) => ({ ...d, reflections: { ...d.reflections, [challenge.id]: reflection.trim() } }));
    reportWeekly({ challengeId: challenge.id, personId, result, reportedAt: DEMO_TODAY });
    setEditing(false);
    toast.success(t('learn.weekly.sent'));
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-outline-variant p-4">
      <div className="flex flex-col gap-2">
        <StatusPill tone="primary" icon="assignment" label={t('learn.weekly.chip')} className="self-start" />
        <p className="text-title-medium text-on-surface">{challenge.title}</p>
        <p className={cn('text-body-small', overdue ? 'text-warning' : 'text-on-surface-variant')}>
          {t(overdue ? 'learn.weekly.overdue' : 'learn.weekly.due', { date: formatDate(challenge.dueDate) })}
        </p>
      </div>
      {editing ? (
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <ChoiceGroup
            legend={t('learn.weekly.question')}
            value={result}
            onChange={(v) => {
              setResult(v as Result);
              setError(undefined);
            }}
            error={error}
            choices={(['done', 'partial', 'not_done'] as const).map((value) => ({
              value,
              label: t(`learn.weekly.results.${value}`),
              icon: RESULT_ICON[value],
              tone: value === 'done' ? 'success' : value === 'partial' ? 'warning' : 'primary',
            }))}
          />
          <TextArea
            label={t('learn.weekly.reflection')}
            helperText={t('learn.weekly.reflectionHelp')}
            optional
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            maxLength={600}
          />
          <Button type="submit" className="self-start" leadingIcon="send">
            {t('learn.weekly.send')}
          </Button>
        </form>
      ) : (
        report && (
          <div className="flex flex-col gap-3">
            <StatusPill tone={RESULT_TONE[report.result]} icon={RESULT_ICON[report.result]} label={t('learn.weekly.yourReport', { result: t(`learn.weekly.results.${report.result}`) })} className="self-start" />
            {reflection && (
              <div className="flex flex-col gap-1 rounded-md bg-surface-container px-3 py-2">
                <p className="flex items-center gap-1.5 text-label-medium text-on-surface-variant">
                  <Icon name="lock" size={16} />
                  {t('learn.weekly.onlyYou')}
                </p>
                <p className="text-body-medium text-on-surface">{reflection}</p>
              </div>
            )}
            <Button variant="text" leadingIcon="edit" className="self-start" onClick={() => setEditing(true)}>
              {t('learn.weekly.change')}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

/** Form to ask the tutor about a module; with `moduleId` it is fixed (the guide's module). */
export function AskTutorForm({ personId, moduleId, className, onSent }: { personId: string; moduleId?: string; className?: string; onSent?: () => void }) {
  const { t } = useTranslation();
  const ask = useDataStore((s) => s.askQuestion);
  const people = useDataStore((s) => s.people);
  const count = useDataStore((s) => s.tutorQuestions.length);
  const [module, setModule] = useState(moduleId ?? '');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<{ module?: string; text?: string }>({});
  const options = MODULES.filter((m) => m.phase === 'A' && guideOfModule(m.id)).map((m) => ({ value: m.id, label: t('learn.challenge.module', { n: m.order, title: m.title }) }));

  const submit = () => {
    const next = { module: module ? undefined : t('learn.ask.moduleError'), text: text.trim().length >= 10 ? undefined : t('learn.ask.textError') };
    setErrors(next);
    if (next.module || next.text) return;
    const cohortId = people.find((p) => p.id === personId)?.cohortIds[0] ?? '';
    ask({ id: `question-${personId}-${count + 1}`, personId, cohortId, moduleId: module, text: text.trim(), askedAt: at() });
    setText('');
    if (!moduleId) setModule('');
    toast.success(t('learn.ask.sent'));
    onSent?.();
  };

  return (
    <form
      noValidate
      className={cn('flex flex-col gap-4', className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {!moduleId && (
        <Select
          label={t('learn.ask.module')}
          helperText={t('learn.ask.moduleHelp')}
          options={[{ value: '', label: t('learn.ask.modulePlaceholder') }, ...options]}
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setErrors((x) => ({ ...x, module: undefined }));
          }}
          error={errors.module}
          required
        />
      )}
      <TextArea
        label={t('learn.ask.text')}
        helperText={t('learn.ask.textHelp')}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (errors.text && e.target.value.trim().length >= 10) setErrors((x) => ({ ...x, text: undefined }));
        }}
        error={errors.text}
        maxLength={600}
        required
      />
      <p className="flex items-start gap-2 text-body-small text-on-surface-variant">
        <Icon name="shield_person" size={16} className="mt-0.5 shrink-0" />
        {t('learn.ask.privacy')}
      </p>
      <Button type="submit" variant="tonal" leadingIcon="send" className="self-start">
        {t('learn.ask.send')}
      </Button>
    </form>
  );
}

export function MyQuestions({ personId }: { personId: string }) {
  const { t } = useTranslation();
  const all = useDataStore((s) => s.tutorQuestions);
  const mine = all.filter((q) => q.personId === personId).sort((a, b) => b.askedAt.localeCompare(a.askedAt));
  const [asking, setAsking] = useState(false);

  return (
    <section aria-labelledby="questions-title" className={card}>
      <div className="flex flex-col gap-1">
        <h2 id="questions-title" className="text-title-large text-on-surface">
          {t('learn.ask.title')}
        </h2>
        <p className="text-body-medium text-on-surface-variant">{t('learn.ask.intro')}</p>
      </div>
      {mine.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('learn.ask.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {mine.map((q) => {
            const module = MODULES.find((m) => m.id === q.moduleId);
            return (
              <li key={q.id} className="flex flex-col gap-2 rounded-lg bg-surface-container p-3">
                <span className="text-label-medium text-on-surface-variant">{module ? t('learn.challenge.module', { n: module.order, title: module.title }) : ''}</span>
                <p className="text-body-medium text-on-surface">{q.text}</p>
                {q.answer ? (
                  <div className="flex flex-col gap-1 border-l-2 border-tertiary pl-3">
                    <p className="text-label-medium text-on-surface-variant">{t('learn.ask.answered', { date: formatDate(q.answer.answeredAt.slice(0, 10)) })}</p>
                    <p className="text-body-medium text-on-surface">{q.answer.text}</p>
                  </div>
                ) : (
                  <StatusPill tone="neutral" icon="schedule" label={t('learn.ask.waiting')} className="self-start" />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {asking ? (
        <AskTutorForm personId={personId} className="border-t border-outline-variant pt-4" onSent={() => setAsking(false)} />
      ) : (
        <Button variant="tonal" leadingIcon="forum" className="self-start" onClick={() => setAsking(true)}>
          {t('learn.ask.open')}
        </Button>
      )}
    </section>
  );
}
