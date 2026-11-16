import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { Icon, type IconName } from '@/components/ui/Icon';
import { StatusPill } from '@/components/ui/StatusPill';
import { ConditionList } from '@/features/levels/UnlockCard';
import { completedLights, type LevelStatus } from '@/features/levels/engine';
import { MISSIONS, useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import { badgeSvg, downloadSvg } from '@/lib/badge-image';
import { formatDate } from '@/lib/dates';
import { NBSP } from '@/lib/money';
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useDataStore, useProgram } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { challengeById, guideNumber, guideOfModule, guidesOfModule, MODULES, moduleById } from './questions';
import { MyQuestions, WeeklyChallenges } from './Tutoring';
import { MasteryButton } from '@/features/levels/MasteryButton';
import { fuerteLine } from '@/features/companion/fuerte-lines';
import { useOrgKind } from '@/lib/org-context';
import { DueReviews } from './DueReviews';
import { CohortCommunityCard } from './Community';

/**
 * P9, Aprender (5.0, 2.2.1 pattern 8): the map of levels as a timeline, one stretch per level with
 * its state (icon and text, never only color), the current level highlighted, what each level
 * holds (guides, challenge, missions, tools) and, when locked, what is missing and "Ya sé esto".
 * Then the achievements: module badges and missions completed (gamification with measure, 5.0).
 */
const STATE_ICON: Record<LevelStatus['status'], IconName> = { completed: 'check_circle', unlocked: 'pending', locked: 'lock' };
const STATE_TONE = { completed: 'success', unlocked: 'primary', locked: 'neutral' } as const;
const pct = (n: number) => `${Math.round(n * 100)}${NBSP}%`;

/** Badges listed in Logros, and how many show before "Ver todas" (D-236). */
const BADGE_MODULES = MODULES.filter((m) => guideOfModule(m.id));
const BADGES_VISIBLE = 4;

export function LearnPage() {
  const { t } = useTranslation();
  const [showAllBadges, setShowAllBadges] = useState(false);
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, current, wallet, isOpen } = useLevels(personId);
  // Select whole arrays (stable references) and filter here, so the store snapshot never changes on read.
  const allGuides = useDataStore((s) => s.guideProgress);
  const allAttempts = useDataStore((s) => s.challengeAttempts);
  const allMissions = useDataStore((s) => s.missionCompletions);
  const guideProgress = allGuides.filter((g) => g.personId === personId);
  const attempts = allAttempts.filter((a) => a.personId === personId);
  const missionCompletions = allMissions.filter((m) => m.personId === personId);
  // F14 (D-317): lessons published by the tutor or L&D for the person's cohorts
  const allLessons = useDataStore((s) => s.customLessons);
  const allPeople = useDataStore((s) => s.people);
  const me = allPeople.find((p) => p.id === personId);
  const lessons = (allLessons ?? []).filter((l) => l.status === 'published' && l.cohortIds.some((c) => me?.cohortIds.includes(c)));
  const program = useProgram();
  const passing = program.passingScore;
  const programName = program.name;
  const kind = useOrgKind();
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
          {/* The wide column holds the map and the achievements, so the two columns end at a similar
              height and the page scrolls less (D-278). Same order on every width. */}
          <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="map-title" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:p-(--space-card-padding)">
            <h2 id="map-title" className="text-title-large text-on-surface">
              {t('learn.map.levels')}
            </h2>
            <ol className="flex flex-col">
              {statuses.map((s, i) => {
                const isCurrent = current?.level.id === s.level.id;
                const expanded = open.has(s.level.id);
                const phaseB = false; // Level 8 is built (D-302): every level shows its state
                const last = i === statuses.length - 1;
                const name = t(`wallet.sections.${s.level.id}`, { defaultValue: t('learn.map.crypto') });
                return (
                  <motion.li
                    key={s.level.id}
                    className="relative flex gap-2 pb-2 sm:gap-3 large:pb-4"
                    // Lists enter staggered, 50 ms apart (2.6); with reduced motion, opacity only
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: duration.long, ease: easing.emphasizedDecelerate, delay: i * 0.05 }}
                  >
                    {/* The line of the timeline, decorative */}
                    {!last && <span aria-hidden className="absolute top-9 bottom-0 left-4 w-0.5 -translate-x-1/2 bg-outline-variant large:top-11 large:left-5" />}
                    <span
                      aria-hidden
                      className={cn(
                        'relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full large:size-10',
                        s.status === 'completed' && 'bg-success-container text-success',
                        s.status === 'unlocked' && 'bg-primary text-on-primary',
                        s.status === 'locked' && 'bg-surface-container text-on-surface-variant',
                      )}
                    >
                      <Icon name={STATE_ICON[s.status]} size={18} filled={s.status === 'completed'} />
                    </span>
                    <div
                      className={cn(
                        '@container flex min-w-0 flex-1 flex-col gap-3 rounded-lg px-3 py-2 large:p-4',
                        isCurrent ? 'border border-primary bg-primary-container/40' : 'border border-transparent',
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 @md:flex-nowrap">
                        <div className="flex min-w-[8rem] flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                          <h3 className="text-title-small text-on-surface @2xl:text-title-medium">{t('learn.map.levelName', { n: s.level.order, name })}</h3>
                          {phaseB ? (
                            <StatusPill tone="neutral" icon="schedule" label={t('learn.map.phaseB')} />
                          ) : (
                            // Lighter on phones and tablets (D-254): a completed level already says so with its check,
                            // so its pill stays for screen readers until the level row is wide
                            <span className={cn(s.status === 'completed' && !isCurrent && 'sr-only @2xl:not-sr-only')}>
                              <StatusPill tone={STATE_TONE[s.status]} icon={STATE_ICON[s.status]} label={isCurrent ? t('learn.map.current') : t(`learn.map.state.${s.status}`)} />
                            </span>
                          )}
                        </div>
                        {!phaseB && (
                          <span className="ml-auto flex shrink-0 items-center gap-2">
                            {/* "Ya sé esto" (D-233): top right of the level, next to its toggle */}
                            {s.status === 'locked' && s.level.masteryChallengeId && challengeById(s.level.masteryChallengeId) && (
                              <MasteryButton to={`/app/learn/challenges/${s.level.masteryChallengeId}`} section={name} />
                            )}
                            <Button
                              variant="text"
                              size="xs"
                              trailingIcon={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                              aria-expanded={expanded}
                              onClick={() => toggle(s.level.id)}
                            >
                              {/* On narrow levels the toggle is its chevron only; the text stays for screen readers */}
                              <span className="sr-only @md:not-sr-only">{expanded ? t('learn.map.hide') : t('learn.map.show')}</span>
                            </Button>
                          </span>
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
            {/* Achievements */}
            <section aria-labelledby="badges-title" className="@container flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              <h2 id="badges-title" className="text-title-large text-on-surface">
                {t('learn.map.achievements')}
              </h2>
              <dl className="grid grid-cols-2 gap-3 @xl:grid-cols-3">
                {[
                  ['military_tech', t('learn.map.badgesCount'), `${badges.size}`],
                  ['flag', t('learn.map.missionsCount'), `${missionsDone}`],
                  ['lightbulb', t('learn.map.lights'), t('learn.map.lightsValue', { n: lights })],
                ].map(([icon, label, value]) => (
                  <div key={label} className="flex flex-col gap-1 rounded-lg bg-surface-container p-3 last:col-span-2 @xl:last:col-span-1">
                    <dt className="flex items-center gap-1.5 text-label-medium text-on-surface-variant">
                      <Icon name={icon as IconName} size={16} className="text-tertiary" />
                      {label}
                    </dt>
                    <dd className="text-title-large text-on-surface tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              {/* D-236: only the first badges show, so the panel is not crowded; the rest behind "Ver todas" */}
              <ul id="badges-list" className="grid grid-cols-1 gap-2 @xl:grid-cols-2" aria-label={t('learn.map.badges')}>
                {BADGE_MODULES.slice(0, showAllBadges ? undefined : BADGES_VISIBLE).map((m) => {
                  const earned = badges.has(m.id);
                  // D-210: a badge not earned says why and how to try again; the rule of D-57 does not change.
                  const level = statuses.find((s) => s.level.id === moduleById(m.id)?.levelId)?.level;
                  const part = attempts.reduce<number | undefined>(
                    (best, a) => (a.moduleScores[m.id] === undefined ? best : Math.max(best ?? 0, a.moduleScores[m.id]!)),
                    undefined,
                  );
                  const why = earned
                    ? undefined
                    : part === undefined
                      ? t('learn.map.badgeHow', { level: level?.order })
                      : t('learn.map.badgeBelow', { part: pct(part), passing: pct(passing), level: level?.order });
                  return (
                    <li
                      key={m.id}
                      className={cn(
                        'flex flex-col gap-1 rounded-lg px-3 py-2',
                        earned ? 'bg-tertiary-container text-on-tertiary-container' : 'border border-dashed border-outline-variant text-on-surface-variant',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon name="military_tech" size={20} filled={earned} />
                        <span className="min-w-0 flex-1 text-body-medium">{t('learn.challenge.module', { n: m.order, title: m.title })}</span>
                        <span className="text-label-medium">{earned ? t('learn.map.earned') : t('learn.map.notEarned')}</span>
                        {/* F12, D-315: an earned badge can be saved as an image, without data of the person */}
                        {earned && (
                          <IconButton
                            icon="download"
                            size="xs"
                            label={t('learn.map.badgeDownload', { n: m.order, title: m.title })}
                            className="-my-1 -mr-1"
                            onClick={() =>
                              downloadSvg(
                                badgeSvg({
                                  mark: `${m.order}`,
                                  name: t('learn.map.badgeImageName', { n: m.order }),
                                  line: m.title,
                                  foot: t('learn.map.badgeImageFoot', { program: programName, date: formatDate(DEMO_TODAY) }),
                                }),
                                t('learn.map.badgeFile', { n: m.order }),
                              )
                            }
                          />
                        )}
                      </span>
                      {why && (
                        <span className="pl-8 text-body-small">
                          {why}{' '}
                          {level?.challengeId && isOpen(level.id) && (
                            <Link to={`/app/learn/challenges/${level.challengeId}`} className="text-primary underline underline-offset-2">
                              {t('learn.map.badgeTry', { level: level.order })}
                            </Link>
                          )}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {BADGE_MODULES.length > BADGES_VISIBLE && (
                <Button
                  variant="text"
                  size="xs"
                  className="-mt-3 -mr-2 self-end"
                  trailingIcon={showAllBadges ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  aria-expanded={showAllBadges}
                  aria-controls="badges-list"
                  onClick={() => setShowAllBadges((v) => !v)}
                >
                  {showAllBadges ? t('learn.map.badgesLess') : t('learn.map.badgesAll', { count: BADGE_MODULES.length })}
                </Button>
              )}
              <p className="-mt-3 text-body-small text-on-surface-variant">{t('learn.map.badgesNote')}</p>
              {lessons.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-outline-variant pt-5">
                  <h3 className="text-title-small text-on-surface">{t('learn.custom.title')}</h3>
                  <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
                    {lessons.map((l) => (
                      <li key={l.id}>
                        <ListLinkRow
                          to={`/app/learn/lessons/${l.id}`}
                          icon="edit_note"
                          title={l.title}
                          detail={t('learn.custom.by', { name: allPeople.find((p) => p.id === l.authorId)?.name ?? '', minutes: l.minutes })}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Shortcuts as whole-row links with a line of detail (D-301), like the reviews list */}
              <div className="flex flex-col gap-2 border-t border-outline-variant pt-5">
                <h3 className="text-title-small text-on-surface">{t('learn.map.shortcuts')}</h3>
                <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
                  <li>
                    <ListLinkRow to="/app/welcome" icon="person" title={t('learn.map.conocerte')} detail={t('learn.map.conocerteDetail')} />
                  </li>
                  <li>
                    <ListLinkRow to="/app/learn/investor-profile" icon="psychology" title={t('learn.map.profile')} detail={t('learn.map.profileDetail')} />
                  </li>
                  <li>
                    <ListLinkRow to="/app/tools" icon="calculate" title={t('learn.map.tools')} detail={t('learn.map.toolsDetail')} />
                  </li>
                  <li>
                    <ListLinkRow to="/app/learn/follow-up" icon="fact_check" title={t('learn.map.followUp')} detail={t('learn.map.followUpDetail')} />
                  </li>
                  <li>
                    <ListLinkRow to="/app/learn/certificate" icon="workspace_premium" title={t('learn.map.certificate')} detail={t('learn.map.certificateDetail')} />
                  </li>
                  <li>
                    <ListLinkRow to="/app/learn/escape" icon="door_front" title={t('learn.map.escape')} detail={t('learn.map.escapeDetail')} />
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <DueReviews personId={personId} />
            {/* The product context has no tutor (5.5): no weekly challenges and no questions to a tutor */}
            {kind !== 'product' && <CohortCommunityCard personId={personId} />}
            {kind !== 'product' && <WeeklyChallenges personId={personId} />}
            {kind !== 'product' && <MyQuestions personId={personId} />}
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
          {/* The same light list as the unlock card (D-305), not chips */}
          <ConditionList conditions={status.conditions} />
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
          {level.guideModuleIds.flatMap((moduleId) => {
            const module = moduleById(moduleId);
            const guides = guidesOfModule(moduleId);
            if (guides.length === 0)
              return [
                <p key={moduleId} className="flex items-center gap-2 px-1 py-2 text-body-medium text-on-surface-variant sm:gap-3 sm:px-3">
                  <Icon name="schedule" size={20} />
                  {t('learn.map.guideSoon', { n: module?.order, title: module?.title })}
                </p>,
              ];
            // Guide 1 is the one the level asks for; guides 2 and 3 go deeper (D-276)
            return guides.map((guide) => {
              const done = guideDone(guide.id);
              const deeper = guideNumber(guide.id) > 1;
              const content = (
                <>
                  <Icon name={done ? 'check_circle' : 'menu_book'} size={20} filled={done} className={done ? 'text-success' : 'text-primary'} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-medium text-on-surface">{guide.title}</span>
                    <span className="block text-body-small text-on-surface-variant">
                      {deeper
                        ? t('learn.map.guideMetaDeeper', { n: module?.order, k: guideNumber(guide.id), minutes: guide.minutes })
                        : t('learn.map.guideMeta', { n: module?.order, minutes: guide.minutes })}
                      {done && ` · ${t('learn.map.read')}`}
                    </span>
                  </span>
                </>
              );
              return locked ? (
                <p key={guide.id} className={cn('flex items-center gap-2 px-1 py-2 opacity-80 sm:gap-3 sm:px-3', deeper && 'pl-6 sm:pl-9')}>
                  {content}
                </p>
              ) : (
                <Link key={guide.id} to={`/app/learn/guides/${guide.id}`} className={cn(row, deeper && 'pl-6 sm:pl-9')}>
                  {content}
                  <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
                </Link>
              );
            });
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
                {best === undefined
                  ? t('learn.map.challengePending')
                  : best >= passing
                    ? t('learn.map.challengePassed', { score: pct(best) })
                    : t('learn.map.challengeBest', { score: pct(best) })}
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
