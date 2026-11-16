import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { QuestionView } from '@/features/learning/QuestionView';
import { type Answer, feedbackFor, isAnswered, isCorrect, startingOrder } from '@/features/learning/questions';
import { cn } from '@/lib/utils';
import { EscapeObjectView } from './EscapeObjects';
import { BadgeStrip, VersionPicker } from './EscapeVersions';
import { type Badge, BADGES, type EscapeRoom, expectedError, ROOMS, roomsOf, type Version, VERSIONS } from './engine';

/**
 * Simple mode of the escape room (D-312), as in the original (`?modo=simple`): the same rooms of the
 * chosen version as a linear questionnaire, with everything visible on one page. No keys, no letters,
 * no door and no clock; hints are free. It is the accessible alternative to the game layer, so it
 * gives the same badge when the five locks are open.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

type Q = EscapeRoom['lock'];
const initial = (q: Q): Answer | undefined => (q.type === 'ordering' ? startingOrder(q) : undefined);

export function SimpleMode({
  version,
  onVersion,
  badges,
  onBadge,
  onBackToGame,
}: {
  version: Version;
  onVersion: (v: Version) => void;
  badges: Badge[];
  onBadge: (badge: Badge) => void;
  onBackToGame: () => void;
}) {
  const { t } = useTranslation();
  const rooms = roomsOf(version);
  const [opened, setOpened] = useState<string[]>([]);
  const badge = BADGES[version]!;
  const done = opened.length === ROOMS.length;

  const open = (roomId: string) => setOpened((list) => (list.includes(roomId) ? list : [...list, roomId]));
  // The five locks open: the badge of the version, once
  useEffect(() => {
    if (done) onBadge(badge);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, badge]);

  return (
    <div className="flex flex-col gap-(--space-bento-gap)">
      <section aria-labelledby="simple-title" className={cn(card, 'gap-(--space-section)')}>
        <div className="flex flex-col gap-2">
          <h2 id="simple-title" className="text-title-large text-on-surface">
            {t('escape.simple.title')}
          </h2>
          <p className="text-body-large text-on-surface">{t('escape.simple.body')}</p>
          <Button variant="text" leadingIcon="arrow_back" className="self-start" onClick={onBackToGame}>
            {t('escape.simple.backToGame')}
          </Button>
        </div>
        <VersionPicker
          value={version}
          onChange={(v) => {
            setOpened([]);
            onVersion(v);
          }}
          badges={badges}
        />
        <p aria-live="polite" className="text-label-large text-on-surface">
          {t('escape.simple.progress', { n: opened.length, total: ROOMS.length })}
        </p>
      </section>

      {rooms.map((room, i) => (
        <SimpleRoom key={`${version}-${room.id}`} room={room} index={i} opened={opened.includes(room.id)} onOpen={() => open(room.id)} />
      ))}

      <section aria-labelledby="simple-end" className={card}>
        <h2 id="simple-end" className="text-title-large text-on-surface">
          {t('escape.simple.endTitle')}
        </h2>
        <div aria-live="polite">
          {done ? (
            <InlineAlert tone="success" title={t('escape.badges.new', { badge: t(`escape.badges.short.${badge}`) })}>
              {t('escape.badges.earnedBody', { version: t(`escape.versions.${VERSIONS[version]}.title`).toLowerCase() })}
            </InlineAlert>
          ) : (
            <p className="text-body-medium text-on-surface-variant">{t('escape.simple.endPending', { n: ROOMS.length - opened.length })}</p>
          )}
        </div>
        {done && <BadgeStrip badges={badges} highlight={badge} />}
        <ListLinkRow to="/app/learn" icon="school" title={t('escape.backToLearn')} detail={t('escape.backToLearnDetail')} />
      </section>
    </div>
  );
}

function SimpleRoom({ room, index, opened, onOpen }: { room: EscapeRoom; index: number; opened: boolean; onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby={`simple-${room.id}`} className={cn(card, 'gap-(--space-section)')}>
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-label-large text-primary">
          <Icon name={room.icon} size={18} />
          {t('escape.roomOf', { n: index + 1, total: ROOMS.length, place: room.place })}
        </p>
        <h2 id={`simple-${room.id}`} className="text-title-large text-on-surface">
          {room.title}
          {opened && <span className="sr-only"> ({t('escape.state.solved')})</span>}
        </h2>
        <p className="text-body-large text-on-surface">{room.scene}</p>
      </div>
      {/* The objects, all visible: no dialogs in simple mode */}
      <div className="@container flex flex-col gap-3">
        <h3 className="text-title-medium text-on-surface">{t('escape.simple.objects')}</h3>
        <ul className="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
          {room.objects.map((o) => (
            <li key={o.id} className="flex min-w-0 flex-col gap-2">
              <span className="text-label-large text-on-surface">{o.name}</span>
              <EscapeObjectView object={o} />
            </li>
          ))}
        </ul>
      </div>
      {room.before && <SimpleQuestion room={room} question={room.before} prefix={`simple-before-${room.id}`} />}
      <SimpleQuestion room={room} question={room.lock} prefix={`simple-lock-${room.id}`} onCorrect={onOpen} lock />
      {opened && (
        <div className="flex flex-col gap-2">
          <h3 className="text-title-medium text-on-surface">{t('escape.debriefTitle')}</h3>
          {room.debrief.map((p) => (
            <p key={p} className="text-body-medium text-on-surface">
              {p}
            </p>
          ))}
          <ListLinkRow to={`/app/learn/guides/${room.guide}`} icon="menu_book" title={t('escape.toGuide')} detail={t('escape.toGuideDetail')} />
        </div>
      )}
    </section>
  );
}

function SimpleQuestion({ room, question, prefix, onCorrect, lock = false }: { room: EscapeRoom; question: Q; prefix: string; onCorrect?: () => void; lock?: boolean }) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState<Answer | undefined>(() => initial(question));
  const [result, setResult] = useState<{ ok: boolean; text: string } | undefined>();

  const check = () => {
    const ok = isCorrect(question, answer);
    const expected = !ok && lock && question.type === 'numeric' && typeof answer === 'string' ? expectedError(room, answer) : undefined;
    setResult({ ok, text: expected ?? feedbackFor(question, answer) });
    if (ok) onCorrect?.();
    else if (question.type === 'branching') setAnswer([]);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-outline-variant pt-4">
      <QuestionView question={question} value={answer} onChange={setAnswer} disabled={result?.ok} idPrefix={prefix} />
      {!result?.ok && (
        <Button className="w-full medium:w-auto medium:self-end" leadingIcon="check" disabled={!isAnswered(question, answer)} onClick={check}>
          {t('escape.check')}
        </Button>
      )}
      <div aria-live="polite">{result && <InlineAlert tone={result.ok ? 'success' : 'info'}>{result.text}</InlineAlert>}</div>
      {lock && !result?.ok && (
        <details className="rounded-md bg-surface-container px-3 py-2">
          <summary className="cursor-pointer text-label-large text-on-surface">{t('escape.simple.hints')}</summary>
          <ul className="flex flex-col gap-1 pt-2">
            {room.hints.map((h) => (
              <li key={h} className="flex gap-2 text-body-medium text-on-surface">
                <Icon name="lightbulb" size={18} className="mt-0.5 shrink-0 text-on-surface-variant" />
                {h}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
