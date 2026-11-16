import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/toast-store';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { formatSessionTime, isPast, sessionIcs, sessionsFor, splitByTime } from '@/lib/sessions';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { SessionRequest } from '@/types/domain';
import { guideOfModule, MODULES } from './questions';

/**
 * Sessions with the tutor for the participant (F13, D-319): the upcoming ones of her cohorts and her
 * own 1:1s, with a calendar file to add them; the past group sessions with their simulated recording;
 * and a request for a 1:1 with a module and a short note (never amounts). Not in the product context,
 * which has no tutor (5.5).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SessionsCard({ personId }: { personId: string }) {
  const { t } = useTranslation();
  const person = useDataStore((s) => s.people.find((p) => p.id === personId));
  const allSessions = useDataStore((s) => s.tutorSessions);
  const allRequests = useDataStore((s) => s.sessionRequests);
  const cohorts = useDataStore((s) => s.cohorts);
  const people = useDataStore((s) => s.people);
  const [asking, setAsking] = useState(false);
  if (!person) return null;
  const { upcoming, past } = splitByTime(sessionsFor(allSessions ?? [], person));
  const recorded = past.filter((s) => s.recording);
  const requests = (allRequests ?? []).filter((r) => r.personId === personId && r.status !== 'scheduled');
  const tutorId = cohorts.find((c) => person.cohortIds.includes(c.id))?.tutorId;
  const tutorName = people.find((p) => p.id === tutorId)?.name ?? '';

  return (
    <section aria-labelledby="sessions-title" className={card}>
      <div className="flex items-center gap-3">
        <IconTile icon="event" tone="primary" />
        <div className="flex flex-col">
          <h2 id="sessions-title" className="text-title-large text-on-surface">
            {t('sessions.learn.title')}
          </h2>
          {tutorName && <p className="text-body-small text-on-surface-variant">{t('sessions.learn.with', { name: tutorName })}</p>}
        </div>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('sessions.learn.none')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {upcoming.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 rounded-lg bg-surface-container p-3">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-title-small text-on-surface">{s.title}</span>
                <StatusPill tone={s.kind === 'group' ? 'primary' : 'neutral'} icon={s.kind === 'group' ? 'groups' : 'person'} label={t(`sessions.kind.${s.kind}`)} />
              </span>
              <span className="text-body-small text-on-surface-variant">
                {formatSessionTime(s.startsAt)} · {t('sessions.minutes', { count: s.minutes })}
              </span>
              <Button
                variant="text"
                size="xs"
                leadingIcon="event_available"
                className="-ml-2 self-start"
                onClick={() => download(s.id, sessionIcs(s, t('sessions.learn.icsNote')))}
              >
                {t('sessions.learn.calendar')}
                <span className="sr-only">: {s.title}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
      {recorded.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-title-small text-on-surface">{t('sessions.learn.recordings')}</h3>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {recorded.map((s) => (
              <li key={s.id}>
                <ListLinkRow to={`/app/learn/sessions/${s.id}`} icon="play_circle" title={s.title} detail={t('sessions.learn.recordingDetail', { minutes: s.recording!.minutes })} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {requests.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label={t('sessions.learn.myRequests')}>
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant px-3 py-2">
              <span className="text-body-medium text-on-surface">{t('sessions.learn.requestOf', { topic: MODULES.find((m) => m.id === r.moduleId)?.title ?? '' })}</span>
              <StatusPill tone={r.status === 'pending' ? 'info' : 'neutral'} icon={r.status === 'pending' ? 'schedule' : 'remove'} label={t(`sessions.learn.requestStatus.${r.status}`)} />
            </li>
          ))}
        </ul>
      )}
      {asking ? (
        <RequestForm personId={personId} tutorId={tutorId ?? ''} onDone={() => setAsking(false)} />
      ) : (
        <Button variant="tonal" leadingIcon="person" className="w-full medium:w-auto medium:self-start" onClick={() => setAsking(true)}>
          {t('sessions.learn.ask')}
        </Button>
      )}
    </section>
  );
}

function RequestForm({ personId, tutorId, onDone }: { personId: string; tutorId: string; onDone: () => void }) {
  const { t } = useTranslation();
  const save = useDataStore((s) => s.saveSessionRequest);
  const [moduleId, setModuleId] = useState('');
  const [preferred, setPreferred] = useState<SessionRequest['preferred']>('morning');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const submit = () => {
    setTried(true);
    if (!moduleId || note.trim().length < 10) return;
    save({ id: `request-${Date.now().toString(36)}`, personId, tutorId, moduleId, preferred, note: note.trim(), requestedAt: DEMO_TODAY, status: 'pending' });
    toast.success(t('sessions.learn.sent'));
    onDone();
  };
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-outline-variant p-3 sm:p-4">
      <h3 className="text-title-small text-on-surface">{t('sessions.learn.ask')}</h3>
      <Select
        label={t('sessions.learn.topic')}
        helperText={t('sessions.learn.topicHelp')}
        value={moduleId}
        onChange={(e) => setModuleId(e.target.value)}
        error={tried && !moduleId ? t('sessions.form.required') : undefined}
        options={[{ value: '', label: t('authoring.choose') }, ...MODULES.map((m) => ({ value: m.id, label: t('learn.challenge.module', { n: m.order, title: m.title }) }))]}
      />
      <RadioGroup
        name="preferred"
        legend={t('sessions.learn.when')}
        value={preferred}
        onChange={(e) => setPreferred(e.target.value as SessionRequest['preferred'])}
        options={[
          { value: 'morning', label: t('sessions.learn.morning') },
          { value: 'afternoon', label: t('sessions.learn.afternoon') },
        ]}
        optionsClassName="grid grid-cols-2 gap-2"
      />
      <TextArea
        label={t('sessions.learn.note')}
        helperText={t('sessions.learn.noteHelp')}
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        error={tried && note.trim().length < 10 ? t('sessions.learn.noteError') : undefined}
      />
      <span className="flex flex-col gap-2 medium:flex-row medium:justify-end">
        <Button variant="outlined" className="w-full medium:w-auto" onClick={onDone}>
          {t('sessions.cancelForm')}
        </Button>
        <Button leadingIcon="send" className="w-full medium:w-auto" onClick={submit}>
          {t('sessions.learn.send')}
        </Button>
      </span>
    </div>
  );
}

/** The simulated recording of a past group session (D-319): summary, chapters and the related guide. */
export function SessionRecordingPage() {
  const { sessionId = '' } = useParams();
  const { t } = useTranslation();
  const user = useCurrentUser();
  const person = useDataStore((s) => s.people.find((p) => p.id === user?.personId));
  const session = useDataStore((s) => (s.tutorSessions ?? []).find((x) => x.id === sessionId));
  const visible = session && person && session.recording && isPast(session) && sessionsFor([session], person).length === 1;
  if (!session || !visible || !session.recording) return <NotFoundPage />;
  const guide = session.moduleId ? guideOfModule(session.moduleId) : undefined;
  return (
    <WalletShell section={t('sessions.learn.recordingTitle')} fuerte={{ state: 'neutral', message: t('sessions.learn.fuerte') }}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-(--space-section)">
        <header className="flex flex-col gap-2">
          <Link to="/app/learn" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
            <Icon name="arrow_back" size={18} />
            {t('escape.backToLearn')}
          </Link>
          <p className="text-label-large text-primary">{t('sessions.learn.recordingKicker', { date: formatSessionTime(session.startsAt) })}</p>
          <h1 className="text-headline-medium text-on-surface">{session.title}</h1>
        </header>
        {/* A simulated player: no video in the prototype; it says what would be here */}
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-inverse-surface p-6 text-center text-inverse-on-surface">
          <Icon name="play_circle" size={24} />
          <p className="text-title-medium">{t('sessions.learn.player', { minutes: session.recording.minutes })}</p>
          <p className="max-w-prose text-body-small">{t('sessions.learn.playerNote')}</p>
        </div>
        <section aria-labelledby="summary-title" className={card}>
          <h2 id="summary-title" className="text-title-large text-on-surface">
            {t('sessions.learn.summaryTitle')}
          </h2>
          <p className="text-body-large text-on-surface">{session.recording.summary}</p>
          {session.recording.chapters.length > 0 && (
            <>
              <h3 className="text-title-small text-on-surface">{t('sessions.learn.chapters')}</h3>
              <ol className="flex flex-col gap-2">
                {session.recording.chapters.map((c, i) => (
                  <li key={c} className="flex items-start gap-3">
                    <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-large text-on-primary-container tabular-nums">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-body-large text-on-surface">{c}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
          <InlineAlert tone="info" live="none">
            {t('sessions.learn.privacy')}
          </InlineAlert>
        </section>
        {guide && <ListLinkRow to={`/app/learn/guides/${guide.id}`} icon="menu_book" title={t('sessions.learn.guide')} detail={guide.title} />}
      </div>
    </WalletShell>
  );
}
