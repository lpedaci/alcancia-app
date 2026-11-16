import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import type { FuerteState } from '@/features/companion/Fuerte';
import { QuestionView } from '@/features/learning/QuestionView';
import { type Answer, feedbackFor, isAnswered, isCorrect, startingOrder } from '@/features/learning/questions';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import { cn } from '@/lib/utils';
import { readLocal, writeLocal } from '@/store/local-store';
import { useCurrentUser } from '@/store/session-store';
import { EscapeObjectView } from './EscapeObjects';
import {
  type EscapeObject,
  type EscapeRoom,
  type EscapeState,
  expectedError,
  failTry,
  formatTime,
  freeHint,
  lettersOf,
  newGame,
  nextRoom,
  openDoor,
  openHint,
  reflect,
  ROOMS,
  sealOf,
  solveRoom,
  switchOn,
  tryDoor,
  word,
} from './engine';

/**
 * Escape room "Tu primer sueldo" with Fuerte (F18, step 28, D-304), adapted from the game of the
 * workshop "Del aula al primer trabajo". A special challenge from level 4 (F22): it does not open nor
 * close any level. Everything stays in the person's browser; reflections are never shared.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const OPENS_WITH = 'level-4';

export function EscapeRoomPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, isOpen } = useLevels(personId);
  const [state, setStateRaw] = useState<EscapeState | undefined>(() => readLocal(personId).escape);
  const [mood, setMood] = useState<{ state: FuerteState; key: string }>({ state: 'greeting', key: 'hello' });
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmAgain, setConfirmAgain] = useState(false);
  const title = t('escape.title');

  const setState = (update: (s: EscapeState) => EscapeState) =>
    setStateRaw((current) => {
      if (!current) return current;
      const next = update(current);
      writeLocal(personId, (d) => ({ ...d, escape: next }));
      return next;
    });

  // The hidden clock runs only while a game is in progress (the original keeps it, shown on request)
  const playing = Boolean(state && state.current <= ROOMS.length);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setState((s) => ({ ...s, timeMs: s.timeMs + 1000 })), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const status = statuses.find((s) => s.level.id === OPENS_WITH);
  if (status && !isOpen(OPENS_WITH)) {
    return (
      <WalletShell section={title} fuerte={{ state: 'thinking', message: t('escape.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('escape.lockedTitle')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('escape.lockedBody')}</p>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }

  const start = () => {
    const next = newGame(Math.random, state?.badges ?? []);
    writeLocal(personId, (d) => ({ ...d, escape: next }));
    setStateRaw(next);
    setMood({ state: 'greeting', key: 'start' });
  };
  const resetAll = () => {
    writeLocal(personId, (d) => ({ ...d, escape: undefined }));
    setStateRaw(undefined);
    setMood({ state: 'greeting', key: 'hello' });
  };

  return (
    <WalletShell section={title} fuerte={{ state: mood.state, message: t(`escape.fuerte.${mood.key}`) }}>
      <div className="flex flex-col gap-(--space-bento-gap)">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-label-large text-primary">{t('escape.kicker')}</p>
            <h1 className="text-headline-medium text-on-surface">{title}</h1>
          </div>
          {state && (
            <div className="flex flex-wrap gap-2">

              <Button variant="text" size="xs" leadingIcon="restart_alt" onClick={() => setConfirmReset(true)}>
                {t('escape.reset')}
              </Button>
            </div>
          )}
        </header>

        {!state ? (
          <Intro onStart={start} />
        ) : (
          <>
            <Progress state={state} onToggleTime={() => setState((s) => ({ ...s, timeVisible: !s.timeVisible }))} />
            {state.current < ROOMS.length && (
              <RoomView key={ROOMS[state.current]!.id} room={ROOMS[state.current]!} index={state.current} state={state} setState={setState} setMood={setMood} />
            )}
            {state.current === ROOMS.length && <Door state={state} setState={setState} setMood={setMood} />}
            {state.current > ROOMS.length && <Exit state={state} onAgain={() => setConfirmAgain(true)} />}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t('escape.resetTitle')}
        description={t('escape.resetBody')}
        confirmLabel={t('escape.reset')}
        onConfirm={resetAll}
      />
      <ConfirmDialog
        open={confirmAgain}
        onOpenChange={setConfirmAgain}
        title={t('escape.againTitle')}
        description={t('escape.againBody')}
        confirmLabel={t('escape.again')}
        destructive={false}
        onConfirm={start}
      />
    </WalletShell>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  const facts = [
    { icon: 'door_front' as const, key: 'rooms' },
    { icon: 'schedule' as const, key: 'time' },
    { icon: 'key' as const, key: 'keys' },
  ];
  return (
    <section aria-labelledby="escape-story" className={card}>
      <h2 id="escape-story" className="text-title-large text-on-surface">
        {t('escape.storyTitle')}
      </h2>
      {(t('escape.story', { returnObjects: true }) as string[]).map((p) => (
        <p key={p} className="text-body-large text-on-surface">
          {p}
        </p>
      ))}
      <ul className="grid grid-fill-3 gap-3">
        {facts.map((f) => (
          <li key={f.key} className="flex gap-3 rounded-lg bg-surface-container p-3">
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <Icon name={f.icon} size={20} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-label-large text-on-surface">{t(`escape.facts.${f.key}.title`)}</span>
              <span className="text-body-small text-on-surface-variant">{t(`escape.facts.${f.key}.body`)}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-body-small text-on-surface-variant">{t('escape.credits')}</p>
      <Button size="m" trailingIcon="arrow_forward" className="self-end md:h-10 md:px-4 md:text-label-large" onClick={onStart}>
        {t('escape.start')}
      </Button>
    </section>
  );
}

/** The five locks with their habit, the keys, the hints used, the letters and the hidden clock. */
function Progress({ state, onToggleTime }: { state: EscapeState; onToggleTime: () => void }) {
  const { t } = useTranslation();
  const letters = lettersOf(state);
  return (
    <section aria-label={t('escape.progressLabel')} className={cn(card, '@container gap-3')}>
      <ol className="grid grid-cols-5 gap-1">
        {ROOMS.map((room, i) => {
          const done = state.solved.includes(room.id);
          const current = i === state.current;
          return (
            <li key={room.id} className="flex min-w-0 flex-col items-center gap-1 text-center">
              <span
                aria-hidden
                className={cn(
                  'flex size-9 items-center justify-center rounded-full',
                  done ? 'bg-tertiary-container text-on-tertiary-container' : current ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant',
                )}
              >
                <Icon name={done ? 'lock_open' : 'lock'} size={18} />
              </span>
              <span className="w-full truncate text-label-small text-on-surface @md:text-label-medium">{room.habit}</span>
              <span className="sr-only">{done ? t('escape.state.solved') : current ? t('escape.state.current') : t('escape.state.locked')}</span>
            </li>
          );
        })}
      </ol>
      <dl className="grid grid-cols-2 gap-2 border-t border-outline-variant pt-3 @lg:grid-cols-4">
        <Stat icon="key" label={t('escape.keys')} value={String(state.keys)} />
        <Stat icon="lightbulb" label={t('escape.hintsUsed')} value={String(state.hintsUsed)} />
        <Stat
          icon="door_front"
          label={t('escape.letters')}
          value={letters.map((l) => l ?? '·').join(' ')}
          valueLabel={t('escape.lettersValue', { count: letters.filter(Boolean).length, total: ROOMS.length })}
        />
        {/* The time is hidden by default (original game); the eye shows or hides it, right beside it */}
        <div className="flex min-w-0 items-center gap-2">
          <Icon name="schedule" size={18} className="shrink-0 text-primary" />
          <dt className="text-body-small text-on-surface-variant">{t('escape.time.label')}</dt>
          <dd className="ml-auto flex items-center gap-1 text-label-large text-on-surface tabular-nums">
            {state.timeVisible && <span>{formatTime(state.timeMs)}</span>}
            <IconButton
              icon={state.timeVisible ? 'visibility_off' : 'visibility'}
              size="xs"
              label={state.timeVisible ? t('escape.time.hide') : t('escape.time.show')}
              selected={state.timeVisible}
              onClick={onToggleTime}
              className="-my-1"
            />
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Stat({ icon, label, value, valueLabel }: { icon: 'key' | 'lightbulb' | 'door_front' | 'schedule'; label: string; value: string; valueLabel?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon name={icon} size={18} className="shrink-0 text-primary" />
      <dt className="text-body-small text-on-surface-variant">{label}</dt>
      <dd className="ml-auto text-label-large text-on-surface tabular-nums">
        <span aria-hidden={valueLabel ? true : undefined}>{value}</span>
        {valueLabel && <span className="sr-only">{valueLabel}</span>}
      </dd>
    </div>
  );
}

function ObjectButton({ object }: { object: EscapeObject }) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex min-h-14 w-full items-center gap-3 rounded-lg bg-surface-container px-3 py-2 text-left transition-colors duration-150 hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Icon name={object.icon} size={20} className="shrink-0 text-primary" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-label-large text-on-surface">
              <span className="sr-only">{t('escape.inspect')}: </span>
              {object.name}
            </span>
            <span className="text-body-small text-on-surface-variant">{object.summary}</span>
          </span>
          <Icon name="search" size={20} className="shrink-0 text-on-surface-variant" />
        </button>
      </DialogTrigger>
      <DialogContent title={object.name} description={object.summary}>
        <EscapeObjectView object={object} />
      </DialogContent>
    </Dialog>
  );
}

function initialAnswer(q: EscapeRoom['lock']): Answer | undefined {
  return q.type === 'ordering' ? startingOrder(q) : undefined;
}

function RoomView({
  room,
  index,
  state,
  setState,
  setMood,
}: {
  room: EscapeRoom;
  index: number;
  state: EscapeState;
  setState: (u: (s: EscapeState) => EscapeState) => void;
  setMood: (m: { state: FuerteState; key: string }) => void;
}) {
  const { t } = useTranslation();
  const solved = state.solved.includes(room.id);
  const switched = !room.before || state.switchedOn.includes(room.id);
  const [beforeAnswer, setBeforeAnswer] = useState<Answer | undefined>(() => (room.before ? initialAnswer(room.before) : undefined));
  const [beforeMsg, setBeforeMsg] = useState<{ ok: boolean; text: string } | undefined>();
  const [answer, setAnswer] = useState<Answer | undefined>(() => initialAnswer(room.lock));
  const [msg, setMsg] = useState<string | undefined>();
  const [reflection, setReflection] = useState(state.reflections[room.id] ?? '');
  const [saved, setSaved] = useState<string | undefined>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hintsOpen = state.hintsOpen[room.id] ?? 0;
  const free = freeHint(state, room.id);

  const checkBefore = () => {
    if (!room.before) return;
    const ok = isCorrect(room.before, beforeAnswer);
    setBeforeMsg({ ok, text: feedbackFor(room.before, beforeAnswer) });
    if (ok) setState((s) => switchOn(s, room.id));
  };

  const tryLock = () => {
    if (isCorrect(room.lock, answer)) {
      setMsg(undefined);
      setState((s) => solveRoom(s, room.id));
      setMood({ state: 'celebration', key: 'solved' });
      return;
    }
    const expected = room.lock.type === 'numeric' && typeof answer === 'string' ? expectedError(room, answer) : undefined;
    setMsg(expected ?? feedbackFor(room.lock, answer));
    setState((s) => failTry(s, room.id));
    setMood({ state: 'thinking', key: 'almost' });
    // A case with decisions starts again from the first message
    if (room.lock.type === 'branching') setAnswer([]);
  };

  const hint = () => {
    setState((s) => openHint(s, room));
    setMood({ state: 'neutral', key: 'hint' });
  };

  const saveReflection = () => {
    setSaved(reflection.trim() && !state.reflections[room.id] ? t('escape.reflectionKey') : t('escape.reflectionSaved'));
    setState((s) => reflect(s, room.id, reflection));
  };

  const next = () => {
    setState(nextRoom);
    setMood({ state: 'greeting', key: index + 1 < ROOMS.length ? 'next' : 'door' });
  };

  return (
    <section aria-labelledby={`${room.id}-title`} className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
      <div className={card}>
        <p className="flex items-center gap-2 text-label-large text-primary">
          <Icon name={room.icon} size={18} />
          {t('escape.roomOf', { n: index + 1, total: ROOMS.length, place: room.place })}
        </p>
        <h2 id={`${room.id}-title`} ref={headingRef} tabIndex={-1} className="text-title-large text-on-surface outline-none">
          {room.title}
        </h2>
        <p className="text-body-large text-on-surface">{room.scene}</p>
        <h3 className="text-title-small text-on-surface">{t('escape.inspectTitle')}</h3>
        <ul className="flex flex-col gap-2">
          {room.objects.map((o) => (
            <li key={o.id}>
              <ObjectButton object={o} />
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 text-body-small text-on-surface-variant">
          <Icon name="lock" size={16} />
          {t('escape.habit', { habit: room.habit })}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
        {room.before && !solved && (
          <div className={card}>
            <QuestionView question={room.before} value={beforeAnswer} onChange={setBeforeAnswer} disabled={switched} idPrefix="esc-before" />
            {!switched && (
              <Button className="self-end" disabled={!isAnswered(room.before, beforeAnswer)} onClick={checkBefore}>
                {t('escape.check')}
              </Button>
            )}
            <div aria-live="polite">{beforeMsg && <InlineAlert tone={beforeMsg.ok ? 'success' : 'info'}>{beforeMsg.text}</InlineAlert>}</div>
          </div>
        )}

        {!solved ? (
          <div className={cn(card, !switched && 'opacity-60')}>
            {!switched && <InlineAlert tone="info">{t('escape.lockOff')}</InlineAlert>}
            <QuestionView question={room.lock} value={answer} onChange={setAnswer} disabled={!switched} idPrefix="esc-lock" />
            {switched && (
              <Button className="self-end" leadingIcon="key" disabled={!isAnswered(room.lock, answer)} onClick={tryLock}>
                {t('escape.try')}
              </Button>
            )}
            <div aria-live="polite">{msg && <InlineAlert tone="info">{msg}</InlineAlert>}</div>

            {/* Hints for keys (the economy of the original) */}
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-3">
              <h3 className="text-title-small text-on-surface">{t('escape.hints')}</h3>
              {room.hints.slice(0, hintsOpen).map((h, i) => (
                <p key={h} className="flex gap-2 rounded-md bg-warning-container px-3 py-2 text-body-medium text-on-warning-container">
                  <Icon name="lightbulb" size={18} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="sr-only">{t('escape.hintN', { n: i + 1 })}: </span>
                    {h}
                  </span>
                </p>
              ))}
              {hintsOpen < room.hints.length && (
                <Button
                  variant="tonal"
                  size="xs"
                  leadingIcon="lightbulb"
                  className="self-start"
                  disabledReason={!free && state.keys < 1 ? t('escape.noKeys') : undefined}
                  onClick={hint}
                >
                  {free ? t('escape.hintFree') : t('escape.hintCost')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={card}>
            <InlineAlert tone="success">{t('escape.opened', { letter: word(state).word[index] })}</InlineAlert>
            <h3 className="text-title-medium text-on-surface">{t('escape.debriefTitle')}</h3>
            {room.debrief.map((p) => (
              <p key={p} className="text-body-medium text-on-surface">
                {p}
              </p>
            ))}
            <ListLinkRow to={`/app/learn/guides/${room.guide}`} icon="menu_book" title={t('escape.toGuide')} detail={t('escape.toGuideDetail')} />
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-3">
              <TextArea label={room.reflection} helperText={t('escape.reflectionHelp')} optional value={reflection} onChange={(e) => setReflection(e.target.value)} />
              <Button variant="outlined" size="xs" className="self-end" onClick={saveReflection}>
                {t('escape.reflectionSave')}
              </Button>
              <div aria-live="polite">{saved && <p className="text-body-small text-on-surface-variant">{saved}</p>}</div>
            </div>
            <Button className="self-end" trailingIcon="arrow_forward" onClick={next}>
              {index + 1 < ROOMS.length ? t('escape.nextRoom') : t('escape.toDoor')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function Door({ state, setState, setMood }: { state: EscapeState; setState: (u: (s: EscapeState) => EscapeState) => void; setMood: (m: { state: FuerteState; key: string }) => void }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<string | undefined>();
  const w = word(state);
  const letters = lettersOf(state).filter(Boolean) as string[];
  const tryIt = () => {
    const result = tryDoor(state, text);
    if (result === 'open') {
      setState(openDoor);
      setMood({ state: 'celebration', key: 'out' });
      return;
    }
    setMsg(t(`escape.door.${result}`));
    setMood({ state: 'thinking', key: 'almost' });
  };
  return (
    <section aria-labelledby="door-title" className={cn(card, 'max-w-2xl')}>
      <p className="flex items-center gap-2 text-label-large text-primary">
        <Icon name="door_front" size={18} />
        {t('escape.door.kicker')}
      </p>
      <h2 id="door-title" className="text-title-large text-on-surface">
        {t('escape.door.title')}
      </h2>
      <p className="text-body-large text-on-surface">{w.question}</p>
      <ul aria-label={t('escape.letters')} className="flex flex-wrap gap-2">
        {letters.map((l, i) => (
          <li key={`${l}-${i}`} className="flex size-11 items-center justify-center rounded-lg bg-tertiary-container text-title-large text-on-tertiary-container">
            {l}
          </li>
        ))}
      </ul>
      <TextField label={t('escape.door.label')} helperText={t('escape.door.help', { n: w.word.length })} value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
      <Button className="self-end" leadingIcon="door_open" disabled={!text.trim()} onClick={tryIt}>
        {t('escape.door.open')}
      </Button>
      <div aria-live="polite">{msg && <InlineAlert tone="info">{msg}</InlineAlert>}</div>
    </section>
  );
}

function Exit({ state, onAgain }: { state: EscapeState; onAgain: () => void }) {
  const { t } = useTranslation();
  const seal = sealOf(state.hintsUsed);
  return (
    <section aria-labelledby="exit-title" className={card}>
      <h2 id="exit-title" className="text-headline-small text-on-surface">
        {t('escape.exit.title')}
      </h2>
      <p className="text-body-large text-on-surface">{t('escape.exit.body')}</p>
      <dl className="grid grid-fill-3 gap-3">
        <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
          <dt className="text-body-small text-on-surface-variant">{t('escape.exit.seal')}</dt>
          <dd className="text-title-medium text-on-surface">{t(`escape.seals.${seal}`)}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
          <dt className="text-body-small text-on-surface-variant">{t('escape.hintsUsed')}</dt>
          <dd className="text-title-medium text-on-surface tabular-nums">{state.hintsUsed}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
          <dt className="text-body-small text-on-surface-variant">{t('escape.time.label')}</dt>
          <dd className="text-title-medium text-on-surface tabular-nums">{formatTime(state.timeMs)}</dd>
        </div>
      </dl>
      {/* Badges: bronze for the five rooms in their initial version (the other two versions come next) */}
      <div className="flex items-center gap-3 rounded-lg bg-tertiary-container p-4 text-on-tertiary-container">
        <Icon name="workspace_premium" size={24} className="shrink-0" />
        <span className="flex flex-col">
          <span className="text-title-small">{t('escape.badges.bronze')}</span>
          <span className="text-body-small">{t('escape.badges.bronzeBody')}</span>
        </span>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outlined" leadingIcon="restart_alt" onClick={onAgain}>
          {t('escape.again')}
        </Button>
      </div>
      <ListLinkRow to="/app/learn" icon="school" title={t('escape.backToLearn')} detail={t('escape.backToLearnDetail')} />
    </section>
  );
}
