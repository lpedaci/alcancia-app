import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { StatusPill } from '@/components/ui/StatusPill';
import { ConditionChip } from '@/features/levels/UnlockCard';
import { completedLights, type LevelStatus } from '@/features/levels/engine';
import { MISSIONS, useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import { NBSP } from '@/lib/money';
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { challengeById, guideOfModule, MODULES, moduleById } from './questions';
import { MyQuestions, WeeklyChallenges } from './Tutoring';
import { fuerteLine } from '@/features/companion/fuerte-lines';

/**
 * P9, Aprender (5.0, 2.2.1 pattern 8): the map of levels as a timeline, one stretch per level with
 * its state (icon and text, never only color), the current level highlighted, what each level
 * holds (guides, challenge, missions, tools) and, when locked, what is missing and "Ya sé esto".
 * Then the achievements: module badges and missions completed (gamification with measure, 5.0).
 */
const STATE_ICON: Record<LevelStatus['status'], IconName> = { completed: 'check_circle', unlocked: 'pending', locked: 'lock' };
const STATE_TONE = { completed: 'success', unlocked: 'primary', locked: 'neutral' } as const;
const pct = (n: number) => `${Math.round(n * 100)}${NBSP}%`;

export function LearnPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, current, wallet } = useLevels(personId);
  // Select whole arrays (stable references) and filter here, so the store snapshot never changes on read.
  const allGuides = useDataStore((s) => s.guideProgress);
  const allAttempts = useDataStore((s) => s.challengeAttempts);
  const allMissions = useDataStore((s) => s.missionCompletions);
  const guideProgress = allGuides.filter((g) => g.personId === personId);
  const attempts = allAttempts.filter((a) => a.personId === personId);
  const missionCompletions = allMissions.filter((m) => m.personId === personId);
  const passing = useDataStore((s) => s.program.passingScore);
  const reduce = useShouldReduceMotion();
  const [open, setOpen] = useState<Set<string>>(() => new Set(current ? [current.level.id] : []));

  const guideDone = (guideId: string) => guideProgress.some((g) => g.guideIdsDone.includes(guideId));
  const bestOf = (challengeId: string) => attempts.filter((a) => a.challengeId === challengeId).reduce<number | undefined>((m, a) => Math.max(m ?? 0, a.score), undefined);
  const missionDone = (id: string) => wallet.completedMissionIds.includes(id) || missionCompletions.some((m) => m.missionId === id);

  // Module badges (D-57): the module's part of the best passed attempt of its level challenge.
  const badges = new Set<string>();
  for (const a of attempts) for (const [moduleId, score] of Object.entries(a.moduleScores)) if (a.score >= passing && score >= passing) badges.add(moduleId);
  const missionsDone = MISSIONS.filter((m) => missionDone(m.id)).length;
  const lights = completedLights(statuses);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'neutral', message: fuerteLine('learn.map.fuerte') }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-medium text-on-surface">{t('learn.map.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('learn.map.intro')}</p>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] large:items-start">
          {/* Timeline of levels */}
          <section aria-labelledby="map-title" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:p-(--space-card-padding)">
            <h2 id="map-title" className="text-title-large text-on-surface">
              {t('learn.map.levels')}
            </h2>
            <ol className="flex flex-col">
              {statuses.map((s, i) => {
                const isCurrent = current?.level.id === s.level.id;
                const expanded = open.has(s.level.id);
                const phaseB = s.level.phase === 'B';
                const last = i === statuses.length - 1;
                const name = t(`wallet.sections.${s.level.id}`, { defaultValue: t('learn.map.crypto') });
                return (
                  <motion.li
                    key={s.level.id}
                    className="relative flex gap-2 pb-6 sm:gap-4"
                    // Lists enter staggered, 50 ms apart (2.6); with reduced motion, opacity only
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: duration.long, ease: easing.emphasizedDecelerate, delay: i * 0.05 }}
                  >
                    {/* The line of the timeline, decorative */}
                    {!last && <span aria-hidden className="absolute top-8 bottom-0 left-4 w-0.5 -translate-x-1/2 bg-outline-variant sm:top-10 sm:left-5" />}
                    <span
                      aria-hidden
                      className={cn(
                        'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full sm:size-10',
                        s.status === 'completed' && 'bg-success-container text-success',
                        s.status === 'unlocked' && 'bg-primary text-on-primary',
                        s.status === 'locked' && 'bg-surface-container text-on-surface-variant',
                      )}
                    >
                      <Icon name={STATE_ICON[s.status]} size={20} filled={s.status === 'completed'} />
                    </span>
                    <div className={cn('flex min-w-0 flex-1 flex-col gap-4 rounded-lg p-3 sm:p-4', isCurrent ? 'border border-primary bg-primary-container/40' : 'border border-transparent')}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-title-medium text-on-surface">{t('learn.map.levelName', { n: s.level.order, name })}</h3>
                        {phaseB ? (
                          <StatusPill tone="neutral" icon="schedule" label={t('learn.map.phaseB')} />
                        ) : (
                          <StatusPill tone={STATE_TONE[s.status]} icon={STATE_ICON[s.status]} label={isCurrent ? t('learn.map.current') : t(`learn.map.state.${s.status}`)} />
                        )}
                        {!phaseB && (
                          <Button variant="text" size="xs" className="ml-auto" trailingIcon={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} aria-expanded={expanded} onClick={() => toggle(s.level.id)}>
                            {expanded ? t('learn.map.hide') : t('learn.map.show')}
                          </Button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {expanded && !phaseB && (
                          <motion.div
                            key="detail"
                            initial={{ opacity: 0, height: reduce ? 'auto' : 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: reduce ? 'auto' : 0 }}
                            transition={{ duration: duration.medium, ease: easing.standard }}
                            className="overflow-hidden"
                          >
                            <LevelDetail status={s} guideDone={guideDone} bestOf={bestOf} missionDone={missionDone} passing={passing} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </section>

          <div className="flex min-w-0 flex-col gap-6">
          <WeeklyChallenges personId={personId} />
          <MyQuestions personId={personId} />
          {/* Achievements */}
          <section aria-labelledby="badges-title" className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <h2 id="badges-title" className="text-title-large text-on-surface">
              {t('learn.map.achievements')}
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ['military_tech', t('learn.map.badgesCount'), `${badges.size}`],
                ['flag', t('learn.map.missionsCount'), `${missionsDone}`],
                ['lightbulb', t('learn.map.lights'), t('learn.map.lightsValue', { n: lights })],
              ].map(([icon, label, value]) => (
                <div key={label} className="flex flex-col gap-1 rounded-lg bg-surface-container p-3 last:col-span-2">
                  <dt className="flex items-center gap-1.5 text-label-medium text-on-surface-variant">
                    <Icon name={icon as IconName} size={16} className="text-tertiary" />
                    {label}
                  </dt>
                  <dd className="text-title-large text-on-surface tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <ul className="flex flex-col gap-2" aria-label={t('learn.map.badges')}>
              {MODULES.filter((m) => m.phase === 'A' && guideOfModule(m.id)).map((m) => {
                const earned = badges.has(m.id);
                return (
                  <li key={m.id} className={cn('flex items-center gap-3 rounded-lg px-3 py-2', earned ? 'bg-tertiary-container text-on-tertiary-container' : 'border border-dashed border-outline-variant text-on-surface-variant')}>
                    <Icon name="military_tech" size={20} filled={earned} />
                    <span className="min-w-0 flex-1 text-body-medium">{t('learn.challenge.module', { n: m.order, title: m.title })}</span>
                    <span className="text-label-medium">{earned ? t('learn.map.earned') : t('learn.map.notEarned')}</span>
                  </li>
                );
              })}
            </ul>
            <p className="-mt-3 text-body-small text-on-surface-variant">{t('learn.map.badgesNote')}</p>
            <div className="flex flex-col gap-3 border-t border-outline-variant pt-5">
              <Link to="/app/welcome" className="inline-flex items-center gap-2 text-label-large text-primary hover:underline">
                <Icon name="person" size={18} />
                {t('learn.map.conocerte')}
              </Link>
              <Link to="/app/learn/investor-profile" className="inline-flex items-center gap-2 text-label-large text-primary hover:underline">
                <Icon name="psychology" size={18} />
                {t('learn.map.profile')}
              </Link>
              <Link to="/app/tools/SIM-3" className="inline-flex items-center gap-2 text-label-large text-primary hover:underline">
                <Icon name="calculate" size={18} />
                {t('learn.map.tools')}
              </Link>
            </div>
          </section>
          </div>
        </div>
      </div>
    </WalletShell>
  );
}

function LevelDetail({
  status,
  guideDone,
  bestOf,
  missionDone,
  passing,
}: {
  status: LevelStatus;
  guideDone: (id: string) => boolean;
  bestOf: (id: string) => number | undefined;
  missionDone: (id: string) => boolean;
  passing: number;
}) {
  const { t } = useTranslation();
  const level = status.level;
  const locked = status.status === 'locked';
  const missions = MISSIONS.filter((m) => m.levelId === level.id);
  const challenge = level.challengeId ? challengeById(level.challengeId) : undefined;
  const best = level.challengeId ? bestOf(level.challengeId) : undefined;
  const row = 'flex items-center gap-2 rounded-lg px-1 py-2 hover:bg-surface-container sm:gap-3 sm:px-3';

  return (
    <div className="flex flex-col divide-y divide-outline-variant border-t border-outline-variant [&>*]:py-4 [&>*:last-child]:pb-0">
      {locked && (
        <div className="flex flex-col gap-2">
          <p className="pb-1 text-title-small text-on-surface">{t('wallet.unlock.missing')}</p>
          <ul className="flex flex-wrap gap-2">
            {status.conditions
              .filter((c) => c.condition.type !== 'first_sign_in')
              .map((c, i) => (
                <li key={i}>
                  <ConditionChip status={c} />
                </li>
              ))}
          </ul>
          {level.masteryChallengeId && challengeById(level.masteryChallengeId) && (
            <Button asChild variant="tonal" size="xs" className="self-start" leadingIcon="bolt">
              <Link to={`/app/learn/challenges/${level.masteryChallengeId}`}>{t('learn.map.mastery')}</Link>
            </Button>
          )}
        </div>
      )}

      {level.id === 'level-0' && (
        <Link to="/app/welcome" className={row}>
          <Icon name="person" size={20} className="text-primary" />
          <span className="flex-1 text-body-medium text-on-surface">{t('learn.map.openAccount')}</span>
          <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
        </Link>
      )}

      {level.guideModuleIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="pb-1 text-title-small text-on-surface">{t('learn.map.guides')}</p>
          {level.guideModuleIds.map((moduleId) => {
            const guide = guideOfModule(moduleId);
            const module = moduleById(moduleId);
            if (!guide)
              return (
                <p key={moduleId} className="flex items-center gap-2 px-1 py-2 text-body-medium text-on-surface-variant sm:gap-3 sm:px-3">
                  <Icon name="schedule" size={20} />
                  {t('learn.map.guideSoon', { n: module?.order, title: module?.title })}
                </p>
              );
            const done = guideDone(guide.id);
            const content = (
              <>
                <Icon name={done ? 'check_circle' : 'menu_book'} size={20} filled={done} className={done ? 'text-success' : 'text-primary'} />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-medium text-on-surface">{guide.title}</span>
                  <span className="block text-body-small text-on-surface-variant">
                    {t('learn.map.guideMeta', { n: module?.order, minutes: guide.minutes })}
                    {done && ` · ${t('learn.map.read')}`}
                  </span>
                </span>
              </>
            );
            return locked ? (
              <p key={moduleId} className="flex items-center gap-2 px-1 py-2 opacity-80 sm:gap-3 sm:px-3">
                {content}
              </p>
            ) : (
              <Link key={moduleId} to={`/app/learn/guides/${guide.id}`} className={row}>
                {content}
                <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
              </Link>
            );
          })}
        </div>
      )}

      {level.challengeId && (
        <div className="flex flex-col gap-1.5">
          <p className="pb-1 text-title-small text-on-surface">{t('learn.map.challenge')}</p>
          {challenge && !locked ? (
            <Link to={`/app/learn/challenges/${level.challengeId}`} className={row}>
              <Icon name="quiz" size={20} className={best !== undefined && best >= passing ? 'text-success' : 'text-primary'} />
              <span className="flex-1 text-body-medium text-on-surface">
                {best === undefined ? t('learn.map.challengePending') : best >= passing ? t('learn.map.challengePassed', { score: pct(best) }) : t('learn.map.challengeBest', { score: pct(best) })}
              </span>
              <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
            </Link>
          ) : (
            <p className="flex items-center gap-2 px-1 py-2 text-body-medium text-on-surface-variant sm:gap-3 sm:px-3">
              <Icon name={locked ? 'lock' : 'schedule'} size={20} />
              {locked ? t('learn.map.challengeLocked') : t('learn.map.challengeSoon')}
            </p>
          )}
        </div>
      )}

      {missions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="pb-1 text-title-small text-on-surface">{t('learn.map.missions')}</p>
          {missions.map((m) => {
            const done = missionDone(m.id);
            const content = (
              <>
                <Icon name={done ? 'check_circle' : 'flag'} size={20} filled={done} className={done ? 'text-success' : 'text-primary'} />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-medium text-on-surface">{m.title}</span>
                  <span className="block text-body-small text-on-surface-variant">
                    {t('learn.map.missionMeta', { minutes: m.minutes })}
                    {done && ` · ${t('learn.map.done')}`}
                  </span>
                </span>
              </>
            );
            return locked ? (
              <p key={m.id} className="flex items-center gap-2 px-1 py-2 opacity-80 sm:gap-3 sm:px-3">
                {content}
              </p>
            ) : (
              <Link key={m.id} to={`/app/missions/${m.id}`} className={row}>
                {content}
                <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
              </Link>
            );
          })}
        </div>
      )}

      {level.toolSimIds.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
          <Icon name="calculate" size={16} />
          {t('learn.map.toolsOfLevel', { tools: level.toolSimIds.join(', ') })}
        </p>
      )}
    </div>
  );
}
