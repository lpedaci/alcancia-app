import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { badgeSvg as badgeImage, downloadSvg } from '@/lib/badge-image';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { type Badge, BADGES, type Version, VERSIONS } from './engine';

/**
 * Versions and badges of the escape room (D-310): the person chooses the version before playing
 * (initial, intermediate or advanced) and each one gives its badge (bronze, silver, gold) when the
 * five rooms are solved in it. Badges are kept between games and can be downloaded as an image,
 * without personal data.
 */
export function VersionPicker({ value, onChange, badges }: { value: Version; onChange: (v: Version) => void; badges: Badge[] }) {
  const { t } = useTranslation();
  return (
    <fieldset className="@container flex min-w-0 flex-col gap-2">
      <legend className="pb-2 text-title-medium text-on-surface">{t('escape.versions.legend')}</legend>
      <div className="grid grid-cols-1 gap-2 @xl:grid-cols-3">
        {VERSIONS.map((id, i) => {
          const version = i as Version;
          const badge = BADGES[i]!;
          const earned = badges.includes(badge);
          const selected = value === version;
          return (
            <label
              key={id}
              className={cn(
                'relative flex min-h-14 cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors duration-150',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary',
                selected ? 'bg-primary-container text-on-primary-container ring-2 ring-primary ring-inset' : 'bg-surface-container text-on-surface hover:bg-surface-container-high',
              )}
            >
              <input type="radio" name="escape-version" value={id} checked={selected} onChange={() => onChange(version)} className="sr-only" />
              <Icon name={selected ? 'radio_button_checked' : 'radio_button_unchecked'} size={20} className={cn('mt-0.5 shrink-0', selected ? 'text-primary' : 'text-on-surface-variant')} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-label-large">{t(`escape.versions.${id}.title`)}</span>
                <span className={cn('text-body-small', selected ? 'text-on-primary-container' : 'text-on-surface-variant')}>{t(`escape.versions.${id}.body`)}</span>
                <span className="flex items-center gap-1 pt-1 text-label-medium">
                  <Icon name={earned ? 'check_circle' : 'workspace_premium'} size={16} className="shrink-0" />
                  {earned ? t('escape.versions.earned', { badge: t(`escape.badges.short.${badge}`) }) : t('escape.versions.gives', { badge: t(`escape.badges.short.${badge}`) })}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The three badges, earned or not, each with its download when earned. */
export function BadgeStrip({ badges, highlight }: { badges: Badge[]; highlight?: Badge }) {
  const { t } = useTranslation();
  return (
    // Each row: the badge drawn on the left, its name and what it means, and "Descargar" on the right
    // (D-311). Phones: the badge and the text side by side, the download below at full width (D-308)
    <div className="@container">
      <ul aria-label={t('escape.badges.list')} className="flex flex-col gap-2">
        {BADGES.map((badge, i) => {
          const earned = badges.includes(badge);
          const versionName = t(`escape.versions.${VERSIONS[i]}.title`).toLowerCase();
          return (
            <li
              key={badge}
              className={cn(
                'grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 rounded-lg p-3 @lg:grid-cols-[auto_minmax(0,1fr)_auto] @lg:gap-x-4',
                earned ? 'bg-tertiary-container text-on-tertiary-container' : 'border border-dashed border-outline-variant text-on-surface-variant',
                highlight === badge && 'ring-2 ring-tertiary ring-inset',
              )}
            >
              <BadgeMedal earned={earned} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-title-small">{t(`escape.badges.${badge}`)}</span>
                <span className="text-body-small">{earned ? t('escape.badges.earnedBody', { version: versionName }) : t('escape.badges.missingBody', { version: versionName })}</span>
              </span>
              {earned ? (
                <Button variant="outlined" size="xs" leadingIcon="download" className="col-span-2 w-full @lg:col-span-1 @lg:w-auto" onClick={() => downloadBadge(badge, t)}>
                  {t('escape.badges.download')}
                  <span className="sr-only"> {t(`escape.badges.${badge}`)}</span>
                </Button>
              ) : (
                <span className="col-span-2 hidden items-center gap-1.5 text-label-large @lg:col-span-1 @lg:flex">
                  <Icon name="lock" size={18} className="shrink-0" />
                  {t('escape.badges.pending')}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The badge drawn small: the medal in a circle. Earned, filled in tertiary; missing, a dashed outline
 * in the neutral tone. Decorative: the name is in the text beside it.
 */
function BadgeMedal({ earned }: { earned: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-full',
        earned ? 'bg-tertiary text-on-tertiary' : 'border-2 border-dashed border-outline text-on-surface-variant',
      )}
    >
      <Icon name="workspace_premium" size={24} filled={earned} />
    </span>
  );
}

/** The badge as an image (D-310): the game, the version and the date, never data of the person. */
export function badgeSvg(badge: Badge, t: TFunction): string {
  const i = BADGES.indexOf(badge);
  const version = t(`escape.versions.${VERSIONS[i]}.title`).toLowerCase();
  return badgeImage({
    mark: `${i + 1}`,
    name: t(`escape.badges.${badge}`),
    line: t('escape.badges.svgLine', { version }),
    foot: t('escape.badges.svgFoot', { date: formatDate(DEMO_TODAY) }),
  });
}

function downloadBadge(badge: Badge, t: TFunction) {
  downloadSvg(badgeSvg(badge, t), t('escape.badges.fileName', { badge: t(`escape.badges.short.${badge}`) }));
}
