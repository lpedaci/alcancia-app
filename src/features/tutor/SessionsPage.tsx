import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { MODULES } from '@/features/learning/questions';
import { formatDate } from '@/lib/dates';
import { formatSessionTime, splitByTime } from '@/lib/sessions';
import { useDataStore, useOrgData } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { SessionRequest, TutorSession } from '@/types/domain';
import { TutorShell } from './TutorShell';

/**
 * T6, sessions with the tutor (F13, step 32, D-319): the requests for a 1:1 of the tutor's people,
 * the agenda of upcoming sessions (group per cohort or 1:1), the past ones with their simulated
 * recording, and the form to schedule one. A simulation: there is no call, no invitation and no
 * real calendar. A request carries a module and a short note, never amounts.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const DEFAULT_TIME = { morning: '10:00', afternoon: '15:00' } as const;

export function SessionsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useOrgData();
  const save = useDataStore((s) => s.saveSession);
  const saveRequest = useDataStore((s) => s.saveSessionRequest);
  const [answering, setAnswering] = useState<SessionRequest | undefined>();
  const [toCancel, setToCancel] = useState<TutorSession | undefined>();
  const [recording, setRecording] = useState<TutorSession | undefined>();
  const [summary, setSummary] = useState('');

  const tutorId = user?.personId ?? '';
  const myCohorts = data.cohorts.filter((c) => c.tutorId === tutorId);
  const people = data.people.filter((p) => p.role === 'participant' && p.cohortIds.some((c) => myCohorts.some((m) => m.id === c)));
  const name = (id?: string) => data.people.find((p) => p.id === id)?.name ?? '';
  const cohortName = (id?: string) => data.cohorts.find((c) => c.id === id)?.name ?? '';
  const moduleLabel = (id?: string) => {
    const m = MODULES.find((x) => x.id === id);
    return m ? t('learn.challenge.module', { n: m.order, title: m.title }) : '';
  };
  const mine = data.tutorSessions.filter((s) => s.tutorId === tutorId && s.status !== 'canceled');
  const { upcoming, past } = splitByTime(mine);
  const pending = data.sessionRequests.filter((r) => r.tutorId === tutorId && r.status === 'pending');
  const who = (s: TutorSession) => (s.kind === 'group' ? cohortName(s.cohortId) : name(s.personId));

  return (
    <TutorShell>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-medium text-on-surface">{t('sessions.title')}</h1>
        <p className="max-w-prose text-body-large text-on-surface-variant">{t('sessions.intro')}</p>
      </header>

      <section aria-labelledby="requests-title" className={card}>
        <div className="flex items-center gap-3">
          <IconTile icon="forum" tone="tertiary" />
          <h2 id="requests-title" className="text-title-large text-on-surface">
            {t('sessions.requests', { count: pending.length })}
          </h2>
        </div>
        {pending.length === 0 ? (
          <p className="text-body-medium text-on-surface-variant">{t('sessions.noRequests')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 rounded-lg bg-surface-container p-3">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-title-small text-on-surface">{name(r.personId)}</span>
                  <span className="text-body-small text-on-surface-variant">{t('sessions.requestedOn', { date: formatDate(r.requestedAt) })}</span>
                </span>
                <span className="text-label-medium text-on-surface-variant">
                  {moduleLabel(r.moduleId)} · {t(`sessions.preferred.${r.preferred}`)}
                </span>
                <p className="text-body-medium text-on-surface">{r.note}</p>
                {answering?.id === r.id ? (
                  <ScheduleForm
                    people={people}
                    cohorts={myCohorts}
                    initial={{ kind: 'one_on_one', personId: r.personId, moduleId: r.moduleId, title: t('sessions.oneOnOneTitle', { topic: MODULES.find((m) => m.id === r.moduleId)?.title ?? '' }), time: DEFAULT_TIME[r.preferred] }}
                    onCancel={() => setAnswering(undefined)}
                    onSave={(session) => {
                      save(session);
                      saveRequest({ ...r, status: 'scheduled', sessionId: session.id });
                      setAnswering(undefined);
                      toast.success(t('sessions.scheduled'));
                    }}
                  />
                ) : (
                  <span className="flex flex-col gap-2 medium:flex-row medium:justify-end">
                    <Button
                      variant="outlined"
                      className="w-full medium:w-auto"
                      onClick={() => {
                        saveRequest({ ...r, status: 'declined' });
                        toast.success(t('sessions.declined'));
                      }}
                    >
                      {t('sessions.decline')}
                    </Button>
                    <Button leadingIcon="event" className="w-full medium:w-auto" onClick={() => setAnswering(r)}>
                      {t('sessions.schedule')}
                    </Button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="upcoming-title" className={card}>
        <div className="flex items-center gap-3">
          <IconTile icon="event" tone="primary" />
          <h2 id="upcoming-title" className="text-title-large text-on-surface">
            {t('sessions.upcoming')}
          </h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-body-medium text-on-surface-variant">{t('sessions.noUpcoming')}</p>
        ) : (
          <ul className="@container flex flex-col divide-y divide-outline-variant">
            {upcoming.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex w-full min-w-0 flex-col gap-1 @md:w-auto @md:flex-1">
                  <span className="text-title-small text-on-surface">{s.title}</span>
                  <span className="text-body-small text-on-surface-variant">
                    {formatSessionTime(s.startsAt)} · {t('sessions.minutes', { count: s.minutes })} · {who(s)}
                  </span>
                </span>
                <StatusPill tone={s.kind === 'group' ? 'primary' : 'neutral'} icon={s.kind === 'group' ? 'groups' : 'person'} label={t(`sessions.kind.${s.kind}`)} />
                <Button variant="text" size="xs" onClick={() => setToCancel(s)}>
                  {t('sessions.cancel')}
                  <span className="sr-only">: {s.title}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="past-title" className={card}>
        <div className="flex items-center gap-3">
          <IconTile icon="history" tone="secondary" />
          <h2 id="past-title" className="text-title-large text-on-surface">
            {t('sessions.past')}
          </h2>
        </div>
        {past.length === 0 ? (
          <p className="text-body-medium text-on-surface-variant">{t('sessions.noPast')}</p>
        ) : (
          <ul className="@container flex flex-col divide-y divide-outline-variant">
            {past.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 py-3">
                <span className="flex flex-wrap items-center justify-between gap-3">
                  <span className="flex w-full min-w-0 flex-col gap-1 @md:w-auto @md:flex-1">
                    <span className="text-title-small text-on-surface">{s.title}</span>
                    <span className="text-body-small text-on-surface-variant">
                      {formatSessionTime(s.startsAt)} · {who(s)}
                    </span>
                  </span>
                  {s.recording ? (
                    <StatusPill tone="success" icon="play_circle" label={t('sessions.recorded', { count: s.recording.minutes })} />
                  ) : s.kind === 'group' ? (
                    <Button
                      variant="tonal"
                      size="xs"
                      leadingIcon="upload"
                      onClick={() => {
                        setRecording(s);
                        setSummary('');
                      }}
                    >
                      {t('sessions.addRecording')}
                    </Button>
                  ) : (
                    <StatusPill tone="neutral" icon="person" label={t('sessions.noRecording1on1')} />
                  )}
                </span>
                {recording?.id === s.id && (
                  <div className="flex flex-col gap-3 rounded-lg bg-surface-container p-3">
                    <TextArea label={t('sessions.summary')} helperText={t('sessions.summaryHelp')} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
                    <span className="flex flex-col gap-2 medium:flex-row medium:justify-end">
                      <Button variant="outlined" className="w-full medium:w-auto" onClick={() => setRecording(undefined)}>
                        {t('sessions.cancelForm')}
                      </Button>
                      <Button
                        className="w-full medium:w-auto"
                        disabled={summary.trim().length < 10}
                        onClick={() => {
                          save({ ...s, recording: { minutes: s.minutes - 2, summary: summary.trim(), chapters: [] } });
                          setRecording(undefined);
                          toast.success(t('sessions.recordingSaved'));
                        }}
                      >
                        {t('sessions.publishRecording')}
                      </Button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="new-title" className={card}>
        <div className="flex items-center gap-3">
          <IconTile icon="add" tone="primary" />
          <h2 id="new-title" className="text-title-large text-on-surface">
            {t('sessions.new')}
          </h2>
        </div>
        <ScheduleForm
          people={people}
          cohorts={myCohorts}
          initial={{ kind: 'group', cohortId: myCohorts[0]?.id, title: '', time: '14:00' }}
          onSave={(session) => {
            save(session);
            toast.success(t('sessions.scheduled'));
          }}
        />
      </section>

      <ConfirmDialog
        open={Boolean(toCancel)}
        onOpenChange={(o) => !o && setToCancel(undefined)}
        title={t('sessions.cancelTitle')}
        description={t('sessions.cancelBody', { title: toCancel?.title ?? '' })}
        confirmLabel={t('sessions.cancelConfirm')}
        onConfirm={() => {
          if (toCancel) save({ ...toCancel, status: 'canceled' });
          setToCancel(undefined);
          toast.success(t('sessions.canceled'));
        }}
      />
    </TutorShell>
  );
}

interface FormInitial {
  kind: TutorSession['kind'];
  cohortId?: string;
  personId?: string;
  moduleId?: string;
  title: string;
  time: string;
}

function ScheduleForm({
  people,
  cohorts,
  initial,
  onSave,
  onCancel,
}: {
  people: { id: string; name: string }[];
  cohorts: { id: string; name: string }[];
  initial: FormInitial;
  onSave: (session: TutorSession) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const orgId = useOrgData().organization.id;
  const [kind, setKind] = useState(initial.kind);
  const [cohortId, setCohortId] = useState(initial.cohortId ?? cohorts[0]?.id ?? '');
  const [personId, setPersonId] = useState(initial.personId ?? people[0]?.id ?? '');
  const [title, setTitle] = useState(initial.title);
  const [moduleId, setModuleId] = useState(initial.moduleId ?? '');
  const [date, setDate] = useState('2026-11-24');
  const [time, setTime] = useState(initial.time);
  const [minutes, setMinutes] = useState(kind === 'group' ? '40' : '20');
  const [tried, setTried] = useState(false);
  const pastDate = date < DEMO_TODAY;
  const errors = { title: !title.trim(), date: !date || pastDate, time: !/^\d{2}:\d{2}$/.test(time) };

  const submit = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    onSave({
      id: `session-${Date.now().toString(36)}`,
      orgId,
      tutorId: user?.personId ?? '',
      kind,
      ...(kind === 'group' ? { cohortId } : { personId }),
      title: title.trim(),
      ...(moduleId ? { moduleId } : {}),
      startsAt: `${date}T${time}`,
      minutes: Number(minutes),
      status: 'scheduled',
    });
    if (!onCancel) {
      setTitle('');
      setTried(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!initial.personId && (
        <RadioGroup
          name={`kind-${initial.kind}-${initial.personId ?? 'new'}`}
          legend={t('sessions.form.kind')}
          value={kind}
          onChange={(e) => {
            const next = e.target.value as TutorSession['kind'];
            setKind(next);
            setMinutes(next === 'group' ? '40' : '20');
          }}
          options={[
            { value: 'group', label: t('sessions.kind.group') },
            { value: 'one_on_one', label: t('sessions.kind.one_on_one') },
          ]}
          optionsClassName="grid grid-cols-2 gap-2"
        />
      )}
      {kind === 'group' ? (
        <Select label={t('sessions.form.cohort')} helperText={t('sessions.form.cohortHelp')} value={cohortId} onChange={(e) => setCohortId(e.target.value)} options={cohorts.map((c) => ({ value: c.id, label: c.name }))} />
      ) : (
        !initial.personId && (
          <Select label={t('sessions.form.person')} helperText={t('sessions.form.personHelp')} value={personId} onChange={(e) => setPersonId(e.target.value)} options={people.map((p) => ({ value: p.id, label: p.name }))} />
        )
      )}
      <TextField label={t('sessions.form.title')} helperText={t('sessions.form.titleHelp')} value={title} onChange={(e) => setTitle(e.target.value)} error={tried && errors.title ? t('sessions.form.required') : undefined} />
      <Select
        label={t('sessions.form.module')}
        helperText={t('sessions.form.moduleHelp')}
        value={moduleId}
        onChange={(e) => setModuleId(e.target.value)}
        options={[{ value: '', label: t('sessions.form.noModule') }, ...MODULES.map((m) => ({ value: m.id, label: t('learn.challenge.module', { n: m.order, title: m.title }) }))]}
      />
      <div className="grid grid-cols-1 gap-4 medium:grid-cols-3">
        <TextField type="date" label={t('sessions.form.date')} helperText={t('sessions.form.dateHelp')} value={date} min={DEMO_TODAY} onChange={(e) => setDate(e.target.value)} error={tried && errors.date ? t('sessions.form.dateError') : undefined} />
        <TextField type="time" label={t('sessions.form.time')} helperText={t('sessions.form.timeHelp')} value={time} onChange={(e) => setTime(e.target.value)} error={tried && errors.time ? t('sessions.form.required') : undefined} />
        <Select
          label={t('sessions.form.minutes')}
          helperText={t('sessions.form.minutesHelp')}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          options={['20', '30', '40', '60'].map((m) => ({ value: m, label: t('sessions.minutes', { count: Number(m) }) }))}
        />
      </div>
      {tried && Object.values(errors).some(Boolean) && (
        <InlineAlert tone="info" live="status">
          {t('sessions.form.missing')}
        </InlineAlert>
      )}
      <span className="flex flex-col gap-2 medium:flex-row medium:justify-end">
        {onCancel && (
          <Button variant="outlined" className="w-full medium:w-auto" onClick={onCancel}>
            {t('sessions.cancelForm')}
          </Button>
        )}
        <Button leadingIcon="event_available" className="w-full medium:w-auto" onClick={submit}>
          {t('sessions.form.submit')}
        </Button>
      </span>
    </div>
  );
}
